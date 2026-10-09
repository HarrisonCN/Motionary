# `<usa-mask-reveal>` — Mask reveal

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Reveal images or sections through a growing mask: circle, diamond, star, iris or wipes, from any origin.

- **Category:** svg
- **Import:** `import { defineMaskReveal } from 'motionary/components/svg'` then `defineMaskReveal();`
- **CDN:** `<script src="https://unpkg.com/motionary@10/dist/components.umd.js"></script>`
- **Attributes:** —
- **Events:** `usa:complete`
- **Slots:** —
- **Methods:** `reveal()`
- **Source:** [src/components/svg/mask-reveal.ts](../../src/components/svg/mask-reveal.ts)

## Minimal example

```html
<usa-mask-reveal shape="circle" at="20% 30%">
  <img src="hero.jpg" alt="…">
</usa-mask-reveal>
```

## ES module

```js
import { defineMaskReveal } from 'motionary/components/svg';

defineMaskReveal(); // registers <usa-mask-reveal>

/* then use it in your HTML:
<usa-mask-reveal shape="circle" at="20% 30%">
  <img src="hero.jpg" alt="…">
</usa-mask-reveal>
*/
```
