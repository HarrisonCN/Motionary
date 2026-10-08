# 路线图（4.0 之后）

> 4.0.0 已完成 API 统一：`timeline()` 取代 `sequence()`，`sharedTransition()` 取代 `connectedAnimation()`，`<usa-auto-animate>` 取代 `<usa-flip-list>`。以下为 4.x → 5.0 的规划，每个版本一个 PR，按需调整。

- ✅ **v4.1** — 滚动驱动时间线：`timeline().scrub()` 优先使用原生 `ScrollTimeline` / `ViewTimeline`（脱离主线程），JS 作为回退。
- **v4.2** — 动效设计令牌：统一的时长 / 缓动 / 弹簧令牌（CSS 变量 + JSON），支持从 Figma Tokens / Style Dictionary 导入。
- **v4.3** — 文本进阶：按字 / 词 / 行拆分的 `splitText()`，支持中日韩文字与 RTL，配合 `timeline()` 逐字编排。
- **v4.4** — 无障碍增强：每个组件提供“静态替代”与 `aria-live` 规范，新增运动敏感度分级与自动化 a11y 回归测试。
- **v4.5** — 性能与体积：按需加载 CSS、共享 rAF 调度器、动画数量自动降级，组件整体 gzip 目标 ≤ 70KB。
- **v4.6** — 实验室 2.0：时间线可视化编辑（关键帧轨道）、保存 / 分享预设，并可导出为 `<usa-timeline>` 标记。
- **v4.7** — 原生壳集成：WinUI 3、.NET MAUI、Flutter 的官方桥接示例包，支持系统“减少动态效果”与主题自动同步。
- **v4.8** — 3D 与 WebGL 扩展：基于 `glQuad()` 的粒子 / 后处理小型预设库，统一 WebGL 回退与电量 / 帧率自适应。
- **v4.9** — 5.0 预备：标记计划移除或重命名的 API 并输出一次性弃用警告，发布 `upgrading-5.md` 与自动迁移脚本（codemod）。
- **v5.0** — 下一代主版本：仅支持现代浏览器（原生 View Transitions / Scroll Timeline 基线），移除 4.9 弃用的 API，统一的插件式效果注册机制。
