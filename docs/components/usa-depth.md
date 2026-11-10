# `<mo-depth>` — Depth parallax

> Element name `<mo-depth>` (default since 17.3); the legacy name `<usa-depth>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Layers with data-depth (-1…1) shift and scale by depth as the pointer moves, the phone tilts (source="orientation") or the page scrolls; optional whole-scene rotation.

- **Category:** depth · **since** 3.5
- **Import:** `import { defineDepth } from 'motionary/components/depth'` then `defineDepth();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
- **Attributes:** `source`, `strength`, `rotate`
- **Events:** —
- **Slots:** —
- **Methods:** `requestPermission()`
- **Source:** [src/components/depth/depth-el.ts](../../src/components/depth/depth-el.ts)

## Minimal example

```html
<usa-depth source="pointer orientation" strength="40" rotate="6">
  <div class="scene">
    <img data-depth="-0.6" src="sky.png" alt="">
    <img data-depth="0.2" src="hills.png" alt="">
    <h2 data-depth="0.8">Title</h2>
  </div>
</usa-depth>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineDepth } from 'motionary/components/depth';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineDepth(); // registers <mo-depth>

/* then use it in your HTML:
<mo-depth source="pointer orientation" strength="40" rotate="6">
  <div class="scene">
    <img data-depth="-0.6" src="sky.png" alt="">
    <img data-depth="0.2" src="hills.png" alt="">
    <h2 data-depth="0.8">Title</h2>
  </div>
</mo-depth>
*/
```
