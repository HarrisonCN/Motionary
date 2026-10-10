# `<usa-shader>` — Shader background

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A GPU shader behind your content: gradient, plasma, waves or aurora presets — or your own fragment shader in a <script type="x-shader/x-fragment">. Falls back to the CSS background.

- **Category:** webgl · **since** 3.4 · **changed in** 4.0, 4.8
- **Import:** `import { defineShader } from 'motionary/components/webgl'` then `defineShader();`
- **CDN:** `<script src="https://unpkg.com/motionary@12/dist/components.umd.js"></script>`
- **Attributes:** —
- **Events:** —
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/webgl/elements.ts](../../src/components/webgl/elements.ts)

## Minimal example

```html
<usa-shader preset="aurora" speed="1">
  <h1>Hero title</h1>
</usa-shader>

<usa-shader>
  <script type="x-shader/x-fragment">
    void main() { gl_FragColor = vec4(v_uv, 0.5 + 0.5 * sin(u_time), 1.0); }
  </script>
</usa-shader>
```

## ES module

```js
import { defineShader } from 'motionary/components/webgl';

defineShader(); // registers <usa-shader>

/* then use it in your HTML:
<usa-shader preset="aurora" speed="1">
  <h1>Hero title</h1>
</usa-shader>

<usa-shader>
  </usa-shader>
*/
```

## Variants

### Shader background

A GPU shader behind your content: gradient, plasma, waves or aurora presets — or your own fragment shader in a <script type="x-shader/x-fragment">. Falls back to the CSS background.

```html
<usa-shader preset="aurora" speed="1">
  <h1>Hero title</h1>
</usa-shader>

<usa-shader>
  <script type="x-shader/x-fragment">
    void main() { gl_FragColor = vec4(v_uv, 0.5 + 0.5 * sin(u_time), 1.0); }
  </script>
</usa-shader>
```

### GPU particles

Particle presets (4.8) on the same single quad — snow, fireflies, a warp starfield, bokeh and rain — computed procedurally in the shader (no buffers, no per-particle JS). Adaptive: resolution steps down when fps drops, frame rate is capped on battery saver.

```html
<usa-shader preset="snow">
  <h1>Winter sale</h1>
</usa-shader>
<!-- fireflies · stars · bokeh · rain; quality="high" disables adaptive quality -->
```
