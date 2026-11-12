# `<mo-ink-flow>` — Ink flow

> Element name `<mo-ink-flow>` (default since 17.3); the legacy name `<usa-ink-flow>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Two colors of particles advect through a pointer-stirred flow field.

- **Category:** physics · **since** 17.6
- **Import:** `import { defineInkFlow } from 'motionary/components/widgets'` then `defineInkFlow();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `disabled`, `animated`, `paused`, `color`, `accent`, `seed`, `count`, `strength`
- **Events:** `usa:action`, `usa:change`
- **Slots:** —
- **Methods:** `update()`, `reset()`, `play()`, `pause()`, `activate()`, `deactivate()`
- **Source:** [src/components/widgets/ink-flow.ts](../../src/components/widgets/ink-flow.ts)

## Minimal example

```html
<mo-ink-flow animated></mo-ink-flow>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineInkFlow } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineInkFlow(); // registers <mo-ink-flow>

/* then use it in your HTML:
<mo-ink-flow animated></mo-ink-flow>
*/
```
