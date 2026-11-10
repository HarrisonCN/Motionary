# `<mo-particles>` — Particles

> Element name `<mo-particles>` (default since 17.3); the legacy name `<usa-particles>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A canvas constellation that drifts away from the pointer. Runs only while visible, DPR ≤ 2, a still frame under reduced motion.

- **Category:** background · **since** 2.2
- **Import:** `import { defineParticles } from 'motionary/components/background'` then `defineParticles();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
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
import { defineMoAliases } from 'motionary/components/mo';
import { defineParticles } from 'motionary/components/background';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineParticles(); // registers <mo-particles>

/* then use it in your HTML:
<mo-particles count="80" links="120" interactive></mo-particles>
*/
```
