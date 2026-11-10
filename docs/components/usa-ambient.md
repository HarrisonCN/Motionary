# `<mo-ambient>` — Ambient layer

> Element name `<mo-ambient>` (default since 17.3); the legacy name `<usa-ambient>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A fixed page-wide layer: drifting particles, falling snow, twinkling stars, film grain or a gradient that shifts with scroll.

- **Category:** page · **since** 2.7
- **Import:** `import { defineAmbient } from 'motionary/components/page'` then `defineAmbient();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
- **Attributes:** `effect`, `density`, `color`, `opacity`, `speed`
- **Events:** —
- **Slots:** —
- **Methods:** `mount()`, `upd()`, `resize()`, `resize()`, `draw()`, `draw()`, `unmount()`, `caf()`
- **Source:** [src/components/page/ambient.ts](../../src/components/page/ambient.ts)

## Minimal example

```html
<usa-ambient effect="snow" density="1.2"></usa-ambient>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineAmbient } from 'motionary/components/page';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineAmbient(); // registers <mo-ambient>

/* then use it in your HTML:
<mo-ambient effect="snow" density="1.2"></mo-ambient>
*/
```
