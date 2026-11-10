# `<mo-file-drop>` — File drop zone

> Element name `<mo-file-drop>` (default since 17.3); the legacy name `<usa-file-drop>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

6.9: dragging files over it lights marching-ants borders and lifts the icon; dropped (or browsed) files fly into a list with progress bars that end in a drawn check.

- **Category:** feedback · **since** 6.9
- **Import:** `import { defineFileDrop } from 'motionary/components/widgets'` then `defineFileDrop();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `accept`, `multiple`, `simulate`
- **Events:** `usa:files`
- **Slots:** —
- **Methods:** `setProgress()`, `addFiles()`, `clear()`
- **Source:** [src/components/widgets/file-drop.ts](../../src/components/widgets/file-drop.ts)

## Minimal example

```html
<usa-file-drop multiple accept="image/*" label="Drop images or browse"></usa-file-drop>
<script>
  const drop = document.querySelector('usa-file-drop');
  drop.addEventListener('usa:files', (e) => upload(e.detail.files, (i, p) => drop.setProgress(i, p)));
</script>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineFileDrop } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineFileDrop(); // registers <mo-file-drop>

/* then use it in your HTML:
<mo-file-drop multiple accept="image/*" label="Drop images or browse"></mo-file-drop>
*/
```
