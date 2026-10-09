# `<usa-marquee>` — Marquee

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A seamless infinite ticker with constant speed, pause on hover, soft edges and vertical mode. Clones are hidden from AT.

- **Category:** background
- **Import:** `import { defineMarquee } from 'motionary/components/background'` then `defineMarquee();`
- **CDN:** `<script src="https://unpkg.com/motionary@10/dist/components.umd.js"></script>`
- **Attributes:** `speed`, `direction`, `gap`, `paused`
- **Events:** —
- **Slots:** —
- **Methods:** `pause()`, `resume()`
- **Source:** [src/components/background/marquee.ts](../../src/components/background/marquee.ts)

## Minimal example

```html
<usa-marquee speed="50" pause-on-hover fade>
  <img src="logo-a.svg" alt="A">
  <img src="logo-b.svg" alt="B">
</usa-marquee>
```

## ES module

```js
import { defineMarquee } from 'motionary/components/background';

defineMarquee(); // registers <usa-marquee>

/* then use it in your HTML:
<usa-marquee speed="50" pause-on-hover fade>
  <img src="logo-a.svg" alt="A">
  <img src="logo-b.svg" alt="B">
</usa-marquee>
*/
```
