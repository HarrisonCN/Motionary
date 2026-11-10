# `<mo-lottie-icon>` — Animated icon set

> Element name `<mo-lottie-icon>` (default since 17.3); the legacy name `<usa-lottie-icon>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

9.2: an animated icon set shipped as tiny Lottie files — heart beat, bell swing, check draw-in, spinner, star twinkle, bolt zap — on click, hover, enter or loop.

- **Category:** ui · **since** 9.2 · **changed in** 11.8
- **Import:** `import { defineLottieIcon } from 'motionary/components/widgets'` then `defineLottieIcon();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
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
import { defineMoAliases } from 'motionary/components/mo';
import { defineLottieIcon } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineLottieIcon(); // registers <mo-lottie-icon>

/* then use it in your HTML:
<mo-lottie-icon name="heart" trigger="click" size="32" label="Like"></mo-lottie-icon>
<mo-lottie-icon name="bell" trigger="hover"></mo-lottie-icon>
*/
```
