# `<mo-gauge>` — Spring gauge

> Element name `<mo-gauge>` (default since 17.3); the legacy name `<usa-gauge>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

7.2: a semicircular gauge — the needle swings to the value on a damped spring (overshoot, settle), the arc fills in the colour of its zone and the number counts. role="meter".

- **Category:** ui · **since** 7.2 · **changed in** 7.5
- **Import:** `import { defineGauge } from 'motionary/components/widgets'` then `defineGauge();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `min`, `max`, `zones`, `unit`, `label`, `value`
- **Events:** —
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/gauge.ts](../../src/components/widgets/gauge.ts)

## Minimal example

```html
<usa-gauge value="72" unit="%" label="CPU" zones="60:#22c55e,85:#f59e0b,100:#ef4444"></usa-gauge>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineGauge } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineGauge(); // registers <mo-gauge>

/* then use it in your HTML:
<mo-gauge value="72" unit="%" label="CPU" zones="60:#22c55e,85:#f59e0b,100:#ef4444"></mo-gauge>
*/
```
