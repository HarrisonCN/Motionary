<div align="center">

# Motionary

**面向现代 Web 的滚动动画与动画 Web Components —— 214 个滚动预设、90 种效果、零依赖。**

_原名 **use-scroll-animate** —— API 与 `<usa-*>` 标签完全不变；旧 npm 包继续作为别名发布。_

[![npm](https://img.shields.io/npm/v/motionary?style=flat-square)](https://www.npmjs.com/package/motionary) [![CI](https://github.com/HarrisonCN/Motionary/actions/workflows/ci.yml/badge.svg)](https://github.com/HarrisonCN/Motionary/actions/workflows/ci.yml) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](./LICENSE)

[English](./README.md) | [简体中文](./README_zh.md) | [日本語](./README_ja.md)

**[🛍 动画商店](https://harrisoncn.github.io/Motionary/showcase/)** · **[🧩 组件](https://harrisoncn.github.io/Motionary/showcase/components.html)** · **[🎛 Playground](https://harrisoncn.github.io/Motionary/showcase/playground.html)** · **[📜 滚动叙事](https://harrisoncn.github.io/Motionary/showcase/story.html)**

<sub>动画商店可预览、调整并复制全部 <b>227</b> 个动画 —— 214 个滚动预设，以及卡片、点击、物理与整页效果 —— 支持桌面与手机尺寸。</sub>

</div>

Motionary 在内容滚入视口时播放入场动画（IntersectionObserver + Web Animations，或浏览器原生滚动时间线），并提供 94 个动画自定义元素 —— 卡片、按钮、物理、页面转场、背景、WebGL 等 —— 可用于任何框架、纯 HTML 以及桌面 Web 视图应用（Electron、Tauri、WebView2）。全部遵循 `prefers-reduced-motion`。

## 安装

```bash
npm i motionary
```

```html
<!-- CDN (no build) -->
<script src="https://unpkg.com/motionary@6/dist/index.umd.js"></script>            <!-- window.ScrollAnimate -->
<script src="https://unpkg.com/motionary@6/dist/presets-extended.umd.js"></script> <!-- +181 presets -->
<script src="https://unpkg.com/motionary@6/dist/components.umd.js"></script>       <!-- every <usa-*>, window.UsaComponents -->
```

jsDelivr 同样可用：`https://cdn.jsdelivr.net/npm/motionary@6/dist/…`。已有的 `use-scroll-animate` 安装与 `unpkg.com/use-scroll-animate@6` 链接继续可用。

## 30 秒上手

给元素加上 `data-sa`，用 `data-sa-animation` 选择预设（每个选项都有对应的 `data-sa-*` 属性），或使用 JS API：

```html
<!-- 1. HTML only: data attributes + one init() call -->
<h2 data-sa data-sa-animation="fade-in-up">Hello</h2>
<div data-sa data-sa-animation="bounce-in-up" data-sa-delay="150">Card</div>
<script type="module">
  import ScrollAnimate from 'motionary';
  import 'motionary/presets/extended'; // optional: +181 presets (bounce-in-up, clip-diamond, …)
  ScrollAnimate.init(); // picks up every [data-sa]
</script>
```

```js
// 2. JS API
import ScrollAnimate, { staggerChildren, parallax, timeline } from 'motionary';

ScrollAnimate.observe('.card', { animation: 'zoom-in-up', duration: 800, easing: 'spring' });
staggerChildren(document.querySelector('.grid'), { animation: 'stagger-pop', stagger: 60 });
parallax('.hero-bg', { speed: 0.3 });
ScrollAnimate.observe('.logo', { animation: 'scrub-spin', engine: 'css', viewRange: ['cover 0%', 'cover 100%'] });
```

框架 —— 每个适配器都是独立入口，卸载时自动清理：

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
scrollAnimate; // keep the directive import (TypeScript)
export const Card = () => <div use:scrollAnimate={{ animation: 'blur-in-up' }}>Hello</div>;
```

```ts
// Angular (standalone) — the animated Web Components
import { APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import { usaInitializer } from 'motionary/components/angular';
import 'motionary/presets/extended'; // lets <usa-reveal effect> use every preset name
// app.config.ts: providers: [{ provide: APP_INITIALIZER, multi: true, useFactory: usaInitializer() }]
@Component({ standalone: true, schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<usa-reveal effect="bounce-in-up"><h2>Hello</h2></usa-reveal>` })
export class Hero {}
```

动画组件无需任何框架：

```html
<script type="module">
  import { defineComponents } from 'motionary/components';
  defineComponents(); // or lazyDefine() from 'motionary/components/lazy'
</script>
<usa-card effect="holo">…</usa-card>
<usa-button deform="gooey">Buy</usa-button>
<usa-fx effect="confetti" trigger="click"><button>Celebrate</button></usa-fx>
```

## 功能一览

| 领域 | 内容 |
|---|---|
| **滚动预设** | **214** 个入场预设（33 个核心 + 181 个位于 `motionary/presets/extended`），14 个系列：淡入、缩放、3D 翻转与开门、回弹滑入、clip-path 形状、模糊与遮罩、弹跳与弹性、色彩与光影、景深、故障 / 打字机、错峰列表与随滚动 `scrub-*`；另有 `timeline()` 与 10 个时间线预设 |
| **卡片、点击与按钮形变** | `<usa-card>` 含 10 种效果（翻转、全息、玻璃、边框光晕……），卡片堆叠与 3D 轮播；7 个点击组件、4 种按钮形变（squash · wobble · gooey · dent）与图标变形；12 个注册的卡片 / 点击效果（holo、book-open、shockwave、ink-splash、emoji-rain……） |
| **物理与弹跳** | `<usa-spring>`、`<usa-draggable>`（回弹 · 惯性 · 吸附）、`<usa-overscroll>`；`spring()` / `solveSpring()` 与 7 个弹簧预设；7 个物理效果（bounce-in、rubber-band、gravity-text、bell-swing……） |
| **页面转场** | `pageTransition()`、`viewTransition()`、`sharedTransition()`、`flip()`、多页（MPA）转场；7 个页面效果（curtain、iris、pixel-dissolve、blinds、velocity-skew……）；`<usa-dialog>`、`<usa-view-switch>` |
| **生成式背景** | 6 种画布背景（flow-field、voronoi、mesh-gradient、starfield、metaballs、contours）+ 9 个背景元素（极光、粒子、胶片颗粒、流体色块、水波、亚克力 / 云母……） |
| **声音响应** | `<usa-audio>` + Web Audio 节拍检测（`createBeatDetector()`、`onBeat()`）；3 种音频可视化（spectrum-bars、pulse-ring、wave-ring）；任意效果都可随节拍触发 |
| **光标与手势** | 5 种光标效果（彗星 / 丝带 / 星光拖尾、磁性圆点、聚光灯）+ `<usa-cursor>`；甩动 · 旋转 · 长按触发效果（`<usa-gesture-fx>`）；`<usa-swipeable>`、`<usa-pinch-zoom>` |
| **主题** | 5 套主题（neon · paper · glass · retro · brutalist），通过 `<usa-theme>` / `applyTheme()` 使用，各带一个标志性效果；动效令牌（`/components/tokens`） |
| **微交互** | 23 个现成的界面瞬间：copy-success、like-heart、add-to-cart、send-plane、upvote、trash-shake、input-shake、success-check、notify-badge…… |
| **`<usa-player>` 与滚动叙事** | `<usa-player>` 播放 JSON 动画（关键帧轨道、预设、效果；load / view / scroll / click 触发），可从 Playground 导出；`<usa-story>` 含 6 个滚动叙事模板 |
| **WebGL** | `<usa-shader>`、`<usa-distort>`、`<usa-liquid>`、`<usa-post-fx>` —— 5 个粒子预设、9 种后期效果（bloom、CRT、色散、故障……），带 CSS 降级与省电调速 |

90 种效果共用一个注册表（`registerEffect()` / `playEffect()` / `bindEffect()` / `<usa-fx>`，位于 `motionary/components/fx`）；5.x 效果包位于 `motionary/components/effects`。

### 全部 94 个动画组件

可按分类导入（`motionary/components/cards`）、全部导入（`motionary/components`）、使用按需加载 CSS 的 `/components/lite`，或用 `lazyDefine()` 只加载页面上出现的标签。框架封装：`/components/react`、`/vue`、`/svelte`、`/solid`、`/angular`。

| 入口 | 元素 |
|---|---|
| **滚动揭示** (`/components/reveal`) | `<usa-reveal>` · `<usa-stagger>` · `<usa-scroll-progress>` · `<usa-scrolly>` |
| **文字** (`/components/text`) | `<usa-typewriter>` · `<usa-split-text>` · `<usa-scramble>` · `<usa-counter>` · `<usa-shimmer-text>` · `<usa-text-rotate>` · `<usa-wave-text>` · `<usa-glitch>` · `<usa-gradient-text>` · `<usa-handwriting>` · `<usa-scroll-highlight>` |
| **交互** (`/components/interaction`) | `<usa-ripple>` · `<usa-magnetic>` · `<usa-tilt>` · `<usa-spotlight>` · `<usa-press>` · `<usa-switch>` |
| **反馈** (`/components/feedback`) | `<usa-spinner>` · `<usa-skeleton>` · `<usa-progress>` · `<usa-toaster>` · `<usa-check>` |
| **背景与装饰** (`/components/background`) | `<usa-aurora>` · `<usa-particles>` · `<usa-grain>` · `<usa-marquee>` · `<usa-acrylic>` · `<usa-grid-glow>` · `<usa-blobs>` · `<usa-water-ripple>` · `<usa-dot-network>` |
| **转场** (`/components/transitions`) | `<usa-dialog>` · `<usa-accordion>` · `<usa-view-switch>` |
| **弹簧与物理** (`/components/physics`) | `<usa-spring>` · `<usa-draggable>` · `<usa-overscroll>` |
| **卡片** (`/components/cards`) | `<usa-card>` · `<usa-card-stack>` · `<usa-sticky-stack>` · `<usa-carousel-3d>` |
| **点击与按钮** (`/components/click`) | `<usa-click>` · `<usa-button>` · `<usa-icon-morph>` · `<usa-like>` · `<usa-hold>` · `<usa-double-tap>` · `<usa-checkbox>` |
| **UI 组件** (`/components/ui`) | `<usa-tabs>` · `<usa-drawer>` · `<usa-bottom-sheet>` · `<usa-pull-refresh>` · `<usa-fab>` · `<usa-navbar>` · `<usa-slider>` · `<usa-rating>` · `<usa-popover>` · `<usa-badge>` · `<usa-avatar-stack>` |
| **整页** (`/components/page`) | `<usa-cursor>` · `<usa-fullpage>` · `<usa-loading-bar>` · `<usa-back-to-top>` · `<usa-ambient>` · `<usa-splash>` · `<usa-auto-skeleton>` · `<usa-motion-switch>` |
| **时间线** (`/components/timeline`) | `<usa-timeline>` |
| **手势** (`/components/gesture`) | `<usa-swipeable>` · `<usa-pinch-zoom>` |
| **SVG** (`/components/svg`) | `<usa-draw>` · `<usa-morph>` · `<usa-mask-reveal>` · `<usa-anim-icon>` |
| **WebGL** (`/components/webgl`) | `<usa-shader>` · `<usa-distort>` · `<usa-liquid>` · `<usa-post-fx>` |
| **3D 景深** (`/components/depth`) | `<usa-cube>` · `<usa-depth>` |
| **布局** (`/components/layout`) | `<usa-auto-animate>` · `<usa-masonry>` |
| **效果包** (`/components/packs`) | `<usa-pack>` |
| **效果注册表** (`/components/fx`) | `<usa-fx>` |
| **效果包** (`/components/effects`) | `<usa-player>` · `<usa-story>` · `<usa-audio>` · `<usa-theme>` · `<usa-gesture-fx>` |

## 无障碍与减少动态效果

- 开启 `prefers-reduced-motion: reduce` 时，滚动揭示会立即显示内容（无入场、视差或随滚动动画），组件退回平静状态（`staticAlternative()` / `adaptKeyframes()`）。
- `motionary/components/a11y`：`setMotionSensitivity()` 分级让用户关闭闪烁、循环或视差；`announce()` 实时播报区域；`auditMotionA11y()`；`baselineReport()`。`<usa-motion-switch>` 是现成的面向用户的动效开关。
- 详见 [docs/accessibility.md](./docs/accessibility.md)。

## 性能与体积

默认不监听 scroll 事件（IntersectionObserver），动画运行在合成层（`transform`、`opacity`、`filter`、`clip-path`），可选主线程之外的原生滚动时间线（`engine: 'css'`）。每个入口都可摇树，并在 CI 中强制 gzip 预算（`size-budget.json`）。6.1 实测（压缩 + gzip）：

| 导入内容 | gzip |
|---|---:|
| `import ScrollAnimate from 'motionary'` (default instance) | 5.72 kB |
| Everything from the main entry | 8.69 kB |
| `dist/index.umd.js` (CDN) | 8.81 kB |
| `parallax()` alone | 1.22 kB |
| `motionary/presets/extended` (181 presets) | 4.69 kB |
| `motionary/components/reveal` | 4.10 kB |
| `motionary/components/effects` (8 effect packs) | 26.40 kB |
| `motionary/components/lite` (every component, CSS on demand) | 68.48 kB |
| `motionary/components` (every component + CSS) | 85.15 kB |
| `dist/components.umd.js` (CDN, everything) | 106.75 kB |

更多：[docs/performance.md](./docs/performance.md)。

## 浏览器支持

2023 年以来的常青浏览器：Chrome / Edge ≥ 111、Safari ≥ 16.4、Firefox ≥ 115、WebView2、Electron ≥ 24（Custom Elements、Web Animations、IntersectionObserver、ResizeObserver、可构造样式表）。View Transitions 与滚动驱动动画为渐进增强 —— 支持时使用，否则回退到 JS。在服务端（SSR）导入不会执行任何操作。可用 `baselineReport()` 检查浏览器。

## 文档

- [API 参考](./docs/API.md)（英文）—— 所有导出、选项与 `data-sa-*` 属性
- [预设一览](./docs/presets.md)（全部 214 个）
- [组件文档](./docs/components.md)（每个 `<usa-*>` 元素、属性与事件）
- [框架与 SSR](./docs/frameworks-ssr.md) · [Windows 应用](./docs/windows-apps.md) · [混合应用（MAUI、Flutter、Electron、Tauri）](./docs/hybrid-apps.md)
- [动效令牌](./docs/motion-tokens.md) · [从 AOS 迁移](./docs/migration-from-aos.md) · [从 GSAP ScrollTrigger 迁移](./docs/migration-from-gsap-scrolltrigger.md)
- [演示页](./demo/index.html)（每个预设都可点击，无需构建）

## 升级

- 从 `use-scroll-animate`：`npm i motionary`，把导入路径与 CDN 链接中的 `use-scroll-animate` 换成 `motionary` 即可，其余不变（旧包名会继续同步发布）。
- [升级到 6.0](./docs/upgrading-6.md)（`npx usa-codemod-6`）· [升级到 5.0](./docs/upgrading-5.md)（`npx usa-codemod-5`）· [4.0](./docs/upgrading-4.md) · [3.0](./docs/upgrading-3.md) · [2.0](./docs/deprecations.md)
- [更新日志](./CHANGELOG.md)

## 路线图

每个版本一个 PR，直至 7.0 —— 粒子与流体、文字特效、光影与材质、3D 场景、形变、转场、天气氛围、交互物理：[docs/ROADMAP.md](./docs/ROADMAP.md)。

## 贡献与许可证

欢迎提交 Issue 与 PR —— 参见 [CONTRIBUTING.md](./CONTRIBUTING.md)。MIT © HarrisonCN —— 参见 [LICENSE](./LICENSE)。
