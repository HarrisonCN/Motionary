# `<mo-workout-player>` — Workout player

> Element name `<mo-workout-player>` (default since 17.3); the legacy name `<usa-workout-player>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Elapsed time, distance, waveform and keyboard-accessible playback actions.

- **Category:** ui · **since** 17.5
- **Import:** `import { defineWorkoutPlayer } from 'motionary/components/widgets'` then `defineWorkoutPlayer();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `value`, `disabled`, `animated`, `running`, `distance`, `unit`, `reset-label`, `target-label`
- **Events:** `usa:action`, `usa:change`, `usa:tick`, `usa:complete`
- **Slots:** —
- **Methods:** `update()`, `play()`, `pause()`, `reset()`
- **Source:** [src/components/widgets/workout-player.ts](../../src/components/widgets/workout-player.ts)

## Minimal example

```html
<mo-workout-player value="1515" animated></mo-workout-player>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineWorkoutPlayer } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineWorkoutPlayer(); // registers <mo-workout-player>

/* then use it in your HTML:
<mo-workout-player value="1515" animated></mo-workout-player>
*/
```
