# `<mo-gesture-fx>` — Gesture triggers

> Element name `<mo-gesture-fx>` (default since 17.3); the legacy name `<usa-gesture-fx>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

5.7: <usa-gesture-fx> plays any registered effect on a fling (fast release), a two-finger twist or a long press that charges --usa-charge 0 → 1. JS: bindGesture(el, "fling", "tada").

- **Category:** fx · **since** 5.7
- **Import:** `import { defineGestureFx } from 'motionary/components/effects'` then `defineGestureFx();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
- **Attributes:** `gesture`, `effect`, `options`, `self`, `velocity`, `angle`, `duration`
- **Events:** —
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/effects/cursor.ts](../../src/components/effects/cursor.ts)

## Minimal example

```html
<usa-gesture-fx gesture="long-press" effect="tada">
  <button>Hold me</button>
</usa-gesture-fx>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineGestureFx } from 'motionary/components/effects';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineGestureFx(); // registers <mo-gesture-fx>

/* then use it in your HTML:
<mo-gesture-fx gesture="long-press" effect="tada">
  <button>Hold me</button>
</mo-gesture-fx>
*/
```
