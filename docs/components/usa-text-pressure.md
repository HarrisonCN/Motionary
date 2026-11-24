# `<mo-text-pressure>` — Text pressure

> Element name `<mo-text-pressure>` (default since 17.3); the legacy name `<usa-text-pressure>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Letters swell heavier and taller as the pointer comes near, so a bulge follows it along the word.

- **Category:** text · **since** 17.13
- **Import:** `import { defineTextPressure } from 'motionary/components/widgets'` then `defineTextPressure();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `radius`, `min-weight`, `max-weight`, `stretch`
- **Events:** —
- **Slots:** —
- **Methods:** `mount()`, `defineMoName()`
- **Source:** [src/components/widgets/text-pressure.ts](../../src/components/widgets/text-pressure.ts)

## Minimal example

```html
<mo-text-pressure>PRESSURE</mo-text-pressure>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineTextPressure } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineTextPressure(); // registers <mo-text-pressure>

/* then use it in your HTML:
<mo-text-pressure>PRESSURE</mo-text-pressure>
*/
```
