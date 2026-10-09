# Motionary 路线图（10.0 之后）

10.0 已发布：全新架构 —— 零依赖核心 `motionary/core`（gzip 后不到 10 KB，实测约 2 KB：`createMotion()`、入场预设、`play` / `bind` / `reveal`、统一暂停与倍速）、所有特效插件化（`motionary/plugins`，按需 `createMotion().use(retro, cinema)`，每个插件只引入自己的特效包）、GPU 特效默认使用 WebGPU（不支持时回退 WebGL2 → Canvas）；移除 9.9 弃用的 `registerEffectPacks()`（改用 `registerAllPlugins()`，`npx usa-codemod-10 --write src` 自动改写）；`motionary` 与 `use-scroll-animate` 同时成为 npm `latest`。

下面是 10.1 → 11.0 的计划。每个版本一个主题 + 一组新组件，另外贯穿两条长期主线：

- **主线 A · AI 可读组件**：让 AI 模型能自己发现、理解并正确使用每一个组件 —— 机器可读的组件清单、`llms.txt`、逐组件 Markdown 文档、`AGENTS.md` 提示指南，以及 `motionary-mcp` MCP 服务器。
- **主线 B · 依赖第三方插件的组件**：基于 GSAP / ScrollTrigger、SplitType、Lenis、Three.js、lottie-web、Rive、Matter.js、Embla Carousel 等成熟库的组件与特效。这些库一律声明为**可选** `peerDependencies`（`peerDependenciesMeta.optional: true`），核心与其他组件不受影响；组件在首次使用时懒加载对应库，缺失时抛出清晰的错误（例如 `[motionary] <usa-three-scene> 需要 three：npm i three，或通过 CDN 引入后再注册`），而不是静默失败。

## 主线 B 的统一规则（从 10.1 起对每个依赖插件的组件强制执行）

每个依赖第三方库的组件，在以下 **5 处** 都必须写明前置条件：画廊卡片、Store 详情、文档页、README 对应章节、AI 组件清单（manifest）。前置条件固定包含 4 项：

1. **安装命令**：如 `npm i gsap`（多个库写在一条命令里）；
2. **CDN 替代方案**：可直接复制的 `<script>` / `import` URL（固定版本号）；
3. **引入顺序与注册代码**：先引入哪个库、是否需要 `gsap.registerPlugin(ScrollTrigger)` 之类的注册、再如何注册 Motionary 组件；
4. **最小用法示例**：能直接运行的一段 HTML / JS。

Store 卡片显示 **「Requires: X」** 徽章（如 `Requires: GSAP + ScrollTrigger`），点开详情即可看到上面 4 项。从 10.1 起 CI 增加 `check:peer-docs`，任何一处缺失都会让构建失败。

## 各版本计划

- **v10.1** — 插件生态 + AI 清单 + 第三方插件基础设施：插件开发脚手架（`npm create motionary-plugin`）、插件签名校验与版本兼容检查。
  - 主线 A：发布机器可读组件清单 `components.json`（Pages 根目录 + npm 包内 `motionary/manifest.json`，带 JSON Schema），每个组件包含：标签名、属性 / attributes、事件、插槽、导入路径、CDN URL、最小示例、peer 依赖；Pages 根目录提供 `llms.txt`（索引）与 `llms-full.txt`（全部组件的完整说明），均在构建时由源码生成，保证不过期。
  - 主线 B：`requirePeer()` 懒加载器与统一错误提示、`peerDependenciesMeta` 规范、Store 「Requires: X」徽章、前置条件区块模板与 `check:peer-docs`（本版先用于新组件）。
  - 新组件：插件详情卡、安装按钮（一键复制 npm 命令或 CDN 代码）。
