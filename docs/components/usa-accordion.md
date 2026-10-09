# `<usa-accordion>` — Accordion

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Smooth expand / collapse for native <details> — semantics, keyboard and find-in-page kept; no wrapper elements.

- **Category:** transitions
- **Import:** `import { defineAccordion } from 'motionary/components/transitions'` then `defineAccordion();`
- **CDN:** `<script src="https://unpkg.com/motionary@11/dist/components.umd.js"></script>`
- **Attributes:** —
- **Events:** `usa:toggle`
- **Slots:** —
- **Methods:** `toggleItem()`
- **Source:** [src/components/transitions/accordion.ts](../../src/components/transitions/accordion.ts)

## Minimal example

```html
<usa-accordion>
  <details><summary>Shipping</summary><p>…</p></details>
  <details><summary>Returns</summary><p>…</p></details>
</usa-accordion>
```

## ES module

```js
import { defineAccordion } from 'motionary/components/transitions';

defineAccordion(); // registers <usa-accordion>

/* then use it in your HTML:
<usa-accordion>
  <details><summary>Shipping</summary><p>…</p></details>
  <details><summary>Returns</summary><p>…</p></details>
</usa-accordion>
*/
```
