# `<usa-checkbox>` — Animated checkbox

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Form-associated checkbox: the box springs and the check draws itself; indeterminate state, circle shape.

- **Category:** click
- **Import:** `import { defineCheckbox } from 'motionary/components/click'` then `defineCheckbox();`
- **CDN:** `<script src="https://unpkg.com/motionary@11/dist/components.umd.js"></script>`
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
import { defineCheckbox } from 'motionary/components/click';

defineCheckbox(); // registers <usa-checkbox>

/* then use it in your HTML:
<usa-checkbox name="terms">I agree</usa-checkbox>
*/
```
