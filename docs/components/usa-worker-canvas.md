# `<usa-worker-canvas>` — Worker canvas

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

9.6: a canvas animation rendered in a Web Worker on an OffscreenCanvas — the main thread stays free for input — with a main-thread fallback; particles, orbits, starfield or your own draw program.

- **Category:** ui · **since** 9.6 · **changed in** 10.9, 11.0
- **Import:** `import { defineWorkerCanvas } from 'motionary/components/widgets'` then `defineWorkerCanvas();`
- **CDN:** `<script src="https://unpkg.com/motionary@13/dist/widgets.umd.js"></script>`
- **Attributes:** `scene`, `label`
- **Events:** `usa:backend`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/worker-canvas.ts](../../src/components/widgets/worker-canvas.ts)

## Minimal example

```html
<usa-worker-canvas scene="starfield" style="height:240px"></usa-worker-canvas>
```

## ES module

```js
import { defineWorkerCanvas } from 'motionary/components/widgets';

defineWorkerCanvas(); // registers <usa-worker-canvas>

/* then use it in your HTML:
<usa-worker-canvas scene="starfield" style="height:240px"></usa-worker-canvas>
*/
```
