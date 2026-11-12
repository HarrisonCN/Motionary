# `<mo-select>` — Native select

> Element name `<mo-select>` (default since 17.3); the legacy name `<usa-select>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Native platform selection, optgroups, validation and form reset.

- **Category:** ui · **since** 17.7
- **Import:** `import { defineSelect } from 'motionary/components/widgets'` then `defineSelect();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `hint`, `value`, `options`, `name`, `placeholder`, `required`, `disabled`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** `reset()`, `changed()`, `mount()`
- **Source:** [src/components/widgets/select.ts](../../src/components/widgets/select.ts)

## Minimal example

```html
<mo-select label="Project type" name="project" value="editorial" options='[{"value":"editorial","label":"Editorial"},{"value":"portrait","label":"Portrait"},{"value":"travel","label":"Travel"},{"value":"archive","label":"Archive","disabled":true}]'></mo-select>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineSelect } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineSelect(); // registers <mo-select>

/* then use it in your HTML:
<mo-select label="Project type" name="project" value="editorial" options='[{"value":"editorial","label":"Editorial"},{"value":"portrait","label":"Portrait"},{"value":"travel","label":"Travel"},{"value":"archive","label":"Archive","disabled":true}]'></mo-select>
*/
```
