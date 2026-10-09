# `<usa-progress>` — Progress bar

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Determinate bars glide between values; without a value it shows the Fluent indeterminate animation. Paused / error states.

- **Category:** feedback
- **Import:** `import { defineProgress } from 'motionary/components/feedback'` then `defineProgress();`
- **CDN:** `<script src="https://unpkg.com/motionary@11/dist/components.umd.js"></script>`
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
import { defineProgress } from 'motionary/components/feedback';

defineProgress(); // registers <usa-progress>

/* then use it in your HTML:
<usa-progress value="40"></usa-progress>
<usa-progress indeterminate></usa-progress>
*/
```
