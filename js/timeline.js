/* ==========================================
   健身计划 App — 板块③：时间轴 + 记账
   SVG 水平时间轴，一屏显示，支持缩放
   全局对象: TimelineModule
   ========================================== */

const TimelineModule = (() => {
  'use strict';

  // ---------- 状态 ----------
  let selectedDate = null;
  let zoomLevel = 1;           // 1 = 全天可见（viewBox 宽度 960）
  let viewX = 0;               // viewBox x 偏移（用于平移）
  let pinchStartDist = 0;
  let pinchStartZoom = 1;
  let isPanning = false;
  let panStartX = 0;
  let panStartViewX = 0;

  // ---------- DOM 缓存 ----------
  const $dates    = document.getElementById('timeline-dates');
  const $axisSvg  = document.getElementById('timeline-axis-svg');
  const $svgWrap  = document.getElementById('timeline-svg-wrapper');
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

  /** 将 HH:MM 时间转为 SVG X坐标（分钟偏移，06:00=0） */
  function timeToX(timeStr) {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (h * 60 + m) - 360; // 偏移 06:00
  }

  const weekNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  // ---------- 渲染日期卡片（外层） ----------
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

  // ---------- 车道分配（避免任务块重叠） ----------
  function assignLanes(tasks) {
    const sorted = [...tasks].sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    const lanes  = [];

    for (const task of sorted) {
      const taskX    = timeToX(task.time);
      const taskEndX = taskX + 52; // 块宽50 + 间距2

      let assignedLane = -1;
      for (let i = 0; i < lanes.length; i++) {
        const lastInLane = lanes[i][lanes[i].length - 1];
        const lastEndX   = timeToX(lastInLane.time) + 52;
        if (taskX >= lastEndX + 6) {
          assignedLane = i;
          break;
        }
      }

      if (assignedLane === -1) {
        assignedLane = lanes.length;
        lanes.push([]);
      }

      lanes[assignedLane].push(task);
    }

    return lanes;
  }

  // ---------- 渲染 SVG 水平时间轴 ----------
  async function renderAxisSVG() {
    if (!$axisSvg) return;

    const tasks = selectedDate ? await DB.tasks.getByDate(selectedDate) : [];
    tasks.sort((a, b) => (a.time || '').localeCompare(b.time || ''));

    const today = getToday();
    let svg = '';

    // --- 小时标记线和标签（06:00 — 22:00） ---
    for (let h = 6; h <= 22; h++) {
      const x = (h - 6) * 60;

      // 网格虚线
      svg += `<line x1="${x}" y1="24" x2="${x}" y2="158" stroke="#F0EDEA" stroke-width="1" stroke-dasharray="3,4"/>`;

      // 整点标签
      svg += `<text x="${x}" y="14" text-anchor="middle" font-size="10" fill="#B5B2AF" font-family="inherit">${String(h).padStart(2, '0')}:00</text>`;

      // 上下刻度
      svg += `<line x1="${x}" y1="22" x2="${x}" y2="24" stroke="#DCD8D4" stroke-width="1"/>`;
    }

    // --- 当前时间指示器（仅今天） ---
    if (selectedDate === today) {
      const now   = new Date();
      const nowMin = now.getHours() * 60 + now.getMinutes();
      const nowX   = nowMin - 360;
      if (nowX >= 0 && nowX <= 960) {
        svg += `<line x1="${nowX}" y1="22" x2="${nowX}" y2="158" stroke="#D48686" stroke-width="1.5" stroke-dasharray="5,3" opacity="0.7"/>`;
        svg += `<circle cx="${nowX}" cy="23" r="3.5" fill="#D48686"/>`;
      }
    }

    // --- 任务块 ---
    if (tasks.length === 0) {
      svg += `<text x="480" y="100" text-anchor="middle" font-size="13" fill="#B5B2AF" font-family="inherit">暂无活动安排 🕐</text>`;
    } else {
      const lanes = assignLanes(tasks);

      lanes.forEach((lane, laneIdx) => {
        const y = 46 + laneIdx * 38;

        lane.forEach(task => {
          const x     = timeToX(task.time || '06:00');
          const color = task.color || '#6B9FD4';
          const title = (task.title || '').substring(0, 6);

          svg += `<g class="tl-task-svg-block" data-id="${task.id}" style="cursor:pointer">`;
          // 任务色块
          svg += `<rect x="${x}" y="${y}" width="50" height="34" rx="6" fill="${color}" opacity="0.88"/>`;
          // 图标（小号）
          if (typeof IconsModule !== 'undefined') {
            const iconSvg = IconsModule.getSVG(task.icon, 14)
              .replace('<svg ', `<svg x="${x + 4}" y="${y + 3}" `);
            svg += iconSvg;
          }
          // 标题文字
          svg += `<text x="${x + 22}" y="${y + 26}" text-anchor="middle" font-size="9" fill="#FFF" font-weight="600" font-family="inherit">${escapeXml(title)}</text>`;
          svg += `</g>`;
        });
      });
    }

    $axisSvg.innerHTML = svg;

    // 点击任务块 → 编辑
    bindAxisBlockEvents();
  }

  /** 绑定 SVG 任务块点击事件 */
  function bindAxisBlockEvents() {
    $axisSvg.querySelectorAll('.tl-task-svg-block').forEach(g => {
      g.addEventListener('click', async () => {
        const id   = g.getAttribute('data-id');
        const task = await DB.tasks.getById(id);
        if (task && typeof CalendarModule !== 'undefined') {
          CalendarModule.showAddForm(task);
          // 保存后刷新
          setTimeout(() => {
            const saveBtn = document.getElementById('btn-save-task');
            if (saveBtn) {
              saveBtn.addEventListener('click', () => {
                setTimeout(() => { renderAxisSVG(); renderBudgetMini(); }, 300);
              }, { once: true });
            }
          }, 100);
        }
      });
    });
  }

  // ---------- SVG 坐标转换 ----------
  /** 将屏幕像素偏移转为 SVG viewBox 坐标偏移 */
  function screenToSvg(screenPx) {
    if (!$axisSvg) return 0;
    const svgRect = $axisSvg.getBoundingClientRect();
    const svgW = svgRect.width;
    const viewW = 960 / zoomLevel;
    return (screenPx / svgW) * viewW;
  }

  // ---------- 缩放功能（定点缩放） ----------
  function zoomIn() {
    const newZoom = Math.min(zoomLevel * 1.5, 5);
    zoomAt(newZoom, 0.5); // 以可视区域中心为焦点
  }

  function zoomOut() {
    const newZoom = Math.max(zoomLevel / 1.5, 1);
    zoomAt(newZoom, 0.5);
  }

  /**
   * 以焦点比例进行缩放（保持焦点位置不动）
   * @param {number} newZoom  新缩放级别
   * @param {number} focalRatio  焦点在可视区域的相对位置（0=左边, 0.5=中间, 1=右边）
   */
  function zoomAt(newZoom, focalRatio) {
    if (!$axisSvg) return;
    const baseW = 960;
    const oldViewW = baseW / zoomLevel;
    const newViewW = baseW / newZoom;

    // 焦点在 viewBox 中的绝对位置
    const focalSvgX = viewX + oldViewW * focalRatio;

    // 新 viewX：保持焦点在屏幕同一位置
    viewX = focalSvgX - newViewW * focalRatio;

    zoomLevel = newZoom;
    applyZoom();
  }

  /** 应用缩放与平移到 SVG viewBox */
  function applyZoom() {
    if (!$axisSvg) return;
    const baseW = 960;
    const newW  = baseW / zoomLevel;

    // 限制 viewX 不超出边界
    const maxX = baseW - newW;
    viewX = Math.max(0, Math.min(viewX, maxX));

    $axisSvg.setAttribute('viewBox', `${viewX} 0 ${newW} 180`);

    // 缩放 >1x 时可横向滚动 + 拖拽平移
    if ($svgWrap) {
      $svgWrap.style.overflowX = zoomLevel > 1 ? 'auto' : 'hidden';
    }
  }

  // ---------- 平移拖拽 + 双指定点缩放 ----------
  function bindPanZoom() {
    if (!$svgWrap || !$axisSvg) return;

    // --- 鼠标拖拽平移 ---
    $svgWrap.addEventListener('mousedown', (e) => {
      if (zoomLevel <= 1) return;
      // 不拦截任务块上的点击
      if (e.target.closest('.tl-task-svg-block')) return;
      isPanning = true;
      panStartX = e.clientX;
      panStartViewX = viewX;
      $svgWrap.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
      if (!isPanning) return;
      const dx = screenToSvg(panStartX - e.clientX);
      viewX = panStartViewX + dx;
      applyZoom();
    });

    document.addEventListener('mouseup', () => {
      isPanning = false;
      if ($svgWrap) $svgWrap.style.cursor = '';
    });

    // --- 触摸事件（单指平移 + 双指定点缩放） ---
    $svgWrap.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1 && zoomLevel > 1) {
        // 单指平移（仅缩放时）
        if (e.target.closest('.tl-task-svg-block')) return;
        isPanning = true;
        panStartX = e.touches[0].clientX;
        panStartViewX = viewX;
      } else if (e.touches.length === 2) {
        // 双指缩放
        isPanning = false;
        pinchStartDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        pinchStartZoom = zoomLevel;
      }
    }, { passive: true });

    $svgWrap.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2) {
        // 双指：定点缩放
        const currentDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        if (pinchStartDist > 0) {
          const newZoom = Math.min(5, Math.max(1, pinchStartZoom * (currentDist / pinchStartDist)));
          // 焦点 = 双指中点
          const svgRect = $axisSvg.getBoundingClientRect();
          const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
          const focalRatio = Math.max(0, Math.min(1, (midX - svgRect.left) / svgRect.width));
          zoomAt(newZoom, focalRatio);
        }
      } else if (e.touches.length === 1 && isPanning && zoomLevel > 1) {
        // 单指：平移
        const dx = screenToSvg(panStartX - e.touches[0].clientX);
        viewX = panStartViewX + dx;
        applyZoom();
      }
    }, { passive: true });

    $svgWrap.addEventListener('touchend', (e) => {
      if (e.touches.length === 0) {
        pinchStartDist = 0;
        isPanning = false;
      }
    }, { passive: true });
  }

  // ---------- 选中日期 ----------
  function selectDate(dateStr) {
    selectedDate = dateStr;

    $dates.querySelectorAll('.tl-date-card').forEach(c => {
      c.classList.toggle('tl-selected', c.getAttribute('data-date') === dateStr);
    });

    renderAxisSVG();
    renderBudgetMini();
    if (typeof BudgetModule !== 'undefined') {
      BudgetModule.render();
    }
  }

  // ---------- 收支摘要 ----------
  async function renderBudgetMini() {
    const mini = document.getElementById('budget-mini');
    if (!mini || !selectedDate) return;
    if (typeof BudgetModule !== 'undefined') {
      await BudgetModule.renderMini(mini, selectedDate);
    }
  }

  // ---------- 渲染入口 ----------
  async function render() {
    zoomLevel = 1;
    viewX = 0;
    applyZoom();
    renderDateCards();
    await renderAxisSVG();
    await renderBudgetMini();
    if (typeof BudgetModule !== 'undefined') {
      await BudgetModule.render();
    }
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

    // 缩放按钮
    document.getElementById('tl-zoom-in') .addEventListener('click', zoomIn);
    document.getElementById('tl-zoom-out').addEventListener('click', zoomOut);
    bindPanZoom();

    // 添加活动
    document.getElementById('btn-add-entry').addEventListener('click', () => {
      if (typeof CalendarModule !== 'undefined') {
        CalendarModule.showAddForm();
        setTimeout(() => {
          const saveBtn = document.getElementById('btn-save-task');
          if (saveBtn) {
            saveBtn.addEventListener('click', () => {
              setTimeout(() => { renderAxisSVG(); renderBudgetMini(); }, 300);
            }, { once: true });
          }
        }, 100);
      }
    });

    // 记账按钮
    const btnExpense = document.getElementById('btn-add-expense');
    if (btnExpense && typeof BudgetModule !== 'undefined') {
      btnExpense.addEventListener('click', () => {
        BudgetModule.showAddForm();
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