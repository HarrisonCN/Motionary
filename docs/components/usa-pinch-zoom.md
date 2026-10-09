# `<usa-pinch-zoom>` — Pinch zoom

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Pinch with two fingers or Ctrl + wheel / trackpad pinch, pan while zoomed, double-tap to toggle; scale and position spring back inside the bounds.

- **Category:** gesture
- **Import:** `import { definePinchZoom } from 'motionary/components/gesture'` then `definePinchZoom();`
- **CDN:** `<script src="https://unpkg.com/motionary@10/dist/components.umd.js"></script>`
- **Attributes:** —
- **Events:** `usa:zoom`
- **Slots:** —
- **Methods:** `zoomTo()`
- **Source:** [src/components/gesture/pinch-zoom.ts](../../src/components/gesture/pinch-zoom.ts)

## Minimal example

```html
<usa-pinch-zoom max="4">
  <img src="photo.jpg" alt="…">
</usa-pinch-zoom>
```

## ES module

```js
import { definePinchZoom } from 'motionary/components/gesture';

definePinchZoom(); // registers <usa-pinch-zoom>

/* then use it in your HTML:
<usa-pinch-zoom max="4">
  <img src="photo.jpg" alt="…">
</usa-pinch-zoom>
*/
```
