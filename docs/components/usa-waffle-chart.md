# `<mo-waffle-chart>` — Waffle chart

> Element name `<mo-waffle-chart>` (default since 17.3); the legacy name `<usa-waffle-chart>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A 10 × 10 grid where each square is one percent; squares pop in along a wave and the legend highlights a share.

- **Category:** layout · **since** 17.13
- **Import:** `import { defineWaffleChart } from 'motionary/components/widgets'` then `defineWaffleChart();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `values`, `labels`, `colors`, `label`, `total`, `shape`
- **Events:** `usa:select`
- **Slots:** —
- **Methods:** `mount()`, `defineMoName()`
- **Source:** [src/components/widgets/waffle-chart.ts](../../src/components/widgets/waffle-chart.ts)

## Minimal example

```html
<mo-waffle-chart values="46,31,23" labels="Mobile,Desktop,Tablet"></mo-waffle-chart>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineWaffleChart } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineWaffleChart(); // registers <mo-waffle-chart>

/* then use it in your HTML:
<mo-waffle-chart values="46,31,23" labels="Mobile,Desktop,Tablet"></mo-waffle-chart>
*/
```
