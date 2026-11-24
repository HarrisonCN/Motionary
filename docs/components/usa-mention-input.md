# `<mo-mention-input>` — Mention input

> Element name `<mo-mention-input>` (default since 17.3); the legacy name `<usa-mention-input>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Type @ to get a list of matching people that pops in; arrows and Enter insert a name.

- **Category:** ui · **since** 17.13
- **Import:** `import { defineMentionInput } from 'motionary/components/widgets'` then `defineMentionInput();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `people`, `trigger`, `max`, `label`, `empty-label`
- **Events:** `usa:mention`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/mention-input.ts](../../src/components/widgets/mention-input.ts)

## Minimal example

```html
<mo-mention-input people="Ada Lovelace,Alan Turing,Grace Hopper,Linus Torvalds"><textarea rows="3" placeholder="Try typing @a"></textarea></mo-mention-input>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineMentionInput } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineMentionInput(); // registers <mo-mention-input>

/* then use it in your HTML:
<mo-mention-input people="Ada Lovelace,Alan Turing,Grace Hopper,Linus Torvalds"><textarea rows="3" placeholder="Try typing @a"></textarea></mo-mention-input>
*/
```
