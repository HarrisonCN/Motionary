# `<usa-parallax-layers>` — Parallax layers

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

10.4: a parallax container — children with data-depth move at different speeds while it crosses the viewport (native view() scroll timeline first, JS fallback), optional pointer tilt; static under reduced motion.

- **Category:** reveal · **since** 10.4
- **Import:** `import { defineParallaxLayers } from 'motionary/components/widgets'` then `defineParallaxLayers();`
- **CDN:** `<script src="https://unpkg.com/motionary@10/dist/widgets.umd.js"></script>`
- **Attributes:** `range`, `engine`, `horizontal`, `pointer`, `strength`, `preview`
- **Events:** `usa:progress`
- **Slots:** —
- **Methods:** `layers()`
- **Source:** [src/components/widgets/parallax-layers.ts](../../src/components/widgets/parallax-layers.ts)

## Minimal example

```html
<usa-parallax-layers range="120">
  <img data-depth="0.6" src="mountains.webp" alt="">
  <h2 data-depth="-0.3">Above the clouds</h2>
</usa-parallax-layers>
```

## ES module

```js
import { defineParallaxLayers } from 'motionary/components/widgets';

defineParallaxLayers(); // registers <usa-parallax-layers>

/* then use it in your HTML:
<usa-parallax-layers range="120">
  <img data-depth="0.6" src="mountains.webp" alt="">
  <h2 data-depth="-0.3">Above the clouds</h2>
</usa-parallax-layers>
*/
```
