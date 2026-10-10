# `<usa-masonry>` — Masonry

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Pinterest-style masonry: items drop into the shortest column and glide when the width, the items or their sizes change. CSS columns before JS runs.

- **Category:** layout
- **Import:** `import { defineMasonry } from 'motionary/components/layout'` then `defineMasonry();`
- **CDN:** `<script src="https://unpkg.com/motionary@12/dist/components.umd.js"></script>`
- **Attributes:** `columns`, `min`, `gap`
- **Events:** —
- **Slots:** —
- **Methods:** `enable()`, `disable()`
- **Source:** [src/components/layout/elements.ts](../../src/components/layout/elements.ts)

## Minimal example

```html
<usa-masonry min="220" gap="16">
  <img src="1.jpg" alt="…">
  <img src="2.jpg" alt="…">
</usa-masonry>
```

## ES module

```js
import { defineMasonry } from 'motionary/components/layout';

defineMasonry(); // registers <usa-masonry>

/* then use it in your HTML:
<usa-masonry min="220" gap="16">
  <img src="1.jpg" alt="…">
  <img src="2.jpg" alt="…">
</usa-masonry>
*/
```
