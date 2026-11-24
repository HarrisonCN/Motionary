# `<mo-split-flap>` — Split-flap board

> Element name `<mo-split-flap>` (default since 17.3); the legacy name `<usa-split-flap>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Letters fold down through the alphabet like a departures board; cycles through words.

- **Category:** text · **since** 17.13
- **Import:** `import { defineSplitFlap } from 'motionary/components/widgets'` then `defineSplitFlap();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `value`, `words`, `interval`, `length`, `charset`, `speed`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/split-flap.ts](../../src/components/widgets/split-flap.ts)

## Minimal example

```html
<mo-split-flap words="BOARDING,DELAYED,ON TIME"></mo-split-flap>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineSplitFlap } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineSplitFlap(); // registers <mo-split-flap>

/* then use it in your HTML:
<mo-split-flap words="BOARDING,DELAYED,ON TIME"></mo-split-flap>
*/
```
