# `<usa-scroll-scene>` — Scroll scene

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

10.2: a scroll-linked scene — children with data-scrub="opacity: 0 -> 1; x: -80 -> 0" are tweened as you scroll, scrubbed directly or smoothed (scrub="120"), with optional pin, markers and stagger. Requires motionary/runtime/scroll — npm i motionary, then use(scroll) before the scene mounts.

- **Category:** reveal · **since** 10.2
- **Import:** `import { defineScrollScene } from 'motionary/components/widgets'` then `defineScrollScene();`
- **CDN:** `<script src="https://unpkg.com/motionary@13/dist/widgets.umd.js"></script>`
- **Attributes:** `start`, `end`, `scrub`, `pin`, `markers`, `stagger`, `toggle-class`, `preview`
- **Events:** `usa:enter`, `usa:leave`, `usa:progress`, `usa:runtime-missing`
- **Slots:** —
- **Methods:** `refresh()`, `timeline()`
- **Source:** [src/components/widgets/scroll-scene.ts](../../src/components/widgets/scroll-scene.ts)

## Prerequisites — Requires: motionary/runtime/scroll

1. **Install:** `npm i motionary`
2. **Import order & registration:** Register the core first, then the module: use(scroll) also registers the core. CDN: load runtime.iife.js, then runtime/scroll.iife.js (it registers itself).

```js
import { use } from 'motionary/runtime';
import { scroll } from 'motionary/runtime/scroll';
import { defineScrollScene } from 'motionary/components/widgets';

use(scroll);
defineScrollScene(); // registers <usa-scroll-scene> — after the prerequisites
```

3. **CDN:**

```html
<script src="https://cdn.jsdelivr.net/npm/motionary@13/dist/runtime.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/motionary@13/dist/runtime/scroll.iife.js"></script>
<!-- then the component bundles -->
<script src="https://unpkg.com/motionary@13/dist/components.umd.js"></script>
<script src="https://unpkg.com/motionary@13/dist/widgets.umd.js"></script>
```

## Minimal example

```html
<usa-scroll-scene start="top 80%" end="bottom 20%" scrub="120" stagger="120">
  <h2 data-scrub="x: -80 -> 0; opacity: 0 -> 1">Scroll</h2>
  <p data-scrub="y: 40 -> 0; opacity: 0 -> 1">and it follows.</p>
</usa-scroll-scene>
```

## ES module

```js
import { use } from 'motionary/runtime';
import { scroll } from 'motionary/runtime/scroll';

use(scroll);
import { defineScrollScene } from 'motionary/components/widgets';

defineScrollScene(); // registers <usa-scroll-scene>

/* then use it in your HTML:
<usa-scroll-scene start="top 80%" end="bottom 20%" scrub="120" stagger="120">
  <h2 data-scrub="x: -80 -> 0; opacity: 0 -> 1">Scroll</h2>
  <p data-scrub="y: 40 -> 0; opacity: 0 -> 1">and it follows.</p>
</usa-scroll-scene>
*/
```
