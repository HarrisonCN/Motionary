# `<mo-transit-progress>` — Transit progress

> Element name `<mo-transit-progress>` (default since 17.3); the legacy name `<usa-transit-progress>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A luminous route strip with the active station.

- **Category:** ui · **since** 17.5
- **Import:** `import { defineTransitProgress } from 'motionary/components/widgets'` then `defineTransitProgress();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `value`, `disabled`, `animated`, `running`, `stations`
- **Events:** `usa:action`, `usa:change`, `usa:tick`, `usa:complete`
- **Slots:** —
- **Methods:** `update()`, `play()`, `pause()`, `reset()`
- **Source:** [src/components/widgets/transit-progress.ts](../../src/components/widgets/transit-progress.ts)

## Minimal example

```html
<mo-transit-progress value="50"></mo-transit-progress>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineTransitProgress } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineTransitProgress(); // registers <mo-transit-progress>

/* then use it in your HTML:
<mo-transit-progress value="50"></mo-transit-progress>
*/
```
