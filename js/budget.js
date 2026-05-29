/* ==========================================
   健身计划 App — 记账模块（板块③子视图）
   收支记录、分类、日统计
   全局对象: BudgetModule
   ========================================== */

const BudgetModule = (() => {
  'use strict';

  // ---------- 记账分类 ----------
  const categories = [
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

  // ---------- DOM 缓存 ----------
  const $list = document.getElementById('budget-list');
  const $incomeTotal = document.getElementById('budget-income-total');
  const $expenseTotal = document.getElementById('budget-expense-total');
  const $addBtn = document.getElementById('btn-add-expense');

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
    const date = getSelectedDate();
    console.log('💰 [记账] render() 查询日期:', date);
    const records = await DB.expenses.getByDate(date);
    console.log('💰 [记账] 查询到记录数:', records.length, records);
    records.sort((a, b) => b.createdAt - a.createdAt);

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
      const cat = categories.find(c => c.id === r.category) || {};
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

  // ---------- 添加记账记录 ----------
  async function addRecord(data) {
    const record = {
      date: getSelectedDate(),
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
  }

  // ---------- 弹出添加表单 ----------
  function showAddForm() {
    const expenseCats = categories.filter(c => c.type === 'expense');
    const incomeCats = categories.filter(c => c.type === 'income');

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
        <label style="font-size:var(--font-caption);color:var(--color-text-light);display:block;margin-bottom:4px;">分类</label>
        <select id="expense-category" class="form-select">
          ${expenseOptions}
        </select>
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
      const amount = document.getElementById('expense-amount').value;
      const note = document.getElementById('expense-note').value;

      if (!amount || parseFloat(amount) <= 0) {
        alert('请输入有效的金额');
        return;
      }

      console.log('💰 [记账] 保存按钮点击 — type:', type, 'category:', category, 'amount:', amount, 'note:', note);
      try {
        await addRecord({ type, category, amount, note });
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
    getCategories: () => categories,
  };
})();
