# `<mo-delivery-tracker>` — Delivery tracker

> Element name `<mo-delivery-tracker>` (default since 17.3); the legacy name `<usa-delivery-tracker>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Pickup progress, driver actions, or an out-for-delivery route map.

- **Category:** ui · **since** 17.5
- **Import:** `import { defineDeliveryTracker } from 'motionary/components/widgets'` then `defineDeliveryTracker();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `value`, `disabled`, `animated`, `running`, `stage`, `status-label`, `status`, `eta-label`, `eta`, `driver`, `call-label`, `message-label`
- **Events:** `usa:action`, `usa:change`, `usa:tick`, `usa:complete`
- **Slots:** —
- **Methods:** `update()`, `play()`, `pause()`, `reset()`
- **Source:** [src/components/widgets/delivery-tracker.ts](../../src/components/widgets/delivery-tracker.ts)

## Minimal example

```html
<mo-delivery-tracker value="34"></mo-delivery-tracker>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineDeliveryTracker } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineDeliveryTracker(); // registers <mo-delivery-tracker>

/* then use it in your HTML:
<mo-delivery-tracker value="34"></mo-delivery-tracker>
*/
```
