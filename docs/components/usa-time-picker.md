# `<mo-time-picker>` — Time picker

> Element name `<mo-time-picker>` (default since 17.3); the legacy name `<usa-time-picker>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Hour and minute spin buttons with step snapping, typed digits and an optional AM / PM switch.

- **Category:** ui · **since** 17.15
- **Import:** `import { defineTimePicker } from 'motionary/components/widgets'` then `defineTimePicker();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `value`, `step`, `hour12`, `name`, `label`, `hour-label`, `minute-label`, `am-label`, `pm-label`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/time-picker.ts](../../src/components/widgets/time-picker.ts)

## Minimal example

```html
<mo-time-picker value="09:30" step="15"></mo-time-picker>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineTimePicker } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineTimePicker(); // registers <mo-time-picker>

/* then use it in your HTML:
<mo-time-picker value="09:30" step="15"></mo-time-picker>
*/
```
