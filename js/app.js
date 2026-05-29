/* ==========================================
   健身计划 App — 主入口
   负责：Tab 切换、初始化、全局状态
   ========================================== */

const App = (() => {
  'use strict';

  // ---------- 全局状态 ----------
  let currentPanel = 'panel-calendar';  // 当前显示的板块
  let currentDate = new Date();         // 当前浏览的日期

  // ---------- DOM 缓存 ----------
  const tabItems = document.querySelectorAll('.tab-item');
  const panels = document.querySelectorAll('.panel');

  // ---------- Tab 切换 ----------
  function switchPanel(panelId) {
    if (currentPanel === panelId) return;

    // 切换面板显示
    panels.forEach(p => p.classList.remove('active'));
    const targetPanel = document.getElementById(panelId);
    if (targetPanel) targetPanel.classList.add('active');

    // 切换Tab高亮
    tabItems.forEach(t => t.classList.remove('active'));
    const targetTab = document.querySelector(`[data-panel="${panelId}"]`);
    if (targetTab) targetTab.classList.add('active');

    currentPanel = panelId;

    // 切换到对应板块时刷新数据
    if (panelId === 'panel-calendar' && typeof CalendarModule !== 'undefined') {
      CalendarModule.render();
    } else if (panelId === 'panel-notes' && typeof NotesModule !== 'undefined') {
      NotesModule.render();
    } else if (panelId === 'panel-timeline' && typeof TimelineModule !== 'undefined') {
      TimelineModule.render();
    }
  }

  // ---------- 事件绑定 ----------
  function bindEvents() {
    // Tab 点击
    tabItems.forEach(tab => {
      tab.addEventListener('click', () => {
        const panelId = tab.getAttribute('data-panel');
        if (panelId) switchPanel(panelId);
      });
    });

    // 各模块的事件绑定
    if (typeof CalendarModule !== 'undefined') CalendarModule.bindEvents();
    if (typeof NotesModule !== 'undefined') NotesModule.bindEvents();
    if (typeof TimelineModule !== 'undefined') TimelineModule.bindEvents();
    if (typeof BudgetModule !== 'undefined') BudgetModule.bindEvents();
  }

  // ---------- 注册 Service Worker ----------
  function registerSW() {
    if (!('serviceWorker' in navigator)) {
      console.log('⚠️ 浏览器不支持 Service Worker，跳过 PWA 离线缓存');
      return;
    }
    navigator.serviceWorker.register('./sw.js', { scope: './' })
      .then((reg) => {
        console.log('✅ [SW] 注册成功，scope:', reg.scope);
        // 监听更新
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🔄 [SW] 检测到新版本，刷新页面后生效');
              }
            });
          }
        });
      })
      .catch((err) => {
        console.warn('⚠️ [SW] 注册失败:', err);
      });
  }

  // ---------- 初始化 ----------
  async function init() {
    // 先初始化数据库
    try {
      await DB.open();
      console.log('📦 数据库就绪');
    } catch (err) {
      console.warn('⚠️ 数据库初始化失败，使用内存模式:', err);
    }

    // 注册 Service Worker（PWA 离线缓存）
    registerSW();

    // 绑定事件
    bindEvents();

    // 全局遮罩关闭（统一入口，避免各模块 { once: true } 冲突）
    const overlay = document.getElementById('modal-overlay');
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('show');
    });

    // ESC 键关闭弹窗
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('show')) {
        overlay.classList.remove('show');
      }
    });

    // 默认显示日历板块
    switchPanel('panel-calendar');
    console.log('🏋️ 健身计划 App 初始化完成');
  }

  // ---------- 公开 API ----------
  return {
    init,
    switchPanel,
    getCurrentDate: () => currentDate,
    setCurrentDate: (d) => { currentDate = d; },
    getCurrentPanel: () => currentPanel
  };
})();

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
