# `<mo-range-slider>` — Interval slider

> Element name `<mo-range-slider>` (default since 17.3); the legacy name `<usa-range-slider>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Two native ranges enforce a non-crossing interval and a minimum gap.

- **Category:** ui · **since** 17.7
- **Import:** `import { defineRangeSlider } from 'motionary/components/widgets'` then `defineRangeSlider();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `hint`, `low`, `high`, `min`, `max`, `step`, `min-gap`, `name`, `unit`, `disabled`
- **Events:** `usa:input`, `usa:change`
- **Slots:** —
- **Methods:** `reset()`, `changed()`, `mount()`, `formReset()`
- **Source:** [src/components/widgets/range-slider.ts](../../src/components/widgets/range-slider.ts)

## Minimal example

```html
<mo-range-slider label="Budget" name="budget" min="0" max="1000" low="200" high="800" min-gap="50" step="10" unit=" €"></mo-range-slider>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineRangeSlider } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineRangeSlider(); // registers <mo-range-slider>

/* then use it in your HTML:
<mo-range-slider label="Budget" name="budget" min="0" max="1000" low="200" high="800" min-gap="50" step="10" unit=" €"></mo-range-slider>
*/
```
