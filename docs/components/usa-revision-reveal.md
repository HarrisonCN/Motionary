# `<mo-revision-reveal>` — Revision reveal

> Element name `<mo-revision-reveal>` (default since 17.3); the legacy name `<usa-revision-reveal>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Slide between supplied draft and final text, with accessible copies of both.

- **Category:** text · **since** 17.6
- **Import:** `import { defineRevisionReveal } from 'motionary/components/widgets'` then `defineRevisionReveal();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `disabled`, `text`, `draft`, `value`
- **Events:** `usa:action`, `usa:change`
- **Slots:** —
- **Methods:** `update()`, `reset()`
- **Source:** [src/components/widgets/revision-reveal.ts](../../src/components/widgets/revision-reveal.ts)

## Minimal example

```html
<mo-revision-reveal></mo-revision-reveal>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineRevisionReveal } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineRevisionReveal(); // registers <mo-revision-reveal>

/* then use it in your HTML:
<mo-revision-reveal></mo-revision-reveal>
*/
```
