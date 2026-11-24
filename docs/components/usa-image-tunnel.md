# `<mo-image-tunnel>` — Image tunnel

> Element name `<mo-image-tunnel>` (default since 17.3); the legacy name `<usa-image-tunnel>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Pictures fly out of the distance toward you, left and right, as the page scrolls.

- **Category:** depth · **since** 17.11
- **Import:** `import { defineImageTunnel } from 'motionary/components/widgets'` then `defineImageTunnel();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `depth`, `length`, `size`, `min-width`, `label`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/image-tunnel.ts](../../src/components/widgets/image-tunnel.ts)

## Minimal example

```html
<mo-image-tunnel><img src="assets/demo-photo.jpg" alt="Photo 1"><img src="assets/demo-photo.jpg" alt="Photo 2"><img src="assets/demo-photo.jpg" alt="Photo 3"><img src="assets/demo-photo.jpg" alt="Photo 4"></mo-image-tunnel>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineImageTunnel } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineImageTunnel(); // registers <mo-image-tunnel>

/* then use it in your HTML:
<mo-image-tunnel><img src="assets/demo-photo.jpg" alt="Photo 1"><img src="assets/demo-photo.jpg" alt="Photo 2"><img src="assets/demo-photo.jpg" alt="Photo 3"><img src="assets/demo-photo.jpg" alt="Photo 4"></mo-image-tunnel>
*/
```
