# `<mo-gantt>` — Gantt timeline

> Element name `<mo-gantt>` (default since 17.3); the legacy name `<usa-gantt>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Task bars grow from their start dates with progress fills, dependency links and a today marker.

- **Category:** timeline · **since** 17.13
- **Import:** `import { defineGantt } from 'motionary/components/widgets'` then `defineGantt();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `today`, `label`, `today-label`, `done-label`
- **Events:** `usa:select`
- **Slots:** —
- **Methods:** `mount()`, `defineMoName()`
- **Source:** [src/components/widgets/gantt.ts](../../src/components/widgets/gantt.ts)

## Minimal example

```html
<mo-gantt today="2026-03-11"><ul><li data-start="2026-03-02" data-end="2026-03-06" data-progress="100">Research</li><li data-start="2026-03-07" data-end="2026-03-15" data-progress="60" data-after="1">Design</li><li data-start="2026-03-14" data-end="2026-03-24" data-progress="10" data-after="2">Build</li></ul></mo-gantt>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineGantt } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineGantt(); // registers <mo-gantt>

/* then use it in your HTML:
<mo-gantt today="2026-03-11"><ul><li data-start="2026-03-02" data-end="2026-03-06" data-progress="100">Research</li><li data-start="2026-03-07" data-end="2026-03-15" data-progress="60" data-after="1">Design</li><li data-start="2026-03-14" data-end="2026-03-24" data-progress="10" data-after="2">Build</li></ul></mo-gantt>
*/
```
