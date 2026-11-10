# `<mo-avatar-stack>` — Avatar stack

> Element name `<mo-avatar-stack>` (default since 17.3); the legacy name `<usa-avatar-stack>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Overlapping avatars that spread apart with a spring on hover; extras collapse into “+N”.

- **Category:** ui · **since** 2.6 · **changed in** 7.4
- **Import:** `import { defineAvatarStack } from 'motionary/components/ui'` then `defineAvatarStack();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
- **Attributes:** `max`, `size`, `overlap`, `label`
- **Events:** —
- **Slots:** —
- **Methods:** `adoptVariants()`, `mount()`
- **Source:** [src/components/ui/avatar-stack.ts](../../src/components/ui/avatar-stack.ts)

## Minimal example

```html
<usa-avatar-stack max="4">
  <img src="a.jpg" alt="Ana">
  …
</usa-avatar-stack>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineAvatarStack } from 'motionary/components/ui';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineAvatarStack(); // registers <mo-avatar-stack>

/* then use it in your HTML:
<mo-avatar-stack max="4">
  <img src="a.jpg" alt="Ana">
  …
</mo-avatar-stack>
*/
```
