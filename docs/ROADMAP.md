# Motionary 路线图（10.0 之后）

10.0 已发布：全新架构 —— 零依赖核心 `motionary/core`（gzip 后不到 10 KB，实测约 2 KB：`createMotion()`、入场预设、`play` / `bind` / `reveal`、统一暂停与倍速）、所有特效插件化（`motionary/plugins`，按需 `createMotion().use(retro, cinema)`）、GPU 特效默认使用 WebGPU（不支持时回退 WebGL2 → Canvas）；移除 9.9 弃用的 `registerEffectPacks()`；`motionary` 与 `use-scroll-animate` 同时成为 npm `latest`。

下面是 10.1 → 11.0 的计划（2026-10-09 修订）。每个版本一个主题 + 一组新组件，另外贯穿两条长期主线：

- **主线 A · AI 可读组件**：让 AI 模型能自己发现、理解并正确使用每一个组件 —— 机器可读的组件清单 `components.json`、`llms.txt`、逐组件 Markdown 文档、`AGENTS.md` 提示指南，以及 `motionary-mcp` MCP 服务器。
- **主线 B · 自研通用前置模块 `motionary/runtime`**：**不再依赖 GSAP、SplitType、Lenis、Three.js、lottie-web、Matter.js、Embla 等第三方库，也不做"全家桶"大包。** Motionary 自己从零实现一个零依赖运行时：共享 ticker / RAF 调度器、tween + timeline 引擎与缓动、模块注册与清晰错误，以及一组按功能 / 格式拆分的模块。每个模块一个子路径（`motionary/runtime/<module>`），可 tree-shake，只为用到的部分付费；可单独通过 CDN 使用（ESM 与自注册 IIFE）；导入时不访问 `window`（SSR 安全），能放进 Web Worker 的部分支持 Worker；自带 TypeScript 类型；适用于纯 HTML `<script>`、ESM 打包器、React / Vue / Svelte / Angular。全部为原创实现，不复制、不逆向任何第三方库代码（GSAP 许可证禁止逆向工程）。

## 主线 B 的统一规则（从 10.1 起强制执行）

需要 runtime 模块（或官方第三方运行时，见下文）的组件，在以下 **5 处** 都必须写明前置条件：画廊卡片、Store 详情、文档页、README 对应章节、AI 组件清单（manifest）。前置条件固定包含：

1. **安装命令**：runtime 模块只需 `npm i motionary` 一次；官方运行时写出确切命令（如 `npm i @rive-app/canvas`）；
2. **导入路径**：如 `motionary/runtime/scroll`；
3. **CDN 地址**：可直接复制的 `<script>`（主版本固定，如 `https://cdn.jsdelivr.net/npm/motionary@11/dist/runtime.iife.js`）以及 ESM 地址；
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
- ✅ **v10.8** — drag-snap、glTF 动画、Lottie 文本层（原计划的跨端 3.0 —— 小程序适配、鸿蒙 ArkTS 示例、跨端预览器 —— 已移到 11.0 之后，见下文）。
  - 主线 B：**drag-snap 模块** —— 拖拽吸附 / 惯性轮播。
  - 格式：glTF 蒙皮 / 变形目标 / 动画；Lottie 文本层 + 表达式子集。
  - 新组件：`<usa-snap-carousel>`（`<usa-carousel>` 已被 6.2 轮播占用）。
- ✅ **v10.9** — 11.0 预备：11.0 弃用警告、`upgrading-11.md` 与 `usa-codemod-11`。
  - 主线 A：清单 Schema v2 定稿（11.0 起冻结）。
  - 主线 B：全部 runtime 模块审计、逐模块体积预算复核；dotLottie 主题 / 状态机子集；Draco / KTX2 官方解码器挂钩。
- ✅ **v11.0** — 稳定版：移除 10.9 弃用项（`<usa-three-scene>` / `defineThreeScene()`、主线程字符串绘制程序）；清单 Schema v2 冻结；**`motionary-mcp` 2.x 稳定版**（服务器版本保持 2.0.0，原计划的“1.0”标签不再使用）；`motionary/runtime/*` 转为稳定 API（12.0 前遵循 semver）；兼容性矩阵冻结（[compat-matrix.md](./compat-matrix.md)）；CDN 主版本 `@11`；`motionary` 与 `use-scroll-animate` 同时成为 npm `latest`。

完整的格式兼容性矩阵（格式 / 版本 / 支持特性 / 已知缺口 / 回退方案）见各模块文档页 `docs/runtime/<module>.md`。

<!-- v11-13:start -->
## 11.0 之后：11.1 → 13.0

依据 2026-10-09 的方向调整。贯穿全部版本的约束：

- **核心零直接运行时依赖**（`dependencies` 保持为空）；高级功能（Rive、Draco、KTX2 等专有格式）只用**可选 `peerDependencies`**，懒加载，缺失时给出清晰错误。
- 目标架构见 [architecture.md](./architecture.md)：**Public API**（HTML · React · Vue · Svelte · Solid · Angular）→ **Components** · **Motion Core** · **Runtime** → **Motion Intelligence & Tooling**（Manifest · MCP · Code Generation · Validation · Figma）。这是逻辑分层，不代表拆成独立 npm 包。分层导入规则由 `test/architecture.test.ts` 强制。
- 11.0 的导入路径在整个 11.x 保持可用：目录 / 子路径向分层靠拢时只加别名与弃用警告，**删除只发生在 12.0 / 13.0，并配 codemod**。
- 每个版本照旧：一个 PR、CI 全绿、固定体积预算（不自动上调）、`components/lite` ≤ 70 KB gzip。

