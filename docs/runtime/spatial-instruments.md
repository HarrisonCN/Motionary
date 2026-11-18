# motionary/runtime/spatial-instruments — Three.js instrument scenes

> Generated from `showcase/catalog/prereqs.js` by `scripts/gen-runtime-docs.mjs` — edit the data, not this page.

An independently loaded renderer built with Three.js. Ships with Motionary. The lens, iris and relief cards each provide a native range and a schematic view for devices without WebGL2.

**Runtime tier:** advanced — see [runtime tiers](../runtime-tiers.md).

Part of Motionary's own zero-dependency runtime. Historical size reference: **160.0 KB gzip** (informational; no cap).

## Prerequisites

1. **Install:** `npm i motionary`
2. **Import path:** `motionary/runtime/spatial-instruments`
3. **CDN:**

```html
<script src="https://cdn.jsdelivr.net/npm/motionary@17/dist/runtime.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/motionary@17/dist/runtime/spatial-instruments.iife.js"></script>
```

   ESM from a CDN: `https://cdn.jsdelivr.net/npm/motionary@17/dist/runtime/spatial-instruments.js`

4. **Import order & registration:** Register the core first, then the module: use(spatialInstruments) also registers the core. CDN: load runtime.iife.js, then runtime/spatial-instruments.iife.js (it registers itself).

```js
import { use } from 'motionary/runtime';
import { spatialInstruments } from 'motionary/runtime/spatial-instruments';
use(spatialInstruments);
```

## Example

```js
import { use } from 'motionary/runtime';
import { spatialInstruments } from 'motionary/runtime/spatial-instruments';
import { defineLensStack } from 'motionary/widgets/lens-stack';
use(spatialInstruments);
defineLensStack();
```

## Exports

`spatialInstruments` · `createInstrument`

## Compatibility

| Feature | Supported | Notes |
|---|---|---|
| Perspective meshes and lighting | ✅ yes | WebGL2 |
| Interactive schematic | ✅ yes | Available without a graphics context |
| Server-side import | ✅ yes | Canvas is needed only to create a view |

## Components that need it

- `<usa-lens-stack>` — Lens assembly
- `<usa-iris-diaphragm>` — Iris diaphragm
- `<usa-contour-relief>` — Contour relief
