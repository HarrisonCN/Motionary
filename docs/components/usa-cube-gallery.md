# `<usa-cube-gallery>` — Cube gallery

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

6.5: slides sit on adjacent faces of a 3D cube that turns between them — swipe, arrow keys, buttons or autoplay (pauses on hover / focus / off screen); turn around the Y or X axis.

- **Category:** cards · **since** 6.5
- **Import:** `import { defineCubeGallery } from 'motionary/components/widgets'` then `defineCubeGallery();`
- **CDN:** `<script src="https://unpkg.com/motionary@12/dist/widgets.umd.js"></script>`
- **Attributes:** `axis`, `autoplay`, `label`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** `next()`, `prev()`, `goTo()`
- **Source:** [src/components/widgets/cube-gallery.ts](../../src/components/widgets/cube-gallery.ts)

## Minimal example

```html
<usa-cube-gallery autoplay="4000" label="Products">
  <img src="a.jpg" alt="…">
  <img src="b.jpg" alt="…">
  <img src="c.jpg" alt="…">
</usa-cube-gallery>
```

## ES module

```js
import { defineCubeGallery } from 'motionary/components/widgets';

defineCubeGallery(); // registers <usa-cube-gallery>

/* then use it in your HTML:
<usa-cube-gallery autoplay="4000" label="Products">
  <img src="a.jpg" alt="…">
  <img src="b.jpg" alt="…">
  <img src="c.jpg" alt="…">
</usa-cube-gallery>
*/
```
