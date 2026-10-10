# `<usa-compare>` — Before / after compare

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

6.5: drag the handle (or hover with the hover attribute), click to jump, or use the keyboard slider; horizontal or vertical; an intro sweep plays once when it scrolls into view.

- **Category:** interaction · **since** 6.5
- **Import:** `import { defineCompare } from 'motionary/components/widgets'` then `defineCompare();`
- **CDN:** `<script src="https://unpkg.com/motionary@12/dist/widgets.umd.js"></script>`
- **Attributes:** `orientation`, `labels`, `label`, `position`, `hover`, `intro`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/compare.ts](../../src/components/widgets/compare.ts)

## Minimal example

```html
<usa-compare labels="Before,After" intro>
  <img src="before.jpg" alt="Before">
  <img src="after.jpg" alt="After">
</usa-compare>
```

## ES module

```js
import { defineCompare } from 'motionary/components/widgets';

defineCompare(); // registers <usa-compare>

/* then use it in your HTML:
<usa-compare labels="Before,After" intro>
  <img src="before.jpg" alt="Before">
  <img src="after.jpg" alt="After">
</usa-compare>
*/
```
