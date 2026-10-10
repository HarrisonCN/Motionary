# `<usa-acrylic>` — Acrylic & Mica

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Windows Fluent materials: frosted acrylic (backdrop blur + tint + noise) and mica. Solid fallback when transparency is reduced.

- **Category:** background
- **Import:** `import { defineAcrylic } from 'motionary/components/background'` then `defineAcrylic();`
- **CDN:** `<script src="https://unpkg.com/motionary@12/dist/components.umd.js"></script>`
- **Attributes:** `tint`, `tint-opacity`, `blur`, `shimmer`
- **Events:** —
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/background/acrylic.ts](../../src/components/background/acrylic.ts)

## Minimal example

```html
<usa-acrylic shimmer="hover">
  <nav>…</nav>
</usa-acrylic>
<usa-acrylic kind="mica">…</usa-acrylic>
```

## ES module

```js
import { defineAcrylic } from 'motionary/components/background';

defineAcrylic(); // registers <usa-acrylic>

/* then use it in your HTML:
<usa-acrylic shimmer="hover">
  <nav>…</nav>
</usa-acrylic>
<usa-acrylic kind="mica">…</usa-acrylic>
*/
```
