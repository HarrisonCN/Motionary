# `<mo-micro-checkbox>` — Micro checkbox

> Element name `<mo-micro-checkbox>` (default since 17.3); the legacy name `<usa-micro-checkbox>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

The box squashes under the finger, fills with a springy pop and then draws its tick; supports indeterminate.

- **Category:** ui · **since** 17.16
- **Import:** `import { defineMicroCheckbox } from 'motionary/components/widgets'` then `defineMicroCheckbox();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `checked`, `indeterminate`, `disabled`, `label`, `name`, `value`, `feel`, `haptics`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/micro-checkbox.ts](../../src/components/widgets/micro-checkbox.ts)

## Minimal example

```html
<mo-micro-checkbox label="Remember me" checked></mo-micro-checkbox>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineMicroCheckbox } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineMicroCheckbox(); // registers <mo-micro-checkbox>

/* then use it in your HTML:
<mo-micro-checkbox label="Remember me" checked></mo-micro-checkbox>
*/
```
