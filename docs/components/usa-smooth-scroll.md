# `<usa-smooth-scroll>` — Smooth scroll

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

10.4: smooth, inertial wheel scrolling for the page or a container (wrapper), anchor links glide (with offset for sticky headers); keyboard / scrollbar / touch stay native and it switches off under reduced motion. Requires motionary/runtime/smooth — npm i motionary, then use(smooth) before it mounts.

- **Category:** interaction · **since** 10.4
- **Import:** `import { defineSmoothScroll } from 'motionary/components/widgets'` then `defineSmoothScroll();`
- **CDN:** `<script src="https://unpkg.com/motionary@10/dist/widgets.umd.js"></script>`
- **Attributes:** `lerp`, `duration`, `ease`, `wheel-multiplier`, `horizontal`, `touch`, `anchors`, `offset`, `wrapper`, `preview`
- **Events:** `usa:scroll`, `usa:ready`, `usa:runtime-missing`
- **Slots:** —
- **Methods:** `glideTo()`, `stop()`, `resume()`
- **Source:** [src/components/widgets/smooth-scroll.ts](../../src/components/widgets/smooth-scroll.ts)

## Prerequisites — Requires: motionary/runtime/smooth

1. **Install:** `npm i motionary`
2. **Import order & registration:** Register the core first, then the module: use(smooth) also registers the core. CDN: load runtime.iife.js, then runtime/smooth.iife.js (it registers itself).

```js
import { use } from 'motionary/runtime';
import { smooth } from 'motionary/runtime/smooth';
import { defineSmoothScroll } from 'motionary/components/widgets';

use(smooth);
defineSmoothScroll(); // registers <usa-smooth-scroll> — after the prerequisites
```

3. **CDN:**

```html
<script src="https://cdn.jsdelivr.net/npm/motionary@10/dist/runtime.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/motionary@10/dist/runtime/smooth.iife.js"></script>
<!-- then the component bundles -->
<script src="https://unpkg.com/motionary@10/dist/components.umd.js"></script>
<script src="https://unpkg.com/motionary@10/dist/widgets.umd.js"></script>
```

## Minimal example

```html
<usa-smooth-scroll lerp="0.1" offset="64"></usa-smooth-scroll>
```

## ES module

```js
import { use } from 'motionary/runtime';
import { smooth } from 'motionary/runtime/smooth';

use(smooth);
import { defineSmoothScroll } from 'motionary/components/widgets';

defineSmoothScroll(); // registers <usa-smooth-scroll>

/* then use it in your HTML:
<usa-smooth-scroll lerp="0.1" offset="64"></usa-smooth-scroll>
*/
```
