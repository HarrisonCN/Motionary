# `<usa-hold>` — Hold to confirm

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Press and hold (pointer, Space or Enter) while a ring fills; releasing early rewinds. For destructive actions.

- **Category:** click
- **Import:** `import { defineHold } from 'motionary/components/click'` then `defineHold();`
- **CDN:** `<script src="https://unpkg.com/motionary@12/dist/components.umd.js"></script>`
- **Attributes:** `duration`, `disabled`, `color`, `label`
- **Events:** `usa:progress`, `usa:confirm`, `usa:cancel`
- **Slots:** —
- **Methods:** `cancel()`
- **Source:** [src/components/click/hold.ts](../../src/components/click/hold.ts)

## Minimal example

```html
<usa-hold duration="1200" label="Delete project">Hold to delete</usa-hold>
```

## ES module

```js
import { defineHold } from 'motionary/components/click';

defineHold(); // registers <usa-hold>

/* then use it in your HTML:
<usa-hold duration="1200" label="Delete project">Hold to delete</usa-hold>
*/
```
