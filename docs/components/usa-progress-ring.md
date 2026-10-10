# `<usa-progress-ring>` — Progress ring / bar / gauge

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

6.4: the arc eases to every new value with a little overshoot while the label counts up; ring, bar or semicircle gauge, gradient strokes, indeterminate spinner without a value. role="progressbar", usa:complete at 100%.

- **Category:** feedback · **since** 6.4
- **Import:** `import { defineProgressRing } from 'motionary/components/widgets'` then `defineProgressRing();`
- **CDN:** `<script src="https://unpkg.com/motionary@13/dist/widgets.umd.js"></script>`
- **Attributes:** `variant`, `value`, `max`, `gradient`, `no-label`, `duration`
- **Events:** `usa:complete`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/meters.ts](../../src/components/widgets/meters.ts)

## Minimal example

```html
<usa-progress-ring value="72" gradient="#7c5cff,#22d3ee"></usa-progress-ring>
<usa-progress-ring variant="bar" value="40"></usa-progress-ring>
<usa-progress-ring variant="semi" value="88"></usa-progress-ring>
<!-- el.value = 90 animates to the new value -->
```

## ES module

```js
import { defineProgressRing } from 'motionary/components/widgets';

defineProgressRing(); // registers <usa-progress-ring>

/* then use it in your HTML:
<usa-progress-ring value="72" gradient="#7c5cff,#22d3ee"></usa-progress-ring>
<usa-progress-ring variant="bar" value="40"></usa-progress-ring>
<usa-progress-ring variant="semi" value="88"></usa-progress-ring>
<!-- el.value = 90 animates to the new value -->
*/
```
