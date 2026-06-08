/* ==========================================
   健身计划 App — 主入口
   负责：Tab 切换、初始化、全局状态
   ========================================== */

const App = (() => {
  'use strict';

  // ---------- 全局状态 ----------
  let currentPanel = null;  // 初始为 null，确保首次 switchPanel 能执行 render
  let currentDate = new Date();         // 当前浏览的日期

  // ---------- 主题数据 ----------
  const THEMES = {
    default: { name:'默认蓝白', bgStart:'#EDF3F8', bgMid:'#F5F0EB', bgEnd:'#F8F6F3', dot:'#C5D9F0', dotOpacity:'0.25', gradient:'#EDF3F8,#F5F0EB,#F8F6F3' },
    warm:    { name:'暖橙',   bgStart:'#F8EDEB', bgMid:'#F5EDE0', bgEnd:'#FDF8F5', dot:'#F0D5C5', dotOpacity:'0.25', gradient:'#F8EDEB,#F5EDE0,#FDF8F5' },
    forest:  { name:'青绿',   bgStart:'#E8F5EC', bgMid:'#EDF5EE', bgEnd:'#F8FBF9', dot:'#C5E8D5', dotOpacity:'0.25', gradient:'#E8F5EC,#EDF5EE,#F8FBF9' },
    minimal: { name:'素灰',   bgStart:'#F5F5F5', bgMid:'#F0F0F0', bgEnd:'#FFFFFF', dot:'transparent', dotOpacity:'0', gradient:'#F5F5F5,#F0F0F0,#FFFFFF' },
    dark:    { name:'暗夜',   bgStart:'#2C3A4A', bgMid:'#364450', bgEnd:'#4A5568', dot:'#5A6A7A', dotOpacity:'0.15', gradient:'#2C3A4A,#364450,#4A5568' },
  };
  const THEME_STORAGE_KEY = 'cadence-theme';
  const BGIMAGE_STORAGE_KEY = 'cadence-bg-image';

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
    } else if (panelId === 'panel-timeline' && typeof TimelineModule !== 'undefined') {
      TimelineModule.render();
    } else if (panelId === 'panel-countdown') {
      if (typeof CountdownModule !== 'undefined') CountdownModule.render();
      if (typeof NotesModule !== 'undefined') NotesModule.render();
    }
  }

  // ---------- 面板滑动切换 ----------
  const PANEL_ORDER = ['panel-calendar', 'panel-timeline', 'panel-countdown'];

  function bindSwipe() {
    const main = document.querySelector('.app-main');
    if (!main) return;

    let startX = 0, startY = 0, isSwiping = false;

    main.addEventListener('touchstart', (e) => {
      // 如果弹窗打开，不处理滑动
      const overlay = document.getElementById('modal-overlay');
      if (overlay && overlay.classList.contains('show')) return;

      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isSwiping = true;
    }, { passive: true });

    main.addEventListener('touchmove', (e) => {
      if (!isSwiping) return;
    }, { passive: true });

    main.addEventListener('touchend', (e) => {
      if (!isSwiping) return;
      isSwiping = false;

      const deltaX = (e.changedTouches[0].clientX - startX);
      const deltaY = (e.changedTouches[0].clientY - startY);

      // 水平位移 > 50px 且 水平 > 垂直 → 触发切换
      if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
        const currentIdx = PANEL_ORDER.indexOf(currentPanel);
        let newIdx = currentIdx;

        if (deltaX < 0) {
          // 左滑 → 下一个面板
          newIdx = (currentIdx + 1) % PANEL_ORDER.length;
        } else {
          // 右滑 → 上一个面板
          newIdx = (currentIdx - 1 + PANEL_ORDER.length) % PANEL_ORDER.length;
        }

        if (newIdx !== currentIdx) {
          // 添加滑动动画方向
          const targetPanel = document.getElementById(PANEL_ORDER[newIdx]);
          const currentEl = document.getElementById(currentPanel);

          if (targetPanel && currentEl) {
            const direction = deltaX < 0 ? 'left' : 'right';
            animatePanelSwitch(currentEl, targetPanel, direction);
            switchPanel(PANEL_ORDER[newIdx]);
          }
        }
      }
    }, { passive: true });
  }

  /** CSS 过渡动画：面板滑入/滑出 */
  function animatePanelSwitch(fromEl, toEl, direction) {
    const offset = direction === 'left' ? '-30px' : '30px';

    // 新面板从侧边滑入
    toEl.style.transition = 'none';
    toEl.style.transform = `translateX(${direction === 'left' ? '30px' : '-30px'})`;
    toEl.style.opacity = '0';
    toEl.style.display = 'block';

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toEl.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
        toEl.style.transform = 'translateX(0)';
        toEl.style.opacity = '1';
      });
    });

    // 旧面板滑出
    fromEl.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    fromEl.style.transform = `translateX(${offset})`;
    fromEl.style.opacity = '0';

    // 动画结束后清理
    setTimeout(() => {
      toEl.style.transition = '';
      toEl.style.transform = '';
      toEl.style.opacity = '';
      toEl.style.display = '';
      fromEl.style.transition = '';
      fromEl.style.transform = '';
      fromEl.style.opacity = '';
      fromEl.style.display = '';
    }, 320);
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
    if (typeof TimelineModule !== 'undefined') TimelineModule.bindEvents();
    if (typeof CountdownModule !== 'undefined') CountdownModule.bindEvents();
    if (typeof NotesModule !== 'undefined') NotesModule.bindEvents();

    // 主题按钮
    const btnTheme = document.getElementById('btn-theme');
    if (btnTheme) {
      btnTheme.addEventListener('click', showThemePicker);
    }

    // 教程按钮
    const btnTutorial = document.getElementById('btn-tutorial');
    if (btnTutorial && typeof TutorialsModule !== 'undefined') {
      btnTutorial.addEventListener('click', () => {
        TutorialsModule.show();
      });
    }
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

  // ---------- 主题管理 ----------

  /** 应用预设主题 */
  function applyTheme(themeId) {
    const theme = THEMES[themeId];
    if (!theme) return;
    const root = document.documentElement;
    root.style.setProperty('--color-bg-start', theme.bgStart);
    root.style.setProperty('--color-bg-mid', theme.bgMid);
    root.style.setProperty('--color-bg-end', theme.bgEnd);
    root.style.setProperty('--color-dot', theme.dot);
    root.style.setProperty('--color-dot-opacity', theme.dotOpacity);
    root.style.setProperty('--bg-image', 'none');
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
    localStorage.removeItem(BGIMAGE_STORAGE_KEY);
  }

  /** 导入图片作为背景 */
  function applyImage(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      localStorage.setItem(BGIMAGE_STORAGE_KEY, dataUrl);
      localStorage.setItem(THEME_STORAGE_KEY, 'image');
      document.documentElement.style.setProperty('--bg-image', `url(${dataUrl})`);
      document.documentElement.style.setProperty('--color-dot-opacity', '0');
    };
    reader.readAsDataURL(file);
  }

  /** 从 localStorage 恢复主题或图片 */
  function loadTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const savedImage = localStorage.getItem(BGIMAGE_STORAGE_KEY);

    if (savedTheme === 'image' && savedImage) {
      // 恢复自定义图片
      document.documentElement.style.setProperty('--bg-image', `url(${savedImage})`);
      document.documentElement.style.setProperty('--color-dot-opacity', '0');
    } else if (savedTheme && THEMES[savedTheme]) {
      // 恢复预设主题
      applyTheme(savedTheme);
    }
    // 如无存档则使用 CSS 默认值
  }

  /** 弹出主题选择器 */
  function showThemePicker() {
    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    const currentTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'default';

    // 预设主题卡片
    const themeCards = Object.entries(THEMES).map(([id, t]) => `
      <div class="theme-card ${currentTheme === id ? 'selected' : ''}" data-theme="${id}">
        <div class="theme-card-image" style="background:linear-gradient(135deg,${t.gradient})"></div>
        <span class="theme-card-name">${t.name}</span>
      </div>
    `).join('');

    content.innerHTML = `
      <h3 style="margin-bottom:16px;color:var(--color-primary-dark);font-weight:600;">🎨 更换背景</h3>
      <div class="theme-grid" id="theme-grid">
        ${themeCards}
      </div>
      <div style="display:flex;gap:var(--space-sm);margin-top:var(--space-md);">
        <div class="theme-card-upload" id="btn-upload-img" style="flex:1;aspect-ratio:auto;padding:var(--space-md);">
          <span class="theme-card-upload-icon">📷</span>
          <span class="theme-card-upload-label">相册图片</span>
        </div>
        <button id="btn-cancel-theme" style="flex:1;padding:var(--space-md);border-radius:var(--radius-sm);background:rgba(0,0,0,0.04);font-weight:600;color:var(--color-text-light);">取消</button>
      </div>
      <input type="file" id="file-bg-input" accept="image/*" style="display:none;">
    `;

    overlay.classList.add('show');

    // 绑定主题点击
    document.querySelectorAll('.theme-card').forEach(card => {
      card.addEventListener('click', () => {
        const themeId = card.getAttribute('data-theme');
        applyTheme(themeId);
        overlay.classList.remove('show');
      });
    });

    // 导入图片按钮
    document.getElementById('btn-upload-img').addEventListener('click', () => {
      document.getElementById('file-bg-input').click();
    });

    // 文件选择
    document.getElementById('file-bg-input').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        applyImage(file);
        overlay.classList.remove('show');
      }
    });

    // 取消
    document.getElementById('btn-cancel-theme').addEventListener('click', () => {
      overlay.classList.remove('show');
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

    // 恢复主题（在渲染前执行，避免闪烁）
    loadTheme();

    // 注册 Service Worker（PWA 离线缓存）
    registerSW();

    // 绑定事件
    bindEvents();
    bindSwipe();

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
    getCurrentPanel: () => currentPanel,
    applyTheme,
    showThemePicker,
    getThemeList: () => THEMES,
  };
})();

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
