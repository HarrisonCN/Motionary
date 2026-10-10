# `<usa-card-stack>` — Swipe stack

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A deck where the top card swipes away left or right (pointer, touch, arrow keys) and the next springs forward. loop sends cards to the back.

- **Category:** cards
- **Import:** `import { defineCardStack } from 'motionary/components/cards'` then `defineCardStack();`
- **CDN:** `<script src="https://unpkg.com/motionary@11/dist/components.umd.js"></script>`
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
import { defineCardStack } from 'motionary/components/cards';

defineCardStack(); // registers <usa-card-stack>

/* then use it in your HTML:
<usa-card-stack loop>
  <article>1</article>
  <article>2</article>
  <article>3</article>
</usa-card-stack>
*/
```
