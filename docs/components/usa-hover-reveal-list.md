# `<mo-hover-reveal-list>` — Hover reveal list

> Element name `<mo-hover-reveal-list>` (default since 17.3); the legacy name `<usa-hover-reveal-list>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A big link list where a picture follows the pointer on a spring and leans with its speed.

- **Category:** cards · **since** 17.10
- **Import:** `import { defineHoverRevealList } from 'motionary/components/widgets'` then `defineHoverRevealList();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `size`, `tilt`, `label`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/hover-reveal-list.ts](../../src/components/widgets/hover-reveal-list.ts)

## Minimal example

```html
<mo-hover-reveal-list><a href="#" data-image="assets/demo-photo.jpg">Studio</a><a href="#" data-image="assets/demo-photo.jpg">Journal</a></mo-hover-reveal-list>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineHoverRevealList } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineHoverRevealList(); // registers <mo-hover-reveal-list>

/* then use it in your HTML:
<mo-hover-reveal-list><a href="#" data-image="assets/demo-photo.jpg">Studio</a><a href="#" data-image="assets/demo-photo.jpg">Journal</a></mo-hover-reveal-list>
*/
```
