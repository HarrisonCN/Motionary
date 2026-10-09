# `<usa-menu>` — Dropdown menu

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

6.3: the list scales (or folds / slides) out of its button and the items cascade in. Full menu keyboard support — arrows, Home / End, Esc, Tab — and outside clicks close it.

- **Category:** ui · **since** 6.3
- **Import:** `import { defineMenu } from 'motionary/components/widgets'` then `defineMenu();`
- **CDN:** `<script src="https://unpkg.com/motionary@11/dist/widgets.umd.js"></script>`
- **Attributes:** `placement`, `effect`
- **Events:** `usa:select`, `usa:open`, `usa:close`
- **Slots:** —
- **Methods:** `open()`, `close()`, `toggle()`
- **Source:** [src/components/widgets/menu.ts](../../src/components/widgets/menu.ts)

## Minimal example

```html
<usa-menu placement="bottom-start" effect="scale">
  <button>Actions ▾</button>
  <button>Edit</button>
  <button>Duplicate</button>
  <hr>
  <button>Delete</button>
</usa-menu>
```

## ES module

```js
import { defineMenu } from 'motionary/components/widgets';

defineMenu(); // registers <usa-menu>

/* then use it in your HTML:
<usa-menu placement="bottom-start" effect="scale">
  <button>Actions ▾</button>
  <button>Edit</button>
  <button>Duplicate</button>
  <hr>
  <button>Delete</button>
</usa-menu>
*/
```
