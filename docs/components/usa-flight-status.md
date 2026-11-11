# `<mo-flight-status>` — Flight status

> Element name `<mo-flight-status>` (default since 17.3); the legacy name `<usa-flight-status>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Origin and destination codes, a moving aircraft and an arrival estimate.

- **Category:** ui · **since** 17.5
- **Import:** `import { defineFlightStatus } from 'motionary/components/widgets'` then `defineFlightStatus();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `value`, `disabled`, `animated`, `running`, `origin`, `destination`, `from`, `to`, `departure`, `arrival`, `status`
- **Events:** `usa:action`, `usa:change`, `usa:tick`, `usa:complete`
- **Slots:** —
- **Methods:** `update()`, `play()`, `pause()`, `reset()`
- **Source:** [src/components/widgets/flight-status.ts](../../src/components/widgets/flight-status.ts)

## Minimal example

```html
<mo-flight-status value="68"></mo-flight-status>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineFlightStatus } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineFlightStatus(); // registers <mo-flight-status>

/* then use it in your HTML:
<mo-flight-status value="68"></mo-flight-status>
*/
```
