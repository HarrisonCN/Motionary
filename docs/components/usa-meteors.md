# `<mo-meteors>` — Meteor shower

> Element name `<mo-meteors>` (default since 17.3); the legacy name `<usa-meteors>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Thin meteors streak across a section behind its content; they stop off screen.

- **Category:** background · **since** 17.12
- **Import:** `import { defineMeteors } from 'motionary/components/widgets'` then `defineMeteors();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `count`, `angle`, `color`, `speed`
- **Events:** —
- **Slots:** —
- **Methods:** `mount()`, `defineMoName()`
- **Source:** [src/components/widgets/meteors.ts](../../src/components/widgets/meteors.ts)

## Minimal example

```html
<mo-meteors count="16"><h3>Night launch</h3></mo-meteors>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineMeteors } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineMeteors(); // registers <mo-meteors>

/* then use it in your HTML:
<mo-meteors count="16"><h3>Night launch</h3></mo-meteors>
*/
```
