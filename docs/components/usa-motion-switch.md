# `<usa-motion-switch>` — Motion intensity

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Let users pick Off · Low · Normal · High for the whole app; scales every component, persists, and Off equals reduced motion.

- **Category:** page · **since** 2.7 · **changed in** 4.9, 5.0
- **Import:** `import { defineMotionSwitch } from 'motionary/components/page'` then `defineMotionSwitch();`
- **CDN:** `<script src="https://unpkg.com/motionary@13/dist/components.umd.js"></script>`
- **Attributes:** `labels`, `label`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/page/motion-switch.ts](../../src/components/page/motion-switch.ts)

## Minimal example

```html
<usa-motion-switch></usa-motion-switch>
<!-- or: setMotionIntensity('low', true) -->
```

## ES module

```js
import { defineMotionSwitch } from 'motionary/components/page';

defineMotionSwitch(); // registers <usa-motion-switch>

/* then use it in your HTML:
<usa-motion-switch></usa-motion-switch>
<!-- or: setMotionIntensity('low', true) -->
*/
```
