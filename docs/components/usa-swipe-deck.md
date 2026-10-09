# `<usa-swipe-deck>` — Swipe cards deck

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

6.8: drag the top card — it rotates with the pointer, LIKE / NOPE stamps fade in and past the threshold (or on a fling) it flies off; otherwise it springs back. like(), nope(), undo(), ← / →.

- **Category:** gesture · **since** 6.8
- **Import:** `import { defineSwipeDeck } from 'motionary/components/widgets'` then `defineSwipeDeck();`
- **CDN:** `<script src="https://unpkg.com/motionary@11/dist/widgets.umd.js"></script>`
- **Attributes:** —
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
import { defineSwipeDeck } from 'motionary/components/widgets';

defineSwipeDeck(); // registers <usa-swipe-deck>

/* then use it in your HTML:
<usa-swipe-deck threshold="110" label="Matches">
  <article>Ada</article>
  <article>Linus</article>
  <article>Grace</article>
</usa-swipe-deck>
*/
```
