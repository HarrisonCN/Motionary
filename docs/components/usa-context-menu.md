# `<mo-context-menu>` — Context menu

> Element name `<mo-context-menu>` (default since 17.3); the legacy name `<usa-context-menu>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Right-click, long press or the Menu key opens an ARIA menu that grows from the pointer.

- **Category:** ui · **since** 17.11
- **Import:** `import { defineContextMenu } from 'motionary/components/widgets'` then `defineContextMenu();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `long-press`
- **Events:** `usa:close`, `usa:open`, `usa:select`
- **Slots:** —
- **Methods:** `show()`, `close()`
- **Source:** [src/components/widgets/context-menu.ts](../../src/components/widgets/context-menu.ts)

## Minimal example

```html
<mo-context-menu><div>Right-click here</div><menu><button type="button">Copy</button><button type="button">Rename</button><hr><button type="button">Delete</button></menu></mo-context-menu>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineContextMenu } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineContextMenu(); // registers <mo-context-menu>

/* then use it in your HTML:
<mo-context-menu><div>Right-click here</div><menu><button type="button">Copy</button><button type="button">Rename</button><hr><button type="button">Delete</button></menu></mo-context-menu>
*/
```
