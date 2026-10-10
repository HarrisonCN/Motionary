# `<usa-text-rotate>` — Rotating words

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Cycles words in place — the box keeps the width of the longest word, so nothing around it reflows.

- **Category:** text · **since** 2.2
- **Import:** `import { defineTextRotate } from 'motionary/components/text'` then `defineTextRotate();`
- **CDN:** `<script src="https://unpkg.com/motionary@12/dist/components.umd.js"></script>`
- **Attributes:** `words`, `interval`, `paused`, `effect`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** `next()`
- **Source:** [src/components/text/text-rotate.ts](../../src/components/text/text-rotate.ts)

## Minimal example

```html
Build <usa-text-rotate words="fast|tiny|typed"></usa-text-rotate> apps
```

## ES module

```js
import { defineTextRotate } from 'motionary/components/text';

defineTextRotate(); // registers <usa-text-rotate>

/* then use it in your HTML:
Build <usa-text-rotate words="fast|tiny|typed"></usa-text-rotate> apps
*/
```
