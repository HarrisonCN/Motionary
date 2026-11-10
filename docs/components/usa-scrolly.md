# `<mo-scrolly>` — Sticky scrollytelling

> Element name `<mo-scrolly>` (default since 17.3); the legacy name `<usa-scrolly>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A pinned graphic while [data-step] blocks scroll past; the active step drives the graphic via attributes, a CSS variable and events.

- **Category:** reveal · **since** 2.2
- **Import:** `import { defineScrolly } from 'motionary/components/reveal'` then `defineScrolly();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
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
import { defineMoAliases } from 'motionary/components/mo';
import { defineScrolly } from 'motionary/components/reveal';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineScrolly(); // registers <mo-scrolly>

/* then use it in your HTML:
<mo-scrolly>
  <figure data-sticky>…</figure>
  <section data-step="intro">…</section>
  <section data-step="detail">…</section>
</mo-scrolly>
*/
```
