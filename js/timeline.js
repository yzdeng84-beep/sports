/* ==========================================
   健身计划 App — 板块②：日程（环形时间轴）
   环形进度条 SVG，任务按时间分布在圆环上
   全局对象: TimelineModule
   ========================================== */

const TimelineModule = (() => {
  'use strict';

  // ---------- 状态 ----------
  let selectedDate = null;

  // ---------- 环形参数 ----------
  const CX = 200, CY = 200;          // 圆心
  const RING_R = 150;                // 环中心线半径
  const RING_W = 22;                 // 环宽度
  const DOT_R = 11;                  // 任务圆点半径

  // ---------- DOM 缓存 ----------
  const $dates    = document.getElementById('timeline-dates');
  const $ringSvg  = document.getElementById('timeline-ring-svg');
  const $btnToday = document.getElementById('btn-today');

  // ---------- 工具函数 ----------
  function formatDate(year, month, day) {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  }

  function getToday() {
    const now = new Date();
    return formatDate(now.getFullYear(), now.getMonth(), now.getDate());
  }

  function escapeXml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;')
              .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /**
   * 将 HH:MM 转为环形角度（度）
   * 06:00 = 0°（顶部），顺时针递增
   * 返回 0~360
   */
  function timeToAngle(timeStr) {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    const totalMin = h * 60 + m;
    // 偏移 06:00（360 分钟），全天 1440 分钟对应 360°
    const minFromStart = totalMin - 360;
    return Math.max(0, Math.min(360, (minFromStart / 1440) * 360));
  }

  /**
   * 根据角度（0°=顶部，顺时针）计算环上坐标
   * SVG 坐标系中 0°=右侧，顺时针增大
   */
  function angleToPos(angleDeg) {
    const rad = (angleDeg - 90) * Math.PI / 180;
    return {
      x: CX + RING_R * Math.cos(rad),
      y: CY + RING_R * Math.sin(rad),
    };
  }

  /**
   * 绘制弧线路径（从 startAngle 到 endAngle，顺时针）
   * 角度：0°=顶部，顺时针
   */
  function describeArc(startAngle, endAngle) {
    const r = RING_R;
    const sRad = (startAngle - 90) * Math.PI / 180;
    const eRad = (endAngle - 90) * Math.PI / 180;

    const x1 = CX + r * Math.cos(sRad);
    const y1 = CY + r * Math.sin(sRad);
    const x2 = CX + r * Math.cos(eRad);
    const y2 = CY + r * Math.sin(eRad);

    const sweep = endAngle - startAngle;
    const large = sweep > 180 ? 1 : 0;
    const sweepFlag = sweep > 0 ? 1 : 0;

    return `M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 ${large} ${sweepFlag} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  }

  const weekNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  // ---------- 渲染日期卡片 ----------
  function renderDateCards() {
    const today = getToday();
    const dates = [];
    const now = new Date();

    for (let i = -3; i <= 3; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      dates.push({
        dateStr: formatDate(d.getFullYear(), d.getMonth(), d.getDate()),
        day: d.getDate(),
        weekDay: weekNames[d.getDay()],
        isToday: formatDate(d.getFullYear(), d.getMonth(), d.getDate()) === today,
      });
    }

    if (!selectedDate) selectedDate = today;

    $dates.innerHTML = dates.map(d => `
      <div class="tl-date-card ${d.isToday ? 'tl-today' : ''} ${d.dateStr === selectedDate ? 'tl-selected' : ''}"
           data-date="${d.dateStr}">
        <span class="tl-date-day">${d.day}</span>
        <span class="tl-date-week">${d.weekDay}</span>
      </div>
    `).join('');

    $dates.querySelectorAll('.tl-date-card').forEach(card => {
      card.addEventListener('click', () => {
        selectDate(card.getAttribute('data-date'));
      });
    });

    setTimeout(() => {
      const todayCard = $dates.querySelector('.tl-today');
      if (todayCard) {
        todayCard.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }, 200);
  }

  // ---------- 渲染环形进度条 SVG ----------
  async function renderRingSVG() {
    if (!$ringSvg) return;

    const tasks = selectedDate ? await DB.tasks.getByDate(selectedDate) : [];
    tasks.sort((a, b) => (a.time || '').localeCompare(b.time || ''));

    const today = getToday();
    let svg = '';

    // --- 定义渐变和滤镜 ---
    svg += `<defs>
      <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#6B9FD4"/>
        <stop offset="50%" stop-color="#8BB8D0"/>
        <stop offset="100%" stop-color="#4A7FB5"/>
      </linearGradient>
      <linearGradient id="ring-grad-warm" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#D4A574"/>
        <stop offset="50%" stop-color="#E8C9A0"/>
        <stop offset="100%" stop-color="#C49460"/>
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="2.5" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>`;

    // --- 底部轨道环（灰色底环，24h 完整圆） ---
    svg += `<circle cx="${CX}" cy="${CY}" r="${RING_R}"
      fill="none" stroke="#E8E5E2" stroke-width="${RING_W}"
      stroke-linecap="round" opacity="0.6"/>`;

    // --- 活跃时段弧段（06:00→22:00，覆盖在灰色环上，更亮） ---
    const arcStart06 = timeToAngle('06:00'); // 0°
    const arcEnd22   = timeToAngle('22:00'); // 240°
    svg += `<path d="${describeArc(arcStart06, arcEnd22)}"
      fill="none" stroke="rgba(107,159,212,0.12)" stroke-width="${RING_W}"
      stroke-linecap="round"/>`;

    // --- 当前时间进度弧（仅今天显示） ---
    if (selectedDate === today) {
      const now = new Date();
      const nowH = now.getHours();
      const nowM = now.getMinutes();
      const nowTime = `${String(nowH).padStart(2,'0')}:${String(nowM).padStart(2,'0')}`;
      const nowAngle = timeToAngle(nowTime);

      if (nowAngle > 0) {
        svg += `<path d="${describeArc(0, nowAngle)}"
          fill="none" stroke="url(#ring-grad)" stroke-width="${RING_W}"
          stroke-linecap="round" filter="url(#glow)" opacity="0.85"/>`;
      }

      // 当前时间指针（小三角形或圆点）
      const pos = angleToPos(nowAngle);
      svg += `<circle cx="${pos.x.toFixed(1)}" cy="${pos.y.toFixed(1)}" r="6"
        fill="#FFF" stroke="#6B9FD4" stroke-width="2.5" filter="url(#glow)"/>`;
    }

    // --- 小时刻度标记 ---
    const tickHours = [6, 8, 10, 12, 14, 16, 18, 20, 22];
    tickHours.forEach(h => {
      const angle = timeToAngle(`${String(h).padStart(2, '0')}:00`);
      const inner = angleToPos(angle);
      // 刻度外端点（环外侧）
      const outerR = RING_R + RING_W / 2 + 4;
      const rad = (angle - 90) * Math.PI / 180;
      const ox = CX + outerR * Math.cos(rad);
      const oy = CY + outerR * Math.sin(rad);
      // 刻度内端点（环内侧）
      const innerIR = RING_R - RING_W / 2 - 1;
      const ix = CX + innerIR * Math.cos(rad);
      const iy = CY + innerIR * Math.sin(rad);

      svg += `<line x1="${ix.toFixed(1)}" y1="${iy.toFixed(1)}" x2="${ox.toFixed(1)}" y2="${oy.toFixed(1)}"
        stroke="#B5B2AF" stroke-width="1.2" stroke-linecap="round"/>`;

      // 小时标签（环外侧稍远）
      const labelR = RING_R + RING_W / 2 + 16;
      const lx = CX + labelR * Math.cos(rad);
      const ly = CY + labelR * Math.sin(rad);
      svg += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}"
        text-anchor="middle" dominant-baseline="central"
        font-size="11" fill="#8B8B8B" font-family="inherit" font-weight="500">${String(h).padStart(2,'0')}</text>`;
    });

    // --- 任务圆点 ---
    if (tasks.length === 0) {
      // 中心文字：空状态
      svg += `<text x="${CX}" y="${CY - 8}" text-anchor="middle"
        font-size="14" fill="#B5B2AF" font-family="inherit">暂无安排</text>`;
      svg += `<text x="${CX}" y="${CY + 16}" text-anchor="middle"
        font-size="24" fill="#B5B2AF" font-family="inherit">🕐</text>`;
    } else {
      tasks.forEach(task => {
        const angle = timeToAngle(task.time || '06:00');
        const pos = angleToPos(angle);
        const color = task.color || '#6B9FD4';
        const isActivity = (task.category === 'activity');

        // 连线（圆心到圆点，半透明细线）
        svg += `<line x1="${CX}" y1="${CY}" x2="${pos.x.toFixed(1)}" y2="${pos.y.toFixed(1)}"
          stroke="${color}" stroke-width="1" opacity="0.3" stroke-dasharray="3,3"/>`;

        // 任务圆点
        svg += `<g class="ring-task-dot" data-id="${task.id}">`;
        svg += `<circle cx="${pos.x.toFixed(1)}" cy="${pos.y.toFixed(1)}" r="${DOT_R}"
          fill="${color}" stroke="#FFF" stroke-width="2" opacity="0.92"/>`;

        if (isActivity) {
          // 活动：emoji 在圆点内
          svg += `<text x="${pos.x.toFixed(1)}" y="${pos.y.toFixed(1) + 1}"
            text-anchor="middle" dominant-baseline="central"
            font-size="10" font-family="inherit">${escapeXml(task.icon || '📌')}</text>`;
        } else {
          // 健身：小图标
          if (typeof IconsModule !== 'undefined') {
            const iconSvg = IconsModule.getSVG(task.icon, 10)
              .replace('<svg ', `<svg x="${(pos.x - 5).toFixed(1)}" y="${(pos.y - 5).toFixed(1)}" `);
            svg += iconSvg;
          }
        }
        svg += `</g>`;

        // --- 活动名称标签（环外侧） ---
        const labelR = RING_R + RING_W / 2 + 14;  // 标签距圆心距离
        const rad = (angle - 90) * Math.PI / 180;
        const lx = CX + labelR * Math.cos(rad);
        const ly = CY + labelR * Math.sin(rad);

        // 根据角度判断文字锚点：左半圈用 end，右半圈用 start
        const isRight = (angle >= 0 && angle < 90) || (angle > 270 && angle <= 360);
        const anchor = isRight ? 'start' : 'end';
        const offsetX = isRight ? 4 : -4;  // 微调避免紧贴环

        // 截断过长的标题（最多 6 个中文字）
        const label = task.title || (isActivity ? '活动' : '健身');
        const shortLabel = label.length > 6 ? label.slice(0, 6) + '…' : label;

        svg += `<text x="${(lx + offsetX).toFixed(1)}" y="${ly.toFixed(1)}"
          text-anchor="${anchor}" dominant-baseline="central"
          font-size="11" fill="#5A5A5A" font-family="inherit" font-weight="500"
          class="ring-task-label">${escapeXml(shortLabel)}</text>`;
      });

      // --- 中心文字：今日安排数 ---
      svg += `<text x="${CX}" y="${CY - 6}" text-anchor="middle"
        font-size="28" font-weight="700" fill="var(--color-primary-dark)" font-family="inherit">${tasks.length}</text>`;
      svg += `<text x="${CX}" y="${CY + 16}" text-anchor="middle"
        font-size="12" fill="#8B8B8B" font-family="inherit">项安排</text>`;
    }

    $ringSvg.innerHTML = svg;

    // 绑定任务圆点点击事件
    bindRingDotEvents();
  }

  /** 绑定环形图任务圆点点击 → 编辑 */
  function bindRingDotEvents() {
    $ringSvg.querySelectorAll('.ring-task-dot').forEach(g => {
      g.addEventListener('click', async () => {
        const id = g.getAttribute('data-id');
        const task = await DB.tasks.getById(id);
        if (!task || typeof CalendarModule === 'undefined') return;

        if (task.category === 'activity') {
          CalendarModule.showActivityForm(task);
          setTimeout(() => {
            const saveBtns = [
              document.getElementById('btn-save-activity'),
              document.getElementById('btn-save-batch-activity'),
            ];
            saveBtns.forEach(btn => {
              if (btn) {
                btn.addEventListener('click', () => {
                  setTimeout(() => { renderRingSVG(); }, 300);
                }, { once: true });
              }
            });
          }, 100);
        } else {
          CalendarModule.showAddForm(task);
          setTimeout(() => {
            const saveBtn = document.getElementById('btn-save-task');
            if (saveBtn) {
              saveBtn.addEventListener('click', () => {
                setTimeout(() => { renderRingSVG(); }, 300);
              }, { once: true });
            }
          }, 100);
        }
      });
    });
  }

  // ---------- 选中日期 ----------
  function selectDate(dateStr) {
    selectedDate = dateStr;
    console.log('[Timeline] 选中日期:', selectedDate);

    $dates.querySelectorAll('.tl-date-card').forEach(c => {
      c.classList.toggle('tl-selected', c.getAttribute('data-date') === dateStr);
    });

    renderRingSVG();
  }

  // ---------- 渲染入口 ----------
  async function render() {
    renderDateCards();
    await renderRingSVG();
  }

  // ---------- 事件绑定 ----------
  function bindEvents() {
    $btnToday.addEventListener('click', () => {
      selectDate(getToday());
      const todayCard = $dates.querySelector('.tl-today');
      if (todayCard) {
        todayCard.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    });

    // 添加活动 → 打开活动表单
    const btnAddEntry = document.getElementById('btn-add-entry');
    if (btnAddEntry) {
      btnAddEntry.addEventListener('click', () => {
        if (typeof CalendarModule !== 'undefined') {
          CalendarModule.showActivityForm();
          setTimeout(() => {
            const saveBtns = [
              document.getElementById('btn-save-batch-activity'),
              document.getElementById('btn-save-activity'),
            ];
            saveBtns.forEach(btn => {
              if (btn) {
                btn.addEventListener('click', () => {
                  setTimeout(() => { renderRingSVG(); }, 300);
                }, { once: true });
              }
            });
          }, 100);
        }
      });
    }
  }

  // ---------- 公开 API ----------
  return {
    render,
    bindEvents,
    selectDate,
    getSelectedDate: () => selectedDate,
  };
})();
