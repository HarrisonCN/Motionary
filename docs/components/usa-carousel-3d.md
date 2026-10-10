# `<usa-carousel-3d>` — 3D carousel

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Items on a 3D ring, rotated by drag, arrow keys, clicks or autoplay — with spring motion. Reduced motion shows one flat item at a time.

- **Category:** cards · **since** 2.4 · **changed in** 3.5
- **Import:** `import { defineCarousel3d } from 'motionary/components/cards'` then `defineCarousel3d();`
- **CDN:** `<script src="https://unpkg.com/motionary@13/dist/components.umd.js"></script>`
- **Attributes:** `radius`, `perspective`, `autoplay`, `index`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** `next()`, `prev()`, `goTo()`
- **Source:** [src/components/cards/carousel-3d.ts](../../src/components/cards/carousel-3d.ts)

## Minimal example

```html
<usa-carousel-3d autoplay="3000">
  <img src="1.jpg" alt="">
  <img src="2.jpg" alt="">
  …
</usa-carousel-3d>
```

## ES module

```js
import { defineCarousel3d } from 'motionary/components/cards';

defineCarousel3d(); // registers <usa-carousel-3d>

/* then use it in your HTML:
<usa-carousel-3d autoplay="3000">
  <img src="1.jpg" alt="">
  <img src="2.jpg" alt="">
  …
</usa-carousel-3d>
*/
```
