# `<mo-coffee-timer>` — Coffee timer

> Element name `<mo-coffee-timer>` (default since 17.3); the legacy name `<usa-coffee-timer>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

An orange segmented scale and an explicit start/stop elapsed-time clock.

- **Category:** ui · **since** 17.5
- **Import:** `import { defineCoffeeTimer } from 'motionary/components/widgets'` then `defineCoffeeTimer();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `value`, `disabled`, `animated`, `running`, `duration`, `drink`
- **Events:** `usa:action`, `usa:change`, `usa:tick`, `usa:complete`
- **Slots:** —
- **Methods:** `update()`, `play()`, `pause()`, `reset()`
- **Source:** [src/components/widgets/coffee-timer.ts](../../src/components/widgets/coffee-timer.ts)

## Minimal example

```html
<mo-coffee-timer value="18" duration="30"></mo-coffee-timer>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineCoffeeTimer } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineCoffeeTimer(); // registers <mo-coffee-timer>

/* then use it in your HTML:
<mo-coffee-timer value="18" duration="30"></mo-coffee-timer>
*/
```
