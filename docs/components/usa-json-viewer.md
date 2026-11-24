# `<mo-json-viewer>` — JSON viewer

> Element name `<mo-json-viewer>` (default since 17.3); the legacy name `<usa-json-viewer>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A keyboard-navigable tree for JSON; branches open with a soft slide and long data stays capped.

- **Category:** ui · **since** 17.10
- **Import:** `import { defineJsonViewer } from 'motionary/components/widgets'` then `defineJsonViewer();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `json`, `expand-depth`, `max-nodes`, `label`
- **Events:** `usa:toggle`
- **Slots:** —
- **Methods:** `expandAll()`, `collapseAll()`
- **Source:** [src/components/widgets/json-viewer.ts](../../src/components/widgets/json-viewer.ts)

## Minimal example

```html
<mo-json-viewer json='{"name":"motionary","tags":["ui","motion"],"stars":42}'></mo-json-viewer>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineJsonViewer } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineJsonViewer(); // registers <mo-json-viewer>

/* then use it in your HTML:
<mo-json-viewer json='{"name":"motionary","tags":["ui","motion"],"stars":42}'></mo-json-viewer>
*/
```
