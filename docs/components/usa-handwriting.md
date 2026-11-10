# `<mo-handwriting>` — Handwriting draw

> Element name `<mo-handwriting>` (default since 17.3); the legacy name `<usa-handwriting>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

The text draws itself stroke by stroke, then fills in — signatures, hero words.

- **Category:** text · **since** 2.8 · **changed in** 4.0
- **Import:** `import { defineHandwriting } from 'motionary/components/text'` then `defineHandwriting();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
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
import { defineMoAliases } from 'motionary/components/mo';
import { defineHandwriting } from 'motionary/components/text';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineHandwriting(); // registers <mo-handwriting>

/* then use it in your HTML:
<mo-handwriting text="Thank you" size="72"></mo-handwriting>
*/
```
