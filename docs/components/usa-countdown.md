# `<usa-countdown>` — Flip countdown

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

7.3: a split-flap countdown to a date (to) or for a number of seconds — every digit flips when it changes; fires usa:done at zero. The timer label updates once a minute so screen readers are not flooded.

- **Category:** ui · **since** 7.3
- **Import:** `import { defineCountdown } from 'motionary/components/widgets'` then `defineCountdown();`
- **CDN:** `<script src="https://unpkg.com/motionary@10/dist/widgets.umd.js"></script>`
- **Attributes:** `to`, `seconds`
- **Events:** `usa:tick`, `usa:done`
- **Slots:** —
- **Methods:** `start()`, `stop()`
- **Source:** [src/components/widgets/countdown.ts](../../src/components/widgets/countdown.ts)

## Minimal example

```html
<usa-countdown to="2026-12-24T00:00:00" units="d,h,m,s"></usa-countdown>
```

## ES module

```js
import { defineCountdown } from 'motionary/components/widgets';

defineCountdown(); // registers <usa-countdown>

/* then use it in your HTML:
<usa-countdown to="2026-12-24T00:00:00" units="d,h,m,s"></usa-countdown>
*/
```
