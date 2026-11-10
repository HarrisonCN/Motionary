# `<mo-shader-backdrop>` — Shader backdrop + post chain

> Element name `<mo-shader-backdrop>` (default since 17.3); the legacy name `<usa-shader-backdrop>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

10.5 (WebGPU effects 2.0): an animated shader background (aurora, plasma, waves, nebula or your own GLSL) run through a post-processing chain — bloom, vignette, grain, chromatic aberration, pixelate, scanlines — in any order; CSS gradient fallback.

- **Category:** ui · **since** 10.5 · **changed in** 13.8
- **Import:** `import { defineShaderBackdrop } from 'motionary/components/widgets'` then `defineShaderBackdrop();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `preset`, `post`, `colors`, `speed`, `intensity`, `label`
- **Events:** `usa:backend`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/shader-backdrop.ts](../../src/components/widgets/shader-backdrop.ts)

## Minimal example

```html
<usa-shader-backdrop preset="aurora" post="bloom,vignette,grain">
  <h1>Hello</h1>
</usa-shader-backdrop>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineShaderBackdrop } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineShaderBackdrop(); // registers <mo-shader-backdrop>

/* then use it in your HTML:
<mo-shader-backdrop preset="aurora" post="bloom,vignette,grain">
  <h1>Hello</h1>
</mo-shader-backdrop>
*/
```
