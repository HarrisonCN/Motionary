# `<usa-lottie-icon>` — Animated icon set

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

9.2: an animated icon set shipped as tiny Lottie files — heart beat, bell swing, check draw-in, spinner, star twinkle, bolt zap — on click, hover, enter or loop.

- **Category:** ui · **since** 9.2
- **Import:** `import { defineLottieIcon } from 'motionary/components/widgets'` then `defineLottieIcon();`
- **CDN:** `<script src="https://unpkg.com/motionary@11/dist/widgets.umd.js"></script>`
- **Attributes:** `name`, `size`, `color`, `label`, `trigger`
- **Events:** —
- **Slots:** —
- **Methods:** `play()`
- **Source:** [src/components/widgets/lottie-icon.ts](../../src/components/widgets/lottie-icon.ts)

## Minimal example

```html
<usa-lottie-icon name="heart" trigger="click" size="32" label="Like"></usa-lottie-icon>
<usa-lottie-icon name="bell" trigger="hover"></usa-lottie-icon>
```

## ES module

```js
import { defineLottieIcon } from 'motionary/components/widgets';

defineLottieIcon(); // registers <usa-lottie-icon>

/* then use it in your HTML:
<usa-lottie-icon name="heart" trigger="click" size="32" label="Like"></usa-lottie-icon>
<usa-lottie-icon name="bell" trigger="hover"></usa-lottie-icon>
*/
```
