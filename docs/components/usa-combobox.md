# `<mo-combobox>` — Search combobox

> Element name `<mo-combobox>` (default since 17.3); the legacy name `<usa-combobox>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Filter choices, navigate enabled results with arrows and keep input focus.

- **Category:** ui · **since** 17.7
- **Import:** `import { defineCombobox } from 'motionary/components/widgets'` then `defineCombobox();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `hint`, `value`, `options`, `name`, `placeholder`, `required`, `disabled`
- **Events:** `usa:change`, `usa:query`
- **Slots:** —
- **Methods:** `show()`, `changed()`, `mount()`, `formReset()`
- **Source:** [src/components/widgets/combobox.ts](../../src/components/widgets/combobox.ts)

## Minimal example

```html
<mo-combobox label="Find a collection" name="collection" options='[{"value":"editorial","label":"Editorial"},{"value":"portrait","label":"Portrait"},{"value":"travel","label":"Travel"},{"value":"archive","label":"Archive","disabled":true}]'></mo-combobox>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineCombobox } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineCombobox(); // registers <mo-combobox>

/* then use it in your HTML:
<mo-combobox label="Find a collection" name="collection" options='[{"value":"editorial","label":"Editorial"},{"value":"portrait","label":"Portrait"},{"value":"travel","label":"Travel"},{"value":"archive","label":"Archive","disabled":true}]'></mo-combobox>
*/
```
