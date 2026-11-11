# `<mo-glucose-sparkline>` — Glucose sparkline

> Element name `<mo-glucose-sparkline>` (default since 17.3); the legacy name `<usa-glucose-sparkline>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Supplied readings with a colored bar history and trend text; no medical inference.

- **Category:** ui · **since** 17.5
- **Import:** `import { defineGlucoseSparkline } from 'motionary/components/widgets'` then `defineGlucoseSparkline();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `value`, `disabled`, `animated`, `running`, `values`, `unit`, `trend`, `start`, `middle`, `end`
- **Events:** `usa:action`, `usa:change`, `usa:tick`, `usa:complete`
- **Slots:** —
- **Methods:** `update()`, `play()`, `pause()`, `reset()`
- **Source:** [src/components/widgets/glucose-sparkline.ts](../../src/components/widgets/glucose-sparkline.ts)

## Minimal example

```html
<mo-glucose-sparkline value="7.2" animated></mo-glucose-sparkline>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineGlucoseSparkline } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineGlucoseSparkline(); // registers <mo-glucose-sparkline>

/* then use it in your HTML:
<mo-glucose-sparkline value="7.2" animated></mo-glucose-sparkline>
*/
```
