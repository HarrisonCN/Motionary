# `<mo-tip>` — Tooltip / popover 2.0

> Element name `<mo-tip>` (default since 17.3); the legacy name `<usa-tip>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

6.6: springs out of its trigger with an arrow, flips to stay inside the viewport and shifts along the edge; hover + keyboard focus (Esc closes) or click popovers with rich content.

- **Category:** ui · **since** 6.6 · **changed in** 6.9, 7.0
- **Import:** `import { defineTip } from 'motionary/components/widgets'` then `defineTip();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `text`, `placement`, `trigger`, `delay`
- **Events:** `usa:open`, `usa:close`
- **Slots:** —
- **Methods:** `show()`, `hide()`
- **Source:** [src/components/widgets/tip.ts](../../src/components/widgets/tip.ts)

## Minimal example

```html
<usa-tip text="Copied to clipboard" placement="top">
  <button>Copy</button>
</usa-tip>
<usa-tip trigger="click" placement="bottom">
  <button>Details</button>
  <div slot="tip"><strong>Pro tip</strong> …</div>
</usa-tip>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineTip } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineTip(); // registers <mo-tip>

/* then use it in your HTML:
<mo-tip text="Copied to clipboard" placement="top">
  <button>Copy</button>
</mo-tip>
<mo-tip trigger="click" placement="bottom">
  <button>Details</button>
  <div slot="tip"><strong>Pro tip</strong> …</div>
</mo-tip>
*/
```
