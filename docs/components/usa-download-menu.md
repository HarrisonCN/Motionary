# `<usa-download-menu>` — Download menu

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Choose a download format. Escape closes the picker and returns focus.

- **Category:** ui · **since** 17.3
- **Import:** `import { defineDownloadMenu } from 'motionary/components/widgets'` then `defineDownloadMenu();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** —
- **Events:** —
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/download-menu.ts](../../src/components/widgets/download-menu.ts)

## Minimal example

```html
<usa-download-menu><details><summary>Download</summary><a download="palette.txt" href="data:text/plain,Ink%20%23181716">Text palette</a><a download="palette.json" href="data:application/json,%5B%22%23181716%22%5D">JSON palette</a></details></usa-download-menu>
```

## ES module

```js
import { defineDownloadMenu } from 'motionary/components/widgets';

defineDownloadMenu(); // registers <usa-download-menu>

/* then use it in your HTML:
<usa-download-menu><details><summary>Download</summary><a download="palette.txt" href="data:text/plain,Ink%20%23181716">Text palette</a><a download="palette.json" href="data:application/json,%5B%22%23181716%22%5D">JSON palette</a></details></usa-download-menu>
*/
```
