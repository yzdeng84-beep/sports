/* ==========================================
   健身计划 App — 板块③：纪念日倒计时
   卡片列表 + 详情页（含农历 + 本岁进度环） + CRUD 弹窗
   全局对象: CountdownModule
   ========================================== */

const CountdownModule = (() => {
  'use strict';

  // ---------- 预设 Emoji ----------
  const EMOJI_OPTIONS = [
    '💝', '🎂', '💍', '🎄', '🎃', '🎉', '💒', '🎓',
    '🏠', '✈️', '🌺', '🌟', '💖', '🔥', '🎯', '💪',
    '📅', '🏖️', '🎵', '🐣', '🍰', '💎', '🌈', '🦋',
    '🎁', '🥂', '🌙', '☀️', '⭐', '💫',
  ];

  // ---------- DOM 缓存 ----------
  const $list   = document.getElementById('countdown-list');
  const $btnAdd = document.getElementById('btn-add-countdown');

  // ---------- 工具函数 ----------
  function getToday() {
    const now = new Date();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${now.getFullYear()}-${m}-${d}`;
  }

  /** 计算目标日期距今的天数（正数=未来，0=今天，负数=过去） */
  function daysBetween(dateStr) {
    const today = new Date(getToday() + 'T00:00:00');
    const target = new Date(dateStr + 'T00:00:00');
    return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  }

  /**
   * 计算有效倒计时天数
   * - 每年重复：自动计算到下一个未来的该月日
   * - 非重复：直接计算
   */
  function getCountdownDays(item) {
    const today = getToday();
    const [y, m, d] = item.targetDate.split('-').map(Number);

    if (item.isAnnual) {
      // 每年重复：找到下一个未来的该月日
      const todayDate = new Date(today + 'T00:00:00');
      let nextDate = new Date(todayDate.getFullYear(), m - 1, d);
      if (nextDate <= todayDate) {
        nextDate = new Date(todayDate.getFullYear() + 1, m - 1, d);
      }
      const nextStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`;
      // 计算本岁进度
      const lastDate = new Date(nextDate.getFullYear() - 1, m - 1, d);
      const totalDays = Math.ceil((nextDate - lastDate) / (1000 * 60 * 60 * 24));
      const elapsed = Math.ceil((todayDate - lastDate) / (1000 * 60 * 60 * 24));
      const progress = Math.max(0, Math.min(1, elapsed / totalDays));
      return {
        days: daysBetween(nextStr),
        targetDate: nextStr,
        isPast: false,
        progress,
        totalDays,
        elapsed,
        lastOccurrence: `${lastDate.getFullYear()}-${String(lastDate.getMonth() + 1).padStart(2, '0')}-${String(lastDate.getDate()).padStart(2, '0')}`,
      };
    }

    const days = daysBetween(item.targetDate);
    return { days, targetDate: item.targetDate, isPast: days < 0, progress: null };
  }

  /** 获取星期名称 */
  function getWeekDay(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    const names = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    return names[d.getDay()];
  }

  /** 格式化日期为中文 */
  function formatDateCN(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return `${y}年${m}月${d}日`;
  }

  /** 格式化记录时间戳为 "MM-DD HH:mm" */
  function formatRecordTime(ts) {
    const d = new Date(ts);
    const M = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const HH = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${M}-${dd} ${HH}:${mm}`;
  }

  /** 渲染纪念日记录列表 HTML */
  function renderRecordsHTML(records) {
    if (!records || records.length === 0) {
      return '<div class="cd-records-empty">暂无记录，写下第一条吧 ✍️</div>';
    }
    return records
      .sort((a, b) => b.createdAt - a.createdAt)
      .map(r => `
        <div class="cd-record-item" data-record-id="${r.id}">
          <div class="cd-record-body">
            <div class="cd-record-text">${escapeHtml(r.text)}</div>
            <div class="cd-record-time">${formatRecordTime(r.createdAt)}</div>
          </div>
          <button class="cd-record-delete" data-record-id="${r.id}" title="删除">×</button>
        </div>
      `).join('');
  }

  // ---------- 渲染列表 ----------
  async function render() {
    if (!$list) return;

    try {
      const items = await DB.countdowns.getAll();

      if (items.length === 0) {
        $list.innerHTML = `
          <div class="empty-state">
            <span class="empty-icon">💝</span>
            <p>还没有纪念日</p>
            <p class="empty-hint">点击下方按钮添加你的第一个纪念日吧</p>
          </div>`;
        return;
      }

      // 计算每个纪念日的倒计时天数并排序
      const enriched = items.map(item => {
        const cd = getCountdownDays(item);
        return { ...item, ...cd };
      });

      // 排序：未来的排前面（按天数升序），过去的放后面（按天数降序）
      enriched.sort((a, b) => {
        if (a.isPast && !b.isPast) return 1;
        if (!a.isPast && b.isPast) return -1;
        if (a.isPast && b.isPast) return b.days - a.days;
        return a.days - b.days;
      });

      $list.innerHTML = enriched.map(item => {
        const pastClass = item.isPast ? ' past' : '';
        const dayLabel = item.isPast ? '已过' : '还有';
        const absDays = Math.abs(item.days);

        const annualBadge = item.isAnnual
          ? `<span class="countdown-annual-badge">每年</span>`
          : '';

        return `
        <div class="countdown-card" data-id="${item.id}">
          <div class="countdown-emoji">${item.emoji || '💝'}</div>
          <div class="countdown-info">
            <div class="countdown-name">${escapeHtml(item.name)}${annualBadge}</div>
            <div class="countdown-date">📅 ${item.targetDate}</div>
          </div>
          <div class="countdown-days${pastClass}">
            <span class="countdown-days-num">${absDays}</span>
            <span class="countdown-days-label">${dayLabel} 天</span>
          </div>
          <div class="countdown-actions">
            <button class="btn-countdown-edit" data-action="edit" data-id="${item.id}" title="编辑">✎</button>
            <button class="btn-countdown-delete" data-action="delete" data-id="${item.id}" title="删除">×</button>
          </div>
        </div>`;
      }).join('');

      // 绑定卡片事件
      bindCardEvents(items);
    } catch (err) {
      console.error('纪念日列表加载失败:', err);
      $list.innerHTML = `<p style="text-align:center;color:var(--color-danger);padding:20px;">加载失败，请刷新重试</p>`;
    }
  }

  /** 绑定卡片上的编辑/删除按钮 */
  function bindCardEvents(items) {
    // 编辑按钮 → 直接打开编辑表单
    $list.querySelectorAll('[data-action="edit"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const item = items.find(i => i.id === id);
        if (item) showForm(item);
      });
    });

    // 删除按钮
    $list.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const item = items.find(i => i.id === id);
        if (item && confirm(`确定删除纪念日"${item.name}"吗？`)) {
          await DB.countdowns.remove(id);
          render();
        }
      });
    });

    // 点击卡片 → 打开详情页
    $list.querySelectorAll('.countdown-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        const item = items.find(i => i.id === id);
        if (item) showDetail(item);
      });
    });
  }

  // ========== 纪念日详情页 ==========
  function showDetail(item) {
    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    const cd = getCountdownDays(item);
    const absDays = Math.abs(cd.days);
    const dayLabel = cd.isPast ? '已过' : '还有';
    const targetDateStr = cd.targetDate;

    // 公历格式化
    const solarFormatted = formatDateCN(targetDateStr);
    const weekDay = getWeekDay(targetDateStr);

    // 农历
    let lunarText = '';
    try {
      if (typeof LunarModule !== 'undefined') {
        const lunar = LunarModule.solarToLunar(targetDateStr);
        lunarText = `${lunar.yearName} ${lunar.monthName}${lunar.dayName}`;
      }
    } catch (e) {
      lunarText = '';
    }

    // 本岁进度环（仅每年重复 + 未来事件）
    const showProgress = item.isAnnual && !cd.isPast && cd.progress !== null;
    let progressRingHTML = '';
    if (showProgress) {
      const pct = Math.round(cd.progress * 100);
      const ringR = 54;
      const circumference = 2 * Math.PI * ringR;
      const dashOffset = circumference * (1 - cd.progress);

      progressRingHTML = `
        <div class="cd-progress-section">
          <div class="cd-progress-label">📊 本岁进度</div>
          <div class="cd-progress-ring-wrap">
            <svg class="cd-progress-svg" viewBox="0 0 140 140">
              <!-- 轨道环 -->
              <circle cx="70" cy="70" r="${ringR}" fill="none"
                stroke="#E8E5E2" stroke-width="10" stroke-linecap="round"/>
              <!-- 进度弧 -->
              <circle cx="70" cy="70" r="${ringR}" fill="none"
                stroke="url(#cd-progress-grad)" stroke-width="10"
                stroke-linecap="round"
                stroke-dasharray="${circumference.toFixed(1)}"
                stroke-dashoffset="${dashOffset.toFixed(1)}"
                transform="rotate(-90 70 70)"
                style="transition: stroke-dashoffset 1s ease;"/>
              <defs>
                <linearGradient id="cd-progress-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#6B9FD4"/>
                  <stop offset="100%" stop-color="#86BDA0"/>
                </linearGradient>
              </defs>
              <!-- 中心文字 -->
              <text x="70" y="66" text-anchor="middle" font-size="24" font-weight="700"
                fill="var(--color-primary-dark)" font-family="inherit">${pct}%</text>
              <text x="70" y="86" text-anchor="middle" font-size="11"
                fill="#8B8B8B" font-family="inherit">已过 ${cd.elapsed}/${cd.totalDays} 天</text>
            </svg>
            <span class="cd-progress-hint">从 ${cd.lastOccurrence} 起</span>
          </div>
        </div>
      `;
    }

    const annualBadge = item.isAnnual
      ? '<span class="cd-detail-annual-badge">🔄 每年重复</span>'
      : '';

    content.innerHTML = `
      <div class="cd-detail">
        <!-- 关闭按钮 -->
        <button class="cd-detail-close" id="cd-detail-close">✕</button>

        <!-- Emoji & 名称 -->
        <div class="cd-detail-header">
          <span class="cd-detail-emoji">${item.emoji || '💝'}</span>
          <h2 class="cd-detail-name">${escapeHtml(item.name)}${annualBadge}</h2>
        </div>

        <!-- 大号天数 -->
        <div class="cd-detail-days-block">
          <span class="cd-detail-days-num">${absDays}</span>
          <span class="cd-detail-days-unit">天</span>
        </div>

        <!-- 距离日期还有... -->
        <p class="cd-detail-distance">
          距离 <strong>${targetDateStr}</strong> ${dayLabel} <strong>${absDays}</strong> 天
        </p>

        <!-- 日期信息卡片 -->
        <div class="cd-detail-date-card">
          <div class="cd-detail-date-row">
            <span class="cd-detail-date-icon">📅</span>
            <span class="cd-detail-date-label">公历</span>
            <span class="cd-detail-date-value">${solarFormatted} ${weekDay}</span>
          </div>
          ${lunarText ? `
          <div class="cd-detail-date-row">
            <span class="cd-detail-date-icon">🌙</span>
            <span class="cd-detail-date-label">农历</span>
            <span class="cd-detail-date-value">${lunarText}</span>
          </div>
          ` : ''}
        </div>

        <!-- 本岁进度环 -->
        ${progressRingHTML}

        <!-- 记录区域 -->
        <div class="cd-records-section">
          <div class="cd-records-title">📝 记录</div>
          <div class="cd-records-list" id="cd-records-list">
            ${renderRecordsHTML(item.records)}
          </div>
          <div class="cd-record-input-wrap">
            <input type="text" class="cd-record-input" id="cd-record-input"
                   placeholder="写一条记录...">
            <button class="cd-record-save" id="cd-record-save">保存</button>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="cd-detail-actions">
          <button class="cd-detail-btn-edit" id="cd-detail-edit">✏️ 编辑</button>
          <button class="cd-detail-btn-delete" id="cd-detail-delete">🗑 删除</button>
          <button class="cd-detail-btn-close" id="cd-detail-close-btn">关闭</button>
        </div>
      </div>
    `;

    overlay.classList.add('show');

    // 关闭事件
    const closeDetail = () => overlay.classList.remove('show');
    document.getElementById('cd-detail-close').addEventListener('click', closeDetail);
    document.getElementById('cd-detail-close-btn').addEventListener('click', closeDetail);

    // 编辑按钮
    document.getElementById('cd-detail-edit').addEventListener('click', () => {
      // 关闭详情后打开编辑表单
      showForm(item);
    });

    // 删除按钮
    document.getElementById('cd-detail-delete').addEventListener('click', async () => {
      if (confirm(`确定删除纪念日"${item.name}"吗？`)) {
        await DB.countdowns.remove(item.id);
        overlay.classList.remove('show');
        render();
      }
    });

    // ---------- 记录功能 ----------
    // 保存记录
    document.getElementById('cd-record-save').addEventListener('click', async () => {
      const input = document.getElementById('cd-record-input');
      const text = input.value.trim();
      if (!text) return;

      const records = Array.isArray(item.records) ? [...item.records] : [];
      records.push({
        id: DB.generateId(),
        text,
        createdAt: Date.now(),
      });

      await DB.countdowns.update({
        ...item,
        records,
      });
      item.records = records; // 同步更新本地引用

      // 刷新记录列表
      const recordsList = document.getElementById('cd-records-list');
      if (recordsList) {
        recordsList.innerHTML = renderRecordsHTML(records);
        bindRecordDeleteEvents(item);
      }
      input.value = '';
      input.focus();
    });

    // 回车键快速保存
    document.getElementById('cd-record-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('cd-record-save').click();
      }
    });

    // 绑定已有记录的删除事件
    bindRecordDeleteEvents(item);

    // 保存按钮 → 同步最新 records 到 item
  }

  /** 绑定记录删除按钮事件 */
  function bindRecordDeleteEvents(item) {
    document.querySelectorAll('.cd-record-delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const recordId = btn.getAttribute('data-record-id');
        if (!confirm('确定删除这条记录吗？')) return;

        const records = (item.records || []).filter(r => r.id !== recordId);
        await DB.countdowns.update({ ...item, records });
        item.records = records; // 同步本地引用

        // 刷新记录列表
        const recordsList = document.getElementById('cd-records-list');
        if (recordsList) {
          recordsList.innerHTML = renderRecordsHTML(records);
          bindRecordDeleteEvents(item);
        }
      });
    });
  }

  // ---------- 添加/编辑弹窗 ----------
  function showForm(item) {
    const isEdit = !!item;
    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');

    let selectedEmoji = item ? item.emoji : '💝';
    let isAnnual = item ? !!item.isAnnual : false;

    const defaultName = item ? item.name : '';
    const defaultDate = item ? item.targetDate : '';

    function emojiPickerHTML() {
      return EMOJI_OPTIONS.map(e => `
        <span class="emoji-option ${e === selectedEmoji ? 'selected' : ''}"
              data-emoji="${e}">${e}</span>
      `).join('');
    }

    content.innerHTML = `
      <h3 style="margin-bottom:16px;color:var(--color-primary-dark);font-weight:600;">
        ${isEdit ? '✏️ 编辑纪念日' : '💝 添加纪念日'}
      </h3>

      <div class="form-section">
        <span class="form-label">📌 名称</span>
        <input type="text" class="form-input" id="cd-name" placeholder="例如：恋爱纪念日" value="${escapeHtml(defaultName)}">
      </div>

      <div class="form-section">
        <span class="form-label">📅 目标日期</span>
        <input type="date" class="form-input" id="cd-date" value="${defaultDate}">
      </div>

      <div class="form-section">
        <span class="form-label">🎨 选择图标</span>
        <div class="emoji-picker-grid" id="emoji-picker-grid">
          ${emojiPickerHTML()}
        </div>
      </div>

      <div class="form-section" style="display:flex;align-items:center;gap:var(--space-sm);">
        <span class="form-label" style="margin:0;">🔄 每年重复</span>
        <label style="position:relative;width:48px;height:26px;display:inline-block;cursor:pointer;">
          <input type="checkbox" id="cd-annual" style="opacity:0;width:0;height:0;"
            ${isAnnual ? 'checked' : ''}>
          <span style="position:absolute;inset:0;background:${isAnnual ? '#86BDA0' : '#DCD8D4'};border-radius:26px;transition:0.3s;"></span>
          <span style="position:absolute;top:2px;left:${isAnnual ? '24px' : '2px'};width:22px;height:22px;background:#FFF;border-radius:50%;transition:0.3s;box-shadow:0 1px 3px rgba(0,0,0,0.15);"></span>
        </label>
      </div>

      <div style="display:flex;gap:var(--space-sm);margin-top:var(--space-md);">
        ${isEdit ? `<button id="btn-delete-cd" style="flex:1;padding:var(--space-md);border-radius:var(--radius-sm);background:rgba(212,134,134,0.15);color:var(--color-danger);font-weight:600;">删除</button>` : ''}
        <button id="btn-cancel-cd" style="flex:1;padding:var(--space-md);border-radius:var(--radius-sm);background:rgba(0,0,0,0.04);font-weight:600;color:var(--color-text-light);">取消</button>
        <button id="btn-save-cd" style="flex:2;padding:var(--space-md);border-radius:var(--radius-sm);background:var(--color-primary);color:#FFF;font-weight:600;">${isEdit ? '保存修改' : '添加纪念日'}</button>
      </div>
    `;

    overlay.classList.add('show');

    // 绑定 emoji 选择
    document.querySelectorAll('.emoji-option').forEach(el => {
      el.addEventListener('click', () => {
        selectedEmoji = el.getAttribute('data-emoji');
        document.querySelectorAll('.emoji-option').forEach(e => e.classList.remove('selected'));
        el.classList.add('selected');
      });
    });

    // 每年重复开关
    const annualCheckbox = document.getElementById('cd-annual');
    if (annualCheckbox) {
      annualCheckbox.addEventListener('change', () => {
        isAnnual = annualCheckbox.checked;
        const slider = annualCheckbox.nextElementSibling;
        const knob = slider.nextElementSibling;
        slider.style.background = isAnnual ? '#86BDA0' : '#DCD8D4';
        knob.style.left = isAnnual ? '24px' : '2px';
      });
    }

    // 取消
    document.getElementById('btn-cancel-cd').addEventListener('click', () => {
      overlay.classList.remove('show');
    });

    // 删除（仅编辑模式）
    const btnDelete = document.getElementById('btn-delete-cd');
    if (btnDelete && item) {
      btnDelete.addEventListener('click', async () => {
        if (confirm(`确定删除纪念日"${item.name}"吗？`)) {
          await DB.countdowns.remove(item.id);
          overlay.classList.remove('show');
          render();
        }
      });
    }

    // 保存
    document.getElementById('btn-save-cd').addEventListener('click', async () => {
      const name = document.getElementById('cd-name').value.trim();
      const date = document.getElementById('cd-date').value;

      if (!name) { alert('请输入纪念日名称'); return; }
      if (!date) { alert('请选择目标日期'); return; }

      try {
        if (isEdit) {
          await DB.countdowns.update({
            id: item.id,
            name,
            targetDate: date,
            emoji: selectedEmoji,
            isAnnual,
            createdAt: item.createdAt,
          });
        } else {
          await DB.countdowns.add({
            name,
            targetDate: date,
            emoji: selectedEmoji,
            isAnnual,
          });
        }
        overlay.classList.remove('show');
        render();
      } catch (err) {
        console.error('纪念日保存失败:', err);
        alert('保存失败，请重试。\n错误：' + (err.message || '未知错误'));
      }
    });
  }

  // HTML 转义
  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ---------- 事件绑定 ----------
  function bindEvents() {
    if ($btnAdd) {
      $btnAdd.addEventListener('click', () => {
        showForm(null);
      });
    }
  }

  // ---------- 公开 API ----------
  return {
    render,
    bindEvents,
  };
})();
