# `<usa-tilt>` — 3D tilt card

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Tilts toward the pointer in 3D with an optional glare; exposes --usa-tilt-x/y for parallax layers inside.

- **Category:** interaction
- **Import:** `import { defineTilt } from 'motionary/components/interaction'` then `defineTilt();`
- **CDN:** `<script src="https://unpkg.com/motionary@11/dist/components.umd.js"></script>`
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
import { defineTilt } from 'motionary/components/interaction';

defineTilt(); // registers <usa-tilt>

/* then use it in your HTML:
<usa-tilt glare max="12">
  <div class="card">…</div>
</usa-tilt>
*/
```
