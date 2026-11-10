# `<mo-blobs>` — Fluid blobs

> Element name `<mo-blobs>` (default since 17.3); the legacy name `<usa-blobs>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Soft colour blobs that slowly morph and drift — a fluid gradient backdrop.

- **Category:** background · **since** 2.8
- **Import:** `import { defineBlobs } from 'motionary/components/background'` then `defineBlobs();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
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
import { defineMoAliases } from 'motionary/components/mo';
import { defineBlobs } from 'motionary/components/background';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineBlobs(); // registers <mo-blobs>

/* then use it in your HTML:
<mo-blobs colors="#7c5cff,#22d3ee,#f472b6">…</mo-blobs>
*/
```
