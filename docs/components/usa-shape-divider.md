# `<mo-shape-divider>` — Shape divider

> Element name `<mo-shape-divider>` (default since 17.3); the legacy name `<usa-shape-divider>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Wave, curve, tilt, arrow, zigzag or steps between sections; layered waves can drift.

- **Category:** svg · **since** 17.11
- **Import:** `import { defineShapeDivider } from 'motionary/components/widgets'` then `defineShapeDivider();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `shape`, `height`, `position`, `flip`, `color`, `layers`, `animate`
- **Events:** —
- **Slots:** —
- **Methods:** `mount()`, `defineMoName()`
- **Source:** [src/components/widgets/shape-divider.ts](../../src/components/widgets/shape-divider.ts)

## Minimal example

```html
<mo-shape-divider shape="wave" layers="3" animate></mo-shape-divider>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineShapeDivider } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineShapeDivider(); // registers <mo-shape-divider>

/* then use it in your HTML:
<mo-shape-divider shape="wave" layers="3" animate></mo-shape-divider>
*/
```
