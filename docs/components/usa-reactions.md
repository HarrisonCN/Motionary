# `<mo-reactions>` — Emoji reactions

> Element name `<mo-reactions>` (default since 17.3); the legacy name `<usa-reactions>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

7.4: a reaction bar — clicking a pill toggles your reaction: the emoji pops, the count rolls and copies float up; ＋ springs open a picker. Each pill is a toggle button with a count label.

- **Category:** ui · **since** 7.4
- **Import:** `import { defineReactions } from 'motionary/components/widgets'` then `defineReactions();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `emojis`, `counts`, `picker`
- **Events:** `usa:react`
- **Slots:** —
- **Methods:** `toggle()`
- **Source:** [src/components/widgets/reactions.ts](../../src/components/widgets/reactions.ts)

## Minimal example

```html
<usa-reactions emojis="👍,❤️,😂,🎉" counts="3,1,0,2"></usa-reactions>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineReactions } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineReactions(); // registers <mo-reactions>

/* then use it in your HTML:
<mo-reactions emojis="👍,❤️,😂,🎉" counts="3,1,0,2"></mo-reactions>
*/
```
