# `<mo-dialog>` — Modal & drawer

> Element name `<mo-dialog>` (default since 17.3); the legacy name `<usa-dialog>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Animated modal, side drawers and bottom sheet on the native <dialog>: top layer, focus trap, Esc, backdrop click.

- **Category:** transitions · **since** 2.2 · **changed in** 2.9, 3.0, 13.0
- **Import:** `import { defineDialog } from 'motionary/components/transitions'` then `defineDialog();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
- **Attributes:** `open`, `kind`, `label`, `no-esc`, `no-backdrop-close`
- **Events:** `usa:open`, `usa:beforeclose`, `usa:close`
- **Slots:** default
- **Methods:** `show()`, `close()`
- **Source:** [src/components/transitions/dialog.ts](../../src/components/transitions/dialog.ts)

## Minimal example

```html
<usa-dialog id="dlg" kind="modal" label="Settings">
  <h2>Settings</h2>
  <button data-close>Done</button>
</usa-dialog>
<button onclick="dlg.show()">Open</button>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineDialog } from 'motionary/components/transitions';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineDialog(); // registers <mo-dialog>

/* then use it in your HTML:
<mo-dialog id="dlg" kind="modal" label="Settings">
  <h2>Settings</h2>
  <button data-close>Done</button>
</mo-dialog>
<button onclick="dlg.show()">Open</button>
*/
```
