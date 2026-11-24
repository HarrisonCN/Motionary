# `<mo-sortable-list>` — Sortable list

> Element name `<mo-sortable-list>` (default since 17.3); the legacy name `<usa-sortable-list>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Drag a grip to reorder and the others glide aside; Space, arrows and Escape do the same by keyboard.

- **Category:** gesture · **since** 17.12
- **Import:** `import { defineSortableList } from 'motionary/components/widgets'` then `defineSortableList();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `grab-label`, `picked`, `moved`, `dropped`
- **Events:** `usa:sort`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/sortable-list.ts](../../src/components/widgets/sortable-list.ts)

## Minimal example

```html
<mo-sortable-list><ul><li>Design</li><li>Build</li><li>Ship</li></ul></mo-sortable-list>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineSortableList } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineSortableList(); // registers <mo-sortable-list>

/* then use it in your HTML:
<mo-sortable-list><ul><li>Design</li><li>Build</li><li>Ship</li></ul></mo-sortable-list>
*/
```
