# `<usa-ambient>` — Ambient layer

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A fixed page-wide layer: drifting particles, falling snow, twinkling stars, film grain or a gradient that shifts with scroll.

- **Category:** page
- **Import:** `import { defineAmbient } from 'motionary/components/page'` then `defineAmbient();`
- **CDN:** `<script src="https://unpkg.com/motionary@12/dist/components.umd.js"></script>`
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
import { defineAmbient } from 'motionary/components/page';

defineAmbient(); // registers <usa-ambient>

/* then use it in your HTML:
<usa-ambient effect="snow" density="1.2"></usa-ambient>
*/
```
