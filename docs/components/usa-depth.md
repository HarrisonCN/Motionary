# `<usa-depth>` — Depth parallax

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Layers with data-depth (-1…1) shift and scale by depth as the pointer moves, the phone tilts (source="orientation") or the page scrolls; optional whole-scene rotation.

- **Category:** depth
- **Import:** `import { defineDepth } from 'motionary/components/depth'` then `defineDepth();`
- **CDN:** `<script src="https://unpkg.com/motionary@11/dist/components.umd.js"></script>`
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
import { defineDepth } from 'motionary/components/depth';

defineDepth(); // registers <usa-depth>

/* then use it in your HTML:
<usa-depth source="pointer orientation" strength="40" rotate="6">
  <div class="scene">
    <img data-depth="-0.6" src="sky.png" alt="">
    <img data-depth="0.2" src="hills.png" alt="">
    <h2 data-depth="0.8">Title</h2>
  </div>
</usa-depth>
*/
```
