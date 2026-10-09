# `<usa-scroll-ring>` — Scroll progress ring

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

10.4: a circular scroll-progress indicator for the page or any scroll container (for=".article"), optional percentage label and back-to-top button. Scroll-driven 3.0: native animation-timeline: scroll() first (no script per frame), a small JS loop where scroll timelines are missing.

- **Category:** reveal · **since** 10.4
- **Import:** `import { defineScrollRing } from 'motionary/components/widgets'` then `defineScrollRing();`
- **CDN:** `<script src="https://unpkg.com/motionary@11/dist/widgets.umd.js"></script>`
- **Attributes:** `for`, `engine`, `label`, `back-to-top`, `size`, `thickness`, `horizontal`, `preview`
- **Events:** `usa:progress`, `usa:top`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/scroll-ring.ts](../../src/components/widgets/scroll-ring.ts)

## Minimal example

```html
<usa-scroll-ring label back-to-top></usa-scroll-ring>
```

## ES module

```js
import { defineScrollRing } from 'motionary/components/widgets';

defineScrollRing(); // registers <usa-scroll-ring>

/* then use it in your HTML:
<usa-scroll-ring label back-to-top></usa-scroll-ring>
*/
```
