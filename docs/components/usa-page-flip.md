# `<mo-page-flip>` — Page flip book

> Element name `<mo-page-flip>` (default since 17.3); the legacy name `<usa-page-flip>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Pages turn around the spine in 3D; drag an edge, swipe, use the arrow keys or the buttons.

- **Category:** depth · **since** 17.13
- **Import:** `import { definePageFlip } from 'motionary/components/widgets'` then `definePageFlip();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `index`, `label`, `prev-label`, `next-label`, `page-label`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** `next()`, `prev()`
- **Source:** [src/components/widgets/page-flip.ts](../../src/components/widgets/page-flip.ts)

## Minimal example

```html
<mo-page-flip><section><h4>Chapter 1</h4><p>It began with a single frame.</p></section><section><h4>Chapter 2</h4><p>Then everything moved.</p></section><section><h4>The end</h4><p>Thanks for reading.</p></section></mo-page-flip>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { definePageFlip } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
definePageFlip(); // registers <mo-page-flip>

/* then use it in your HTML:
<mo-page-flip><section><h4>Chapter 1</h4><p>It began with a single frame.</p></section><section><h4>Chapter 2</h4><p>Then everything moved.</p></section><section><h4>The end</h4><p>Thanks for reading.</p></section></mo-page-flip>
*/
```
