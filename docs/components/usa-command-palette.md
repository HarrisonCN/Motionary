# `<usa-command-palette>` — Command palette (⌘K)

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

7.9: a ⌘K command palette on the native <dialog> — scales in, filters as you type with fuzzy matching and highlighted letters, results stagger in and a highlight glides between rows (↑ ↓ Enter).

- **Category:** ui · **since** 7.9
- **Import:** `import { defineCommandPalette } from 'motionary/components/widgets'` then `defineCommandPalette();`
- **CDN:** `<script src="https://unpkg.com/motionary@10/dist/widgets.umd.js"></script>`
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
<script>palette.addEventListener('usa:run', (e) => run(e.detail.id));</script>
```

## ES module

```js
import { defineCommandPalette } from 'motionary/components/widgets';

defineCommandPalette(); // registers <usa-command-palette>

/* then use it in your HTML:
<usa-command-palette>
  <option value="new" data-group="File" data-keys="mod+n">New file</option>
  <option value="theme" data-group="View">Toggle theme</option>
</usa-command-palette>
*/
```
