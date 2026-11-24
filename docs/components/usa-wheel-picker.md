# `<mo-wheel-picker>` — Wheel picker

> Element name `<mo-wheel-picker>` (default since 17.3); the legacy name `<usa-wheel-picker>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Phone-style drum wheels built from native selects; rows lean back in 3D and the select stays in sync.

- **Category:** gesture · **since** 17.13
- **Import:** `import { defineWheelPicker } from 'motionary/components/widgets'` then `defineWheelPicker();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `rows`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/wheel-picker.ts](../../src/components/widgets/wheel-picker.ts)

## Minimal example

```html
<mo-wheel-picker label="Time"><select aria-label="Hour"><option>07</option><option>08</option><option selected>09</option><option>10</option><option>11</option></select><select aria-label="Minute"><option>00</option><option selected>15</option><option>30</option><option>45</option></select></mo-wheel-picker>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineWheelPicker } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineWheelPicker(); // registers <mo-wheel-picker>

/* then use it in your HTML:
<mo-wheel-picker label="Time"><select aria-label="Hour"><option>07</option><option>08</option><option selected>09</option><option>10</option><option>11</option></select><select aria-label="Minute"><option>00</option><option selected>15</option><option>30</option><option>45</option></select></mo-wheel-picker>
*/
```
