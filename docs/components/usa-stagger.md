# `<mo-stagger>` — Stagger list

> Element name `<mo-stagger>` (default since 17.3); the legacy name `<usa-stagger>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Reveals direct children one after another — lists, grids, feature rows.

- **Category:** reveal · **since** 2.2 · **changed in** 6.1
- **Import:** `import { defineStagger } from 'motionary/components/reveal'` then `defineStagger();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
- **Attributes:** `effect`, `repeat`, `threshold`, `distance`, `interval`, `delay`, `duration`, `easing`
- **Events:** `usa:enter`, `usa:complete`
- **Slots:** —
- **Methods:** `reveal()`, `reset()`
- **Source:** [src/components/reveal/stagger.ts](../../src/components/reveal/stagger.ts)

## Minimal example

```html
<usa-stagger effect="rise" interval="80">
  <li>One</li>
  <li>Two</li>
  <li>Three</li>
</usa-stagger>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineStagger } from 'motionary/components/reveal';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineStagger(); // registers <mo-stagger>

/* then use it in your HTML:
<mo-stagger effect="rise" interval="80">
  <li>One</li>
  <li>Two</li>
  <li>Three</li>
</mo-stagger>
*/
```
