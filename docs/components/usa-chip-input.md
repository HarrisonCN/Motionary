# `<mo-chip-input>` — Chip input

> Element name `<mo-chip-input>` (default since 17.3); the legacy name `<usa-chip-input>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Type and press Enter or comma to make a chip that pops in; Backspace removes the last.

- **Category:** ui · **since** 17.9
- **Import:** `import { defineChipInput } from 'motionary/components/widgets'` then `defineChipInput();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `value`, `label`, `placeholder`, `max`, `name`, `disabled`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/chip-input.ts](../../src/components/widgets/chip-input.ts)

## Minimal example

```html
<mo-chip-input label="Tags" value="motion, ui"></mo-chip-input>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineChipInput } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineChipInput(); // registers <mo-chip-input>

/* then use it in your HTML:
<mo-chip-input label="Tags" value="motion, ui"></mo-chip-input>
*/
```
