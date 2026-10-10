# `<usa-scroll-progress>` — Scroll progress bar

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Reading progress of the page or of one article. Compositor-only scaleX, role="progressbar".

- **Category:** reveal · **since** 2.2 · **changed in** 2.7, 13.1
- **Import:** `import { defineScrollProgress } from 'motionary/components/reveal'` then `defineScrollProgress();`
- **CDN:** `<script src="https://unpkg.com/motionary@13/dist/components.umd.js"></script>`
- **Attributes:** `target`, `label`
- **Events:** `usa:progress`
- **Slots:** —
- **Methods:** `update()`
- **Source:** [src/components/reveal/scroll-progress.ts](../../src/components/reveal/scroll-progress.ts)

## Minimal example

```html
<usa-scroll-progress></usa-scroll-progress>
<!-- or for one article -->
<usa-scroll-progress target="#post" position="bottom"></usa-scroll-progress>
```

## ES module

```js
import { defineScrollProgress } from 'motionary/components/reveal';

defineScrollProgress(); // registers <usa-scroll-progress>

/* then use it in your HTML:
<usa-scroll-progress></usa-scroll-progress>
<!-- or for one article -->
<usa-scroll-progress target="#post" position="bottom"></usa-scroll-progress>
*/
```
