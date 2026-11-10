# `<mo-code-export>` — Code export

> Element name `<mo-code-export>` (default since 17.3); the legacy name `<usa-code-export>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

8.9 low-code: shows copy-paste code (HTML, React, Vue or JSON) for a live, configured component next to it, follows its attribute changes and copies with one click.

- **Category:** ui · **since** 8.9 · **changed in** 13.1
- **Import:** `import { defineCodeExport } from 'motionary/components/widgets'` then `defineCodeExport();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `for`, `formats`
- **Events:** `usa:copy`
- **Slots:** —
- **Methods:** `copy()`
- **Source:** [src/components/widgets/code-export.ts](../../src/components/widgets/code-export.ts)

## Minimal example

```html
<usa-code-export formats="html,react,vue">
  <usa-star-rating value="4"></usa-star-rating>
</usa-code-export>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineCodeExport } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineCodeExport(); // registers <mo-code-export>

/* then use it in your HTML:
<mo-code-export formats="html,react,vue">
  <mo-star-rating value="4"></mo-star-rating>
</mo-code-export>
*/
```
