# `<mo-bar-race>` — Bar chart race

> Element name `<mo-bar-race>` (default since 17.3); the legacy name `<usa-bar-race>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Bars glide past each other frame by frame as the ranking changes; it plays in view and can be scrubbed.

- **Category:** layout · **since** 17.15
- **Import:** `import { defineBarRace } from 'motionary/components/widgets'` then `defineBarRace();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `labels`, `frames`, `values`, `colors`, `top`, `interval`, `unit`, `label`, `play-label`, `pause-label`, `frame-label`
- **Events:** `usa:frame`
- **Slots:** —
- **Methods:** `go()`
- **Source:** [src/components/widgets/bar-race.ts](../../src/components/widgets/bar-race.ts)

## Minimal example

```html
<mo-bar-race labels="Alpha,Beta,Gamma,Delta" frames="2023|2024|2025" values="10,14,8,6; 18,15,16,9; 22,17,26,15"></mo-bar-race>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineBarRace } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineBarRace(); // registers <mo-bar-race>

/* then use it in your HTML:
<mo-bar-race labels="Alpha,Beta,Gamma,Delta" frames="2023|2024|2025" values="10,14,8,6; 18,15,16,9; 22,17,26,15"></mo-bar-race>
*/
```
