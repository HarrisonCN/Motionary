# `<usa-avatar-stack>` — Avatar stack

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Overlapping avatars that spread apart with a spring on hover; extras collapse into “+N”.

- **Category:** ui · **since** 2.6 · **changed in** 7.4
- **Import:** `import { defineAvatarStack } from 'motionary/components/ui'` then `defineAvatarStack();`
- **CDN:** `<script src="https://unpkg.com/motionary@13/dist/components.umd.js"></script>`
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
import { defineAvatarStack } from 'motionary/components/ui';

defineAvatarStack(); // registers <usa-avatar-stack>

/* then use it in your HTML:
<usa-avatar-stack max="4">
  <img src="a.jpg" alt="Ana">
  …
</usa-avatar-stack>
*/
```
