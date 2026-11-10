# `<mo-scroll-highlight>` — Scroll highlight

> Element name `<mo-scroll-highlight>` (default since 17.3); the legacy name `<usa-scroll-highlight>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Words light up one by one as you read down the page, or a highlighter marker sweeps behind the text.

- **Category:** text · **since** 2.8
- **Import:** `import { defineScrollHighlight } from 'motionary/components/text'` then `defineScrollHighlight();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
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
import { defineMoAliases } from 'motionary/components/mo';
import { defineScrollHighlight } from 'motionary/components/text';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineScrollHighlight(); // registers <mo-scroll-highlight>

/* then use it in your HTML:
<mo-scroll-highlight>Every word lights up as you scroll.</mo-scroll-highlight>
<mo-scroll-highlight mode="marker">Important</mo-scroll-highlight>
*/
```
