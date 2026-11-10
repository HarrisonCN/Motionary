# `<mo-draggable>` — Draggable

> Element name `<mo-draggable>` (default since 17.3); the legacy name `<usa-draggable>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Drag with mouse, touch, pen or arrow keys. spring-back returns home with a wobble; inertia glides after a flick; snap to a grid or points; rubber-band bounds.

- **Category:** physics · **since** 2.3 · **changed in** 6.8
- **Import:** `import { defineDraggable } from 'motionary/components/physics'` then `defineDraggable();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
- **Attributes:** `axis`, `disabled`, `preset`, `bounds`, `spring-back`, `inertia`, `snap`, `step`
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
import { defineMoAliases } from 'motionary/components/mo';
import { defineDraggable } from 'motionary/components/physics';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineDraggable(); // registers <mo-draggable>

/* then use it in your HTML:
<mo-draggable spring-back>
  <div class="card">Drag me</div>
</mo-draggable>
<mo-draggable inertia snap="80" bounds="parent">…</mo-draggable>
*/
```
