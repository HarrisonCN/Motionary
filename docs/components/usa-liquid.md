# `<usa-liquid>` — Liquid image

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Click or tap to send water ripples through the image; hover adds a gentle wobble. The plain image stays when WebGL is unavailable.

- **Category:** webgl
- **Import:** `import { defineLiquid } from 'motionary/components/webgl'` then `defineLiquid();`
- **CDN:** `<script src="https://unpkg.com/motionary@10/dist/components.umd.js"></script>`
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
import { defineLiquid } from 'motionary/components/webgl';

defineLiquid(); // registers <usa-liquid>

/* then use it in your HTML:
<usa-liquid strength="1">
  <img src="photo.jpg" alt="…">
</usa-liquid>
*/
```
