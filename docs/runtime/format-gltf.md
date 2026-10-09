# motionary/runtime/format-gltf — glTF 2.0 / GLB loader

> Generated from `showcase/catalog/prereqs.js` by `scripts/gen-runtime-docs.mjs` — edit the data, not this page.

Load glTF 2.0 (.gltf with external or data: buffers, .glb) into motionary/runtime/gl nodes: node hierarchy, meshes, PBR metallic-roughness materials, embedded / external images.

**Runtime tier:** advanced — see [runtime tiers](../runtime-tiers.md).

Part of Motionary's own zero-dependency runtime. Size budget: **6.0 KB gzip** (enforced in CI).

## Prerequisites

1. **Install:** `npm i motionary`
2. **Import path:** `motionary/runtime/format-gltf`
3. **CDN:**

```html
<script src="https://cdn.jsdelivr.net/npm/motionary@11/dist/runtime.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/motionary@11/dist/runtime/format-gltf.iife.js"></script>
```

   ESM from a CDN: `https://cdn.jsdelivr.net/npm/motionary@11/dist/runtime/format-gltf.js`

4. **Import order & registration:** Register the core first, then the module: use(formatGltf) also registers the core. CDN: load runtime.iife.js, then runtime/format-gltf.iife.js (it registers itself).

```js
import { use } from 'motionary/runtime';
import { formatGltf } from 'motionary/runtime/format-gltf';
use(formatGltf);
```

## Example

```js
import { use } from 'motionary/runtime';
import { gl, createRenderer, Scene, Camera, frameNode } from 'motionary/runtime/gl';
import { formatGltf, loadGltf } from 'motionary/runtime/format-gltf';
use(gl, formatGltf);
const model = await loadGltf('/models/chair.glb');
const scene = new Scene().add(model), cam = new Camera();
frameNode(cam, model);
const r = createRenderer(canvas); r.resize(); r.render(scene, cam);
```

## Exports

`formatGltf` · `loadGltf` · `parseGlb` · `gltfToNode` · `readAccessor` · `SUPPORTED_EXTENSIONS`

## Compatibility

| Feature | Supported | Notes |
|---|---|---|
| .gltf (external + data: URI buffers / images) and .glb | ✅ yes |  |
| scenes, node hierarchy, TRS and matrix transforms | ✅ yes |  |
| POSITION / NORMAL / TEXCOORD_0, indices, all component types, normalised ints, byteStride | ✅ yes | missing normals computed (flat) |
| primitive modes points / lines / triangles / strips / fans | ✅ yes | strips and fans converted to triangles |
| PBR metallic-roughness factors, base colour texture, emissive, alpha blend, double-sided | ✅ yes | KHR_materials_emissive_strength, KHR_materials_unlit |
| skins, morph targets, animations | ✅ yes | data kept on the nodes / geometry; played by motionary/runtime/gltf-anim (10.8) |
| sparse accessors | ✅ yes | 10.8 |
| Draco / KTX2 (Basis) compression | ✅ yes | 10.9: through the official decoders (draco3d, Basis Universal transcoder) — motionary/runtime/gltf-decoders + <usa-gl-model> |
| meshopt compression (EXT_meshopt_compression) | ✕ no | files that require it fail with a clear error |
| cameras, KHR_lights_punctual, texture transforms | ✕ no | ignored |
| SSR / workers | ◐ partial | parseGlb / gltfToNode are pure; loadGltf decodes images with createImageBitmap |

## Components that need it

- `<usa-gl-scene>` — 3D scene (glTF / OBJ)
- `<usa-gl-model>` — Compressed 3D model (Draco / KTX2)
