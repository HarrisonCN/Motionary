# `<mo-connect-beam>` — Connection beams

> Element name `<mo-connect-beam>` (default since 17.3); the legacy name `<usa-connect-beam>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Pulses of light travel along curved lines between named parts of a diagram.

- **Category:** svg · **since** 17.12
- **Import:** `import { defineConnectBeam } from 'motionary/components/widgets'` then `defineConnectBeam();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `links`, `curve`, `colors`, `duration`
- **Events:** —
- **Slots:** —
- **Methods:** `redraw()`
- **Source:** [src/components/widgets/connect-beam.ts](../../src/components/widgets/connect-beam.ts)

## Minimal example

```html
<mo-connect-beam links="app>api, api>db"><div style="display:flex;justify-content:space-between;gap:24px"><b data-node="app">App</b><b data-node="api">API</b><b data-node="db">DB</b></div></mo-connect-beam>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineConnectBeam } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineConnectBeam(); // registers <mo-connect-beam>

/* then use it in your HTML:
<mo-connect-beam links="app>api, api>db"><div style="display:flex;justify-content:space-between;gap:24px"><b data-node="app">App</b><b data-node="api">API</b><b data-node="db">DB</b></div></mo-connect-beam>
*/
```
