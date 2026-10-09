# `<usa-star-rating>` — Star rating 2.0

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

6.4: the fill follows the pointer (half stars with step="0.5"), a click pops the chosen star with a sparkle burst while the others ripple; stars or hearts; a keyboard slider (arrows, Home / End); readonly mode.

- **Category:** click · **since** 6.4
- **Import:** `import { defineStarRating } from 'motionary/components/widgets'` then `defineStarRating();`
- **CDN:** `<script src="https://unpkg.com/motionary@11/dist/widgets.umd.js"></script>`
- **Attributes:** `max`, `icon`, `readonly`, `step`
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
import { defineStarRating } from 'motionary/components/widgets';

defineStarRating(); // registers <usa-star-rating>

/* then use it in your HTML:
<usa-star-rating value="3.5" step="0.5" label="Your rating"></usa-star-rating>
<usa-star-rating value="4" readonly></usa-star-rating>
*/
```
