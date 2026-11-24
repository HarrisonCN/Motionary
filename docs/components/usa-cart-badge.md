# `<mo-cart-badge>` — Cart badge

> Element name `<mo-cart-badge>` (default since 17.3); the legacy name `<usa-cart-badge>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Adding pops the count badge and shakes the bag; the count is read out politely.

- **Category:** ui · **since** 17.9
- **Import:** `import { defineCartBadge } from 'motionary/components/widgets'` then `defineCartBadge();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `count`, `max`, `label`, `add-label`, `disabled`
- **Events:** `usa:add`, `usa:open`
- **Slots:** —
- **Methods:** `add()`
- **Source:** [src/components/widgets/cart-badge.ts](../../src/components/widgets/cart-badge.ts)

## Minimal example

```html
<mo-cart-badge count="2"></mo-cart-badge>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineCartBadge } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineCartBadge(); // registers <mo-cart-badge>

/* then use it in your HTML:
<mo-cart-badge count="2"></mo-cart-badge>
*/
```
