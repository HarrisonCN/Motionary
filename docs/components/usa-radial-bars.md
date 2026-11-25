# `<mo-radial-bars>` — Radial bars

> Element name `<mo-radial-bars>` (default since 17.3); the legacy name `<usa-radial-bars>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Concentric three-quarter rings draw in like an activity tracker; the legend picks a ring.

- **Category:** svg · **since** 17.15
- **Import:** `import { defineRadialBars } from 'motionary/components/widgets'` then `defineRadialBars();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `values`, `max`, `labels`, `colors`, `unit`, `label`, `size`
- **Events:** `usa:select`
- **Slots:** —
- **Methods:** `mount()`, `defineMoName()`
- **Source:** [src/components/widgets/radial-bars.ts](../../src/components/widgets/radial-bars.ts)

## Minimal example

```html
<mo-radial-bars values="72,48,90" labels="Move,Exercise,Stand" unit="%"></mo-radial-bars>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineRadialBars } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineRadialBars(); // registers <mo-radial-bars>

/* then use it in your HTML:
<mo-radial-bars values="72,48,90" labels="Move,Exercise,Stand" unit="%"></mo-radial-bars>
*/
```
