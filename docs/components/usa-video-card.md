# `<mo-video-card>` — Video card

> Element name `<mo-video-card>` (default since 17.3); the legacy name `<usa-video-card>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

9.4: a video thumbnail card — hover or focus plays a muted preview with a progress line, a play badge and a duration chip; without a video the poster drifts (Ken Burns).

- **Category:** ui · **since** 9.4
- **Import:** `import { defineVideoCard } from 'motionary/components/widgets'` then `defineVideoCard();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
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
import { defineMoAliases } from 'motionary/components/mo';
import { defineVideoCard } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineVideoCard(); // registers <mo-video-card>

/* then use it in your HTML:
<mo-video-card duration="2:41">
  <img src="poster.jpg" alt="">
  <video src="preview.mp4" muted playsinline></video>
  <h3>Making of Motionary</h3>
</mo-video-card>
*/
```
