# `<mo-star-rating>` — Star rating 2.0

> Element name `<mo-star-rating>` (default since 17.3); the legacy name `<usa-star-rating>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

6.4: the fill follows the pointer (half stars with step="0.5"), a click pops the chosen star with a sparkle burst while the others ripple; stars or hearts; a keyboard slider (arrows, Home / End); readonly mode.

- **Category:** click · **since** 6.4 · **changed in** 7.9, 8.0
- **Import:** `import { defineStarRating } from 'motionary/components/widgets'` then `defineStarRating();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `max`, `icon`, `readonly`, `step`, `label`, `value`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/star-rating.ts](../../src/components/widgets/star-rating.ts)

## Minimal example

```html
<usa-star-rating value="3.5" step="0.5" label="Your rating"></usa-star-rating>
<usa-star-rating value="4" readonly></usa-star-rating>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineStarRating } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineStarRating(); // registers <mo-star-rating>

/* then use it in your HTML:
<mo-star-rating value="3.5" step="0.5" label="Your rating"></mo-star-rating>
<mo-star-rating value="4" readonly></mo-star-rating>
*/
```
