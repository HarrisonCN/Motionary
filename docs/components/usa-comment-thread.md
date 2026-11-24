# `<mo-comment-thread>` — Comment thread

> Element name `<mo-comment-thread>` (default since 17.3); the legacy name `<usa-comment-thread>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Nested articles become a thread with avatars, likes that pop, reply forms and foldable replies.

- **Category:** ui · **since** 17.13
- **Import:** `import { defineCommentThread } from 'motionary/components/widgets'` then `defineCommentThread();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `you`, `reply-label`, `like-label`, `send-label`, `hide-label`, `show-label`, `show-one-label`, `placeholder`
- **Events:** `usa:like`, `usa:toggle`, `usa:reply`
- **Slots:** —
- **Methods:** `mount()`, `paintToggle()`, `paintToggle()`, `decorate()`, `defineMoName()`
- **Source:** [src/components/widgets/comment-thread.ts](../../src/components/widgets/comment-thread.ts)

## Minimal example

```html
<mo-comment-thread><article data-author="Mei" data-time="2h" data-likes="4"><p>Shipped the new chart!</p><article data-author="Sam" data-time="1h"><p>Looks great.</p></article></article></mo-comment-thread>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineCommentThread } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineCommentThread(); // registers <mo-comment-thread>

/* then use it in your HTML:
<mo-comment-thread><article data-author="Mei" data-time="2h" data-likes="4"><p>Shipped the new chart!</p><article data-author="Sam" data-time="1h"><p>Looks great.</p></article></article></mo-comment-thread>
*/
```
