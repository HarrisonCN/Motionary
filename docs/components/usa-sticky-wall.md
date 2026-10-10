# `<usa-sticky-wall>` — Sticky-note wall

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

8.5: a wall of sticky notes — each child becomes a pinned paper note with a slight tilt, the notes drop onto the wall one by one, and a tap lifts a note to the front.

- **Category:** ui · **since** 8.5
- **Import:** `import { defineStickyWall } from 'motionary/components/widgets'` then `defineStickyWall();`
- **CDN:** `<script src="https://unpkg.com/motionary@13/dist/widgets.umd.js"></script>`
- **Attributes:** `seed`, `label`
- **Events:** `usa:pick`
- **Slots:** —
- **Methods:** `pick()`
- **Source:** [src/components/widgets/sticky-wall.ts](../../src/components/widgets/sticky-wall.ts)

## Minimal example

```html
<usa-sticky-wall label="Ideas">
  <p>Ship 8.5 ✏️</p>
  <p data-color="pink">Call Mia</p>
  <p data-color="blue">Buy paper</p>
</usa-sticky-wall>
```

## ES module

```js
import { defineStickyWall } from 'motionary/components/widgets';

defineStickyWall(); // registers <usa-sticky-wall>

/* then use it in your HTML:
<usa-sticky-wall label="Ideas">
  <p>Ship 8.5 ✏️</p>
  <p data-color="pink">Call Mia</p>
  <p data-color="blue">Buy paper</p>
</usa-sticky-wall>
*/
```
