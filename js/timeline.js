/* ==========================================
   健身计划 App — 板块③：时间轴 + 记账
   双层横向 + 子Tab切换
   全局对象: TimelineModule
   ========================================== */

const TimelineModule = (() => {
  'use strict';

  // ---------- 状态 ----------
  let selectedDate = null;
  let currentSubTab = 'sub-timeline'; // 当前子视图

  // ---------- DOM 缓存 ----------
  const $dates = document.getElementById('timeline-dates');
  const $ruler = document.getElementById('timeline-ruler');
  const $tracks = document.getElementById('timeline-tracks');
  const $btnToday = document.getElementById('btn-today');
  const subTabs = document.querySelectorAll('#panel-timeline .sub-tab');
  const subPanels = document.querySelectorAll('#panel-timeline .sub-panel');

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

  // ---------- 子Tab切换 ----------
  function switchSubTab(subId) {
    if (currentSubTab === subId) return;

    subPanels.forEach(p => p.classList.remove('active'));
    subTabs.forEach(t => t.classList.remove('active'));

    const targetPanel = document.getElementById(subId);
    const targetTab = document.querySelector(`[data-sub="${subId}"]`);

    if (targetPanel) targetPanel.classList.add('active');
    if (targetTab) targetTab.classList.add('active');

    currentSubTab = subId;

    // 切换到记账视图时刷新
    if (subId === 'sub-budget' && typeof BudgetModule !== 'undefined') {
      BudgetModule.render();
    }
  }

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

  // ---------- 渲染时间刻度 ----------
  function renderTimeRuler() {
    let html = '';
    for (let h = 6; h <= 23; h++) {
      html += `<span class="tl-hour">${String(h).padStart(2, '0')}:00</span>`;
    }
    $ruler.innerHTML = html;
  }

  // ---------- 渲染活动块 ----------
  async function renderTracks() {
    if (!selectedDate) return;

    const entries = await DB.timeline.getByDate(selectedDate);

    if (entries.length === 0) {
      $tracks.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">🕐</span>
          <p>还没有活动安排</p>
          <p class="empty-hint">点击下方按钮添加活动吧</p>
        </div>`;
      return;
    }

    entries.sort((a, b) => a.startTime.localeCompare(b.startTime));

    $tracks.innerHTML = entries.map(entry => {
      const icon = typeof IconsModule !== 'undefined' ? IconsModule.getSVG(entry.icon, 16) : '📌';
      return `
        <div class="tl-entry" data-id="${entry.id}"
             style="background:${entry.color || 'var(--color-primary)'};">
          <span class="tl-entry-icon">${icon}</span>
          <span class="tl-entry-title">${entry.title}</span>
        </div>
      `;
    }).join('');

    // 点击活动 → 编辑
    $tracks.querySelectorAll('.tl-entry').forEach(el => {
      el.addEventListener('click', async () => {
        const id = el.getAttribute('data-id');
        const entry = await DB.timeline.getById(id);
        if (entry) showEntryForm(entry);
      });
    });
  }

  // ---------- 选中日期（共享给记账模块） ----------
  function selectDate(dateStr) {
    selectedDate = dateStr;

    $dates.querySelectorAll('.tl-date-card').forEach(c => {
      c.classList.toggle('tl-selected', c.getAttribute('data-date') === dateStr);
    });

    // 刷新当前子视图
    if (currentSubTab === 'sub-timeline') {
      renderTracks();
    } else if (currentSubTab === 'sub-budget' && typeof BudgetModule !== 'undefined') {
      BudgetModule.render();
    }
  }

  // ---------- 弹出活动表单弹窗（新建 / 编辑） ----------
  // entry: 编辑模式传入已有活动数据；新建模式不传
  function showEntryForm(entry) {
    const isEdit = !!entry;
    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');

    // 预设值
    const defaultTitle = entry ? entry.title : '';
    const defaultStart = entry ? entry.startTime : getCurrentHour();
    const defaultEnd = entry ? entry.endTime : addHour(getCurrentHour());
    const defaultNote = entry ? (entry.note || '') : '';
    const defaultColor = entry ? (entry.color || '#6B9FD4') : '#6B9FD4';

    // 图标数据
    const icons = IconsModule.getAll();
    const groupedIcons = IconsModule.getGrouped();
    const groupOrder = IconsModule.groupOrder;

    // 颜色选项（与日历保持一致）
    const colors = [
      { color: '#6B9FD4', name: '蓝' },
      { color: '#86BDA0', name: '绿' },
      { color: '#D4A574', name: '棕' },
      { color: '#D48686', name: '红' },
      { color: '#B0A8C6', name: '紫' },
      { color: '#8BB8D0', name: '青' },
    ];

    // 当前选中状态
    let selectedIcon = entry ? entry.icon : icons[0].id;
    let selectedColor = defaultColor;

    // 图标选择器 HTML
    function iconPickerHTML() {
      return groupOrder.map(groupName => {
        const groupIcons = groupedIcons[groupName] || [];
        if (groupIcons.length === 0) return '';
        return `
          <div class="icon-group">
            <span class="icon-group-label">${groupName}</span>
            <div class="icon-picker">
              ${groupIcons.map(icon => `
                <div class="icon-picker-item ${icon.id === selectedIcon ? 'selected' : ''}"
                     data-icon="${icon.id}">
                  ${IconsModule.getSVG(icon.id, 28)}
                  <span class="icon-picker-name">${icon.name}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }).join('');
    }

    // 颜色选择器 HTML
    function colorPickerHTML() {
      return colors.map(c => `
        <span class="color-dot ${c.color === selectedColor ? 'selected' : ''}"
              data-color="${c.color}"
              style="background:${c.color};"
              title="${c.name}"></span>
      `).join('');
    }

    // 构建弹窗
    content.innerHTML = `
      <h3 style="margin-bottom:16px;color:var(--color-primary-dark);font-weight:600;">
        ${isEdit ? '✏️ 编辑活动' : '🕐 添加活动'}
      </h3>

      <div class="form-section">
        <span class="form-label">📌 选择动作</span>
        <div class="icon-picker" id="icon-picker">
          ${iconPickerHTML()}
        </div>
      </div>

      <div class="form-section">
        <span class="form-label">📝 活动名称</span>
        <input type="text" class="form-input" id="entry-title"
               placeholder="例如：晨跑"
               value="${escapeHtml(defaultTitle)}">
      </div>

      <div class="form-section">
        <span class="form-label">⏰ 时间</span>
        <div class="time-range">
          <input type="time" class="form-input" id="entry-start" value="${defaultStart}">
          <span class="time-range-sep">至</span>
          <input type="time" class="form-input" id="entry-end" value="${defaultEnd}">
        </div>
      </div>

      <div class="form-section">
        <span class="form-label">🎨 标签颜色</span>
        <div class="color-picker" id="color-picker" style="padding-top:6px;">
          ${colorPickerHTML()}
        </div>
      </div>

      <div class="form-section">
        <span class="form-label">📋 备注（可选）</span>
        <input type="text" class="form-input" id="entry-note"
               placeholder="补充说明..."
               value="${escapeHtml(defaultNote)}">
      </div>

      <div style="display:flex;gap:var(--space-sm);margin-top:var(--space-md);">
        ${isEdit ? `<button id="btn-delete-entry" style="flex:1;padding:var(--space-md);border-radius:var(--radius-sm);background:rgba(212,134,134,0.15);color:var(--color-danger);font-weight:600;">删除</button>` : ''}
        <button id="btn-cancel-entry" style="flex:1;padding:var(--space-md);border-radius:var(--radius-sm);background:rgba(0,0,0,0.04);font-weight:600;color:var(--color-text-light);">取消</button>
        <button id="btn-save-entry" style="flex:1;padding:var(--space-md);border-radius:var(--radius-sm);background:var(--color-primary);color:#FFF;font-weight:600;">保存</button>
      </div>
    `;

    overlay.classList.add('show');

    // 刷新图标选择器状态
    function refreshIconPicker() {
      const picker = document.getElementById('icon-picker');
      if (picker) picker.innerHTML = iconPickerHTML();
      document.querySelectorAll('.icon-picker-item').forEach(item => {
        item.addEventListener('click', () => {
          selectedIcon = item.getAttribute('data-icon');
          refreshIconPicker();
        });
      });
    }

    // 刷新颜色选择器状态
    function refreshColorPicker() {
      const picker = document.getElementById('color-picker');
      if (picker) picker.innerHTML = colorPickerHTML();
      document.querySelectorAll('.color-dot').forEach(dot => {
        dot.addEventListener('click', () => {
          selectedColor = dot.getAttribute('data-color');
          refreshColorPicker();
        });
      });
    }

    // 初次绑定（setTimeout 确保 DOM 已更新）
    setTimeout(() => {
      refreshIconPicker();
      refreshColorPicker();
    }, 0);

    // 取消
    document.getElementById('btn-cancel-entry').addEventListener('click', () => {
      overlay.classList.remove('show');
    });

    // 删除（仅编辑模式）
    if (isEdit) {
      document.getElementById('btn-delete-entry').addEventListener('click', async () => {
        if (confirm('确定删除这个活动吗？')) {
          await DB.timeline.remove(entry.id);
          overlay.classList.remove('show');
          renderTracks();
        }
      });
    }

    // 保存
    document.getElementById('btn-save-entry').addEventListener('click', async () => {
      const title = document.getElementById('entry-title').value.trim();
      const startTime = document.getElementById('entry-start').value;
      const endTime = document.getElementById('entry-end').value;
      const note = document.getElementById('entry-note').value.trim();

      // 校验
      if (!title) {
        alert('请输入活动名称');
        return;
      }
      if (startTime >= endTime) {
        alert('结束时间必须晚于开始时间');
        return;
      }

      const data = {
        date: selectedDate,
        title,
        icon: selectedIcon,
        color: selectedColor,
        startTime,
        endTime,
        note,
      };

      try {
        if (isEdit) {
          await DB.timeline.update({ ...data, id: entry.id, createdAt: entry.createdAt });
        } else {
          await DB.timeline.add(data);
        }
        overlay.classList.remove('show');
        renderTracks();
      } catch (err) {
        console.error('活动保存失败:', err);
        alert('保存失败，请重试。\n错误：' + (err.message || '未知错误'));
      }
    });
  }

  // ---------- 工具：获取当前整点时间 ----------
  function getCurrentHour() {
    const now = new Date();
    return String(now.getHours()).padStart(2, '0') + ':00';
  }

  function addHour(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    const next = h + 1;
    if (next >= 24) return '23:00';
    return String(next).padStart(2, '0') + ':' + String(m).padStart(2, '0');
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ---------- 渲染入口 ----------
  async function render() {
    renderDateCards();
    renderTimeRuler();
    await renderTracks();
  }

  // ---------- 事件绑定 ----------
  function bindEvents() {
    // 子Tab切换
    subTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const subId = tab.getAttribute('data-sub');
        if (subId) switchSubTab(subId);
      });
    });

    // 今天按钮
    $btnToday.addEventListener('click', () => {
      selectDate(getToday());
      const todayCard = $dates.querySelector('.tl-today');
      if (todayCard) {
        todayCard.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    });

    // 添加活动 → 打开弹窗
    document.getElementById('btn-add-entry').addEventListener('click', () => {
      showEntryForm();
    });
  }

  // ---------- 公开 API ----------
  return {
    render,
    bindEvents,
    selectDate,
    getSelectedDate: () => selectedDate,
    getCurrentSubTab: () => currentSubTab,
    switchSubTab,
  };
})();
