<div align="center">

# use-scroll-animate 🚀

**一个轻量级（~5KB gzipped）、零依赖的现代 Web 滚动动画库。**

[![GitHub release (latest by date)](https://img.shields.io/github/v/release/HarrisonCN/use-scroll-animate?style=flat-square)](https://github.com/HarrisonCN/use-scroll-animate/releases)
[![GitHub repo size](https://img.shields.io/github/repo-size/HarrisonCN/use-scroll-animate?style=flat-square)](https://github.com/HarrisonCN/use-scroll-animate)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

[English](./README.md) | [简体中文](./README_zh.md) | [日本語](./README_ja.md)

</div>

## 为什么选择 `use-scroll-animate`？

在 2025 年，性能至关重要。传统的滚动动画库通常捆绑了沉重的依赖，依赖过时的滚动事件监听器，或者强制你使用特定的框架。

`use-scroll-animate` 的设计初衷截然不同：
- ⚡ **零依赖**：纯原生 JS/TypeScript 编写。
- 🚀 **高性能**：由 `IntersectionObserver` 和原生 `Web Animations API` 驱动。默认不监听滚动事件（可选的滚动进度模式仅在被追踪元素可见时使用一个 passive、rAF 节流的监听器），无布局抖动。
- 🪶 **极轻量**：Gzip 后核心约 4.8KB（含 `sequence`、`staggerChildren` 与 React/Vue 辅助在内全部约 6.1KB）。
- 🧩 **框架无关**：完美支持原生 JS、React、Vue、Svelte 等。内置一流的 React Hooks 和 Vue Composables。
- ♿ **无障碍**：原生支持 `prefers-reduced-motion`。

## 文档

- [API 参考](./docs/API.md)（英文）· [演示页](./demo/index.html)（每个预设都可点击，无需构建）
- 迁移指南：[从 AOS 迁移](./docs/migration-from-aos.md) · [从 GSAP ScrollTrigger 迁移](./docs/migration-from-gsap-scrolltrigger.md)
- [升级到 2.0](./docs/deprecations.md)：`createReactHooks` / `createVueComposables` 只能从 `use-scroll-animate/react` / `/vue` 导入；`dist/index.mjs`、`dist/index.esm.js`、`dist/types/*` 与 `dist/*` 深层导入已移除；默认引擎改为 `'auto'`。CDN 地址 `dist/index.umd.js` 不变。详见 [CHANGELOG](./CHANGELOG.md) 的 MIGRATION 部分。

## 安装

```bash
npm install use-scroll-animate
```

## 快速上手 (原生 JS / HTML)

最简单的方法是通过 HTML 的 `data-sa` 属性。

```html
<!-- 1. 为元素添加 data-sa 属性 -->
<div data-sa data-sa-animation="fade-in-up" data-sa-duration="800">
  当滚动到我时，我会动起来！
</div>

<script type="module">
  // 2. 导入并初始化
  import ScrollAnimate from 'use-scroll-animate';
  ScrollAnimate.init();
</script>
```

## 原生滚动驱动引擎 `engine`（v1.6）

在支持 CSS 滚动驱动动画（`CSS.supports('animation-timeline: view()')`）的浏览器中，预设动画可以运行在浏览器原生的 **view timeline** 上：动画进度跟随滚动位置（在主线程之外），而不是由 IntersectionObserver 触发后按固定 `duration` 播放。

```js
ScrollAnimate.observe('.card', { animation: 'fade-in-up', engine: 'auto' });
const sa = createScrollAnimate({ defaultEngine: 'auto' }); // 实例级默认
```

- `'auto'`：**2.0 起的默认值**，支持时使用原生时间线，否则回退 JS；若元素自行设置了 `duration`、`delay`、`offset` 或 `stagger`，则使用 JS。`'css'`：支持时始终使用原生时间线。`'js'`：1.x 的行为（`defaultEngine: 'js'` 可全局恢复）。
- 原生引擎下 `duration`、`delay`、`threshold`、`offset`、`stagger` 不生效；动画区间由 `viewRange` 决定（默认 `['entry 0%', 'entry 100%']`），`easing` 仍然有效。HTML：`data-sa-engine`、`data-sa-view-range="entry 0%, cover 40%"`。
- `once`（默认）在动画完成后固定最终状态；`repeat: true` 时随滚动双向播放。回调、`onProgress`、`progressVar`、视差照常工作。
- 类名模式、`prefers-reduced-motion`、`animate()`、`sequence()`、`staggerChildren()` 始终使用 JS 引擎。另导出 `supportsScrollTimeline()`。

## v1.4.0 新特性 ✨

- **真实滚动进度 `progressMode: 'scroll'`**（可选）：`onProgress` 默认返回元素的可见比例，对高于屏幕的元素永远到不了 1。开启后进度为：元素顶部到达视口底部时为 `0`，底部离开视口顶部时为 `1`。视差同样使用该进度。HTML 写法：`data-sa-progress="scroll"`；另导出辅助函数 `getScrollProgress(el, root?)`。

  ```js
  ScrollAnimate.observe('.chapter', {
    progressMode: 'scroll',
    onProgress: (el, p) => el.style.setProperty('--progress', p),
  });
  ```

- **动态子元素交错动画**：`staggerChildren()`（原生）与 `useScrollStagger()`（React，**现已支持 Vue**）新增 `observeChildren: true`。通过 `MutationObserver` 监听后续新增的子元素（无限列表、“加载更多”）：显现前新增的会加入交错序列，显现后新增的在滚入视口时按批次交错播放。

  ```js
  import { staggerChildren } from 'use-scroll-animate';
  const stop = staggerChildren(document.querySelector('#feed'), { stagger: 60, observeChildren: true });
  ```

- **时间线 `sequence()`**：串联多个元素的动画。每一步在上一步结束后开始；`gap` 设置间隔（负值表示重叠），`at` 设置绝对开始时间；`trigger` 可在元素进入视口时自动播放一次。

  ```js
  import { sequence } from 'use-scroll-animate';
  const tl = sequence([
    { target: '.hero h1', animation: 'fade-in-up', duration: 700 },
    { target: '.hero p', animation: 'blur-in', gap: -300 },
    { target: '.hero .btn', animation: 'scale-up', stagger: 80 },
  ], { trigger: '.hero' });
  await tl.play(); // 全部完成后 resolve；tl.cancel() 停止并保持元素可见
  ```

- **新预设**：`scale-up`、`blur-in-up`、`flip-up`、`flip-down`、`rotate-left`、`rotate-right`，以及 clip-path 揭示 `clip-up`、`clip-down`、`clip-left`、`clip-right`、`clip-circle`。
- **更省内存**：`once` 元素动画触发后自动从注册表移除（仍需视差/`onProgress` 的除外），并记录在 `WeakSet` 中，`init()`/`observe()` 不会重复播放。如需旧行为可设置 `createScrollAnimate({ autoUnregister: false })`。
- **规范的 `exports` 字段**：2.0 起以 ESM 为主：`import` → `dist/*.js` + `*.d.ts`，`require` → `dist/*.cjs` + `*.d.cts`。

## v1.2.0 新特性

- **单次触发 (Once)**：动画触发后自动停止观察，节省资源。
- **视口偏移 (Offset)**：支持设置元素进入视口多少像素后才触发动画。
- **新预设**：新增 `shimmer`（流光）、`pulse`（脉冲）、`swing`（摇摆）。
- **多语言支持**：新增中文和日文文档。

## 框架集成（v1.7）

每个集成都是独立的入口（`use-scroll-animate/react`、`/vue`、`/svelte`、`/solid`、`/element`），共享同一份核心代码。

```svelte
<!-- Svelte：action，无需引入 svelte -->
<script>import { scrollAnimate, scrollStagger } from 'use-scroll-animate/svelte';</script>
<div use:scrollAnimate={{ animation: 'fade-in-up' }}>…</div>
<ul use:scrollStagger={{ stagger: 60 }}>…</ul>
```

```tsx
// Solid：指令 + ref 原语（solid-js 为可选 peer 依赖）
import { scrollAnimate, useScrollAnimate } from 'use-scroll-animate/solid';
<div use:scrollAnimate={{ animation: 'zoom-in' }}>…</div>
<div ref={useScrollAnimate({ animation: 'fade-in-left' })}>…</div>
```

```html
<!-- Web Component：属性与 data-sa-* 相同（去掉前缀），并派发 sa:enter / sa:leave / sa:start / sa:complete / sa:progress 事件 -->
<script type="module">
  import { defineScrollAnimate } from 'use-scroll-animate/element';
  defineScrollAnimate();
</script>
<scroll-animate animation="fade-in-up" duration="800">…</scroll-animate>
<!-- 无构建：<script src="https://unpkg.com/use-scroll-animate/dist/element.umd.js"></script> -->
```

## 退场动画与视差辅助函数（v1.8）

```js
ScrollAnimate.observe('.card', { animation: 'fade-in-up', exit: true });          // 离开视口时反向播放入场动画
ScrollAnimate.observe('.toast', { animation: 'zoom-in', exit: 'fade-in-down' });  // 用另一个预设（反向）退场
```

- `exit`：`true`、预设名、预设数组或 `{ from, to }`；离开视口时反向播放，再次进入时重新入场（默认隐含 `repeat: true`）。HTML：`data-sa-exit` / `data-sa-exit="zoom-out"`。原生引擎下退场同样随滚动驱动；减少动态效果时不播放。

```js
import { parallax } from 'use-scroll-animate';
const stop = parallax('.hero-bg', { speed: 0.3 });   // 正值：比页面慢（背景）；负值：比页面快
parallax('.badge', { speed: -0.15, axis: 'x' });
```

- `parallax(target, { speed = 0.2, axis = 'y', progressVar = '--sa-parallax', root, respectReducedMotion = true })`：进度写入 CSS 变量，位移写入独立的 `translate` 属性（与 `transform` 和入场动画互不冲突）；`prefers-reduced-motion` 时只写变量不位移。返回停止函数。

## 核心配置

| 选项 | 类型 | 默认值 | 描述 |
|--------|------|---------|-------------|
| `animation` | `string` \| `string[]` | `'fade-in-up'` | 预设名称或预设数组 |
| `duration` | `number` | `600` | 动画持续时间 (ms) |
| `delay` | `number` | `0` | 动画延迟 (ms) |
| `once` | `boolean` | `true` | 是否只触发一次 |
| `offset` | `number` | `0` | 触发动画的视口偏移量 (px) |
| `parallax` | `object` | `{}` | 视差效果配置 |
| `stagger` | `number` | `0` | 同批次显现的兄弟元素之间的额外延迟 (ms) |
| `onProgress` | `(el, progress) => void` | – | 滚动进度回调 (0–1) |
| `progressMode` | `'ratio'` \| `'scroll'` | `'ratio'` | 进度计算方式：可见比例或真实滚动进度 |
| `engine` | `'auto'` \| `'js'` \| `'css'` | `'auto'` | 支持时使用原生滚动驱动时间线，否则回退 JS |
| `viewRange` | `[string, string]` | `['entry 0%', 'entry 100%']` | 仅原生引擎：入场动画的时间线区间 |

## 许可证

本项目采用 MIT 许可证 - 详情请参阅 [LICENSE](LICENSE) 文件。
