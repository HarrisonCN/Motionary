# `<mo-validation-summary>` — Validation summary

> Element name `<mo-validation-summary>` (default since 17.3); the legacy name `<usa-validation-summary>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Native validity messages become links to the actual fields; no values are emitted.

- **Category:** ui · **since** 17.7
- **Import:** `import { defineValidationSummary } from 'motionary/components/widgets'` then `defineValidationSummary();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `hint`, `target`
- **Events:** `usa:validate`
- **Slots:** —
- **Methods:** `validate()`, `clear()`, `changed()`, `mount()`
- **Source:** [src/components/widgets/validation-summary.ts](../../src/components/widgets/validation-summary.ts)

## Minimal example

```html
<form><label>Email <input id="form-craft-email" type="email" required></label><mo-validation-summary></mo-validation-summary><button type="submit">Check form</button></form>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineValidationSummary } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineValidationSummary(); // registers <mo-validation-summary>

/* then use it in your HTML:
<form><label>Email <input id="form-craft-email" type="email" required></label><mo-validation-summary></mo-validation-summary><button type="submit">Check form</button></form>
*/
```
