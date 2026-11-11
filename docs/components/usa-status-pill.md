# `<mo-status-pill>` — Status pill

> Element name `<mo-status-pill>` (default since 17.3); the legacy name `<usa-status-pill>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A compact metric with a built-in symbol and color tone.

- **Category:** ui · **since** 17.5
- **Import:** `import { defineStatusPill } from 'motionary/components/widgets'` then `defineStatusPill();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `value`, `disabled`, `animated`, `running`, `icon`, `unit`, `status`, `tone`
- **Events:** `usa:action`, `usa:change`, `usa:tick`, `usa:complete`
- **Slots:** —
- **Methods:** `update()`, `play()`, `pause()`, `reset()`
- **Source:** [src/components/widgets/status-pill.ts](../../src/components/widgets/status-pill.ts)

## Minimal example

```html
<mo-status-pill value="88" icon="heart" tone="pink" unit=""></mo-status-pill>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineStatusPill } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineStatusPill(); // registers <mo-status-pill>

/* then use it in your HTML:
<mo-status-pill value="88" icon="heart" tone="pink" unit=""></mo-status-pill>
*/
```
