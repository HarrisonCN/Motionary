# `<mo-breadcrumbs>` — Breadcrumbs (animated, collapsing)

> Element name `<mo-breadcrumbs>` (default since 17.3); the legacy name `<usa-breadcrumbs>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

17.3: crumbs slide in and out as you navigate (set(items) keeps the shared prefix), and a long trail collapses its middle into "…" that expands with a stagger. Navigation landmark, aria-current on the last crumb, CSS-only separators. Reduced motion: crumbs change without sliding.

- **Category:** ui · **since** 17.3
- **Import:** `import { defineBreadcrumbs } from 'motionary/components/widgets'` then `defineBreadcrumbs();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `max`
- **Events:** `usa:expand`
- **Slots:** —
- **Methods:** `set()`, `expand()`
- **Source:** [src/components/widgets/breadcrumbs.ts](../../src/components/widgets/breadcrumbs.ts)

## Minimal example

```html
<mo-breadcrumbs max="4">
  <a href="/">Home</a>
  <a href="/docs">Docs</a>
  <a href="/docs/components">Components</a>
  <a href="/docs/components/nav">Navigation</a>
  <span>Breadcrumbs</span>
</mo-breadcrumbs>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineBreadcrumbs } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineBreadcrumbs(); // registers <mo-breadcrumbs>

/* then use it in your HTML:
<mo-breadcrumbs max="4">
  <a href="/">Home</a>
  <a href="/docs">Docs</a>
  <a href="/docs/components">Components</a>
  <a href="/docs/components/nav">Navigation</a>
  <span>Breadcrumbs</span>
</mo-breadcrumbs>
*/
```
