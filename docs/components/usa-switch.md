# `<usa-switch>` — Toggle switch variants

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

6.7: four switches — iOS (the thumb stretches while pressed), day / night (sun becomes moon, stars appear), bounce (squash at the end) and liquid (a gooey fill pours in). role="switch", forms, keyboard.

- **Category:** click · **since** 6.7 · **changed in** 6.9, 7.0
- **Import:** `import { defineSwitch } from 'motionary/components/widgets'` then `defineSwitch();`
- **CDN:** `<script src="https://unpkg.com/motionary@13/dist/widgets.umd.js"></script>`
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
import { defineSwitch } from 'motionary/components/widgets';

defineSwitch(); // registers <usa-switch>

/* then use it in your HTML:
<usa-switch variant="daynight" name="dark" label="Dark mode"></usa-switch>
*/
```
