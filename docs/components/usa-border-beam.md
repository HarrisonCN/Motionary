# `<mo-border-beam>` — Border beam

> Element name `<mo-border-beam>` (default since 17.3); the legacy name `<usa-border-beam>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A beam of light that runs around a card's border, with an optional glow.

- **Category:** depth · **since** 17.11
- **Import:** `import { defineBorderBeam } from 'motionary/components/widgets'` then `defineBorderBeam();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `duration`, `colors`, `length`, `width`, `radius`, `glow`, `reverse`
- **Events:** —
- **Slots:** —
- **Methods:** `mount()`, `defineMoName()`
- **Source:** [src/components/widgets/border-beam.ts](../../src/components/widgets/border-beam.ts)

## Minimal example

```html
<mo-border-beam glow><strong>New</strong></mo-border-beam>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineBorderBeam } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineBorderBeam(); // registers <mo-border-beam>

/* then use it in your HTML:
<mo-border-beam glow><strong>New</strong></mo-border-beam>
*/
```
