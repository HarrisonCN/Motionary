# `<mo-marquee>` — Marquee

> Element name `<mo-marquee>` (default since 17.3); the legacy name `<usa-marquee>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A seamless infinite ticker with constant speed, pause on hover, soft edges and vertical mode. Clones are hidden from AT.

- **Category:** background · **since** 2.2
- **Import:** `import { defineMarquee } from 'motionary/components/background'` then `defineMarquee();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
- **Attributes:** `speed`, `direction`, `gap`, `paused`, `pause-on-hover`
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
import { defineMoAliases } from 'motionary/components/mo';
import { defineMarquee } from 'motionary/components/background';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineMarquee(); // registers <mo-marquee>

/* then use it in your HTML:
<mo-marquee speed="50" pause-on-hover fade>
  <img src="logo-a.svg" alt="A">
  <img src="logo-b.svg" alt="B">
</mo-marquee>
*/
```
