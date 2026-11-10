# `<mo-liquid>` — Liquid image

> Element name `<mo-liquid>` (default since 17.3); the legacy name `<usa-liquid>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Click or tap to send water ripples through the image; hover adds a gentle wobble. The plain image stays when WebGL is unavailable.

- **Category:** webgl · **since** 3.4 · **changed in** 4.0, 13.1
- **Import:** `import { defineLiquid } from 'motionary/components/webgl'` then `defineLiquid();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
- **Attributes:** —
- **Events:** —
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/webgl/elements.ts](../../src/components/webgl/elements.ts)

## Minimal example

```html
<usa-liquid strength="1">
  <img src="photo.jpg" alt="…">
</usa-liquid>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineLiquid } from 'motionary/components/webgl';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineLiquid(); // registers <mo-liquid>

/* then use it in your HTML:
<mo-liquid strength="1">
  <img src="photo.jpg" alt="…">
</mo-liquid>
*/
```
