# `<mo-text-reveal>` — Text reveal

> Element name `<mo-text-reveal>` (default since 17.3); the legacy name `<usa-text-reveal>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Letters or words rise and unblur in turn when the text scrolls into view.

- **Category:** ui · **since** 17.9
- **Import:** `import { defineTextReveal } from 'motionary/components/widgets'` then `defineTextReveal();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `text`, `by`, `stagger`, `once`
- **Events:** —
- **Slots:** —
- **Methods:** `replay()`
- **Source:** [src/components/widgets/text-reveal.ts](../../src/components/widgets/text-reveal.ts)

## Minimal example

```html
<mo-text-reveal text="Moments matter"></mo-text-reveal>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineTextReveal } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineTextReveal(); // registers <mo-text-reveal>

/* then use it in your HTML:
<mo-text-reveal text="Moments matter"></mo-text-reveal>
*/
```
