# `<mo-orbit-gallery>` — Orbit gallery

> Element name `<mo-orbit-gallery>` (default since 17.3); the legacy name `<usa-orbit-gallery>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Pictures on a slowly turning 3D ring; drag to spin with inertia, arrows to step.

- **Category:** depth · **since** 17.11
- **Import:** `import { defineOrbitGallery } from 'motionary/components/widgets'` then `defineOrbitGallery();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `speed`, `tilt`, `item-width`, `height`, `label`, `pause-label`, `play-label`
- **Events:** `usa:change`, `usa:select`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/orbit-gallery.ts](../../src/components/widgets/orbit-gallery.ts)

## Minimal example

```html
<mo-orbit-gallery label="Gallery"><img src="assets/demo-photo.jpg" alt="Photo 1"><img src="assets/demo-photo.jpg" alt="Photo 2"><img src="assets/demo-photo.jpg" alt="Photo 3"><img src="assets/demo-photo.jpg" alt="Photo 4"><img src="assets/demo-photo.jpg" alt="Photo 5"><img src="assets/demo-photo.jpg" alt="Photo 6"></mo-orbit-gallery>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineOrbitGallery } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineOrbitGallery(); // registers <mo-orbit-gallery>

/* then use it in your HTML:
<mo-orbit-gallery label="Gallery"><img src="assets/demo-photo.jpg" alt="Photo 1"><img src="assets/demo-photo.jpg" alt="Photo 2"><img src="assets/demo-photo.jpg" alt="Photo 3"><img src="assets/demo-photo.jpg" alt="Photo 4"><img src="assets/demo-photo.jpg" alt="Photo 5"><img src="assets/demo-photo.jpg" alt="Photo 6"></mo-orbit-gallery>
*/
```
