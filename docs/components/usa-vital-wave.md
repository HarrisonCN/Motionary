# `<mo-vital-wave>` — Vital dot wave

> Element name `<mo-vital-wave>` (default since 17.3); the legacy name `<usa-vital-wave>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A dot-and-stem waveform for supplied values, with configurable unit and period.

- **Category:** ui · **since** 17.5
- **Import:** `import { defineVitalWave } from 'motionary/components/widgets'` then `defineVitalWave();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `value`, `disabled`, `animated`, `running`, `values`, `unit`, `period`
- **Events:** `usa:action`, `usa:change`, `usa:tick`, `usa:complete`
- **Slots:** —
- **Methods:** `update()`, `play()`, `pause()`, `reset()`
- **Source:** [src/components/widgets/vital-wave.ts](../../src/components/widgets/vital-wave.ts)

## Minimal example

```html
<mo-vital-wave value="82" unit="mmhg" animated></mo-vital-wave>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineVitalWave } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineVitalWave(); // registers <mo-vital-wave>

/* then use it in your HTML:
<mo-vital-wave value="82" unit="mmhg" animated></mo-vital-wave>
*/
```
