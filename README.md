<div align="center">

# Motionary

**Scroll animations and animated Web Components for the modern web — 214 scroll presets, 90 effects, zero dependencies.**

_Formerly **use-scroll-animate** — same API, same `<usa-*>` tags; the old npm package keeps working as an alias._

[![npm](https://img.shields.io/npm/v/motionary?style=flat-square)](https://www.npmjs.com/package/motionary) [![CI](https://github.com/HarrisonCN/Motionary/actions/workflows/ci.yml/badge.svg)](https://github.com/HarrisonCN/Motionary/actions/workflows/ci.yml) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](./LICENSE)

[English](./README.md) | [简体中文](./README_zh.md) | [日本語](./README_ja.md)

**[🛍 Animation Store](https://harrisoncn.github.io/Motionary/showcase/)** · **[🧩 Components](https://harrisoncn.github.io/Motionary/showcase/components.html)** · **[🎛 Playground](https://harrisoncn.github.io/Motionary/showcase/playground.html)** · **[📜 Story](https://harrisoncn.github.io/Motionary/showcase/story.html)**

<sub>The Store lets you preview, tweak and copy all <b>227</b> animations — 214 scroll presets plus card, click, physics and page effects — at desktop and phone sizes.</sub>

</div>

Motionary reveals content as it scrolls into view (IntersectionObserver + Web Animations, or the browser's native scroll timeline) and ships 94 animated custom elements — cards, buttons, physics, page transitions, backgrounds, WebGL and more — that work in any framework, in plain HTML and in desktop web-view apps (Electron, Tauri, WebView2). Everything respects `prefers-reduced-motion`.

## Install

```bash
npm i motionary
```

```html
<!-- CDN (no build) -->
<script src="https://unpkg.com/motionary@6/dist/index.umd.js"></script>            <!-- window.ScrollAnimate -->
<script src="https://unpkg.com/motionary@6/dist/presets-extended.umd.js"></script> <!-- +181 presets -->
<script src="https://unpkg.com/motionary@6/dist/components.umd.js"></script>       <!-- every <usa-*>, window.UsaComponents -->
```

jsDelivr works too: `https://cdn.jsdelivr.net/npm/motionary@6/dist/…`. Existing `use-scroll-animate` installs and `unpkg.com/use-scroll-animate@6` URLs keep working.

## 30-second quickstart

Mark elements with `data-sa` and pick a preset with `data-sa-animation` (every option has a `data-sa-*` attribute), or use the JS API:

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

Frameworks — each adapter is its own entry point and cleans up on unmount:

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

Animated components need no framework at all:

```html
<script type="module">
  import { defineComponents } from 'motionary/components';
  defineComponents(); // or lazyDefine() from 'motionary/components/lazy'
</script>
<usa-card effect="holo">…</usa-card>
<usa-button deform="gooey">Buy</usa-button>
<usa-fx effect="confetti" trigger="click"><button>Celebrate</button></usa-fx>
```

## What's inside

| Area | What you get |
|---|---|
| **Scroll presets** | **214** reveal presets (33 core + 181 in `motionary/presets/extended`) in 14 families — fades, zooms, 3D flips & doors, overshoot slides, clip-path shapes, blur & mask, bounce & elastic, colour & light, depth, glitch / typewriter, stagger-ready and scroll-linked `scrub-*`; plus `timeline()` with 10 timeline presets |
| **Cards, clicks & button morphs** | `<usa-card>` with 10 effects (flip, holo, glass, border glow, …), stacks & 3D carousel; 7 click components with 4 button deforms (squash · wobble · gooey · dent) and icon morphs; 12 registered card / click effects (holo, book-open, shockwave, ink-splash, emoji-rain, …) |
| **Physics & bounce** | `<usa-spring>`, `<usa-draggable>` (spring-back · inertia · snap), `<usa-overscroll>`; `spring()` / `solveSpring()` with 7 spring presets; 7 physics effects (bounce-in, rubber-band, gravity-text, bell-swing, …) |
| **Page transitions** | `pageTransition()`, `viewTransition()`, `sharedTransition()`, `flip()`, MPA transitions; 7 page effects (curtain, iris, pixel-dissolve, blinds, velocity-skew, …); `<usa-dialog>`, `<usa-view-switch>` |
| **Generative backgrounds** | 6 canvas backgrounds (flow-field, voronoi, mesh-gradient, starfield, metaballs, contours) + 9 background elements (aurora, particles, grain, blobs, water ripple, Acrylic / Mica, …) |
| **Sound-reactive** | `<usa-audio>` + Web Audio beat detection (`createBeatDetector()`, `onBeat()`); 3 audio visualisers (spectrum-bars, pulse-ring, wave-ring); any effect can fire on the beat |
| **Cursor & gestures** | 5 cursor effects (comet / ribbon / sparkle trails, magnetic dots, spotlight) + `<usa-cursor>`; fling · twist · long-press → effects with `<usa-gesture-fx>`; `<usa-swipeable>`, `<usa-pinch-zoom>` |
| **Themes** | 5 theme packs (neon · paper · glass · retro · brutalist) via `<usa-motion-theme>` / `applyMotionTheme()`, each with a signature effect; motion tokens (`/components/tokens`) |
| **Micro-interactions** | 23 ready-made UI moments: copy-success, like-heart, add-to-cart, send-plane, upvote, trash-shake, input-shake, success-check, notify-badge, … |
| **`<usa-player>` & stories** | `<usa-player>` plays JSON animations (keyframe tracks, presets, effects; load / view / scroll / click triggers) exported from the Playground; `<usa-story>` with 6 scroll-story templates |
| **WebGL** | `<usa-shader>`, `<usa-distort>`, `<usa-liquid>`, `<usa-post-fx>` — 5 particle presets, 9 post effects (bloom, CRT, chromatic, glitch, …) with CSS fallbacks and a power-saving governor |

90 effects share one registry (`registerEffect()` / `playEffect()` / `bindEffect()` / `<usa-fx>`, `motionary/components/fx`); the 5.x packs live in `motionary/components/effects`.

### All 94 animated components

Import one category (`motionary/components/cards`), everything (`motionary/components`), the CSS-on-demand build (`/components/lite`), or let `lazyDefine()` load only the tags on the page. Wrappers: `/components/react`, `/vue`, `/svelte`, `/solid`, `/angular`.

| Entry | Elements |
|---|---|
| **Scroll reveal** (`/components/reveal`) | `<usa-reveal>` · `<usa-stagger>` · `<usa-scroll-progress>` · `<usa-scrolly>` |
| **Text** (`/components/text`) | `<usa-typewriter>` · `<usa-split-text>` · `<usa-scramble>` · `<usa-counter>` · `<usa-shimmer-text>` · `<usa-text-rotate>` · `<usa-wave-text>` · `<usa-glitch>` · `<usa-gradient-text>` · `<usa-handwriting>` · `<usa-scroll-highlight>` |
| **Interaction** (`/components/interaction`) | `<usa-ripple>` · `<usa-magnetic>` · `<usa-tilt>` · `<usa-spotlight>` · `<usa-press>` · `<usa-switch>` |
| **Feedback** (`/components/feedback`) | `<usa-spinner>` · `<usa-skeleton>` · `<usa-progress>` · `<usa-toaster>` · `<usa-check>` |
| **Backgrounds** (`/components/background`) | `<usa-aurora>` · `<usa-particles>` · `<usa-grain>` · `<usa-marquee>` · `<usa-acrylic>` · `<usa-grid-glow>` · `<usa-blobs>` · `<usa-water-ripple>` · `<usa-dot-network>` |
| **Transitions** (`/components/transitions`) | `<usa-dialog>` · `<usa-accordion>` · `<usa-view-switch>` |
| **Spring & physics** (`/components/physics`) | `<usa-spring>` · `<usa-draggable>` · `<usa-overscroll>` |
| **Cards** (`/components/cards`) | `<usa-card>` · `<usa-card-stack>` · `<usa-sticky-stack>` · `<usa-carousel-3d>` |
| **Click & buttons** (`/components/click`) | `<usa-click>` · `<usa-button>` · `<usa-icon-morph>` · `<usa-like>` · `<usa-hold>` · `<usa-double-tap>` · `<usa-checkbox>` |
| **UI kit** (`/components/ui`) | `<usa-tabs>` · `<usa-drawer>` · `<usa-bottom-sheet>` · `<usa-pull-refresh>` · `<usa-fab>` · `<usa-navbar>` · `<usa-slider>` · `<usa-popover>` · `<usa-badge>` · `<usa-avatar-stack>` |
| **Page-wide** (`/components/page`) | `<usa-cursor>` · `<usa-fullpage>` · `<usa-loading-bar>` · `<usa-back-to-top>` · `<usa-ambient>` · `<usa-splash>` · `<usa-auto-skeleton>` · `<usa-motion-switch>` |
| **Timeline** (`/components/timeline`) | `<usa-timeline>` |
| **Gestures** (`/components/gesture`) | `<usa-swipeable>` · `<usa-pinch-zoom>` |
| **SVG** (`/components/svg`) | `<usa-draw>` · `<usa-morph>` · `<usa-mask-reveal>` · `<usa-anim-icon>` |
| **WebGL** (`/components/webgl`) | `<usa-shader>` · `<usa-distort>` · `<usa-liquid>` · `<usa-post-fx>` |
| **3D depth** (`/components/depth`) | `<usa-cube>` · `<usa-depth>` |
| **Layout** (`/components/layout`) | `<usa-auto-animate>` · `<usa-masonry>` |
| **Packs** (`/components/packs`) | `<usa-pack>` |
| **Effect registry** (`/components/fx`) | `<usa-fx>` |
| **Effect packs** (`/components/effects`) | `<usa-player>` · `<usa-story>` · `<usa-audio>` · `<usa-motion-theme>` · `<usa-gesture-fx>` |

<!-- runtime:start -->
## Runtime (`motionary/runtime`) & prerequisites

Motionary ships its own zero-dependency animation runtime — shared ticker, tween + timeline engine, and one tree-shakable module per feature / format (`motionary/runtime/<module>`). `npm i motionary` installs all of it; you pay only for the modules you import. Components that need a module say so with a **Requires:** badge in the gallery and the Store, and throw a clear error (install / import / CDN) when it is missing.

| Module | Import | CDN (IIFE) | Register | gzip budget |
|---|---|---|---|---|
| [Runtime core](docs/runtime/core.md) | `motionary/runtime` | `https://cdn.jsdelivr.net/npm/motionary@10/dist/runtime.iife.js` | `use();` | 5.5 KB |
| [CSS @keyframes & WAAPI keyframes loader](docs/runtime/format-css.md) | `motionary/runtime/format-css` | `https://cdn.jsdelivr.net/npm/motionary@10/dist/runtime/format-css.iife.js` | `use(formatCss);` | 2.5 KB |
| [Motion / Framer keyframe JSON loader](docs/runtime/format-motion.md) | `motionary/runtime/format-motion` | `https://cdn.jsdelivr.net/npm/motionary@10/dist/runtime/format-motion.iife.js` | `use(formatMotion);` | 2.5 KB |

Install once: `npm i motionary`. Plain HTML: load `runtime.iife.js` first, then the module files (each registers itself).

#### `<usa-plugin-card>` — Requires: motionary/runtime

- **Install:** `npm i motionary`
- **Import order & registration:** Import motionary/runtime and call use() once at start-up, before any runtime-powered component mounts. CDN: the IIFE registers itself (window.MotionaryRuntime).

```js
import { use } from 'motionary/runtime';
import { definePluginCard } from 'motionary/components/widgets';

use();
definePluginCard(); // registers <usa-plugin-card> — after the prerequisites
```

- **CDN:**

```html
<script src="https://cdn.jsdelivr.net/npm/motionary@10/dist/runtime.iife.js"></script>
<!-- then the component bundles -->
<script src="https://unpkg.com/motionary@10/dist/components.umd.js"></script>
<script src="https://unpkg.com/motionary@10/dist/widgets.umd.js"></script>
```

- **Minimal example:**

```html
<usa-plugin-card name="retro" title="Retro" version="1.2.0" author="Motionary" engine="^10.0.0" downloads="12400">
  <p>Pixel, CRT, VHS and Y2K effects.</p>
</usa-plugin-card>
```

<!-- runtime:end -->

## Accessibility & reduced motion

- With `prefers-reduced-motion: reduce`, scroll reveals show content immediately (no entrance, parallax or scrub motion), and components fall back to calm states (`staticAlternative()` / `adaptKeyframes()`).
- `motionary/components/a11y`: `setMotionSensitivity()` levels let users drop flashes, loops or parallax; `announce()` live regions; `auditMotionA11y()`; `baselineReport()`. `<usa-motion-switch>` is a ready-made user-facing motion toggle.
- Details: [docs/accessibility.md](./docs/accessibility.md).

## Performance & size

No scroll listeners by default (IntersectionObserver), animations on the compositor (`transform`, `opacity`, `filter`, `clip-path`), optional off-main-thread native scroll timelines (`engine: 'css'`). Every entry is tree-shakeable and has a gzip budget enforced in CI (`size-budget.json`). Measured for 6.1 (minified + gzip):

| What you import | gzip |
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

More: [docs/performance.md](./docs/performance.md).

## Browser support

Evergreen browsers since 2023: Chrome / Edge ≥ 111, Safari ≥ 16.4, Firefox ≥ 115, WebView2, Electron ≥ 24 (Custom Elements, Web Animations, IntersectionObserver, ResizeObserver, constructable stylesheets). View Transitions and scroll-driven animations are progressive — used when present, JS fallback otherwise. Importing on the server (SSR) is a no-op. Check a browser with `baselineReport()`.

## Documentation

- [API reference](./docs/API.md) — every export, option and `data-sa-*` attribute
- [Presets](./docs/presets.md) — all 214 by category
- [Components](./docs/components.md) — every `<usa-*>` element, attribute and event
- [Frameworks & SSR](./docs/frameworks-ssr.md) · [Windows apps](./docs/windows-apps.md) · [Hybrid apps (MAUI, Flutter, Electron, Tauri)](./docs/hybrid-apps.md)
- [Motion tokens](./docs/motion-tokens.md) · [Migrating from AOS](./docs/migration-from-aos.md) · [from GSAP ScrollTrigger](./docs/migration-from-gsap-scrolltrigger.md)
- [Demo page](./demo/index.html) — every preset clickable, no build step

## Upgrading

- From `use-scroll-animate`: `npm i motionary` and replace `use-scroll-animate` with `motionary` in imports and CDN URLs — nothing else changes (the old package name keeps receiving the same releases).
- [Upgrading to 6.0](./docs/upgrading-6.md) (`npx usa-codemod-6`) · [Upgrading to 5.0](./docs/upgrading-5.md) (`npx usa-codemod-5`) · [4.0](./docs/upgrading-4.md) · [3.0](./docs/upgrading-3.md) · [2.0](./docs/deprecations.md)
- [Changelog](./CHANGELOG.md)

## Roadmap

One version per PR towards 7.0 — particles & fluids, text effects, light & materials, 3D scenes, morphing, transitions, weather, interactive physics: [docs/ROADMAP.md](./docs/ROADMAP.md).

## Contributing & license

Issues and PRs welcome — see [CONTRIBUTING.md](./CONTRIBUTING.md). MIT © HarrisonCN — see [LICENSE](./LICENSE).
