# `<usa-timeline>` — Timeline

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Every data-tl child becomes a step in document order. data-at ('-=200', '<', 'label+=100') overlaps or aligns steps; scrub ties progress to scroll; trigger view / click / manual.

- **Category:** timeline · **since** 3.1 · **changed in** 4.0, 4.1, 4.6, 4.9, 5.0, 6.5
- **Import:** `import { defineTimeline } from 'motionary/components/timeline'` then `defineTimeline();`
- **CDN:** `<script src="https://unpkg.com/motionary@13/dist/components.umd.js"></script>`
- **Attributes:** `scrub`, `trigger`, `overlap`, `duration`, `stagger`, `smooth`, `repeat`
- **Events:** `usa:complete`
- **Slots:** —
- **Methods:** `play()`, `reverse()`, `seek()`
- **Source:** [src/components/timeline/timeline-el.ts](../../src/components/timeline/timeline-el.ts)

## Minimal example

```html
<usa-timeline overlap="150">
  <h2 data-tl="fade-up">Title</h2>
  <p data-tl="blur">Subtitle</p>
  <button data-tl="scale" data-at="<+=100">CTA</button>
</usa-timeline>
```

## ES module

```js
import { defineTimeline } from 'motionary/components/timeline';

defineTimeline(); // registers <usa-timeline>

/* then use it in your HTML:
<usa-timeline overlap="150">
  <h2 data-tl="fade-up">Title</h2>
  <p data-tl="blur">Subtitle</p>
  <button data-tl="scale" data-at="<+=100">CTA</button>
</usa-timeline>
*/
```
