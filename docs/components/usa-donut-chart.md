# `<mo-donut-chart>` — Donut chart

> Element name `<mo-donut-chart>` (default since 17.3); the legacy name `<usa-donut-chart>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Slices draw in one after another and the total counts up; the legend is real buttons.

- **Category:** svg · **since** 17.12
- **Import:** `import { defineDonutChart } from 'motionary/components/widgets'` then `defineDonutChart();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `values`, `labels`, `colors`, `label`, `unit`, `thickness`, `center-label`
- **Events:** `usa:select`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/donut-chart.ts](../../src/components/widgets/donut-chart.ts)

## Minimal example

```html
<mo-donut-chart values="42,28,18,12" labels="Direct,Search,Social,Email" unit="k"></mo-donut-chart>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineDonutChart } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineDonutChart(); // registers <mo-donut-chart>

/* then use it in your HTML:
<mo-donut-chart values="42,28,18,12" labels="Direct,Search,Social,Email" unit="k"></mo-donut-chart>
*/
```
