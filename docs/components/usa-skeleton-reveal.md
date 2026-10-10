# `<usa-skeleton-reveal>` — Skeleton → content reveal

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

6.4: the skeleton is generated from the real content — one bar per rendered text line, blocks for images and marked elements — with one synchronized shimmer (wave, pulse or glow). Remove loading and the bars dissolve top-to-bottom while the content fades in from a blur.

- **Category:** feedback · **since** 6.4
- **Import:** `import { defineSkeletonReveal } from 'motionary/components/widgets'` then `defineSkeletonReveal();`
- **CDN:** `<script src="https://unpkg.com/motionary@13/dist/widgets.umd.js"></script>`
- **Attributes:** `loading`, `variant`
- **Events:** `usa:reveal`
- **Slots:** —
- **Methods:** `reveal()`
- **Source:** [src/components/widgets/skeleton-reveal.ts](../../src/components/widgets/skeleton-reveal.ts)

## Minimal example

```html
<usa-skeleton-reveal loading variant="wave">
  <img src="avatar.jpg" alt="" data-skeleton="circle">
  <h3>Ada Lovelace</h3>
  <p>…</p>
</usa-skeleton-reveal>
<!-- el.loading = false (or el.reveal()) when the data arrived -->
```

## ES module

```js
import { defineSkeletonReveal } from 'motionary/components/widgets';

defineSkeletonReveal(); // registers <usa-skeleton-reveal>

/* then use it in your HTML:
<usa-skeleton-reveal loading variant="wave">
  <img src="avatar.jpg" alt="" data-skeleton="circle">
  <h3>Ada Lovelace</h3>
  <p>…</p>
</usa-skeleton-reveal>
<!-- el.loading = false (or el.reveal()) when the data arrived -->
*/
```
