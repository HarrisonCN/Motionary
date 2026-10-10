# `<usa-sticky-stack>` — Sticky stack

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Cards stick while you scroll and the covered ones shrink and dim as the next slides over them.

- **Category:** cards
- **Import:** `import { defineStickyStack } from 'motionary/components/cards'` then `defineStickyStack();`
- **CDN:** `<script src="https://unpkg.com/motionary@12/dist/components.umd.js"></script>`
- **Attributes:** `top`, `gap`, `scale`
- **Events:** —
- **Slots:** —
- **Methods:** `update()`
- **Source:** [src/components/cards/sticky-stack.ts](../../src/components/cards/sticky-stack.ts)

## Minimal example

```html
<usa-sticky-stack top="80">
  <section>One</section>
  <section>Two</section>
  <section>Three</section>
</usa-sticky-stack>
```

## ES module

```js
import { defineStickyStack } from 'motionary/components/cards';

defineStickyStack(); // registers <usa-sticky-stack>

/* then use it in your HTML:
<usa-sticky-stack top="80">
  <section>One</section>
  <section>Two</section>
  <section>Three</section>
</usa-sticky-stack>
*/
```
