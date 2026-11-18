# `<mo-iris-diaphragm>` — Iris diaphragm

> Element name `<mo-iris-diaphragm>` (default since 17.3); the legacy name `<usa-iris-diaphragm>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Pivot nine overlapping blades to vary the opening.

- **Category:** depth · **since** 17.8
- **Import:** `import { defineIrisDiaphragm } from 'motionary/components/widgets'` then `defineIrisDiaphragm();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `value`, `label`
- **Events:** `usa:input`, `usa:change`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/iris-diaphragm.ts](../../src/components/widgets/iris-diaphragm.ts)

## Prerequisites — Requires: motionary/runtime/spatial-instruments

1. **Install:** `npm i motionary`
2. **Import order & registration:** Register the core first, then the module: use(spatialInstruments) also registers the core. CDN: load runtime.iife.js, then runtime/spatial-instruments.iife.js (it registers itself).

```js
import { use } from 'motionary/runtime';
import { spatialInstruments } from 'motionary/runtime/spatial-instruments';
import { defineIrisDiaphragm } from 'motionary/components/widgets';

use(spatialInstruments);
defineIrisDiaphragm(); // registers <usa-iris-diaphragm> — after the prerequisites
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
<mo-iris-diaphragm value="45"></mo-iris-diaphragm>
```

## ES module

```js
import { use } from 'motionary/runtime';
import { spatialInstruments } from 'motionary/runtime/spatial-instruments';

use(spatialInstruments);
import { defineMoAliases } from 'motionary/components/mo';
import { defineIrisDiaphragm } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineIrisDiaphragm(); // registers <mo-iris-diaphragm>

/* then use it in your HTML:
<mo-iris-diaphragm value="45"></mo-iris-diaphragm>
*/
```
