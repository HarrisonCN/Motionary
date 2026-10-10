# `<usa-dotlottie>` — Interactive dotLottie (themes + state machine)

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

10.9: plays .lottie files with their themes (slots recoloured by a theme from the file) and state machines — playback states, event / numeric / boolean guards, pointer and completion interactions, input and theme actions (OpenUrl is refused). Tap the dot: it starts pulsing, three taps switch it to the dark theme. Requires motionary/runtime/vector + motionary/runtime/lottie-state — npm i motionary, then use(vector, lottieState). Its own entry point: motionary/components/dotlottie.

- **Category:** ui · **since** 10.9
- **Import:** `import { defineDotLottie } from 'motionary/components/dotlottie'` then `defineDotLottie();`
- **CDN:** `<script src="https://unpkg.com/motionary@13/dist/components.umd.js"></script>`
- **Attributes:** `theme`, `state-machine`
- **Events:** `usa:error`, `usa:state`, `usa:custom`, `usa:runtime-missing`
- **Slots:** —
- **Methods:** `fire()`, `setInput()`, `setTheme()`
- **Source:** [src/components/widgets/dotlottie.ts](../../src/components/widgets/dotlottie.ts)

## Prerequisites — Requires: motionary/runtime/vector + motionary/runtime/lottie-state

1. **Install:** `npm i motionary`
2. **Import order & registration:** Register the core first, then the module: use(vector) also registers the core. CDN: load runtime.iife.js, then runtime/vector.iife.js (it registers itself). Register the core first, then the module: use(lottieState) also registers the core. CDN: load runtime.iife.js, then runtime/lottie-state.iife.js (it registers itself).

```js
import { use } from 'motionary/runtime';
import { vector } from 'motionary/runtime/vector';
import { lottieState } from 'motionary/runtime/lottie-state';
import { defineDotLottie } from 'motionary/components/dotlottie';

use(vector, lottieState);
defineDotLottie(); // registers <usa-dotlottie> — after the prerequisites
```

3. **CDN:**

```html
<script src="https://cdn.jsdelivr.net/npm/motionary@13/dist/runtime.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/motionary@13/dist/runtime/vector.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/motionary@13/dist/runtime/lottie-state.iife.js"></script>
<!-- then the component bundles -->
<script src="https://unpkg.com/motionary@13/dist/components.umd.js"></script>
<script src="https://unpkg.com/motionary@13/dist/widgets.umd.js"></script>
```

## Minimal example

```html
<usa-dotlottie src="/anim/button.lottie" state-machine="toggle" theme="dark" label="Like button"></usa-dotlottie>
```

## ES module

```js
import { use } from 'motionary/runtime';
import { vector } from 'motionary/runtime/vector';
import { lottieState } from 'motionary/runtime/lottie-state';

use(vector, lottieState);
import { defineDotLottie } from 'motionary/components/dotlottie';

defineDotLottie(); // registers <usa-dotlottie>

/* then use it in your HTML:
<usa-dotlottie src="/anim/button.lottie" state-machine="toggle" theme="dark" label="Like button"></usa-dotlottie>
*/
```
