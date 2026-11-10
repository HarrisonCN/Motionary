# `<mo-stepper>` — Stepper / wizard

> Element name `<mo-stepper>` (default since 17.3); the legacy name `<usa-stepper>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

6.7: the rail fills toward the current step, finished steps pop a drawn check mark and the current step pulses. Horizontal or vertical; next() / prev() / value.

- **Category:** ui · **since** 6.7 · **changed in** 13.1
- **Import:** `import { defineStepper } from 'motionary/components/widgets'` then `defineStepper();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `orientation`, `label`, `clickable`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** `next()`, `prev()`
- **Source:** [src/components/widgets/stepper.ts](../../src/components/widgets/stepper.ts)

## Minimal example

```html
<usa-stepper value="1" label="Checkout">
  <span>Cart</span>
  <span>Shipping</span>
  <span>Payment</span>
  <span>Done</span>
</usa-stepper>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineStepper } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineStepper(); // registers <mo-stepper>

/* then use it in your HTML:
<mo-stepper value="1" label="Checkout">
  <span>Cart</span>
  <span>Shipping</span>
  <span>Payment</span>
  <span>Done</span>
</mo-stepper>
*/
```
