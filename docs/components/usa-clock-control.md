# `<mo-clock-control>` — Motion clock control

> Element name `<mo-clock-control>` (default since 17.3); the legacy name `<usa-clock-control>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

8.0: a pause / speed bar for the unified motion clock — pause, slow down or speed up every Motionary animation and frame loop on the page at once (motionClock in motionary/engine).

- **Category:** ui · **since** 8.0
- **Import:** `import { defineClockControl } from 'motionary/components/widgets'` then `defineClockControl();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `speeds`, `label`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/clock-control.ts](../../src/components/widgets/clock-control.ts)

## Minimal example

```html
<usa-clock-control speeds="0.25,0.5,1,2"></usa-clock-control>
<div class="box">A</div> <div class="box">B</div>
<script type="module">
import { motionClock, createTimeline } from 'motionary/engine';
motionClock.rate = 0.5;
const [a, b] = document.querySelectorAll('.box');
createTimeline().add(a, [{ opacity: 0 }, { opacity: 1 }], 400).add(b, [{ transform: 'scale(0)' }, { transform: 'none' }], 500, '-=200').play();
</script>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineClockControl } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineClockControl(); // registers <mo-clock-control>

/* then use it in your HTML:
<mo-clock-control speeds="0.25,0.5,1,2"></mo-clock-control>
<div class="box">A</div> <div class="box">B</div>
*/
```
