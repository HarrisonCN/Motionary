# draco3d — Official Draco decoder (Google)

> Generated from `showcase/catalog/prereqs.js` by `scripts/gen-runtime-docs.mjs` — edit the data, not this page.

Google’s official Draco geometry decoder (Apache-2.0, WASM / JS), used by motionary/runtime/gltf-decoders for KHR_draco_mesh_compression meshes. Optional peer dependency: lazy-loaded when the first Draco file is opened, never bundled into Motionary.

**Official third-party runtime** (optional peer dependency, lazy-loaded). Why not our own: Draco is a specialised geometry codec with a large reference decoder (WASM); the official decoder is the only safe, maintained implementation, so Motionary does not reimplement it.

## Prerequisites

1. **Install:** `npm i draco3d`
2. **Import path:** `draco3d`
3. **CDN:**

```html
<script src="https://www.gstatic.com/draco/versioned/decoders/1.5.7/draco_decoder.js"></script>
```

   ESM from a CDN: `https://cdn.jsdelivr.net/npm/draco3d@1.5.7/+esm`

4. **Import order & registration:** Install draco3d next to motionary, then register the lazy loader with provideGltfDecoder('draco', () => import('draco3d')) before a compressed model loads. Without a bundler: load Google’s draco_decoder.js from gstatic (window.DracoDecoderModule) and provideGltfDecoder('draco', () => window.DracoDecoderModule). Missing → a clear error naming the extension and this line.

```js
import { provideGltfDecoder } from 'motionary/runtime/gltf-decoders';
provideGltfDecoder('draco', () => import('draco3d')); // lazy: fetched when the first Draco-compressed model loads
```

## Example

```js
import { provideGltfDecoder } from 'motionary/runtime/gltf-decoders';
provideGltfDecoder('draco', () => import('draco3d'));
```

## Exports

`provideGltfDecoder`

## Compatibility

| Feature | Supported | Notes |
|---|---|---|
| Draco meshes in glTF (KHR_draco_mesh_compression) | ✅ yes | decoded by draco3d 1.5.x |
| point clouds | ✕ no | triangle meshes only |

## Components that need it

- `<usa-gl-model>` — Compressed 3D model (Draco / KTX2)
