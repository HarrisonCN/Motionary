# `<usa-liquid-nav>` — Liquid nav

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

8.3: a navigation bar whose active indicator is a drop of liquid — it stretches like a droplet towards the next item and settles with a wobble (gooey SVG filter).

- **Category:** ui · **since** 8.3
- **Import:** `import { defineLiquidNav } from 'motionary/components/widgets'` then `defineLiquidNav();`
- **CDN:** `<script src="https://unpkg.com/motionary@13/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `value`
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
import { defineLiquidNav } from 'motionary/components/widgets';

defineLiquidNav(); // registers <usa-liquid-nav>

/* then use it in your HTML:
<usa-liquid-nav label="Main">
  <a href="/" aria-current="page">Home</a><a href="/shop">Shop</a><a href="/about">About</a>
</usa-liquid-nav>
*/
```
