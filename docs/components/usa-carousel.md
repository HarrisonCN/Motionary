# `<usa-carousel>` — Carousel / slider

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

6.2: swipe, drag, arrow keys, dots and autoplay (pauses on hover, focus, off screen). Four transitions — slide, fade, scale and a 3D "cards" coverflow. Reduced motion: slides switch without movement.

- **Category:** ui · **since** 6.2
- **Import:** `import { defineCarousel } from 'motionary/components/widgets'` then `defineCarousel();`
- **CDN:** `<script src="https://unpkg.com/motionary@12/dist/widgets.umd.js"></script>`
- **Attributes:** `effect`, `autoplay`, `loop`, `no-controls`, `no-dots`, `label`, `index`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** `next()`, `prev()`, `goTo()`
- **Source:** [src/components/widgets/carousel.ts](../../src/components/widgets/carousel.ts)

## Minimal example

```html
<usa-carousel effect="cards" loop autoplay="4000" label="Featured">
  <img src="a.jpg" alt="…">
  <img src="b.jpg" alt="…">
  <img src="c.jpg" alt="…">
</usa-carousel>
```

## ES module

```js
import { defineCarousel } from 'motionary/components/widgets';

defineCarousel(); // registers <usa-carousel>

/* then use it in your HTML:
<usa-carousel effect="cards" loop autoplay="4000" label="Featured">
  <img src="a.jpg" alt="…">
  <img src="b.jpg" alt="…">
  <img src="c.jpg" alt="…">
</usa-carousel>
*/
```
