# `<usa-skeleton>` — Skeleton

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Shimmering placeholders while loading; remove loading and the real content fades in. aria-busy included.

- **Category:** feedback · **since** 2.2 · **changed in** 6.4
- **Import:** `import { defineSkeleton } from 'motionary/components/feedback'` then `defineSkeleton();`
- **CDN:** `<script src="https://unpkg.com/motionary@13/dist/components.umd.js"></script>`
- **Attributes:** `loading`, `lines`, `width`, `height`, `circle`, `avatar`, `radius`
- **Events:** `usa:loaded`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/feedback/skeleton.ts](../../src/components/feedback/skeleton.ts)

## Minimal example

```html
<usa-skeleton loading avatar lines="3">
  <article>…</article>
</usa-skeleton>
```

## ES module

```js
import { defineSkeleton } from 'motionary/components/feedback';

defineSkeleton(); // registers <usa-skeleton>

/* then use it in your HTML:
<usa-skeleton loading avatar lines="3">
  <article>…</article>
</usa-skeleton>
*/
```
