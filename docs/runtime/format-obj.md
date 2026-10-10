# motionary/runtime/format-obj — OBJ / MTL loader

> Generated from `showcase/catalog/prereqs.js` by `scripts/gen-runtime-docs.mjs` — edit the data, not this page.

Load Wavefront OBJ (+ MTL materials and diffuse textures) into motionary/runtime/gl nodes: polygons triangulated, groups, per-material meshes.

**Runtime tier:** advanced — see [runtime tiers](../runtime-tiers.md).

Part of Motionary's own zero-dependency runtime. Size budget: **3.0 KB gzip** (enforced in CI).

## Prerequisites

1. **Install:** `npm i motionary`
2. **Import path:** `motionary/runtime/format-obj`
3. **CDN:**

```html
<script src="https://cdn.jsdelivr.net/npm/motionary@13/dist/runtime.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/motionary@13/dist/runtime/format-obj.iife.js"></script>
```

   ESM from a CDN: `https://cdn.jsdelivr.net/npm/motionary@13/dist/runtime/format-obj.js`

4. **Import order & registration:** Register the core first, then the module: use(formatObj) also registers the core. CDN: load runtime.iife.js, then runtime/format-obj.iife.js (it registers itself).

```js
import { use } from 'motionary/runtime';
import { formatObj } from 'motionary/runtime/format-obj';
use(formatObj);
```

## Example

```js
import { use } from 'motionary/runtime';
import { gl, Scene } from 'motionary/runtime/gl';
import { formatObj, loadObj } from 'motionary/runtime/format-obj';
use(gl, formatObj);
const cube = await loadObj('/models/cube.obj'); // + cube.mtl + textures next to it
new Scene().add(cube);
```

## Exports

`formatObj` · `loadObj` · `parseObj` · `parseMtl` · `objToNode` · `objMaterial`

## Compatibility

| Feature | Supported | Notes |
|---|---|---|
| v / vt / vn, faces with any vertex count (fan-triangulated), negative indices | ✅ yes |  |
| o / g groups, usemtl (one mesh per material), mtllib | ✅ yes |  |
| MTL Kd, Ks + Ns (→ roughness), Ke, d / Tr, map_Kd (options stripped) | ✅ yes |  |
| missing normals | ✅ yes | computed (flat) |
| smoothing groups (s), lines (l), free-form curves / surfaces | ✕ no | ignored |
| bump / normal / specular maps, PBR MTL extensions | ✕ no | ignored |
| SSR / workers | ◐ partial | parsing is pure; loadObj fetches files and decodes textures with createImageBitmap |

## Components that need it

- `<usa-gl-scene>` — 3D scene (glTF / OBJ)
