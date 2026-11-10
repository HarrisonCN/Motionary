# `<mo-spotlight>` — Reveal highlight

> Element name `<mo-spotlight>` (default since 17.3); the legacy name `<usa-spotlight>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

The Windows Fluent “Reveal” effect: a light follows the pointer, lighting the borders of nearby items and the hovered one.

- **Category:** interaction · **since** 2.2
- **Import:** `import { defineSpotlight } from 'motionary/components/interaction'` then `defineSpotlight();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
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
import { defineMoAliases } from 'motionary/components/mo';
import { defineSpotlight } from 'motionary/components/interaction';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineSpotlight(); // registers <mo-spotlight>

/* then use it in your HTML:
<mo-spotlight>
  <button>Mail</button>
  <button>Calendar</button>
  <button>Photos</button>
</mo-spotlight>
*/
```
