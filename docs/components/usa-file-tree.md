# `<usa-file-tree>` — File tree

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Expandable folders with native file links and left/right keyboard navigation.

- **Category:** ui · **since** 17.3
- **Import:** `import { defineFileTree } from 'motionary/components/widgets'` then `defineFileTree();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** —
- **Events:** —
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/file-tree.ts](../../src/components/widgets/file-tree.ts)

## Minimal example

```html
<usa-file-tree><details open><summary>Portfolio</summary><details><summary>Portraits</summary><a href="#contact">Contact sheet</a></details></details></usa-file-tree>
```

## ES module

```js
import { defineFileTree } from 'motionary/components/widgets';

defineFileTree(); // registers <usa-file-tree>

/* then use it in your HTML:
<usa-file-tree><details open><summary>Portfolio</summary><details><summary>Portraits</summary><a href="#contact">Contact sheet</a></details></details></usa-file-tree>
*/
```
