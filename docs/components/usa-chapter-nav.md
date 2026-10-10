# `<usa-chapter-nav>` — Chapter nav

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

9.1: chapter navigation for long-form stories — one entry per chapter with a reading-progress bar that fills as you scroll, the current chapter highlighted, click to glide there.

- **Category:** ui · **since** 9.1
- **Import:** `import { defineChapterNav } from 'motionary/components/widgets'` then `defineChapterNav();`
- **CDN:** `<script src="https://unpkg.com/motionary@13/dist/widgets.umd.js"></script>`
- **Attributes:** `for`, `orientation`, `label`
- **Events:** `usa:chapter`
- **Slots:** —
- **Methods:** `goTo()`
- **Source:** [src/components/widgets/chapter-nav.ts](../../src/components/widgets/chapter-nav.ts)

## Minimal example

```html
<usa-chapter-nav for="#story"></usa-chapter-nav>
<article id="story">
  <section data-chapter="Prologue">…</section>
  <section data-chapter="The storm">…</section>
</article>
```

## ES module

```js
import { defineChapterNav } from 'motionary/components/widgets';

defineChapterNav(); // registers <usa-chapter-nav>

/* then use it in your HTML:
<usa-chapter-nav for="#story"></usa-chapter-nav>
<article id="story">
  <section data-chapter="Prologue">…</section>
  <section data-chapter="The storm">…</section>
</article>
*/
```
