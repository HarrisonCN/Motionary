# `<mo-sticky-stack>` — Sticky stack

> Element name `<mo-sticky-stack>` (default since 17.3); the legacy name `<usa-sticky-stack>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Cards stick while you scroll and the covered ones shrink and dim as the next slides over them.

- **Category:** cards · **since** 2.4
- **Import:** `import { defineStickyStack } from 'motionary/components/cards'` then `defineStickyStack();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
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
import { defineMoAliases } from 'motionary/components/mo';
import { defineStickyStack } from 'motionary/components/cards';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineStickyStack(); // registers <mo-sticky-stack>

/* then use it in your HTML:
<mo-sticky-stack top="80">
  <section>One</section>
  <section>Two</section>
  <section>Three</section>
</mo-sticky-stack>
*/
```
