# `<mo-shimmer-text>` — Shimmer text

> Element name `<mo-shimmer-text>` (default since 17.3); the legacy name `<usa-shimmer-text>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A light sweep across gradient-filled text. CSS only; colours and speed via attributes or custom properties.

- **Category:** text · **since** 2.2
- **Import:** `import { defineShimmerText } from 'motionary/components/text'` then `defineShimmerText();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
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
import { defineMoAliases } from 'motionary/components/mo';
import { defineShimmerText } from 'motionary/components/text';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineShimmerText(); // registers <mo-shimmer-text>

/* then use it in your HTML:
<mo-shimmer-text shine="#fff">Premium</mo-shimmer-text>
*/
```
