# `<mo-micro-switch>` — Micro switch

> Element name `<mo-micro-switch>` (default since 17.3); the legacy name `<usa-micro-switch>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A switch whose knob carries its speed: it stretches as it travels, can be dragged with rubber-band ends and flicked.

- **Category:** ui · **since** 17.16
- **Import:** `import { defineMicroSwitch } from 'motionary/components/widgets'` then `defineMicroSwitch();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `checked`, `disabled`, `label`, `name`, `value`, `size`, `feel`, `haptics`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** `toggle()`
- **Source:** [src/components/widgets/micro-switch.ts](../../src/components/widgets/micro-switch.ts)

## Minimal example

```html
<mo-micro-switch label="Wi-Fi" checked></mo-micro-switch>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineMicroSwitch } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineMicroSwitch(); // registers <mo-micro-switch>

/* then use it in your HTML:
<mo-micro-switch label="Wi-Fi" checked></mo-micro-switch>
*/
```
