# `<usa-aurora>` — Aurora

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A slow drifting gradient mesh behind its content. Transforms only, paused off-screen, still under reduced motion.

- **Category:** background
- **Import:** `import { defineAurora } from 'motionary/components/background'` then `defineAurora();`
- **CDN:** `<script src="https://unpkg.com/motionary@12/dist/components.umd.js"></script>`
- **Attributes:** `colors`, `speed`, `intensity`
- **Events:** —
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/background/aurora.ts](../../src/components/background/aurora.ts)

## Minimal example

```html
<usa-aurora colors="#7c5cff,#22d3ee,#f472b6">
  <h1>Hero</h1>
</usa-aurora>
```

## ES module

```js
import { defineAurora } from 'motionary/components/background';

defineAurora(); // registers <usa-aurora>

/* then use it in your HTML:
<usa-aurora colors="#7c5cff,#22d3ee,#f472b6">
  <h1>Hero</h1>
</usa-aurora>
*/
```
