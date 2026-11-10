# `<mo-masonry>` — Masonry

> Element name `<mo-masonry>` (default since 17.3); the legacy name `<usa-masonry>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Pinterest-style masonry: items drop into the shortest column and glide when the width, the items or their sizes change. CSS columns before JS runs.

- **Category:** layout · **since** 3.6 · **changed in** 6.5
- **Import:** `import { defineMasonry } from 'motionary/components/layout'` then `defineMasonry();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
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
import { defineMoAliases } from 'motionary/components/mo';
import { defineMasonry } from 'motionary/components/layout';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineMasonry(); // registers <mo-masonry>

/* then use it in your HTML:
<mo-masonry min="220" gap="16">
  <img src="1.jpg" alt="…">
  <img src="2.jpg" alt="…">
</mo-masonry>
*/
```
