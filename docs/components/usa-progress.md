# `<mo-progress>` — Progress bar

> Element name `<mo-progress>` (default since 17.3); the legacy name `<usa-progress>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Determinate bars glide between values; without a value it shows the Fluent indeterminate animation. Paused / error states.

- **Category:** feedback · **since** 2.2 · **changed in** 2.6, 6.4
- **Import:** `import { defineProgress } from 'motionary/components/feedback'` then `defineProgress();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
- **Attributes:** `value`, `max`, `indeterminate`, `label`
- **Events:** `usa:complete`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/feedback/progress.ts](../../src/components/feedback/progress.ts)

## Minimal example

```html
<usa-progress value="40"></usa-progress>
<usa-progress indeterminate></usa-progress>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineProgress } from 'motionary/components/feedback';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineProgress(); // registers <mo-progress>

/* then use it in your HTML:
<mo-progress value="40"></mo-progress>
<mo-progress indeterminate></mo-progress>
*/
```
