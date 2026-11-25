# `<mo-color-swatches>` — Colour swatches

> Element name `<mo-color-swatches>` (default since 17.3); the legacy name `<usa-color-swatches>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Pick a colour from round or square swatches; the check turns black or white to stay readable.

- **Category:** ui · **since** 17.15
- **Import:** `import { defineColorSwatches } from 'motionary/components/widgets'` then `defineColorSwatches();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `colors`, `names`, `value`, `name`, `label`, `shape`, `size`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/color-swatches.ts](../../src/components/widgets/color-swatches.ts)

## Minimal example

```html
<mo-color-swatches colors="#1f2937,#e11d48,#2563eb,#16a34a,#f5f5f4" names="Graphite,Rose,Ocean,Forest,Chalk" value="#2563eb"></mo-color-swatches>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineColorSwatches } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineColorSwatches(); // registers <mo-color-swatches>

/* then use it in your HTML:
<mo-color-swatches colors="#1f2937,#e11d48,#2563eb,#16a34a,#f5f5f4" names="Graphite,Rose,Ocean,Forest,Chalk" value="#2563eb"></mo-color-swatches>
*/
```
