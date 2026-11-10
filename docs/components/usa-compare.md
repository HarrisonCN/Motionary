# `<mo-compare>` — Before / after compare

> Element name `<mo-compare>` (default since 17.3); the legacy name `<usa-compare>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

6.5: drag the handle (or hover with the hover attribute), click to jump, or use the keyboard slider; horizontal or vertical; an intro sweep plays once when it scrolls into view.

- **Category:** interaction · **since** 6.5 · **changed in** 13.1
- **Import:** `import { defineCompare } from 'motionary/components/widgets'` then `defineCompare();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
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
import { defineMoAliases } from 'motionary/components/mo';
import { defineCompare } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineCompare(); // registers <mo-compare>

/* then use it in your HTML:
<mo-compare labels="Before,After" intro>
  <img src="before.jpg" alt="Before">
  <img src="after.jpg" alt="After">
</mo-compare>
*/
```
