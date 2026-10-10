# `<usa-fab>` — FAB speed dial

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A floating action button whose actions fan out with a staggered spring: up, down, left, right or radial.

- **Category:** ui · **since** 2.6
- **Import:** `import { defineFab } from 'motionary/components/ui'` then `defineFab();`
- **CDN:** `<script src="https://unpkg.com/motionary@13/dist/components.umd.js"></script>`
- **Attributes:** `direction`, `gap`
- **Events:** `usa:toggle`
- **Slots:** —
- **Methods:** `toggle()`
- **Source:** [src/components/ui/fab.ts](../../src/components/ui/fab.ts)

## Minimal example

```html
<usa-fab direction="up">
  <button aria-label="Create">＋</button>
  <button aria-label="Photo">📷</button>
  <button aria-label="Note">📝</button>
</usa-fab>
```

## ES module

```js
import { defineFab } from 'motionary/components/ui';

defineFab(); // registers <usa-fab>

/* then use it in your HTML:
<usa-fab direction="up">
  <button aria-label="Create">＋</button>
  <button aria-label="Photo">📷</button>
  <button aria-label="Note">📝</button>
</usa-fab>
*/
```
