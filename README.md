<div align="center">

# use-scroll-animate 🚀

**A lightweight (~5.7KB gzipped), dependency-free scroll animation library for the modern web — plus 30 animated Web Components for web pages and Windows apps.**

[![GitHub release (latest by date)](https://img.shields.io/github/v/release/HarrisonCN/use-scroll-animate?style=flat-square)](https://github.com/HarrisonCN/use-scroll-animate/releases)
[![GitHub repo size](https://img.shields.io/github/repo-size/HarrisonCN/use-scroll-animate?style=flat-square)](https://github.com/HarrisonCN/use-scroll-animate)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

[English](./README.md) | [简体中文](./README_zh.md) | [日本語](./README_ja.md)

**[✨ Live showcase — every effect, live, with copy-paste code](https://harrisoncn.github.io/use-scroll-animate/)** · **[🧩 Component gallery](https://harrisoncn.github.io/use-scroll-animate/showcase/components.html)** · **[🎛 Playground](https://harrisoncn.github.io/use-scroll-animate/showcase/playground.html)**

> **4.0** consolidates the API: `timeline()` replaces `sequence()`, `sharedTransition()` replaces `connectedAnimation()`, `<usa-auto-animate>` replaces `<usa-flip-list>` — see [Upgrading to 4.0](./docs/upgrading-4.md) · [Roadmap](./docs/ROADMAP.md).

</div>

## Why `use-scroll-animate`?

In 2025, performance is everything. Traditional scroll animation libraries often bundle heavy dependencies, rely on outdated scroll event listeners, or force you into a specific framework.

`use-scroll-animate` is built differently:
- ⚡ **Zero Dependencies**: Pure Vanilla JS/TypeScript.
- 🚀 **High Performance**: Powered by `IntersectionObserver` and the native `Web Animations API`. No scroll event listeners by default (the opt-in scroll-progress mode uses a single passive, rAF-throttled listener, only while tracked elements are on screen).
- 🪶 **Ultra Lightweight**: ~5.4–5.7KB gzipped for the core (tree-shaken, minified ESM); everything from the main entry is ~6.8KB (UMD ~7.0KB); `parallax()` alone < 1KB. Every entry has a gzip budget enforced in CI (`size-budget.json`, `npm run size:check`).
- 🧩 **Framework Agnostic**: Vanilla JS, React hooks, Vue composables, Svelte actions, Solid directives and a `<scroll-animate>` Web Component, each as its own entry point (`use-scroll-animate/react`, `/vue`, `/svelte`, `/solid`, `/element`).
- ♿ **Accessible**: Respects `prefers-reduced-motion` out of the box (content is shown immediately, no entrance or parallax motion).
- 🖥️ **SSR-safe**: Importing (and even calling) the API on the server is a no-op.

## Scroll presets 2.0 (v6.1) 🎞️

**214 scroll-reveal presets**: the 33 core presets plus **181 extended presets** in a separate, tree-shakeable entry (≈ 4.7 kB gzip; the core bundle is unchanged within its budget). Browse them all with a live demo and copy-paste code in the [Animation Store](https://harrisoncn.github.io/use-scroll-animate/showcase/) — every preset, with its keyframes, is listed in [docs/presets.md](./docs/presets.md).

```js
import ScrollAnimate from 'use-scroll-animate';
import 'use-scroll-animate/presets/extended'; // registers the extended set on import

ScrollAnimate.observe('.card', { animation: 'bounce-in-up', duration: 900 });
ScrollAnimate.observe('.hero img', { animation: 'scrub-shrink', engine: 'css', viewRange: ['cover 0%', 'cover 100%'] });
```

```html
<script src="https://unpkg.com/use-scroll-animate@6/dist/index.umd.js"></script>
<script src="https://unpkg.com/use-scroll-animate@6/dist/presets-extended.umd.js"></script>
<div data-sa data-sa-animation="clip-diamond">…</div>
<script>ScrollAnimate.default.init();</script>
```

The names work everywhere a preset does: `animation` / `exit`, `data-sa-animation`, `useScrollAnimate` and the other framework adapters, `<scroll-animate animation>`, and `<usa-reveal effect>` / `<usa-stagger effect>`. Only `transform`, `opacity`, `filter` and `clip-path` are animated, and nothing moves under `prefers-reduced-motion`. Presets can now carry intermediate `frames` (overshoot, bounce, glitch) — so can your own: `registerPresets({ 'my-pop': { from, to, frames } })`.

| Category | Total | New in 6.1 |
|---|---:|---|
| Fade | 19 | `fade-in-up-sm` · `fade-in-down-sm` · `fade-in-left-sm` · `fade-in-right-sm` · `fade-in-up-lg` · `fade-in-down-lg` · `fade-in-left-lg` · `fade-in-right-lg` · `fade-in-up-left` · `fade-in-up-right` · `fade-in-down-left` · `fade-in-down-right` · `fade-in-scale` · `fade-in-half` |
| Zoom & scale | 23 | `zoom-in-up` · `zoom-in-down` · `zoom-in-left` · `zoom-in-right` · `zoom-out-up` · `zoom-out-down` · `zoom-out-left` · `zoom-out-right` · `zoom-in-big` · `zoom-out-big` · `zoom-bounce` · `zoom-in-rotate` · `scale-x-left` · `scale-x-right` · `scale-y-top` · `scale-y-bottom` · `stretch-x` · `stretch-y` |
| Flip 3D | 22 | `flip-x-reverse` · `flip-y-reverse` · `flip-y-full` · `flip-diagonal` · `flip-diagonal-reverse` · `flip-left` · `flip-right` · `unfold-down` · `unfold-up` · `door-open-left` · `door-open-right` · `fold-in` · `flip-x-bounce` · `flip-y-bounce` · `swing-in-top` · `swing-in-bottom` · `swing-in-left` · `swing-in-right` |
| Slide | 20 | `slide-up-spring` · `slide-down-spring` · `slide-left-spring` · `slide-right-spring` · `slide-up-sm` · `slide-down-sm` · `back-in-up` · `back-in-down` · `back-in-left` · `back-in-right` · `light-speed-in-left` · `light-speed-in-right` · `rise-in` · `sink-in` · `float-in-up` · `float-in-down` |
| Rotate & skew | 20 | `roll-in-left` · `roll-in-right` · `spiral-in` · `spiral-in-reverse` · `spin-in` · `rotate-in-up-left` · `rotate-in-up-right` · `rotate-in-down-left` · `rotate-in-down-right` · `skew-in-left` · `skew-in-y` · `shear-in` · `shear-in-reverse` · `twist-in` · `tilt-in-left` · `tilt-in-right` |
| Blur & mask | 14 | `blur-in-down` · `blur-in-left` · `blur-in-right` · `blur-in-strong` · `blur-in-zoom` · `blur-in-scale` · `blur-in-x` · `mask-up` · `mask-down` · `mask-left` · `mask-right` · `blur-mask-up` |
| Clip reveal | 22 | `clip-circle-top` · `clip-circle-bottom` · `clip-circle-left` · `clip-circle-right` · `clip-circle-corner` · `clip-ellipse` · `clip-diamond` · `clip-split-x` · `clip-split-y` · `clip-box` · `clip-pill` · `clip-blinds` · `clip-blinds-x` · `clip-diagonal` · `clip-diagonal-reverse` · `clip-slant-right` · `clip-slant-left` |
| Bounce & elastic | 17 | `bounce-in` · `bounce-in-up` · `bounce-in-down` · `bounce-in-left` · `bounce-in-right` · `elastic-in` · `elastic-in-x` · `rubber-in` · `jello-in` · `wobble-in` · `tada-in` · `heartbeat-in` · `drop-in` · `pop-in` · `squash-in` · `shake-in` · `swing-in` |
| Color & light | 14 | `brightness-in` · `darken-in` · `color-in` · `saturate-in` · `hue-in` · `sepia-in` · `invert-in` · `contrast-in` · `exposure-in` · `vintage-in` · `blur-bright-in` · `shadow-lift` · `neon-glow-in` · `glow-in` |
| Depth & perspective | 10 | `perspective-in-up` · `perspective-in-down` · `perspective-in-left` · `perspective-in-right` · `depth-push` · `depth-pull` · `depth-in-up` · `swoop-in-left` · `swoop-in-right` · `card-tilt-in` |
| Glitch & special | 9 | `glitch-in` · `glitch-in-color` · `typewriter` · `typewriter-lines` · `hinge-in` · `flicker-in` · `scan-in` · `materialize` · `teleport-in` |
| Stagger-ready | 8 | `stagger-fade-up` · `stagger-pop` · `stagger-rise` · `stagger-slide` · `stagger-flip` · `stagger-blur` · `stagger-zoom` · `stagger-drop` |
| Scroll-linked | 12 | `scrub-parallax-up` · `scrub-parallax-down` · `scrub-rotate` · `scrub-spin` · `scrub-scale` · `scrub-shrink` · `scrub-pan-left` · `scrub-pan-right` · `scrub-tilt` · `scrub-fade-through` · `scrub-blur-through` · `scrub-reveal-x` |

## Animated components (v2.2+) 🧩

**30 dependency-free animated Web Components** (`<usa-*>`) in six categories — for **web pages and Windows desktop apps** (Electron, Tauri, WebView2 in WinUI/WPF/WinForms, PWAs). Custom Elements + CSS + Web Animations only: tree-shakable, SSR-safe, `prefers-reduced-motion` everywhere. **[Live gallery](https://harrisoncn.github.io/use-scroll-animate/showcase/components.html)** · [Component docs](./docs/components.md) · [Windows apps guide](./docs/windows-apps.md) · [Next / Astro / React / Vue](./docs/frameworks-ssr.md) · [Accessibility](./docs/accessibility.md)

```js
import { defineComponents } from 'use-scroll-animate/components';
defineComponents(); // or per category: import { defineTextComponents } from 'use-scroll-animate/components/text'
```

```html
<!-- or with no build step -->
<script src="https://unpkg.com/use-scroll-animate@6/dist/components.umd.js"></script>
<usa-typewriter words="Hello, Windows.|Hello, web."></usa-typewriter>
<usa-spinner kind="fluent"></usa-spinner>
```

| Category (import) | Components |
|---|---|
| **Entrance & scroll** (`/components/reveal`) | `<usa-reveal>` (12 effects) · `<usa-stagger>` · `<usa-scroll-progress>` · `<usa-scrolly>` (sticky scrollytelling) |
| **Text** (`/components/text`) | `<usa-typewriter>` · `<usa-split-text>` · `<usa-scramble>` · `<usa-counter>` · `<usa-shimmer-text>` · `<usa-text-rotate>` · `<usa-wave-text>` · `<usa-glitch>` · `<usa-gradient-text>` · `<usa-handwriting>` · `<usa-scroll-highlight>` |
| **Interaction** (`/components/interaction`) | `<usa-ripple>` · `<usa-magnetic>` · `<usa-tilt>` · `<usa-spotlight>` (Fluent reveal highlight) · `<usa-press>` · `<usa-toggle>` |
| **Loading & feedback** (`/components/feedback`) | `<usa-spinner>` (WinUI ring, Windows dots, ring, dots, pulse, bars) · `<usa-skeleton>` · `<usa-progress>` · `<usa-toaster>` + `toast()` · `<usa-check>` |
| **Background & decoration** (`/components/background`) | `<usa-aurora>` · `<usa-particles>` · `<usa-grain>` · `<usa-marquee>` · `<usa-acrylic>` (Acrylic / Mica) · `<usa-grid-glow>` · `<usa-blobs>` · `<usa-water-ripple>` · `<usa-dot-network>` · `fluentPreset()` (Mica · Acrylic · Reveal) |
| **Transitions** (`/components/transitions`) | `<usa-dialog>` (modal / drawer / sheet) · `<usa-accordion>` · `<usa-view-switch>` · `viewTransition()` · `flip()` |
| **Spring & physics** (`/components/physics`) | `<usa-spring>` (bounce-in · pop · drop · jelly · rubber-band) · `<usa-draggable>` (spring-back · inertia · snap) · `<usa-overscroll>` · `spring()` · `createSpring()` · `SPRING_PRESETS` |
| **Card effects** (`/components/cards`) | `<usa-card>` (flip · holo · glass · border-glow · conic-border · lift · spotlight · sheen · parallax-layers · expand — combinable) · `<usa-card-stack>` (swipe) · `<usa-sticky-stack>` · `<usa-carousel-3d>` |
| **Click & tap** (`/components/click`) | `<usa-button>` **button click deformation** (squash · wobble · gooey · dent · shape morph · submit→loading→success) · `<usa-icon-morph>` · `<usa-click>` (ripple · burst · confetti · squish · press-spring · shake) · `<usa-like>` · `<usa-hold>` · `<usa-double-tap>` · `<usa-checkbox>` · `haptic()` (click effects from code: `playEffect(el, 'confetti')`) |
| **UI components & variants** (`/components/ui`) | `<usa-tabs>` · `<usa-drawer>` · `<usa-bottom-sheet>` · `<usa-pull-refresh>` · `<usa-fab>` · `<usa-navbar>` · `<usa-slider>` · `<usa-rating>` · `<usa-tooltip>` · `<usa-popover>` · `<usa-badge>` · `<usa-avatar-stack>` · `variant="minimal \| neon \| glass \| brutalist \| fluent \| material"` on every component |
| **Page & app-wide** (`/components/page`) | `pageTransition()` (fade · slide · circle · blinds · pixel · zoom; SPA + MPA) · `themeTransition()` · `<usa-cursor>` · `smoothScroll()` · `<usa-fullpage>` · `<usa-loading-bar>` · `<usa-back-to-top>` · `<usa-ambient>` (particles · snow · stars · noise · gradient) · `<usa-splash>` · `<usa-auto-skeleton>` · `<usa-motion-switch>` / `setMotionIntensity()` |
| **Timeline & choreography** (`/components/timeline`) | `timeline()` (chain · overlap · labels · seek · reverse · scrub) · `<usa-timeline>` (`data-tl` steps) |
| **Gestures** (`/components/gesture`) | `gesture()` (pan · swipe · pinch · long-press · tap · double-tap → springs) · `<usa-swipeable>` · `<usa-pinch-zoom>` |
| **SVG** (`/components/svg`) | `<usa-draw>` (line drawing) · `<usa-morph>` (path morph) · `<usa-mask-reveal>` · `<usa-anim-icon>` · `morphTo()` · `interpolatePath()` |
| **Canvas & WebGL** (`/components/webgl`) | `<usa-shader>` (gradient · plasma · waves · aurora · snow · fireflies · stars · bokeh · rain · custom GLSL) · `<usa-post-fx>` (vignette · grain · chromatic · CRT · bloom · pixelate · duotone · glitch) · `<usa-distort>` · `<usa-liquid>` · `glQuad()` — adaptive quality, graceful fallback |
| **3D & depth** (`/components/depth`) | `<usa-cube>` · `<usa-depth>` (pointer · gyroscope · scroll depth parallax) · `deviceTilt()` · (+ `<usa-carousel-3d>` in cards) |
| **Layout animation** (`/components/layout`) | `<usa-auto-animate>` / `autoAnimate()` (list & grid reflow) · `<usa-masonry>` · `sharedTransition()` (shared elements) |
| **Effect packs** (`/components/packs`) | `<usa-pack>` (`name="ecommerce \| portfolio \| dashboard \| game \| landing"`) · `applyPack()` · `flyToCart()` · `countUp()` |
| **Effects — plugin API** (`/components/fx`) | `<usa-fx>` (`effect` · `trigger` click / hover / enter / load / loop) · `registerEffect()` · `playEffect()` · `bindEffect()` · built-ins: every timeline entrance, pulse · pop · jelly · wiggle · heartbeat · bounce · flash · tada · shake, burst · confetti · ripple |
| **Effect packs** (`/components/effects`) | `registerAllEffects()` · card & click 2.0 · physics · page-wide · `<usa-story>` scroll stories · generative backgrounds · sound-reactive (`<usa-audio>`) · cursor trails & gestures (`<usa-gesture-fx>`) · theme packs (`<usa-theme>`) · 23 micro-interactions · `<usa-player>` JSON animations |

Whole bundle ≈ 22 kB gzip (JS + CSS); one category 3.5–6.4 kB; a single component ≈ 2 kB. The scroll-animation core below is unaffected.

## v2.0.0 🎉

- **Native scroll-driven animations by default** (`engine: 'auto'`) where the browser supports `animation-timeline: view()`, JS everywhere else.
- **ESM-first package** with types for every entry: `use-scroll-animate`, `/react`, `/vue`, `/svelte`, `/solid`, `/element`.
- **Breaking:** React/Vue factories moved to `/react` and `/vue`; `dist/index.mjs`, `dist/index.esm.js`, `dist/types/*` and `dist/*` deep imports are gone; ES2020 output. The CDN URLs `dist/index.umd.js` and `dist/element.umd.js` are unchanged. Upgrade steps: [MIGRATION](./CHANGELOG.md#migration-from-1x).

## Documentation

- 📖 [API reference](./docs/API.md) — every export, option, attribute and config key
- 🧩 [Animated components](./docs/components.md) — every `<usa-*>` element, by category · [Windows apps guide](./docs/windows-apps.md) (Electron, Tauri, WebView2, PWA)
- 🎛️ [Demo / preset playground](./demo/index.html) — every preset clickable, no build step (open `demo/index.html` from a clone)
- 🎞️ [Preset reference](./docs/presets.md) — all 214 presets by category (33 core + 181 extended)
- 🔁 Migration guides: [from AOS](./docs/migration-from-aos.md) · [from GSAP ScrollTrigger](./docs/migration-from-gsap-scrolltrigger.md)
- ⚠️ [Upgrading to 2.0](./docs/deprecations.md) — what 2.0 removed and what replaces it (also the MIGRATION section of the [CHANGELOG](./CHANGELOG.md))

## Installation

```bash
npm install use-scroll-animate
```

## Native scroll-driven engine (`engine`) 🏎️

In browsers that support CSS scroll-driven animations (`CSS.supports('animation-timeline: view()')`), presets can run on the browser's native **view timeline** instead of the JavaScript engine. The animation is then linked to the scroll position (it plays as the element scrolls in, off the main thread) rather than started by IntersectionObserver and played over a fixed `duration`.

```js
ScrollAnimate.observe('.card', { animation: 'fade-in-up' });            // native where supported (default 'auto')
ScrollAnimate.observe('.card', { animation: 'fade-in-up', engine: 'js' }); // always time-based
const sa = createScrollAnimate({ defaultEngine: 'js' });                 // 1.x behaviour for an instance
```

```html
<div data-sa data-sa-animation="zoom-in" data-sa-engine="auto" data-sa-view-range="entry 0%, cover 40%">…</div>
```

| `engine` | Behaviour |
|---|---|
| `'auto'` | **Default since 2.0.** Native view timeline when supported, otherwise JS. Also JS when the element sets `duration`, `delay`, `offset` or `stagger` itself (those only mean something for a time-based animation). |
| `'css'` | Native view timeline whenever supported (ignores time-based options), otherwise JS. |
| `'js'` | IntersectionObserver + time-based Web Animation (the 1.x default). `createScrollAnimate({ defaultEngine: 'js' })` restores 1.x behaviour everywhere. |

Notes:
- With the native engine, `duration`, `delay`, `threshold`, `offset` and `stagger` don't apply; the animation spans `viewRange` (default `['entry 0%', 'entry 100%']`, i.e. from the moment the element starts entering until it is fully in view). `easing` still applies.
- `once` (default) freezes the end state when the animation completes, so scrolling back up does not reverse it; with `repeat: true` it keeps following the scroll in both directions.
- Callbacks (`onEnter`, `onLeave`, `onStart`, `onComplete`), `onProgress`, `progressVar` and `parallax` keep working.
- Class-name mode (`useClassNames`), `prefers-reduced-motion`, `animate()`, `timeline()` and `staggerChildren()` always use the JS engine.
- `supportsScrollTimeline()` is exported if you want to branch on support yourself.

## v1.4.0 New Features ✨

### True scroll progress (`progressMode: 'scroll'`)
By default `onProgress` reports the element's *visible ratio*, which never reaches 1 for elements taller than the screen. Opt in to real scroll progress: `0` when the element's top reaches the bottom of the viewport, `1` when its bottom leaves the top.

```js
ScrollAnimate.observe('.chapter', {
  progressMode: 'scroll',
  onProgress: (el, p) => el.style.setProperty('--progress', p),
});
```

Parallax uses the same progress, so `progressMode: 'scroll'` also gives smooth parallax on tall sections. HTML: `data-sa-progress="scroll"`. Also exported as a helper: `getScrollProgress(el, root?)`.

### Stagger dynamically added children
`staggerChildren()` (vanilla), `useScrollStagger()` (React **and now Vue**) accept `observeChildren: true`. A `MutationObserver` picks up children added later (infinite lists, "load more"): those added before the reveal join the stagger; those added after it animate when they scroll into view, staggered per batch.

```js
import { staggerChildren } from 'use-scroll-animate';
const stop = staggerChildren(document.querySelector('#feed'), {
  animation: 'fade-in-up', stagger: 60, observeChildren: true,
});
// later: stop();
```

### Timelines with `timeline()`
Chain animations across elements on one playhead. Each step starts when the previous one ends; `at` overlaps (`'-=300'`), waits (`'+=200'`), aligns with the previous step (`'<'`), jumps to a label or an absolute time. Play it, reverse it, seek it, or scrub it with scroll. (Replaces `sequence()`, removed in 4.0 — see [upgrading-4.md](./docs/upgrading-4.md).)

```js
import { timeline } from 'use-scroll-animate';

const tl = timeline({ defaults: { duration: 700 } })
  .to('.hero h1', 'fade-up')
  .to('.hero p', 'blur', { at: '-=300' })
  .to('.hero .btn', 'scale', { stagger: 80 });

await tl.play();                              // resolves at the end
tl.scrub(document.querySelector('.hero'));    // or tie progress to scroll
```
Declaratively: `<usa-timeline>` with `data-tl="fade-up"` children (`use-scroll-animate/components/timeline`).

### New presets
`scale-up`, `blur-in-up`, `flip-up`, `flip-down`, `rotate-left`, `rotate-right`, and clip-path reveals `clip-up`, `clip-down`, `clip-left`, `clip-right`, `clip-circle`.

### Smaller memory footprint
Finished `once` elements are dropped from the registry right after they animate (unless they still need parallax/`onProgress`), so long pages and SPAs don't keep thousands of records alive. They're remembered in a `WeakSet`, so `init()`/`observe()` never replay them. Set `createScrollAnimate({ autoUnregister: false })` to keep them listed in `getObservedElements()` as before.

### Proper `exports` map
ESM-first since 2.0: `import` resolves to `dist/*.js` + `dist/*.d.ts`, `require` to `dist/*.cjs` + `dist/*.d.cts`, for the main entry and every subpath. See [2.0](#v200-) below.

## v1.3.0: Custom Easing 🎨

You can now use custom cubic-bezier curves or even JavaScript functions to create complex physical effects.

### 1. Cubic-Bezier Array
Pass an array of 4 numbers to define a custom cubic-bezier curve.

```javascript
ScrollAnimate.observe('.box', {
  animation: 'fade-in-up',
  easing: [0.68, -0.55, 0.265, 1.55] // Custom bounce effect
});
```

### 2. Custom Easing Function
Pass a function `(t: number) => number` for complete control over the animation timing.

```javascript
ScrollAnimate.observe('.box', {
  easing: (t) => t * t * (3 - 2 * t) // Custom smooth-step
});
```

### 3. New Physics Presets
We've added high-quality physics-based easing presets:
- `spring`: Standard spring effect.
- `soft-spring`: Gentle, bouncy entrance.
- `heavy-bounce`: Dramatic bounce effect.

## Quick Start (Vanilla JS / HTML)

```html
<div data-sa data-sa-animation="fade-in-up" data-sa-easing="soft-spring">
  I have a soft spring effect!
</div>

<div data-sa data-sa-animation="zoom-in" data-sa-easing="[0.34, 1.56, 0.64, 1]">
  I use a custom cubic-bezier array!
</div>

<script type="module">
  import ScrollAnimate from 'use-scroll-animate';
  ScrollAnimate.init();
</script>
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `animation` | `string` \| `string[]` \| `{ from, to }` | `'fade-in-up'` | Preset name, array of presets to combine, or custom keyframes |
| `duration` | `number` | `600` | Duration in ms |
| `delay` | `number` | `0` | Delay in ms |
| `easing` | `string` \| `number[]` \| `function` | `'ease'` | CSS easing, preset (`spring`, `soft-spring`, `heavy-bounce`), cubic-bezier array, or `(t) => number` |
| `threshold` | `number` \| `number[]` | `0.1` | IntersectionObserver threshold(s) |
| `rootMargin` | `string` | `'0px'` | IntersectionObserver root margin |
| `once` | `boolean` | `true` | Animate only the first time the element enters |
| `repeat` | `boolean` | `false` | Re-hide on leave and replay on every entry |
| `offset` | `number` | `0` | Trigger the animation this many px after the element enters the viewport |
| `stagger` | `number` | `0` | Extra delay (ms) per sibling revealed in the same batch |
| `parallax` | `{ x, y, rotate, scale, speed }` | `{}` | Scroll-driven parallax (keeps running after the entrance animation) |
| `onStart` / `onComplete` / `onEnter` / `onLeave` | `(el) => void` | – | Lifecycle callbacks |
| `onProgress` | `(el, progress) => void` | – | Progress (0–1) as the element scrolls — visible ratio, or true scroll progress with `progressMode: 'scroll'` |
| `progressMode` | `'ratio'` \| `'scroll'` | `'ratio'` | How `onProgress`/parallax progress is measured (`'scroll'`: 0 = top enters at the bottom, 1 = bottom leaves at the top) |
| `engine` | `'auto'` \| `'js'` \| `'css'` | `'auto'` | Run presets on the browser's native scroll-driven timeline when supported (`'auto'`/`'css'`), falling back to JS. See [Native scroll-driven engine](#native-scroll-driven-engine-engine-) |
| `exit` | `boolean` \| preset \| `{ from, to }` | `false` | Animate out (reverse) when leaving the viewport, back in on re-entry. Implies `repeat`. See [Exit animations](#exit-animations-exit) |
| `viewRange` | `[string, string]` | `['entry 0%', 'entry 100%']` | Native engine only: view-timeline range of the entrance |
| `progressVar` | `string` | – | Write progress (0–1, same value as `onProgress`) to this CSS custom property, e.g. `'--sa-progress'`, for scroll-driven effects in plain CSS |

Every option is also available as a data attribute: `data-sa-animation`, `data-sa-duration`, `data-sa-delay`, `data-sa-easing`, `data-sa-threshold`, `data-sa-root-margin`, `data-sa-once`, `data-sa-repeat`, `data-sa-offset`, `data-sa-stagger`, `data-sa-progress`, `data-sa-progress-var` (bare attribute = `--sa-progress`), `data-sa-engine`, `data-sa-exit` (bare = `true`, or a preset), `data-sa-view-range` (`"entry 0%, cover 40%"`).

**Presets (33 core):** `fade-in`, `fade-in-up|down|left|right`, `zoom-in`, `zoom-out`, `scale-up`, `flip-x`, `flip-y`, `flip-up`, `flip-down`, `slide-up|down|left|right`, `bounce`, `rotate-in`, `rotate-left`, `rotate-right`, `blur-in`, `blur-in-up`, `skew-in`, `scale-x`, `scale-y`, `clip-up|down|left|right`, `clip-circle`, `shimmer`, `pulse`, `swing`. Combine them with an array, e.g. `['fade-in', 'clip-up']`. **+ 181 extended presets** with `import 'use-scroll-animate/presets/extended'` — see *Scroll presets 2.0* above and [docs/presets.md](./docs/presets.md).

**Global config** (`createScrollAnimate(config)` / `configure()`): `defaultAnimation`, `defaultDuration`, `defaultDelay`, `defaultEasing`, `defaultThreshold`, `defaultRootMargin`, `defaultRepeat`, `defaultOnce`, `defaultOffset`, `hiddenClass`, `visibleClass`, `useClassNames`, `disabled`, `root`, `autoUnregister` (default `true`), `defaultEngine` (default `'auto'`).

### Progress as a CSS variable (`progressVar`)

Drive any CSS property from scroll position without writing JavaScript callbacks. The element's progress is written to a custom property on the element itself:

```html
<div data-sa data-sa-progress="scroll" data-sa-progress-var class="hero">…</div>

<style>
  @media (prefers-reduced-motion: no-preference) {
    .hero { transform: translateY(calc((1 - var(--sa-progress, 0)) * 60px)); opacity: calc(0.4 + var(--sa-progress, 0)); }
  }
</style>
```

```js
ScrollAnimate.observe('.bar', { progressVar: '--fill', progressMode: 'scroll' });
// .bar::after { transform: scaleX(var(--fill, 0)); }
```

It uses the same rAF-throttled / IntersectionObserver pipeline as `onProgress`, keeps updating after the entrance animation, and is still written under reduced motion (it is data) — guard motion in your CSS with `prefers-reduced-motion` as above.

### Exit animations (`exit`)

Animate elements out when they leave the viewport, and back in when they return:

```js
ScrollAnimate.observe('.card', { animation: 'fade-in-up', exit: true });          // reverse of the entrance
ScrollAnimate.observe('.toast', { animation: 'zoom-in', exit: 'fade-in-down' });  // leave with another preset (played in reverse)
```

```html
<div data-sa data-sa-animation="fade-in-left" data-sa-exit>…</div>
<div data-sa data-sa-exit="zoom-out">…</div>
```

`exit` accepts `true`, a preset name, an array of presets or `{ from, to }`; the exit plays that animation **in reverse** over `duration` (no delay) and the element stays in its hidden state until it re-enters. It implies `repeat: true` (set `repeat` explicitly to override). With the native engine the exit is scroll-linked too (the view timeline's `exit` range). In class-name mode the hidden/visible classes are swapped back. Under `prefers-reduced-motion` nothing moves and the element stays visible.

### Parallax helper (`parallax()`)

```js
import { parallax } from 'use-scroll-animate';

const stop = parallax('.hero-bg', { speed: 0.3 });     // lags behind the scroll (background)
parallax('.badge', { speed: -0.15, axis: 'x' });        // drifts sideways, ahead of the scroll
stop(); // remove listeners and the inline styles it set
```

| Option | Default | Description |
|---|---|---|
| `speed` | `0.2` | Total shift while the element crosses the viewport, as a fraction of the viewport (`0.2` = 20vh / 20vw). Positive = slower than the page, negative = faster |
| `axis` | `'y'` | `'y'` or `'x'` |
| `progressVar` | `'--sa-parallax'` | CSS custom property receiving the scroll progress (0–1, same scale as `progressVar` with `progressMode: 'scroll'`) |
| `root` | viewport | Scroll container |
| `respectReducedMotion` | `true` | Under `prefers-reduced-motion: reduce` only the variable is written, no offset |

It writes the offset to the individual CSS **`translate`** property, so it composes with entrance animations and any `transform` you set. One IntersectionObserver plus a passive, rAF-throttled scroll listener that is attached only while a target is on screen. Tree-shaken it adds under 1 kB gzipped. (The old `parallax: { x, y, rotate, scale }` option was removed in 3.0 — see [Upgrading to 3.0](./docs/upgrading-3.md).)

## Instance API

```js
import ScrollAnimate, { createScrollAnimate } from 'use-scroll-animate';

ScrollAnimate.init(root?);            // observe every [data-sa] element (safe to call again after DOM changes)
const stop = ScrollAnimate.watch(root?); // init() + auto-observe [data-sa] elements added later; stop() to end
ScrollAnimate.observe(target, opts);  // selector, Element, NodeList or Element[]
ScrollAnimate.unobserve(target);      // stop observing (elements that never animated are made visible)
ScrollAnimate.animate(target, opts);  // play an animation right now
ScrollAnimate.refresh();              // rebuild observers, e.g. after configure({ root })
ScrollAnimate.configure({ ... });     // update global defaults
ScrollAnimate.destroy();              // disconnect everything

const sa = createScrollAnimate({ root: document.querySelector('#scroller') }); // isolated instance

// Helpers (tree-shakeable)
import { timeline, staggerChildren, getScrollProgress } from 'use-scroll-animate';
```

### Watching the DOM (`watch()`)

For SPAs, CMS content, infinite lists or anything rendered after page load, `watch()` replaces "call `init()` again after every DOM change":

```js
import ScrollAnimate from 'use-scroll-animate';

const stop = ScrollAnimate.watch();              // or watch(document.querySelector('#app'))
// [data-sa] elements inserted later — even deep inside a new subtree, or an existing
// element that gains the data-sa attribute — are observed with their data-sa-* options.
// Elements removed from the DOM are released; finished `once` elements are never replayed.
stop();                                          // stop watching (destroy() also stops every watcher)
```

It uses a single `MutationObserver` per call and is a no-op on the server or without `MutationObserver`.

Via a `<script>` tag (UMD build), the default instance lives at `ScrollAnimate.default`:

```html
<script src="https://unpkg.com/use-scroll-animate"></script>
<script>ScrollAnimate.default.init();</script>
```

## Frameworks

### React & Vue

```jsx
import React from 'react';
import { createReactHooks } from 'use-scroll-animate/react';
const { useScrollAnimate, useScrollStagger } = createReactHooks(React);

function Card() {
  const ref = useScrollAnimate({ animation: 'zoom-in', easing: 'spring' });
  return <div ref={ref}>Hello</div>;
}
```

```js
import { ref, onMounted, onUnmounted } from 'vue';
import { createVueComposables } from 'use-scroll-animate/vue';
const { useScrollAnimate, useScrollStagger } = createVueComposables({ ref, onMounted, onUnmounted });
const { animateRef } = useScrollAnimate({ animation: 'fade-in-left' });
const { staggerRef } = useScrollStagger({ stagger: 60, observeChildren: true }); // <ul ref="staggerRef">
```

```jsx
// React: also animate items appended later
function Feed({ items }) {
  const ref = useScrollStagger({ animation: 'fade-in-up', stagger: 60, observeChildren: true });
  return <ul ref={ref}>{items.map((i) => <li key={i.id}>{i.title}</li>)}</ul>;
}
```

> Since 2.0 `createReactHooks` / `createVueComposables` are only available from `use-scroll-animate/react` / `use-scroll-animate/vue`.

### Svelte (`use-scroll-animate/svelte`)

Actions, no `svelte` import needed (Svelte 3, 4 and 5):

```svelte
<script>
  import { scrollAnimate, scrollStagger } from 'use-scroll-animate/svelte';
  let items = [];
</script>

<h2 use:scrollAnimate={{ animation: 'fade-in-up', duration: 800 }}>Title</h2>
<ul use:scrollStagger={{ stagger: 60, observeChildren: true }}>
  {#each items as item}<li>{item}</li>{/each}
</ul>
```

Updating the action's parameter swaps the callbacks immediately; other options are applied if the element has not animated yet (so visible content is never re-hidden). Pass `instance` to use your own `createScrollAnimate()` instance.

### Solid (`use-scroll-animate/solid`)

Directives and a `ref` primitive (`solid-js` is an optional peer dependency, needed only for this entry):

```tsx
import { scrollAnimate, scrollStagger, useScrollAnimate } from 'use-scroll-animate/solid';
scrollAnimate; scrollStagger; // keep the directive imports (TypeScript)

<div use:scrollAnimate={{ animation: 'zoom-in' }}>…</div>
<ul use:scrollStagger={{ stagger: 60 }}>…</ul>
<div ref={useScrollAnimate({ animation: 'fade-in-left' })}>…</div>
```

`use:scrollAnimate` / `use:scrollStagger` are typed through `JSX.Directives`. Elements are observed on mount and released on cleanup.

### Web Component (`use-scroll-animate/element`)

```html
<script type="module">
  import { defineScrollAnimate } from 'use-scroll-animate/element';
  defineScrollAnimate(); // registers <scroll-animate>; defineScrollAnimate('my-reveal') for another tag
</script>

<scroll-animate animation="fade-in-up" duration="800" easing="spring">…</scroll-animate>
```

Or without a build step (registers `<scroll-animate>` on load):

```html
<script src="https://unpkg.com/use-scroll-animate/dist/element.umd.js"></script>
```

Attributes are the `data-sa-*` attributes without the prefix (`animation`, `duration`, `delay`, `easing`, `threshold`, `root-margin`, `offset`, `once`, `repeat`, `engine`, `view-range`, `progress`, `progress-var`, `exit`, `parallax-*`). The element dispatches `sa:enter`, `sa:leave`, `sa:start`, `sa:complete` and, with `progress`/`progress-var`, `sa:progress` (`event.detail.progress`). It renders as `display: block` unless you style it.

All integrations share the core engine (and, through shared chunks, the same code when you import several entries), so `once`, `offset`, custom easing functions, parallax, the native engine and reduced-motion handling behave exactly like the vanilla API.

## Contributing

Contributions are always welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
