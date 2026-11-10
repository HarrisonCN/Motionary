# `<mo-drawer>` — Drawer

> Element name `<mo-drawer>` (default since 17.3); the legacy name `<usa-drawer>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A side panel that springs in, drags / swipes closed, traps the page behind a backdrop and returns focus on close. Left, right, top or bottom.

- **Category:** ui · **since** 2.6 · **changed in** 13.1, 13.3
- **Import:** `import { defineDrawer } from 'motionary/components/ui'` then `defineDrawer();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
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
import { defineMoAliases } from 'motionary/components/mo';
import { defineDrawer } from 'motionary/components/ui';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineDrawer(); // registers <mo-drawer>

/* then use it in your HTML:
<button onclick="nav.open = true">Menu</button>
<mo-drawer id="nav" side="left" label="Navigation">…</mo-drawer>
*/
```
