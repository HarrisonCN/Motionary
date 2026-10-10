# `<usa-post-fx>` — Post-processing

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Chainable GPU passes over an image (4.8): vignette, grain, chromatic aberration, scanlines, CRT, bloom, pixelate, duotone and glitch, with one intensity. Without WebGL the image gets an approximate CSS filter.

- **Category:** webgl
- **Import:** `import { definePostFx } from 'motionary/components/webgl'` then `definePostFx();`
- **CDN:** `<script src="https://unpkg.com/motionary@12/dist/components.umd.js"></script>`
- **Attributes:** —
- **Events:** —
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/webgl/elements.ts](../../src/components/webgl/elements.ts)

## Minimal example

```html
<usa-post-fx effects="vignette grain" intensity="0.6">
  <img src="photo.jpg" alt="…">
</usa-post-fx>
```

## ES module

```js
import { definePostFx } from 'motionary/components/webgl';

definePostFx(); // registers <usa-post-fx>

/* then use it in your HTML:
<usa-post-fx effects="vignette grain" intensity="0.6">
  <img src="photo.jpg" alt="…">
</usa-post-fx>
*/
```
