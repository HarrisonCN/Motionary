# motionary/runtime/gltf-anim — glTF animation, skinning and morph targets

> Generated from `showcase/catalog/prereqs.js` by `scripts/gen-runtime-docs.mjs` — edit the data, not this page.

Plays glTF 2.0 animations on models loaded by motionary/runtime/format-gltf: translation / rotation / scale / weights channels with LINEAR, STEP and CUBICSPLINE samplers, skins (4 joints per vertex) and morph targets, deformed on the CPU and re-uploaded to motionary/runtime/gl (own implementation).

Part of Motionary's own zero-dependency runtime. Size budget: **4.5 KB gzip** (enforced in CI).

## Prerequisites

1. **Install:** `npm i motionary`
2. **Import path:** `motionary/runtime/gltf-anim`
3. **CDN:**

```html
<script src="https://cdn.jsdelivr.net/npm/motionary@10/dist/runtime.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/motionary@10/dist/runtime/gltf-anim.iife.js"></script>
```

   ESM from a CDN: `https://cdn.jsdelivr.net/npm/motionary@10/dist/runtime/gltf-anim.js`

4. **Import order & registration:** Register the core first, then the module: use(gltfAnim) also registers the core. CDN: load runtime.iife.js, then runtime/gltf-anim.iife.js (it registers itself).

```js
import { use } from 'motionary/runtime';
import { gltfAnim } from 'motionary/runtime/gltf-anim';
use(gltfAnim);
```

## Example

```js
import { use } from 'motionary/runtime';
import { gl } from 'motionary/runtime/gl';
import { formatGltf, loadGltf } from 'motionary/runtime/format-gltf';
import { gltfAnim, gltfAnimator } from 'motionary/runtime/gltf-anim';
use(gl, formatGltf, gltfAnim);
const model = await loadGltf('/models/robot.glb');
const anim = gltfAnimator(model, { clip: 'walk' });
anim.play(); // or anim.update(dt) in your own loop
```

## Exports

`gltfAnim` · `gltfAnimator` · `gltfClips` · `sampleChannel` · `applyClip` · `deformModel` · `deformGeometry`

## Compatibility

| Feature | Supported | Notes |
|---|---|---|
| animation channels: translation, rotation, scale, weights | ✅ yes | KHR_animation_pointer is ignored |
| samplers: LINEAR (quaternions slerped), STEP, CUBICSPLINE (Hermite, in / out tangents) | ✅ yes |  |
| skins: joint hierarchy, inverse bind matrices, JOINTS_0 / WEIGHTS_0 (4 influences) | ✅ yes | CPU skinning; JOINTS_1 / WEIGHTS_1 (8 influences) not used |
| morph targets: POSITION + NORMAL deltas, mesh / node default weights, animated weights | ✅ yes | TANGENT / TEXCOORD / COLOR targets ignored |
| sparse accessors (common for morph targets) | ✅ yes | read by format-gltf |
| clip player: by name or index, loop, speed, seek, update(dt) or the shared ticker | ✅ yes | one clip at a time (no blending) |
| GPU skinning, animation blending / cross-fades, a mesh shared by several skinned nodes | ✕ no | planned work beyond 11.0 |
| SSR / workers | ✅ yes | sampling and deformation are pure; play() needs the runtime ticker |

## Components that need it

- `<usa-gl-scene>` — 3D scene (glTF / OBJ)
