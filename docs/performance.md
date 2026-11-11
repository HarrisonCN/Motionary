# Performance (4.5)

> 11.3: what a page pays (first-screen transfer, script time, GPU resources, frame stability) is measured in CI against fixed budgets — see [perf-ci.md](./perf-ci.md).

## One frame loop
Every `<usa-*>` loop (cursors, particles, springs, marquees, WebGL, scroll effects…) schedules work through **one shared `requestAnimationFrame`**: callbacks registered during a frame run together, in order, and a throwing callback no longer starves the rest. Use it for your own loops:

```ts
import { onFrame, schedulerStats } from 'motionary/components/perf';
const stop = onFrame((time, dt) => { /* … */ });
schedulerStats(); // { frames, callbacks, peak, pending, loops }
```

## Animation budget & auto-degrade
- `setAnimationBudget(n)` caps concurrent component animations; extra ones land on their final frame instantly. `activeAnimations()` reports the current count.
- `autoDegrade({ minFps = 45, maxActive = 40, sample = 1000, patience = 2, recovery = 3 })` samples the frame rate and animation count. After `patience` bad samples it sets motion intensity to `low` and the budget to `maxActive / 2`; after `recovery` good samples it restores both. Dispatches `usa:degrade` (`{ degraded, fps, active, reason }`).

## On-demand CSS — `motionary/components/lite`
Same API as `motionary/components`, but the light-DOM CSS is **not** inlined: the first time an element of a category connects, `dist/components/<category>.css` is added as a `<link>` (custom tag names fall back to `components.css`). Shadow-DOM styles stay inlined. With `defineMoAliases()` from `motionary/components/mo`, a
`<mo-press>` and a `<usa-press>` share one request for `components/interaction.css`. If that request fails, the next
mount or explicit `loadCategoryStyles()` call retries it. To let the alias entry read and copy selectors from linked CSS,
serve the stylesheet from the same origin as the page.

The [size report](./size-report.json) records the gzip sizes of both imports for this release. Import sizes are measured without enforced caps; see [size policy](size-policy.md).

Serve the CSS from somewhere else with `onDemandStyles('https://cdn.example/motionary@17/dist/')`, or preload with `loadCategoryStyles('cards', base)`.
