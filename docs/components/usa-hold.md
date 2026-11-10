# `<mo-hold>` — Hold to confirm

> Element name `<mo-hold>` (default since 17.3); the legacy name `<usa-hold>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Press and hold (pointer, Space or Enter) while a ring fills; releasing early rewinds. For destructive actions.

- **Category:** click · **since** 2.5
- **Import:** `import { defineHold } from 'motionary/components/click'` then `defineHold();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
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
import { defineMoAliases } from 'motionary/components/mo';
import { defineHold } from 'motionary/components/click';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineHold(); // registers <mo-hold>

/* then use it in your HTML:
<mo-hold duration="1200" label="Delete project">Hold to delete</mo-hold>
*/
```
