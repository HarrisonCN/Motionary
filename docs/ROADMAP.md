# Motionary 路线图（10.0 之后）

10.0 已发布：全新架构 —— 零依赖核心 `motionary/core`（gzip 后不到 10 KB，实测约 2 KB：`createMotion()`、入场预设、`play` / `bind` / `reveal`、统一暂停与倍速）、所有特效插件化（`motionary/plugins`，按需 `createMotion().use(retro, cinema)`）、GPU 特效默认使用 WebGPU（不支持时回退 WebGL2 → Canvas）；移除 9.9 弃用的 `registerEffectPacks()`；`motionary` 与 `use-scroll-animate` 同时成为 npm `latest`。

下面是 10.1 → 11.0 的计划（2026-10-09 修订）。每个版本一个主题 + 一组新组件，另外贯穿两条长期主线：

- **主线 A · AI 可读组件**：让 AI 模型能自己发现、理解并正确使用每一个组件 —— 机器可读的组件清单 `components.json`、`llms.txt`、逐组件 Markdown 文档、`AGENTS.md` 提示指南，以及 `motionary-mcp` MCP 服务器。
- **主线 B · 自研通用前置模块 `motionary/runtime`**：**不再依赖 GSAP、SplitType、Lenis、Three.js、lottie-web、Matter.js、Embla 等第三方库，也不做"全家桶"大包。** Motionary 自己从零实现一个零依赖运行时：共享 ticker / RAF 调度器、tween + timeline 引擎与缓动、模块注册与清晰错误，以及一组按功能 / 格式拆分的模块。每个模块一个子路径（`motionary/runtime/<module>`），可 tree-shake，只为用到的部分付费；可单独通过 CDN 使用（ESM 与自注册 IIFE）；导入时不访问 `window`（SSR 安全），能放进 Web Worker 的部分支持 Worker；自带 TypeScript 类型；适用于纯 HTML `<script>`、ESM 打包器、React / Vue / Svelte / Angular。全部为原创实现，不复制、不逆向任何第三方库代码（GSAP 许可证禁止逆向工程）。

## 主线 B 的统一规则（从 10.1 起强制执行）

需要 runtime 模块（或官方第三方运行时，见下文）的组件，在以下 **5 处** 都必须写明前置条件：画廊卡片、Store 详情、文档页、README 对应章节、AI 组件清单（manifest）。前置条件固定包含：

1. **安装命令**：runtime 模块只需 `npm i motionary` 一次；官方运行时写出确切命令（如 `npm i @rive-app/canvas`）；
2. **导入路径**：如 `motionary/runtime/scroll`；
3. **CDN 地址**：可直接复制的 `<script>`（主版本固定，如 `https://cdn.jsdelivr.net/npm/motionary@10/dist/runtime.iife.js`）以及 ESM 地址；
4. **引入顺序与注册代码**：先 `use(scroll)`（会同时注册核心），再注册组件；CDN 先加载 `runtime.iife.js`，再加载模块 IIFE（自动注册）；
5. **最小用法示例**。

Store 卡片显示 **「Requires: motionary/runtime/<module>」** 徽章（官方运行时为 `Requires: @rive-app/canvas` 等）。缺少模块时组件显示并抛出清晰错误（包含上面几项与文档链接）。CI 的 `npm run check:peer-docs` 检查 5 处是否齐全；每个模块有固定的 gzip 体积预算，CI 强制（`size-budget.json`）。

## 格式兼容：每种格式一个独立加载器模块

`motionary/runtime` 尽可能兼容常见动画 / 资源格式，全部自研、零依赖，每种格式一个可 tree-shake 的加载器模块，各有体积预算、真实样例文件测试（自制或 CC0 / CC-BY 样例并注明出处）、文档页兼容性表格与 AI 清单条目：

