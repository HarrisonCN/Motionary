# `<mo-gpu-particles>` — GPU particle canvas

> Element name `<mo-gpu-particles>` (default since 17.3); the legacy name `<usa-gpu-particles>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

10.5 (WebGPU effects 2.0): tens of thousands of particles simulated by a WebGPU compute shader and drawn as instanced quads — swirl, galaxy or fountain, pointer repulsion, trails; Canvas 2D fallback where WebGPU is missing.

- **Category:** ui · **since** 10.5 · **changed in** 11.8
- **Import:** `import { defineGpuParticles } from 'motionary/components/widgets'` then `defineGpuParticles();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `count`, `mode`, `colors`, `size`, `speed`, `trail`, `pointer`, `label`
- **Events:** `usa:backend`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/gpu-particles.ts](../../src/components/widgets/gpu-particles.ts)

## Minimal example

```html
<usa-gpu-particles count="30000" mode="galaxy" colors="#818cf8,#f472b6" pointer></usa-gpu-particles>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineGpuParticles } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineGpuParticles(); // registers <mo-gpu-particles>

/* then use it in your HTML:
<mo-gpu-particles count="30000" mode="galaxy" colors="#818cf8,#f472b6" pointer></mo-gpu-particles>
*/
```
