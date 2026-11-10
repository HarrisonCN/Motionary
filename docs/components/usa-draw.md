# `<mo-draw>` — Line drawing

> Element name `<mo-draw>` (default since 17.3); the legacy name `<usa-draw>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Every stroke of the SVG inside draws itself — on view, hover, click or scrubbed with scroll — staggered between shapes, optional fill afterwards. No getTotalLength() needed.

- **Category:** svg · **since** 3.3 · **changed in** 11.8
- **Import:** `import { defineDraw } from 'motionary/components/svg'` then `defineDraw();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
- **Attributes:** `duration`, `stagger`, `trigger`, `repeat`
- **Events:** `usa:complete`
- **Slots:** —
- **Methods:** `play()`
- **Source:** [src/components/svg/draw.ts](../../src/components/svg/draw.ts)

## Minimal example

```html
<usa-draw duration="1800" stagger="0.3" fill>
  <svg viewBox="0 0 100 40">…</svg>
</usa-draw>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineDraw } from 'motionary/components/svg';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineDraw(); // registers <mo-draw>

/* then use it in your HTML:
<mo-draw duration="1800" stagger="0.3" fill>
  <svg viewBox="0 0 100 40">…</svg>
</mo-draw>
*/
```
