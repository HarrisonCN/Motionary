# `<mo-triple-pulse>` — Triple pulse

> Element name `<mo-triple-pulse>` (default since 17.3); the legacy name `<usa-triple-pulse>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Three rings ripple out from a dot and fade.

- **Category:** ui · **since** 17.9
- **Import:** `import { defineTriplePulse } from 'motionary/components/widgets'` then `defineTriplePulse();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `paused`, `duration`
- **Events:** —
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/triple-pulse.ts](../../src/components/widgets/triple-pulse.ts)

## Minimal example

```html
<mo-triple-pulse></mo-triple-pulse>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineTriplePulse } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineTriplePulse(); // registers <mo-triple-pulse>

/* then use it in your HTML:
<mo-triple-pulse></mo-triple-pulse>
*/
```
