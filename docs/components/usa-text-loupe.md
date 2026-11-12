# `<mo-text-loupe>` — Text loupe

> Element name `<mo-text-loupe>` (default since 17.3); the legacy name `<usa-text-loupe>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A pointer and keyboard controlled lens preserves the readable original text.

- **Category:** text · **since** 17.6
- **Import:** `import { defineTextLoupe } from 'motionary/components/widgets'` then `defineTextLoupe();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `disabled`, `text`
- **Events:** `usa:action`, `usa:change`
- **Slots:** —
- **Methods:** `update()`, `reset()`, `focusAt()`
- **Source:** [src/components/widgets/text-loupe.ts](../../src/components/widgets/text-loupe.ts)

## Minimal example

```html
<mo-text-loupe></mo-text-loupe>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineTextLoupe } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineTextLoupe(); // registers <mo-text-loupe>

/* then use it in your HTML:
<mo-text-loupe></mo-text-loupe>
*/
```
