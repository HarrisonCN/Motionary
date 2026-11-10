# `<mo-odometer>` — Odometer counter

> Element name `<mo-odometer>` (default since 17.3); the legacy name `<usa-odometer>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

6.4: rolling digit wheels — every digit spins forward to its new value, new digits slide in, locale grouping via Intl.NumberFormat, decimals, prefix / suffix. The accessible name is the formatted number.

- **Category:** text · **since** 6.4
- **Import:** `import { defineOdometer } from 'motionary/components/widgets'` then `defineOdometer();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `value`, `locale`, `decimals`, `prefix`, `suffix`, `duration`
- **Events:** —
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/meters.ts](../../src/components/widgets/meters.ts)

## Minimal example

```html
<usa-odometer value="1284" locale="en-US" prefix="$"></usa-odometer>
<!-- el.value = 2048 rolls every digit -->
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineOdometer } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineOdometer(); // registers <mo-odometer>

/* then use it in your HTML:
<mo-odometer value="1284" locale="en-US" prefix="$"></mo-odometer>
<!-- el.value = 2048 rolls every digit -->
*/
```
