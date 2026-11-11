# `<mo-ride-status>` — Ride status

> Element name `<mo-ride-status>` (default since 17.3); the legacy name `<usa-ride-status>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Drop-off status, progress and driver actions.

- **Category:** ui · **since** 17.5
- **Import:** `import { defineRideStatus } from 'motionary/components/widgets'` then `defineRideStatus();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `value`, `disabled`, `animated`, `running`, `status`, `driver`
- **Events:** `usa:action`, `usa:change`, `usa:tick`, `usa:complete`
- **Slots:** —
- **Methods:** `update()`, `play()`, `pause()`, `reset()`
- **Source:** [src/components/widgets/ride-status.ts](../../src/components/widgets/ride-status.ts)

## Minimal example

```html
<mo-ride-status value="48"></mo-ride-status>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineRideStatus } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineRideStatus(); // registers <mo-ride-status>

/* then use it in your HTML:
<mo-ride-status value="48"></mo-ride-status>
*/
```
