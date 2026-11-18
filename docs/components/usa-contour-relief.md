# `<mo-contour-relief>` — Contour relief

> Element name `<mo-contour-relief>` (default since 17.3); the legacy name `<usa-contour-relief>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Lift thirteen contour plates to study the relief in perspective.

- **Category:** depth · **since** 17.8
- **Import:** `import { defineContourRelief } from 'motionary/components/widgets'` then `defineContourRelief();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `value`, `label`
- **Events:** `usa:input`, `usa:change`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/contour-relief.ts](../../src/components/widgets/contour-relief.ts)

## Prerequisites — Requires: motionary/runtime/spatial-instruments

1. **Install:** `npm i motionary`
2. **Import order & registration:** Register the core first, then the module: use(spatialInstruments) also registers the core. CDN: load runtime.iife.js, then runtime/spatial-instruments.iife.js (it registers itself).

```js
import { use } from 'motionary/runtime';
import { spatialInstruments } from 'motionary/runtime/spatial-instruments';
import { defineContourRelief } from 'motionary/components/widgets';

use(spatialInstruments);
defineContourRelief(); // registers <usa-contour-relief> — after the prerequisites
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
<mo-contour-relief value="35"></mo-contour-relief>
```

## ES module

```js
import { use } from 'motionary/runtime';
import { spatialInstruments } from 'motionary/runtime/spatial-instruments';

use(spatialInstruments);
import { defineMoAliases } from 'motionary/components/mo';
import { defineContourRelief } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineContourRelief(); // registers <mo-contour-relief>

/* then use it in your HTML:
<mo-contour-relief value="35"></mo-contour-relief>
*/
```
