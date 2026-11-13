# `<mo-form-stepper>` — Validated form steps

> Element name `<mo-form-stepper>` (default since 17.3); the legacy name `<usa-form-stepper>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Preserve original fields and FormData while validating steps and managing focus.

- **Category:** ui · **since** 17.7
- **Import:** `import { defineFormStepper } from 'motionary/components/widgets'` then `defineFormStepper();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `hint`, `step`, `disabled`, `back-label`, `next-label`, `complete-label`
- **Events:** `usa:step-change`, `usa:invalid`, `usa:complete`
- **Slots:** —
- **Methods:** `next()`, `back()`, `goTo()`, `reset()`, `refresh()`
- **Source:** [src/components/widgets/form-stepper.ts](../../src/components/widgets/form-stepper.ts)

## Minimal example

```html
<form><mo-form-stepper label="Your next project"><section data-form-step data-step-title="Project"><label>Project title<input name="title" required placeholder="Give your project a name"></label></section><section data-form-step data-step-title="Review"><label>Notes<textarea name="notes" rows="3"></textarea></label></section></mo-form-stepper></form>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineFormStepper } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineFormStepper(); // registers <mo-form-stepper>

/* then use it in your HTML:
<form><mo-form-stepper label="Your next project"><section data-form-step data-step-title="Project"><label>Project title<input name="title" required placeholder="Give your project a name"></label></section><section data-form-step data-step-title="Review"><label>Notes<textarea name="notes" rows="3"></textarea></label></section></mo-form-stepper></form>
*/
```
