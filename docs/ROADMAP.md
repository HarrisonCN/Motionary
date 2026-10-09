# Motionary 路线图（9.0 之后）

9.0 已发布：声明式动效 DSL（`motionary/dsl` —— 用 `data-motion="enter: fade-up 600ms stagger 80ms; hover: pop"` 一行文本描述完整动效，或用 `<usa-motion>`）、插件市场正式版（`motionary/marketplace` —— 目录、搜索、一键安装，`<usa-plugin-store>`）、移除 8.9 弃用的 `applyTheme()` / `THEMES` / `THEME_NAMES` / `<usa-theme>`（改名为 Motion 前缀）；`motionary` 与 `use-scroll-animate` 同时成为 npm `latest`。下面是 9.1 → 10.0 的计划，每个版本一个主题 + 一组新组件，9.9 负责 10.0 的弃用与迁移工具。

- **v9.1** — 电影化叙事 2.0：镜头语言（推拉摇移、景深切换、转场）；新组件 章节导航。
- **v9.2** — Lottie / Rive 导入（JSON → 动效时间线）；新组件 动画图标集。
- **v9.3** — 生成艺术 2.0：风格化着色器；新组件 背景生成器。
- **v9.4** — 视频动效：滚动驱动视频、帧序列；新组件 视频卡片、英雄视频。
- **v9.5** — 无障碍动效 2.0：更细的动效偏好分级；新组件 动效偏好面板。
- **v9.6** — 性能 3.0：OffscreenCanvas、Worker 渲染；新组件 性能监视器。
- **v9.7** — 设计工具集成：Figma 插件脚手架、Framer 导出。
- **v9.8** — 原生 2.0：React Native / Flutter 组件示例。
- **v9.9** — 10.0 预备：10.0 弃用警告、`upgrading-10.md` 与 `usa-codemod-10`。
- **v10.0** — 全新架构：零依赖核心 < 10 KB、所有特效插件化、默认 WebGPU；npm `latest`。
