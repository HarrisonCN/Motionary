# Motionary 路线图

## 14.x → 15.0 版本追踪（2026-10-11 起采用）

从 14.2 起，路线图按 **版本 / 状态 / 优先级 / 验收标准** 追踪。每个版本在发布前，都要以最新的 main、正式 Release 和必需 CI 的结果重新核对；表中的“建议”不是发布承诺。

**状态：** `[已发布]` 已进入正式 Release，不再加新功能 · `[在研]` 已有代码或 PR，但未达到合并门槛 · `[建议]` 建议按此方向安排 · `[条件]` 是否需要取决于前一阶段的测试结果，不为凑版本号而发布。
**优先级：** P0 = 发布阻断 / 安全 / 数据正确性；P1 = 核心产品能力；P2 = 体验与生态增强。

| 版本 | 状态 | 优先级 | 核心内容 | 发布验收标准 |
| --- | --- | --- | --- | --- |
| v14.0.0 | [已发布] | P0 | Motion Engine v2（`motionary/motion`），Scene Format v2 成为正式格式，`motionary/compat-v13` | 已发布（PR #144）。 |
| v14.1.0 | [已发布] | P1 | Motion Tokens 2.0（`motionary/tokens`：语义、距离、模式、DTCG、CSS、Figma Variables） | 已发布（PR #146）。 |
| v14.2.0 | [已发布] | P0 | Layout Motion 2.0（`motionary/motion/layout`）：FLIP 与缩放 / 圆角校正、布局组、可中断动画、共享 `layoutId` 元素、View Transitions（同文档 / 跨文档）及 FLIP 回退、reduced motion（[docs/layout-motion.md](./layout-motion.md)） | 已发布（PR #147）。验收：Node 20/22/24、Chromium/Firefox/WebKit 和体积检查全绿后才合并；lite ≤ 70 KB，现有预算均未提高，新入口有独立的 8 KB 预算。 |
| v14.3.0 | [已发布] | P1 | 创作画布基础（`motionary/studio/canvas`）：可视化选中、框选、多选、层级 / 锁定 / 隐藏、参考线与吸附（参考线、兄弟元素边缘 / 中心、网格）、指针与触控的拖拽 / 缩放 / 旋转及画布双指缩放、键盘导航与微移、无障碍选择模型（[docs/studio-canvas.md](./studio-canvas.md)） | 已发布（14.3.0）。验收：每次编辑都是可在 Scene Format v2 上无损重放的操作，并经由时间轴编辑器的撤销 / 重做；不使用 window / document 全局监听（测试断言监听数回到基线）；Chromium / Firefox / WebKit 用鼠标与触控指针模拟（手机视口）测试；lite ≤ 70 KB，现有预算均未提高，新入口独立 12 KB 预算。**真机清单（iOS Safari、Android Chrome、触控笔、触控板、读屏）尚待在真实设备上执行**，见 docs/studio-canvas.md。 |
| v14.4.0 | [已发布] | P0 | Motion Studio 1.0（`motionary/studio`）：时间轴 UI（轨道与轨道组：折叠 / 静音 / 锁定；时间标尺；可拖动播放头；缩放）、关键帧拖动 / 框选 / 多选移动 / 复制粘贴及吸附到帧和其他关键帧、曲线编辑（cubic-bezier 手柄、预设、弹簧参数）、属性检查器、逐帧预览与确定性跳转、经现有历史的撤销重做、Scene v2 / 工程文件保存与读取；组合 13.6 时间轴编辑模型与 14.3 画布，不重复实现（[docs/studio.md](./studio.md)） | 已发布（14.4.0）。验收：测试仅通过 UI API / DOM（不改 JSON）建立多轨动画，保存、在新 Studio 中重新打开后采样帧与舞台 DOM 一致；导出 / 导入回归测试通过；时间轴为 `role="grid"`，键盘导航与 ARIA 测试通过；除手势期间外无全局监听（测试断言监听数回到基线）；Chromium / Firefox / WebKit 鼠标、键盘与触控指针（手机视口）测试；lite ≤ 70 KB，现有预算均未提高，新入口独立 25 KB 预算（含其引用的画布与编辑模型）。**真机清单（iOS Safari、Android Chrome、触控笔、触控板、读屏）尚待在真实设备上执行**，见 docs/studio.md。 |
| v14.5.0 | [已发布] | P1 | 工程与资源工作流（`motionary/studio/assets`）：图片、SVG、字体、视频、音频资源引用（`url()` 与 `*src` 属性）；相对路径解析并限制在工程目录内（越界、绝对路径、协议、编码穿越均拒绝）；离线工程包（`motionary-studio-pack` v1，base64 + CRC-32）；缺失 / 变更资源清单与按内容或文件名的重新链接建议；脚本类文件从不打包、解包或执行 | 工程迁移到另一台设备后能找到资源，或列出缺失项；资源路径限制在允许的工程目录内；不自动执行导入脚本。 |
| v14.6.0 | [已发布] | P1 | AI 创作助手 2.0（`motionary/studio/ai`）：提示词 → Scene v2 op（沿用 `applyCanvasOps` 格式 + add-layer / remove-layer / set-layer / set-component）；按选区局部修改；组件与版本匹配；修复建议（最接近的标签、移除当前版本没有的组件、默认缓动）；Schema + 兼容性 + 无头渲染 + 可选 MCP / 浏览器校验后才预览；可插拔模型适配器 + 确定性 mock；模型输出仅作为数据解析；motionary-mcp 2.2 的 check_compatibility / suggest_fix / validate_snippet / suggest_motion 接受 Scene v2 | 每次 AI 编辑都是可逐条接受 / 拒绝的结构化 diff，接受部分作为一个撤销步骤写入历史；校验失败不提供任何 op，工程不变（单元测试 + Chromium 规格 test/browser/studio-ai.spec.mjs）。 |
| v14.7.0 | [已发布] | P1 | 输出与预览可靠性（`motionary/studio/export`）：工程 → 独立 HTML/CSS（JS 可选）；时间线烘焙为 CSS `@keyframes`（缓动 / 离散 / 自定义属性的段逐帧采样，所以每个帧时刻的值与 `sampleTimelineDoc` 一致）；资源复制到 `assets/` 或内联为单文件；`frameDigest` 帧指纹；可续跑的帧导出作业 + 适配器接口（独立于基础导出，不内置视频编码器） | 独立导出的作品无需编辑器、无需网络即可运行；同一 Scene 两次导出逐字节相同，帧时刻的计算样式与采样值一致（Chromium / Firefox / WebKit）；帧导出作业失败可从检查点续跑，且不阻塞基础导出；新入口独立预算（`motionary/components/studio-export` 15 KB，实测 13.49 KB），lite ≤ 70 KB，现有预算均未提高（[docs/studio-export.md](./studio-export.md)）。 |
| v14.8.0 | [已发布] | P2 | 模板与扩展生态（`motionary/studio/templates`）：模板包 `motionary-template` v1（工程包 + 许可证 / 前置模块 / 令牌主题 / 完整性）、安装 / 预览 / 卸载、可信清单 | 模板可安装、预览、卸载，卸载后工程逐字节还原；许可与前置模块在 API / 文档 / MCP 三处一致；越界路径、超限、签名错误、脚本类文件一律拒绝且工程不变。实现：SHA-256 完整性（纯 JS）+ 可选 Ed25519 发布者签名（WebCrypto）；安装 = 一个撤销步骤；预览 = 14.7 导出的无脚本单文件；内置 3 个 MIT 起步模板；motionary-mcp 2.3 `list_templates` / `get_template` / `export_scene`。新入口独立预算（`motionary/components/studio-templates` 19 KB，实测 17.87 KB，含 14.7 导出；不含预览 11.25 KB / 12 KB），lite ≤ 70 KB，现有预算均未提高（[docs/studio-templates.md](./studio-templates.md)）。Pages 模板画廊与 Gateway 租户模板目录推迟到 15.5。 |
| v14.9.0 | [已发布] | P0 | v15 兼容准备：15.0 删除清单定稿（[docs/deprecations-v15.md](./deprecations-v15.md)：`motionary/compat-v13` 整个入口 + `motionary codemod <5–10>`）全部发出开发期警告（`installCompatV13()` 安装时也提示，链接 v15 锚点）；`npx motionary doctor --v15`（compat 导入 / require、旧 codemod 脚本、旧数据）；`npx motionary migrate --to 15`（默认演练；`--write` 先写 `.bak` / `.bak.N`，旧数据原地转 Scene v2，删除可机械移除的 `installCompatV13`，其余列入 manual，损失报告 JSON）；Studio 工程损坏 / 截断 / 未知版本只报告不改写；`15.0.0-rc.1` 仅发布到 `next` | doctor 找到每一处旧 API；迁移语料（13.x fixtures + 内置模板）逐字节等于黄金 Scene v2、0 损失；`next` 与 `latest` 隔离。说明：`motionary-scene@1` 是物理运行时（`motionary/runtime/format-scene`，`<usa-physics-playground>`）的世界 / 刚体格式，不是 Scene Format 的 v1；Scene v2 无法表达刚体与物理世界，所以原计划中的“`motionary-scene@1` 写出改为只读”取消，15.0 不改动它；14.x 期间没有新增其他 @deprecated 类型。无新入口、无预算变化（[docs/migrating-to-v15.md](./migrating-to-v15.md)）。 |
| v15.0.0 | [已发布] | P0 | **major** · Motion Studio 2.0 稳定主线（`motionary/studio/app`）：把 canvas / studio / assets / ai / export / templates 组合成创作闭环；删除 `motionary/compat-v13`（14.0 起预告，14.9 警告） | 从零创建 → 编辑 → 预览 → 保存 → 重开 → 导出的完整闭环（三浏览器 + 手机视口）通过，重开前后帧指纹一致；升级不丢工程；附 codemod 与 migrating-to-v15；14.9.x 成为 `v14-lts`；lite ≤ 70 KB、零依赖。 |

