# `<mo-strength-meter>` — Strength meter

> Element name `<mo-strength-meter>` (default since 17.3); the legacy name `<usa-strength-meter>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A password field whose four segments fill and change colour with strength.

- **Category:** ui · **since** 17.9
- **Import:** `import { defineStrengthMeter } from 'motionary/components/widgets'` then `defineStrengthMeter();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `name`, `placeholder`, `disabled`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/strength-meter.ts](../../src/components/widgets/strength-meter.ts)

## Minimal example

```html
<mo-strength-meter label="Password"></mo-strength-meter>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineStrengthMeter } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineStrengthMeter(); // registers <mo-strength-meter>

/* then use it in your HTML:
<mo-strength-meter label="Password"></mo-strength-meter>
*/
```
