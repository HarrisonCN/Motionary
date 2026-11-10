# `<mo-reveal>` — Reveal

> Element name `<mo-reveal>` (default since 17.3); the legacy name `<usa-reveal>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Fade, slide, zoom, blur or flip content in as it enters the viewport. 12 effects, replay on re-entry with repeat.

- **Category:** reveal · **since** 2.2 · **changed in** 6.1, 13.1
- **Import:** `import { defineReveal } from 'motionary/components/reveal'` then `defineReveal();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
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
import { defineMoAliases } from 'motionary/components/mo';
import { defineReveal } from 'motionary/components/reveal';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineReveal(); // registers <mo-reveal>

/* then use it in your HTML:
<mo-reveal effect="fade-up" duration="700">
  <h2>Hello</h2>
</mo-reveal>
*/
```
