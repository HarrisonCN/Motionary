# `<usa-lottie>` — Lottie player

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

9.2: plays Lottie (After Effects / bodymovin) files without lottie-web — vector layers render as SVG and their keyframes run as native animations on Motionary’s clock.

- **Category:** ui · **since** 9.2
- **Import:** `import { defineLottie } from 'motionary/components/widgets'` then `defineLottie();`
- **CDN:** `<script src="https://unpkg.com/motionary@13/dist/widgets.umd.js"></script>`
- **Attributes:** `src`, `loop`, `speed`, `label`
- **Events:** `usa:error`, `usa:load`, `usa:complete`
- **Slots:** —
- **Methods:** `play()`, `pause()`, `stop()`
- **Source:** [src/components/widgets/lottie.ts](../../src/components/widgets/lottie.ts)

## Minimal example

```html
<usa-lottie src="confetti.json" autoplay loop label="Celebration"></usa-lottie>
```

## ES module

```js
import { defineLottie } from 'motionary/components/widgets';

defineLottie(); // registers <usa-lottie>

/* then use it in your HTML:
<usa-lottie src="confetti.json" autoplay loop label="Celebration"></usa-lottie>
*/
```
