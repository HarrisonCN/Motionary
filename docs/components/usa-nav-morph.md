# `<mo-nav-morph>` — Navbar with morphing indicator

> Element name `<mo-nav-morph>` (default since 17.3); the legacy name `<usa-nav-morph>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

6.6: the indicator follows the hovered or focused link — stretching from the old one, leading edge first — and settles back on the current page. Underline, pill, blob or dot.

- **Category:** ui · **since** 6.6
- **Import:** `import { defineNavMorph } from 'motionary/components/widgets'` then `defineNavMorph();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `indicator`, `label`, `active`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/nav-morph.ts](../../src/components/widgets/nav-morph.ts)

## Minimal example

```html
<usa-nav-morph indicator="underline" label="Main">
  <a href="/" aria-current="page">Home</a>
  <a href="/docs">Docs</a>
  <a href="/blog">Blog</a>
</usa-nav-morph>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineNavMorph } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineNavMorph(); // registers <mo-nav-morph>

/* then use it in your HTML:
<mo-nav-morph indicator="underline" label="Main">
  <a href="/" aria-current="page">Home</a>
  <a href="/docs">Docs</a>
  <a href="/blog">Blog</a>
</mo-nav-morph>
*/
```
