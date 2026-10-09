# Performance metrics in CI (11.3)

Bundle-size budgets (`npm run size:check`) say how big a file is. Since 11.3 every PR also measures what a page
actually pays, in headless Chrome, against fixed budgets in [`perf/budgets.json`](../perf/budgets.json):

```bash
npm run build
npm run perf                # CHROME_PATH=/path/to/chrome to pick the browser; PERF_JSON=out.json to save the numbers
```

`scripts/perf-ci.mjs` needs Node ≥ 22 (global `WebSocket`) and talks to Chrome over the DevTools Protocol directly — no
Puppeteer / Playwright dependency. It serves the repository on a local port, records every file each page downloads,
and runs three fixture pages from [`perf/`](../perf/). CI runs it on Node 22 after the build; locally it is skipped when
no Chrome is found.

| Area | Page | Metrics (budget key) |
|---|---|---|
| First screen | `perf/first-screen.html` — `<usa-reveal>`, `<usa-typewriter>`, `<usa-counter>`, `<usa-button>` registered through `motionary/components/lazy` (on-demand loading) | gzip bytes of every JS / CSS file downloaded (`transferKB`), number of files (`requests`), script parse / compile / execute time from Chrome's `ScriptDuration` (`scriptMs`), time until all four are defined and painted (`readyMs`), console errors |
| GPU resources | `perf/gpu.html` — `<usa-gl-scene shape="torus" auto-rotate>` on `motionary/runtime/gl` | WebGL contexts (`contexts`), live textures / buffers / programs while it runs, and textures / buffers still alive after the element is removed (`leakedTextures`, `leakedBuffers`) — counted by wrapping the WebGL `create*` / `delete*` calls before any page script runs |
| Frame stability | `perf/frames.html` — 300 elements tweened by `motionary/runtime` for 2 s | idle frame interval of this browser (`baselineMs`), dropped frames relative to it (`droppedPct`), p95 frame time over the baseline (`p95OverBaselineMs`), longest frame, JS time per frame inside `requestAnimationFrame` callbacks (`scriptMsPerFrame` — the runtime's own cost), long tasks |

## Budgets

| Metric | Budget | First measurement (2-core sandbox, under load) |
|---|---|---|
| `first-screen.transferKB` | 56 | 45.7 KB gzip, 10 files |
| `first-screen.scriptMs` | 150 | 17–20 ms |
| `gpu.contexts` / `textures` / `buffers` / `programs` | 1 / 4 / 8 / 2 | 1 / 0 / 4 / 1 |
| `gpu.leakedTextures` / `leakedBuffers` | 0 / 0 | 0 / 0 |
| `frames.scriptMsPerFrame` | 8 | 3.8 ms |
| `frames.droppedPct` / `p95OverBaselineMs` | 75 / 100 | 49–68 % / 33–67 ms |

Frame-timing limits are deliberately coarse: CI renders with SwiftShader on shared runners, so dropped frames there say
more about the runner than about Motionary; they catch large regressions only. `scriptMsPerFrame` is the precise one.
Budgets are fixed — a regression fails the PR; raising a limit is a reviewed change to `perf/budgets.json`, never
automatic.
