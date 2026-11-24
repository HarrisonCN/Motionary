# `<mo-eclipse-toggle>` — Eclipse toggle

> Element name `<mo-eclipse-toggle>` (default since 17.3); the legacy name `<usa-eclipse-toggle>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A sun slides behind a moon as the switch turns on; a native switch button underneath.

- **Category:** ui · **since** 17.9
- **Import:** `import { defineEclipseToggle } from 'motionary/components/widgets'` then `defineEclipseToggle();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `checked`, `label`, `disabled`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** `toggle()`
- **Source:** [src/components/widgets/eclipse-toggle.ts](../../src/components/widgets/eclipse-toggle.ts)

## Minimal example

```html
<mo-eclipse-toggle label="Night mode"></mo-eclipse-toggle>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineEclipseToggle } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineEclipseToggle(); // registers <mo-eclipse-toggle>

/* then use it in your HTML:
<mo-eclipse-toggle label="Night mode"></mo-eclipse-toggle>
*/
```
