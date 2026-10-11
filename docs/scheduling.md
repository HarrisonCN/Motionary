# Animation scheduling (13.4)

Every component loop runs on **one shared `requestAnimationFrame`** per frame (since 4.5). 13.4 adds a frame budget,
drop-on-detach, an optional offscreen / hidden-tab pause and long-task helpers.

## Shared scheduler (`motionary/components/perf`, also in `motionary/components` and lite)

| API | What it does |
| --- | --- |
| `onFrame(fn, el?)` | Runs `fn(time, dt)` every frame until the returned function is called. With an owner `el`, the loop does not run while `el` is detached. |
| `setFrameBudget(ms)` | Per-frame budget for queued one-shot callbacks (default 8 ms). Once a frame has used it, the rest wait for the next frame, oldest first — nothing starves. `Infinity` never splits a frame. |
| `schedulerStats()` | `{ frames, callbacks, peak, pending, loops, deferred, parked, budget }` — `deferred`: frames split by the budget; `parked`: callbacks / loops held by the pause plug-in or a detached owner. |

One-shot callbacks queued with an owner element are **dropped** once the owner is detached (no leak when a
component is removed without cancelling).

## Offscreen / hidden-tab pause (`motionary/components/offscreen`) — not in lite

```ts
import { installOffscreenPause, raf, caf, onFrame } from 'motionary/components/offscreen';
installOffscreenPause();            // idempotent; returns an uninstall function
const stop = onFrame(draw, canvas); // paused while `canvas` is off screen or the tab is hidden
```

- While the document is hidden every loop and callback waits; `visibilitychange` resumes them.
- A loop / callback with an owner element waits while the element is outside the viewport (one shared
  `IntersectionObserver`) and resumes when it scrolls back in.
- `raf` / `onFrame` from this module install the pause on first use. The widgets (`motionary/components/widgets`,
  `widgets.umd.js`, per-widget entries) and `<usa-story>` use them, so canvas / meter / globe / player loops stop
  off screen.
- **`motionary/components/lite` does not include it** (size budget: lite keeps the frame budget and drop-on-detach
  only). Import `motionary/components/offscreen` next to lite if you want the pause there.

## Long tasks (`motionary/components/perf-tasks`)

| API | What it does |
| --- | --- |
| `yieldToMain()` | Resolves on a fresh task: `scheduler.yield()` (Chromium 129+) → `MessageChannel` → `setTimeout(0)`. |
| `shouldYield(since, budget = 8)` | True when input is pending (`navigator.scheduling.isInputPending()`, where available) or `budget` ms have passed since `since`. |
| `runChunked(items, fn, { budget, signal })` | Calls `fn` for each item in slices that stay inside the budget and yields between slices; resolves `{ done, yields, aborted }`. |

## Performance baseline

See [perf-ci.md](perf-ci.md). The scheduler numbers are measured in Chromium with fixed CPU throttling
(not on real devices).
