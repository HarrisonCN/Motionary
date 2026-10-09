# `<usa-file-drop>` — File drop zone

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

6.9: dragging files over it lights marching-ants borders and lifts the icon; dropped (or browsed) files fly into a list with progress bars that end in a drawn check.

- **Category:** feedback · **since** 6.9
- **Import:** `import { defineFileDrop } from 'motionary/components/widgets'` then `defineFileDrop();`
- **CDN:** `<script src="https://unpkg.com/motionary@11/dist/widgets.umd.js"></script>`
- **Attributes:** —
- **Events:** `usa:files`
- **Slots:** —
- **Methods:** `setProgress()`, `addFiles()`, `clear()`
- **Source:** [src/components/widgets/file-drop.ts](../../src/components/widgets/file-drop.ts)

## Minimal example

```html
<usa-file-drop multiple accept="image/*" label="Drop images or browse"></usa-file-drop>
<script>
  drop.addEventListener('usa:files', (e) => upload(e.detail.files, (i, p) => drop.setProgress(i, p)));
</script>
```

## ES module

```js
import { defineFileDrop } from 'motionary/components/widgets';

defineFileDrop(); // registers <usa-file-drop>

/* then use it in your HTML:
<usa-file-drop multiple accept="image/*" label="Drop images or browse"></usa-file-drop>
*/
```
