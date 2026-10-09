# `<usa-morph>` — Path morph

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Morph an SVG path through a list of shapes (paths="A | B | C") on click, hover, in view or automatically. Same-structure paths morph point by point.

- **Category:** svg
- **Import:** `import { defineMorph } from 'motionary/components/svg'` then `defineMorph();`
- **CDN:** `<script src="https://unpkg.com/motionary@11/dist/components.umd.js"></script>`
- **Attributes:** `paths`, `trigger`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** `next()`
- **Source:** [src/components/svg/morph.ts](../../src/components/svg/morph.ts)

## Minimal example

```html
<usa-morph trigger="auto" interval="1800"
  paths="M50 10 C75 10 90 30 90 50 C90 75 70 90 50 90 C25 90 10 70 10 50 C10 30 25 10 50 10 Z | M50 4 C80 20 96 26 86 54 C78 84 64 96 44 86 C14 80 4 64 14 44 C20 20 30 0 50 4 Z"></usa-morph>
```

## ES module

```js
import { defineMorph } from 'motionary/components/svg';

defineMorph(); // registers <usa-morph>

/* then use it in your HTML:
<usa-morph trigger="auto" interval="1800"
  paths="M50 10 C75 10 90 30 90 50 C90 75 70 90 50 90 C25 90 10 70 10 50 C10 30 25 10 50 10 Z | M50 4 C80 20 96 26 86 54 C78 84 64 96 44 86 C14 80 4 64 14 44 C20 20 30 0 50 4 Z"></usa-morph>
*/
```
