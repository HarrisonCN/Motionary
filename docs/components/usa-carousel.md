# `<mo-carousel>` — Carousel / slider

> Element name `<mo-carousel>` (default since 17.3); the legacy name `<usa-carousel>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

6.2: swipe, drag, arrow keys, dots and autoplay (pauses on hover, focus, off screen). Four transitions — slide, fade, scale and a 3D "cards" coverflow. Reduced motion: slides switch without movement.

- **Category:** ui · **since** 6.2 · **changed in** 10.1
- **Import:** `import { defineCarousel } from 'motionary/components/widgets'` then `defineCarousel();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
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
import { defineMoAliases } from 'motionary/components/mo';
import { defineCarousel } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineCarousel(); // registers <mo-carousel>

/* then use it in your HTML:
<mo-carousel effect="cards" loop autoplay="4000" label="Featured">
  <img src="a.jpg" alt="…">
  <img src="b.jpg" alt="…">
  <img src="c.jpg" alt="…">
</mo-carousel>
*/
```
