# `<usa-product-gallery>` — Product gallery

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

7.3: product photos with a thumbnail strip — the stage cross-slides in the direction of travel, the selection ring glides between thumbnails, hover zooms under the pointer, swipe and ←/→ work.

- **Category:** ui · **since** 7.3
- **Import:** `import { defineProductGallery } from 'motionary/components/widgets'` then `defineProductGallery();`
- **CDN:** `<script src="https://unpkg.com/motionary@12/dist/widgets.umd.js"></script>`
- **Attributes:** `index`, `nozoom`, `zoom`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** `go()`, `next()`, `prev()`
- **Source:** [src/components/widgets/product-gallery.ts](../../src/components/widgets/product-gallery.ts)

## Minimal example

```html
<usa-product-gallery zoom="2">
  <img src="front.jpg" alt="Front">
  <img src="side.jpg" alt="Side">
  <img src="back.jpg" alt="Back">
</usa-product-gallery>
```

## ES module

```js
import { defineProductGallery } from 'motionary/components/widgets';

defineProductGallery(); // registers <usa-product-gallery>

/* then use it in your HTML:
<usa-product-gallery zoom="2">
  <img src="front.jpg" alt="Front">
  <img src="side.jpg" alt="Side">
  <img src="back.jpg" alt="Back">
</usa-product-gallery>
*/
```
