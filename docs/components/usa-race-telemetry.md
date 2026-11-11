# `<mo-race-telemetry>` — Race telemetry

> Element name `<mo-race-telemetry>` (default since 17.3); the legacy name `<usa-race-telemetry>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A vector track, position marker and supplied lap records.

- **Category:** ui · **since** 17.5
- **Import:** `import { defineRaceTelemetry } from 'motionary/components/widgets'` then `defineRaceTelemetry();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `value`, `disabled`, `animated`, `running`, `lap`, `lap-label`, `laps`, `sector`
- **Events:** `usa:action`, `usa:change`, `usa:tick`, `usa:complete`
- **Slots:** —
- **Methods:** `update()`, `play()`, `pause()`, `reset()`
- **Source:** [src/components/widgets/race-telemetry.ts](../../src/components/widgets/race-telemetry.ts)

## Minimal example

```html
<mo-race-telemetry value="72" animated></mo-race-telemetry>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineRaceTelemetry } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineRaceTelemetry(); // registers <mo-race-telemetry>

/* then use it in your HTML:
<mo-race-telemetry value="72" animated></mo-race-telemetry>
*/
```
