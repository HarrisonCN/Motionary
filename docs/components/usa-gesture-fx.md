# `<usa-gesture-fx>` — Gesture triggers

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

5.7: <usa-gesture-fx> plays any registered effect on a fling (fast release), a two-finger twist or a long press that charges --usa-charge 0 → 1. JS: bindGesture(el, "fling", "tada").

- **Category:** fx
- **Import:** `import { defineGestureFx } from 'motionary/components/effects'` then `defineGestureFx();`
- **CDN:** `<script src="https://unpkg.com/motionary@11/dist/components.umd.js"></script>`
- **Attributes:** `gesture`, `effect`, `options`
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
import { defineGestureFx } from 'motionary/components/effects';

defineGestureFx(); // registers <usa-gesture-fx>

/* then use it in your HTML:
<usa-gesture-fx gesture="long-press" effect="tada">
  <button>Hold me</button>
</usa-gesture-fx>
*/
```
