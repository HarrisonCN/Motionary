# `<usa-pagination>` — Pagination with sliding ink

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

6.7: the highlight springs to the chosen page (squashing on the way) and page numbers slide in from the direction of travel when the window shifts. Prev / next, ellipses, aria-current.

- **Category:** ui · **since** 6.7
- **Import:** `import { definePagination } from 'motionary/components/widgets'` then `definePagination();`
- **CDN:** `<script src="https://unpkg.com/motionary@10/dist/widgets.umd.js"></script>`
- **Attributes:** `total`, `siblings`
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
import { definePagination } from 'motionary/components/widgets';

definePagination(); // registers <usa-pagination>

/* then use it in your HTML:
<usa-pagination total="20" page="1" siblings="1"></usa-pagination>
*/
```
