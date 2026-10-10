# `<usa-gesture-sticker>` — Multi-touch sticker

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

8.7: a multi-touch sticker — drag with one finger, pinch with two to scale and twist to rotate, all at once, with a lifted shadow while held (wheel / Shift + wheel and keyboard on desktop).

- **Category:** ui · **since** 8.7
- **Import:** `import { defineGestureSticker } from 'motionary/components/widgets'` then `defineGestureSticker();`
- **CDN:** `<script src="https://unpkg.com/motionary@13/dist/widgets.umd.js"></script>`
- **Attributes:** `min`, `max`, `label`
- **Events:** `usa:transform`
- **Slots:** —
- **Methods:** `transformTo()`, `reset()`
- **Source:** [src/components/widgets/gesture-sticker.ts](../../src/components/widgets/gesture-sticker.ts)

## Minimal example

```html
<usa-gesture-sticker label="Star sticker" max="3">
  <img src="star.png" alt="Star" width="120">
</usa-gesture-sticker>
```

## ES module

```js
import { defineGestureSticker } from 'motionary/components/widgets';

defineGestureSticker(); // registers <usa-gesture-sticker>

/* then use it in your HTML:
<usa-gesture-sticker label="Star sticker" max="3">
  <img src="star.png" alt="Star" width="120">
</usa-gesture-sticker>
*/
```
