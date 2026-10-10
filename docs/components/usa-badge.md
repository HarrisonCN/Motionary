# `<usa-badge>` — Badge

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Count or dot badge that bumps with a spring when its value changes; 99+ capping, optional pulse.

- **Category:** ui
- **Import:** `import { defineBadge } from 'motionary/components/ui'` then `defineBadge();`
- **CDN:** `<script src="https://unpkg.com/motionary@12/dist/components.umd.js"></script>`
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
import { defineBadge } from 'motionary/components/ui';

defineBadge(); // registers <usa-badge>

/* then use it in your HTML:
<usa-badge value="3">
  <button>Inbox</button>
</usa-badge>
*/
```
