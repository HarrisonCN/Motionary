# `<mo-step-track>` — Step track

> Element name `<mo-step-track>` (default since 17.3); the legacy name `<usa-step-track>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A bead rolls along a line of steps with back and next buttons.

- **Category:** ui · **since** 17.9
- **Import:** `import { defineStepTrack } from 'motionary/components/widgets'` then `defineStepTrack();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `steps`, `value`, `label`, `disabled`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** `next()`, `prev()`
- **Source:** [src/components/widgets/step-track.ts](../../src/components/widgets/step-track.ts)

## Minimal example

```html
<mo-step-track steps="4" value="2"></mo-step-track>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineStepTrack } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineStepTrack(); // registers <mo-step-track>

/* then use it in your HTML:
<mo-step-track steps="4" value="2"></mo-step-track>
*/
```
