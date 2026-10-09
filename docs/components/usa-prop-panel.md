# `<usa-prop-panel>` — Property panel

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

8.9 low-code: a property editor for a live component — typed fields (number / range, select, color, switch, text) bound to its attributes, so the component re-renders as you edit.

- **Category:** ui · **since** 8.9
- **Import:** `import { definePropPanel } from 'motionary/components/widgets'` then `definePropPanel();`
- **CDN:** `<script src="https://unpkg.com/motionary@10/dist/widgets.umd.js"></script>`
- **Attributes:** `for`, `props`, `label`
- **Events:** `usa:prop`
- **Slots:** —
- **Methods:** `reset()`
- **Source:** [src/components/widgets/prop-panel.ts](../../src/components/widgets/prop-panel.ts)

## Minimal example

```html
<usa-star-rating id="r" value="3"></usa-star-rating>
<usa-prop-panel for="#r" props="value:number:0:5, icon:select:star|heart, readonly:boolean"></usa-prop-panel>
```

## ES module

```js
import { definePropPanel } from 'motionary/components/widgets';

definePropPanel(); // registers <usa-prop-panel>

/* then use it in your HTML:
<usa-star-rating id="r" value="3"></usa-star-rating>
<usa-prop-panel for="#r" props="value:number:0:5, icon:select:star|heart, readonly:boolean"></usa-prop-panel>
*/
```
