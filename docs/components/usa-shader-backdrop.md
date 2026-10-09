# `<usa-shader-backdrop>` — Shader backdrop + post chain

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

10.5 (WebGPU effects 2.0): an animated shader background (aurora, plasma, waves, nebula or your own GLSL) run through a post-processing chain — bloom, vignette, grain, chromatic aberration, pixelate, scanlines — in any order; CSS gradient fallback.

- **Category:** ui · **since** 10.5
- **Import:** `import { defineShaderBackdrop } from 'motionary/components/widgets'` then `defineShaderBackdrop();`
- **CDN:** `<script src="https://unpkg.com/motionary@11/dist/widgets.umd.js"></script>`
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
import { defineShaderBackdrop } from 'motionary/components/widgets';

defineShaderBackdrop(); // registers <usa-shader-backdrop>

/* then use it in your HTML:
<usa-shader-backdrop preset="aurora" post="bloom,vignette,grain">
  <h1>Hello</h1>
</usa-shader-backdrop>
*/
```
