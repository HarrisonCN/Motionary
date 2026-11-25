# `<mo-micro-stepper>` — Micro stepper

> Element name `<mo-micro-stepper>` (default since 17.3); the legacy name `<usa-micro-stepper>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Digits roll on a spring, held buttons speed up, and at a limit the number leans against it and springs back.

- **Category:** ui · **since** 17.16
- **Import:** `import { defineMicroStepper } from 'motionary/components/widgets'` then `defineMicroStepper();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `min`, `max`, `step`, `value`, `label`, `name`, `disabled`, `feel`, `haptics`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/micro-stepper.ts](../../src/components/widgets/micro-stepper.ts)

## Minimal example

```html
<mo-micro-stepper label="Guests" value="2" min="1" max="12"></mo-micro-stepper>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineMicroStepper } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineMicroStepper(); // registers <mo-micro-stepper>

/* then use it in your HTML:
<mo-micro-stepper label="Guests" value="2" min="1" max="12"></mo-micro-stepper>
*/
```
