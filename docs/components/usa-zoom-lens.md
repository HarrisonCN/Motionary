# `<mo-zoom-lens>` — Zoom lens

> Element name `<mo-zoom-lens>` (default since 17.3); the legacy name `<usa-zoom-lens>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A round lens that follows the pointer over a product photo; arrow keys and +/− by keyboard.

- **Category:** gesture · **since** 17.12
- **Import:** `import { defineZoomLens } from 'motionary/components/widgets'` then `defineZoomLens();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `zoom`, `size`, `label`
- **Events:** `usa:zoom`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/zoom-lens.ts](../../src/components/widgets/zoom-lens.ts)

## Minimal example

```html
<mo-zoom-lens zoom="3"><img src="assets/demo-photo.jpg" alt="Product photo"></mo-zoom-lens>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineZoomLens } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineZoomLens(); // registers <mo-zoom-lens>

/* then use it in your HTML:
<mo-zoom-lens zoom="3"><img src="assets/demo-photo.jpg" alt="Product photo"></mo-zoom-lens>
*/
```
