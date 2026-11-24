# `<mo-data-table>` — Sortable data table

> Element name `<mo-data-table>` (default since 17.3); the legacy name `<usa-data-table>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Enhances a real table: header buttons sort, a box filters, and rows glide to their new places.

- **Category:** layout · **since** 17.10
- **Import:** `import { defineDataTable } from 'motionary/components/widgets'` then `defineDataTable();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `filterable`, `filter-label`, `placeholder`, `sort-column`, `sort-direction`
- **Events:** `usa:sort`, `usa:filter`
- **Slots:** —
- **Methods:** `sort()`, `filter()`
- **Source:** [src/components/widgets/data-table.ts](../../src/components/widgets/data-table.ts)

## Minimal example

```html
<mo-data-table filterable><table><thead><tr><th>Name</th><th>Size</th></tr></thead><tbody><tr><td>core</td><td>12.4</td></tr><tr><td>widgets</td><td>3.1</td></tr><tr><td>fx</td><td>8.8</td></tr></tbody></table></mo-data-table>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineDataTable } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineDataTable(); // registers <mo-data-table>

/* then use it in your HTML:
<mo-data-table filterable><table><thead><tr><th>Name</th><th>Size</th></tr></thead><tbody><tr><td>core</td><td>12.4</td></tr><tr><td>widgets</td><td>3.1</td></tr><tr><td>fx</td><td>8.8</td></tr></tbody></table></mo-data-table>
*/
```
