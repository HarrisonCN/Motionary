# `<usa-segmented>` — Segmented control

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

6.7: an iOS-style thumb slides under the chosen segment with a spring and stretches while it travels. A real radio group: arrow keys, Home / End. iOS, pill or outline.

- **Category:** ui · **since** 6.7 · **changed in** 13.1
- **Import:** `import { defineSegmented } from 'motionary/components/widgets'` then `defineSegmented();`
- **CDN:** `<script src="https://unpkg.com/motionary@13/dist/widgets.umd.js"></script>`
- **Attributes:** `variant`, `label`, `value`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/segmented.ts](../../src/components/widgets/segmented.ts)

## Minimal example

```html
<usa-segmented variant="ios" label="View">
  <button>Day</button>
  <button>Week</button>
  <button>Month</button>
</usa-segmented>
```

## ES module

```js
import { defineSegmented } from 'motionary/components/widgets';

defineSegmented(); // registers <usa-segmented>

/* then use it in your HTML:
<usa-segmented variant="ios" label="View">
  <button>Day</button>
  <button>Week</button>
  <button>Month</button>
</usa-segmented>
*/
```
