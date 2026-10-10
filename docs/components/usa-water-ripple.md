# `<usa-water-ripple>` — Water ripple

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Interactive water ripples on a canvas over the content: move or tap to disturb the surface.

- **Category:** background
- **Import:** `import { defineWaterRipple } from 'motionary/components/background'` then `defineWaterRipple();`
- **CDN:** `<script src="https://unpkg.com/motionary@12/dist/components.umd.js"></script>`
- **Attributes:** `damping`, `color`, `strength`
- **Events:** —
- **Slots:** —
- **Methods:** `mount()`
- **Source:** [src/components/background/bg-fx.ts](../../src/components/background/bg-fx.ts)

## Minimal example

```html
<usa-water-ripple>
  <img src="lake.jpg" alt="">
</usa-water-ripple>
```

## ES module

```js
import { defineWaterRipple } from 'motionary/components/background';

defineWaterRipple(); // registers <usa-water-ripple>

/* then use it in your HTML:
<usa-water-ripple>
  <img src="lake.jpg" alt="">
</usa-water-ripple>
*/
```
