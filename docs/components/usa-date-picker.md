# `<usa-date-picker>` — Date picker

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

6.9: months slide in from the direction of travel, the chosen day pops inside a spring circle, today has a ring. A real date grid: arrows, PageUp / PageDown, Home / End, min / max.

- **Category:** ui · **since** 6.9
- **Import:** `import { defineDatePicker } from 'motionary/components/widgets'` then `defineDatePicker();`
- **CDN:** `<script src="https://unpkg.com/motionary@12/dist/widgets.umd.js"></script>`
- **Attributes:** `min`, `max`, `first-day`, `locale`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** `showMonth()`
- **Source:** [src/components/widgets/date-picker.ts](../../src/components/widgets/date-picker.ts)

## Minimal example

```html
<usa-date-picker value="2026-10-08" min="2026-01-01" first-day="1"></usa-date-picker>
```

## ES module

```js
import { defineDatePicker } from 'motionary/components/widgets';

defineDatePicker(); // registers <usa-date-picker>

/* then use it in your HTML:
<usa-date-picker value="2026-10-08" min="2026-01-01" first-day="1"></usa-date-picker>
*/
```
