# CLAUDE.md — 健身计划管理 App 项目指引

## 项目简介

这是一款面向安卓手机的 PWA 健身计划管理应用，含三大板块：日历封面、心得记录、横轴时间表。目标用户为编程零基础的健身爱好者。

## 标准文件路径

| 文档 | 路径 | 说明 |
|------|------|------|
| 需求文档 | [docs/requirements.md](docs/requirements.md) | 功能与非功能需求 |
| 技术规范 | [docs/tech-spec.md](docs/tech-spec.md) | 技术选型、数据模型、编码规范 |
| 设计规范 | [docs/design-spec.md](docs/design-spec.md) | 色彩、字体、间距、组件样式 |
| 执行步骤 | [docs/implementation-steps.md](docs/implementation-steps.md) | 开发步骤与进度跟踪 |
| 开发日志 | [dev-logs/](dev-logs/) | 每日开发日志（按日期命名） |

## 工作说明

### 开发原则
1. **逐步推进**：每次只完成一个步骤，验证后再继续
2. **文档驱动**：编码前先查阅 docs/ 中的规范文件
3. **日志记录**：每次开发会话结束前更新 dev-logs/
4. **中文优先**：代码注释和文档使用中文
5. **零基础友好**：代码简洁清晰，注释详尽

### 技术约束
- 纯静态文件，无构建工具，浏览器直接打开即可运行
- 不使用任何第三方框架或库（零依赖）
- 所有数据存储在浏览器 IndexedDB 中
- 配色严格遵循设计规范中的蓝白色系
- 每个 JS 文件暴露一个全局模块对象

### 文件职责
- `index.html` — 唯一的 HTML 文件，包含三板块的 DOM 结构
- `css/style.css` — 全局样式（CSS 变量定义在 `:root`）
- `js/app.js` — 应用入口，Tab 切换，初始化
- `js/storage.js` — IndexedDB 封装，暴露 `DB` 全局对象
- `js/calendar.js` — 日历封面页逻辑，暴露 `CalendarModule`
- `js/notes.js` — 心得记录逻辑，暴露 `NotesModule`
- `js/timeline.js` — 横轴时间表逻辑，暴露 `TimelineModule`
- `js/icons.js` — SVG 图标定义，暴露 `IconsModule`

### 启动方式
直接在浏览器中打开 `index.html` 即可运行。手机端可通过局域网或部署到 GitHub Pages 访问。

### 验证方式
- 功能验证：各板块 CRUD 操作是否正常
- 持久化验证：刷新页面后数据是否保留
- PWA 验证：Chrome DevTools → Application → Manifest
- 移动端验证：手机浏览器打开并添加到主屏幕
