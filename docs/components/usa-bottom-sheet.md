# `<usa-bottom-sheet>` — Bottom sheet

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A draggable sheet with snap points, inertia and drag-down-to-dismiss — the iOS / Android pattern for web and Windows web-view apps.

- **Category:** ui
- **Import:** `import { defineBottomSheet } from 'motionary/components/ui'` then `defineBottomSheet();`
- **CDN:** `<script src="https://unpkg.com/motionary@10/dist/components.umd.js"></script>`
- **Attributes:** `open`, `snap`
- **Events:** —
- **Slots:** —
- **Methods:** `show()`, `close()`
- **Source:** [src/components/ui/sheet.ts](../../src/components/ui/sheet.ts)

## Minimal example

```html
<usa-bottom-sheet snap="0.4,0.9" label="Filters">…</usa-bottom-sheet>
```

## ES module

```js
import { defineBottomSheet } from 'motionary/components/ui';

defineBottomSheet(); // registers <usa-bottom-sheet>

/* then use it in your HTML:
<usa-bottom-sheet snap="0.4,0.9" label="Filters">…</usa-bottom-sheet>
*/
```
