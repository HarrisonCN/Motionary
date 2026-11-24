# `<mo-funnel-chart>` — Funnel chart

> Element name `<mo-funnel-chart>` (default since 17.3); the legacy name `<usa-funnel-chart>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Stages grow from the middle one after another with a conversion badge between them.

- **Category:** layout · **since** 17.13
- **Import:** `import { defineFunnelChart } from 'motionary/components/widgets'` then `defineFunnelChart();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `values`, `labels`, `colors`, `label`, `unit`, `conversion-label`
- **Events:** `usa:select`
- **Slots:** —
- **Methods:** `mount()`, `defineMoName()`
- **Source:** [src/components/widgets/funnel-chart.ts](../../src/components/widgets/funnel-chart.ts)

## Minimal example

```html
<mo-funnel-chart values="1200,640,310,120" labels="Visited,Signed up,Tried,Paid"></mo-funnel-chart>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineFunnelChart } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineFunnelChart(); // registers <mo-funnel-chart>

/* then use it in your HTML:
<mo-funnel-chart values="1200,640,310,120" labels="Visited,Signed up,Tried,Paid"></mo-funnel-chart>
*/
```
