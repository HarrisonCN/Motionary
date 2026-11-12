# `<mo-number-stepper>` — Number stepper

> Element name `<mo-number-stepper>` (default since 17.3); the legacy name `<usa-number-stepper>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Decimal steps, native numeric input, bounded buttons and form reset.

- **Category:** ui · **since** 17.7
- **Import:** `import { defineNumberStepper } from 'motionary/components/widgets'` then `defineNumberStepper();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `hint`, `value`, `min`, `max`, `step`, `name`, `disabled`, `required`
- **Events:** `usa:input`, `usa:change`
- **Slots:** —
- **Methods:** `stepUp()`, `stepDown()`, `reset()`, `changed()`, `mount()`, `formReset()`
- **Source:** [src/components/widgets/number-stepper.ts](../../src/components/widgets/number-stepper.ts)

## Minimal example

```html
<mo-number-stepper label="Print quantity" name="quantity" value="3" min="1" max="12"></mo-number-stepper>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineNumberStepper } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineNumberStepper(); // registers <mo-number-stepper>

/* then use it in your HTML:
<mo-number-stepper label="Print quantity" name="quantity" value="3" min="1" max="12"></mo-number-stepper>
*/
```
