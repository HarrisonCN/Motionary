# `<mo-add-to-cart>` — Add to cart (fly-to-cart)

> Element name `<mo-add-to-cart>` (default since 17.3); the legacy name `<usa-add-to-cart>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

7.3: a buy button — the product photo flies on an arc into the cart, the cart badge bumps and the button morphs into a ✓ “Added” state. Works with <usa-cart-drawer> (calls add(item)) or any [data-cart] icon.

- **Category:** ui · **since** 7.3 · **changed in** 13.1
- **Import:** `import { defineAddToCart } from 'motionary/components/widgets'` then `defineAddToCart();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `added`, `item`, `cart`, `from`, `hold`
- **Events:** `usa:add`
- **Slots:** —
- **Methods:** `add()`
- **Source:** [src/components/widgets/add-to-cart.ts](../../src/components/widgets/add-to-cart.ts)

## Minimal example

```html
<usa-cart-drawer id="cart"></usa-cart-drawer>
<div data-product>
  <img src="shoe.jpg" alt="Sneaker">
  <usa-add-to-cart cart="#cart" item='{"name":"Sneaker","price":89}'></usa-add-to-cart>
</div>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineAddToCart } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineAddToCart(); // registers <mo-add-to-cart>

/* then use it in your HTML:
<mo-cart-drawer id="cart"></mo-cart-drawer>
<div data-product>
  <img src="shoe.jpg" alt="Sneaker">
  <mo-add-to-cart cart="#cart" item='{"name":"Sneaker","price":89}'></mo-add-to-cart>
</div>
*/
```
