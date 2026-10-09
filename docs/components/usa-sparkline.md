# `<usa-sparkline>` — Sparkline

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

7.2: a tiny inline trend — draws itself on first view, a soft area fades in, the last point pulses and new data morphs the line point by point. line | area | bars; hover shows the value.

- **Category:** ui · **since** 7.2
- **Import:** `import { defineSparkline } from 'motionary/components/widgets'` then `defineSparkline();`
- **CDN:** `<script src="https://unpkg.com/motionary@11/dist/widgets.umd.js"></script>`
- **Attributes:** `variant`, `color`
- **Events:** —
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/sparkline.ts](../../src/components/widgets/sparkline.ts)

## Minimal example

```html
<usa-sparkline values="3,5,4,8,6,9,12" variant="area"></usa-sparkline>
```

## ES module

```js
import { defineSparkline } from 'motionary/components/widgets';

defineSparkline(); // registers <usa-sparkline>

/* then use it in your HTML:
<usa-sparkline values="3,5,4,8,6,9,12" variant="area"></usa-sparkline>
*/
```
