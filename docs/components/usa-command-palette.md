# `<mo-command-palette>` — Command palette (⌘K)

> Element name `<mo-command-palette>` (default since 17.3); the legacy name `<usa-command-palette>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

7.9: a ⌘K command palette on the native <dialog> — scales in, filters as you type with fuzzy matching and highlighted letters, results stagger in and a highlight glides between rows. Use ↑/↓ for one row, Page Up/Down for a page and Enter to run a command.

- **Category:** ui · **since** 7.9
- **Import:** `import { defineCommandPalette } from 'motionary/components/widgets'` then `defineCommandPalette();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `placeholder`, `label`, `hotkey`, `inline`
- **Events:** `usa:run`, `usa:open`, `usa:close`
- **Slots:** —
- **Methods:** `setCommands()`, `show()`, `close()`, `toggle()`
- **Source:** [src/components/widgets/command-palette.ts](../../src/components/widgets/command-palette.ts)

## Minimal example

```html
<usa-command-palette>
  <option value="new" data-group="File" data-keys="mod+n">New file</option>
  <option value="theme" data-group="View">Toggle theme</option>
</usa-command-palette>
<script>const palette = document.querySelector('usa-command-palette'); palette.addEventListener('usa:run', (e) => run(e.detail.id));</script>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineCommandPalette } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineCommandPalette(); // registers <mo-command-palette>

/* then use it in your HTML:
<mo-command-palette>
  <option value="new" data-group="File" data-keys="mod+n">New file</option>
  <option value="theme" data-group="View">Toggle theme</option>
</mo-command-palette>
*/
```
