# basis_transcoder.js — Official Basis Universal transcoder (Binomial)

> Generated from `showcase/catalog/prereqs.js` by `scripts/gen-runtime-docs.mjs` — edit the data, not this page.

Binomial’s official Basis Universal transcoder (Apache-2.0, basis_transcoder.js + .wasm from the basis_universal repository), used by motionary/runtime/gltf-decoders for KHR_texture_basisu (KTX2) textures. Optional: lazy-loaded when the first KTX2 texture is decoded, never bundled into Motionary.

**Official third-party runtime** (optional peer dependency, lazy-loaded). Why not our own: KTX2 / Basis Universal is a supercompressed GPU texture format with a complex reference transcoder; the official transcoder is the only safe implementation, so Motionary does not reimplement it.

## Prerequisites

1. **Install:** `curl -LO https://cdn.jsdelivr.net/gh/BinomialLLC/basis_universal@1.16.4/webgl/transcoder/build/basis_transcoder.js -LO https://cdn.jsdelivr.net/gh/BinomialLLC/basis_universal@1.16.4/webgl/transcoder/build/basis_transcoder.wasm`
2. **Import path:** `basis_transcoder.js`
3. **CDN:**

```html
<script src="https://cdn.jsdelivr.net/gh/BinomialLLC/basis_universal@1.16.4/webgl/transcoder/build/basis_transcoder.js"></script>
```

   ESM from a CDN: `https://cdn.jsdelivr.net/gh/BinomialLLC/basis_universal@1.16.4/webgl/transcoder/build/basis_transcoder.js`

4. **Import order & registration:** The transcoder is not published on npm by Binomial: copy basis_transcoder.js + basis_transcoder.wasm (same folder) into your static files, then provideGltfDecoder('ktx2', …) before a KTX2 model loads; or load it from the CDN (window.BASIS) and provideGltfDecoder('ktx2', () => window.BASIS). Missing → a clear error naming the extension and this line.

```js
import { provideGltfDecoder } from 'motionary/runtime/gltf-decoders';
provideGltfDecoder('ktx2', () => import('/vendor/basis_transcoder.js').then((m) => m.default || window.BASIS)); // lazy: fetched with the first KTX2 texture
```

## Example

```js
import { provideGltfDecoder } from 'motionary/runtime/gltf-decoders';
provideGltfDecoder('ktx2', () => window.BASIS);
```

## Exports

`provideGltfDecoder`

## Compatibility

| Feature | Supported | Notes |
|---|---|---|
| KTX2 textures (ETC1S / UASTC) in glTF (KHR_texture_basisu) | ✅ yes | transcoded to RGBA8 |
| standalone .basis / .ktx2 files outside glTF | ✕ no | use the transcoder directly |

## Components that need it

- `<usa-gl-model>` — Compressed 3D model (Draco / KTX2)
