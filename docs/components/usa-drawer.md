# `<usa-drawer>` — Drawer

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A side panel that springs in, drags / swipes closed, traps the page behind a backdrop and returns focus on close. Left, right, top or bottom.

- **Category:** ui
- **Import:** `import { defineDrawer } from 'motionary/components/ui'` then `defineDrawer();`
- **CDN:** `<script src="https://unpkg.com/motionary@10/dist/components.umd.js"></script>`
- **Attributes:** —
- **Events:** —
- **Slots:** —
- **Methods:** `show()`, `close()`
- **Source:** [src/components/ui/sheet.ts](../../src/components/ui/sheet.ts)

## Minimal example

```html
<button onclick="nav.open = true">Menu</button>
<usa-drawer id="nav" side="left" label="Navigation">…</usa-drawer>
```

## ES module

```js
import { defineDrawer } from 'motionary/components/ui';

defineDrawer(); // registers <usa-drawer>

/* then use it in your HTML:
<button onclick="nav.open = true">Menu</button>
<usa-drawer id="nav" side="left" label="Navigation">…</usa-drawer>
*/
```
