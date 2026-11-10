# `<mo-back-to-top>` — Back to top

> Element name `<mo-back-to-top>` (default since 17.3); the legacy name `<usa-back-to-top>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Appears after you scroll, shows reading progress as a ring and springs the page back up, then moves focus to the top.

- **Category:** page · **since** 2.7 · **changed in** 13.1
- **Import:** `import { defineBackToTop } from 'motionary/components/page'` then `defineBackToTop();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
- **Attributes:** `label`, `offset`, `focus-target`
- **Events:** —
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/page/back-to-top.ts](../../src/components/page/back-to-top.ts)

## Minimal example

```html
<usa-back-to-top offset="400"></usa-back-to-top>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineBackToTop } from 'motionary/components/page';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineBackToTop(); // registers <mo-back-to-top>

/* then use it in your HTML:
<mo-back-to-top offset="400"></mo-back-to-top>
*/
```
