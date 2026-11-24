# `<mo-cut-reveal>` — Cut reveal

> Element name `<mo-cut-reveal>` (default since 17.3); the legacy name `<usa-cut-reveal>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Copies of the content are sliced, shredded, split or torn and fly together to reveal it.

- **Category:** timeline · **since** 17.10
- **Import:** `import { defineCutReveal } from 'motionary/components/widgets'` then `defineCutReveal();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `cut`, `pieces`, `duration`, `trigger`
- **Events:** `usa:done`
- **Slots:** —
- **Methods:** `play()`
- **Source:** [src/components/widgets/cut-reveal.ts](../../src/components/widgets/cut-reveal.ts)

## Minimal example

```html
<mo-cut-reveal cut="slice" pieces="6"><h2>Sliced in</h2></mo-cut-reveal>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineCutReveal } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineCutReveal(); // registers <mo-cut-reveal>

/* then use it in your HTML:
<mo-cut-reveal cut="slice" pieces="6"><h2>Sliced in</h2></mo-cut-reveal>
*/
```
