# `<mo-anim-icon>` — Animated icons

> Element name `<mo-anim-icon>` (default since 17.3); the legacy name `<usa-anim-icon>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Stroke icons that move: the bell rings, the heart beats, the check draws, the gear turns. Hover, click, in view or loop; decorative unless labelled.

- **Category:** svg · **since** 3.3 · **changed in** 11.8
- **Import:** `import { defineAnimIcon } from 'motionary/components/svg'` then `defineAnimIcon();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
- **Attributes:** `name`, `size`, `label`, `trigger`
- **Events:** —
- **Slots:** —
- **Methods:** `play()`
- **Source:** [src/components/svg/anim-icon.ts](../../src/components/svg/anim-icon.ts)

## Minimal example

```html
<usa-anim-icon name="bell" label="Notifications"></usa-anim-icon>
<usa-anim-icon name="heart" trigger="click"></usa-anim-icon>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineAnimIcon } from 'motionary/components/svg';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineAnimIcon(); // registers <mo-anim-icon>

/* then use it in your HTML:
<mo-anim-icon name="bell" label="Notifications"></mo-anim-icon>
<mo-anim-icon name="heart" trigger="click"></mo-anim-icon>
*/
```
