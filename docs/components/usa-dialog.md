# `<usa-dialog>` — Modal & drawer

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Animated modal, side drawers and bottom sheet on the native <dialog>: top layer, focus trap, Esc, backdrop click.

- **Category:** transitions · **since** 2.2 · **changed in** 2.9, 3.0
- **Import:** `import { defineDialog } from 'motionary/components/transitions'` then `defineDialog();`
- **CDN:** `<script src="https://unpkg.com/motionary@12/dist/components.umd.js"></script>`
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
import { defineDialog } from 'motionary/components/transitions';

defineDialog(); // registers <usa-dialog>

/* then use it in your HTML:
<usa-dialog id="dlg" kind="modal" label="Settings">
  <h2>Settings</h2>
  <button data-close>Done</button>
</usa-dialog>
<button onclick="dlg.show()">Open</button>
*/
```
