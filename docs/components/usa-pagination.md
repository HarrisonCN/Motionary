# `<mo-pagination>` — Pagination with sliding ink

> Element name `<mo-pagination>` (default since 17.3); the legacy name `<usa-pagination>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

6.7: the highlight springs to the chosen page (squashing on the way) and page numbers slide in from the direction of travel when the window shifts. Prev / next, ellipses, aria-current.

- **Category:** ui · **since** 6.7 · **changed in** 13.3
- **Import:** `import { definePagination } from 'motionary/components/widgets'` then `definePagination();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `total`, `siblings`, `label`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/pagination.ts](../../src/components/widgets/pagination.ts)

## Minimal example

```html
<usa-pagination total="20" page="1" siblings="1"></usa-pagination>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { definePagination } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
definePagination(); // registers <mo-pagination>

/* then use it in your HTML:
<mo-pagination total="20" page="1" siblings="1"></mo-pagination>
*/
```
