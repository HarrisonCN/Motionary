# `<usa-badge-wall>` — Badge wall

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

7.5: an achievement grid — locked badges are grey with a 🔒; unlock(name) flips a badge to its colour side with a shine and the “n / m unlocked” counter updates.

- **Category:** ui · **since** 7.5
- **Import:** `import { defineBadgeWall } from 'motionary/components/widgets'` then `defineBadgeWall();`
- **CDN:** `<script src="https://unpkg.com/motionary@10/dist/widgets.umd.js"></script>`
- **Attributes:** —
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
<script>wall.unlock('7-day streak');</script>
```

## ES module

```js
import { defineBadgeWall } from 'motionary/components/widgets';

defineBadgeWall(); // registers <usa-badge-wall>

/* then use it in your HTML:
<usa-badge-wall>
  <li data-icon="🏆">First win</li>
  <li data-icon="🔥" data-locked>7-day streak</li>
</usa-badge-wall>
*/
```
