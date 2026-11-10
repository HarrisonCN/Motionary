# `<mo-split-text>` — Split-text reveal

> Element name `<mo-split-text>` (default since 17.3); the legacy name `<usa-split-text>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Splits a headline into letters or words and cascades them in: rise, fade, blur, flip or pop. Words never break.

- **Category:** text · **since** 2.2 · **changed in** 4.3, 10.1, 10.3
- **Import:** `import { defineSplitText } from 'motionary/components/text'` then `defineSplitText();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
- **Attributes:** `by`, `text`, `from`, `stagger`, `duration`, `delay`, `trigger`, `repeat`
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
import { defineMoAliases } from 'motionary/components/mo';
import { defineSplitText } from 'motionary/components/text';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineSplitText(); // registers <mo-split-text>

/* then use it in your HTML:
<mo-split-text effect="rise">Animated headline</mo-split-text>
*/
```
