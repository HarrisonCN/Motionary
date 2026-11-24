# `<mo-code-shake>` — Code shake

> Element name `<mo-code-shake>` (default since 17.3); the legacy name `<usa-code-shake>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

One-time code boxes that shake and clear on a wrong code; the code never leaves in events.

- **Category:** ui · **since** 17.9
- **Import:** `import { defineCodeShake } from 'motionary/components/widgets'` then `defineCodeShake();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `length`, `label`, `disabled`
- **Events:** `usa:complete`
- **Slots:** —
- **Methods:** `reject()`, `accept()`, `clear()`
- **Source:** [src/components/widgets/code-shake.ts](../../src/components/widgets/code-shake.ts)

## Minimal example

```html
<mo-code-shake length="4"></mo-code-shake>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineCodeShake } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineCodeShake(); // registers <mo-code-shake>

/* then use it in your HTML:
<mo-code-shake length="4"></mo-code-shake>
*/
```
