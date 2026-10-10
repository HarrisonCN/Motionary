<div align="center">

# Motionary

**面向 Web 的滚动动画、动画 Web Components 与零依赖动效运行时。**

_原名 **use-scroll-animate**。旧 npm 包仍会作为别名，与 motionary 同版本、同构建一起发布。_

[![npm](https://img.shields.io/npm/v/motionary?style=flat-square)](https://www.npmjs.com/package/motionary) [![CI](https://github.com/HarrisonCN/Motionary/actions/workflows/ci.yml/badge.svg)](https://github.com/HarrisonCN/Motionary/actions/workflows/ci.yml) [![motionary/core size](https://deno.bundlejs.com/?q=motionary/core&badge)](https://bundlejs.com/?q=motionary/core) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](./LICENSE)

[English](./README.md) | **简体中文** | [日本語](./README_ja.md)

**[动画商店](https://harrisoncn.github.io/Motionary/showcase/)** · **[组件库](https://harrisoncn.github.io/Motionary/showcase/components.html)** · **[组件演练场](https://harrisoncn.github.io/Motionary/showcase/run.html)** · **[时间线编辑器](https://harrisoncn.github.io/Motionary/showcase/playground.html)** · **[滚动叙事](https://harrisoncn.github.io/Motionary/showcase/story.html)**

</div>

Motionary 让内容在滚入视口时自然登场，并提供 209 个开箱即用的 `<usa-*>` 动画自定义元素：卡片、按钮、物理效果、页面转场、生成式背景、Lottie、WebGL 等等。无论是纯 HTML，还是 React、Vue、Svelte、Solid、Angular，乃至 Electron、Tauri、WebView2 这类桌面 Web 视图，都能直接使用。运行时零依赖，每个入口都可 tree-shaking，并在 CI 中有固定的 gzip 体积预算；所有动画都遵循 `prefers-reduced-motion`。

> 13.0：发现 · 复制 · 运行。12.x 的工具链在 13.0 转为稳定版：MCP 挂载校验（`validate_snippet { mount: true }`）与按版本作答（`check_compat`）、Figma 插件导出、[组件演练场](https://harrisoncn.github.io/Motionary/showcase/run.html)、`npx motionary export` 和 `npx motionary compat`。11.5 起标记为弃用的导入路径已移除，详见 [升级到 13](#升级到-13)。

## 目录

[特性](#特性) · [安装](#安装) · [快速上手](#快速上手) · [运行时分级](#运行时与分级) · [组件](#组件演示与演练场) · [CLI](#cli) · [MCP 服务器与 AI](#mcp-服务器与-ai) · [Figma 插件](#figma-插件) · [无障碍](#无障碍) · [体积预算](#体积预算) · [升级到 13](#升级到-13) · [版本](#版本与兼容性) · [文档](#文档) · [参与贡献](#参与贡献) · [参考](#参考)

## 特性

- **214 个滚动显现预设**，分为 14 个系列（核心内置 33 个，`motionary/presets/extended` 再提供 181 个）：淡入、缩放、3D 翻转、clip-path 形状、模糊与遮罩、弹跳、景深、故障风，以及随滚动进度变化的 `scrub-*`。另有 `timeline()`、`staggerChildren()` 和 `parallax()`。
- **209 个 `<usa-*>` Web Components**：`motionary/components` 中按分类提供 91 个，另有 118 个小部件，每个都有独立入口（`motionary/widgets/<name>`）。此外还有 141 个效果，同样各有独立入口（`motionary/effects/<name>`）。
- **Motion Core**：`motionary/core` 提供的 `createMotion()`，插件化引擎，gzip 后约 2.5 KB（预算 10 KB）。
- **自研运行时**：`motionary/runtime`（ticker、tween、timeline）加 20 个模块，覆盖滚动场景、平滑滚动、文字拆分、SVG 变形、精灵图、GIF / APNG / WebP、Lottie 与 dotLottie、WebGL2、glTF / OBJ、2D 物理。模块分为三个等级，只为实际导入的部分付出体积。
- **适配所有框架**：`motionary/react`、`motionary/vue`、`motionary/svelte`、`motionary/solid`、`motionary/angular`，以及元素封装 `motionary/components/react` · `vue` · `svelte` · `solid`。在服务端导入不会产生任何副作用。
- **配套工具**：面向 AI 助手的 MCP 服务器、本地动效解析器（可接入你自己的 LLM）、Figma 插件、可导出 CSS / 小程序 WXSS / 鸿蒙 ArkTS 的 CLI，以及每个大版本的 codemod。
- **默认无障碍**：处处支持减少动态效果，提供面向用户的动效开关；所有元素遵循同一份组件契约（属性、事件、键盘、生命周期），由 CI 强制检查。

## 安装

```bash
npm i motionary
```

不想引入构建工具？直接用 CDN。URL 固定到大版本（`@13`）：

```html
<script src="https://unpkg.com/motionary@13/dist/index.umd.js"></script>            <!-- 滚动 API：window.ScrollAnimate -->
<script src="https://unpkg.com/motionary@13/dist/presets-extended.umd.js"></script> <!-- 再加 181 个预设 -->
<script src="https://unpkg.com/motionary@13/dist/components.umd.js"></script>       <!-- motionary/components 的元素：window.UsaComponents -->
<script src="https://unpkg.com/motionary@13/dist/widgets.umd.js"></script>          <!-- 小部件：window.UsaWidgets -->
```

也可以用 jsDelivr：`https://cdn.jsdelivr.net/npm/motionary@13/dist/…`。还在用 `use-scroll-animate`？它会继续以相同版本发布；要切换，只需在 import 和 URL 中替换包名（[详情](./docs/versions.md)）。

## 快速上手

### HTML：data 属性

```html
<h2 data-sa data-sa-animation="fade-in-up">Hello</h2>
<div data-sa data-sa-animation="bounce-in-up" data-sa-delay="150">Card</div>

<script type="module">
  import ScrollAnimate from 'motionary';
  import 'motionary/presets/extended'; // 可选：再加 181 个预设（bounce-in-up、clip-diamond……）
  ScrollAnimate.init();                // 自动处理所有 [data-sa]
</script>
```

每个选项都有对应的 `data-sa-*` 属性（[API 参考](./docs/API.md)）。

### JavaScript

```js
import ScrollAnimate, { staggerChildren, parallax } from 'motionary';

ScrollAnimate.observe('.card', { animation: 'zoom-in-up', duration: 800, easing: 'spring' });
staggerChildren(document.querySelector('.grid'), { animation: 'stagger-pop', stagger: 60 });
parallax('.hero-bg', { speed: 0.3 });
// 浏览器支持时使用原生滚动时间线，脱离主线程运行
ScrollAnimate.observe('.logo', { animation: 'scrub-spin', engine: 'css', viewRange: ['cover 0%', 'cover 100%'] });
```

### Motion Core（`motionary/core`）

```js
import { createMotion } from 'motionary/core';
import { retro, cinema } from 'motionary/plugins';

const motion = createMotion().use(retro, cinema);
motion.reveal('.card', 'fade-up', { stagger: 80 });       // 滚入时入场
motion.bind(button, 'vhs-glitch', { trigger: 'click' });  // 绑定到触发器的效果
await motion.play(hero, 'dolly-in', { duration: 900 });   // 播放一次并等待结束
```

更多内容：[docs/core.md](./docs/core.md)。

### Web Components

```html
<script type="module">
  import { defineComponents } from 'motionary/components';
  defineComponents(); // 或使用 'motionary/components/lazy' 的 lazyDefine()：只加载页面上出现的标签
</script>

<usa-card effect="holo">…</usa-card>
<usa-button deform="gooey">Buy</usa-button>
<usa-fx effect="confetti" trigger="click"><button>Celebrate</button></usa-fx>
```

### 框架

每个适配器都是独立入口，组件卸载时会自动清理。

```jsx
// React
import React from 'react';
import { createReactHooks } from 'motionary/react';
const { useScrollAnimate } = createReactHooks(React);

export function Card() {
  const ref = useScrollAnimate({ animation: 'fade-in-up' });
  return <div ref={ref}>Hello</div>;
}
```

```vue
<!-- Vue 3 -->
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { createVueComposables } from 'motionary/vue';
const { useScrollAnimate } = createVueComposables({ ref, onMounted, onUnmounted });
const { animateRef } = useScrollAnimate({ animation: 'zoom-in' });
</script>
<template><div ref="animateRef">Hello</div></template>
```

```svelte
<!-- Svelte 3–5 -->
<script>
  import { scrollAnimate } from 'motionary/svelte';
</script>
<div use:scrollAnimate={{ animation: 'flip-up' }}>Hello</div>
```

```jsx
// Solid
import { scrollAnimate } from 'motionary/solid';
scrollAnimate; // 保留指令导入（TypeScript）
export const Card = () => <div use:scrollAnimate={{ animation: 'blur-in-up' }}>Hello</div>;
```

```ts
// Angular（standalone）：使用 <usa-*> 元素
import { APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import { provideUsa } from 'motionary/angular';
// app.config.ts：providers: [provideUsa(APP_INITIALIZER, ['click', 'ui'])]   （要注册的分类）
@Component({ standalone: true, schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<usa-checkbox label="Motion" [checked]="on" (usa:change)="on = $any($event).detail.checked"></usa-checkbox>` })
export class Settings { on = false; }
```

SSR、Next.js、Nuxt、SvelteKit：[docs/frameworks-ssr.md](./docs/frameworks-ssr.md)。按分层列出的全部公开子路径：[docs/public-api.md](./docs/public-api.md)。

## 运行时与分级

`motionary/runtime` 是 Motionary 自研的动画运行时：共享的 ticker、tween 与 timeline 引擎，外加按功能或文件格式拆分的模块（`motionary/runtime/<module>`）。用到哪个模块，就用 `use()` 注册哪个。每个模块属于一个等级，且只依赖同级或更低等级的模块，所以只用基础功能的页面永远不会下载 WebGL、3D 或物理相关代码。

| 等级 | 模块 | 打包体积（gzip，13.0） | 预算 |
|---|---|---:|---:|
| **Basic（基础）** | core（ticker、tween、timeline）、`scroll`、`text`、`format-css`、`format-motion` | 10.83 KB | 12 KB |
| **Standard（标准）** | 基础 + `smooth`、`drag-snap`、`format-svg`、`format-sprite`、`format-gif`、`format-apng`、`format-webp`、`vector`（Lottie / dotLottie）、`lottie-state`；官方 Rive 运行时 | 33.74 KB | 37 KB |
| **Advanced（高级）** | 标准 + `gl`（WebGL2）、`format-gltf`、`format-obj`、`gltf-anim`、`gltf-decoders`（Draco / KTX2）、`physics`、`format-scene` | 54.55 KB | 60 KB |

```js
import { use } from 'motionary/runtime';
import { scroll } from 'motionary/runtime/scroll';
import { defineScrollScene } from 'motionary/components/widgets';

use(scroll);          // 先注册模块（会顺带注册 core）
defineScrollScene();  // 再注册依赖它的组件
```

需要运行时模块的组件会在组件库中显示 **Requires:** 标记；缺少模块时会抛出清晰的错误，告诉你如何安装、导入或从 CDN 加载。详见 [docs/runtime-tiers.md](./docs/runtime-tiers.md)，以及 [docs/runtime/](./docs/runtime/) 下每个模块的说明页。

## 组件、演示与演练场

| 页面 | 用途 |
|---|---|
| [动画商店](https://harrisoncn.github.io/Motionary/showcase/) | 在桌面和手机尺寸下预览、调整并复制所有预设与效果 |
| [组件库](https://harrisoncn.github.io/Motionary/showcase/components.html) | 每个 `<usa-*>` 元素的属性、前置依赖与等级 |
| [组件演练场](https://harrisoncn.github.io/Motionary/showcase/run.html) | 每个组件都是一个完整可运行的页面：编辑、**Run**、**Copy** 或 **Download .html**；支持 `run.html#usa-tilt` 这样的深链接 |
| [时间线编辑器](https://harrisoncn.github.io/Motionary/showcase/playground.html) | 可视化关键帧编辑，导出 `<usa-player>` 可播放的 JSON |
| [滚动叙事](https://harrisoncn.github.io/Motionary/showcase/story.html) | `<usa-story>` 滚动叙事模板 |
| [跨平台预览](https://harrisoncn.github.io/Motionary/showcase/xplat.html) | 同一个预设在 Web、小程序与鸿蒙 ArkUI 中的效果对比 |
| [demo/index.html](./demo/index.html) | 所有预设，无需构建（本地打开即可） |

可以按分类导入（`motionary/components/cards`）、全部导入（`motionary/components`）、使用按需加载 CSS 的构建（`motionary/components/lite`），或只导入单个小部件（`motionary/widgets/<name>`，例如 `motionary/widgets/toast-stack`）。全部元素：[docs/components.md](./docs/components.md)；每个元素的单独页面：[docs/components/](./docs/components/README.md)；全部入口：[docs/entry-points.md](./docs/entry-points.md)。

<details>
<summary><b><code>motionary/components</code> 中的 91 个元素</b></summary>

| 分类 | 入口 | 元素 |
|---|---|---|
| **滚动显现** | `motionary/components/reveal` | `<usa-reveal>` · `<usa-stagger>` · `<usa-scroll-progress>` · `<usa-scrolly>` |
| **文字** | `motionary/components/text` | `<usa-typewriter>` · `<usa-split-text>` · `<usa-scramble>` · `<usa-counter>` · `<usa-shimmer-text>` · `<usa-text-rotate>` · `<usa-wave-text>` · `<usa-glitch>` · `<usa-gradient-text>` · `<usa-handwriting>` · `<usa-scroll-highlight>` |
| **交互** | `motionary/components/interaction` | `<usa-ripple>` · `<usa-magnetic>` · `<usa-tilt>` · `<usa-spotlight>` · `<usa-press>` |
| **反馈** | `motionary/components/feedback` | `<usa-spinner>` · `<usa-skeleton>` · `<usa-progress>` · `<usa-toaster>` · `<usa-check>` |
| **背景** | `motionary/components/background` | `<usa-aurora>` · `<usa-particles>` · `<usa-grain>` · `<usa-marquee>` · `<usa-acrylic>` · `<usa-grid-glow>` · `<usa-blobs>` · `<usa-water-ripple>` · `<usa-dot-network>` |
| **过渡** | `motionary/components/transitions` | `<usa-dialog>` · `<usa-accordion>` · `<usa-view-switch>` |
| **弹簧与物理** | `motionary/components/physics` | `<usa-spring>` · `<usa-draggable>` · `<usa-overscroll>` |
| **卡片** | `motionary/components/cards` | `<usa-card>` · `<usa-card-stack>` · `<usa-sticky-stack>` · `<usa-carousel-3d>` |
| **点击与按钮** | `motionary/components/click` | `<usa-click>` · `<usa-button>` · `<usa-icon-morph>` · `<usa-like>` · `<usa-hold>` · `<usa-double-tap>` · `<usa-checkbox>` |
| **UI 套件** | `motionary/components/ui` | `<usa-tabs>` · `<usa-drawer>` · `<usa-bottom-sheet>` · `<usa-pull-refresh>` · `<usa-fab>` · `<usa-navbar>` · `<usa-slider>` · `<usa-popover>` · `<usa-badge>` · `<usa-avatar-stack>` |
| **整页** | `motionary/components/page` | `<usa-cursor>` · `<usa-fullpage>` · `<usa-loading-bar>` · `<usa-back-to-top>` · `<usa-ambient>` · `<usa-splash>` · `<usa-auto-skeleton>` · `<usa-motion-switch>` |
| **时间线** | `motionary/components/timeline` | `<usa-timeline>` |
| **手势** | `motionary/components/gesture` | `<usa-swipeable>` · `<usa-pinch-zoom>` |
| **SVG** | `motionary/components/svg` | `<usa-draw>` · `<usa-morph>` · `<usa-mask-reveal>` · `<usa-anim-icon>` |
| **WebGL** | `motionary/components/webgl` | `<usa-shader>` · `<usa-distort>` · `<usa-liquid>` · `<usa-post-fx>` |
| **3D 景深** | `motionary/components/depth` | `<usa-cube>` · `<usa-depth>` |
| **布局** | `motionary/components/layout` | `<usa-auto-animate>` · `<usa-masonry>` |
| **效果包** | `motionary/components/packs` | `<usa-pack>` |
| **效果注册表** | `motionary/components/fx` | `<usa-fx>` |
| **效果包元素** | `motionary/components/effects` | `<usa-player>` · `<usa-story>` · `<usa-audio>` · `<usa-motion-theme>` · `<usa-gesture-fx>` |

</details>

## CLI

全部随 `motionary` 包一起安装，用 `npx` 运行：

| 命令 | 作用 |
|---|---|
| `npx motionary doctor [paths…] [--json]` | 列出项目中已移除的导入路径和旧事件名；发现问题时以退出码 1 结束，可直接用于 CI |
| `npx motionary export --target css\|wxss\|arkts [--presets a,b] [--rpx] [--out file]` | 把预设与动效令牌导出为 CSS、小程序 WXSS 或鸿蒙 ArkTS（[docs/cross-platform.md](./docs/cross-platform.md)） |
| `npx motionary compat <version> [--json]` | 某个版本的项目能用什么、之后又改了什么（[docs/version-compat.md](./docs/version-compat.md)） |
| `npx usa-codemod-13 [--write] [paths…]` | 改写 13.0 中移除的路径，以及固定在 `@10` / `@11` / `@12` 的 CDN URL；不加 `--write` 时只做预演。更早的大版本对应 `usa-codemod-5` … `usa-codemod-12` |
| `npx create-motionary-plugin <name>` | 生成一个带测试和签名脚本的效果插件脚手架 |
| `npx -y -p motionary motionary-mcp` | 启动 MCP 服务器（见下一节） |

## MCP 服务器与 AI

`motionary-mcp` 是一个只读的 [Model Context Protocol](https://modelcontextprotocol.io) 服务器。Claude、Cursor、VS Code、Windsurf、Zed 等 MCP 客户端可以通过它查询组件目录，并拿到已经按正确顺序安装、导入、注册好全部前置依赖的代码片段。

```json
{ "mcpServers": { "motionary": { "command": "npx", "args": ["-y", "-p", "motionary", "motionary-mcp"] } } }
```

Claude Code：`claude mcp add motionary -- npx -y -p motionary motionary-mcp`。

- 工具：`list_components`、`search_components`、`get_component`、`get_example`、`scaffold_snippet`、`suggest_motion`、`validate_snippet`、`check_compat`。
- `validate_snippet { mount: true }` 会在 jsdom（可选 peer 依赖：`npm i -D jsdom`）中用真实的打包产物挂载代码，并按组件契约检查；代码片段自身的脚本不会被执行。
- 回答会按你项目中安装的版本给出；`check_compat` 会列出该版本缺少或行为不同的部分。
- 完整指南：[docs/mcp.md](./docs/mcp.md)。

**用文字描述动效。** `motionary/tooling/ai` 能把“卡片从下往上依次淡入”这样的描述转换成效果、关键帧、CSS 以及对应的组件。默认解析器在本地运行、结果确定（支持中文和英文）。如果想用自己的 LLM，给 `suggestMotion()` 传入一个 provider 即可。Motionary 不内置任何厂商 SDK，也不会主动发起网络请求，除非你传入了 provider。模型的回答会经过 JSON Schema 校验，不通过时自动回退到本地结果。

```ts
import { suggestMotion } from 'motionary/tooling/ai';
const { intent, source } = await suggestMotion('卡片像多米诺骨牌一样依次倒下', { provider }); // provider 可省略
el.animate(intent.keyframes, intent.options);
```

更多：[docs/ai-provider.md](./docs/ai-provider.md) · [提示词指南](./docs/ai-prompt-guide.md) · [AGENTS.md](./AGENTS.md) · 网站根目录提供 [`components.json`](https://harrisoncn.github.io/Motionary/components.json) 与 [`llms.txt`](https://harrisoncn.github.io/Motionary/llms.txt)。

## Figma 插件

[figma-plugin/](./figma-plugin/README.md)（也位于 `node_modules/motionary/figma-plugin/`）可以把当前选中的内容导出为三种格式：**完整的 HTML 页面**（令牌、按顺序排列的前置脚本、每个图层对应一个元素）、**CSS 令牌**，以及 **motion.tokens.json**（W3C 设计令牌）。以组件命名的图层（如 `usa-tilt`）会变成对应的元素；Figma 变量 `motion/duration/*` 和 `motion/easing/*` 会覆盖默认令牌。插件不访问网络，也不会修改文档。详见 [figma-plugin/README.md](./figma-plugin/README.md) 与 [docs/motion-tokens.md](./docs/motion-tokens.md)。

## 无障碍

- 当系统设置为 `prefers-reduced-motion: reduce` 时，滚动显现会直接显示内容（没有入场、视差或 scrub 动效），组件也会切换到平静的状态（`staticAlternative()`、`adaptKeyframes()`）。
- `motionary/components/a11y`：`setMotionSensitivity()` 让用户关闭闪烁、循环或视差；另有用于实时区域的 `announce()`，以及 `auditMotionA11y()` 和 `baselineReport()`。`<usa-motion-switch>` 是现成的用户动效开关。
- 所有元素遵循同一份[组件契约](./docs/component-contract.md)（键盘、焦点、事件、生命周期、减少动态效果），由 CI 中的 `npm run check:contract` 强制执行。
- 更多：[docs/accessibility.md](./docs/accessibility.md)。

## 体积预算

每个入口在 [`size-budget.json`](./size-budget.json) 中都有固定的 gzip 预算（共 401 项）。任何入口超出预算，CI 就会失败，预算也从不自动上调。以下为 13.0.0 构建的实测数据（压缩 + gzip）：

| 导入内容 | gzip | 预算 |
|---|---:|---:|
| `motionary/core`（`createMotion`） | 2.53 KB | 10.00 KB |
| `import ScrollAnimate from 'motionary'`（默认实例） | 5.49 KB | 6.00 KB |
| `motionary` 的全部导出 | 8.77 KB | 9.75 KB |
| `dist/index.umd.js`（CDN） | 8.93 KB | 9.75 KB |
| 仅 `parallax()` | 0.94 KB | 2.00 KB |
| `motionary/presets/extended`（181 个预设） | 4.69 KB | 5.25 KB |
| `motionary/runtime`（运行时核心） | 5.42 KB | 5.50 KB |
| `motionary/components/reveal` | 4.32 KB | 5.00 KB |
| `motionary/components/lite`（全部元素，CSS 按需加载） | 69.61 KB | 70.00 KB |
| `motionary/components`（全部元素 + CSS） | 85.66 KB | 93.75 KB |
| `dist/components.umd.js`（CDN，全部内容） | 107.40 KB | 115.75 KB |

默认不监听 scroll 事件（改用 IntersectionObserver），动画只作用于合成层属性（`transform`、`opacity`、`filter`、`clip-path`），导入本身没有副作用（[docs/tree-shaking.md](./docs/tree-shaking.md)）。每个 PR 还会在无头 Chrome 中测量首屏传输量、脚本耗时、GPU 资源与帧稳定性（[docs/perf-ci.md](./docs/perf-ci.md)）。source map 不随 npm 包发布，而是附在每个 GitHub Release 上（[docs/source-maps.md](./docs/source-maps.md)）。更多：[docs/performance.md](./docs/performance.md)。

**浏览器支持：** 2023 年以来的常青浏览器（Chrome / Edge ≥ 111、Safari ≥ 16.4、Firefox ≥ 115、WebView2、Electron ≥ 24）。浏览器支持 View Transitions 和滚动驱动动画时直接使用，不支持时回退到 JavaScript 实现。可以用 `baselineReport()` 检查某个浏览器。

## 升级到 13

13.0 只有一项破坏性变更：**移除 11.5 起标记为弃用的导入路径。** 替代路径指向的是同一批文件，所以行为和包体积都不会变化。

```bash
npx motionary doctor            # 列出项目中所有已移除的路径（以及残留的旧事件名）
npx usa-codemod-13 --write      # 一并改写，并把固定在 @10 / @11 / @12 的 CDN URL 改为 @13
```

| 已移除 | 改用 |
|---|---|
| ~~motionary/components/core~~ | `motionary/core` |
| ~~motionary/components/ai~~ | `motionary/tooling/ai` |
| ~~motionary/components/design~~、~~motionary/design~~ | `motionary/tooling/design` |
| ~~motionary/components/angular~~ | `motionary/angular` |
| ~~motionary/manifest.json~~、~~motionary/manifest.schema.json~~ | `motionary/tooling/manifest.json`、`motionary/tooling/manifest.schema.json` |

`use-scroll-animate/…` 同理。完整指南：[docs/upgrading-13.md](./docs/upgrading-13.md)。更早的大版本：[12](./docs/upgrading-12.md) · [11](./docs/upgrading-11.md) · [10](./docs/upgrading-10.md) · [9](./docs/upgrading-9.md) · [8](./docs/upgrading-8.md) · [7](./docs/upgrading-7.md) · [6](./docs/upgrading-6.md) · [5](./docs/upgrading-5.md) · [4](./docs/upgrading-4.md) · [3](./docs/upgrading-3.md) · [2](./docs/deprecations.md)。从其他库迁移：[AOS](./docs/migration-from-aos.md) · [GSAP ScrollTrigger](./docs/migration-from-gsap-scrolltrigger.md)。

## 版本与兼容性

- **npm dist-tags：** `latest` 指向当前大版本（13.0.0）。每个次版本另有自己的标签 `v<major>-<minor>`（例如 `v12-9`）。`motionary` 与 `use-scroll-animate` 总是以相同版本一起发布。
- **CDN：** URL 固定到大版本（`motionary@13`）；固定到具体版本（`motionary@12.4.0`）的链接也继续可用。
- **语义化版本：** 破坏性变更只出现在大版本，每次都附带升级指南和 codemod。弃用的内容会保留到下一个大版本，期间类型标记为 `@deprecated`，运行时不输出警告。
- **各版本包含什么：** 每个组件和运行时模块的 `since` / `changed`（[docs/version-compat.md](./docs/version-compat.md)），以及逐项功能支持（[docs/compat-matrix.md](./docs/compat-matrix.md)）。
- 详情：[docs/versions.md](./docs/versions.md) · [CHANGELOG.md](./CHANGELOG.md)。

## 文档

| 主题 | 文档 |
|---|---|
| 参考 | [API](./docs/API.md) · [预设](./docs/presets.md)（全部 214 个）· [组件](./docs/components.md) · [入口列表](./docs/entry-points.md) · [按分层的公开 API](./docs/public-api.md) · [Motion Core](./docs/core.md) |
| 运行时 | [运行时分级](./docs/runtime-tiers.md) · [模块](./docs/runtime/) · [兼容性矩阵](./docs/compat-matrix.md) |
| 平台 | [框架与 SSR](./docs/frameworks-ssr.md) · [Windows 应用](./docs/windows-apps.md) · [混合应用（MAUI、Flutter、Electron、Tauri）](./docs/hybrid-apps.md) · [跨平台导出](./docs/cross-platform.md) · [示例](./examples/) |
| 设计与 AI | [动效令牌](./docs/motion-tokens.md) · [Figma 插件](./figma-plugin/README.md) · [MCP 服务器](./docs/mcp.md) · [AI provider](./docs/ai-provider.md) · [提示词指南](./docs/ai-prompt-guide.md) |
| 质量 | [无障碍](./docs/accessibility.md) · [组件契约](./docs/component-contract.md) · [性能](./docs/performance.md) · [性能 CI](./docs/perf-ci.md) · [Tree-shaking](./docs/tree-shaking.md) · [Source map](./docs/source-maps.md) |
| 项目 | [架构](./docs/architecture.md) · [路线图](./docs/ROADMAP.md) · [版本](./docs/versions.md) · [更新日志](./CHANGELOG.md) |

架构分为四层：Motion Core、运行时、组件和工具链，框架入口位于最上层。各层之间的导入规则由 `test/architecture.test.ts` 强制检查（[docs/architecture.md](./docs/architecture.md)）。

除本 README 外，`docs/` 下的文档以英文为主（路线图为中文）。

## 参与贡献

欢迎提交 Issue 和 Pull Request，参见 [CONTRIBUTING.md](./CONTRIBUTING.md)。提交 PR 前请运行 `npm test`、`npm run build`、`npm run check:contract`、`npm run check:peer-docs` 和 `npm run size:check`。如果改动了行为，请同时更新 [README.md](./README.md)、本文件和 [README_ja.md](./README_ja.md)。

## 许可证

MIT © HarrisonCN，参见 [LICENSE](./LICENSE)。

## 参考

运行时模块一览、每个组件的前置依赖（安装、导入与注册顺序、CDN 加载顺序、最小示例）以及 11.0 冻结的兼容性矩阵，都由 `node scripts/gen-runtime-docs.mjs` 根据经过测试的模块数据生成，仅提供英文版：见英文 README 的 [Reference](./README.md#reference) 一节、[docs/runtime/](./docs/runtime/) 和 [docs/compat-matrix.md](./docs/compat-matrix.md)。
