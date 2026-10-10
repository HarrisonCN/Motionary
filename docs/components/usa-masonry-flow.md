# `<usa-masonry-flow>` — Masonry with layout animation

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

6.5: a masonry grid whose items glide to their new places (FLIP) on resize, insert / remove, filter(), shuffle() and sort(); hidden items scale out, new ones scale in.

- **Category:** layout · **since** 6.5
- **Import:** `import { defineMasonryFlow } from 'motionary/components/widgets'` then `defineMasonryFlow();`
- **CDN:** `<script src="https://unpkg.com/motionary@12/dist/widgets.umd.js"></script>`
- **Attributes:** `min`, `gap`
- **Events:** `usa:layout`
- **Slots:** —
- **Methods:** `layout()`, `filter()`, `shuffle()`, `sort()`
- **Source:** [src/components/widgets/masonry-flow.ts](../../src/components/widgets/masonry-flow.ts)

## Minimal example

```html
<usa-masonry-flow min="160" gap="12">
  <img src="1.jpg" alt="…">
  <img src="2.jpg" alt="…">
  …
</usa-masonry-flow>
<!-- grid.filter('.cats'), grid.shuffle(), grid.sort((a, b) => …) -->
```

## ES module

```js
import { defineMasonryFlow } from 'motionary/components/widgets';

defineMasonryFlow(); // registers <usa-masonry-flow>

/* then use it in your HTML:
<usa-masonry-flow min="160" gap="12">
  <img src="1.jpg" alt="…">
  <img src="2.jpg" alt="…">
  …
</usa-masonry-flow>
<!-- grid.filter('.cats'), grid.shuffle(), grid.sort((a, b) => …) -->
*/
```
