# `<mo-comparison-table>` — Comparison table

> Element name `<mo-comparison-table>` (default since 17.3); the legacy name `<usa-comparison-table>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A plain table gets check marks, a highlighted column with a badge, a sticky first column and an only-differences switch.

- **Category:** layout · **since** 17.15
- **Import:** `import { defineComparisonTable } from 'motionary/components/widgets'` then `defineComparisonTable();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `highlight`, `badge-label`, `diff-label`, `differences`, `label`
- **Events:** `usa:filter`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/comparison-table.ts](../../src/components/widgets/comparison-table.ts)

## Minimal example

```html
<mo-comparison-table highlight="2"><table><thead><tr><th>Feature</th><th>Free</th><th>Pro</th></tr></thead><tbody><tr><td>Projects</td><td>3</td><td>Unlimited</td></tr><tr><td>Export</td><td>yes</td><td>yes</td></tr><tr><td>Team seats</td><td>no</td><td>yes</td></tr></tbody></table></mo-comparison-table>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineComparisonTable } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineComparisonTable(); // registers <mo-comparison-table>

/* then use it in your HTML:
<mo-comparison-table highlight="2"><table><thead><tr><th>Feature</th><th>Free</th><th>Pro</th></tr></thead><tbody><tr><td>Projects</td><td>3</td><td>Unlimited</td></tr><tr><td>Export</td><td>yes</td><td>yes</td></tr><tr><td>Team seats</td><td>no</td><td>yes</td></tr></tbody></table></mo-comparison-table>
*/
```
