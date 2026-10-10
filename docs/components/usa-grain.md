# `<usa-grain>` — Film grain

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

An SVG-noise grain overlay — no image to ship. animated makes it jitter like film.

- **Category:** background
- **Import:** `import { defineGrain } from 'motionary/components/background'` then `defineGrain();`
- **CDN:** `<script src="https://unpkg.com/motionary@12/dist/components.umd.js"></script>`
- **Attributes:** `opacity`, `blend`, `scale`
- **Events:** —
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/background/grain.ts](../../src/components/background/grain.ts)

## Minimal example

```html
<usa-grain animated opacity="0.15">
  <img src="hero.jpg" alt="">
</usa-grain>
```

## ES module

```js
import { defineGrain } from 'motionary/components/background';

defineGrain(); // registers <usa-grain>

/* then use it in your HTML:
<usa-grain animated opacity="0.15">
  <img src="hero.jpg" alt="">
</usa-grain>
*/
```
