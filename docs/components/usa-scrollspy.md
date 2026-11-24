# `<mo-scrollspy>` — Scrollspy table of contents

> Element name `<mo-scrollspy>` (default since 17.3); the legacy name `<usa-scrollspy>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A table of contents that follows the reader: a marker slides to the section on screen; links scroll smoothly and move focus.

- **Category:** page · **since** 17.10
- **Import:** `import { defineScrollspy } from 'motionary/components/widgets'` then `defineScrollspy();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `target`, `selector`, `label`, `offset`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** `refresh()`
- **Source:** [src/components/widgets/scrollspy.ts](../../src/components/widgets/scrollspy.ts)

## Minimal example

```html
<mo-scrollspy target="main" label="On this page"></mo-scrollspy>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineScrollspy } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineScrollspy(); // registers <mo-scrollspy>

/* then use it in your HTML:
<mo-scrollspy target="main" label="On this page"></mo-scrollspy>
*/
```