- **矢量**：Lottie JSON（形状、预合成、遮罩 / 轨道遮罩、修剪路径、渐变、文本层、表达式子集）+ dotLottie（`.lottie` zip，主题 / 状态机可行子集）；SVG（SMIL `animate` / `animateTransform` / `animateMotion` 回放、路径变形、CSS 动画 SVG）。
- **CSS / Web**：CSS `@keyframes` 与 Web Animations API 关键帧导入 timeline；Motion / Framer 风格关键帧 JSON。
- **位图 / 序列**：精灵图（TexturePacker / Aseprite JSON）、GIF / APNG / 动画 WebP 拆帧到 canvas、图片序列、视频（MP4 / WebM）纹理与滚动拖动。
- **3D**：glTF 2.0 / GLB（网格、PBR 基础、蒙皮、变形目标、动画）、OBJ / MTL。
- **物理 / 数据**：自定义、带版本号的场景 JSON（`motionary-scene@1`）。

### 使用官方第三方运行时的组件（及原因）

只有我们**无法合理自行实现**的格式才使用官方运行时，一律作为**可选** `peerDependencies`（`peerDependenciesMeta.optional: true`），首次使用时懒加载，缺失时清晰报错，并同样满足 5 处前置条件规则 + Requires 徽章：

| 组件 / 功能 | 官方运行时 | 原因 |
|---|---|---|
| `<usa-rive>`（10.6） | `@rive-app/canvas`（或 `@rive-app/webgl2`） | `.riv` 是 Rive 的专有二进制格式，没有公开的完整规范，自研无法保证正确性 |
| Lottie 全保真模式（可选，10.6+） | `lottie-web` | 自研播放器只覆盖文档列出的子集；需要子集之外特性（3D 图层、效果等）时可切换到官方播放器 |
| dotLottie 完整状态机（可选，10.9） | `@lottiefiles/dotlottie-web` | 完整状态机规范庞大且仍在演进，自研只做子集 |
| glTF Draco / KTX2(Basis) 压缩（可选，10.9） | `draco3d`、`basis_universal` 官方解码器 | 专用压缩解码器（WASM），自研成本与风险过高 |

## 各版本计划

- ✅ **v10.1** — 插件生态 + AI 清单 + runtime 核心：插件开发脚手架（`create-motionary-plugin`）、插件签名校验（SRI 风格 SHA-256 完整性）与版本兼容检查。
  - 主线 A：机器可读组件清单 `components.json`（Pages 根目录 + npm 包内 `motionary/manifest.json`，带 JSON Schema），每个组件包含：标签名、attributes、事件、插槽、方法、导入路径、CDN URL、最小示例、前置条件；Pages 根目录提供 `llms.txt` 与 `llms-full.txt`，均在构建时由源码生成。
  - 主线 B：**runtime 核心** —— 共享 ticker / RAF 调度器、tween + timeline 引擎与缓动、`use()` / `requireModule()` 注册 API 与清晰错误、「Requires: motionary/runtime/…」徽章、前置条件模板、`check:peer-docs`（检查 runtime 模块文档与 5 处前置条件）、清单列出 runtime 模块。
  - 格式：CSS `@keyframes` + WAAPI 关键帧（`motionary/runtime/format-css`）、Motion / Framer 关键帧 JSON（`motionary/runtime/format-motion`）。
  - 新组件：插件详情卡 `<usa-plugin-card>`（Requires: motionary/runtime）、安装按钮 `<usa-install-button>`。
- ✅ **v10.2** — 核心 DSL 化：`motionary/core` 直接支持 `data-motion` 声明式语法。
  - 主线 A：逐组件 Markdown 文档（`/docs/components/<tag>.md`，由清单生成）；仓库根目录新增 `AGENTS.md` 与提示指南。
  - 主线 B：**scroll 模块**（`motionary/runtime/scroll`）—— pin、scrub、markers、start / end 规则（自研，功能对标 ScrollTrigger，但不复制其代码或 API）。
  - 格式：SVG SMIL 回放、路径变形、CSS 动画 SVG（`motionary/runtime/format-svg`）。
  - 新组件：动效检查器面板、`<usa-scroll-scene>`（Requires: motionary/runtime/scroll）。
