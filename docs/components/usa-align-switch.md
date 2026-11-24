# `<mo-align-switch>` — Align switch

> Element name `<mo-align-switch>` (default since 17.3); the legacy name `<usa-align-switch>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Three-way text alignment switch whose preview lines slide to the new side.

- **Category:** ui · **since** 17.9
- **Import:** `import { defineAlignSwitch } from 'motionary/components/widgets'` then `defineAlignSwitch();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `value`, `label`, `disabled`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/align-switch.ts](../../src/components/widgets/align-switch.ts)

## Minimal example

```html
<mo-align-switch value="center"></mo-align-switch>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineAlignSwitch } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineAlignSwitch(); // registers <mo-align-switch>

/* then use it in your HTML:
<mo-align-switch value="center"></mo-align-switch>
*/
```
