# `<mo-heatmap>` — Activity heatmap

> Element name `<mo-heatmap>` (default since 17.3); the legacy name `<usa-heatmap>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A contribution-style calendar that sweeps in; an ARIA grid with arrow keys and a tooltip per day.

- **Category:** layout · **since** 17.12
- **Import:** `import { defineHeatmap } from 'motionary/components/widgets'` then `defineHeatmap();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `values`, `start`, `label`, `unit`, `colors`
- **Events:** `usa:select`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/heatmap.ts](../../src/components/widgets/heatmap.ts)

## Minimal example

```html
<mo-heatmap start="2026-01-05" values="0,2,5,1,0,3,8,4,0,0,6,2,1,9,3,0,4,7,2,5,1,0,3,6,2,8,4,1"></mo-heatmap>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineHeatmap } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineHeatmap(); // registers <mo-heatmap>

/* then use it in your HTML:
<mo-heatmap start="2026-01-05" values="0,2,5,1,0,3,8,4,0,0,6,2,1,9,3,0,4,7,2,5,1,0,3,6,2,8,4,1"></mo-heatmap>
*/
```
