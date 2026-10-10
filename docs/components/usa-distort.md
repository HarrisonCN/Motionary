# `<usa-distort>` — Hover distortion

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

The image bulges and splits into RGB around the pointer. Without WebGL (or a cross-origin image without CORS) it falls back to a gentle CSS zoom.

- **Category:** webgl · **since** 3.4 · **changed in** 4.0, 13.1
- **Import:** `import { defineDistort } from 'motionary/components/webgl'` then `defineDistort();`
- **CDN:** `<script src="https://unpkg.com/motionary@13/dist/components.umd.js"></script>`
- **Attributes:** —
- **Events:** —
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/webgl/elements.ts](../../src/components/webgl/elements.ts)

## Minimal example

```html
<usa-distort>
  <img src="photo.jpg" alt="…">
</usa-distort>
```

## ES module

```js
import { defineDistort } from 'motionary/components/webgl';

defineDistort(); // registers <usa-distort>

/* then use it in your HTML:
<usa-distort>
  <img src="photo.jpg" alt="…">
</usa-distort>
*/
```
