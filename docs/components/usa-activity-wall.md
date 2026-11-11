# `<mo-activity-wall>` — Live activity wall

> Element name `<mo-activity-wall>` (default since 17.3); the legacy name `<usa-activity-wall>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Drifting columns; pauses on hover, focus, hidden tabs and reduced motion.

- **Category:** ui · **since** 17.5
- **Import:** `import { defineActivityWall } from 'motionary/components/widgets'` then `defineActivityWall();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `paused`, `speed`, `label`
- **Events:** —
- **Slots:** —
- **Methods:** `play()`, `pause()`
- **Source:** [src/components/widgets/activity-wall.ts](../../src/components/widgets/activity-wall.ts)

## Minimal example

```html
<mo-activity-wall style="height:340px" paused><div data-column><div style="background:#050505;color:#9fe3d0;padding:24px;border-radius:24px">Flight · SFO → YEG</div></div><div data-column><div style="background:#050505;color:#f6b77a;padding:24px;border-radius:24px">Espresso · 18s</div></div></mo-activity-wall>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineActivityWall } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineActivityWall(); // registers <mo-activity-wall>

/* then use it in your HTML:
<mo-activity-wall style="height:340px" paused><div data-column><div style="background:#050505;color:#9fe3d0;padding:24px;border-radius:24px">Flight · SFO → YEG</div></div><div data-column><div style="background:#050505;color:#f6b77a;padding:24px;border-radius:24px">Espresso · 18s</div></div></mo-activity-wall>
*/
```
