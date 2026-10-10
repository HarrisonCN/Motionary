# `<usa-lottie-player>` — Lottie player (JSON + dotLottie)

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

10.6: plays Lottie JSON and dotLottie (.lottie) files with Motionary’s own Canvas 2D renderer — shapes, gradients, trim paths, masks, track mattes, precomps and images; autoplay, loop, bounce, segments / markers, play on hover or scrub with scroll. Requires motionary/runtime/vector — npm i motionary, then use(vector) before it mounts.

- **Category:** ui · **since** 10.6 · **changed in** 10.9
- **Import:** `import { defineLottiePlayer } from 'motionary/components/widgets'` then `defineLottiePlayer();`
- **CDN:** `<script src="https://unpkg.com/motionary@12/dist/widgets.umd.js"></script>`
- **Attributes:** `src`, `animation`, `autoplay`, `loop`, `speed`, `mode`, `segment`, `hover`, `scrub`, `fit`, `background`, `label`
- **Events:** `usa:complete`, `usa:load`, `usa:error`, `usa:runtime-missing`
- **Slots:** —
- **Methods:** `play()`, `pause()`, `stop()`, `seek()`
- **Source:** [src/components/widgets/lottie-player.ts](../../src/components/widgets/lottie-player.ts)

## Prerequisites — Requires: motionary/runtime/vector

1. **Install:** `npm i motionary`
2. **Import order & registration:** Register the core first, then the module: use(vector) also registers the core. CDN: load runtime.iife.js, then runtime/vector.iife.js (it registers itself).

```js
import { use } from 'motionary/runtime';
import { vector } from 'motionary/runtime/vector';
import { defineLottiePlayer } from 'motionary/components/widgets';

use(vector);
defineLottiePlayer(); // registers <usa-lottie-player> — after the prerequisites
```

3. **CDN:**

```html
<script src="https://cdn.jsdelivr.net/npm/motionary@12/dist/runtime.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/motionary@12/dist/runtime/vector.iife.js"></script>
<!-- then the component bundles -->
<script src="https://unpkg.com/motionary@12/dist/components.umd.js"></script>
<script src="https://unpkg.com/motionary@12/dist/widgets.umd.js"></script>
```

## Minimal example

```html
<usa-lottie-player src="/anim/hero.lottie" autoplay loop label="Hero animation"></usa-lottie-player>
```

## ES module

```js
import { use } from 'motionary/runtime';
import { vector } from 'motionary/runtime/vector';

use(vector);
import { defineLottiePlayer } from 'motionary/components/widgets';

defineLottiePlayer(); // registers <usa-lottie-player>

/* then use it in your HTML:
<usa-lottie-player src="/anim/hero.lottie" autoplay loop label="Hero animation"></usa-lottie-player>
*/
```

## Variants

### Lottie player (JSON + dotLottie)

10.6: plays Lottie JSON and dotLottie (.lottie) files with Motionary’s own Canvas 2D renderer — shapes, gradients, trim paths, masks, track mattes, precomps and images; autoplay, loop, bounce, segments / markers, play on hover or scrub with scroll. Requires motionary/runtime/vector — npm i motionary, then use(vector) before it mounts.

```html
<usa-lottie-player src="/anim/hero.lottie" autoplay loop label="Hero animation"></usa-lottie-player>
```

### Lottie text + expressions

10.8: the Lottie player now draws text layers (fonts by family and style, justification, tracking, line height, fill and stroke, wrapping box text, source-text keyframes) and runs an expression subset — time, value, wiggle, loopOut / loopIn, linear / ease, Math — with its own interpreter (no eval, CSP-safe). Requires motionary/runtime/vector — npm i motionary, then use(vector).

```html
<usa-lottie-player src="/anim/title.json" autoplay loop label="Animated title"></usa-lottie-player>
```
