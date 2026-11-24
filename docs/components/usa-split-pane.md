# `<mo-split-pane>` — Split pane

> Element name `<mo-split-pane>` (default since 17.3); the legacy name `<usa-split-pane>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Two panes with a handle you drag or move with the arrow keys; double click springs back.

- **Category:** layout · **since** 17.11
- **Import:** `import { defineSplitPane } from 'motionary/components/widgets'` then `defineSplitPane();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `orientation`, `position`, `min`, `max`, `step`, `height`, `label`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/split-pane.ts](../../src/components/widgets/split-pane.ts)

## Minimal example

```html
<mo-split-pane position="40" height="200px"><div>Left</div><div>Right</div></mo-split-pane>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineSplitPane } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineSplitPane(); // registers <mo-split-pane>

/* then use it in your HTML:
<mo-split-pane position="40" height="200px"><div>Left</div><div>Right</div></mo-split-pane>
*/
```
