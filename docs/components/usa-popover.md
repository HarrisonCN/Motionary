# `<mo-popover>` — Popover

> Element name `<mo-popover>` (default since 17.3); the legacy name `<usa-popover>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Click-to-open panel that springs from its trigger; Esc / outside click closes, focus returns.

- **Category:** ui · **since** 2.6 · **changed in** 6.6, 12.0
- **Import:** `import { definePopover } from 'motionary/components/ui'` then `definePopover();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
- **Attributes:** `placement`
- **Events:** —
- **Slots:** —
- **Methods:** `toggle()`
- **Source:** [src/components/ui/popover.ts](../../src/components/ui/popover.ts)

## Minimal example

```html
<usa-popover>
  <button>Share</button>
  <div data-popover>…</div>
</usa-popover>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { definePopover } from 'motionary/components/ui';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
definePopover(); // registers <mo-popover>

/* then use it in your HTML:
<mo-popover>
  <button>Share</button>
  <div data-popover>…</div>
</mo-popover>
*/
```
