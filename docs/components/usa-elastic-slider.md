# `<mo-elastic-slider>` — Elastic slider

> Element name `<mo-elastic-slider>` (default since 17.3); the legacy name `<usa-elastic-slider>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

The value bubble trails the thumb on a spring and leans with its speed.

- **Category:** ui · **since** 17.9
- **Import:** `import { defineElasticSlider } from 'motionary/components/widgets'` then `defineElasticSlider();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `value`, `min`, `max`, `step`, `ticks`, `label`, `unit`, `name`, `disabled`
- **Events:** `usa:input`, `usa:change`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/elastic-slider.ts](../../src/components/widgets/elastic-slider.ts)

## Minimal example

```html
<mo-elastic-slider label="Font size" value="16" min="8" max="32" unit="px"></mo-elastic-slider>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineElasticSlider } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineElasticSlider(); // registers <mo-elastic-slider>

/* then use it in your HTML:
<mo-elastic-slider label="Font size" value="16" min="8" max="32" unit="px"></mo-elastic-slider>
*/
```
