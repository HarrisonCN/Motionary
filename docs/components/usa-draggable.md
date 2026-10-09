# `<usa-draggable>` — Draggable

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Drag with mouse, touch, pen or arrow keys. spring-back returns home with a wobble; inertia glides after a flick; snap to a grid or points; rubber-band bounds.

- **Category:** physics
- **Import:** `import { defineDraggable } from 'motionary/components/physics'` then `defineDraggable();`
- **CDN:** `<script src="https://unpkg.com/motionary@11/dist/components.umd.js"></script>`
- **Attributes:** `axis`, `disabled`, `preset`
- **Events:** `usa:settle`, `usa:drag-start`, `usa:drag`, `usa:drag-end`
- **Slots:** —
- **Methods:** `moveTo()`, `reset()`
- **Source:** [src/components/physics/draggable.ts](../../src/components/physics/draggable.ts)

## Minimal example

```html
<usa-draggable spring-back>
  <div class="card">Drag me</div>
</usa-draggable>
<usa-draggable inertia snap="80" bounds="parent">…</usa-draggable>
```

## ES module

```js
import { defineDraggable } from 'motionary/components/physics';

defineDraggable(); // registers <usa-draggable>

/* then use it in your HTML:
<usa-draggable spring-back>
  <div class="card">Drag me</div>
</usa-draggable>
<usa-draggable inertia snap="80" bounds="parent">…</usa-draggable>
*/
```
