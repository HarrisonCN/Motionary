# `<mo-card-stack>` — Swipe stack

> Element name `<mo-card-stack>` (default since 17.3); the legacy name `<usa-card-stack>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A deck where the top card swipes away left or right (pointer, touch, arrow keys) and the next springs forward. loop sends cards to the back.

- **Category:** cards · **since** 2.4
- **Import:** `import { defineCardStack } from 'motionary/components/cards'` then `defineCardStack();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
- **Attributes:** `visible`, `offset`, `disabled`, `threshold`, `loop`
- **Events:** `usa:swipe`, `usa:empty`
- **Slots:** —
- **Methods:** `swipe()`
- **Source:** [src/components/cards/card-stack.ts](../../src/components/cards/card-stack.ts)

## Minimal example

```html
<usa-card-stack loop>
  <article>1</article>
  <article>2</article>
  <article>3</article>
</usa-card-stack>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineCardStack } from 'motionary/components/cards';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineCardStack(); // registers <mo-card-stack>

/* then use it in your HTML:
<mo-card-stack loop>
  <article>1</article>
  <article>2</article>
  <article>3</article>
</mo-card-stack>
*/
```
