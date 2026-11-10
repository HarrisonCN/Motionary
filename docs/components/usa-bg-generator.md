# `<mo-bg-generator>` — Background generator

> Element name `<mo-bg-generator>` (default since 17.3); the legacy name `<usa-bg-generator>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

9.3: a background generator — pick a palette and a style (mesh gradient, grain, stripes, dots), shuffle the seed and copy the CSS.

- **Category:** ui · **since** 9.3
- **Import:** `import { defineBgGenerator } from 'motionary/components/widgets'` then `defineBgGenerator();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `palette`, `style`, `seed`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** `shuffle()`, `copy()`
- **Source:** [src/components/widgets/bg-generator.ts](../../src/components/widgets/bg-generator.ts)

## Minimal example

```html
<usa-bg-generator palette="candy" style="mesh"></usa-bg-generator>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineBgGenerator } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineBgGenerator(); // registers <mo-bg-generator>

/* then use it in your HTML:
<mo-bg-generator palette="candy" style="mesh"></mo-bg-generator>
*/
```
