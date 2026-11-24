# `<mo-breath-orb>` — Breath orb

> Element name `<mo-breath-orb>` (default since 17.3); the legacy name `<usa-breath-orb>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A soft orb swells and settles at a slow breathing pace.

- **Category:** ui · **since** 17.9
- **Import:** `import { defineBreathOrb } from 'motionary/components/widgets'` then `defineBreathOrb();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `paused`, `duration`
- **Events:** —
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/breath-orb.ts](../../src/components/widgets/breath-orb.ts)

## Minimal example

```html
<mo-breath-orb></mo-breath-orb>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineBreathOrb } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineBreathOrb(); // registers <mo-breath-orb>

/* then use it in your HTML:
<mo-breath-orb></mo-breath-orb>
*/
```
