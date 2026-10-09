# `<usa-stories>` — Stories viewer

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

6.2: segmented progress bars, auto-advance, tap left / right to step, press and hold to pause, plus a pause button. Under reduced motion it waits for the user instead of advancing.

- **Category:** ui · **since** 6.2
- **Import:** `import { defineStories } from 'motionary/components/widgets'` then `defineStories();`
- **CDN:** `<script src="https://unpkg.com/motionary@10/dist/widgets.umd.js"></script>`
- **Attributes:** `duration`, `loop`
- **Events:** `usa:end`, `usa:change`
- **Slots:** —
- **Methods:** `next()`, `prev()`, `goTo()`, `pause()`, `play()`
- **Source:** [src/components/widgets/stories.ts](../../src/components/widgets/stories.ts)

## Minimal example

```html
<usa-stories duration="5000" loop>
  <img src="1.jpg" alt="…">
  <img src="2.jpg" alt="…">
</usa-stories>
```

## ES module

```js
import { defineStories } from 'motionary/components/widgets';

defineStories(); // registers <usa-stories>

/* then use it in your HTML:
<usa-stories duration="5000" loop>
  <img src="1.jpg" alt="…">
  <img src="2.jpg" alt="…">
</usa-stories>
*/
```
