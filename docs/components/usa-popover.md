# `<usa-popover>` — Popover

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Click-to-open panel that springs from its trigger; Esc / outside click closes, focus returns.

- **Category:** ui
- **Import:** `import { definePopover } from 'motionary/components/ui'` then `definePopover();`
- **CDN:** `<script src="https://unpkg.com/motionary@11/dist/components.umd.js"></script>`
- **Attributes:** —
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
import { definePopover } from 'motionary/components/ui';

definePopover(); // registers <usa-popover>

/* then use it in your HTML:
<usa-popover>
  <button>Share</button>
  <div data-popover>…</div>
</usa-popover>
*/
```
