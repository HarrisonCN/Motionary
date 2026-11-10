# `<mo-pinch-zoom>` — Pinch zoom

> Element name `<mo-pinch-zoom>` (default since 17.3); the legacy name `<usa-pinch-zoom>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Pinch with two fingers or Ctrl + wheel / trackpad pinch, pan while zoomed, double-tap to toggle; scale and position spring back inside the bounds.

- **Category:** gesture · **since** 3.2
- **Import:** `import { definePinchZoom } from 'motionary/components/gesture'` then `definePinchZoom();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
- **Attributes:** `min`, `max`, `preset`, `double-tap`
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
import { defineMoAliases } from 'motionary/components/mo';
import { definePinchZoom } from 'motionary/components/gesture';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
definePinchZoom(); // registers <mo-pinch-zoom>

/* then use it in your HTML:
<mo-pinch-zoom max="4">
  <img src="photo.jpg" alt="…">
</mo-pinch-zoom>
*/
```
