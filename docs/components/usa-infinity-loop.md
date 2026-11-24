# `<mo-infinity-loop>` — Infinity loop

> Element name `<mo-infinity-loop>` (default since 17.3); the legacy name `<usa-infinity-loop>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A short stroke runs along a figure-eight track.

- **Category:** ui · **since** 17.9
- **Import:** `import { defineInfinityLoop } from 'motionary/components/widgets'` then `defineInfinityLoop();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `paused`, `duration`
- **Events:** —
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/infinity-loop.ts](../../src/components/widgets/infinity-loop.ts)

## Minimal example

```html
<mo-infinity-loop></mo-infinity-loop>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineInfinityLoop } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineInfinityLoop(); // registers <mo-infinity-loop>

/* then use it in your HTML:
<mo-infinity-loop></mo-infinity-loop>
*/
```