### 15.x → 17.0（2026-10-13 起规划）

全部为 `[建议]`，发布前同样以 main、Release 与必需 CI 重新核对；`[条件]` 版本没有内容就跳过，不为版本号发版。

| 版本 | 状态 | 优先级 | 核心内容 | 发布验收标准 |
| --- | --- | --- | --- | --- |
| v15.1.0 | [已发布] | P1 | AI 编辑溯源与 Gateway 协同：`motionary/studio/provenance`（历史条目带生成者 / 模型 / 请求 id / 时间，与改动同一撤销步；AI 过滤、面板、`matchLineage`）；motionary-mcp 2.4 `propose_edit` 只返回结构化提案 + diff + provenance，不写工程 | 未经人确认的改动 0 写入（测试）；已应用 AI 改动经 requestId 对到 Gateway 调用 lineage —— 对 **Gateway 15.1 canary** 验证（`examples/gateway-provenance`），**待 Gateway 15.1 稳定版**。导出报告列出 AI 改动推迟到 15.2。 |
| v15.2.0 | [已发布] | P1 | 跨平台导出 2.0：`motionary/studio/native` 从 Scene v2（或 timeline / Studio 工程）导出 CSS / WXSS / ArkTS + Jetpack Compose / SwiftUI 支持子集；`motionary export --scene … --report --strict` | 每个导出带逐项损失报告（每个属性恰好一次 supported / lost + 原因，测试）；五个目标的黄金文件测试 + 括号 / 字符串平衡检查（CI 无原生编译器）；独立入口与预算行；报告列出 15.1 溯源记录（`report.ai`，15.1 推迟项）。 |
| v15.3.0 | [已发布] | P1 | 无障碍与响应式动效：`motionary/studio/a11y` 敏感度分级（full / gentle / reduced）+ 断点变体（`meta["motionary:variants"]`，`resolveVariant` 输出普通 Scene v2）；tokens 内置 `gentle` 模式；Studio 焦点环与曲线编辑器角色修正 | 同一变体 + 分级在 Studio、独立导出与原生导出中帧摘要一致（测试）；axe WCAG 2.1 A/AA + 纯键盘 + 200% 缩放 + reduced-motion 浏览器用例（CI 三浏览器）；工具栏宽度 / 分级切换推迟；真机清单（iOS VoiceOver / Android TalkBack / Windows 强制颜色）**未执行**。 |
| v15.4.0 | [跳过] | P2 | 渲染后端（WebGPU / 资源调度） | 已按条件评估并跳过：15.2 性能数据中每帧脚本 6.25 ms（预算 8）、长任务 0、GPU 资源均在预算内，丢帧来自无头软件合成器而非 Canvas / WebGL；未做 WebGPU 后端，不发 15.4.0。真机轨迹证明 GPU 受限时再议。 |
| v15.5.0 | [已发布] | P2 | 团队工程与资源：`motionary/studio/store` —— `ProjectStore` 适配器（内存 / IndexedDB / 自带 HTTP 后端；Motionary 不自带服务器）、版本历史、乐观并发冲突检测、图层级三方合并、`toAppStorage` 接入 Studio 应用 | 参考后端 `examples/project-store-server`：每租户一个 store，跨租户读取 403 并审计，配额 429 并审计（CI 测试）；IndexedDB 浏览器用例三浏览器。Gateway 托管的 store、租户模板目录与 Pages 模板画廊推迟（Gateway 无 project-store 路由，后端可作为普通 HTTP 上游放在 Gateway 后面）。 |
| v15.9.0 | [已发布] | P0 | v16 准备：`motionary/scene/v3-preview`（Scene v3 草案：嵌套合成 / 组件即图层 / 一等 variants；`migrateToSceneV3` 预览 + 损失报告；`sceneV3ToV2`）；`doctor --v16` / `migrate --to 16`（15.x 只出报告，`--write` 留给 16.0，先写 `.bak`）；Studio `exportScene({ version: 2 })` + 开发期警告；motionary-mcp 2.5 `validate_scene` + 弃用提示 | 语料 v2 → v3 无损、回读 v2 与原文档相等、`frameDigest` 一致；16.0 每项变更都有警告 / doctor / 迁移 / 文档（docs/deprecations-v16.md）；`16.0.0-rc.1` 随后只发 `next` |
| v16.0.0 | [已发布] | P0 | **major** · Scene Format v3（嵌套合成、组件即图层、断点变体）+ motionary-mcp 3.0 | v2 → v3 无损迁移或逐项损失报告；可表达部分导出帧指纹不变；`v15-lts`；codemod + migrating-to-v16。 |
| v16.1.0 | [已发布] | P1 | 符号与实例：`motionary/scene/symbols`（符号 = Scene v3 `components`，实例 = `component` 图层；createSymbol / addInstance / setOverride / updateSymbol / detachInstance / renameSymbol / symbolUsage / validateSymbols，纯函数）；`symbolsToCss` 导出去重 | 一个符号多处实例、覆盖属性、更新主符号后所有实例一致（测试覆盖）；9 个实例的 CSS 中每个符号图层只有一个 `@keyframes` |
| v16.2.0 | [已发布] | P1 | Studio 插件 API（预览）：`motionary/studio/plugins`（清单显式权限 project:read / project:propose / panel / exporter；宿主按权限应答并审计每次调用；提议只交给 Studio 的 propose 回调、从不直接写入；Worker / 沙箱 iframe（CSP default-src none）/ 本地传输） | 第三方面板 / 导出器在受限沙箱中运行（三浏览器规格）；插件抛错 / 超时 / 消息洪泛 → 标记 crashed 并终止，Studio 与其他插件不受影响 |
| v16.3.0 | [已发布] | P1 | 性能预算进 Studio：`motionary/studio/budget`（编辑时测量独立导出物体积 raw + gzip、按属性类别的逐帧成本 composite 1 / paint 4 / layout 10；checkBudget；guardPublish 超预算不调用发布；createBudgetMeter 实时显示） | 编辑时实时显示导出物体积 / 帧成本（三浏览器规格）；超预算时“发布导出”被阻止（publish 回调不被调用，测试覆盖） |
| v16.9.0 | [已发布] | P0 | v17 准备：`motionary/scene/v3-preview` 改为独立转发模块（每会话首次调用警告一次，17.0 删除）；`DEPRECATIONS_V17`；`npx motionary doctor --v17` / `migrate --to 17`（默认预演，`--write` 先写 `.bak`，幂等）；`doctor --v15` / `migrate --to 15` 提示 17.0 删除（`v16-lts` 保留）；`17.0.0-rc.1`（`next`）随后单独发布 | 17.0 删除项全部有警告 + doctor 检出 + codemod + 文档锚点（docs/deprecations-v17.md、migrating-to-v17.md）；测试覆盖 |
| v17.0.0 | [已发布] | P0 | **major** · 删除 16.9 公告的弃用；新增 `mo-*` 别名（`usa-*` 保留、标记弃用，不早于未来 major 删除）；Studio / 插件 API / MCP 等保持实验性；LTS 策略；此后不再计划 major | lite 仍 ≤ 70 KB、零依赖；`v16-lts` 维护期写入 versions.md。 |

