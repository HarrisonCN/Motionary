# `<usa-snap-carousel>` — Snap carousel (drag · inertia · snap)

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

10.8: drag or swipe with real inertia — a throw keeps gliding, then springs to the nearest slide (a quick flick always moves one); rubber-band edges, arrows, dots, ←/→ / Home / End, optional autoplay that pauses on hover, focus and off screen. Slides keep their own width so the next one peeks in. Requires motionary/runtime/drag-snap — npm i motionary, then use(dragSnap) before it mounts. Its own entry point: motionary/components/snap-carousel (not in the widgets / lite bundles).

- **Category:** ui · **since** 10.8
- **Import:** `import { defineSnapCarousel } from 'motionary/components/snap-carousel'` then `defineSnapCarousel();`
- **CDN:** `<script src="https://unpkg.com/motionary@13/dist/components.umd.js"></script>`
- **Attributes:** `align`, `gap`, `autoplay`, `no-controls`, `no-dots`, `label`, `index`
- **Events:** `usa:change`, `usa:runtime-missing`
- **Slots:** —
- **Methods:** `next()`, `prev()`, `goTo()`
- **Source:** [src/components/widgets/snap-carousel.ts](../../src/components/widgets/snap-carousel.ts)

## Prerequisites — Requires: motionary/runtime/drag-snap

1. **Install:** `npm i motionary`
2. **Import order & registration:** Register the core first, then the module: use(dragSnap) also registers the core. CDN: load runtime.iife.js, then runtime/drag-snap.iife.js (it registers itself).

```js
import { use } from 'motionary/runtime';
import { dragSnap } from 'motionary/runtime/drag-snap';
import { defineSnapCarousel } from 'motionary/components/snap-carousel';

use(dragSnap);
defineSnapCarousel(); // registers <usa-snap-carousel> — after the prerequisites
```

3. **CDN:**

```html
<script src="https://cdn.jsdelivr.net/npm/motionary@13/dist/runtime.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/motionary@13/dist/runtime/drag-snap.iife.js"></script>
<!-- then the component bundles -->
<script src="https://unpkg.com/motionary@13/dist/components.umd.js"></script>
<script src="https://unpkg.com/motionary@13/dist/widgets.umd.js"></script>
```

## Minimal example

```html
<usa-snap-carousel align="center" gap="16" label="Featured">
  <article>…</article>
  <article>…</article>
  <article>…</article>
</usa-snap-carousel>
```

## ES module

```js
import { use } from 'motionary/runtime';
import { dragSnap } from 'motionary/runtime/drag-snap';

use(dragSnap);
import { defineSnapCarousel } from 'motionary/components/snap-carousel';

defineSnapCarousel(); // registers <usa-snap-carousel>

/* then use it in your HTML:
<usa-snap-carousel align="center" gap="16" label="Featured">
  <article>…</article>
  <article>…</article>
  <article>…</article>
</usa-snap-carousel>
*/
```
