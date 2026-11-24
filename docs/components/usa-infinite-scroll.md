# `<mo-infinite-scroll>` — Infinite scroll

> Element name `<mo-infinite-scroll>` (default since 17.3); the legacy name `<usa-infinite-scroll>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Asks for the next page near the end, rises new items in and keeps a Load more button.

- **Category:** layout · **since** 17.11
- **Import:** `import { defineInfiniteScroll } from 'motionary/components/widgets'` then `defineInfiniteScroll();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `root-margin`, `auto`, `label`, `button-label`, `end-label`, `stagger`
- **Events:** `usa:load`, `usa:end`
- **Slots:** —
- **Methods:** `done()`, `end()`, `reset()`
- **Source:** [src/components/widgets/infinite-scroll.ts](../../src/components/widgets/infinite-scroll.ts)

## Minimal example

```html
<mo-infinite-scroll auto="false"><ul><li>One</li><li>Two</li></ul></mo-infinite-scroll>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineInfiniteScroll } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineInfiniteScroll(); // registers <mo-infinite-scroll>

/* then use it in your HTML:
<mo-infinite-scroll auto="false"><ul><li>One</li><li>Two</li></ul></mo-infinite-scroll>
*/
```
