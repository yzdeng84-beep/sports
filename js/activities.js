/* ==========================================
   健身计划 App — 活动模块
   管理非健身类日常活动（看书、学习、娱乐等）
   内置12种活动，支持自定义扩展
   ========================================== */

'use strict';

const ActivitiesModule = (() => {

  // ---------- 内置活动类型（各有默认标签颜色） ----------
  const BUILT_IN_ACTIVITIES = [
    { id: 'reading',   name: '看书',   emoji: '\u{1F4D6}', color: '#6B9FD4' }, // 📖 蓝
    { id: 'homework',  name: '写作业', emoji: '✏️', color: '#86BDA0' }, // ✏️ 绿
    { id: 'study',     name: '学习',   emoji: '\u{1F4DA}', color: '#D4A574' }, // 📚 棕
    { id: 'gaming',    name: '打游戏', emoji: '\u{1F3AE}', color: '#B0A8C6' }, // 🎮 紫
    { id: 'movie',     name: '看电影', emoji: '\u{1F3AC}', color: '#D48686' }, // 🎬 红
    { id: 'music',     name: '听音乐', emoji: '\u{1F3B5}', color: '#8BB8D0' }, // 🎵 青
    { id: 'cooking',   name: '做饭',   emoji: '\u{1F373}', color: '#E8B84B' }, // 🍳 金
    { id: 'cleaning',  name: '打扫',   emoji: '\u{1F9F9}', color: '#A0B0C0' }, // 🧹 灰蓝
    { id: 'shopping_act', name: '购物', emoji: '\u{1F6D2}', color: '#D4A574' }, // 🛒 棕
    { id: 'walk',      name: '散步',   emoji: '\u{1F6B6}', color: '#86BDA0' }, // 🚶 绿
    { id: 'meditation', name: '冥想',  emoji: '\u{1F9D8}', color: '#B0A8C6' }, // 🧘 紫
    { id: 'social',    name: '聚会',   emoji: '\u{1F389}', color: '#E8B84B' }, // 🎉 金
  ];

  // ---------- 自定义活动（localStorage 存储） ----------
  const CUSTOM_ACT_KEY = 'cadence-custom-activities';

  function loadCustomActivities() {
    try {
      const raw = localStorage.getItem(CUSTOM_ACT_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveCustomActivities(list) {
    try {
      localStorage.setItem(CUSTOM_ACT_KEY, JSON.stringify(list));
    } catch (e) {
      alert('保存失败：存储空间已满。请删除一些自定义活动后再试。');
    }
  }

  // ---------- 工具方法 ----------

  /** 获取所有活动（内置 + 自定义），自定义排在后面 */
  function getAll() {
    return [...BUILT_IN_ACTIVITIES, ...loadCustomActivities()];
  }

  /** 按 ID 查找活动 */
  function getById(id) {
    return getAll().find(a => a.id === id) || null;
  }

  /** 按名称查找活动（精确匹配） */
  function getByName(name) {
    return getAll().find(a => a.name === name) || null;
  }

  /** 获取活动的 emoji，找不到返回默认 📌 */
  function getEmoji(id) {
    const act = getById(id);
    return act ? act.emoji : '\u{1F4CC}'; // 📌
  }

  /** 获取活动的名称，找不到返回 '未知' */
  function getName(id) {
    const act = getById(id);
    return act ? act.name : '未知';
  }

  /** 获取活动的默认颜色，找不到返回默认灰 */
  function getColor(id) {
    const act = getById(id);
    return act ? act.color : '#A0B0C0';
  }

  /** 判断是否为自定义活动 */
  function isCustom(id) {
    return id && id.startsWith('custom_');
  }

  /** 生成自定义活动 ID */
  function generateId() {
    return 'custom_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
  }

  /** 可选的 emoji 列表（用于自定义活动选择器） */
  const EMOJI_OPTIONS = [
    '\u{1F4D6}', '✏️', '\u{1F4DA}', '\u{1F3AE}',  // 📖✏️📚🎮
    '\u{1F3AC}', '\u{1F3B5}', '\u{1F373}', '\u{1F9F9}',  // 🎬🎵🍳🧹
    '\u{1F6D2}', '\u{1F6B6}', '\u{1F9D8}', '\u{1F389}',  // 🛒🚶🧘🎉
    '\u{1F4BB}', '\u{1F3B8}', '\u{1F3A8}', '✈️',  // 💻🎸🎨✈️
    '\u{1F3D6}', '\u{1F6F3}', '\u{1F3D3}', '\u{1F52C}',  // 🏖️🚳🏓🔬
    '\u{1F4F1}', '\u{1F4F7}', '\u{1F3B2}', '\u{2615}',  // 📱📷🎲☕
    '\u{1F4AA}', '\u{1F4AC}', '\u{1F4DD}', '\u{1F514}',  // 💪💬📝🔔
    '\u{1F310}', '\u{1F40E}', '\u{1F98B}', '\u{1F33F}',  // 🌐🐎🦋🌿
  ];

  return {
    BUILT_IN_ACTIVITIES,
    loadCustomActivities,
    saveCustomActivities,
    getAll,
    getById,
    getByName,
    getEmoji,
    getName,
    getColor,
    isCustom,
    generateId,
    EMOJI_OPTIONS,
  };

})();
