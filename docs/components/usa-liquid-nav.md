# `<mo-liquid-nav>` — Liquid nav

> Element name `<mo-liquid-nav>` (default since 17.3); the legacy name `<usa-liquid-nav>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

17.1: a liquid indicator that continues smoothly through rapid selections, supports horizontal or vertical navigation, realigns after resizing, and offers RTL-aware arrow keys plus Home/End. Set orientation="vertical" for a sidebar.

- **Category:** ui · **since** 8.3
- **Import:** `import { defineLiquidNav } from 'motionary/components/widgets'` then `defineLiquidNav();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `value`, `orientation`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/liquid-nav.ts](../../src/components/widgets/liquid-nav.ts)

## Minimal example

```html
<usa-liquid-nav label="Main">
  <a href="/" aria-current="page">Home</a><a href="/shop">Shop</a><a href="/about">About</a>
</usa-liquid-nav>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineLiquidNav } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineLiquidNav(); // registers <mo-liquid-nav>

/* then use it in your HTML:
<mo-liquid-nav label="Main">
  <a href="/" aria-current="page">Home</a><a href="/shop">Shop</a><a href="/about">About</a>
</mo-liquid-nav>
*/
```