**破坏性变更规则：** 只在 major（15.0 / 16.0 / 17.0）出现；至少提前一个 minor 发出开发期弃用警告（生产构建剔除），并附 codemod、`migrating-to-vN.md` 与 `deprecations-vN.md`。

### 每个版本都必须满足的发布约束

1. `motionary/core`、`motionary/motion`、`components/lite`、WebGL 和编辑器工具彼此独立；Studio 不进入 lite。
2. lite 约 70 KB gzip 的固定预算不因新功能提高，`dependencies` 保持为空，直到 v17.0 结束（除非某个 major 明确重新定义并写明理由）；新增的大功能使用单独入口和独立预算，任何已有预算行都不静默上调。
3. 浏览器覆盖 Chromium、Firefox、WebKit；继续验证 SSR / Hydration 和移动端操作。
4. 工程格式、导出器和可视化时间轴必须支持确定性测试、回滚、恶意输入限制和迁移损失报告。
5. 必需 CI（Node 20/22/24、三种浏览器、体积 / Tree Shaking / 打包检查）为红灯时，一律不合并。

### 与 MCP Gateway 的联动

| 阶段 | 适用版本 | 优先级 | 目标 | 验收 |
| --- | --- | --- | --- | --- |
| I. 基础互通 | MCP 14.9 + Motionary 14.1+ | P1 | 保留 Gateway interop 测试，使用 Motionary MCP 的 check_compatibility、suggest_fix、validate_snippet | 工具调用统一授权；身份和租户可追溯；输出符合已公布的 Schema。 |
| II. 安全 AI 生成 | MCP 15.0 + Motionary 14.6 | P1 | 由 Gateway 管理 AI 的访问权限、预算和审计；Motionary 生成 / 修改 Scene v2 | 未授权的工具无法执行；生成的文档经过 Schema 和代码校验；提示注入拿不到额外权限。 |
| III. 编辑器协同 | MCP 15.x + Motionary 14.4–14.7 | P1 | AI 产生结构化 diff，Studio 展示差异，由用户批准、预览或撤销 | 人工确认前不修改工程；回滚稳定；每处改动都能关联到生成者和时间。 |
| IV. 资产与团队 | MCP 15.x + Motionary 14.8–15.0 | P2 | 多租户工程资源、版本管理、共享模板、审计与配额 | 不同租户的资源、密钥和缓存相互隔离；共享需要授权；导入资源不执行任意脚本。 |
| V. 产品闭环 | MCP 15.x + Motionary 15.0 | P1 | 自然语言 → Scene → Studio 编辑 → 浏览器测试 → 输出 HTML/CSS/JS | 示例工程端到端测试可重复；出错时报告具体步骤并给出修复方向。 |
| VI. 协议 3.0 | MCP 16 + Motionary 16.0 | P1 | motionary-mcp 3.0 工具 schema 与 Scene v3 | Gateway interop 用 MCP 3.0 通过；以 Gateway 实际发布为准。 |

