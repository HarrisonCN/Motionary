# `<mo-hold-action>` — Hold action

> Element name `<mo-hold-action>` (default since 17.3); the legacy name `<usa-hold-action>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Hold with a pointer, Space or Enter; release or Escape cancels. Emits an event only.

- **Category:** ui · **since** 17.6
- **Import:** `import { defineHoldAction } from 'motionary/components/widgets'` then `defineHoldAction();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `complete-label`, `duration`, `disabled`
- **Events:** `usa:cancel`, `usa:change`, `usa:confirm`
- **Slots:** —
- **Methods:** `reset()`, `cancel()`, `update()`
- **Source:** [src/components/widgets/hold-action.ts](../../src/components/widgets/hold-action.ts)

## Minimal example

```html
<mo-hold-action duration="800"></mo-hold-action>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineHoldAction } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineHoldAction(); // registers <mo-hold-action>

/* then use it in your HTML:
<mo-hold-action duration="800"></mo-hold-action>
*/
```
