# `<mo-retro-grid>` — Retro grid

> Element name `<mo-retro-grid>` (default since 17.3); the legacy name `<usa-retro-grid>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A synthwave floor grid that rolls toward you, with an optional striped sun.

- **Category:** background · **since** 17.12
- **Import:** `import { defineRetroGrid } from 'motionary/components/widgets'` then `defineRetroGrid();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `angle`, `cell`, `color`, `speed`, `sun`
- **Events:** —
- **Slots:** —
- **Methods:** `mount()`, `defineMoName()`
- **Source:** [src/components/widgets/retro-grid.ts](../../src/components/widgets/retro-grid.ts)

## Minimal example

```html
<mo-retro-grid sun><h3>Back to 1986</h3></mo-retro-grid>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineRetroGrid } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineRetroGrid(); // registers <mo-retro-grid>

/* then use it in your HTML:
<mo-retro-grid sun><h3>Back to 1986</h3></mo-retro-grid>
*/
```
