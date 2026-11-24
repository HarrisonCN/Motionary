# `<mo-treemap>` — Treemap

> Element name `<mo-treemap>` (default since 17.3); the legacy name `<usa-treemap>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Squarified tiles sized by share scale in biggest first; tiles are buttons walked with arrow keys.

- **Category:** layout · **since** 17.13
- **Import:** `import { defineTreemap } from 'motionary/components/widgets'` then `defineTreemap();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `values`, `labels`, `colors`, `label`, `unit`, `ratio`
- **Events:** `usa:select`
- **Slots:** —
- **Methods:** `mount()`, `defineMoName()`
- **Source:** [src/components/widgets/treemap.ts](../../src/components/widgets/treemap.ts)

## Minimal example

```html
<mo-treemap values="40,25,15,10,6,4" labels="Web,iOS,Android,Desktop,TV,Watch"></mo-treemap>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineTreemap } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineTreemap(); // registers <mo-treemap>

/* then use it in your HTML:
<mo-treemap values="40,25,15,10,6,4" labels="Web,iOS,Android,Desktop,TV,Watch"></mo-treemap>
*/
```
