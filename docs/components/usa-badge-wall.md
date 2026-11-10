# `<mo-badge-wall>` — Badge wall

> Element name `<mo-badge-wall>` (default since 17.3); the legacy name `<usa-badge-wall>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

7.5: an achievement grid — locked badges are grey with a 🔒; unlock(name) flips a badge to its colour side with a shine and the “n / m unlocked” counter updates.

- **Category:** ui · **since** 7.5
- **Import:** `import { defineBadgeWall } from 'motionary/components/widgets'` then `defineBadgeWall();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`
- **Events:** `usa:unlock`
- **Slots:** —
- **Methods:** `unlock()`
- **Source:** [src/components/widgets/badge-wall.ts](../../src/components/widgets/badge-wall.ts)

## Minimal example

```html
<usa-badge-wall>
  <li data-icon="🏆">First win</li>
  <li data-icon="🔥" data-locked>7-day streak</li>
</usa-badge-wall>
<script>addEventListener('DOMContentLoaded', () => { const wall = document.querySelector('usa-badge-wall'); wall.unlock('7-day streak'); });</script>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineBadgeWall } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineBadgeWall(); // registers <mo-badge-wall>

/* then use it in your HTML:
<mo-badge-wall>
  <li data-icon="🏆">First win</li>
  <li data-icon="🔥" data-locked>7-day streak</li>
</mo-badge-wall>
*/
```
