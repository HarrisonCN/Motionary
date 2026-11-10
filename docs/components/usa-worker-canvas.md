# `<mo-worker-canvas>` — Worker canvas

> Element name `<mo-worker-canvas>` (default since 17.3); the legacy name `<usa-worker-canvas>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

9.6: a canvas animation rendered in a Web Worker on an OffscreenCanvas — the main thread stays free for input — with a main-thread fallback; particles, orbits, starfield or your own draw program.

- **Category:** ui · **since** 9.6 · **changed in** 10.9, 11.0
- **Import:** `import { defineWorkerCanvas } from 'motionary/components/widgets'` then `defineWorkerCanvas();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
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
import { defineMoAliases } from 'motionary/components/mo';
import { defineWorkerCanvas } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineWorkerCanvas(); // registers <mo-worker-canvas>

/* then use it in your HTML:
<mo-worker-canvas scene="starfield" style="height:240px"></mo-worker-canvas>
*/
```
