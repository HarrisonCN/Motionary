# `<mo-letter-swap>` — Letter swap

> Element name `<mo-letter-swap>` (default since 17.3); the legacy name `<usa-letter-swap>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Each letter rolls up and is replaced by itself on hover, one after another; screen readers get the word once.

- **Category:** text · **since** 17.12
- **Import:** `import { defineLetterSwap } from 'motionary/components/widgets'` then `defineLetterSwap();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `stagger`, `direction`
- **Events:** —
- **Slots:** —
- **Methods:** `mount()`, `defineMoName()`
- **Source:** [src/components/widgets/letter-swap.ts](../../src/components/widgets/letter-swap.ts)

## Minimal example

```html
<mo-letter-swap><a href="#">Get started</a></mo-letter-swap>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineLetterSwap } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineLetterSwap(); // registers <mo-letter-swap>

/* then use it in your HTML:
<mo-letter-swap><a href="#">Get started</a></mo-letter-swap>
*/
```