- **v10.2** — 核心 DSL 化：`motionary/core` 直接支持 `data-motion` 声明式语法（无需整个 DSL 包）。
  - 主线 A：逐组件 Markdown 文档（`/docs/components/<tag>.md`，由清单生成，与 `llms-full.txt` 同源）；仓库根目录新增 `AGENTS.md` 与提示指南（如何让 AI 选组件、写最小示例、避免常见误用）。
  - 主线 B：首个依赖插件的组件 —— GSAP + ScrollTrigger 桥接（`motionary/peer/gsap`，把 Motionary 特效挂到 GSAP 时间线上）。
  - 新组件：动效检查器面板、`<usa-scroll-scene>`（Requires: GSAP + ScrollTrigger）。
- **v10.3** — View Transitions 2.0：跨文档页面转场、共享元素动画插件。
  - 主线 B：文字拆分组件 `<usa-split-text>`（Requires: SplitType），逐字 / 逐词 / 逐行入场。
  - 新组件：路由转场容器、`<usa-split-text>`。
- **v10.4** — 滚动驱动 3.0：原生 `animation-timeline` 优先、JS 回退插件化。
  - 主线 A：发布 `motionary-mcp` MCP 服务器（`npx motionary-mcp`，stdio），工具：`list_components`、`search_components`、`get_component`、`get_example`、`scaffold_snippet`（按框架 / CDN / npm 生成可运行片段，自动带上 peer 前置条件）；数据直接读取清单。
  - 主线 B：平滑滚动组件（Requires: Lenis）。
  - 新组件：滚动进度环、视差分层容器、`<usa-smooth-scroll>`。
- **v10.5** — WebGPU 特效 2.0：计算着色器粒子、后处理链（辉光、色差、景深）。
  - 主线 B：Three.js 场景组件（Requires: three；加载 glTF 时另需 `three/addons` 的 GLTFLoader，文档写明引入路径）。
  - 新组件：粒子画布、着色器背景、`<usa-three-scene>`。
- **v10.6** — 动效设计令牌 2.0：W3C Design Tokens 格式导入导出、主题级动效曲线。
  - 主线 B：完整保真的 Lottie / Rive 播放器（Requires: lottie-web / @rive-app/canvas），与 9.2 的内置 `lottieToKeyframes()` 轻量转换并存，文档说明何时选哪个。
  - 新组件：令牌编辑器、`<usa-lottie-player>`、`<usa-rive>`。
- **v10.7** — AI 辅助动效：自然语言 → 动效描述（本地规则引擎，可选接入模型）、动效建议。
  - 主线 A：MCP 服务器 2.0 —— 新增 `suggest_motion`、`validate_snippet`（检查标签、属性与 peer 前置条件是否齐全）；清单覆盖全部特效；加入 AI 使用评测集（给模型一组任务，检验生成代码能否直接运行）。
  - 主线 B：物理组件（Requires: matter-js）。
  - 新组件：动效提示输入框、`<usa-physics-playground>`。
- **v10.8** — 跨端 3.0：小程序（微信 / 支付宝）适配插件、鸿蒙 ArkTS 示例。
  - 主线 B：轮播组件（Requires: embla-carousel），类 Swiper 的手势、循环、自动播放，暂停遵循减少动态效果偏好。
  - 新组件：跨端预览器、`<usa-carousel>`。
- **v10.9** — 11.0 预备：11.0 弃用警告、`upgrading-11.md` 与 `usa-codemod-11`。
  - 主线 A：清单 Schema v2 定稿（11.0 起冻结），`llms.txt` / 文档 / MCP 全量对齐。
  - 主线 B：对全部依赖插件的组件做一次审计 —— `check:peer-docs` 扩展到所有历史组件，peer 版本范围与 CDN 链接统一更新。
- **v11.0** — 下一代：核心继续瘦身（目标 < 5 KB）、插件按需懒加载、移除 10.9 弃用项；组件清单 Schema v2 与 `motionary-mcp` 1.0 稳定版；`motionary/peer/*` 入口转为稳定 API；npm `latest`。
