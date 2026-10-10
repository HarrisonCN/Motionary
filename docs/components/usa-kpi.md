# `<usa-kpi>` — KPI card

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

7.2: the value counts up keeping prefix, suffix and decimals ("$12.4k", "98.2%"), the delta chip slides in with an arrow coloured by sign, and an optional trend draws a sparkline. Setting value rolls and flashes the card.

- **Category:** ui · **since** 7.2
- **Import:** `import { defineKpi } from 'motionary/components/widgets'` then `defineKpi();`
- **CDN:** `<script src="https://unpkg.com/motionary@11/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `delta`, `caption`, `trend`, `invert`, `locale`
- **Events:** —
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/kpi.ts](../../src/components/widgets/kpi.ts)

## Minimal example

```html
<usa-kpi label="Revenue" value="$48.2k" delta="+12.5%" trend="4,6,5,9,8,12" caption="vs last month"></usa-kpi>
```

## ES module

```js
import { defineKpi } from 'motionary/components/widgets';

defineKpi(); // registers <usa-kpi>

/* then use it in your HTML:
<usa-kpi label="Revenue" value="$48.2k" delta="+12.5%" trend="4,6,5,9,8,12" caption="vs last month"></usa-kpi>
*/
```