Gateway 15.0 GA 仍受其门槛 A / B / C（72 小时 soak、专用硬件基线、外部安全复核）约束；在其通过前，Motionary 文档不写“已通过 Gateway 15 GA 验证”。

---

## 历史计划（10.0 → 13.x，归档）

以下是 10.0 之后的原始计划，保留作记录。其中的版本均已发布，最新状态见上表与 [CHANGELOG](../CHANGELOG.md)。

10.0 已发布：全新架构 —— 零依赖核心 `motionary/core`（gzip 后不到 10 KB，实测约 2 KB：`createMotion()`、入场预设、`play` / `bind` / `reveal`、统一暂停与倍速）、所有特效插件化（`motionary/plugins`，按需 `createMotion().use(retro, cinema)`）、GPU 特效默认使用 WebGPU（不支持时回退 WebGL2 → Canvas）；移除 9.9 弃用的 `registerEffectPacks()`；`motionary` 与 `use-scroll-animate` 同时成为 npm `latest`。

下面是 10.1 → 11.0 的计划（2026-10-09 修订）。每个版本一个主题 + 一组新组件，另外贯穿两条长期主线：

- **主线 A · AI 可读组件**：让 AI 模型能自己发现、理解并正确使用每一个组件 —— 机器可读的组件清单 `components.json`、`llms.txt`、逐组件 Markdown 文档、`AGENTS.md` 提示指南，以及 `motionary-mcp` MCP 服务器。
- **主线 B · 自研通用前置模块 `motionary/runtime`**：**不再依赖 GSAP、SplitType、Lenis、Three.js、lottie-web、Matter.js、Embla 等第三方库，也不做"全家桶"大包。** Motionary 自己从零实现一个零依赖运行时：共享 ticker / RAF 调度器、tween + timeline 引擎与缓动、模块注册与清晰错误，以及一组按功能 / 格式拆分的模块。每个模块一个子路径（`motionary/runtime/<module>`），可 tree-shake，只为用到的部分付费；可单独通过 CDN 使用（ESM 与自注册 IIFE）；导入时不访问 `window`（SSR 安全），能放进 Web Worker 的部分支持 Worker；自带 TypeScript 类型；适用于纯 HTML `<script>`、ESM 打包器、React / Vue / Svelte / Angular。全部为原创实现，不复制、不逆向任何第三方库代码（GSAP 许可证禁止逆向工程）。

## 主线 B 的统一规则（从 10.1 起强制执行）

需要 runtime 模块（或官方第三方运行时，见下文）的组件，在以下 **5 处** 都必须写明前置条件：画廊卡片、Store 详情、文档页、README 对应章节、AI 组件清单（manifest）。前置条件固定包含：

1. **安装命令**：runtime 模块只需 `npm i motionary` 一次；官方运行时写出确切命令（如 `npm i @rive-app/canvas`）；
2. **导入路径**：如 `motionary/runtime/scroll`；
3. **CDN 地址**：可直接复制的 `<script>`（主版本固定，如 `https://cdn.jsdelivr.net/npm/motionary@17/dist/runtime.iife.js`）以及 ESM 地址；
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
