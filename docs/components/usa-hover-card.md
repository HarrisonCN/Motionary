# `<mo-hover-card>` — Hover card

> Element name `<mo-hover-card>` (default since 17.3); the legacy name `<usa-hover-card>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A preview card opens when the pointer rests on a trigger or it takes focus, and stays while the pointer moves onto it.

- **Category:** ui · **since** 17.15
- **Import:** `import { defineHoverCard } from 'motionary/components/widgets'` then `defineHoverCard();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `open-delay`, `close-delay`, `placement`, `open`
- **Events:** `usa:toggle`
- **Slots:** —
- **Methods:** `show()`, `hide()`
- **Source:** [src/components/widgets/hover-card.ts](../../src/components/widgets/hover-card.ts)

## Minimal example

```html
<mo-hover-card><a data-trigger href="#">@mei</a><div data-card><strong>Mei Chen</strong><p>Designs motion for the web. 1.2k followers.</p></div></mo-hover-card>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineHoverCard } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineHoverCard(); // registers <mo-hover-card>

/* then use it in your HTML:
<mo-hover-card><a data-trigger href="#">@mei</a><div data-card><strong>Mei Chen</strong><p>Designs motion for the web. 1.2k followers.</p></div></mo-hover-card>
*/
```
