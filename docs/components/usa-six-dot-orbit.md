# `<mo-six-dot-orbit>` — Six dot orbit

> Element name `<mo-six-dot-orbit>` (default since 17.3); the legacy name `<usa-six-dot-orbit>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Six dots chase round a small circle, each trailing the leader a little smaller.

- **Category:** ui · **since** 17.9
- **Import:** `import { defineSixDotOrbit } from 'motionary/components/widgets'` then `defineSixDotOrbit();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `paused`, `duration`
- **Events:** —
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/six-dot-orbit.ts](../../src/components/widgets/six-dot-orbit.ts)

## Minimal example

```html
<mo-six-dot-orbit></mo-six-dot-orbit>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineSixDotOrbit } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineSixDotOrbit(); // registers <mo-six-dot-orbit>

/* then use it in your HTML:
<mo-six-dot-orbit></mo-six-dot-orbit>
*/
```
