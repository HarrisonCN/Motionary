# `<mo-tilt>` — 3D tilt card

> Element name `<mo-tilt>` (default since 17.3); the legacy name `<usa-tilt>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Tilts toward the pointer in 3D with an optional glare; exposes --usa-tilt-x/y for parallax layers inside.

- **Category:** interaction · **since** 2.2 · **changed in** 12.3
- **Import:** `import { defineTilt } from 'motionary/components/interaction'` then `defineTilt();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
- **Attributes:** `max`, `scale`, `perspective`, `glare`, `reverse`, `disabled`
- **Events:** —
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/interaction/tilt.ts](../../src/components/interaction/tilt.ts)

## Minimal example

```html
<usa-tilt glare max="12">
  <div class="card">…</div>
</usa-tilt>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineTilt } from 'motionary/components/interaction';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineTilt(); // registers <mo-tilt>

/* then use it in your HTML:
<mo-tilt glare max="12">
  <div class="card">…</div>
</mo-tilt>
*/
```
