# `<mo-copy-button>` — Copy button

> Element name `<mo-copy-button>` (default since 17.3); the legacy name `<usa-copy-button>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Two squares redraw into a tick and the label rolls to Copied; only success and length leave the element.

- **Category:** ui · **since** 17.9
- **Import:** `import { defineCopyButton } from 'motionary/components/widgets'` then `defineCopyButton();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `text`, `for`, `label`, `done-label`, `fail-label`, `duration`, `disabled`
- **Events:** `usa:copy`
- **Slots:** —
- **Methods:** `copy()`
- **Source:** [src/components/widgets/copy-button.ts](../../src/components/widgets/copy-button.ts)

## Minimal example

```html
<mo-copy-button text="npm i motionary"></mo-copy-button>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineCopyButton } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineCopyButton(); // registers <mo-copy-button>

/* then use it in your HTML:
<mo-copy-button text="npm i motionary"></mo-copy-button>
*/
```
