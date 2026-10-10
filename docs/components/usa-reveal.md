# `<usa-reveal>` — Reveal

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Fade, slide, zoom, blur or flip content in as it enters the viewport. 12 effects, replay on re-entry with repeat.

- **Category:** reveal · **since** 2.2 · **changed in** 6.1
- **Import:** `import { defineReveal } from 'motionary/components/reveal'` then `defineReveal();`
- **CDN:** `<script src="https://unpkg.com/motionary@13/dist/components.umd.js"></script>`
- **Attributes:** `effect`, `distance`, `repeat`, `threshold`, `root-margin`, `duration`, `delay`, `easing`
- **Events:** `usa:enter`, `usa:leave`, `usa:complete`
- **Slots:** —
- **Methods:** `reveal()`, `reset()`
- **Source:** [src/components/reveal/reveal.ts](../../src/components/reveal/reveal.ts)

## Minimal example

```html
<usa-reveal effect="fade-up" duration="700">
  <h2>Hello</h2>
</usa-reveal>
```

## ES module

```js
import { defineReveal } from 'motionary/components/reveal';

defineReveal(); // registers <usa-reveal>

/* then use it in your HTML:
<usa-reveal effect="fade-up" duration="700">
  <h2>Hello</h2>
</usa-reveal>
*/
```
