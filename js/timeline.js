/* ==========================================
   健身计划 App — 板块③：时间轴 + 记账
   双层横向 + 子Tab切换
   全局对象: TimelineModule
   ========================================== */

const TimelineModule = (() => {
  'use strict';

  // ---------- 状态 ----------
  let selectedDate = null;

  // ---------- DOM 缓存 ----------
  const $dates = document.getElementById('timeline-dates');
  const $tracks = document.getElementById('timeline-tracks');
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

    // 点击事件
    $dates.querySelectorAll('.tl-date-card').forEach(card => {
      card.addEventListener('click', () => {
        selectDate(card.getAttribute('data-date'));
      });
    });

    // 滚动到今天
    setTimeout(() => {
      const todayCard = $dates.querySelector('.tl-today');
      if (todayCard) {
        todayCard.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }, 200);
  }

  // ---------- 渲染任务列表（从日历任务同步） ----------
  async function renderTracks() {
    if (!selectedDate) return;

    const tasks = await DB.tasks.getByDate(selectedDate);

    if (tasks.length === 0) {
      $tracks.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">🕐</span>
          <p>还没有活动安排</p>
          <p class="empty-hint">点击下方按钮添加活动吧</p>
        </div>`;
      return;
    }

    tasks.sort((a, b) => (a.time || '').localeCompare(b.time || ''));

    $tracks.innerHTML = `<div class="tl-task-list">${tasks.map(t => {
      const icon = typeof IconsModule !== 'undefined' ? IconsModule.getSVG(t.icon, 16) : '';
      const summary = typeof CalendarModule !== 'undefined' ? CalendarModule.buildSummary(t.icon, t.details) : '';
      return `
        <div class="tl-task-block" data-id="${t.id}" style="border-left-color:${t.color || 'var(--color-primary)'}">
          <span class="tl-task-icon">${icon}</span>
          <span class="tl-task-time">${t.time || ''}</span>
          <span class="tl-task-label">${t.title || ''}</span>
          ${summary ? `<span class="tl-task-summary">${summary}</span>` : ''}
        </div>
      `;
    }).join('')}</div>`;

    // 点击任务块 → 编辑（调用日历模块的编辑弹窗）
    $tracks.querySelectorAll('.tl-task-block').forEach(el => {
      el.addEventListener('click', async () => {
        const id = el.getAttribute('data-id');
        const task = await DB.tasks.getById(id);
        if (task && typeof CalendarModule !== 'undefined') {
          CalendarModule.showAddForm(task);
          // 编辑保存后刷新时间轴
          const origSave = document.getElementById('btn-save-task');
          if (origSave) {
            origSave.addEventListener('click', () => {
              setTimeout(() => renderTracks(), 300);
            }, { once: true });
          }
        }
      });
    });
  }

  // ---------- 选中日期（同步刷新时间轴、记账摘要和记账列表） ----------
  function selectDate(dateStr) {
    selectedDate = dateStr;

    $dates.querySelectorAll('.tl-date-card').forEach(c => {
      c.classList.toggle('tl-selected', c.getAttribute('data-date') === dateStr);
    });

    // 刷新时间轴和记账
    renderTracks();
    renderBudgetMini();
    if (typeof BudgetModule !== 'undefined') {
      BudgetModule.render(); // 刷新完整记账列表
    }
  }

  // ---------- 收支摘要（嵌入时间轴画布内） ----------
  async function renderBudgetMini() {
    const mini = document.getElementById('budget-mini');
    if (!mini || !selectedDate) return;
    if (typeof BudgetModule !== 'undefined') {
      await BudgetModule.renderMini(mini, selectedDate);
    }
  }

  // ---------- 渲染入口 ----------
  async function render() {
    renderDateCards();
    await renderTracks();
    await renderBudgetMini();
    // 同时刷新记账列表（时间轴页面下方的完整记账区）
    if (typeof BudgetModule !== 'undefined') {
      await BudgetModule.render();
    }
  }

  // ---------- 事件绑定 ----------
  function bindEvents() {
    // 今天按钮
    $btnToday.addEventListener('click', () => {
      selectDate(getToday());
      const todayCard = $dates.querySelector('.tl-today');
      if (todayCard) {
        todayCard.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    });

    // 添加活动 → 打开日历任务弹窗（统一使用日历任务管理）
    document.getElementById('btn-add-entry').addEventListener('click', () => {
      if (typeof CalendarModule !== 'undefined') {
        CalendarModule.showAddForm();
        // 保存后刷新时间轴
        setTimeout(() => {
          const saveBtn = document.getElementById('btn-save-task');
          if (saveBtn) {
            saveBtn.addEventListener('click', () => {
              setTimeout(() => { renderTracks(); renderBudgetMini(); }, 300);
            }, { once: true });
          }
        }, 100);
      }
    });

    // 记账按钮 → 打开记账弹窗
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
