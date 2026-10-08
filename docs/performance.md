# Performance (4.5)

## One frame loop
Every `<usa-*>` loop (cursors, particles, springs, marquees, WebGL, scroll effects…) schedules work through **one shared `requestAnimationFrame`**: callbacks registered during a frame run together, in order, and a throwing callback no longer starves the rest. Use it for your own loops:

```ts
import { onFrame, schedulerStats } from 'use-scroll-animate/components/perf';
const stop = onFrame((time, dt) => { /* … */ });
schedulerStats(); // { frames, callbacks, peak, pending, loops }
```

## Animation budget & auto-degrade
- `setAnimationBudget(n)` caps concurrent component animations; extra ones land on their final frame instantly. `activeAnimations()` reports the current count.
- `autoDegrade({ minFps = 45, maxActive = 40, sample = 1000, patience = 2, recovery = 3 })` samples the frame rate and animation count. After `patience` bad samples it sets motion intensity to `low` and the budget to `maxActive / 2`; after `recovery` good samples it restores both. Dispatches `usa:degrade` (`{ degraded, fps, active, reason }`).

## On-demand CSS — `use-scroll-animate/components/lite`
Same API as `use-scroll-animate/components`, but the light-DOM CSS is **not** inlined: the first time an element of a category connects, `dist/components/<category>.css` is added as a `<link>` (custom tag names fall back to `components.css`). Shadow-DOM styles stay inlined.

| Import | gzip |
|---|---|
| `use-scroll-animate/components` (everything, CSS inlined) | ≈ 79 KB |
| `use-scroll-animate/components/lite` (everything, CSS on demand) | **≈ 62 KB** (budget 70 KB, checked in CI) |

Serve the CSS from somewhere else with `onDemandStyles('https://cdn.example/use-scroll-animate@6/dist/')`, or preload with `loadCategoryStyles('cards', base)`.
