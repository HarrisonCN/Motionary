# `<mo-badge>` — Badge

> Element name `<mo-badge>` (default since 17.3); the legacy name `<usa-badge>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Count or dot badge that bumps with a spring when its value changes; 99+ capping, optional pulse.

- **Category:** ui · **since** 2.6
- **Import:** `import { defineBadge } from 'motionary/components/ui'` then `defineBadge();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
- **Attributes:** `value`, `max`, `dot`, `label`, `show-zero`
- **Events:** —
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/ui/badge.ts](../../src/components/ui/badge.ts)

## Minimal example

```html
<usa-badge value="3">
  <button>Inbox</button>
</usa-badge>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineBadge } from 'motionary/components/ui';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineBadge(); // registers <mo-badge>

/* then use it in your HTML:
<mo-badge value="3">
  <button>Inbox</button>
</mo-badge>
*/
```
