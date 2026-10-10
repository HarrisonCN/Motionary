# `<usa-spotlight>` — Reveal highlight

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

The Windows Fluent “Reveal” effect: a light follows the pointer, lighting the borders of nearby items and the hovered one.

- **Category:** interaction · **since** 2.2
- **Import:** `import { defineSpotlight } from 'motionary/components/interaction'` then `defineSpotlight();`
- **CDN:** `<script src="https://unpkg.com/motionary@13/dist/components.umd.js"></script>`
- **Attributes:** `size`, `color`, `border`
- **Events:** —
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/interaction/spotlight.ts](../../src/components/interaction/spotlight.ts)

## Minimal example

```html
<usa-spotlight>
  <button>Mail</button>
  <button>Calendar</button>
  <button>Photos</button>
</usa-spotlight>
```

## ES module

```js
import { defineSpotlight } from 'motionary/components/interaction';

defineSpotlight(); // registers <usa-spotlight>

/* then use it in your HTML:
<usa-spotlight>
  <button>Mail</button>
  <button>Calendar</button>
  <button>Photos</button>
</usa-spotlight>
*/
```
