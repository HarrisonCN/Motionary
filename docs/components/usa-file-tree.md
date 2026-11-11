# `<mo-file-tree>` — File tree

> Element name `<mo-file-tree>` (default since 17.3); the legacy name `<usa-file-tree>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

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
<mo-file-tree><details open><summary>Portfolio</summary><details><summary>Portraits</summary><a href="#contact">Contact sheet</a></details></details></mo-file-tree>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineFileTree } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineFileTree(); // registers <mo-file-tree>

/* then use it in your HTML:
<mo-file-tree><details open><summary>Portfolio</summary><details><summary>Portraits</summary><a href="#contact">Contact sheet</a></details></details></mo-file-tree>
*/
```
