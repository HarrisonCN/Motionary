# `<mo-water-ripple>` — Water ripple

> Element name `<mo-water-ripple>` (default since 17.3); the legacy name `<usa-water-ripple>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Interactive water ripples on a canvas over the content: move or tap to disturb the surface.

- **Category:** background · **since** 2.8
- **Import:** `import { defineWaterRipple } from 'motionary/components/background'` then `defineWaterRipple();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
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
import { defineMoAliases } from 'motionary/components/mo';
import { defineWaterRipple } from 'motionary/components/background';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineWaterRipple(); // registers <mo-water-ripple>

/* then use it in your HTML:
<mo-water-ripple>
  <img src="lake.jpg" alt="">
</mo-water-ripple>
*/
```
