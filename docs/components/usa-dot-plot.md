# `<mo-dot-plot>` — Dot plot

> Element name `<mo-dot-plot>` (default since 17.3); the legacy name `<usa-dot-plot>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A dot per item on a shared scale, or a dumbbell joining two series to show the gap.

- **Category:** layout · **since** 17.15
- **Import:** `import { defineDotPlot } from 'motionary/components/widgets'` then `defineDotPlot();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `values`, `compare`, `labels`, `series`, `min`, `max`, `unit`, `label`
- **Events:** `usa:select`
- **Slots:** —
- **Methods:** `mount()`, `defineMoName()`
- **Source:** [src/components/widgets/dot-plot.ts](../../src/components/widgets/dot-plot.ts)

## Minimal example

```html
<mo-dot-plot values="52,61,47,70" compare="58,66,59,72" labels="North,South,East,West" series="2024,2025"></mo-dot-plot>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineDotPlot } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineDotPlot(); // registers <mo-dot-plot>

/* then use it in your HTML:
<mo-dot-plot values="52,61,47,70" compare="58,66,59,72" labels="North,South,East,West" series="2024,2025"></mo-dot-plot>
*/
```
