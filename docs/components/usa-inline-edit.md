# `<mo-inline-edit>` — Inline edit

> Element name `<mo-inline-edit>` (default since 17.3); the legacy name `<usa-inline-edit>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Text that turns into a field when pressed; Enter saves with a flash, Escape puts it back.

- **Category:** ui · **since** 17.12
- **Import:** `import { defineInlineEdit } from 'motionary/components/widgets'` then `defineInlineEdit();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `value`, `label`, `placeholder`, `maxlength`, `allow-empty`
- **Events:** `usa:edit`, `usa:change`, `usa:cancel`
- **Slots:** —
- **Methods:** `edit()`
- **Source:** [src/components/widgets/inline-edit.ts](../../src/components/widgets/inline-edit.ts)

## Minimal example

```html
<mo-inline-edit label="Project name">Untitled project</mo-inline-edit>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineInlineEdit } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineInlineEdit(); // registers <mo-inline-edit>

/* then use it in your HTML:
<mo-inline-edit label="Project name">Untitled project</mo-inline-edit>
*/
```
