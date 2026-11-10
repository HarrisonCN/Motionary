# `<mo-cube>` — 3D cube

> Element name `<mo-cube>` (default since 17.3); the legacy name `<usa-cube>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Up to six children become the faces of a CSS 3D cube. Drag / swipe, arrow keys, autoplay or show("top"); spring-driven, the front face is the only one exposed to screen readers.

- **Category:** depth · **since** 3.5 · **changed in** 6.5
- **Import:** `import { defineCube } from 'motionary/components/depth'` then `defineCube();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
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
import { defineMoAliases } from 'motionary/components/mo';
import { defineCube } from 'motionary/components/depth';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineCube(); // registers <mo-cube>

/* then use it in your HTML:
<mo-cube size="200" autoplay="3000">
  <div>Front</div><div>Right</div><div>Back</div><div>Left</div>
</mo-cube>
*/
```