- ✅ **v10.3** — View Transitions 2.0：跨文档页面转场、共享元素动画。
  - 主线 B：**text 模块** —— 逐字 / 逐词 / 逐行拆分（保留可访问文本）。
  - 格式：精灵图（TexturePacker / Aseprite JSON）、图片序列（`motionary/runtime/format-sprite`）。
  - 新组件：路由转场容器、`<usa-text-splitter>`（`<usa-split-text>` 已被 4.x 文本组件占用）。
- ✅ **v10.4** — 滚动驱动 3.0：原生 `animation-timeline` 优先、JS 回退插件化。
  - 主线 A：发布 `motionary-mcp` MCP 服务器（`npx motionary-mcp`，stdio）：`list_components`、`search_components`、`get_component`、`get_example`、`scaffold_snippet`（自动带上前置条件）。
  - 主线 B：**smooth 模块** —— 平滑滚动（减少动态效果时停用）。
  - 格式：GIF（自研 LZW）、APNG、动画 WebP 拆帧到 canvas。
  - 新组件：滚动进度环、视差分层容器、`<usa-smooth-scroll>`。
- ✅ **v10.5** — WebGPU 特效 2.0：计算着色器粒子、后处理链。
  - 主线 B：**gl 模块** —— 迷你 WebGL2 场景（网格 / 基础几何体、相机、灯光、着色器材质；不是 Three.js 克隆）。
  - 格式：OBJ / MTL、glTF 2.0 / GLB 基础、视频纹理。
  - 新组件：粒子画布、着色器背景、`<usa-gl-scene>`（保留别名 `<usa-three-scene>`）。
- ✅ **v10.6** — 动效设计令牌 2.0：W3C Design Tokens 格式导入导出。
  - 主线 B：**vector 模块** —— 矢量动画播放器，支持文档列出的 Lottie JSON 子集（形状、变换、修剪路径、基础遮罩、预合成、渐变；文档列出不支持的特性）+ dotLottie。
  - 官方运行时：`<usa-rive>`（Requires: @rive-app/canvas，可选 peer，懒加载）。
  - 新组件：令牌编辑器、`<usa-lottie-player>`、`<usa-rive>`。
- ✅ **v10.7** — AI 辅助动效：自然语言 → 动效描述、动效建议。
  - 主线 A：MCP 2.0 —— `suggest_motion`、`validate_snippet`；AI 使用评测集（运行 AI 写的片段检验能否直接工作）。
  - 主线 B：**physics 模块** —— 2D 刚体（圆 / 盒 / 多边形）、约束；场景 JSON `motionary-scene@1`。
  - 新组件：动效提示输入框、`<usa-physics-playground>`。
- ✅ **v10.8** — 跨端 3.0：小程序适配、鸿蒙 ArkTS 示例。
  - 主线 B：**drag-snap 模块** —— 拖拽吸附 / 惯性轮播。
  - 格式：glTF 蒙皮 / 变形目标 / 动画；Lottie 文本层 + 表达式子集。
  - 新组件：跨端预览器、`<usa-snap-carousel>`（`<usa-carousel>` 已被 6.2 轮播占用）。
- ✅ **v10.9** — 11.0 预备：11.0 弃用警告、`upgrading-11.md` 与 `usa-codemod-11`。
  - 主线 A：清单 Schema v2 定稿（11.0 起冻结）。
  - 主线 B：全部 runtime 模块审计、逐模块体积预算复核；dotLottie 主题 / 状态机子集；Draco / KTX2 官方解码器挂钩。
- **v11.0** — 下一代：核心继续瘦身（目标 < 5 KB）、移除 10.9 弃用项；清单 Schema v2 与 `motionary-mcp` 1.0 稳定版；`motionary/runtime/*` 转为稳定 API；npm `latest`。

完整的格式兼容性矩阵（格式 / 版本 / 支持特性 / 已知缺口 / 回退方案）见各模块文档页 `docs/runtime/<module>.md`。
