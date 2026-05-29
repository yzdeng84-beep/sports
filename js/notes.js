/* ==========================================
   健身计划 App — 板块②：心得记录
   卡片列表 + 新建/编辑弹窗 + 搜索
   全局对象: NotesModule
   ========================================== */

const NotesModule = (() => {
  'use strict';

  // ---------- 心情选项 ----------
  const moodOptions = [
    { emoji: '😊', label: '开心' },
    { emoji: '😄', label: '超棒' },
    { emoji: '😌', label: '平静' },
    { emoji: '🤔', label: '思考' },
    { emoji: '😤', label: '疲惫' },
    { emoji: '😢', label: '低落' },
    { emoji: '💪', label: '励志' },
    { emoji: '🔥', label: '燃' },
    { emoji: '🧘', label: '放松' },
    { emoji: '😴', label: '困倦' },
  ];

  // ---------- DOM 缓存 ----------
  const $list = document.getElementById('notes-list');
  const $searchInput = document.getElementById('notes-search-input');
  const $addBtn = document.getElementById('btn-add-note');

  // ---------- 工具函数 ----------
  function getToday() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ---------- 渲染笔记列表 ----------
  // filterKeyword: 搜索关键词（可选），传入时执行过滤
  async function render(filterKeyword) {
    const notes = await DB.notes.getAll();
    notes.sort((a, b) => b.createdAt - a.createdAt);

    // 搜索过滤
    let filtered = notes;
    if (filterKeyword) {
      const kw = filterKeyword.toLowerCase();
      filtered = notes.filter(n =>
        n.title.toLowerCase().includes(kw) ||
        n.content.toLowerCase().includes(kw)
      );
    }

    if (filtered.length === 0) {
      $list.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">📝</span>
          <p>${filterKeyword ? '没有匹配的心得' : '还没有心得记录'}</p>
          <p class="empty-hint">${filterKeyword ? '换个关键词试试吧' : '点击下方按钮写下你的第一条心得吧'}</p>
        </div>`;
      return;
    }

    $list.innerHTML = filtered.map(n => `
      <div class="note-card" data-id="${n.id}">
        <div class="note-header">
          <span class="note-date">${n.date}</span>
          <span class="note-mood">${n.mood || '😊'}</span>
        </div>
        <h3 class="note-title">${escapeHtml(n.title)}</h3>
        <p class="note-preview">${escapeHtml(n.content).substring(0, 80)}${n.content.length > 80 ? '...' : ''}</p>
        <div class="note-actions">
          <button class="btn-note-edit" data-id="${n.id}">编辑</button>
          <button class="btn-note-delete" data-id="${n.id}">删除</button>
        </div>
      </div>
    `).join('');

    bindCardEvents();
  }

  // ---------- 绑定卡片事件（编辑 / 删除） ----------
  function bindCardEvents() {
    // 编辑按钮 → 打开编辑弹窗
    $list.querySelectorAll('.btn-note-edit').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const note = await DB.notes.getById(id);
        if (note) showNoteForm(note);
      });
    });

    // 删除按钮 → 确认后删除
    $list.querySelectorAll('.btn-note-delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (confirm('确定删除这条心得吗？')) {
          await DB.notes.remove(id);
          render();
        }
      });
    });
  }

  // ---------- 搜索过滤（300ms 防抖） ----------
  let searchTimer = null;
  function bindSearch() {
    $searchInput.addEventListener('input', () => {
      clearTimeout(searchTimer);
      const keyword = $searchInput.value.trim();
      searchTimer = setTimeout(() => {
        render(keyword || undefined);
      }, 300);
    });
  }

  // ---------- 弹出笔记表单弹窗（新建 / 编辑） ----------
  // note: 编辑模式传入已有笔记数据；新建模式不传
  function showNoteForm(note) {
    const isEdit = !!note;
    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');

    // 预设值（编辑模式从已有数据填充）
    const defaultDate = note ? note.date : getToday();
    const defaultMood = note ? note.mood : '😊';
    const defaultTitle = note ? note.title : '';
    const defaultContent = note ? note.content : '';

    // 当前选中的心情（动态更新）
    let selectedMood = defaultMood;

    // 渲染心情选择器 HTML
    function moodPickerHTML() {
      return moodOptions.map(m => `
        <span class="mood-dot ${m.emoji === selectedMood ? 'selected' : ''}"
              data-mood="${m.emoji}" title="${m.label}">${m.emoji}</span>
      `).join('');
    }

    // 构建弹窗内容
    content.innerHTML = `
      <h3 style="margin-bottom:16px;color:var(--color-primary-dark);font-weight:600;">
        ${isEdit ? '✏️ 编辑心得' : '📝 写心得'}
      </h3>

      <div class="form-section" style="display:flex;gap:var(--space-sm);">
        <div style="flex:1;">
          <span class="form-label">📅 日期</span>
          <input type="date" class="form-input" id="note-date" value="${defaultDate}">
        </div>
        <div style="flex:1;">
          <span class="form-label">😊 心情</span>
          <div class="mood-picker" id="mood-picker">
            ${moodPickerHTML()}
          </div>
        </div>
      </div>

      <div class="form-section">
        <span class="form-label">📌 标题</span>
        <input type="text" class="form-input" id="note-title"
               placeholder="标题（可选）"
               value="${escapeHtml(defaultTitle)}">
      </div>

      <div class="form-section">
        <span class="form-label">📝 正文</span>
        <textarea class="form-input form-textarea" id="note-content"
                  placeholder="记录今天的训练感受..."
                  rows="6">${escapeHtml(defaultContent)}</textarea>
      </div>

      <div style="display:flex;gap:var(--space-sm);margin-top:var(--space-md);">
        <button id="btn-cancel-note"
                style="flex:1;padding:var(--space-md);border-radius:var(--radius-sm);background:rgba(0,0,0,0.04);font-weight:600;color:var(--color-text-light);">
          取消
        </button>
        <button id="btn-save-note"
                style="flex:1;padding:var(--space-md);border-radius:var(--radius-sm);background:var(--color-primary);color:#FFF;font-weight:600;">
          保存
        </button>
      </div>
    `;

    overlay.classList.add('show');

    // 刷新心情选择器状态（更新选中高亮）
    function refreshMoodPicker() {
      const picker = document.getElementById('mood-picker');
      if (picker) picker.innerHTML = moodPickerHTML();
      // 重新绑定点击事件
      document.querySelectorAll('.mood-dot').forEach(dot => {
        dot.addEventListener('click', () => {
          selectedMood = dot.getAttribute('data-mood');
          refreshMoodPicker();
        });
      });
    }

    // 初次绑定（setTimeout 确保 DOM 已渲染）
    setTimeout(() => refreshMoodPicker(), 0);

    // 取消按钮
    document.getElementById('btn-cancel-note').addEventListener('click', () => {
      overlay.classList.remove('show');
    });

    // 保存按钮
    document.getElementById('btn-save-note').addEventListener('click', async () => {
      const title = document.getElementById('note-title').value.trim();
      const contentVal = document.getElementById('note-content').value.trim();
      const date = document.getElementById('note-date').value || getToday();

      // 校验（标题可选）
      if (!contentVal) {
        alert('请输入心得正文');
        return;
      }

      if (isEdit) {
        // 编辑模式：更新已有记录
        await DB.notes.update({
          id: note.id,
          date,
          title,
          content: contentVal,
          mood: selectedMood,
          createdAt: note.createdAt,  // 保留原始创建时间
        });
      } else {
        // 新建模式：添加新记录
        await DB.notes.add({
          date,
          title,
          content: contentVal,
          mood: selectedMood,
        });
      }

      overlay.classList.remove('show');
      render(); // 刷新列表
    });
  }

  // ---------- 事件绑定 ----------
  function bindEvents() {
    // 新建心得按钮 → 打开空表单
    $addBtn.addEventListener('click', () => showNoteForm());
    // 绑定搜索框输入事件
    bindSearch();
  }

  // ---------- 公开 API ----------
  return {
    render,
    bindEvents,
  };
})();
