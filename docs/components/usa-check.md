# `<usa-check>` — Result icon

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

The circle draws itself, then a check, cross or exclamation strokes in with a pop. Great after a payment or upload.

- **Category:** feedback · **since** 2.2 · **changed in** 2.9, 3.0
- **Import:** `import { defineCheck } from 'motionary/components/feedback'` then `defineCheck();`
- **CDN:** `<script src="https://unpkg.com/motionary@12/dist/components.umd.js"></script>`
- **Attributes:** `kind`, `size`, `label`, `start`
- **Events:** `usa:complete`
- **Slots:** —
- **Methods:** `play()`, `reset()`
- **Source:** [src/components/feedback/check.ts](../../src/components/feedback/check.ts)

## Minimal example

```html
<usa-check kind="success" label="Payment complete"></usa-check>
```

## ES module

```js
import { defineCheck } from 'motionary/components/feedback';

defineCheck(); // registers <usa-check>

/* then use it in your HTML:
<usa-check kind="success" label="Payment complete"></usa-check>
*/
```
