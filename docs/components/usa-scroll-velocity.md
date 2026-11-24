# `<mo-scroll-velocity>` — Scroll velocity

> Element name `<mo-scroll-velocity>` (default since 17.3); the legacy name `<usa-scroll-velocity>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Content that skews, stretches, blurs or tilts with how fast the page scrolls, then settles.

- **Category:** page · **since** 17.10
- **Import:** `import { defineScrollVelocity } from 'motionary/components/widgets'` then `defineScrollVelocity();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `mode`, `strength`, `max`
- **Events:** —
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/scroll-velocity.ts](../../src/components/widgets/scroll-velocity.ts)

## Minimal example

```html
<mo-scroll-velocity mode="skew"><h2>Scroll me</h2></mo-scroll-velocity>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineScrollVelocity } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineScrollVelocity(); // registers <mo-scroll-velocity>

/* then use it in your HTML:
<mo-scroll-velocity mode="skew"><h2>Scroll me</h2></mo-scroll-velocity>
*/
```
