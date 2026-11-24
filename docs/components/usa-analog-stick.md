# `<mo-analog-stick>` — Analog stick

> Element name `<mo-analog-stick>` (default since 17.3); the legacy name `<usa-analog-stick>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Drag the cap with a rubbery pull past the rim; it springs home when let go. Arrow keys push it too.

- **Category:** gesture · **since** 17.9
- **Import:** `import { defineAnalogStick } from 'motionary/components/widgets'` then `defineAnalogStick();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `dead-zone`, `disabled`
- **Events:** `usa:move`, `usa:release`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/analog-stick.ts](../../src/components/widgets/analog-stick.ts)

## Minimal example

```html
<mo-analog-stick label="Move"></mo-analog-stick>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineAnalogStick } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineAnalogStick(); // registers <mo-analog-stick>

/* then use it in your HTML:
<mo-analog-stick label="Move"></mo-analog-stick>
*/
```
