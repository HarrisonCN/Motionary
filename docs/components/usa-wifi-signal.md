# `<mo-wifi-signal>` — Wi-Fi signal

> Element name `<mo-wifi-signal>` (default since 17.3); the legacy name `<usa-wifi-signal>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A dot and three arcs light up to the signal level, or sweep outward while searching.

- **Category:** ui · **since** 17.9
- **Import:** `import { defineWifiSignal } from 'motionary/components/widgets'` then `defineWifiSignal();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `level`, `searching`, `label`
- **Events:** —
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/wifi-signal.ts](../../src/components/widgets/wifi-signal.ts)

## Minimal example

```html
<mo-wifi-signal level="2"></mo-wifi-signal> <mo-wifi-signal searching></mo-wifi-signal>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineWifiSignal } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineWifiSignal(); // registers <mo-wifi-signal>

/* then use it in your HTML:
<mo-wifi-signal level="2"></mo-wifi-signal> <mo-wifi-signal searching></mo-wifi-signal>
*/
```
