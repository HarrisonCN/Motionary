# `<mo-pull-cord>` — Lamp pull-cord switch

> Element name `<mo-pull-cord>` (default since 17.3); the legacy name `<usa-pull-cord>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

6.8: pull the cord down and let go — past the threshold the lamp switches, and the cord swings back on a damped spring. Click, Space or Enter tug it too; role="switch".

- **Category:** click · **since** 6.8
- **Import:** `import { definePullCord } from 'motionary/components/widgets'` then `definePullCord();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `threshold`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** `toggle()`
- **Source:** [src/components/widgets/pull-cord.ts](../../src/components/widgets/pull-cord.ts)

## Minimal example

```html
<usa-pull-cord label="Desk lamp"></usa-pull-cord>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { definePullCord } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
definePullCord(); // registers <mo-pull-cord>

/* then use it in your HTML:
<mo-pull-cord label="Desk lamp"></mo-pull-cord>
*/
```
