# `<mo-elastic-frame>` — Elastic frame

> Element name `<mo-elastic-frame>` (default since 17.3); the legacy name `<usa-elastic-frame>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A rubber frame whose edges bow toward the pointer and wobble back.

- **Category:** physics · **since** 17.11
- **Import:** `import { defineElasticFrame } from 'motionary/components/widgets'` then `defineElasticFrame();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `stretch`, `reach`, `radius`, `fill`, `stroke`, `stroke-width`
- **Events:** —
- **Slots:** —
- **Methods:** `mount()`, `draw()`, `settle()`, `size()`, `defineMoName()`
- **Source:** [src/components/widgets/elastic-frame.ts](../../src/components/widgets/elastic-frame.ts)

## Minimal example

```html
<mo-elastic-frame><h3>Stretch me</h3></mo-elastic-frame>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineElasticFrame } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineElasticFrame(); // registers <mo-elastic-frame>

/* then use it in your HTML:
<mo-elastic-frame><h3>Stretch me</h3></mo-elastic-frame>
*/
```
