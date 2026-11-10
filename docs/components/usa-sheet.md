# `<mo-sheet>` — Drawer / bottom sheet

> Element name `<mo-sheet>` (default since 17.3); the legacy name `<usa-sheet>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

6.3: a side sheet from the right, left, top or bottom with a blurred backdrop; the bottom sheet can be dragged down to dismiss and springs back otherwise. Native <dialog> underneath.

- **Category:** transitions · **since** 6.3 · **changed in** 6.6, 13.0, 13.1, 13.3
- **Import:** `import { defineSheet } from 'motionary/components/widgets'` then `defineSheet();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
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
import { defineMoAliases } from 'motionary/components/mo';
import { defineSheet } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineSheet(); // registers <mo-sheet>

/* then use it in your HTML:
<button data-usa-open="cart">Cart</button>
<mo-sheet id="cart" side="right" label="Cart">
  <h2>Your cart</h2>
  …
  <button data-usa-close>Close</button>
</mo-sheet>
*/
```
