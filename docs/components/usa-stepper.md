# `<usa-stepper>` — Stepper / wizard

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

6.7: the rail fills toward the current step, finished steps pop a drawn check mark and the current step pulses. Horizontal or vertical; next() / prev() / value.

- **Category:** ui · **since** 6.7
- **Import:** `import { defineStepper } from 'motionary/components/widgets'` then `defineStepper();`
- **CDN:** `<script src="https://unpkg.com/motionary@10/dist/widgets.umd.js"></script>`
- **Attributes:** `orientation`
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
import { defineStepper } from 'motionary/components/widgets';

defineStepper(); // registers <usa-stepper>

/* then use it in your HTML:
<usa-stepper value="1" label="Checkout">
  <span>Cart</span>
  <span>Shipping</span>
  <span>Payment</span>
  <span>Done</span>
</usa-stepper>
*/
```
