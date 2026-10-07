<div align="center">

# use-scroll-animate 🚀

**A lightweight (~4KB gzipped), dependency-free scroll animation library for the modern web.**

[![GitHub release (latest by date)](https://img.shields.io/github/v/release/HarrisonCN/use-scroll-animate?style=flat-square)](https://github.com/HarrisonCN/use-scroll-animate/releases)
[![GitHub repo size](https://img.shields.io/github/repo-size/HarrisonCN/use-scroll-animate?style=flat-square)](https://github.com/HarrisonCN/use-scroll-animate)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

[English](./README.md) | [简体中文](./README_zh.md) | [日本語](./README_ja.md)

</div>

## Why `use-scroll-animate`?

In 2025, performance is everything. Traditional scroll animation libraries often bundle heavy dependencies, rely on outdated scroll event listeners, or force you into a specific framework.

`use-scroll-animate` is built differently:
- ⚡ **Zero Dependencies**: Pure Vanilla JS/TypeScript.
- 🚀 **High Performance**: Powered by `IntersectionObserver` and the native `Web Animations API`. No scroll event listeners, no layout thrashing.
- 🪶 **Ultra Lightweight**: ~4KB gzipped for the core (tree-shaken ESM); the all-in-one UMD build incl. React/Vue helpers is ~4.8KB.
- 🧩 **Framework Agnostic**: Works seamlessly with Vanilla JS, React, Vue, Svelte, and more. First-class React Hooks and Vue Composables included.
- ♿ **Accessible**: Respects `prefers-reduced-motion` out of the box (content is shown immediately, no entrance or parallax motion).
- 🖥️ **SSR-safe**: Importing (and even calling) the API on the server is a no-op.

## Installation

```bash
npm install use-scroll-animate
```

## v1.3.0 New Features: Custom Easing 🎨

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
| `onProgress` | `(el, progress) => void` | – | Visible ratio of the element (0–1) as it scrolls |

Every option is also available as a data attribute: `data-sa-animation`, `data-sa-duration`, `data-sa-delay`, `data-sa-easing`, `data-sa-threshold`, `data-sa-root-margin`, `data-sa-once`, `data-sa-repeat`, `data-sa-offset`, `data-sa-stagger`, `data-sa-parallax-x|y|rotate|scale|speed`.

## Instance API

```js
import ScrollAnimate, { createScrollAnimate } from 'use-scroll-animate';

ScrollAnimate.init(root?);            // observe every [data-sa] element (safe to call again after DOM changes)
ScrollAnimate.observe(target, opts);  // selector, Element, NodeList or Element[]
ScrollAnimate.unobserve(target);      // stop observing (elements that never animated are made visible)
ScrollAnimate.animate(target, opts);  // play an animation right now
ScrollAnimate.refresh();              // rebuild observers, e.g. after configure({ root })
ScrollAnimate.configure({ ... });     // update global defaults
ScrollAnimate.destroy();              // disconnect everything

const sa = createScrollAnimate({ root: document.querySelector('#scroller') }); // isolated instance
```

Via a `<script>` tag (UMD build), the default instance lives at `ScrollAnimate.default`:

```html
<script src="https://unpkg.com/use-scroll-animate"></script>
<script>ScrollAnimate.default.init();</script>
```

## React & Vue

```jsx
import React from 'react';
import { createReactHooks } from 'use-scroll-animate';
const { useScrollAnimate, useScrollStagger } = createReactHooks(React);

function Card() {
  const ref = useScrollAnimate({ animation: 'zoom-in', easing: 'spring' });
  return <div ref={ref}>Hello</div>;
}
```

```js
import { ref, onMounted, onUnmounted } from 'vue';
import { createVueComposables } from 'use-scroll-animate';
const { useScrollAnimate } = createVueComposables({ ref, onMounted, onUnmounted });
const { animateRef } = useScrollAnimate({ animation: 'fade-in-left' });
```

Hooks and composables share the core engine, so `once`, `offset`, custom easing functions, parallax and reduced-motion handling behave exactly like the vanilla API.

## Contributing

Contributions are always welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
