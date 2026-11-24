# `<mo-virtual-list>` — Virtual list

> Element name `<mo-virtual-list>` (default since 17.3); the legacy name `<usa-virtual-list>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Renders only the rows on screen, so tens of thousands of items scroll smoothly.

- **Category:** layout · **since** 17.11
- **Import:** `import { defineVirtualList } from 'motionary/components/widgets'` then `defineVirtualList();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `row-height`, `height`, `overscan`, `label`
- **Events:** `usa:range`
- **Slots:** —
- **Methods:** `scrollToIndex()`
- **Source:** [src/components/widgets/virtual-list.ts](../../src/components/widgets/virtual-list.ts)

## Minimal example

```html
<mo-virtual-list label="Items" height="240px"><ul><li>Alpha</li><li>Beta</li><li>Gamma</li><li>Delta</li></ul></mo-virtual-list>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineVirtualList } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineVirtualList(); // registers <mo-virtual-list>

/* then use it in your HTML:
<mo-virtual-list label="Items" height="240px"><ul><li>Alpha</li><li>Beta</li><li>Gamma</li><li>Delta</li></ul></mo-virtual-list>
*/
```
