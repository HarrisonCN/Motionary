# `<mo-ripple-grid>` — Ripple grid

> Element name `<mo-ripple-grid>` (default since 17.3); the legacy name `<usa-ripple-grid>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A dot grid where a click sends a ring of light outward; can ripple on its own.

- **Category:** background · **since** 17.12
- **Import:** `import { defineRippleGrid } from 'motionary/components/widgets'` then `defineRippleGrid();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `gap`, `dot`, `color`, `accent`, `auto`, `label`
- **Events:** `usa:ripple`
- **Slots:** —
- **Methods:** `ripple()`
- **Source:** [src/components/widgets/ripple-grid.ts](../../src/components/widgets/ripple-grid.ts)

## Minimal example

```html
<mo-ripple-grid auto="4000"><h3>Tap anywhere</h3></mo-ripple-grid>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineRippleGrid } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineRippleGrid(); // registers <mo-ripple-grid>

/* then use it in your HTML:
<mo-ripple-grid auto="4000"><h3>Tap anywhere</h3></mo-ripple-grid>
*/
```
