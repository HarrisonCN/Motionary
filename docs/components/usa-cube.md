# `<usa-cube>` — 3D cube

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Up to six children become the faces of a CSS 3D cube. Drag / swipe, arrow keys, autoplay or show("top"); spring-driven, the front face is the only one exposed to screen readers.

- **Category:** depth · **since** 3.5 · **changed in** 6.5
- **Import:** `import { defineCube } from 'motionary/components/depth'` then `defineCube();`
- **CDN:** `<script src="https://unpkg.com/motionary@13/dist/components.umd.js"></script>`
- **Attributes:** `size`, `autoplay`, `perspective`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** `show()`, `next()`, `prev()`
- **Source:** [src/components/depth/cube.ts](../../src/components/depth/cube.ts)

## Minimal example

```html
<usa-cube size="200" autoplay="3000">
  <div>Front</div><div>Right</div><div>Back</div><div>Left</div>
</usa-cube>
```

## ES module

```js
import { defineCube } from 'motionary/components/depth';

defineCube(); // registers <usa-cube>

/* then use it in your HTML:
<usa-cube size="200" autoplay="3000">
  <div>Front</div><div>Right</div><div>Back</div><div>Left</div>
</usa-cube>
*/
```
