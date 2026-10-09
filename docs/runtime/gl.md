# motionary/runtime/gl — WebGL2 scene renderer

> Generated from `showcase/catalog/prereqs.js` by `scripts/gen-runtime-docs.mjs` — edit the data, not this page.

A small WebGL2 renderer with its own API: scene graph, camera, lights, box / plane / sphere / torus, PBR-style materials, shader materials, image and video textures, orbit controls — not a Three.js clone.

Part of Motionary's own zero-dependency runtime. Size budget: **9.0 KB gzip** (enforced in CI).

## Prerequisites

1. **Install:** `npm i motionary`
2. **Import path:** `motionary/runtime/gl`
3. **CDN:**

```html
<script src="https://cdn.jsdelivr.net/npm/motionary@10/dist/runtime.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/motionary@10/dist/runtime/gl.iife.js"></script>
```

   ESM from a CDN: `https://cdn.jsdelivr.net/npm/motionary@10/dist/runtime/gl.js`

4. **Import order & registration:** Register the core first, then the module: use(gl) also registers the core. CDN: load runtime.iife.js, then runtime/gl.iife.js (it registers itself).

```js
import { use } from 'motionary/runtime';
import { gl } from 'motionary/runtime/gl';
use(gl);
```

## Example

```js
import { use } from 'motionary/runtime';
import { gl, createRenderer, Scene, Camera, GlNode, torus, standardMaterial } from 'motionary/runtime/gl';
use(gl);
const r = createRenderer(canvas);
const scene = new Scene();
scene.add(new GlNode('donut', { geometry: torus(), material: standardMaterial({ color: [0.5, 0.55, 1, 1] }) }));
r.resize(); r.render(scene, new Camera({ position: [0, 0.5, 3] }));
```

## Exports

`gl` · `createRenderer` · `Scene` · `Camera` · `GlNode` · `box` · `plane` · `sphere` · `torus` · `standardMaterial` · `unlitMaterial` · `shaderMaterial` · `texture` · `orbitControls` · `frameNode` · `bounds` · `scrubVideo` · `mat4` · `quatFromEuler` · `quatSlerp`

## Compatibility

| Feature | Supported | Notes |
|---|---|---|
| scene graph: nodes, TRS / matrix, hierarchy, bounds, frameNode() | ✅ yes |  |
| perspective camera, orbit controls (drag / wheel / pinch / arrow keys) | ✅ yes | auto-rotate off under reduced motion |
| ambient + up to 4 directional / point lights | ✅ yes |  |
| standard material (metallic-roughness approximation), unlit, shader | ✅ yes | sRGB in/out, Reinhard tone mapping |
| image / canvas / ImageBitmap / raw RGBA textures, mipmaps (power of two) | ✅ yes |  |
| video textures (MP4 / WebM), scroll-scrubbed video (scrubVideo) | ✅ yes | requestVideoFrameCallback; codecs depend on the browser |
| shadows, normal / occlusion / metallic-roughness maps, IBL | ✕ no | planned work beyond 11.0 |
| WebGL1 / no WebGL2 | ✕ no | createRenderer() throws a clear error |
| SSR / workers | ◐ partial | math / geometry / scene graph are pure; rendering needs WebGL2 (OffscreenCanvas works) |

## Components that need it

- `<usa-gl-scene>` — 3D scene (glTF / OBJ)
