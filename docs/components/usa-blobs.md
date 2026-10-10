# `<usa-blobs>` — Fluid blobs

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Soft colour blobs that slowly morph and drift — a fluid gradient backdrop.

- **Category:** background
- **Import:** `import { defineBlobs } from 'motionary/components/background'` then `defineBlobs();`
- **CDN:** `<script src="https://unpkg.com/motionary@12/dist/components.umd.js"></script>`
- **Attributes:** `colors`, `speed`, `blur`
- **Events:** —
- **Slots:** —
- **Methods:** `mount()`
- **Source:** [src/components/background/bg-fx.ts](../../src/components/background/bg-fx.ts)

## Minimal example

```html
<usa-blobs colors="#7c5cff,#22d3ee,#f472b6">…</usa-blobs>
```

## ES module

```js
import { defineBlobs } from 'motionary/components/background';

defineBlobs(); // registers <usa-blobs>

/* then use it in your HTML:
<usa-blobs colors="#7c5cff,#22d3ee,#f472b6">…</usa-blobs>
*/
```
