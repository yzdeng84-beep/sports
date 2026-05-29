# 技术规范 — 健身计划管理 App

## 技术选型

| 层 | 技术 | 版本要求 |
|---|------|----------|
| 结构 | HTML5 | 现代浏览器 |
| 样式 | CSS3（变量 + Flexbox + Grid） | 现代浏览器 |
| 逻辑 | 原生 JavaScript ES6+ | 现代浏览器 |
| 存储 | IndexedDB | 现代浏览器 |
| PWA | Service Worker + Web App Manifest | Chrome/Edge 80+ |
| 图标 | 内联 SVG | N/A |

## 浏览器兼容

- Chrome for Android 80+
- Samsung Internet 12+
- Edge for Android 80+

## 文件结构

```
fitness-planner/
├── index.html              # 主页面（单页应用）
├── manifest.json           # PWA 清单
├── sw.js                   # Service Worker
├── css/
│   └── style.css           # 全局样式
├── js/
│   ├── app.js              # 入口、路由、Tab
│   ├── storage.js          # IndexedDB 封装
│   ├── calendar.js         # 日历封面
│   ├── notes.js            # 心得记录
│   ├── timeline.js         # 时间轴 + 记账双视图
│   ├── budget.js           # 记账模块
│   └── icons.js            # SVG 图标
├── icons/
│   ├── icon-192.png
│   └── icon-512.png
├── docs/                   # 项目文档
│   ├── requirements.md
│   ├── tech-spec.md
│   ├── design-spec.md
│   └── implementation-steps.md
└── dev-logs/               # 开发日志
```

## 数据模型

### IndexedDB 数据库：FitnessPlannerDB v1

**tasks** — 日历计划
```js
{ id, date, time, title, icon, color, createdAt }
```

**notes** — 心得记录
```js
{ id, date, title, content, mood, createdAt, updatedAt }
```

**timeline_entries** — 时间轴活动
```js
{ id, date, startTime, endTime, title, icon, color, note, createdAt }
```

**expenses** — 记账记录
```js
{ id, date, type, category, amount, note, createdAt }
```
> type: 'income' | 'expense'；category: 'food'|'transport'|'shopping'|'fitness'|'entertainment'|'other_expense'|'salary'|'bonus'|'other_income'

## 编码规范

- 使用 `const` / `let`，禁用 `var`
- 函数命名：驼峰命名 `camelCase`
- 模块化：每个 JS 文件暴露一个全局对象（如 `CalendarModule`）
- 注释：中文注释，关键逻辑必注
- 缩进：2 空格
