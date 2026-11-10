# `<mo-bottom-sheet>` — Bottom sheet

> Element name `<mo-bottom-sheet>` (default since 17.3); the legacy name `<usa-bottom-sheet>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A draggable sheet with snap points, inertia and drag-down-to-dismiss — the iOS / Android pattern for web and Windows web-view apps.

- **Category:** ui · **since** 2.6 · **changed in** 13.1, 13.3
- **Import:** `import { defineBottomSheet } from 'motionary/components/ui'` then `defineBottomSheet();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
- **Attributes:** `open`, `snap`, `start`
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
import { defineMoAliases } from 'motionary/components/mo';
import { defineBottomSheet } from 'motionary/components/ui';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineBottomSheet(); // registers <mo-bottom-sheet>

/* then use it in your HTML:
<mo-bottom-sheet snap="0.4,0.9" label="Filters">…</mo-bottom-sheet>
*/
```
