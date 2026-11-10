# `<mo-glitch>` — Glitch text

> Element name `<mo-glitch>` (default since 17.3); the legacy name `<usa-glitch>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

An RGB-split, sliced glitch — always on or on hover.

- **Category:** text · **since** 2.8
- **Import:** `import { defineGlitch } from 'motionary/components/text'` then `defineGlitch();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
- **Attributes:** `text`, `intensity`
- **Events:** —
- **Slots:** —
- **Methods:** `mount()`, `splitChars()`
- **Source:** [src/components/text/text-fx.ts](../../src/components/text/text-fx.ts)

## Minimal example

```html
<usa-glitch trigger="hover">SYSTEM ERROR</usa-glitch>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineGlitch } from 'motionary/components/text';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineGlitch(); // registers <mo-glitch>

/* then use it in your HTML:
<mo-glitch trigger="hover">SYSTEM ERROR</mo-glitch>
*/
```
