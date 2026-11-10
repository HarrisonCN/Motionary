# `<mo-aurora>` — Aurora

> Element name `<mo-aurora>` (default since 17.3); the legacy name `<usa-aurora>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A slow drifting gradient mesh behind its content. Transforms only, paused off-screen, still under reduced motion.

- **Category:** background · **since** 2.2 · **changed in** 13.4
- **Import:** `import { defineAurora } from 'motionary/components/background'` then `defineAurora();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
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
import { defineMoAliases } from 'motionary/components/mo';
import { defineAurora } from 'motionary/components/background';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineAurora(); // registers <mo-aurora>

/* then use it in your HTML:
<mo-aurora colors="#7c5cff,#22d3ee,#f472b6">
  <h1>Hero</h1>
</mo-aurora>
*/
```
