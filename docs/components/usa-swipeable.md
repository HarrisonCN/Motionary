# `<mo-swipeable>` — Swipeable

> Element name `<mo-swipeable>` (default since 17.3); the legacy name `<usa-swipeable>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Swipe-to-dismiss and swipe actions: content follows the finger, flies out on a fast swipe or past the distance, otherwise springs home with your release velocity. Delete / arrow keys work too.

- **Category:** gesture · **since** 3.2 · **changed in** 6.8
- **Import:** `import { defineSwipeable } from 'motionary/components/gesture'` then `defineSwipeable();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
- **Attributes:** `axis`, `disabled`, `distance`, `dismiss`, `preset`
- **Events:** `usa:swipe`, `usa:dismiss`
- **Slots:** —
- **Methods:** `swipe()`, `reset()`
- **Source:** [src/components/gesture/swipeable.ts](../../src/components/gesture/swipeable.ts)

## Minimal example

```html
<usa-swipeable distance="120" dismiss>
  <div class="card">Swipe me away</div>
</usa-swipeable>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineSwipeable } from 'motionary/components/gesture';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineSwipeable(); // registers <mo-swipeable>

/* then use it in your HTML:
<mo-swipeable distance="120" dismiss>
  <div class="card">Swipe me away</div>
</mo-swipeable>
*/
```
