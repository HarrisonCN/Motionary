# `<usa-scrolly>` — Sticky scrollytelling

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A pinned graphic while [data-step] blocks scroll past; the active step drives the graphic via attributes, a CSS variable and events.

- **Category:** reveal
- **Import:** `import { defineScrolly } from 'motionary/components/reveal'` then `defineScrolly();`
- **CDN:** `<script src="https://unpkg.com/motionary@12/dist/components.umd.js"></script>`
- **Attributes:** `offset`
- **Events:** `usa:step`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/reveal/scrolly.ts](../../src/components/reveal/scrolly.ts)

## Minimal example

```html
<usa-scrolly>
  <figure data-sticky>…</figure>
  <section data-step="intro">…</section>
  <section data-step="detail">…</section>
</usa-scrolly>
```

## ES module

```js
import { defineScrolly } from 'motionary/components/reveal';

defineScrolly(); // registers <usa-scrolly>

/* then use it in your HTML:
<usa-scrolly>
  <figure data-sticky>…</figure>
  <section data-step="intro">…</section>
  <section data-step="detail">…</section>
</usa-scrolly>
*/
```
