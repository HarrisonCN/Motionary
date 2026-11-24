# `<mo-squish-stepper>` — <usa-squish-stepper>

> Element name `<mo-squish-stepper>` (default since 17.3); the legacy name `<usa-squish-stepper>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A pair of squishy − / + keys around a number that rolls as it changes. Hold a key to repeat. Both keys are native buttons; ArrowUp / ArrowDown on either key step too, and the value is announced through a polite live region.

- **Category:** widgets
- **Import:** `import { defineSquishStepper } from 'motionary/components/widgets'` then `defineSquishStepper();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `value`, `min`, `max`, `step`, `label`, `disabled`
- **Events:** `usa:input`, `usa:change`
- **Slots:** —
- **Methods:** `stepUp()`, `stepDown()`
- **Source:** [src/components/widgets/squish-stepper.ts](../../src/components/widgets/squish-stepper.ts)

## Minimal example

```html
<usa-squish-stepper></usa-squish-stepper>
```
