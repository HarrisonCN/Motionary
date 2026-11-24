# `<mo-plan-picker>` — Plan picker

> Element name `<mo-plan-picker>` (default since 17.3); the legacy name `<usa-plan-picker>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A frame springs from card to card as you pick a plan; a native radio group.

- **Category:** ui · **since** 17.9
- **Import:** `import { definePlanPicker } from 'motionary/components/widgets'` then `definePlanPicker();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `plans`, `value`, `label`, `name`, `disabled`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/plan-picker.ts](../../src/components/widgets/plan-picker.ts)

## Minimal example

```html
<mo-plan-picker plans="Basic|Free, Pro|$12, Team|$29" value="Pro"></mo-plan-picker>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { definePlanPicker } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
definePlanPicker(); // registers <mo-plan-picker>

/* then use it in your HTML:
<mo-plan-picker plans="Basic|Free, Pro|$12, Team|$29" value="Pro"></mo-plan-picker>
*/
```
