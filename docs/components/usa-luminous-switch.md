# `<mo-luminous-switch>` — Luminous day/night switch

> Element name `<mo-luminous-switch>` (default since 17.3); the legacy name `<usa-luminous-switch>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A spring glass thumb, moving edge halo and a 64-particle sun/moon morph. Native switch semantics and form reset. Optional explicit theme target.

- **Category:** ui · **since** 17.4
- **Import:** `import { defineLuminousSwitch } from 'motionary/components/widgets'` then `defineLuminousSwitch();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `checked`, `disabled`, `label`, `name`, `value`, `target`, `theme`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** `toggle()`
- **Source:** [src/components/widgets/luminous-switch.ts](../../src/components/widgets/luminous-switch.ts)

## Minimal example

```html
<mo-luminous-switch label="Light theme"></mo-luminous-switch>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineLuminousSwitch } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineLuminousSwitch(); // registers <mo-luminous-switch>

/* then use it in your HTML:
<mo-luminous-switch label="Light theme"></mo-luminous-switch>
*/
```
