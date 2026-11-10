# `<mo-checkbox>` — Animated checkbox

> Element name `<mo-checkbox>` (default since 17.3); the legacy name `<usa-checkbox>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Form-associated checkbox: the box springs and the check draws itself; indeterminate state, circle shape.

- **Category:** click · **since** 2.5
- **Import:** `import { defineCheckbox } from 'motionary/components/click'` then `defineCheckbox();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
- **Attributes:** `checked`, `indeterminate`, `disabled`, `label`, `value`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** `toggle()`
- **Source:** [src/components/click/checkbox.ts](../../src/components/click/checkbox.ts)

## Minimal example

```html
<usa-checkbox name="terms">I agree</usa-checkbox>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineCheckbox } from 'motionary/components/click';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineCheckbox(); // registers <mo-checkbox>

/* then use it in your HTML:
<mo-checkbox name="terms">I agree</mo-checkbox>
*/
```
