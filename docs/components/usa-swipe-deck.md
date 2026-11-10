# `<mo-swipe-deck>` — Swipe cards deck

> Element name `<mo-swipe-deck>` (default since 17.3); the legacy name `<usa-swipe-deck>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

6.8: drag the top card — it rotates with the pointer, LIKE / NOPE stamps fade in and past the threshold (or on a fling) it flies off; otherwise it springs back. like(), nope(), undo(), ← / →.

- **Category:** gesture · **since** 6.8
- **Import:** `import { defineSwipeDeck } from 'motionary/components/widgets'` then `defineSwipeDeck();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `threshold`
- **Events:** `usa:swipe`, `usa:empty`
- **Slots:** —
- **Methods:** `like()`, `nope()`, `undo()`
- **Source:** [src/components/widgets/swipe-deck.ts](../../src/components/widgets/swipe-deck.ts)

## Minimal example

```html
<usa-swipe-deck threshold="110" label="Matches">
  <article>Ada</article>
  <article>Linus</article>
  <article>Grace</article>
</usa-swipe-deck>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineSwipeDeck } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineSwipeDeck(); // registers <mo-swipe-deck>

/* then use it in your HTML:
<mo-swipe-deck threshold="110" label="Matches">
  <article>Ada</article>
  <article>Linus</article>
  <article>Grace</article>
</mo-swipe-deck>
*/
```
