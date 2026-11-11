# `<mo-orbit-pass>` — Orbit flyover

> Element name `<mo-orbit-pass>` (default since 17.3); the legacy name `<usa-orbit-pass>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

An arc, field-of-view cone and a progress marker for supplied pass data.

- **Category:** ui · **since** 17.5
- **Import:** `import { defineOrbitPass } from 'motionary/components/widgets'` then `defineOrbitPass();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `value`, `disabled`, `animated`, `running`, `title`, `eta`
- **Events:** `usa:action`, `usa:change`, `usa:tick`, `usa:complete`
- **Slots:** —
- **Methods:** `update()`, `play()`, `pause()`, `reset()`
- **Source:** [src/components/widgets/orbit-pass.ts](../../src/components/widgets/orbit-pass.ts)

## Minimal example

```html
<mo-orbit-pass value="76"></mo-orbit-pass>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineOrbitPass } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineOrbitPass(); // registers <mo-orbit-pass>

/* then use it in your HTML:
<mo-orbit-pass value="76"></mo-orbit-pass>
*/
```
