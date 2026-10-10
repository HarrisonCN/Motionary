# `<usa-color-picker>` — Color picker

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

6.9: a saturation / brightness square and a hue strip with spring-follow thumbs (both keyboard sliders), a preview chip that morphs to the new colour and swatches that pop.

- **Category:** ui · **since** 6.9 · **changed in** 13.1
- **Import:** `import { defineColorPicker } from 'motionary/components/widgets'` then `defineColorPicker();`
- **CDN:** `<script src="https://unpkg.com/motionary@13/dist/widgets.umd.js"></script>`
- **Attributes:** `swatches`
- **Events:** `usa:change`, `usa:input`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/color-picker.ts](../../src/components/widgets/color-picker.ts)

## Minimal example

```html
<usa-color-picker value="#7c5cff" swatches="#f43f5e,#f59e0b,#22c55e,#0ea5e9"></usa-color-picker>
```

## ES module

```js
import { defineColorPicker } from 'motionary/components/widgets';

defineColorPicker(); // registers <usa-color-picker>

/* then use it in your HTML:
<usa-color-picker value="#7c5cff" swatches="#f43f5e,#f59e0b,#22c55e,#0ea5e9"></usa-color-picker>
*/
```
