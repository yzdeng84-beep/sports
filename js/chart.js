/* ==========================================
   健身计划 App — 消费图表模块
   纯 SVG 柱形图 + 折线图（零依赖）
   全局对象: ChartModule
   ========================================== */

const ChartModule = (() => {
  'use strict';

  // ---------- 颜色常量 ----------
  const COLOR_INCOME  = '#86BDA0'; // 收入绿
  const COLOR_EXPENSE = '#D48686'; // 支出红
  const COLOR_GRID    = '#E8E5E0';
  const COLOR_TEXT    = '#8B8B8B';
  const COLOR_AXIS    = '#C5C0BA';

  // ---------- 工具函数 ----------
  function getToday() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  /** Y轴刻度美化：向上取整到合适的刻度值 */
  function niceMax(value) {
    if (value <= 0) return 100;
    const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
    const residual = value / magnitude;
    if (residual <= 1.5) return 1.5 * magnitude;
    if (residual <= 3) return 3 * magnitude;
    if (residual <= 5) return 5 * magnitude;
    return 10 * magnitude;
  }

  /** 格式化金额（短版，用于图表标签） */
  function shortMoney(amount) {
    if (amount >= 10000) return (amount / 10000).toFixed(1) + '万';
    if (amount >= 1000) return (amount / 1000).toFixed(1) + 'k';
    return String(amount);
  }

  // ---------- 数据聚合 ----------

  /** 日视图：最近7天，每天一条 */
  async function aggregateDaily() {
    const today = new Date();
    const days = [];
    // 往前推6天 + 今天 = 共7天
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${day}`;
      const label = `${m}/${day}`;
      days.push({ date: dateStr, label, income: 0, expense: 0 });
    }

    // 获取日期范围内的所有记录
    const startDate = days[0].date;
    const endDate = days[days.length - 1].date;
    const records = await DB.expenses.getByDateRange(startDate, endDate);

    // 按日期汇总
    records.forEach(r => {
      const dayEntry = days.find(d => d.date === r.date);
      if (dayEntry) {
        if (r.type === 'income') dayEntry.income += Number(r.amount);
        else dayEntry.expense += Number(r.amount);
      }
    });

    return days;
  }

  /** 周视图：最近4周，每周一条 */
  async function aggregateWeekly() {
    const today = new Date();
    const weeks = [];

    for (let i = 3; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i * 7);
      // 找到本周一
      const dayOfWeek = d.getDay();
      const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const mon = new Date(d);
      mon.setDate(d.getDate() + diffToMon);
      const sun = new Date(mon);
      sun.setDate(mon.getDate() + 6);

      const fmt = (dt) => {
        const y = dt.getFullYear();
        const mm = String(dt.getMonth() + 1).padStart(2, '0');
        const dd = String(dt.getDate()).padStart(2, '0');
        return `${y}-${mm}-${dd}`;
      };

      weeks.push({
        start: fmt(mon),
        end: fmt(sun),
        label: `${mon.getMonth() + 1}/${mon.getDate()}`,
        income: 0,
        expense: 0,
      });
    }

    // 获取最早到最晚的日期范围
    const startDate = weeks[0].start;
    const endDate = weeks[weeks.length - 1].end;
    const records = await DB.expenses.getByDateRange(startDate, endDate);

    // 按周汇总
    records.forEach(r => {
      for (const w of weeks) {
        if (r.date >= w.start && r.date <= w.end) {
          if (r.type === 'income') w.income += Number(r.amount);
          else w.expense += Number(r.amount);
          break;
        }
      }
    });

    return weeks;
  }

  /** 月视图：最近6个月，每月一条 */
  async function aggregateMonthly() {
    const today = new Date();
    const months = [];

    for (let i = 5; i >= 0; i--) {
      const y = today.getFullYear();
      const m = today.getMonth() - i;
      const d = new Date(y, m, 1);
      const year = d.getFullYear();
      const month = d.getMonth(); // 0-based
      const label = `${year % 100}/${month + 1}`;
      months.push({ year, month, label, income: 0, expense: 0 });
    }

    // 获取日期范围
    const firstMonth = months[0];
    const lastMonth = months[months.length - 1];
    const startDate = `${firstMonth.year}-${String(firstMonth.month + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(lastMonth.year, lastMonth.month + 1, 0).getDate();
    const endDate = `${lastMonth.year}-${String(lastMonth.month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const records = await DB.expenses.getByDateRange(startDate, endDate);

    // 按月汇总
    records.forEach(r => {
      const [ry, rm] = r.date.split('-').map(Number);
      const monthEntry = months.find(m => m.year === ry && m.month === rm - 1);
      if (monthEntry) {
        if (r.type === 'income') monthEntry.income += Number(r.amount);
        else monthEntry.expense += Number(r.amount);
      }
    });

    return months;
  }

  // ---------- SVG 生成 ----------

  /** 柱形图（日/周视图用） */
  function buildBarChart(data, period) {
    // 坐标参数
    const PAD_LEFT = 48;
    const PAD_RIGHT = 10;
    const PAD_TOP = 14;
    const PAD_BOTTOM = 28;
    const SVG_W = 700;
    const SVG_H = 200;
    const PLOT_W = SVG_W - PAD_LEFT - PAD_RIGHT;
    const PLOT_H = SVG_H - PAD_TOP - PAD_BOTTOM;

    const count = data.length;
    // 找出所有值的最大值
    let maxVal = 0;
    data.forEach(d => {
      if (d.income > maxVal) maxVal = d.income;
      if (d.expense > maxVal) maxVal = d.expense;
    });
    const yMax = niceMax(maxVal);

    // Y轴刻度线（0, yMax/2, yMax）
    const ySteps = [0, yMax / 2, yMax];

    // 每组柱的宽度
    const groupWidth = PLOT_W / count;
    const barWidth = Math.min(groupWidth * 0.32, 22);  // 每根柱宽

    let svg = '';

    // 背景网格线
    ySteps.forEach(val => {
      const y = PAD_TOP + PLOT_H - (val / yMax) * PLOT_H;
      svg += `<line x1="${PAD_LEFT}" y1="${y}" x2="${SVG_W - PAD_RIGHT}" y2="${y}" stroke="${COLOR_GRID}" stroke-width="1" stroke-dasharray="3,4"/>`;
    });

    // Y轴标签
    ySteps.forEach(val => {
      const y = PAD_TOP + PLOT_H - (val / yMax) * PLOT_H;
      svg += `<text x="${PAD_LEFT - 6}" y="${y + 4}" text-anchor="end" font-size="10" fill="${COLOR_TEXT}" font-family="inherit">${shortMoney(val)}</text>`;
    });

    // X轴
    svg += `<line x1="${PAD_LEFT}" y1="${SVG_H - PAD_BOTTOM}" x2="${SVG_W - PAD_RIGHT}" y2="${SVG_H - PAD_BOTTOM}" stroke="${COLOR_AXIS}" stroke-width="1"/>`;

    // 柱形
    data.forEach((d, i) => {
      const groupX = PAD_LEFT + i * groupWidth + groupWidth / 2;

      // 支出柱（左侧）
      if (d.expense > 0 || true) {
        const barH = d.expense > 0 ? Math.max((d.expense / yMax) * PLOT_H, 1) : 0;
        const barX = groupX - barWidth - 2;
        const barY = SVG_H - PAD_BOTTOM - barH;
        svg += `<rect x="${barX}" y="${barY}" width="${barWidth}" height="${barH}" rx="3" fill="${COLOR_EXPENSE}" opacity="0.85"/>`;
      }

      // 收入柱（右侧）
      if (d.income > 0 || true) {
        const barH = d.income > 0 ? Math.max((d.income / yMax) * PLOT_H, 1) : 0;
        const barX = groupX + 2;
        const barY = SVG_H - PAD_BOTTOM - barH;
        svg += `<rect x="${barX}" y="${barY}" width="${barWidth}" height="${barH}" rx="3" fill="${COLOR_INCOME}" opacity="0.85"/>`;
      }

      // X轴标签
      svg += `<text x="${groupX}" y="${SVG_H - 8}" text-anchor="middle" font-size="10" fill="${COLOR_TEXT}" font-family="inherit">${d.label}</text>`;
    });

    return `<svg class="chart-svg" viewBox="0 0 ${SVG_W} ${SVG_H}" preserveAspectRatio="xMidYMid meet">${svg}</svg>`;
  }

  /** 折线图（月视图用） */
  function buildLineChart(data, period) {
    const PAD_LEFT = 48;
    const PAD_RIGHT = 16;
    const PAD_TOP = 14;
    const PAD_BOTTOM = 28;
    const SVG_W = 700;
    const SVG_H = 200;
    const PLOT_W = SVG_W - PAD_LEFT - PAD_RIGHT;
    const PLOT_H = SVG_H - PAD_TOP - PAD_BOTTOM;

    const count = data.length;

    // 找出最大值
    let maxVal = 0;
    data.forEach(d => {
      if (d.income > maxVal) maxVal = d.income;
      if (d.expense > maxVal) maxVal = d.expense;
    });
    const yMax = niceMax(maxVal);
    const ySteps = [0, yMax / 2, yMax];

    // X坐标计算函数
    const xFor = (index) => PAD_LEFT + (index / (count - 1 || 1)) * PLOT_W;
    const yFor = (val) => PAD_TOP + PLOT_H - (val / yMax) * PLOT_H;

    let svg = '';

    // 网格线
    ySteps.forEach(val => {
      const y = yFor(val);
      svg += `<line x1="${PAD_LEFT}" y1="${y}" x2="${SVG_W - PAD_RIGHT}" y2="${y}" stroke="${COLOR_GRID}" stroke-width="1" stroke-dasharray="3,4"/>`;
    });

    // Y轴标签
    ySteps.forEach(val => {
      const y = yFor(val);
      svg += `<text x="${PAD_LEFT - 6}" y="${y + 4}" text-anchor="end" font-size="10" fill="${COLOR_TEXT}" font-family="inherit">${shortMoney(val)}</text>`;
    });

    // X轴
    svg += `<line x1="${PAD_LEFT}" y1="${SVG_H - PAD_BOTTOM}" x2="${SVG_W - PAD_RIGHT}" y2="${SVG_H - PAD_BOTTOM}" stroke="${COLOR_AXIS}" stroke-width="1"/>`;

    // 折线 — 支出
    let expensePoints = '';
    data.forEach((d, i) => {
      expensePoints += `${xFor(i)},${yFor(d.expense)} `;
    });
    svg += `<polyline points="${expensePoints.trim()}" fill="none" stroke="${COLOR_EXPENSE}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;

    // 折线 — 收入
    let incomePoints = '';
    data.forEach((d, i) => {
      incomePoints += `${xFor(i)},${yFor(d.income)} `;
    });
    svg += `<polyline points="${incomePoints.trim()}" fill="none" stroke="${COLOR_INCOME}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;

    // 数据点 + X轴标签
    data.forEach((d, i) => {
      const cx = xFor(i);
      // 支出点
      svg += `<circle cx="${cx}" cy="${yFor(d.expense)}" r="3.5" fill="white" stroke="${COLOR_EXPENSE}" stroke-width="2"/>`;
      // 收入点
      svg += `<circle cx="${cx}" cy="${yFor(d.income)}" r="3.5" fill="white" stroke="${COLOR_INCOME}" stroke-width="2"/>`;
      // X轴标签
      svg += `<text x="${cx}" y="${SVG_H - 8}" text-anchor="middle" font-size="10" fill="${COLOR_TEXT}" font-family="inherit">${d.label}</text>`;
    });

    return `<svg class="chart-svg" viewBox="0 0 ${SVG_W} ${SVG_H}" preserveAspectRatio="xMidYMid meet">${svg}</svg>`;
  }

  // ---------- 图例 ----------
  function buildLegend() {
    return `
      <div class="chart-legend">
        <span class="chart-legend-item">
          <span class="chart-legend-dot expense"></span> 支出
        </span>
        <span class="chart-legend-item">
          <span class="chart-legend-dot income"></span> 收入
        </span>
      </div>`;
  }

  // ---------- 主入口 ----------
  async function render(container, period) {
    if (!container) return;

    let data, svg;

    switch (period) {
      case 'day':
        data = await aggregateDaily();
        svg = buildBarChart(data, 'day');
        break;
      case 'week':
        data = await aggregateWeekly();
        svg = buildBarChart(data, 'week');
        break;
      case 'month':
      default:
        data = await aggregateMonthly();
        svg = buildLineChart(data, 'month');
        break;
    }

    container.innerHTML = svg + buildLegend();
  }

  // ---------- 公开 API ----------
  return {
    render,
  };
})();