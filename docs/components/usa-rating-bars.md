# `<mo-rating-bars>` — Rating summary

> Element name `<mo-rating-bars>` (default since 17.3); the legacy name `<usa-rating-bars>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

The average counts up beside filling stars while one bar per star level grows to its share.

- **Category:** layout · **since** 17.12
- **Import:** `import { defineRatingBars } from 'motionary/components/widgets'` then `defineRatingBars();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `values`, `label`, `reviews-label`, `stars-label`
- **Events:** `usa:select`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/rating-bars.ts](../../src/components/widgets/rating-bars.ts)

## Minimal example

```html
<mo-rating-bars values="120,48,16,6,10"></mo-rating-bars>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineRatingBars } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineRatingBars(); // registers <mo-rating-bars>

/* then use it in your HTML:
<mo-rating-bars values="120,48,16,6,10"></mo-rating-bars>
*/
```
