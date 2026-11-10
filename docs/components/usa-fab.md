# `<mo-fab>` — FAB speed dial

> Element name `<mo-fab>` (default since 17.3); the legacy name `<usa-fab>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A floating action button whose actions fan out with a staggered spring: up, down, left, right or radial.

- **Category:** ui · **since** 2.6
- **Import:** `import { defineFab } from 'motionary/components/ui'` then `defineFab();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
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
import { defineMoAliases } from 'motionary/components/mo';
import { defineFab } from 'motionary/components/ui';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineFab(); // registers <mo-fab>

/* then use it in your HTML:
<mo-fab direction="up">
  <button aria-label="Create">＋</button>
  <button aria-label="Photo">📷</button>
  <button aria-label="Note">📝</button>
</mo-fab>
*/
```
