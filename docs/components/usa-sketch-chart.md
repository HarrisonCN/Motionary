# `<usa-sketch-chart>` — Sketch chart

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

8.5: a hand-drawn chart — wobbly pencil axes with hatched bars or a sketchy line, sketched in stroke by stroke when it scrolls into view.

- **Category:** ui · **since** 8.5
- **Import:** `import { defineSketchChart } from 'motionary/components/widgets'` then `defineSketchChart();`
- **CDN:** `<script src="https://unpkg.com/motionary@10/dist/widgets.umd.js"></script>`
- **Attributes:** `values`, `labels`, `type`, `color`, `label`
- **Events:** `usa:drawn`
- **Slots:** —
- **Methods:** `setValues()`, `redraw()`
- **Source:** [src/components/widgets/sketch-chart.ts](../../src/components/widgets/sketch-chart.ts)

## Minimal example

```html
<usa-sketch-chart values="3,7,5,9" labels="Q1,Q2,Q3,Q4" label="Revenue"></usa-sketch-chart>
```

## ES module

```js
import { defineSketchChart } from 'motionary/components/widgets';

defineSketchChart(); // registers <usa-sketch-chart>

/* then use it in your HTML:
<usa-sketch-chart values="3,7,5,9" labels="Q1,Q2,Q3,Q4" label="Revenue"></usa-sketch-chart>
*/
```
