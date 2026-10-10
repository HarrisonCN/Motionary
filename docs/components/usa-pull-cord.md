# `<usa-pull-cord>` — Lamp pull-cord switch

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

6.8: pull the cord down and let go — past the threshold the lamp switches, and the cord swings back on a damped spring. Click, Space or Enter tug it too; role="switch".

- **Category:** click · **since** 6.8
- **Import:** `import { definePullCord } from 'motionary/components/widgets'` then `definePullCord();`
- **CDN:** `<script src="https://unpkg.com/motionary@13/dist/widgets.umd.js"></script>`
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
import { definePullCord } from 'motionary/components/widgets';

definePullCord(); // registers <usa-pull-cord>

/* then use it in your HTML:
<usa-pull-cord label="Desk lamp"></usa-pull-cord>
*/
```
