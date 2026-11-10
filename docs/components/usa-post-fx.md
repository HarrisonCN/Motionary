# `<mo-post-fx>` — Post-processing

> Element name `<mo-post-fx>` (default since 17.3); the legacy name `<usa-post-fx>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Chainable GPU passes over an image (4.8): vignette, grain, chromatic aberration, scanlines, CRT, bloom, pixelate, duotone and glitch, with one intensity. Without WebGL the image gets an approximate CSS filter.

- **Category:** webgl · **since** 4.8 · **changed in** 13.1
- **Import:** `import { definePostFx } from 'motionary/components/webgl'` then `definePostFx();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
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
import { defineMoAliases } from 'motionary/components/mo';
import { definePostFx } from 'motionary/components/webgl';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
definePostFx(); // registers <mo-post-fx>

/* then use it in your HTML:
<mo-post-fx effects="vignette grain" intensity="0.6">
  <img src="photo.jpg" alt="…">
</mo-post-fx>
*/
```
