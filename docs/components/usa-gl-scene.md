# `<usa-gl-scene>` — 3D scene (glTF / OBJ)

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

10.5: a WebGL2 3D viewer on Motionary’s own renderer — glTF 2.0 / GLB and OBJ / MTL models or built-in shapes, PBR-style materials, orbit controls (drag, wheel, pinch, arrow keys), auto-rotate and video textures. Requires motionary/runtime/gl (+ format-gltf for .gltf / .glb, format-obj for .obj, gltf-anim for glTF animation — 10.8) — npm i motionary, then use(gl, formatGltf, formatObj, gltfAnim) before it mounts.

- **Category:** ui · **since** 10.5
- **Import:** `import { defineGlScene } from 'motionary/components/widgets'` then `defineGlScene();`
- **CDN:** `<script src="https://unpkg.com/motionary@12/dist/widgets.umd.js"></script>`
- **Attributes:** `src`, `shape`, `color`, `metallic`, `roughness`, `background`, `exposure`, `controls`, `auto-rotate`, `video`, `video-scrub`, `label`, `animation`, `animation-speed`
- **Events:** `usa:error`, `usa:load`, `usa:runtime-missing`
- **Slots:** —
- **Methods:** `reload()`
- **Source:** [src/components/widgets/gl-scene.ts](../../src/components/widgets/gl-scene.ts)

## Prerequisites — Requires: motionary/runtime/gl + motionary/runtime/format-gltf + motionary/runtime/format-obj + motionary/runtime/gltf-anim

1. **Install:** `npm i motionary`
2. **Import order & registration:** Register the core first, then the module: use(gl) also registers the core. CDN: load runtime.iife.js, then runtime/gl.iife.js (it registers itself). Register the core first, then the module: use(formatGltf) also registers the core. CDN: load runtime.iife.js, then runtime/format-gltf.iife.js (it registers itself). Register the core first, then the module: use(formatObj) also registers the core. CDN: load runtime.iife.js, then runtime/format-obj.iife.js (it registers itself). Register the core first, then the module: use(gltfAnim) also registers the core. CDN: load runtime.iife.js, then runtime/gltf-anim.iife.js (it registers itself).

```js
import { use } from 'motionary/runtime';
import { gl } from 'motionary/runtime/gl';
import { formatGltf } from 'motionary/runtime/format-gltf';
import { formatObj } from 'motionary/runtime/format-obj';
import { gltfAnim } from 'motionary/runtime/gltf-anim';
import { defineGlScene } from 'motionary/components/widgets';

use(gl, formatGltf, formatObj, gltfAnim);
defineGlScene(); // registers <usa-gl-scene> — after the prerequisites
```

3. **CDN:**

```html
<script src="https://cdn.jsdelivr.net/npm/motionary@12/dist/runtime.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/motionary@12/dist/runtime/gl.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/motionary@12/dist/runtime/format-gltf.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/motionary@12/dist/runtime/format-obj.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/motionary@12/dist/runtime/gltf-anim.iife.js"></script>
<!-- then the component bundles -->
<script src="https://unpkg.com/motionary@12/dist/components.umd.js"></script>
<script src="https://unpkg.com/motionary@12/dist/widgets.umd.js"></script>
```

## Minimal example

```html
<usa-gl-scene src="/models/chair.glb" controls auto-rotate="20" label="Chair"></usa-gl-scene>
```

## ES module

```js
import { use } from 'motionary/runtime';
import { gl } from 'motionary/runtime/gl';
import { formatGltf } from 'motionary/runtime/format-gltf';
import { formatObj } from 'motionary/runtime/format-obj';
import { gltfAnim } from 'motionary/runtime/gltf-anim';

use(gl, formatGltf, formatObj, gltfAnim);
import { defineGlScene } from 'motionary/components/widgets';

defineGlScene(); // registers <usa-gl-scene>

/* then use it in your HTML:
<usa-gl-scene src="/models/chair.glb" controls auto-rotate="20" label="Chair"></usa-gl-scene>
*/
```

## Variants

### 3D scene (glTF / OBJ)

10.5: a WebGL2 3D viewer on Motionary’s own renderer — glTF 2.0 / GLB and OBJ / MTL models or built-in shapes, PBR-style materials, orbit controls (drag, wheel, pinch, arrow keys), auto-rotate and video textures. Requires motionary/runtime/gl (+ format-gltf for .gltf / .glb, format-obj for .obj, gltf-anim for glTF animation — 10.8) — npm i motionary, then use(gl, formatGltf, formatObj, gltfAnim) before it mounts.

```html
<usa-gl-scene src="/models/chair.glb" controls auto-rotate="20" label="Chair"></usa-gl-scene>
```

### 3D animation (glTF skin + morph)

10.8: <usa-gl-scene animation> plays glTF animations — skeletal skinning (4 joints per vertex), morph targets and LINEAR / STEP / CUBICSPLINE channels — on Motionary’s own WebGL2 renderer. Pick a clip by name or index, set animation-speed; reduced motion shows the first pose. Requires motionary/runtime/gl + motionary/runtime/format-gltf + motionary/runtime/gltf-anim (+ format-obj for .obj models) — npm i motionary, then use(gl, formatGltf, formatObj, gltfAnim).

```html
<usa-gl-scene src="/models/robot.glb" animation="walk" controls label="Walking robot"></usa-gl-scene>
```
