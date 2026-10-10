# `<usa-stagger>` — Stagger list

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Reveals direct children one after another — lists, grids, feature rows.

- **Category:** reveal · **since** 2.2 · **changed in** 6.1
- **Import:** `import { defineStagger } from 'motionary/components/reveal'` then `defineStagger();`
- **CDN:** `<script src="https://unpkg.com/motionary@13/dist/components.umd.js"></script>`
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
import { defineStagger } from 'motionary/components/reveal';

defineStagger(); // registers <usa-stagger>

/* then use it in your HTML:
<usa-stagger effect="rise" interval="80">
  <li>One</li>
  <li>Two</li>
  <li>Three</li>
</usa-stagger>
*/
```
