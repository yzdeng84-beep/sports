/* ==========================================
   健身计划 App — 记账模块（板块③子视图）
   收支记录、分类、日统计
   全局对象: BudgetModule
   ========================================== */

const BudgetModule = (() => {
  'use strict';

  // ---------- 记账分类 ----------
  const BUILT_IN_CATEGORIES = [
    { id: 'food',          name: '餐饮', emoji: '🍜', type: 'expense' },
    { id: 'transport',     name: '交通', emoji: '🚗', type: 'expense' },
    { id: 'shopping',      name: '购物', emoji: '🛍️', type: 'expense' },
    { id: 'fitness',       name: '健身', emoji: '💪', type: 'expense' },
    { id: 'entertainment', name: '娱乐', emoji: '🎮', type: 'expense' },
    { id: 'food_drink',    name: '饮食', emoji: '☕', type: 'expense' },
    { id: 'other_expense', name: '其他', emoji: '📌', type: 'expense' },
    { id: 'salary',        name: '工资', emoji: '💼', type: 'income' },
    { id: 'bonus',         name: '奖金', emoji: '🎁', type: 'income' },
    { id: 'other_income',  name: '其他收入', emoji: '💰', type: 'income' },
  ];

  // ---------- 自定义分类（localStorage 存储）----------
  const CUSTOM_CAT_KEY = 'cadence-custom-categories';

  function loadCustomCategories() {
    try {
      const raw = localStorage.getItem(CUSTOM_CAT_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function saveCustomCategories(list) {
    try {
      localStorage.setItem(CUSTOM_CAT_KEY, JSON.stringify(list));
    } catch (e) {
      alert('保存分类失败：存储空间已满。请删除一些自定义分类后再试。');
    }
  }

  /** 合并内置 + 自定义分类 */
  function getAllCategories() {
    return [...BUILT_IN_CATEGORIES, ...loadCustomCategories()];
  }

  // ---------- DOM 缓存 ----------
  const $list = document.getElementById('budget-list');
  const $incomeTotal = document.getElementById('budget-income-total');
  const $expenseTotal = document.getElementById('budget-expense-total');
  const $addBtn = document.getElementById('btn-add-expense');
  const $searchInput = document.getElementById('budget-search-input');

  // ---------- 工具函数 ----------
  function getToday() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function formatMoney(amount) {
    return '¥' + Number(amount).toFixed(2);
  }

  /** 获取当前选中的日期（优先从 Timeline 模块取） */
  function getSelectedDate() {
    if (typeof TimelineModule !== 'undefined' && TimelineModule.getSelectedDate()) {
      return TimelineModule.getSelectedDate();
    }
    return getToday();
  }

  // ---------- 渲染记账列表 ----------
  async function render() {
    // 清空搜索框（日期切换后恢复按日期视图）
    if ($searchInput) $searchInput.value = '';
    const date = getSelectedDate();
    console.log('💰 [记账] render() 查询日期:', date);
    const records = await DB.expenses.getByDate(date);
    console.log('💰 [记账] 查询到记录数:', records.length, records);
    records.sort((a, b) => {
      // 先按日期排序（降序：最新在前），再按创建时间
      const dateCmp = (b.date || '').localeCompare(a.date || '');
      if (dateCmp !== 0) return dateCmp;
      return b.createdAt - a.createdAt;
    });

    // 计算汇总
    let incomeTotal = 0, expenseTotal = 0;
    records.forEach(r => {
      if (r.type === 'income') incomeTotal += Number(r.amount);
      else expenseTotal += Number(r.amount);
    });

    $incomeTotal.textContent = formatMoney(incomeTotal);
    $expenseTotal.textContent = formatMoney(expenseTotal);

    // 列表
    if (records.length === 0) {
      $list.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">💰</span>
          <p>今天还没有记账</p>
          <p class="empty-hint">点击下方按钮记录一笔吧</p>
        </div>`;
      return;
    }

    $list.innerHTML = records.map(r => {
      const cat = getAllCategories().find(c => c.id === r.category) || {};
      return `
        <div class="budget-item" data-id="${r.id}">
          <div class="budget-cat-icon ${r.category || 'other'}">
            <span>${cat.emoji || '📌'}</span>
          </div>
          <div class="budget-info">
            <div class="budget-cat-name">${cat.name || r.category}</div>
            ${r.note ? `<div class="budget-note">${escapeHtml(r.note)}</div>` : ''}
          </div>
          <div class="budget-amount ${r.type}">
            ${r.type === 'income' ? '+' : '-'}${formatMoney(r.amount)}
          </div>
          <button class="btn-budget-delete" data-id="${r.id}" title="删除">×</button>
        </div>
      `;
    }).join('');

    // 绑定删除
    $list.querySelectorAll('.btn-budget-delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        if (confirm('确定删除这条记录吗？')) {
          await DB.expenses.remove(id);
          render();
        }
      });
    });

    // 刷新图表
    if (typeof ChartModule !== 'undefined') {
      const canvas = document.getElementById('chart-canvas');
      if (canvas) {
        const activeBtn = document.querySelector('.chart-period-btn.active');
        const period = activeBtn ? activeBtn.getAttribute('data-period') : 'week';
        ChartModule.render(canvas, period);
      }
    }
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ---------- 搜索记账记录（跨全部日期）----------
  async function renderSearchResults(keyword) {
    const allRecords = await DB.expenses.getAll();
    const kw = keyword.toLowerCase();
    const allCats = getAllCategories();

    const filtered = allRecords.filter(r => {
      const cat = allCats.find(c => c.id === r.category) || {};
      return (cat.name || '').toLowerCase().includes(kw) ||
             (r.note || '').toLowerCase().includes(kw) ||
             (r.category || '').toLowerCase().includes(kw);
    });

    // 按创建时间降序（最新在前）
    filtered.sort((a, b) => b.createdAt - a.createdAt);

    // 渲染搜索结果
    if (filtered.length === 0) {
      $list.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">🔍</span>
          <p>没有匹配的记账记录</p>
          <p class="empty-hint">试试其他关键词吧</p>
        </div>`;
      return;
    }

    $list.innerHTML = filtered.map(r => {
      const cat = allCats.find(c => c.id === r.category) || {};
      return `
        <div class="budget-item" data-id="${r.id}">
          <div class="budget-cat-icon ${r.category || 'other'}">
            <span>${cat.emoji || '📌'}</span>
          </div>
          <div class="budget-info">
            <div class="budget-cat-name">${cat.name || r.category}</div>
            ${r.note ? `<div class="budget-note">${escapeHtml(r.note)}</div>` : ''}
            <div style="font-size:var(--font-caption);color:var(--color-text-light);">${r.date}</div>
          </div>
          <div class="budget-amount ${r.type}">
            ${r.type === 'income' ? '+' : '-'}${formatMoney(r.amount)}
          </div>
          <button class="btn-budget-delete" data-id="${r.id}" title="删除">×</button>
        </div>
      `;
    }).join('');

    // 绑定删除事件
    $list.querySelectorAll('.btn-budget-delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        if (confirm('确定删除这条记录吗？')) {
          await DB.expenses.remove(id);
          // 删除后重新搜索
          const kw2 = $searchInput ? $searchInput.value.trim() : '';
          if (kw2) renderSearchResults(kw2);
          else render();
        }
      });
    });
  }

  // ---------- 添加记账记录 ----------
  async function addRecord(data) {
    const record = {
      date: data.date || getToday(),  // 让用户选择记账日期，默认今天
      type: data.type,        // 'income' | 'expense'
      category: data.category,
      amount: parseFloat(data.amount),
      note: data.note || '',
    };
    console.log('💰 [记账] addRecord() 准备写入:', record);
    const result = await DB.expenses.add(record);
    console.log('💰 [记账] DB.expenses.add() 返回:', result);
    await render();
  }

  // ---------- 事件绑定 ----------
  function bindEvents() {
    $addBtn.addEventListener('click', () => {
      showAddForm();
    });

    // 图表周期切换按钮
    document.querySelectorAll('.chart-period-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.chart-period-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const period = btn.getAttribute('data-period');
        const canvas = document.getElementById('chart-canvas');
        if (canvas && typeof ChartModule !== 'undefined') {
          ChartModule.render(canvas, period);
        }
      });
    });

    // 搜索记账记录（防抖300ms，跨全部日期）
    let searchTimer = null;
    $searchInput.addEventListener('input', () => {
      clearTimeout(searchTimer);
      const kw = $searchInput.value.trim();
      searchTimer = setTimeout(() => {
        if (kw) {
          renderSearchResults(kw);
        } else {
          render(); // 清空搜索框 → 恢复按日期筛选
        }
      }, 300);
    });
  }

  // ---------- 管理自定义分类 ----------
  function showCategoryManager() {
    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    const customCats = loadCustomCategories();

    // 常用 emoji 选择器
    const commonEmojis = ['🍜','🚗','🛍️','💪','🎮','☕','📌','💼','🎁','💰',
                          '💊','📚','🏠','💻','🎓','✈️','🎂','🐱','🌿','🎵',
                          '📱','👗','💄','🏥','🛒','🍕','🚌','⚡','🔧','🎯'];

    content.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
        <h3 style="color:var(--color-primary-dark);font-weight:600;">📂 管理自定义分类</h3>
        <button id="btn-back-to-add" style="background:none;border:none;font-size:var(--font-body);color:var(--color-primary);cursor:pointer;font-weight:600;">← 返回记账</button>
      </div>

      <!-- 自定义分类列表 -->
      <div id="custom-cat-list" style="margin-bottom:var(--space-md);max-height:200px;overflow-y:auto;">
        ${customCats.length === 0 ? '<p style="color:var(--color-text-light);text-align:center;padding:var(--space-md);">暂无自定义分类</p>' : ''}
        ${customCats.map(cat => `
          <div class="budget-item" style="margin-bottom:4px;">
            <div class="budget-cat-icon" style="background:rgba(0,0,0,0.04);">
              <span>${cat.emoji || '📌'}</span>
            </div>
            <div class="budget-info">
              <div class="budget-cat-name">${escapeHtml(cat.name)} <span style="font-size:var(--font-caption);color:var(--color-text-light);">${cat.type === 'income' ? '收入' : '支出'}</span></div>
            </div>
            <button class="btn-budget-delete" data-cat-id="${cat.id}" title="删除分类">×</button>
          </div>
        `).join('')}
      </div>

      <!-- 添加新分类 -->
      <div style="border-top:1px solid rgba(0,0,0,0.06);padding-top:var(--space-md);">
        <div style="font-size:var(--font-body);font-weight:600;margin-bottom:var(--space-sm);color:var(--color-text-dark);">➕ 添加分类</div>
        <div style="margin-bottom:var(--space-sm);">
          <label style="font-size:var(--font-caption);color:var(--color-text-light);display:block;margin-bottom:4px;">选择图标</label>
          <div id="emoji-picker-grid" style="display:flex;flex-wrap:wrap;gap:6px;">
            ${commonEmojis.map(e => `<span class="emoji-option" data-emoji="${e}" style="font-size:22px;padding:4px 6px;border-radius:8px;cursor:pointer;border:2px solid transparent;">${e}</span>`).join('')}
          </div>
        </div>
        <div style="display:flex;gap:var(--space-sm);margin-bottom:var(--space-sm);">
          <div style="flex:1;">
            <label style="font-size:var(--font-caption);color:var(--color-text-light);display:block;margin-bottom:4px;">名称</label>
            <input type="text" id="new-cat-name" class="form-input" placeholder="例如：医疗">
          </div>
          <div style="flex:1;">
            <label style="font-size:var(--font-caption);color:var(--color-text-light);display:block;margin-bottom:4px;">类型</label>
            <select id="new-cat-type" class="form-select">
              <option value="expense">支出</option>
              <option value="income">收入</option>
            </select>
          </div>
        </div>
        <button id="btn-add-custom-cat" style="width:100%;padding:var(--space-sm);border-radius:var(--radius-sm);background:var(--color-success);color:#FFF;font-weight:600;">添加此分类</button>
      </div>
    `;

    overlay.classList.add('show');

    // emoji 选择交互
    let selectedEmoji = '📌';
    content.querySelector('#emoji-picker-grid').addEventListener('click', (e) => {
      const opt = e.target.closest('.emoji-option');
      if (!opt) return;
      selectedEmoji = opt.getAttribute('data-emoji');
      content.querySelectorAll('.emoji-option').forEach(el => el.style.borderColor = 'transparent');
      opt.style.borderColor = 'var(--color-primary)';
    });
    // 默认选中第一个
    const firstEmoji = content.querySelector('.emoji-option');
    if (firstEmoji) { firstEmoji.style.borderColor = 'var(--color-primary)'; selectedEmoji = firstEmoji.getAttribute('data-emoji'); }

    // 返回记账表单
    content.querySelector('#btn-back-to-add').addEventListener('click', () => {
      showAddForm();
    });

    // 删除自定义分类
    content.querySelectorAll('.btn-budget-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const catId = btn.getAttribute('data-cat-id');
        const cats = loadCustomCategories().filter(c => c.id !== catId);
        saveCustomCategories(cats);
        showCategoryManager(); // 刷新列表
      });
    });

    // 添加自定义分类
    content.querySelector('#btn-add-custom-cat').addEventListener('click', () => {
      const name = document.getElementById('new-cat-name').value.trim();
      const type = document.getElementById('new-cat-type').value;
      if (!name) { alert('请输入分类名称'); return; }
      const newCat = {
        id: 'custom_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
        name: name,
        emoji: selectedEmoji,
        type: type,
      };
      const cats = loadCustomCategories();
      cats.push(newCat);
      saveCustomCategories(cats);
      showCategoryManager(); // 刷新
    });
  }

  // ---------- 弹出添加表单 ----------
  function showAddForm() {
    const allCats = getAllCategories();
    const expenseCats = allCats.filter(c => c.type === 'expense');
    const incomeCats = allCats.filter(c => c.type === 'income');

    const expenseOptions = expenseCats.map(c =>
      `<option value="${c.id}">${c.emoji} ${c.name}</option>`
    ).join('');
    const incomeOptions = incomeCats.map(c =>
      `<option value="${c.id}">${c.emoji} ${c.name}</option>`
    ).join('');

    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');

    content.innerHTML = `
      <h3 style="margin-bottom:16px;color:var(--color-primary-dark);font-weight:600;">💰 记一笔账</h3>
      <div style="display:flex;gap:var(--space-sm);margin-bottom:var(--space-md);">
        <div style="flex:1;text-align:center;padding:10px;border-radius:var(--radius-sm);cursor:pointer;background:rgba(134,189,160,0.12);font-weight:600;color:var(--color-success);" id="lbl-type-income">
          💚 收入
        </div>
        <div style="flex:1;text-align:center;padding:10px;border-radius:var(--radius-sm);cursor:pointer;background:rgba(212,134,134,0.22);font-weight:700;color:var(--color-danger);" id="lbl-type-expense">
          ❤️ 支出
        </div>
      </div>
      <div style="margin-bottom:var(--space-md);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
          <label style="font-size:var(--font-caption);color:var(--color-text-light);">分类</label>
          <button type="button" id="btn-manage-cats" style="background:none;border:none;font-size:var(--font-caption);color:var(--color-primary);cursor:pointer;padding:0;">📂 管理分类</button>
        </div>
        <select id="expense-category" class="form-select">
          ${expenseOptions}
        </select>
      </div>
      <div style="margin-bottom:var(--space-md);">
        <label style="font-size:var(--font-caption);color:var(--color-text-light);display:block;margin-bottom:4px;">日期</label>
        <input type="date" id="expense-date" class="form-input" value="${getToday()}">
      </div>
      <div style="margin-bottom:var(--space-md);">
        <label style="font-size:var(--font-caption);color:var(--color-text-light);display:block;margin-bottom:4px;">金额</label>
        <input type="number" id="expense-amount" class="form-input" placeholder="0.00" step="0.01" min="0" style="font-size:var(--font-h2);font-weight:700;">
      </div>
      <div style="margin-bottom:var(--space-md);">
        <label style="font-size:var(--font-caption);color:var(--color-text-light);display:block;margin-bottom:4px;">备注（可选）</label>
        <input type="text" id="expense-note" class="form-input" placeholder="例如：午餐外卖">
      </div>
      <div style="display:flex;gap:var(--space-sm);">
        <button id="btn-cancel-expense" style="flex:1;padding:var(--space-md);border-radius:var(--radius-sm);background:rgba(0,0,0,0.04);font-weight:600;color:var(--color-text-light);">取消</button>
        <button id="btn-save-expense" style="flex:1;padding:var(--space-md);border-radius:var(--radius-sm);background:var(--color-primary);color:#FFF;font-weight:600;">保存</button>
      </div>
    `;

    overlay.classList.add('show');

    // "管理分类" 按钮事件
    const btnManageCats = document.getElementById('btn-manage-cats');
    if (btnManageCats) {
      btnManageCats.addEventListener('click', () => {
        showCategoryManager();
      });
    }

    // 类型切换（用 JS 变量代替 hidden radio，避免 :checked 失效）
    let selectedType = 'expense'; // 默认支出

    const incomeLabel = document.getElementById('lbl-type-income');
    const expenseLabel = document.getElementById('lbl-type-expense');
    const catSelect = document.getElementById('expense-category');

    // 将 label 改为普通 div（不再依赖 radio 的 :checked 状态）
    incomeLabel.innerHTML = '💚 收入';
    expenseLabel.innerHTML = '❤️ 支出';

    incomeLabel.addEventListener('click', () => {
      selectedType = 'income';
      incomeLabel.style.background = 'rgba(134,189,160,0.22)';
      incomeLabel.style.fontWeight = '700';
      expenseLabel.style.background = 'rgba(212,134,134,0.06)';
      expenseLabel.style.fontWeight = '400';
      catSelect.innerHTML = incomeOptions;
    });

    expenseLabel.addEventListener('click', () => {
      selectedType = 'expense';
      expenseLabel.style.background = 'rgba(212,134,134,0.22)';
      expenseLabel.style.fontWeight = '700';
      incomeLabel.style.background = 'rgba(134,189,160,0.06)';
      incomeLabel.style.fontWeight = '400';
      catSelect.innerHTML = expenseOptions;
    });

    // 取消
    document.getElementById('btn-cancel-expense').addEventListener('click', () => {
      overlay.classList.remove('show');
    });

    // 保存
    document.getElementById('btn-save-expense').addEventListener('click', async () => {
      const type = selectedType;
      const category = catSelect.value;
      const date = document.getElementById('expense-date').value || getToday();
      const amount = document.getElementById('expense-amount').value;
      const note = document.getElementById('expense-note').value;

      if (!amount || parseFloat(amount) <= 0) {
        alert('请输入有效的金额');
        return;
      }

      console.log('💰 [记账] 保存按钮点击 — type:', type, 'category:', category, 'date:', date, 'amount:', amount, 'note:', note);
      try {
        await addRecord({ type, category, date, amount, note });
        console.log('💰 [记账] 保存成功，关闭弹窗');
        overlay.classList.remove('show');
      } catch (err) {
        console.error('💰 [记账] 保存失败:', err);
        alert('保存失败，请重试。\n错误：' + (err.message || '未知错误'));
      }
    });

    // 遮罩关闭已统一由 app.js 处理，无需重复注册
  }

  // ---------- 紧凑收支摘要（嵌入时间轴） ----------
  async function renderMini(container, dateStr) {
    const date = dateStr || getToday();
    const records = await DB.expenses.getByDate(date);
    let incomeTotal = 0, expenseTotal = 0;
    records.forEach(r => {
      if (r.type === 'income') incomeTotal += Number(r.amount);
      else expenseTotal += Number(r.amount);
    });
    if (typeof container === 'string') {
      container = document.getElementById(container);
    }
    if (!container) return;
    container.innerHTML = `
      <div class="budget-mini-row">
        <span>💰 今日支出</span>
        <span class="budget-mini-amount expense">${formatMoney(expenseTotal)}</span>
      </div>
      <div class="budget-mini-row">
        <span>💚 今日收入</span>
        <span class="budget-mini-amount income">${formatMoney(incomeTotal)}</span>
      </div>
    `;
  }

  // ---------- 公开 API ----------
  return {
    render,
    bindEvents,
    addRecord,
    showAddForm,
    renderMini,
    getCategories: () => getAllCategories(),
  };
})();
