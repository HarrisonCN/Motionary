# `<mo-lens-stack>` — Lens assembly

> Element name `<mo-lens-stack>` (default since 17.3); the legacy name `<usa-lens-stack>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Separate seven coaxial lens sections with a horizontal drag.

- **Category:** depth · **since** 17.8
- **Import:** `import { defineLensStack } from 'motionary/components/widgets'` then `defineLensStack();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `value`, `label`
- **Events:** `usa:input`, `usa:change`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/lens-stack.ts](../../src/components/widgets/lens-stack.ts)

## Prerequisites — Requires: motionary/runtime/spatial-instruments

1. **Install:** `npm i motionary`
2. **Import order & registration:** Register the core first, then the module: use(spatialInstruments) also registers the core. CDN: load runtime.iife.js, then runtime/spatial-instruments.iife.js (it registers itself).

```js
import { use } from 'motionary/runtime';
import { spatialInstruments } from 'motionary/runtime/spatial-instruments';
import { defineLensStack } from 'motionary/components/widgets';

use(spatialInstruments);
defineLensStack(); // registers <usa-lens-stack> — after the prerequisites
```

3. **CDN:**

```html
<script src="https://cdn.jsdelivr.net/npm/motionary@17/dist/runtime.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/motionary@17/dist/runtime/spatial-instruments.iife.js"></script>
<!-- then the component bundles -->
<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>
<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>
```

## Minimal example

```html
<mo-lens-stack value="42"></mo-lens-stack>
```

## ES module

```js
import { use } from 'motionary/runtime';
import { spatialInstruments } from 'motionary/runtime/spatial-instruments';

use(spatialInstruments);
import { defineMoAliases } from 'motionary/components/mo';
import { defineLensStack } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineLensStack(); // registers <mo-lens-stack>

/* then use it in your HTML:
<mo-lens-stack value="42"></mo-lens-stack>
*/
```
