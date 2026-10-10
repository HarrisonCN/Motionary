# `<usa-add-to-cart>` — Add to cart (fly-to-cart)

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

7.3: a buy button — the product photo flies on an arc into the cart, the cart badge bumps and the button morphs into a ✓ “Added” state. Works with <usa-cart-drawer> (calls add(item)) or any [data-cart] icon.

- **Category:** ui · **since** 7.3
- **Import:** `import { defineAddToCart } from 'motionary/components/widgets'` then `defineAddToCart();`
- **CDN:** `<script src="https://unpkg.com/motionary@13/dist/widgets.umd.js"></script>`
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
import { defineAddToCart } from 'motionary/components/widgets';

defineAddToCart(); // registers <usa-add-to-cart>

/* then use it in your HTML:
<usa-cart-drawer id="cart"></usa-cart-drawer>
<div data-product>
  <img src="shoe.jpg" alt="Sneaker">
  <usa-add-to-cart cart="#cart" item='{"name":"Sneaker","price":89}'></usa-add-to-cart>
</div>
*/
```
