# `<mo-scrub-number>` — Scrub number

> Element name `<mo-scrub-number>` (default since 17.3); the legacy name `<usa-scrub-number>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Editable bounded numbers, horizontal drag, precision mode and keyboard stepping.

- **Category:** ui · **since** 17.6
- **Import:** `import { defineScrubNumber } from 'motionary/components/widgets'` then `defineScrubNumber();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `value`, `min`, `max`, `step`, `unit`, `disabled`
- **Events:** `usa:input`, `usa:change`
- **Slots:** —
- **Methods:** `stepUp()`, `stepDown()`, `reset()`, `update()`
- **Source:** [src/components/widgets/scrub-number.ts](../../src/components/widgets/scrub-number.ts)

## Minimal example

```html
<mo-scrub-number label="Stiffness" value="180" min="1" max="800" unit="N/m"></mo-scrub-number>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineScrubNumber } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineScrubNumber(); // registers <mo-scrub-number>

/* then use it in your HTML:
<mo-scrub-number label="Stiffness" value="180" min="1" max="800" unit="N/m"></mo-scrub-number>
*/
```
