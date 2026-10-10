# `<usa-clock-control>` — Motion clock control

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

8.0: a pause / speed bar for the unified motion clock — pause, slow down or speed up every Motionary animation and frame loop on the page at once (motionClock in motionary/engine).

- **Category:** ui · **since** 8.0
- **Import:** `import { defineClockControl } from 'motionary/components/widgets'` then `defineClockControl();`
- **CDN:** `<script src="https://unpkg.com/motionary@13/dist/widgets.umd.js"></script>`
- **Attributes:** `speeds`, `label`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/clock-control.ts](../../src/components/widgets/clock-control.ts)

## Minimal example

```html
<usa-clock-control speeds="0.25,0.5,1,2"></usa-clock-control>
<script type="module">
import { motionClock, createTimeline } from 'motionary/engine';
motionClock.rate = 0.5;
createTimeline().add(a, [{ opacity: 0 }, { opacity: 1 }], 400).add(b, [{ transform: 'scale(0)' }, { transform: 'none' }], 500, '-=200').play();
</script>
```

## ES module

```js
import { defineClockControl } from 'motionary/components/widgets';

defineClockControl(); // registers <usa-clock-control>

/* then use it in your HTML:
<usa-clock-control speeds="0.25,0.5,1,2"></usa-clock-control>
*/
```
