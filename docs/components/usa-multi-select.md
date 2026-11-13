# `<mo-multi-select>` — Token multi-select

> Element name `<mo-multi-select>` (default since 17.3); the legacy name `<usa-multi-select>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Filter native checkboxes, remove tokens and submit multiple form values.

- **Category:** ui · **since** 17.7
- **Import:** `import { defineMultiSelect } from 'motionary/components/widgets'` then `defineMultiSelect();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `hint`, `values`, `options`, `name`, `max`, `disabled`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** `reset()`, `changed()`, `mount()`, `formReset()`
- **Source:** [src/components/widgets/multi-select.ts](../../src/components/widgets/multi-select.ts)

## Minimal example

```html
<mo-multi-select label="Interests" name="interests" values='["portrait"]' max="3" options='[{"value":"editorial","label":"Editorial"},{"value":"portrait","label":"Portrait"},{"value":"travel","label":"Travel"},{"value":"archive","label":"Archive","disabled":true}]'></mo-multi-select>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineMultiSelect } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineMultiSelect(); // registers <mo-multi-select>

/* then use it in your HTML:
<mo-multi-select label="Interests" name="interests" values='["portrait"]' max="3" options='[{"value":"editorial","label":"Editorial"},{"value":"portrait","label":"Portrait"},{"value":"travel","label":"Travel"},{"value":"archive","label":"Archive","disabled":true}]'></mo-multi-select>
*/
```
