# `<usa-anim-icon>` — Animated icons

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Stroke icons that move: the bell rings, the heart beats, the check draws, the gear turns. Hover, click, in view or loop; decorative unless labelled.

- **Category:** svg
- **Import:** `import { defineAnimIcon } from 'motionary/components/svg'` then `defineAnimIcon();`
- **CDN:** `<script src="https://unpkg.com/motionary@11/dist/components.umd.js"></script>`
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
import { defineAnimIcon } from 'motionary/components/svg';

defineAnimIcon(); // registers <usa-anim-icon>

/* then use it in your HTML:
<usa-anim-icon name="bell" label="Notifications"></usa-anim-icon>
<usa-anim-icon name="heart" trigger="click"></usa-anim-icon>
*/
```
