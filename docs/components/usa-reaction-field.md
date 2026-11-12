# `<mo-reaction-field>` — Reaction field

> Element name `<mo-reaction-field>` (default since 17.3); the legacy name `<usa-reaction-field>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Real Gray–Scott chemistry, with dot and contour rendering and shape masks.

- **Category:** physics · **since** 17.6
- **Import:** `import { defineReactionField } from 'motionary/components/widgets'` then `defineReactionField();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `disabled`, `animated`, `paused`, `color`, `accent`, `seed`, `feed`, `kill`, `mode`, `shape`
- **Events:** `usa:action`, `usa:change`
- **Slots:** —
- **Methods:** `update()`, `reset()`, `play()`, `pause()`, `activate()`, `deactivate()`
- **Source:** [src/components/widgets/reaction-field.ts](../../src/components/widgets/reaction-field.ts)

## Minimal example

```html
<mo-reaction-field animated></mo-reaction-field>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineReactionField } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineReactionField(); // registers <mo-reaction-field>

/* then use it in your HTML:
<mo-reaction-field animated></mo-reaction-field>
*/
```
