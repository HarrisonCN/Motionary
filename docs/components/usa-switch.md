# `<mo-switch>` — Toggle switch variants

> Element name `<mo-switch>` (default since 17.3); the legacy name `<usa-switch>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

6.7: four switches — iOS (the thumb stretches while pressed), day / night (sun becomes moon, stars appear), bounce (squash at the end) and liquid (a gooey fill pours in). role="switch", forms, keyboard.

- **Category:** click · **since** 6.7 · **changed in** 6.9, 7.0, 13.1, 13.5
- **Import:** `import { defineSwitch } from 'motionary/components/widgets'` then `defineSwitch();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `variant`, `label`, `name`, `value`, `disabled`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** `toggle()`
- **Source:** [src/components/widgets/switch.ts](../../src/components/widgets/switch.ts)

## Minimal example

```html
<usa-switch variant="daynight" name="dark" label="Dark mode"></usa-switch>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineSwitch } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineSwitch(); // registers <mo-switch>

/* then use it in your HTML:
<mo-switch variant="daynight" name="dark" label="Dark mode"></mo-switch>
*/
```
