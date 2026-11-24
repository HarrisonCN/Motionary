# `<mo-scroll-bg>` — Scroll background

> Element name `<mo-scroll-bg>` (default since 17.3); the legacy name `<usa-scroll-bg>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Background and text colors ease from section to section as you scroll.

- **Category:** page · **since** 17.11
- **Import:** `import { defineScrollBg } from 'motionary/components/widgets'` then `defineScrollBg();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `target`, `line`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/scroll-bg.ts](../../src/components/widgets/scroll-bg.ts)

## Minimal example

```html
<mo-scroll-bg><section data-bg="#f1f0ec">One</section><section data-bg="#1b1b1a" data-fg="#f4f3ef">Two</section></mo-scroll-bg>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineScrollBg } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineScrollBg(); // registers <mo-scroll-bg>

/* then use it in your HTML:
<mo-scroll-bg><section data-bg="#f1f0ec">One</section><section data-bg="#1b1b1a" data-fg="#f4f3ef">Two</section></mo-scroll-bg>
*/
```
