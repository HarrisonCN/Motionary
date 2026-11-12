# `<mo-bezier-lab>` — Bezier laboratory

> Element name `<mo-bezier-lab>` (default since 17.3); the legacy name `<usa-bezier-lab>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Drag control handles or edit native ranges; replay CSS timing with x inversion.

- **Category:** timeline · **since** 17.6
- **Import:** `import { defineBezierLab } from 'motionary/components/widgets'` then `defineBezierLab();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `disabled`, `x1`, `y1`, `x2`, `y2`, `duration`
- **Events:** `usa:action`, `usa:change`
- **Slots:** —
- **Methods:** `update()`, `reset()`, `play()`, `pause()`
- **Source:** [src/components/widgets/bezier-lab.ts](../../src/components/widgets/bezier-lab.ts)

## Minimal example

```html
<mo-bezier-lab></mo-bezier-lab>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineBezierLab } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineBezierLab(); // registers <mo-bezier-lab>

/* then use it in your HTML:
<mo-bezier-lab></mo-bezier-lab>
*/
```
