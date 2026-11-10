# `<mo-menu>` — Dropdown menu

> Element name `<mo-menu>` (default since 17.3); the legacy name `<usa-menu>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

6.3: the list scales (or folds / slides) out of its button and the items cascade in. Full menu keyboard support — arrows, Home / End, Esc, Tab — and outside clicks close it.

- **Category:** ui · **since** 6.3
- **Import:** `import { defineMenu } from 'motionary/components/widgets'` then `defineMenu();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
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
import { defineMoAliases } from 'motionary/components/mo';
import { defineMenu } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineMenu(); // registers <mo-menu>

/* then use it in your HTML:
<mo-menu placement="bottom-start" effect="scale">
  <button>Actions ▾</button>
  <button>Edit</button>
  <button>Duplicate</button>
  <hr>
  <button>Delete</button>
</mo-menu>
*/
```
