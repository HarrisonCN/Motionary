# `<usa-scroll-highlight>` — Scroll highlight

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Words light up one by one as you read down the page, or a highlighter marker sweeps behind the text.

- **Category:** text · **since** 2.8
- **Import:** `import { defineScrollHighlight } from 'motionary/components/text'` then `defineScrollHighlight();`
- **CDN:** `<script src="https://unpkg.com/motionary@12/dist/components.umd.js"></script>`
- **Attributes:** `mode`, `text`, `color`, `dim`
- **Events:** —
- **Slots:** —
- **Methods:** `mount()`
- **Source:** [src/components/text/text-fx.ts](../../src/components/text/text-fx.ts)

## Minimal example

```html
<usa-scroll-highlight>Every word lights up as you scroll.</usa-scroll-highlight>
<usa-scroll-highlight mode="marker">Important</usa-scroll-highlight>
```

## ES module

```js
import { defineScrollHighlight } from 'motionary/components/text';

defineScrollHighlight(); // registers <usa-scroll-highlight>

/* then use it in your HTML:
<usa-scroll-highlight>Every word lights up as you scroll.</usa-scroll-highlight>
<usa-scroll-highlight mode="marker">Important</usa-scroll-highlight>
*/
```
