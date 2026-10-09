# `<usa-cart-drawer>` — Cart drawer

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

7.3: a cart button with a count badge and a drawer that slides in from the side — lines slide in (or bump their quantity), removed lines collapse, the badge bumps and the total rolls. Esc / backdrop close; focus is managed.

- **Category:** ui · **since** 7.3
- **Import:** `import { defineCartDrawer } from 'motionary/components/widgets'` then `defineCartDrawer();`
- **CDN:** `<script src="https://unpkg.com/motionary@10/dist/widgets.umd.js"></script>`
- **Attributes:** —
- **Events:** `usa:open`, `usa:close`, `usa:change`
- **Slots:** —
- **Methods:** `add()`, `removeItem()`, `toggle()`
- **Source:** [src/components/widgets/cart-drawer.ts](../../src/components/widgets/cart-drawer.ts)

## Minimal example

```html
<usa-cart-drawer currency="$"></usa-cart-drawer>
<script>cart.add({ id: 'tee', name: 'T-shirt', price: 24 });</script>
```

## ES module

```js
import { defineCartDrawer } from 'motionary/components/widgets';

defineCartDrawer(); // registers <usa-cart-drawer>

/* then use it in your HTML:
<usa-cart-drawer currency="$"></usa-cart-drawer>
*/
```
