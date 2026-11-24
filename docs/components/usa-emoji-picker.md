# `<mo-emoji-picker>` — Emoji picker

> Element name `<mo-emoji-picker>` (default since 17.3); the legacy name `<usa-emoji-picker>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Search, group tabs and a grid walked with arrow keys; a pick pops and can type into a field.

- **Category:** ui · **since** 17.13
- **Import:** `import { defineEmojiPicker } from 'motionary/components/widgets'` then `defineEmojiPicker();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `for`, `label`, `search-label`, `recent-label`, `empty-label`, `columns`, `remember`
- **Events:** `usa:pick`
- **Slots:** —
- **Methods:** `mount()`, `render()`, `render()`, `render()`, `defineMoName()`
- **Source:** [src/components/widgets/emoji-picker.ts](../../src/components/widgets/emoji-picker.ts)

## Minimal example

```html
<mo-emoji-picker></mo-emoji-picker>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineEmojiPicker } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineEmojiPicker(); // registers <mo-emoji-picker>

/* then use it in your HTML:
<mo-emoji-picker></mo-emoji-picker>
*/
```
