# `<mo-horizontal-scroll>` — Horizontal scroll section

> Element name `<mo-horizontal-scroll>` (default since 17.3); the legacy name `<usa-horizontal-scroll>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Panels that travel sideways while the page scrolls down; a snap scroller on narrow screens and under reduced motion.

- **Category:** page · **since** 17.10
- **Import:** `import { defineHorizontalScroll } from 'motionary/components/widgets'` then `defineHorizontalScroll();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `panel-width`, `gap`, `progress`, `min-width`, `label`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/horizontal-scroll.ts](../../src/components/widgets/horizontal-scroll.ts)

## Minimal example

```html
<mo-horizontal-scroll panel-width="60vw" progress><section>One</section><section>Two</section><section>Three</section></mo-horizontal-scroll>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineHorizontalScroll } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineHorizontalScroll(); // registers <mo-horizontal-scroll>

/* then use it in your HTML:
<mo-horizontal-scroll panel-width="60vw" progress><section>One</section><section>Two</section><section>Three</section></mo-horizontal-scroll>
*/
```
