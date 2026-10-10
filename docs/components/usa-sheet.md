# `<usa-sheet>` — Drawer / bottom sheet

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

6.3: a side sheet from the right, left, top or bottom with a blurred backdrop; the bottom sheet can be dragged down to dismiss and springs back otherwise. Native <dialog> underneath.

- **Category:** transitions · **since** 6.3 · **changed in** 6.6, 13.0
- **Import:** `import { defineSheet } from 'motionary/components/widgets'` then `defineSheet();`
- **CDN:** `<script src="https://unpkg.com/motionary@13/dist/widgets.umd.js"></script>`
- **Attributes:** `side`, `label`, `persistent`
- **Events:** `usa:open`, `usa:close`
- **Slots:** —
- **Methods:** `show()`, `close()`, `toggle()`
- **Source:** [src/components/widgets/overlay.ts](../../src/components/widgets/overlay.ts)

## Minimal example

```html
<button data-usa-open="cart">Cart</button>
<usa-sheet id="cart" side="right" label="Cart">
  <h2>Your cart</h2>
  …
  <button data-usa-close>Close</button>
</usa-sheet>
```

## ES module

```js
import { defineSheet } from 'motionary/components/widgets';

defineSheet(); // registers <usa-sheet>

/* then use it in your HTML:
<button data-usa-open="cart">Cart</button>
<usa-sheet id="cart" side="right" label="Cart">
  <h2>Your cart</h2>
  …
  <button data-usa-close>Close</button>
</usa-sheet>
*/
```
