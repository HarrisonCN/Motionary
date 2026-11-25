# `<mo-slope-chart>` — Slope chart

> Element name `<mo-slope-chart>` (default since 17.3); the legacy name `<usa-slope-chart>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Lines from before to after show rises and falls; end labels never overlap and each item reports its change.

- **Category:** svg · **since** 17.15
- **Import:** `import { defineSlopeChart } from 'motionary/components/widgets'` then `defineSlopeChart();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `before`, `after`, `labels`, `from-label`, `to-label`, `unit`, `label`
- **Events:** `usa:select`
- **Slots:** —
- **Methods:** `mount()`, `el()`, `el()`, `el()`, `el()`, `el()`, `el()`, `el()`, `el()`, `el()`, `focus()`, `defineMoName()`
- **Source:** [src/components/widgets/slope-chart.ts](../../src/components/widgets/slope-chart.ts)

## Minimal example

```html
<mo-slope-chart before="42,35,28,20" after="38,44,25,31" labels="Chrome,Safari,Firefox,Edge" from-label="2024" to-label="2025"></mo-slope-chart>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineSlopeChart } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineSlopeChart(); // registers <mo-slope-chart>

/* then use it in your HTML:
<mo-slope-chart before="42,35,28,20" after="38,44,25,31" labels="Chrome,Safari,Firefox,Edge" from-label="2024" to-label="2025"></mo-slope-chart>
*/
```
