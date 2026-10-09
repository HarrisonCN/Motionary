# `<usa-wave-text>` — Wave text

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Letters bob in a travelling wave — playful headlines and loading labels.

- **Category:** text
- **Import:** `import { defineWaveText } from 'motionary/components/text'` then `defineWaveText();`
- **CDN:** `<script src="https://unpkg.com/motionary@11/dist/components.umd.js"></script>`
- **Attributes:** `text`
- **Events:** —
- **Slots:** —
- **Methods:** `mount()`, `splitChars()`
- **Source:** [src/components/text/text-fx.ts](../../src/components/text/text-fx.ts)

## Minimal example

```html
<usa-wave-text>Loading…</usa-wave-text>
```

## ES module

```js
import { defineWaveText } from 'motionary/components/text';

defineWaveText(); // registers <usa-wave-text>

/* then use it in your HTML:
<usa-wave-text>Loading…</usa-wave-text>
*/
```
