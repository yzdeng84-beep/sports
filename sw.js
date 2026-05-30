/* ==========================================
   健身计划 App — Service Worker
   缓存策略：静态资源 Cache First，其余 Network First
   ========================================== */

'use strict';

// ---------- 缓存名称（版本变更时自动清理旧缓存） ----------
const CACHE_NAME = 'cadence-v5';
const STATIC_ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/storage.js',
  './js/icons.js',
  './js/calendar.js',
  './js/notes.js',
  './js/timeline.js',
  './js/budget.js',
  './js/chart.js',
  './js/app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

// ---------- 安装：预缓存所有静态资源 ----------
self.addEventListener('install', (event) => {
  console.log('📦 [SW] 安装中 — 预缓存静态资源...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 [SW] 正在缓存', STATIC_ASSETS.length, '个文件');
        return cache.addAll(STATIC_ASSETS).catch((err) => {
          // 某个文件加载失败不影响整体安装
          console.warn('⚠️ [SW] 部分文件缓存失败:', err);
        });
      })
      .then(() => {
        console.log('📦 [SW] 安装完成，跳过等待');
        return self.skipWaiting();
      })
  );
});

// ---------- 激活：清理旧版本缓存 ----------
self.addEventListener('activate', (event) => {
  console.log('🔄 [SW] 激活中 — 清理旧缓存...');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => {
            console.log('🗑️ [SW] 删除旧缓存:', key);
            return caches.delete(key);
          })
      );
    }).then(() => {
      console.log('🔄 [SW] 激活完成，接管所有页面');
      return self.clients.claim();
    })
  );
});

// ---------- 请求拦截：Cache First（缓存优先） ----------
self.addEventListener('fetch', (event) => {
  // 跳过非 GET 请求（POST/PUT/DELETE 等直接走网络）
  if (event.request.method !== 'GET') return;

  // 跳过 chrome-extension:// 等非 HTTP(S) 请求
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // 命中缓存 → 直接返回
      if (cachedResponse) {
        return cachedResponse;
      }

      // 未命中 → 请求网络，同时加入缓存
      return fetch(event.request).then((networkResponse) => {
        // 只缓存成功的响应
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        // 克隆响应（响应流只能读取一次）
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });

        return networkResponse;
      }).catch(() => {
        // 网络失败 → 返回离线占位页（仅对导航请求）
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        // 其它资源静默失败
        return new Response('', { status: 408 });
      });
    })
  );
});

console.log('🟢 [SW] Service Worker 已就绪');
