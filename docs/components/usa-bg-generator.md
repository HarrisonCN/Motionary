# `<usa-bg-generator>` — Background generator

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

9.3: a background generator — pick a palette and a style (mesh gradient, grain, stripes, dots), shuffle the seed and copy the CSS.

- **Category:** ui · **since** 9.3
- **Import:** `import { defineBgGenerator } from 'motionary/components/widgets'` then `defineBgGenerator();`
- **CDN:** `<script src="https://unpkg.com/motionary@12/dist/widgets.umd.js"></script>`
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
import { defineBgGenerator } from 'motionary/components/widgets';

defineBgGenerator(); // registers <usa-bg-generator>

/* then use it in your HTML:
<usa-bg-generator palette="candy" style="mesh"></usa-bg-generator>
*/
```
