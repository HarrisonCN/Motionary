# `<mo-acrylic>` — Acrylic & Mica

> Element name `<mo-acrylic>` (default since 17.3); the legacy name `<usa-acrylic>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Windows Fluent materials: frosted acrylic (backdrop blur + tint + noise) and mica. Solid fallback when transparency is reduced.

- **Category:** background · **since** 2.2 · **changed in** 2.9, 3.0
- **Import:** `import { defineAcrylic } from 'motionary/components/background'` then `defineAcrylic();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
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
import { defineMoAliases } from 'motionary/components/mo';
import { defineAcrylic } from 'motionary/components/background';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineAcrylic(); // registers <mo-acrylic>

/* then use it in your HTML:
<mo-acrylic shimmer="hover">
  <nav>…</nav>
</mo-acrylic>
<mo-acrylic kind="mica">…</mo-acrylic>
*/
```
