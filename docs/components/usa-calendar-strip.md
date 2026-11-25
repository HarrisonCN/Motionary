# `<mo-calendar-strip>` — Calendar strip

> Element name `<mo-calendar-strip>` (default since 17.3); the legacy name `<usa-calendar-strip>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A week of day buttons with paging, today marked and dots on busy days; arrow keys page past the ends.

- **Category:** ui · **since** 17.15
- **Import:** `import { defineCalendarStrip } from 'motionary/components/widgets'` then `defineCalendarStrip();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `value`, `start`, `days`, `week-start`, `marks`, `min`, `max`, `locale`, `label`, `prev-label`, `next-label`, `name`
- **Events:** `usa:page`, `usa:change`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/calendar-strip.ts](../../src/components/widgets/calendar-strip.ts)

## Minimal example

```html
<mo-calendar-strip value="2026-03-11" marks="2026-03-10,2026-03-13"></mo-calendar-strip>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineCalendarStrip } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineCalendarStrip(); // registers <mo-calendar-strip>

/* then use it in your HTML:
<mo-calendar-strip value="2026-03-11" marks="2026-03-10,2026-03-13"></mo-calendar-strip>
*/
```
