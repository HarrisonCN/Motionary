# `<mo-meter-countdown>` — Meter countdown

> Element name `<mo-meter-countdown>` (default since 17.3); the legacy name `<usa-meter-countdown>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A determinate ring and optional visible-only remaining-time clock.

- **Category:** ui · **since** 17.5
- **Import:** `import { defineMeterCountdown } from 'motionary/components/widgets'` then `defineMeterCountdown();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `value`, `disabled`, `animated`, `running`, `max`, `title`
- **Events:** `usa:action`, `usa:change`, `usa:tick`, `usa:complete`
- **Slots:** —
- **Methods:** `update()`, `play()`, `pause()`, `reset()`
- **Source:** [src/components/widgets/meter-countdown.ts](../../src/components/widgets/meter-countdown.ts)

## Minimal example

```html
<mo-meter-countdown value="81" max="120"></mo-meter-countdown>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineMeterCountdown } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineMeterCountdown(); // registers <mo-meter-countdown>

/* then use it in your HTML:
<mo-meter-countdown value="81" max="120"></mo-meter-countdown>
*/
```
