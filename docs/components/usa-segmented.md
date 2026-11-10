# `<mo-segmented>` — Segmented control

> Element name `<mo-segmented>` (default since 17.3); the legacy name `<usa-segmented>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

6.7: an iOS-style thumb slides under the chosen segment with a spring and stretches while it travels. A real radio group: arrow keys, Home / End. iOS, pill or outline.

- **Category:** ui · **since** 6.7 · **changed in** 13.1
- **Import:** `import { defineSegmented } from 'motionary/components/widgets'` then `defineSegmented();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
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
import { defineMoAliases } from 'motionary/components/mo';
import { defineSegmented } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineSegmented(); // registers <mo-segmented>

/* then use it in your HTML:
<mo-segmented variant="ios" label="View">
  <button>Day</button>
  <button>Week</button>
  <button>Month</button>
</mo-segmented>
*/
```
