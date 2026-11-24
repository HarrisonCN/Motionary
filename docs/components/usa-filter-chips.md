# `<mo-filter-chips>` — Filter chips

> Element name `<mo-filter-chips>` (default since 17.3); the legacy name `<usa-filter-chips>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Toggle chips that filter a list by data-tags; leaving items fade and the rest close the gaps.

- **Category:** layout · **since** 17.10
- **Import:** `import { defineFilterChips } from 'motionary/components/widgets'` then `defineFilterChips();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `options`, `value`, `target`, `multiple`, `match`, `label`, `all-label`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/filter-chips.ts](../../src/components/widgets/filter-chips.ts)

## Minimal example

```html
<mo-filter-chips options="UI, Motion" multiple></mo-filter-chips><ul><li data-tags="UI">Sidebar</li><li data-tags="Motion">Path motion</li></ul>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineFilterChips } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineFilterChips(); // registers <mo-filter-chips>

/* then use it in your HTML:
<mo-filter-chips options="UI, Motion" multiple></mo-filter-chips><ul><li data-tags="UI">Sidebar</li><li data-tags="Motion">Path motion</li></ul>
*/
```
