# `<mo-like>` — Like button

> Element name `<mo-like>` (default since 17.3); the legacy name `<usa-like>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A heart that pops with a spring and bursts into particles; aria-pressed, optional count.

- **Category:** click · **since** 2.5
- **Import:** `import { defineLike } from 'motionary/components/click'` then `defineLike();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
- **Attributes:** `liked`, `count`, `label`, `disabled`, `size`, `color`, `haptic`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** `toggle()`
- **Source:** [src/components/click/like.ts](../../src/components/click/like.ts)

## Minimal example

```html
<usa-like count="128"></usa-like>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineLike } from 'motionary/components/click';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineLike(); // registers <mo-like>

/* then use it in your HTML:
<mo-like count="128"></mo-like>
*/
```
