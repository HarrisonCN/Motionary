# `<mo-shuffle-grid>` — Shuffle grid

> Element name `<mo-shuffle-grid>` (default since 17.3); the legacy name `<usa-shuffle-grid>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Tiles trade places every few seconds and glide to their new spots; reading order never changes.

- **Category:** layout · **since** 17.13
- **Import:** `import { defineShuffleGrid } from 'motionary/components/widgets'` then `defineShuffleGrid();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `interval`, `columns`, `gap`, `pause-label`, `play-label`
- **Events:** `usa:shuffle`
- **Slots:** —
- **Methods:** `shuffle()`
- **Source:** [src/components/widgets/shuffle-grid.ts](../../src/components/widgets/shuffle-grid.ts)

## Minimal example

```html
<mo-shuffle-grid columns="4"><span>A</span><span>B</span><span>C</span><span>D</span><span>E</span><span>F</span><span>G</span><span>H</span></mo-shuffle-grid>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineShuffleGrid } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineShuffleGrid(); // registers <mo-shuffle-grid>

/* then use it in your HTML:
<mo-shuffle-grid columns="4"><span>A</span><span>B</span><span>C</span><span>D</span><span>E</span><span>F</span><span>G</span><span>H</span></mo-shuffle-grid>
*/
```
