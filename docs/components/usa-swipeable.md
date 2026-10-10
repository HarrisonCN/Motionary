# `<usa-swipeable>` — Swipeable

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Swipe-to-dismiss and swipe actions: content follows the finger, flies out on a fast swipe or past the distance, otherwise springs home with your release velocity. Delete / arrow keys work too.

- **Category:** gesture
- **Import:** `import { defineSwipeable } from 'motionary/components/gesture'` then `defineSwipeable();`
- **CDN:** `<script src="https://unpkg.com/motionary@12/dist/components.umd.js"></script>`
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
import { defineSwipeable } from 'motionary/components/gesture';

defineSwipeable(); // registers <usa-swipeable>

/* then use it in your HTML:
<usa-swipeable distance="120" dismiss>
  <div class="card">Swipe me away</div>
</usa-swipeable>
*/
```
