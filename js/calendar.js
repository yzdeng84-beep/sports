/* ==========================================
   健身计划 App — 板块①：日历封面页
   月历网格 + 每日任务圆点 + 详情展开
   全局对象: CalendarModule
   ========================================== */

const CalendarModule = (() => {
  'use strict';

  // ---------- 状态 ----------
  let currentYear, currentMonth;        // 当前显示的年份/月份
  let selectedDate = null;             // 当前选中的日期 "YYYY-MM-DD"

  // ---------- DOM 缓存 ----------
  const $grid = document.getElementById('calendar-grid');
  const $monthLabel = document.getElementById('cal-month-label');
  const $detailDate = document.getElementById('detail-date');
  const $detailTasks = document.getElementById('detail-tasks');
  const $prevBtn = document.getElementById('cal-prev-month');
  const $nextBtn = document.getElementById('cal-next-month');

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

  /** 获取当前时间 HH:MM */
  function getCurrentTime() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }

  // ---------- 渲染月历网格 ----------
  async function renderGrid() {
    const today = getToday();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay(); // 0=周日
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // 调整为周一起始 (0=周一, 6=周日)
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;

    // 获取当月所有任务，按日期分组
    const allTasks = await DB.tasks.getAll();
    const tasksByDate = {};
    allTasks.forEach(t => {
      if (!tasksByDate[t.date]) tasksByDate[t.date] = [];
      tasksByDate[t.date].push(t);
    });

    // 构建 HTML
    let html = '';
    // 填充前置空白格
    for (let i = 0; i < startOffset; i++) {
      html += '<div class="cal-cell cal-cell-empty"></div>';
    }
    // 日期格子
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDate(currentYear, currentMonth, day);
      const tasks = tasksByDate[dateStr] || [];
      const isToday = dateStr === today;
      const isSelected = dateStr === selectedDate;

      // 最多显示3个圆点
      const dots = tasks.slice(0, 3).map(t =>
        `<span class="cal-dot" style="background:${t.color || 'var(--color-primary)'}"></span>`
      ).join('');

      html += `
        <div class="cal-cell ${isToday ? 'cal-today' : ''} ${isSelected ? 'cal-selected' : ''}"
             data-date="${dateStr}">
          <span class="cal-day">${day}</span>
          <span class="cal-dots">${dots}</span>
        </div>`;
    }

    $grid.innerHTML = html;

    // 绑定日期点击事件
    $grid.querySelectorAll('.cal-cell:not(.cal-cell-empty)').forEach(cell => {
      cell.addEventListener('click', () => {
        const dateStr = cell.getAttribute('data-date');
        selectDate(dateStr);
      });
    });
  }

  // ---------- 选中日期 & 展开详情 ----------
  function selectDate(dateStr) {
    selectedDate = dateStr;

    // 更新格子的选中样式
    $grid.querySelectorAll('.cal-cell').forEach(c => c.classList.remove('cal-selected'));
    const selectedCell = $grid.querySelector(`[data-date="${dateStr}"]`);
    if (selectedCell) selectedCell.classList.add('cal-selected');

    // 加载当日任务
    loadDayDetail(dateStr);
  }

  // ---------- 加载当日详情 ----------
  async function loadDayDetail(dateStr) {
    const tasks = await DB.tasks.getByDate(dateStr);

    // 格式化日期显示
    const [y, m, d] = dateStr.split('-');
    $detailDate.textContent = `📅 ${m}月${d}日`;

    if (tasks.length === 0) {
      $detailTasks.innerHTML = `
        <li class="detail-empty">暂无计划，点击下方按钮添加</li>`;
    } else {
      $detailTasks.innerHTML = tasks.map(t => {
        const summary = buildSummary(t.icon, t.details);
        return `
        <li class="detail-task-item" data-id="${t.id}">
          <span class="task-icon">${IconsModule.getSVG(t.icon, 18)}</span>
          <span class="task-time">${t.time}</span>
          <span class="task-title">${t.title}</span>
          ${summary ? `<span class="task-summary">${summary}</span>` : ''}
          <button class="btn-task-delete" data-id="${t.id}" title="删除">×</button>
        </li>
      `}).join('');

      // 点击任务项 → 编辑
      $detailTasks.querySelectorAll('.detail-task-item').forEach(item => {
        item.addEventListener('click', async () => {
          const id = item.getAttribute('data-id');
          const task = await DB.tasks.getById(id);
          if (task) showAddForm(task);
        });
      });

      // 绑定删除事件（阻止冒泡到编辑）
      $detailTasks.querySelectorAll('.btn-task-delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-id');
          if (confirm('确定删除这个计划吗？')) {
            await DB.tasks.remove(id);
            loadDayDetail(dateStr);
            renderGrid(); // 刷新圆点
          }
        });
      });
    }
  }

  // ---------- 根据图标和训练详情生成摘要文字 ----------
  function buildSummary(iconId, details) {
    if (!details) return '';
    const d = details;
    const fields = IconsModule.getFormFields(iconId);

    // 力量训练：重量 × 组数
    if (fields.includes('weight') && fields.includes('sets')) {
      const parts = [];
      if (d.weight) parts.push(`${d.weight}kg`);
      if (d.sets) parts.push(`${d.sets}组`);
      return parts.join(' × ');
    }

    // 有氧训练：拼接各字段
    const parts = [];
    if (fields.includes('speed') && d.speed) parts.push(`${d.speed}km/h`);
    if (fields.includes('incline') && d.incline != null) parts.push(`${d.incline}%`);
    if (fields.includes('level') && d.level) parts.push(`${d.level}档`);
    if (fields.includes('duration') && d.duration) parts.push(`${d.duration}分钟`);
    return parts.join(' · ');
  }

  // ---------- 弹出添加/编辑任务弹窗 ----------
  // task: 编辑模式传入已有任务数据；新建模式不传
  function showAddForm(task) {
    // 未选日期时自动使用今天，不再阻塞用户
    if (!selectedDate && !task) {
      selectedDate = getToday();
    }

    const isEdit = !!task;
    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    const icons = IconsModule.getAll();
    const groupedIcons = IconsModule.getGrouped();
    const groupOrder = IconsModule.groupOrder;

    // 预设颜色
    const colors = [
      { color: '#6B9FD4', name: '蓝' },
      { color: '#86BDA0', name: '绿' },
      { color: '#D4A574', name: '棕' },
      { color: '#D48686', name: '红' },
      { color: '#B0A8C6', name: '紫' },
      { color: '#8BB8D0', name: '青' },
    ];

    // 当前选中状态（必须在 defaultTitle 之前声明）
    let selectedIcon = task ? task.icon : icons[0].id;
    let selectedColor = task ? (task.color || colors[0].color) : colors[0].color;

    // 预设值（编辑模式从已有数据填充）
    const defaultTitle = task ? (task.title || '') : IconsModule.getName(selectedIcon);
    const defaultTime = task ? (task.time || getCurrentTime()) : getCurrentTime();
    const defaultDate = task ? task.date : selectedDate;

    // 渲染图标选择器 HTML（按分组）
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

    // 渲染颜色选择器 HTML
    function colorPickerHTML() {
      return colors.map(c => `
        <span class="color-dot ${c.color === selectedColor ? 'selected' : ''}"
              data-color="${c.color}"
              style="background:${c.color};"
              title="${c.name}"></span>
      `).join('');
    }

    // 根据选中的图标渲染训练参数字段
    function fieldsHTML() {
      const fields = IconsModule.getFormFields(selectedIcon);
      if (fields.length === 0) return '';

      // 编辑模式下已有的详情值
      const existingDetails = (task && task.details) ? task.details : {};

      const fieldDefs = {
        weight:   { label: '🏋️ 重量', unit: 'kg',   placeholder: '60',    type: 'number' },
        sets:     { label: '🔢 组数', unit: '组',  placeholder: '4',     type: 'number' },
        speed:    { label: '🏃 速度', unit: 'km/h',placeholder: '8.5',   type: 'number', step: '0.1' },
        incline:  { label: '📐 坡度', unit: '%',   placeholder: '5',     type: 'number' },
        level:    { label: '🪜 档位', unit: '档',  placeholder: '3',     type: 'number' },
        duration: { label: '⏱️ 时长', unit: '分钟',placeholder: '30',    type: 'number' },
      };

      return `
        <div class="form-section">
          <span class="form-label">训练参数</span>
          <div class="detail-fields">
            ${fields.map(f => {
              const def = fieldDefs[f];
              if (!def) return '';
              const val = existingDetails[f] !== undefined ? existingDetails[f] : '';
              return `
                <div class="field-group">
                  <span class="form-label">${def.label}</span>
                  <div style="display:flex;align-items:center;gap:4px;">
                    <input type="${def.type}" class="form-input" id="field-${f}"
                           placeholder="${def.placeholder}"${def.step ? ` step="${def.step}"` : ''}
                           value="${val}">
                    <span class="field-unit">${def.unit}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    // 构建完整弹窗 — 编辑模式（保持原有单条流程）
    if (isEdit) {
      content.innerHTML = `
        <h3 style="margin-bottom:16px;color:var(--color-primary-dark);font-weight:600;">
          ✏️ 编辑计划
        </h3>

        <div class="form-section">
          <span class="form-label">📌 选择动作</span>
          <div class="icon-picker" id="icon-picker">
            ${iconPickerHTML()}
          </div>
        </div>

        <div class="form-section" style="display:flex;gap:var(--space-sm);">
          <div style="flex:1;">
            <span class="form-label">⏰ 时间</span>
            <input type="time" class="form-input" id="task-time" value="${defaultTime}">
          </div>
          <div style="flex:1;">
            <span class="form-label">🎨 标签颜色</span>
            <div class="color-picker" id="color-picker" style="padding-top:6px;">
              ${colorPickerHTML()}
            </div>
          </div>
        </div>

        <div class="form-section">
          <span class="form-label">📝 标题</span>
          <input type="text" class="form-input" id="task-title" placeholder="标题（可选）" value="${escapeHtml(defaultTitle)}">
        </div>

        <div id="detail-fields-container">
          ${fieldsHTML()}
        </div>

        <div style="display:flex;gap:var(--space-sm);margin-top:var(--space-md);">
          <button id="btn-delete-task" style="flex:1;padding:var(--space-md);border-radius:var(--radius-sm);background:rgba(212,134,134,0.15);color:var(--color-danger);font-weight:600;">删除</button>
          <button id="btn-cancel-task" style="flex:1;padding:var(--space-md);border-radius:var(--radius-sm);background:rgba(0,0,0,0.04);font-weight:600;color:var(--color-text-light);">取消</button>
          <button id="btn-save-task" style="flex:1;padding:var(--space-md);border-radius:var(--radius-sm);background:var(--color-primary);color:#FFF;font-weight:600;">保存</button>
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
            const container = document.getElementById('detail-fields-container');
            if (container) container.innerHTML = fieldsHTML();
            const titleInput = document.getElementById('task-title');
            if (titleInput) {
              const currentTitle = titleInput.value.trim();
              const knownNames = IconsModule.getAll().map(i => i.name);
              if (!currentTitle || knownNames.includes(currentTitle)) {
                titleInput.value = IconsModule.getName(selectedIcon);
              }
            }
          });
        });
      }

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

      setTimeout(() => {
        refreshIconPicker();
        refreshColorPicker();
      }, 0);

      document.getElementById('btn-cancel-task').addEventListener('click', () => {
        overlay.classList.remove('show');
      });

      document.getElementById('btn-delete-task').addEventListener('click', async () => {
        if (confirm('确定删除这个计划吗？')) {
          await DB.tasks.remove(task.id);
          overlay.classList.remove('show');
          loadDayDetail(task.date);
          renderGrid();
        }
      });

      document.getElementById('btn-save-task').addEventListener('click', async () => {
        const title = document.getElementById('task-title').value.trim();
        const time = document.getElementById('task-time').value || getCurrentTime();
        const fields = IconsModule.getFormFields(selectedIcon);
        const details = {};
        fields.forEach(f => {
          const input = document.getElementById(`field-${f}`);
          if (input && input.value) {
            details[f] = f === 'speed' ? parseFloat(input.value) : Number(input.value);
          }
        });

        try {
          await DB.tasks.update({
            id: task.id,
            date: defaultDate,
            time: time,
            title: title,
            icon: selectedIcon,
            color: selectedColor,
            details: Object.keys(details).length > 0 ? details : undefined,
            createdAt: task.createdAt,
          });
          overlay.classList.remove('show');
          loadDayDetail(defaultDate);
          renderGrid();
        } catch (err) {
          console.error('任务保存失败:', err);
          alert('保存失败，请重试。\n错误：' + (err.message || '未知错误'));
        }
      });
      return;
    }

    // ========== 批量添加模式（新建任务）==========
    const batchItems = [];
    let activeIndex = 0;

    // 初始化第一个批量项
    batchItems.push({
      icon: selectedIcon,
      color: selectedColor,
      time: defaultTime,
      title: defaultTitle,
      details: {}
    });

    function renderBatchUI() {
      // 当前活跃项的快捷引用
      const current = batchItems[activeIndex] || batchItems[0];

      content.innerHTML = `
        <h3 style="margin-bottom:12px;color:var(--color-primary-dark);font-weight:600;">
          📋 批量添加健身计划
        </h3>

        <!-- 已添加项列表 -->
        <div class="batch-chips-row" id="batch-chips-row">
          ${batchItems.map((item, idx) => `
            <div class="batch-chip ${idx === activeIndex ? 'active' : ''}" data-index="${idx}">
              <span>${IconsModule.getSVG(item.icon, 16)}</span>
              <span class="batch-chip-title">${escapeHtml(item.title || '未命名')}</span>
              <span class="batch-chip-time">${item.time}</span>
              ${batchItems.length > 1 ? `<span class="batch-chip-remove" data-index="${idx}">×</span>` : ''}
            </div>
          `).join('')}
        </div>

        <!-- 添加更多按钮 -->
        <button class="btn-add-another" id="btn-add-another">
          ＋ 添加动作（当前已选 ${batchItems.length} 项）
        </button>

        <!-- 分隔线 -->
        <div class="batch-edit-divider">编辑当前动作</div>

        <!-- 当前项编辑区 -->
        ${batchItems.length === 0 ? `
          <p style="text-align:center;color:var(--color-text-light);padding:var(--space-md);">点击上方"添加动作"开始记录</p>
        ` : `
          <div class="form-section">
            <span class="form-label">📌 选择动作</span>
            <div class="icon-picker" id="icon-picker" style="max-height:200px;overflow-y:auto;">
              ${iconPickerHTML()}
            </div>
          </div>

          <div class="form-section" style="display:flex;gap:var(--space-sm);">
            <div style="flex:1;">
              <span class="form-label">⏰ 时间</span>
              <input type="time" class="form-input" id="task-time" value="${current.time}">
            </div>
            <div style="flex:1;">
              <span class="form-label">🎨 标签颜色</span>
              <div class="color-picker" id="color-picker" style="padding-top:6px;">
                ${colorPickerHTML()}
              </div>
            </div>
          </div>

          <div class="form-section">
            <span class="form-label">📝 标题</span>
            <input type="text" class="form-input" id="task-title" placeholder="标题（可选）" value="${escapeHtml(current.title)}">
          </div>

          <div id="detail-fields-container">
            ${fieldsHTML()}
          </div>
        `}

        <div style="display:flex;gap:var(--space-sm);margin-top:var(--space-md);">
          <button id="btn-cancel-task" style="flex:1;padding:var(--space-md);border-radius:var(--radius-sm);background:rgba(0,0,0,0.04);font-weight:600;color:var(--color-text-light);">取消</button>
          <button id="btn-save-batch" style="flex:2;padding:var(--space-md);border-radius:var(--radius-sm);background:var(--color-primary);color:#FFF;font-weight:600;${batchItems.length === 0 ? 'display:none' : ''}">保存全部（${batchItems.length} 项）</button>
        </div>
      `;

      // 重新绑定所有事件
      bindBatchEvents();
    }

    function bindBatchEvents() {
      // 点击 chip 切换活跃项
      document.querySelectorAll('.batch-chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
          if (e.target.closest('.batch-chip-remove')) return;
          const idx = parseInt(chip.getAttribute('data-index'));
          if (idx === activeIndex) return;
          // 保存当前编辑状态到当前活跃项
          saveCurrentToActive();
          activeIndex = idx;
          // 更新 selectedIcon/selectedColor 以匹配新活跃项
          const item = batchItems[activeIndex];
          selectedIcon = item.icon;
          selectedColor = item.color;
          renderBatchUI();
        });
      });

      // 点击 × 删除项
      document.querySelectorAll('.batch-chip-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const idx = parseInt(btn.getAttribute('data-index'));
          batchItems.splice(idx, 1);
          if (activeIndex >= batchItems.length) activeIndex = Math.max(0, batchItems.length - 1);
          if (batchItems.length > 0) {
            selectedIcon = batchItems[activeIndex].icon;
            selectedColor = batchItems[activeIndex].color;
          }
          renderBatchUI();
        });
      });

      // "添加动作" 按钮
      const addBtn = document.getElementById('btn-add-another');
      if (addBtn) {
        addBtn.addEventListener('click', () => {
          saveCurrentToActive();
          // 使用当前编辑区的值作为新项的默认值
          const now = new Date();
          const t = String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');
          batchItems.push({
            icon: selectedIcon,
            color: selectedColor,
            time: t,
            title: IconsModule.getName(selectedIcon),
            details: {}
          });
          activeIndex = batchItems.length - 1;
          renderBatchUI();
        });
      }

      // 图标选择器
      document.querySelectorAll('.icon-picker-item').forEach(item => {
        item.addEventListener('click', () => {
          selectedIcon = item.getAttribute('data-icon');
          batchItems[activeIndex].icon = selectedIcon;
          if (!document.getElementById('task-title').value.trim() ||
              IconsModule.getAll().map(i => i.name).includes(document.getElementById('task-title').value.trim())) {
            batchItems[activeIndex].title = IconsModule.getName(selectedIcon);
          }
          renderBatchUI();
        });
      });

      // 颜色选择器
      document.querySelectorAll('.color-dot').forEach(dot => {
        dot.addEventListener('click', () => {
          selectedColor = dot.getAttribute('data-color');
          batchItems[activeIndex].color = selectedColor;
          renderBatchUI();
        });
      });

      // 取消
      const cancelBtn = document.getElementById('btn-cancel-task');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
          overlay.classList.remove('show');
        });
      }

      // 批量保存
      const saveBtn = document.getElementById('btn-save-batch');
      if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
          saveCurrentToActive();
          if (batchItems.length === 0) {
            alert('请至少添加一个动作');
            return;
          }
          try {
            for (const item of batchItems) {
              await DB.tasks.add({
                date: defaultDate,
                time: item.time,
                title: item.title || IconsModule.getName(item.icon),
                icon: item.icon,
                color: item.color,
                details: Object.keys(item.details).length > 0 ? item.details : undefined,
              });
            }
            overlay.classList.remove('show');
            loadDayDetail(defaultDate);
            renderGrid();
          } catch (err) {
            console.error('批量保存失败:', err);
            alert('保存失败，请重试。\n错误：' + (err.message || '未知错误'));
          }
        });
      }
    }

    /** 将当前 DOM 表单值写回 batchItems[activeIndex] */
    function saveCurrentToActive() {
      if (batchItems.length === 0 || activeIndex < 0) return;
      const titleEl = document.getElementById('task-title');
      const timeEl = document.getElementById('task-time');
      if (titleEl) batchItems[activeIndex].title = titleEl.value.trim();
      if (timeEl) batchItems[activeIndex].time = timeEl.value || getCurrentTime();
      batchItems[activeIndex].icon = selectedIcon;
      batchItems[activeIndex].color = selectedColor;
      // 保存详情字段
      const fields = IconsModule.getFormFields(selectedIcon);
      const details = {};
      fields.forEach(f => {
        const input = document.getElementById(`field-${f}`);
        if (input && input.value) {
          details[f] = f === 'speed' ? parseFloat(input.value) : Number(input.value);
        }
      });
      batchItems[activeIndex].details = details;
    }

    overlay.classList.add('show');
    renderBatchUI();
  }

  // HTML 转义工具
  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ---------- 切换月份 ----------
  async function changeMonth(delta) {
    currentMonth += delta;
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }

    $monthLabel.textContent = `${currentYear}年 ${currentMonth + 1}月`;

    // 切换月份后清除选中
    selectedDate = null;
    await renderGrid();
    $detailDate.textContent = '选择日期查看计划';
    $detailTasks.innerHTML = '';
  }

  // ---------- 渲染入口 ----------
  async function render() {
    const now = new Date();
    currentYear = now.getFullYear();
    currentMonth = now.getMonth();
    $monthLabel.textContent = `${currentYear}年 ${currentMonth + 1}月`;

    await renderGrid();
  }

  // ---------- 事件绑定 ----------
  function bindEvents() {
    $prevBtn.addEventListener('click', () => changeMonth(-1));
    $nextBtn.addEventListener('click', () => changeMonth(1));

    // 添加计划按钮 → 弹出添加任务弹窗
    document.getElementById('btn-add-task').addEventListener('click', () => {
      showAddForm();
    });

    // 记账按钮（日历详情区） → 弹出记账弹窗
    const btnExpenseCal = document.getElementById('btn-add-expense-cal');
    if (btnExpenseCal && typeof BudgetModule !== 'undefined') {
      btnExpenseCal.addEventListener('click', () => {
        BudgetModule.showAddForm();
      });
    }
  }

  // ---------- 公开 API ----------
  return {
    render,
    bindEvents,
    selectDate,
    showAddForm,
    buildSummary,
    getSelectedDate: () => selectedDate,
  };
})();
