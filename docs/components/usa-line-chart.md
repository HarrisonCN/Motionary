# `<mo-line-chart>` — Line chart

> Element name `<mo-line-chart>` (default since 17.3); the legacy name `<usa-line-chart>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Lines draw in with a soft area fill; a crosshair and tooltip follow the pointer or arrow keys; the legend toggles series.

- **Category:** svg · **since** 17.13
- **Import:** `import { defineLineChart } from 'motionary/components/widgets'` then `defineLineChart();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `values`, `labels`, `series`, `colors`, `label`, `unit`, `smooth`, `area`, `height`
- **Events:** `usa:point`, `usa:toggle`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/line-chart.ts](../../src/components/widgets/line-chart.ts)

## Minimal example

```html
<mo-line-chart values="12,18,15,24,30,28,36|8,10,14,12,16,22,25" labels="Mon,Tue,Wed,Thu,Fri,Sat,Sun" series="Visits,Signups"></mo-line-chart>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineLineChart } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineLineChart(); // registers <mo-line-chart>

/* then use it in your HTML:
<mo-line-chart values="12,18,15,24,30,28,36|8,10,14,12,16,22,25" labels="Mon,Tue,Wed,Thu,Fri,Sat,Sun" series="Visits,Signups"></mo-line-chart>
*/
```
