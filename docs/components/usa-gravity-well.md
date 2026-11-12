# `<mo-gravity-well>` — Gravity well

> Element name `<mo-gravity-well>` (default since 17.3); the legacy name `<usa-gravity-well>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Seeded orbital dust, a pointer attractor and a press-to-collapse gesture.

- **Category:** physics · **since** 17.6
- **Import:** `import { defineGravityWell } from 'motionary/components/widgets'` then `defineGravityWell();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `disabled`, `animated`, `paused`, `color`, `accent`, `seed`, `count`, `strength`
- **Events:** `usa:action`, `usa:change`
- **Slots:** —
- **Methods:** `update()`, `reset()`, `play()`, `pause()`, `activate()`, `deactivate()`
- **Source:** [src/components/widgets/gravity-well.ts](../../src/components/widgets/gravity-well.ts)

## Minimal example

```html
<mo-gravity-well animated></mo-gravity-well>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineGravityWell } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineGravityWell(); // registers <mo-gravity-well>

/* then use it in your HTML:
<mo-gravity-well animated></mo-gravity-well>
*/
```