### 11.x — 轻量、可摇树、可度量

- ✅ **v11.1 — 核心无副作用、可 tree-shake**：`package.json` 精确的 `sideEffects` 字段（只列出真正有副作用的 CSS / IIFE / 自动注册入口）、模块顶层 `/*#__PURE__*/` 标注、导入时不执行注册；新增 tree-shake 测试（只导入一个导出，打包结果中不得出现其他模块的代码）。（层：Motion Core · Components）
- ✅ **v11.2 — Source map 策略**：调试用的 `.map` 继续生成，但评估不再全部随 npm 发布 —— 实测 `npm pack` 体积（含 / 不含 `.map`），可选方案：source map 作为 GitHub Release 附件或独立包 `motionary-sourcemaps`；结论与数字写入文档并在 CI 中检查 pack 体积。（层：Tooling）
- ✅ **v11.3 — 真正有意义的性能指标进 CI**：按需加载后的首屏传输量、解析 / 执行时间、GPU 资源占用（纹理 / 缓冲区 / 上下文数量）、帧稳定性（掉帧率、长帧 p95）；Headless Chromium 实测，设预算，回归即失败。（层：Tooling）
- ✅ **v11.4 — Runtime 分级**：明确 **basic / standard / advanced** 三级 —— basic：ticker、tween、timeline、scroll、text、CSS / WAAPI 关键帧；standard：smooth、drag-snap、SVG、精灵图、GIF / APNG / WebP、Lottie；advanced：WebGL（gl）、3D 文件解析（glTF / OBJ / 解码器）、物理。普通网站只用 basic 永远不会为 WebGL、3D 解析或高级物理付费；清单、文档页与 Requires 徽章标明级别，体积预算按级别分组。（层：Runtime）
- **v11.5 — Public API 对齐**：Angular 包装与 React / Vue / Svelte / Solid 同等覆盖（`motionary/components/angular`），按分层提供子路径别名（Motion Core / Runtime / Components / Tooling），旧路径保留并发出弃用提示（12.0 / 13.0 删除，codemod 覆盖）。（层：Public API）
- **v11.6 — AI 层：本地确定性 + 可插拔 LLM**：`src/components/ai` 继续本地、确定性（正则 / 规则：离线、低延迟、可预测），新增**可选的、由用户提供的** LLM provider 接口，用于复杂的组合动效；LLM 输出一律经 JSON Schema 校验，失败时回退到本地规则。不内置任何服务商、不发出任何网络请求，除非用户传入 provider。（层：Tooling）
- **v11.7 — 组件统一契约（审计）**：为每个组件生成契约报告 —— 属性、事件、键盘交互、生命周期、减少动态效果、错误信息 —— 找出不一致之处，测试只报告不阻断。（层：Components）
- **v11.8 — 契约对齐（非破坏部分）**：能向后兼容的不一致先修（补齐事件、键盘交互、reduced-motion 行为、统一错误前缀）。（层：Components）
- **v11.9 — 12.0 预备**：弃用警告、`upgrading-12.md`、`usa-codemod-12`。（层：全部）

### 12.0 — 组件统一契约

- **v12.0**：所有组件的属性、事件、键盘交互、生命周期、减少动态效果、错误信息完全一致（必要处为破坏性变更，附 `usa-codemod-12`）；删除 11.8 起由 `usa:*` 取代的旧事件名（`usa-beat`、`usa-audio-error`、`usa-player-ready`、`usa-player-finish`、`usa-story-step`）；11.5 弃用的导入路径保留到 13.0（[public-api.md](./public-api.md)）；契约测试改为阻断。见 [upgrading-12.md](./upgrading-12.md)。npm `latest`。（层：Components · Public API）

### 12.x — 工具层与跨端

- **v12.1 — 跨端 3.0**（从 10.8 顺延）：小程序适配、鸿蒙 ArkTS 示例、跨端预览器。（层：Public API）
- **v12.2 — MCP 生成校验加强**：`validate_snippet` 在无头 DOM 中真实挂载生成的代码，检查前置条件、属性与事件是否符合契约。（层：Tooling）
- **v12.3 — Figma 导出**：`figma-plugin` 导出动效令牌与组件片段，可直接粘贴运行。（层：Tooling）
- **v12.4 — 交互式示例 / Playground**：每个组件一键复制可运行代码，清楚显示其 runtime 依赖与级别。（层：Tooling · Public API）
- **v12.5 — 版本兼容**：清单记录每个组件 / 模块的引入与变更版本，MCP 按用户安装的版本回答；兼容性矩阵按版本查询。（层：Tooling）
- **v12.9 — 13.0 预备**：弃用警告、`upgrading-13.md`、`usa-codemod-13`。

### 13.0 — 发现、复制、运行

- **v13.0**：MCP 生成校验、Figma 导出、交互式示例与版本兼容全部稳定；用户能快速找到组件、复制可运行代码、清楚看到每个组件的 runtime 依赖；目录与子路径按四层架构整理完成，删除 12.x 弃用项与 11.5 弃用的导入路径（附 codemod）。npm `latest`。（层：Tooling · 全部）
<!-- v11-13:end -->
