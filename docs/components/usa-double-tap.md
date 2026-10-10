# `<usa-double-tap>` — Double tap

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Double tap or double click a photo to pop a heart (or any emoji) at the tap point. L for keyboard users.

- **Category:** click · **since** 2.5
- **Import:** `import { defineDoubleTap } from 'motionary/components/click'` then `defineDoubleTap();`
- **CDN:** `<script src="https://unpkg.com/motionary@12/dist/components.umd.js"></script>`
- **Attributes:** `disabled`, `delay`, `icon`, `color`
- **Events:** `usa:double-tap`
- **Slots:** —
- **Methods:** `pop()`
- **Source:** [src/components/click/double-tap.ts](../../src/components/click/double-tap.ts)

## Minimal example

```html
<usa-double-tap>
  <img src="photo.jpg" alt="…">
</usa-double-tap>
```

## ES module

```js
import { defineDoubleTap } from 'motionary/components/click';

defineDoubleTap(); // registers <usa-double-tap>

/* then use it in your HTML:
<usa-double-tap>
  <img src="photo.jpg" alt="…">
</usa-double-tap>
*/
```
