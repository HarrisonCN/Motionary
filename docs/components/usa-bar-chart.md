# `<usa-bar-chart>` — Animated bar chart

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

7.2: bars grow from the baseline in a stagger on first view and new data glides every bar to its new height — bars that appear grow in, bars that leave shrink away. Data from values/labels, <data> children or the data property.

- **Category:** ui · **since** 7.2
- **Import:** `import { defineBarChart } from 'motionary/components/widgets'` then `defineBarChart();`
- **CDN:** `<script src="https://unpkg.com/motionary@11/dist/widgets.umd.js"></script>`
- **Attributes:** `horizontal`, `unit`, `max`
- **Events:** —
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/bar-chart.ts](../../src/components/widgets/bar-chart.ts)

## Minimal example

```html
<usa-bar-chart values="12,19,8,15,22" labels="Mon,Tue,Wed,Thu,Fri" unit="k"></usa-bar-chart>
<script>chart.data = [{ label: 'Mon', value: 18 }, …];</script>
```

## ES module

```js
import { defineBarChart } from 'motionary/components/widgets';

defineBarChart(); // registers <usa-bar-chart>

/* then use it in your HTML:
<usa-bar-chart values="12,19,8,15,22" labels="Mon,Tue,Wed,Thu,Fri" unit="k"></usa-bar-chart>
*/
```
