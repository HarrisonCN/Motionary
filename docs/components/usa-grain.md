# `<mo-grain>` — Film grain

> Element name `<mo-grain>` (default since 17.3); the legacy name `<usa-grain>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

An SVG-noise grain overlay — no image to ship. animated makes it jitter like film.

- **Category:** background · **since** 2.2
- **Import:** `import { defineGrain } from 'motionary/components/background'` then `defineGrain();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
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
import { defineMoAliases } from 'motionary/components/mo';
import { defineGrain } from 'motionary/components/background';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineGrain(); // registers <mo-grain>

/* then use it in your HTML:
<mo-grain animated opacity="0.15">
  <img src="hero.jpg" alt="">
</mo-grain>
*/
```
