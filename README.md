<div align="center">

# use-scroll-animate 🚀

**A lightweight (~5.5KB gzipped), dependency-free scroll animation library for the modern web.**

[![GitHub release (latest by date)](https://img.shields.io/github/v/release/HarrisonCN/use-scroll-animate?style=flat-square)](https://github.com/HarrisonCN/use-scroll-animate/releases)
[![GitHub repo size](https://img.shields.io/github/repo-size/HarrisonCN/use-scroll-animate?style=flat-square)](https://github.com/HarrisonCN/use-scroll-animate)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

[English](./README.md) | [简体中文](./README_zh.md) | [日本語](./README_ja.md)

</div>

## Why `use-scroll-animate`?

In 2025, performance is everything. Traditional scroll animation libraries often bundle heavy dependencies, rely on outdated scroll event listeners, or force you into a specific framework.

`use-scroll-animate` is built differently:
- ⚡ **Zero Dependencies**: Pure Vanilla JS/TypeScript.
- 🚀 **High Performance**: Powered by `IntersectionObserver` and the native `Web Animations API`. No scroll event listeners by default (the opt-in scroll-progress mode uses a single passive, rAF-throttled listener, only while tracked elements are on screen).
- 🪶 **Ultra Lightweight**: ~5.5KB gzipped for the core (tree-shaken, minified ESM); everything incl. `sequence`, `staggerChildren` and the React/Vue helpers is ~6.7KB (UMD ~6.9KB). Every entry has a gzip budget enforced in CI (`size-budget.json`, `npm run size:check`).
- 🧩 **Framework Agnostic**: Vanilla JS, React hooks, Vue composables, Svelte actions, Solid directives and a `<scroll-animate>` Web Component, each as its own entry point (`use-scroll-animate/react`, `/vue`, `/svelte`, `/solid`, `/element`).
- ♿ **Accessible**: Respects `prefers-reduced-motion` out of the box (content is shown immediately, no entrance or parallax motion).
- 🖥️ **SSR-safe**: Importing (and even calling) the API on the server is a no-op.

## Documentation

- 📖 [API reference](./docs/API.md) — every export, option, attribute and config key
- 🎛️ [Demo / preset playground](./demo/index.html) — every preset clickable, no build step (open `demo/index.html` from a clone)
- 🔁 Migration guides: [from AOS](./docs/migration-from-aos.md) · [from GSAP ScrollTrigger](./docs/migration-from-gsap-scrolltrigger.md)
- ⚠️ [Deprecations](./docs/deprecations.md) — what 2.0 removes and what replaces it

## Installation

```bash
npm install use-scroll-animate
```

## Native scroll-driven engine (`engine`) 🏎️

In browsers that support CSS scroll-driven animations (`CSS.supports('animation-timeline: view()')`), presets can run on the browser's native **view timeline** instead of the JavaScript engine. The animation is then linked to the scroll position (it plays as the element scrolls in, off the main thread) rather than started by IntersectionObserver and played over a fixed `duration`.

```js
ScrollAnimate.observe('.card', { animation: 'fade-in-up', engine: 'auto' });
// or for every element of an instance
const sa = createScrollAnimate({ defaultEngine: 'auto' });
```

```html
<div data-sa data-sa-animation="zoom-in" data-sa-engine="auto" data-sa-view-range="entry 0%, cover 40%">…</div>
```

| `engine` | Behaviour |
|---|---|
| `'js'` | **Default in 1.x.** IntersectionObserver + time-based Web Animation (unchanged). |
| `'auto'` / `'css'` | Native view timeline when supported, otherwise falls back to `'js'` automatically. |

Notes:
- With the native engine, `duration`, `delay`, `threshold`, `offset` and `stagger` don't apply; the animation spans `viewRange` (default `['entry 0%', 'entry 100%']`, i.e. from the moment the element starts entering until it is fully in view). `easing` still applies.
- `once` (default) freezes the end state when the animation completes, so scrolling back up does not reverse it; with `repeat: true` it keeps following the scroll in both directions.
- Callbacks (`onEnter`, `onLeave`, `onStart`, `onComplete`), `onProgress`, `progressVar` and `parallax` keep working.
- Class-name mode (`useClassNames`), `prefers-reduced-motion`, `animate()`, `sequence()` and `staggerChildren()` always use the JS engine.
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

### Timelines with `sequence()`
Chain animations across elements. Each step starts when the previous one ends; `gap` adds a pause (negative values overlap) and `at` sets an absolute start time.

```js
import { sequence } from 'use-scroll-animate';

const tl = sequence([
  { target: '.hero h1', animation: 'fade-in-up', duration: 700 },
  { target: '.hero p', animation: 'blur-in', gap: -300 },
  { target: '.hero .btn', animation: 'scale-up', stagger: 80 },
], { trigger: '.hero', easing: 'soft-spring' }); // auto-plays once when .hero enters

await tl.play();   // or play manually; resolves when every step is done
tl.cancel();       // stop and leave everything visible
```

### New presets
`scale-up`, `blur-in-up`, `flip-up`, `flip-down`, `rotate-left`, `rotate-right`, and clip-path reveals `clip-up`, `clip-down`, `clip-left`, `clip-right`, `clip-circle`.

### Smaller memory footprint
Finished `once` elements are dropped from the registry right after they animate (unless they still need parallax/`onProgress`), so long pages and SPAs don't keep thousands of records alive. They're remembered in a `WeakSet`, so `init()`/`observe()` never replay them. Set `createScrollAnimate({ autoUnregister: false })` to keep them listed in `getObservedElements()` as before.

### Proper `exports` map
Node ESM (`import`) resolves to `dist/index.mjs`, CommonJS (`require`) to `dist/index.js`, each with matching bundled types. The legacy `main`/`module`/`unpkg` fields and `dist/*` deep imports keep working.

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
| `engine` | `'js'` \| `'auto'` \| `'css'` | `'js'` | Run presets on the browser's native scroll-driven timeline when supported (`'auto'`/`'css'`), falling back to JS. See [Native scroll-driven engine](#native-scroll-driven-engine-engine-) |
| `exit` | `boolean` \| preset \| `{ from, to }` | `false` | Animate out (reverse) when leaving the viewport, back in on re-entry. Implies `repeat`. See [Exit animations](#exit-animations-exit) |
| `viewRange` | `[string, string]` | `['entry 0%', 'entry 100%']` | Native engine only: view-timeline range of the entrance |
| `progressVar` | `string` | – | Write progress (0–1, same value as `onProgress`) to this CSS custom property, e.g. `'--sa-progress'`, for scroll-driven effects in plain CSS |

Every option is also available as a data attribute: `data-sa-animation`, `data-sa-duration`, `data-sa-delay`, `data-sa-easing`, `data-sa-threshold`, `data-sa-root-margin`, `data-sa-once`, `data-sa-repeat`, `data-sa-offset`, `data-sa-stagger`, `data-sa-progress`, `data-sa-progress-var` (bare attribute = `--sa-progress`), `data-sa-engine`, `data-sa-exit` (bare = `true`, or a preset), `data-sa-view-range` (`"entry 0%, cover 40%"`), `data-sa-parallax-x|y|rotate|scale|speed`.

**Presets:** `fade-in`, `fade-in-up|down|left|right`, `zoom-in`, `zoom-out`, `scale-up`, `flip-x`, `flip-y`, `flip-up`, `flip-down`, `slide-up|down|left|right`, `bounce`, `rotate-in`, `rotate-left`, `rotate-right`, `blur-in`, `blur-in-up`, `skew-in`, `scale-x`, `scale-y`, `clip-up|down|left|right`, `clip-circle`, `shimmer`, `pulse`, `swing`. Combine them with an array, e.g. `['fade-in', 'clip-up']`.

**Global config** (`createScrollAnimate(config)` / `configure()`): `defaultAnimation`, `defaultDuration`, `defaultDelay`, `defaultEasing`, `defaultThreshold`, `defaultRootMargin`, `defaultRepeat`, `defaultOnce`, `defaultOffset`, `hiddenClass`, `visibleClass`, `useClassNames`, `disabled`, `root`, `autoUnregister` (default `true`), `defaultEngine` (default `'js'`).

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

It writes the offset to the individual CSS **`translate`** property, so it composes with entrance animations and any `transform` you set. One IntersectionObserver plus a passive, rAF-throttled scroll listener that is attached only while a target is on screen. Tree-shaken it adds under 1 kB gzipped. (The older `parallax: { x, y, rotate, scale }` option still works; it writes `transform`.)

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
import { sequence, staggerChildren, getScrollProgress } from 'use-scroll-animate';
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

> Importing `createReactHooks` / `createVueComposables` from the main `use-scroll-animate` entry still works in 1.x but is **deprecated** (one dev-only warning) and removed in 2.0.

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
