# `<mo-lightbox>` — Lightbox gallery

> Element name `<mo-lightbox>` (default since 17.3); the legacy name `<usa-lightbox>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Thumbnails that grow into a full-screen dialog; arrows, swipe, zoom and pan, and the picture shrinks back on close.

- **Category:** gesture · **since** 17.10
- **Import:** `import { defineLightbox } from 'motionary/components/widgets'` then `defineLightbox();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `loop`
- **Events:** `usa:open`, `usa:close`, `usa:change`
- **Slots:** —
- **Methods:** `open()`, `close()`
- **Source:** [src/components/widgets/lightbox.ts](../../src/components/widgets/lightbox.ts)

## Minimal example

```html
<mo-lightbox label="Gallery"><img src="assets/demo-photo.jpg" alt="Photo 1" data-full="assets/demo-photo.jpg"><img src="assets/demo-photo.jpg" alt="Photo 2" data-full="assets/demo-photo.jpg"><img src="assets/demo-photo.jpg" alt="Photo 3" data-full="assets/demo-photo.jpg"></mo-lightbox>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineLightbox } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineLightbox(); // registers <mo-lightbox>

/* then use it in your HTML:
<mo-lightbox label="Gallery"><img src="assets/demo-photo.jpg" alt="Photo 1" data-full="assets/demo-photo.jpg"><img src="assets/demo-photo.jpg" alt="Photo 2" data-full="assets/demo-photo.jpg"><img src="assets/demo-photo.jpg" alt="Photo 3" data-full="assets/demo-photo.jpg"></mo-lightbox>
*/
```
