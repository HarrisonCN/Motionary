# `<usa-video-card>` — Video card

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

9.4: a video thumbnail card — hover or focus plays a muted preview with a progress line, a play badge and a duration chip; without a video the poster drifts (Ken Burns).

- **Category:** ui · **since** 9.4
- **Import:** `import { defineVideoCard } from 'motionary/components/widgets'` then `defineVideoCard();`
- **CDN:** `<script src="https://unpkg.com/motionary@12/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `duration`
- **Events:** `usa:open`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/video-card.ts](../../src/components/widgets/video-card.ts)

## Minimal example

```html
<usa-video-card duration="2:41">
  <img src="poster.jpg" alt="">
  <video src="preview.mp4" muted playsinline></video>
  <h3>Making of Motionary</h3>
</usa-video-card>
```

## ES module

```js
import { defineVideoCard } from 'motionary/components/widgets';

defineVideoCard(); // registers <usa-video-card>

/* then use it in your HTML:
<usa-video-card duration="2:41">
  <img src="poster.jpg" alt="">
  <video src="preview.mp4" muted playsinline></video>
  <h3>Making of Motionary</h3>
</usa-video-card>
*/
```
