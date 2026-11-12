# `<mo-elastic-mesh>` — Elastic mesh

> Element name `<mo-elastic-mesh>` (default since 17.3); the legacy name `<usa-elastic-mesh>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Pull a spring mesh and release it to settle back to its rest positions.

- **Category:** physics · **since** 17.6
- **Import:** `import { defineElasticMesh } from 'motionary/components/widgets'` then `defineElasticMesh();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `disabled`, `animated`, `paused`, `color`, `accent`, `strength`
- **Events:** `usa:action`, `usa:change`
- **Slots:** —
- **Methods:** `update()`, `reset()`, `play()`, `pause()`, `activate()`, `deactivate()`
- **Source:** [src/components/widgets/elastic-mesh.ts](../../src/components/widgets/elastic-mesh.ts)

## Minimal example

```html
<mo-elastic-mesh animated></mo-elastic-mesh>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineElasticMesh } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineElasticMesh(); // registers <mo-elastic-mesh>

/* then use it in your HTML:
<mo-elastic-mesh animated></mo-elastic-mesh>
*/
```
