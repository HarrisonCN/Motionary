# `<mo-tag-cloud>` — Tag cloud

> Element name `<mo-tag-cloud>` (default since 17.3); the legacy name `<usa-tag-cloud>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Words sized by weight that rise in one by one and bob gently; hovering one dims the rest.

- **Category:** text · **since** 17.12
- **Import:** `import { defineTagCloud } from 'motionary/components/widgets'` then `defineTagCloud();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `min-size`, `max-size`, `still`, `label`
- **Events:** —
- **Slots:** —
- **Methods:** `mount()`, `defineMoName()`
- **Source:** [src/components/widgets/tag-cloud.ts](../../src/components/widgets/tag-cloud.ts)

## Minimal example

```html
<mo-tag-cloud><a href="#" data-weight="9">Motion</a><a href="#" data-weight="4">Scroll</a><a href="#" data-weight="7">Spring</a><a href="#" data-weight="2">SVG</a><a href="#" data-weight="5">WebGL</a></mo-tag-cloud>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineTagCloud } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineTagCloud(); // registers <mo-tag-cloud>

/* then use it in your HTML:
<mo-tag-cloud><a href="#" data-weight="9">Motion</a><a href="#" data-weight="4">Scroll</a><a href="#" data-weight="7">Spring</a><a href="#" data-weight="2">SVG</a><a href="#" data-weight="5">WebGL</a></mo-tag-cloud>
*/
```
