# `<mo-clothesline>` — Clothesline

> Element name `<mo-clothesline>` (default since 17.3); the legacy name `<usa-clothesline>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Photos pegged to a sagging line that swing when the pointer brushes past.

- **Category:** physics · **since** 17.11
- **Import:** `import { defineClothesline } from 'motionary/components/widgets'` then `defineClothesline();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `sag`, `item-width`, `strength`, `label`
- **Events:** `usa:swing`
- **Slots:** —
- **Methods:** `swing()`
- **Source:** [src/components/widgets/clothesline.ts](../../src/components/widgets/clothesline.ts)

## Minimal example

```html
<mo-clothesline><figure><img src="assets/demo-photo.jpg" alt="Photo 1"></figure><figure><img src="assets/demo-photo.jpg" alt="Photo 1"></figure><figure><img src="assets/demo-photo.jpg" alt="Photo 1"></figure></mo-clothesline>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineClothesline } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineClothesline(); // registers <mo-clothesline>

/* then use it in your HTML:
<mo-clothesline><figure><img src="assets/demo-photo.jpg" alt="Photo 1"></figure><figure><img src="assets/demo-photo.jpg" alt="Photo 1"></figure><figure><img src="assets/demo-photo.jpg" alt="Photo 1"></figure></mo-clothesline>
*/
```
