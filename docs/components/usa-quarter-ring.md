# `<mo-quarter-ring>` — Quarter ring

> Element name `<mo-quarter-ring>` (default since 17.3); the legacy name `<usa-quarter-ring>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A quarter arc sweeps round a faint ring, speeding up and easing off.

- **Category:** ui · **since** 17.9
- **Import:** `import { defineQuarterRing } from 'motionary/components/widgets'` then `defineQuarterRing();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `paused`, `duration`
- **Events:** —
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/quarter-ring.ts](../../src/components/widgets/quarter-ring.ts)

## Minimal example

```html
<mo-quarter-ring></mo-quarter-ring>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineQuarterRing } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineQuarterRing(); // registers <mo-quarter-ring>

/* then use it in your HTML:
<mo-quarter-ring></mo-quarter-ring>
*/
```
