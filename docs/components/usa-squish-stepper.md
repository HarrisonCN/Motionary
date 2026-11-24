# `<mo-squish-stepper>` — Squish stepper

> Element name `<mo-squish-stepper>` (default since 17.3); the legacy name `<usa-squish-stepper>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Squishy − / + keys around a rolling number; hold to repeat.

- **Category:** click · **since** 17.9
- **Import:** `import { defineSquishStepper } from 'motionary/components/widgets'` then `defineSquishStepper();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `value`, `min`, `max`, `step`, `label`, `disabled`
- **Events:** `usa:input`, `usa:change`
- **Slots:** —
- **Methods:** `stepUp()`, `stepDown()`
- **Source:** [src/components/widgets/squish-stepper.ts](../../src/components/widgets/squish-stepper.ts)

## Minimal example

```html
<mo-squish-stepper label="Players" value="2" min="1" max="8"></mo-squish-stepper>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineSquishStepper } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineSquishStepper(); // registers <mo-squish-stepper>

/* then use it in your HTML:
<mo-squish-stepper label="Players" value="2" min="1" max="8"></mo-squish-stepper>
*/
```
