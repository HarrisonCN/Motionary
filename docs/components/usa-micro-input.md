# `<mo-micro-input>` — Micro input

> Element name `<mo-micro-input>` (default since 17.3); the legacy name `<usa-micro-input>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

The label floats on a spring, the focus line grows from where you clicked, and an invalid value shakes once with an announced message.

- **Category:** ui · **since** 17.16
- **Import:** `import { defineMicroInput } from 'motionary/components/widgets'` then `defineMicroInput();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `type`, `value`, `name`, `required`, `pattern`, `minlength`, `maxlength`, `autocomplete`, `hint`, `error`, `success`, `disabled`, `feel`, `haptics`
- **Events:** `usa:invalid`, `usa:valid`, `usa:input`
- **Slots:** —
- **Methods:** `validate()`
- **Source:** [src/components/widgets/micro-input.ts](../../src/components/widgets/micro-input.ts)

## Minimal example

```html
<mo-micro-input label="Email" type="email" required success hint="We never share it."></mo-micro-input>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineMicroInput } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineMicroInput(); // registers <mo-micro-input>

/* then use it in your HTML:
<mo-micro-input label="Email" type="email" required success hint="We never share it."></mo-micro-input>
*/
```
