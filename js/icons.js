/* ==========================================
   健身计划 App — SVG 图标库
   17个健身动作图标（蓝白线条风格）
   全局对象: IconsModule
   ========================================== */

const IconsModule = (() => {
  'use strict';

  // ---------- SVG 图标定义（24×24 viewBox，线条风格）----------
  // 每个 SVG 使用 stroke="#6B9FD4" stroke-width="2"
  // 通用头部：<circle cx="12" cy="4" r="2.5"/>
  // 通用躯干+腿+臂根据动作调整

  const SVGS = {
    // 有氧训练
    'running': `<svg viewBox="0 0 24 24" fill="none" stroke="#6B9FD4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="14" cy="4" r="2.2"/>
      <line x1="12" y1="7" x2="10" y2="13"/>
      <line x1="10" y1="13" x2="6" y2="10"/>
      <line x1="10" y1="13" x2="14" y2="11"/>
      <line x1="14" y1="11" x2="18" y2="8"/>
      <line x1="10" y1="13" x2="8" y2="18"/>
      <line x1="8" y1="18" x2="4" y2="18"/>
      <line x1="10" y1="13" x2="14" y2="16"/>
      <line x1="14" y1="16" x2="17" y2="20"/>
    </svg>`,

    'jump-rope': `<svg viewBox="0 0 24 24" fill="none" stroke="#6B9FD4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="4.5" r="2.2"/>
      <path d="M18 3 A8 9 0 0 1 6 3"/>
      <line x1="12" y1="7" x2="12" y2="13"/>
      <line x1="12" y1="13" x2="8" y2="17"/>
      <line x1="12" y1="13" x2="16" y2="17"/>
      <line x1="8" y1="17" x2="5" y2="21"/>
      <line x1="16" y1="17" x2="19" y2="21"/>
    </svg>`,

    'treadmill': `<svg viewBox="0 0 24 24" fill="none" stroke="#6B9FD4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="14" cy="3.5" r="2.2"/>
      <line x1="12" y1="6" x2="10" y2="11"/>
      <line x1="10" y1="11" x2="6" y2="10"/>
      <line x1="10" y1="11" x2="14" y2="10"/>
      <line x1="10" y1="11" x2="8" y2="16"/>
      <line x1="8" y1="16" x2="5" y2="18"/>
      <line x1="10" y1="11" x2="13" y2="15"/>
      <line x1="13" y1="15" x2="16" y2="18"/>
      <line x1="3" y1="20" x2="20" y2="18"/>
    </svg>`,

    'stair-climber': `<svg viewBox="0 0 24 24" fill="none" stroke="#6B9FD4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="13" cy="3.5" r="2.2"/>
      <line x1="11" y1="6" x2="10" y2="11"/>
      <line x1="10" y1="11" x2="6" y2="9"/>
      <line x1="10" y1="11" x2="14" y2="9"/>
      <line x1="10" y1="11" x2="7" y2="16"/>
      <line x1="7" y1="16" x2="4" y2="18"/>
      <line x1="10" y1="11" x2="13" y2="15"/>
      <line x1="13" y1="15" x2="11" y2="19"/>
      <rect x="3" y="17" width="4" height="2" rx="0.5"/>
      <rect x="5" y="13" width="4" height="2" rx="0.5"/>
      <rect x="7" y="9" width="4" height="2" rx="0.5"/>
    </svg>`,

    // 腿部
    'squat': `<svg viewBox="0 0 24 24" fill="none" stroke="#6B9FD4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="3.5" r="2.2"/>
      <line x1="12" y1="6" x2="12" y2="11"/>
      <line x1="7" y1="8" x2="17" y2="8"/>
      <line x1="12" y1="11" x2="8" y2="14"/>
      <line x1="12" y1="11" x2="16" y2="14"/>
      <line x1="8" y1="14" x2="6" y2="20"/>
      <line x1="16" y1="14" x2="18" y2="20"/>
    </svg>`,

    'deadlift': `<svg viewBox="0 0 24 24" fill="none" stroke="#6B9FD4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="3" r="2.2"/>
      <line x1="12" y1="5.5" x2="12" y2="11"/>
      <line x1="12" y1="8" x2="7" y2="13"/>
      <line x1="12" y1="8" x2="17" y2="13"/>
      <line x1="12" y1="11" x2="10" y2="17"/>
      <line x1="12" y1="11" x2="14" y2="17"/>
      <line x1="10" y1="17" x2="8" y2="22"/>
      <line x1="14" y1="17" x2="16" y2="22"/>
      <rect x="6" y="20" width="12" height="2.5" rx="1.2"/>
    </svg>`,

    // 胸部
    'bench-press': `<svg viewBox="0 0 24 24" fill="none" stroke="#6B9FD4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="4" y="14" width="16" height="3" rx="1.5"/>
      <line x1="5" y1="17" x2="5" y2="21"/>
      <line x1="19" y1="17" x2="19" y2="21"/>
      <line x1="7" y1="14" x2="10" y2="8"/>
      <line x1="17" y1="14" x2="14" y2="8"/>
      <circle cx="10" cy="4" r="2.2"/>
      <rect x="8" y="3" width="8" height="2.5" rx="1.2"/>
    </svg>`,

    'fly': `<svg viewBox="0 0 24 24" fill="none" stroke="#6B9FD4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="4" r="2.2"/>
      <line x1="12" y1="6.5" x2="12" y2="18"/>
      <line x1="12" y1="18" x2="9" y2="21"/>
      <line x1="12" y1="18" x2="15" y2="21"/>
      <path d="M12 9 Q6 7 4 10"/>
      <path d="M12 9 Q18 7 20 10"/>
    </svg>`,

    'push-up': `<svg viewBox="0 0 24 24" fill="none" stroke="#6B9FD4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="17" cy="7" r="2.2"/>
      <line x1="15" y1="9" x2="11" y2="15"/>
      <line x1="11" y1="15" x2="6" y2="21"/>
      <line x1="15" y1="9" x2="18" y2="14"/>
      <line x1="18" y1="14" x2="20" y2="20"/>
      <line x1="17" y1="12" x2="14" y2="19"/>
    </svg>`,

    // 背部
    'row': `<svg viewBox="0 0 24 24" fill="none" stroke="#6B9FD4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="13" cy="4" r="2.2"/>
      <line x1="11" y1="6.5" x2="9" y2="14"/>
      <line x1="9" y1="10" x2="4" y2="8"/>
      <line x1="9" y1="14" x2="7" y2="19"/>
      <line x1="9" y1="14" x2="12" y2="18"/>
      <line x1="7" y1="19" x2="5" y2="22"/>
      <line x1="12" y1="18" x2="14" y2="21"/>
      <line x1="9" y1="12" x2="16" y2="12"/>
    </svg>`,

    'pull-up': `<svg viewBox="0 0 24 24" fill="none" stroke="#6B9FD4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="4" y1="3" x2="20" y2="3"/>
      <line x1="4" y1="3" x2="4" y2="6"/>
      <line x1="20" y1="3" x2="20" y2="6"/>
      <circle cx="12" cy="8" r="2.2"/>
      <line x1="12" y1="10" x2="12" y2="15"/>
      <line x1="8" y1="8" x2="7" y2="13"/>
      <line x1="16" y1="8" x2="17" y2="13"/>
      <line x1="12" y1="15" x2="10" y2="19"/>
      <line x1="12" y1="15" x2="14" y2="19"/>
    </svg>`,

    'lat-pulldown': `<svg viewBox="0 0 24 24" fill="none" stroke="#6B9FD4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="5" y1="4" x2="19" y2="4"/>
      <circle cx="12" cy="7" r="2.2"/>
      <line x1="12" y1="9.5" x2="12" y2="14"/>
      <line x1="8" y1="8" x2="5" y2="5"/>
      <line x1="16" y1="8" x2="19" y2="5"/>
      <line x1="12" y1="14" x2="9" y2="18"/>
      <line x1="12" y1="14" x2="15" y2="18"/>
      <rect x="7" y="18" width="10" height="2" rx="1"/>
      <line x1="10" y1="18" x2="10" y2="21"/>
      <line x1="14" y1="18" x2="14" y2="21"/>
    </svg>`,

    // 手臂
    'curl': `<svg viewBox="0 0 24 24" fill="none" stroke="#6B9FD4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="3.5" r="2.2"/>
      <line x1="12" y1="6" x2="12" y2="14"/>
      <line x1="12" y1="14" x2="9" y2="19"/>
      <line x1="12" y1="14" x2="15" y2="19"/>
      <line x1="12" y1="10" x2="7" y2="13"/>
      <line x1="7" y1="13" x2="6" y2="17"/>
      <circle cx="6" cy="17.5" r="1.8"/>
    </svg>`,

    'overhead-press': `<svg viewBox="0 0 24 24" fill="none" stroke="#6B9FD4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="5" r="2.2"/>
      <line x1="12" y1="7.5" x2="12" y2="17"/>
      <line x1="12" y1="17" x2="9" y2="21"/>
      <line x1="12" y1="17" x2="15" y2="21"/>
      <line x1="8" y1="7" x2="7" y2="4"/>
      <line x1="16" y1="7" x2="17" y2="4"/>
      <rect x="8" y="1" width="8" height="2.5" rx="1.2"/>
    </svg>`,

    // 核心
    'plank': `<svg viewBox="0 0 24 24" fill="none" stroke="#6B9FD4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="10" cy="9" r="2.2"/>
      <line x1="12" y1="10" x2="17" y2="15"/>
      <line x1="17" y1="15" x2="20" y2="20"/>
      <line x1="8" y1="11" x2="6" y2="17"/>
      <line x1="6" y1="17" x2="5" y2="21"/>
      <line x1="10" y1="11" x2="13" y2="14"/>
    </svg>`,

    'sit-up': `<svg viewBox="0 0 24 24" fill="none" stroke="#6B9FD4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="7" r="2.2"/>
      <line x1="12" y1="9.5" x2="12" y2="14"/>
      <line x1="12" y1="9.5" x2="8" y2="9"/>
      <line x1="12" y1="9.5" x2="16" y2="9"/>
      <line x1="12" y1="14" x2="6" y2="19"/>
      <line x1="12" y1="14" x2="18" y2="19"/>
      <line x1="6" y1="19" x2="6" y2="22"/>
      <line x1="18" y1="19" x2="18" y2="22"/>
    </svg>`,

    'stretching': `<svg viewBox="0 0 24 24" fill="none" stroke="#6B9FD4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="4" r="2.2"/>
      <line x1="12" y1="6.5" x2="12" y2="18"/>
      <line x1="12" y1="18" x2="9" y2="21"/>
      <line x1="12" y1="18" x2="15" y2="21"/>
      <line x1="12" y1="9" x2="3" y2="6"/>
      <line x1="12" y1="9" x2="16" y2="13"/>
    </svg>`,
  };

  // ---------- 图标元数据（17个健身动作）----------
  // group: 有氧/腿/胸/背/臂/核心
  // formFields: weight=重量(kg), sets=组数, speed=速度(km/h),
  //             incline=坡度(%), level=档位, duration=时长(分钟)
  const iconList = [
    // 有氧训练
    { id: 'running',        name: '跑步',   emoji: '🏃', category: 'cardio',   group: '有氧', formFields: ['speed', 'duration'] },
    { id: 'jump-rope',      name: '跳绳',   emoji: '🪢', category: 'cardio',   group: '有氧', formFields: ['duration'] },
    { id: 'treadmill',      name: '爬坡',   emoji: '🏔️', category: 'cardio',   group: '有氧', formFields: ['speed', 'incline', 'duration'] },
    { id: 'stair-climber',  name: '爬楼',   emoji: '🪜', category: 'cardio',   group: '有氧', formFields: ['level', 'duration'] },
    // 腿部
    { id: 'squat',          name: '深蹲',   emoji: '🏋️', category: 'strength', group: '腿',   formFields: ['weight', 'sets'] },
    { id: 'deadlift',       name: '硬拉',   emoji: '🏋️', category: 'strength', group: '腿',   formFields: ['weight', 'sets'] },
    // 胸部
    { id: 'bench-press',    name: '卧推',   emoji: '🏋️', category: 'strength', group: '胸',   formFields: ['weight', 'sets'] },
    { id: 'fly',            name: '飞鸟',   emoji: '🦅', category: 'strength', group: '胸',   formFields: ['weight', 'sets'] },
    { id: 'push-up',        name: '俯卧撑', emoji: '🏋️', category: 'strength', group: '胸',   formFields: ['weight', 'sets'] },
    // 背部
    { id: 'row',            name: '划船',   emoji: '🚣', category: 'strength', group: '背',   formFields: ['weight', 'sets'] },
    { id: 'pull-up',        name: '引体向上', emoji: '🏋️', category: 'strength', group: '背',   formFields: ['weight', 'sets'] },
    { id: 'lat-pulldown',  name: '高位下拉', emoji: '🏋️', category: 'strength', group: '背',   formFields: ['weight', 'sets'] },
    // 手臂
    { id: 'curl',           name: '弯举',   emoji: '💪', category: 'strength', group: '臂',   formFields: ['weight', 'sets'] },
    { id: 'overhead-press', name: '推举',   emoji: '🏋️', category: 'strength', group: '臂',   formFields: ['weight', 'sets'] },
    // 核心
    { id: 'plank',          name: '平板支撑', emoji: '🧘', category: 'core',    group: '核心', formFields: ['duration'] },
    { id: 'sit-up',         name: '仰卧起坐', emoji: '🏋️', category: 'strength', group: '核心', formFields: ['weight', 'sets'] },
    { id: 'stretching',     name: '拉伸',   emoji: '🧘', category: 'flex',     group: '核心', formFields: ['duration'] },
  ];

  // 分组顺序定义
  const groupOrder = ['有氧', '腿', '胸', '背', '臂', '核心'];

  /** 根据ID获取图标信息 */
  function getById(id) {
    return iconList.find(i => i.id === id) || null;
  }

  /** 获取全部图标列表 */
  function getAll() {
    return [...iconList];
  }

  /** 按分类获取图标 */
  function getByCategory(category) {
    return iconList.filter(i => i.category === category);
  }

  /** 获取图标的 emoji（回退方案） */
  function getEmoji(id) {
    const icon = getById(id);
    return icon ? icon.emoji : '📌';
  }

  /** 获取图标的 SVG 字符串（主方案） */
  function getSVG(id, size = 24) {
    const svg = SVGS[id];
    if (!svg) {
      // 回退到 emoji
      return `<span style="font-size:${size}px">${getEmoji(id)}</span>`;
    }
    return svg.replace(/<svg /, `<svg width="${size}" height="${size}" `);
  }

  /** 获取图标名称 */
  function getName(id) {
    const icon = getById(id);
    return icon ? icon.name : '未知';
  }

  /** 获取图标对应的训练参数字段列表 */
  function getFormFields(id) {
    const icon = getById(id);
    return icon ? (icon.formFields || []) : [];
  }

  /** 按分组获取图标列表，返回 { groupName: [icons...] } */
  function getGrouped() {
    const grouped = {};
    groupOrder.forEach(g => { grouped[g] = []; });
    iconList.forEach(icon => {
      const g = icon.group || '其他';
      if (!grouped[g]) grouped[g] = [];
      grouped[g].push(icon);
    });
    return grouped;
  }

  return {
    getById,
    getAll,
    getByCategory,
    getEmoji,
    getSVG,
    getName,
    getFormFields,
    getGrouped,
    groupOrder,
    iconList,
  };
})();
