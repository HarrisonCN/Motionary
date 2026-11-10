# `<mo-check>` — Result icon

> Element name `<mo-check>` (default since 17.3); the legacy name `<usa-check>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

The circle draws itself, then a check, cross or exclamation strokes in with a pop. Great after a payment or upload.

- **Category:** feedback · **since** 2.2 · **changed in** 2.9, 3.0
- **Import:** `import { defineCheck } from 'motionary/components/feedback'` then `defineCheck();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
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
import { defineMoAliases } from 'motionary/components/mo';
import { defineCheck } from 'motionary/components/feedback';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineCheck(); // registers <mo-check>

/* then use it in your HTML:
<mo-check kind="success" label="Payment complete"></mo-check>
*/
```
