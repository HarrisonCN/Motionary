# `<usa-draw>` — Line drawing

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Every stroke of the SVG inside draws itself — on view, hover, click or scrubbed with scroll — staggered between shapes, optional fill afterwards. No getTotalLength() needed.

- **Category:** svg · **since** 3.3 · **changed in** 11.8
- **Import:** `import { defineDraw } from 'motionary/components/svg'` then `defineDraw();`
- **CDN:** `<script src="https://unpkg.com/motionary@12/dist/components.umd.js"></script>`
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
import { defineDraw } from 'motionary/components/svg';

defineDraw(); // registers <usa-draw>

/* then use it in your HTML:
<usa-draw duration="1800" stagger="0.3" fill>
  <svg viewBox="0 0 100 40">…</svg>
</usa-draw>
*/
```
