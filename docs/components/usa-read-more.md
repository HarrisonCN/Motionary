# `<mo-read-more>` — Read more

> Element name `<mo-read-more>` (default since 17.3); the legacy name `<usa-read-more>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Long text clamped to a few lines that unfolds on a damped spring while the fade melts away; no button when the text already fits.

- **Category:** ui · **since** 17.18
- **Import:** `import { defineReadMore } from 'motionary/components/widgets'` then `defineReadMore();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `lines`, `more`, `less`, `open`, `feel`
- **Events:** `usa:toggle`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/read-more.ts](../../src/components/widgets/read-more.ts)

## Minimal example

```html
<mo-read-more lines="2"><p>Springs carry their speed into every change, so a panel that opens, closes and opens again never jumps. The height overshoots by a hair and settles, which reads as weight rather than as a stop. Under reduced motion it simply switches.</p></mo-read-more>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineReadMore } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineReadMore(); // registers <mo-read-more>

/* then use it in your HTML:
<mo-read-more lines="2"><p>Springs carry their speed into every change, so a panel that opens, closes and opens again never jumps. The height overshoots by a hair and settles, which reads as weight rather than as a stop. Under reduced motion it simply switches.</p></mo-read-more>
*/
```
