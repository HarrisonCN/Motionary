# `<usa-handwriting>` — Handwriting draw

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

The text draws itself stroke by stroke, then fills in — signatures, hero words.

- **Category:** text
- **Import:** `import { defineHandwriting } from 'motionary/components/text'` then `defineHandwriting();`
- **CDN:** `<script src="https://unpkg.com/motionary@12/dist/components.umd.js"></script>`
- **Attributes:** `text`, `size`, `font`, `stroke`, `duration`
- **Events:** `usa:complete`
- **Slots:** —
- **Methods:** `mount()`, `splitChars()`
- **Source:** [src/components/text/text-fx.ts](../../src/components/text/text-fx.ts)

## Minimal example

```html
<usa-handwriting text="Thank you" size="72"></usa-handwriting>
```

## ES module

```js
import { defineHandwriting } from 'motionary/components/text';

defineHandwriting(); // registers <usa-handwriting>

/* then use it in your HTML:
<usa-handwriting text="Thank you" size="72"></usa-handwriting>
*/
```
