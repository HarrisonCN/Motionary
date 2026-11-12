# `<mo-magnetic-field>` — Magnetic field

> Element name `<mo-magnetic-field>` (default since 17.3); the legacy name `<usa-magnetic-field>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Fine filings orient around a pointer-controlled magnetic dipole.

- **Category:** physics · **since** 17.6
- **Import:** `import { defineMagneticField } from 'motionary/components/widgets'` then `defineMagneticField();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `disabled`, `animated`, `paused`, `color`, `accent`, `strength`
- **Events:** `usa:action`, `usa:change`
- **Slots:** —
- **Methods:** `update()`, `reset()`, `play()`, `pause()`, `activate()`, `deactivate()`
- **Source:** [src/components/widgets/magnetic-field.ts](../../src/components/widgets/magnetic-field.ts)

## Minimal example

```html
<mo-magnetic-field animated></mo-magnetic-field>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineMagneticField } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineMagneticField(); // registers <mo-magnetic-field>

/* then use it in your HTML:
<mo-magnetic-field animated></mo-magnetic-field>
*/
```
