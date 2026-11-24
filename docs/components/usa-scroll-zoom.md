# `<mo-scroll-zoom>` — Scroll zoom

> Element name `<mo-scroll-zoom>` (default since 17.3); the legacy name `<usa-scroll-zoom>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A rounded media card grows to fill the screen as you scroll, then a caption rises.

- **Category:** page · **since** 17.11
- **Import:** `import { defineScrollZoom } from 'motionary/components/widgets'` then `defineScrollZoom();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `from`, `radius`, `length`, `min-width`, `label`
- **Events:** `usa:progress`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/scroll-zoom.ts](../../src/components/widgets/scroll-zoom.ts)

## Minimal example

```html
<mo-scroll-zoom><img src="assets/demo-photo.jpg" alt="Coast"><h2>Full bleed</h2></mo-scroll-zoom>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineScrollZoom } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineScrollZoom(); // registers <mo-scroll-zoom>

/* then use it in your HTML:
<mo-scroll-zoom><img src="assets/demo-photo.jpg" alt="Coast"><h2>Full bleed</h2></mo-scroll-zoom>
*/
```
