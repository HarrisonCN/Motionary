# `<usa-back-to-top>` — Back to top

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Appears after you scroll, shows reading progress as a ring and springs the page back up, then moves focus to the top.

- **Category:** page
- **Import:** `import { defineBackToTop } from 'motionary/components/page'` then `defineBackToTop();`
- **CDN:** `<script src="https://unpkg.com/motionary@11/dist/components.umd.js"></script>`
- **Attributes:** —
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
import { defineBackToTop } from 'motionary/components/page';

defineBackToTop(); // registers <usa-back-to-top>

/* then use it in your HTML:
<usa-back-to-top offset="400"></usa-back-to-top>
*/
```
