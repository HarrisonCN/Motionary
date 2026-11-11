# `<mo-particle-icon>` — Morphing particle icon

> Element name `<mo-particle-icon>` (default since 17.3); the legacy name `<usa-particle-icon>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Morph between eight SVG particle glyphs by changing icon. Static at rest; labelled or decorative.

- **Category:** ui · **since** 17.4
- **Import:** `import { defineParticleIcon } from 'motionary/components/widgets'` then `defineParticleIcon();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `icon`, `label`, `decorative`, `theme`
- **Events:** —
- **Slots:** —
- **Methods:** `morph()`
- **Source:** [src/components/widgets/particle-icon.ts](../../src/components/widgets/particle-icon.ts)

## Minimal example

```html
<mo-particle-icon icon="moon" label="Night"></mo-particle-icon>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineParticleIcon } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineParticleIcon(); // registers <mo-particle-icon>

/* then use it in your HTML:
<mo-particle-icon icon="moon" label="Night"></mo-particle-icon>
*/
```
