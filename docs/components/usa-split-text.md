# `<usa-split-text>` — Split-text reveal

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Splits a headline into letters or words and cascades them in: rise, fade, blur, flip or pop. Words never break.

- **Category:** text
- **Import:** `import { defineSplitText } from 'motionary/components/text'` then `defineSplitText();`
- **CDN:** `<script src="https://unpkg.com/motionary@10/dist/components.umd.js"></script>`
- **Attributes:** `by`, `text`
- **Events:** `usa:complete`
- **Slots:** —
- **Methods:** `play()`, `reset()`
- **Source:** [src/components/text/split-text.ts](../../src/components/text/split-text.ts)

## Minimal example

```html
<usa-split-text effect="rise">Animated headline</usa-split-text>
```

## ES module

```js
import { defineSplitText } from 'motionary/components/text';

defineSplitText(); // registers <usa-split-text>

/* then use it in your HTML:
<usa-split-text effect="rise">Animated headline</usa-split-text>
*/
```
