# `<usa-scene>` — Cinematic scene

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

9.1: a scroll-scrubbed cinematic shot — while the scene crosses the screen its image follows a camera move (dolly, pan, tilt, zoom, orbit) and captions fade in on cue.

- **Category:** ui · **since** 9.1
- **Import:** `import { defineScene } from 'motionary/components/widgets'` then `defineScene();`
- **CDN:** `<script src="https://unpkg.com/motionary@10/dist/widgets.umd.js"></script>`
- **Attributes:** `camera`, `strength`, `autoplay`
- **Events:** `usa:shot`
- **Slots:** —
- **Methods:** `setProgress()`
- **Source:** [src/components/widgets/scene.ts](../../src/components/widgets/scene.ts)

## Minimal example

```html
<usa-scene camera="dolly-in">
  <img src="harbor.jpg" alt="Harbor at dawn">
  <p data-caption data-at="0.4">Dawn, 1912.</p>
</usa-scene>
```

## ES module

```js
import { defineScene } from 'motionary/components/widgets';

defineScene(); // registers <usa-scene>

/* then use it in your HTML:
<usa-scene camera="dolly-in">
  <img src="harbor.jpg" alt="Harbor at dawn">
  <p data-caption data-at="0.4">Dawn, 1912.</p>
</usa-scene>
*/
```
