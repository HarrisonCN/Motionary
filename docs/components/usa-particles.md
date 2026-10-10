# `<usa-particles>` — Particles

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A canvas constellation that drifts away from the pointer. Runs only while visible, DPR ≤ 2, a still frame under reduced motion.

- **Category:** background
- **Import:** `import { defineParticles } from 'motionary/components/background'` then `defineParticles();`
- **CDN:** `<script src="https://unpkg.com/motionary@12/dist/components.umd.js"></script>`
- **Attributes:** `count`, `color`, `size`, `speed`, `links`, `interactive`, `paused`
- **Events:** —
- **Slots:** —
- **Methods:** `reset()`
- **Source:** [src/components/background/particles.ts](../../src/components/background/particles.ts)

## Minimal example

```html
<usa-particles count="80" links="120" interactive></usa-particles>
```

## ES module

```js
import { defineParticles } from 'motionary/components/background';

defineParticles(); // registers <usa-particles>

/* then use it in your HTML:
<usa-particles count="80" links="120" interactive></usa-particles>
*/
```
