/* ==========================================
   健身计划 App — IndexedDB 存储层
   提供数据库初始化与 CRUD 操作
   全局对象: DB
   ========================================== */

const DB = (() => {
  'use strict';

  const DB_NAME = 'FitnessPlannerDB';
  const DB_VERSION = 2; // v2: 确保 expenses 表存在（修复旧版 DB 缺失该表的问题）

  let db = null; // 数据库实例引用

  // ---------- 数据库初始化 ----------
  function open() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      // 数据库首次创建或版本升级时触发
      request.onupgradeneeded = (event) => {
        const database = event.target.result;

        // 创建 tasks 表：日历计划
        if (!database.objectStoreNames.contains('tasks')) {
          const tasksStore = database.createObjectStore('tasks', { keyPath: 'id' });
          tasksStore.createIndex('date', 'date', { unique: false });
        }

        // 创建 notes 表：心得记录
        if (!database.objectStoreNames.contains('notes')) {
          const notesStore = database.createObjectStore('notes', { keyPath: 'id' });
          notesStore.createIndex('date', 'date', { unique: false });
        }

        // 创建 timeline_entries 表：时间轴活动
        if (!database.objectStoreNames.contains('timeline_entries')) {
          const tlStore = database.createObjectStore('timeline_entries', { keyPath: 'id' });
          tlStore.createIndex('date', 'date', { unique: false });
        }

        // 创建 expenses 表：记账记录
        if (!database.objectStoreNames.contains('expenses')) {
          const expStore = database.createObjectStore('expenses', { keyPath: 'id' });
          expStore.createIndex('date', 'date', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        db = event.target.result;
        console.log('📦 IndexedDB 初始化完成');
        resolve(db);
      };

      request.onerror = (event) => {
        console.error('❌ IndexedDB 初始化失败:', event.target.error);
        reject(event.target.error);
      };

      // 数据库被其他标签页占用（版本升级时）
      request.onblocked = (event) => {
        console.warn('⚠️ IndexedDB 升级被阻止，请关闭其他标签页后刷新');
        reject(new Error('数据库升级被阻止 — 请关闭其他标签页后刷新页面'));
      };
    });
  }

  // ---------- 生成唯一 ID ----------
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
  }

  // ---------- 通用 CRUD 方法 ----------

  /** 添加一条记录 */
  function add(storeName, data) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const record = { ...data, id: generateId(), createdAt: Date.now() };
      const request = store.add(record);
      request.onsuccess = () => resolve(record);
      request.onerror = (e) => reject(e.target.error);
    });
  }

  /** 更新一条记录 */
  function update(storeName, data) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const record = { ...data, updatedAt: Date.now() };
      const request = store.put(record);
      request.onsuccess = () => resolve(record);
      request.onerror = (e) => reject(e.target.error);
    });
  }

  /** 删除一条记录 */
  function remove(storeName, id) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.delete(id);
      request.onsuccess = () => resolve(id);
      request.onerror = (e) => reject(e.target.error);
    });
  }

  /** 获取全部记录 */
  function getAll(storeName) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = (e) => reject(e.target.error);
    });
  }

  /** 按日期获取记录 */
  function getByDate(storeName, date) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const index = store.index('date');
      const request = index.getAll(date);
      request.onsuccess = () => resolve(request.result);
      request.onerror = (e) => reject(e.target.error);
    });
  }

  /** 按ID获取单条记录 */
  function getById(storeName, id) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = (e) => reject(e.target.error);
    });
  }

  // ---------- 公开 API ----------
  return {
    open,
    add,
    update,
    remove,
    getAll,
    getByDate,
    getById,
    generateId,
    // 便捷方法
    tasks: {
      add: (data) => add('tasks', data),
      update: (data) => update('tasks', data),
      remove: (id) => remove('tasks', id),
      getAll: () => getAll('tasks'),
      getByDate: (date) => getByDate('tasks', date),
      getById: (id) => getById('tasks', id),
    },
    notes: {
      add: (data) => add('notes', data),
      update: (data) => update('notes', data),
      remove: (id) => remove('notes', id),
      getAll: () => getAll('notes'),
      getByDate: (date) => getByDate('notes', date),
      getById: (id) => getById('notes', id),
    },
    timeline: {
      add: (data) => add('timeline_entries', data),
      update: (data) => update('timeline_entries', data),
      remove: (id) => remove('timeline_entries', id),
      getAll: () => getAll('timeline_entries'),
      getByDate: (date) => getByDate('timeline_entries', date),
      getById: (id) => getById('timeline_entries', id),
    },
    expenses: {
      add: (data) => add('expenses', data),
      update: (data) => update('expenses', data),
      remove: (id) => remove('expenses', id),
      getAll: () => getAll('expenses'),
      getByDate: (date) => getByDate('expenses', date),
      getById: (id) => getById('expenses', id),
    }
  };
})();
