# `<usa-shimmer-text>` — Shimmer text

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A light sweep across gradient-filled text. CSS only; colours and speed via attributes or custom properties.

- **Category:** text
- **Import:** `import { defineShimmerText } from 'motionary/components/text'` then `defineShimmerText();`
- **CDN:** `<script src="https://unpkg.com/motionary@12/dist/components.umd.js"></script>`
- **Attributes:** `duration`, `color`, `shine`, `angle`
- **Events:** —
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/text/shimmer-text.ts](../../src/components/text/shimmer-text.ts)

## Minimal example

```html
<usa-shimmer-text shine="#fff">Premium</usa-shimmer-text>
```

## ES module

```js
import { defineShimmerText } from 'motionary/components/text';

defineShimmerText(); // registers <usa-shimmer-text>

/* then use it in your HTML:
<usa-shimmer-text shine="#fff">Premium</usa-shimmer-text>
*/
```
