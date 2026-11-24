# `<mo-three-dot-bounce>` — Three dot bounce

> Element name `<mo-three-dot-bounce>` (default since 17.3); the legacy name `<usa-three-dot-bounce>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Three dots hop in turn, the classic typing indicator.

- **Category:** ui · **since** 17.9
- **Import:** `import { defineThreeDotBounce } from 'motionary/components/widgets'` then `defineThreeDotBounce();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `paused`, `duration`
- **Events:** —
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/three-dot-bounce.ts](../../src/components/widgets/three-dot-bounce.ts)

## Minimal example

```html
<mo-three-dot-bounce></mo-three-dot-bounce>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineThreeDotBounce } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineThreeDotBounce(); // registers <mo-three-dot-bounce>

/* then use it in your HTML:
<mo-three-dot-bounce></mo-three-dot-bounce>
*/
```
