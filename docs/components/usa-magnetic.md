# `<mo-magnetic>` — Magnetic button

> Element name `<mo-magnetic>` (default since 17.3); the legacy name `<usa-magnetic>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Content leans toward the pointer when it comes near and springs back. Fine pointers only; off under reduced motion.

- **Category:** interaction · **since** 2.2
- **Import:** `import { defineMagnetic } from 'motionary/components/interaction'` then `defineMagnetic();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
- **Attributes:** `strength`, `radius`, `disabled`
- **Events:** —
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/interaction/magnetic.ts](../../src/components/interaction/magnetic.ts)

## Minimal example

```html
<usa-magnetic strength="0.4"><button>Hover near me</button></usa-magnetic>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineMagnetic } from 'motionary/components/interaction';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineMagnetic(); // registers <mo-magnetic>

/* then use it in your HTML:
<mo-magnetic strength="0.4"><button>Hover near me</button></mo-magnetic>
*/
```
