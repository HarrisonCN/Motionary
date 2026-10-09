# motionary/runtime/gltf-decoders — glTF decoder hooks (Draco, KTX2)

> Generated from `showcase/catalog/prereqs.js` by `scripts/gen-runtime-docs.mjs` — edit the data, not this page.

Lets motionary/runtime/format-gltf load KHR_draco_mesh_compression meshes and KHR_texture_basisu (KTX2) textures through the official decoders — Google draco3d and the Basis Universal transcoder — registered as lazy loaders; Motionary does not reimplement them.

Part of Motionary's own zero-dependency runtime. Size budget: **3.0 KB gzip** (enforced in CI).

## Prerequisites

1. **Install:** `npm i motionary`
2. **Import path:** `motionary/runtime/gltf-decoders`
3. **CDN:**

```html
<script src="https://cdn.jsdelivr.net/npm/motionary@11/dist/runtime.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/motionary@11/dist/runtime/gltf-decoders.iife.js"></script>
```

   ESM from a CDN: `https://cdn.jsdelivr.net/npm/motionary@11/dist/runtime/gltf-decoders.js`

4. **Import order & registration:** Register the core first, then the module: use(gltfDecoders) also registers the core. CDN: load runtime.iife.js, then runtime/gltf-decoders.iife.js (it registers itself).

```js
import { use } from 'motionary/runtime';
import { gltfDecoders } from 'motionary/runtime/gltf-decoders';
use(gltfDecoders);
```

## Example

```js
import { use } from 'motionary/runtime';
import { gl } from 'motionary/runtime/gl';
import { formatGltf, loadGltf } from 'motionary/runtime/format-gltf';
import { gltfDecoders, provideGltfDecoder, prepareGltf } from 'motionary/runtime/gltf-decoders';
use(gl, formatGltf, gltfDecoders);
provideGltfDecoder('draco', () => import('draco3d'));
const model = await loadGltf('/models/robot-draco.glb', { prepare: prepareGltf });
```

## Exports

`gltfDecoders` · `provideGltfDecoder` · `providedDecoders` · `prepareGltf` · `decodeDraco` · `transcodeKtx2` · `DECODER_EXTENSIONS`

## Compatibility

| Feature | Supported | Notes |
|---|---|---|
| KHR_draco_mesh_compression (POSITION, NORMAL, TEXCOORD_0, JOINTS / WEIGHTS …, indices) | ✅ yes | decoded by the official draco3d decoder (optional peer) |
| KHR_texture_basisu (KTX2 / Basis Universal ETC1S + UASTC) | ✅ yes | transcoded to RGBA8 by the official Basis Universal transcoder (optional peer); GPU-compressed upload is not used |
| lazy loading: a decoder is fetched only when a file needs it | ✅ yes | provideGltfDecoder(kind, loader) |
| missing decoder | ✅ yes | clear error naming the extension, the package and the provide line |
| EXT_meshopt_compression, KHR_mesh_quantization | ✕ no | files that require them fail with a clear error |
| SSR / workers | ◐ partial | Draco decoding works in Node / workers; KTX2 images need ImageData (or the raw RGBA) |

## Components that need it

- `<usa-gl-model>` — Compressed 3D model (Draco / KTX2)
