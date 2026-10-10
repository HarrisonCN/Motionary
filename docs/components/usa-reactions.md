# `<usa-reactions>` — Emoji reactions

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

7.4: a reaction bar — clicking a pill toggles your reaction: the emoji pops, the count rolls and copies float up; ＋ springs open a picker. Each pill is a toggle button with a count label.

- **Category:** ui · **since** 7.4
- **Import:** `import { defineReactions } from 'motionary/components/widgets'` then `defineReactions();`
- **CDN:** `<script src="https://unpkg.com/motionary@12/dist/widgets.umd.js"></script>`
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
import { defineReactions } from 'motionary/components/widgets';

defineReactions(); // registers <usa-reactions>

/* then use it in your HTML:
<usa-reactions emojis="👍,❤️,😂,🎉" counts="3,1,0,2"></usa-reactions>
*/
```
