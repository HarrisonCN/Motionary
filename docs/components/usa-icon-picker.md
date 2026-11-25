# `<mo-icon-picker>` — Icon picker

> Element name `<mo-icon-picker>` (default since 17.3); the legacy name `<usa-icon-picker>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Search 753 line icons by name or category, filter with chips, walk the grid with arrow keys and pick one; it can copy the name, an <mo-icon> tag or the svg.

- **Category:** ui · **since** 17.14
- **Import:** `import { defineIconPicker } from 'motionary/components/widgets'` then `defineIconPicker();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `value`, `name`, `copy`, `categories`, `category-labels`, `size`, `height`, `compact`, `label`, `search-label`, `placeholder`, `all-label`, `empty`, `count-label`
- **Events:** `usa:pick`
- **Slots:** —
- **Methods:** `search()`
- **Source:** [src/components/widgets/icon-picker.ts](../../src/components/widgets/icon-picker.ts)

## Minimal example

```html
<mo-icon-picker value="heart" copy="tag" height="260"></mo-icon-picker>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineIconPicker } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineIconPicker(); // registers <mo-icon-picker>

/* then use it in your HTML:
<mo-icon-picker value="heart" copy="tag" height="260"></mo-icon-picker>
*/
```
