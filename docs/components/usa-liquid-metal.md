# `<mo-liquid-metal>` — Liquid metal

> Element name `<mo-liquid-metal>` (default since 17.3); the legacy name `<usa-liquid-metal>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Stippled metaballs pull toward the pointer and merge into a bead.

- **Category:** physics · **since** 17.6
- **Import:** `import { defineLiquidMetal } from 'motionary/components/widgets'` then `defineLiquidMetal();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `disabled`, `animated`, `paused`, `color`, `accent`, `seed`, `strength`
- **Events:** `usa:action`, `usa:change`
- **Slots:** —
- **Methods:** `update()`, `reset()`, `play()`, `pause()`, `activate()`, `deactivate()`
- **Source:** [src/components/widgets/liquid-metal.ts](../../src/components/widgets/liquid-metal.ts)

## Minimal example

```html
<mo-liquid-metal animated></mo-liquid-metal>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineLiquidMetal } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineLiquidMetal(); // registers <mo-liquid-metal>

/* then use it in your HTML:
<mo-liquid-metal animated></mo-liquid-metal>
*/
```
