# `<mo-parallax-layers>` — Parallax layers

> Element name `<mo-parallax-layers>` (default since 17.3); the legacy name `<usa-parallax-layers>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

10.4: a parallax container — children with data-depth move at different speeds while it crosses the viewport (native view() scroll timeline first, JS fallback), optional pointer tilt; static under reduced motion.

- **Category:** reveal · **since** 10.4
- **Import:** `import { defineParallaxLayers } from 'motionary/components/widgets'` then `defineParallaxLayers();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
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
import { defineMoAliases } from 'motionary/components/mo';
import { defineParallaxLayers } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineParallaxLayers(); // registers <mo-parallax-layers>

/* then use it in your HTML:
<mo-parallax-layers range="120">
  <img data-depth="0.6" src="mountains.webp" alt="">
  <h2 data-depth="-0.3">Above the clouds</h2>
</mo-parallax-layers>
*/
```
