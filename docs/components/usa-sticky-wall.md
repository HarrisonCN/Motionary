# `<mo-sticky-wall>` — Sticky-note wall

> Element name `<mo-sticky-wall>` (default since 17.3); the legacy name `<usa-sticky-wall>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

8.5: a wall of sticky notes — each child becomes a pinned paper note with a slight tilt, the notes drop onto the wall one by one, and a tap lifts a note to the front.

- **Category:** ui · **since** 8.5
- **Import:** `import { defineStickyWall } from 'motionary/components/widgets'` then `defineStickyWall();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
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
import { defineMoAliases } from 'motionary/components/mo';
import { defineStickyWall } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineStickyWall(); // registers <mo-sticky-wall>

/* then use it in your HTML:
<mo-sticky-wall label="Ideas">
  <p>Ship 8.5 ✏️</p>
  <p data-color="pink">Call Mia</p>
  <p data-color="blue">Buy paper</p>
</mo-sticky-wall>
*/
```
