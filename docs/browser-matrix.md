# Browser matrix (13.1.0)

Motionary is tested in real browsers on every pull request: the Playwright suite in `test/browser/` runs on the built
package (`dist/`, through an import map that resolves `motionary/*` the way `package.json` `exports` does) in
**Chromium, Firefox and WebKit** (CI job `browser`, one matrix entry per engine).

```sh
npx playwright install --with-deps chromium firefox webkit   # once
npm run build
npm run test:browser                        # all three
npm run test:browser -- --project=firefox   # one engine
```

`CHROME_PATH=/path/to/chrome` runs the `chromium` project on another Chromium build (for platforms where Playwright ships
none, such as linux-arm64). Playwright is a devDependency only; nothing in the package depends on it.

## What the suite checks

| Spec | What it proves, in each browser |
|---|---|
| `lifecycle.spec.mjs` | Every public component in the AI manifest (209, minus the exclusions below), mounted from its documented example through its own manifest snippet: connect → disconnect leaves no listener on `window` / `document` / `<html>` / `<body>`, no interval, no observer on a detached node, no rAF loop, no live WebGL context; reconnect re-mounts to the same structure; every documented attribute can be set to an invalid value and back without an uncaught error. |
| `keyboard.spec.mjs` | Keyboard and ARIA patterns of every interactive component: tabs (roving tabindex, ←/→/Home/End, tabpanel), radio groups, sliders (`aria-valuenow`), switches, steppers, menus / popovers, carousels, modal overlays (focus moves in, Tab / Shift+Tab never reach the page behind, Esc closes, focus returns to the opener). |
| `motion.spec.mjs` | `prefers-reduced-motion` and each Motion Sensitivity level (`full` · `gentle` · `minimal` · `static`, docs/accessibility.md): every `Element.animate()` call is recorded and checked (no vestibular transforms under `gentle`, opacity only under `minimal`, nothing under `static`), and each interaction reaches the same end state in every mode. |
| `resources.spec.mjs` | The WebGL / Canvas / animation-loop components: which backend each picks in this browser (the GPU table below), mount / unmount 6× without contexts piling up, after the last disconnect no live context and no frame callback; image-effect components fall back cleanly when the image fails. |
| `perf.spec.mjs` | A complex page — 32 components from every family running at once — against `perf/browser-baseline.json`: mount time, p95 frame interval, native rAF calls per frame (the shared scheduler batches every loop into one), and a clean teardown. |

## GPU capability per browser

What the browser offers to the page (the `platform capabilities` test) and which backend the GPU components chose.
Measured on GitHub Actions `ubuntu-latest` (x64, headless, Playwright 1.64.0) for 13.1.0; the linux-arm64 development sandbox gave the same capabilities (Chromium 129 via `CHROME_PATH`). Backends are what each component reported (`data-backend` / `data-fallback`) or, where it reports none, what it created (WebGL contexts / canvases); "DOM / CSS" means no canvas at all. The CI job uploads the raw per-component records as `test-results/gpu-matrix/`.

| | Chromium | Firefox | WebKit |
|---|---|---|---|
| webgl2 | yes | no | yes |
| webgl | yes | no | yes |
| webgpu | no | no | no |
| offscreenCanvas | yes | yes | yes |
| loseContext | yes | no | yes |
| renderer | SwiftShader (ANGLE / Vulkan, software) | — | Apple GPU |

| Component | Chromium | Firefox | WebKit |
|---|---|---|---|
| `<usa-shader>` | WebGL (2 ctx) | fallback (webgl) | WebGL (2 ctx) |
| `<usa-distort>` | WebGL (1 ctx) | fallback (webgl) | WebGL (1 ctx) |
| `<usa-liquid>` | WebGL (1 ctx) | fallback (webgl) | WebGL (1 ctx) |
| `<usa-post-fx>` | WebGL (1 ctx) | fallback (webgl) | WebGL (1 ctx) |
| `<usa-gl-scene>` | webgl2 | no GL (backend none) | webgl2 |
| `<usa-gl-model>` | webgl2 | no GL (backend none) | webgl2 |
| `<usa-gpu-particles>` | canvas2d | canvas2d | canvas2d |
| `<usa-shader-backdrop>` | webgl2 | css | webgl2 |
| `<usa-physics-playground>` | Canvas 2D | Canvas 2D | Canvas 2D |
| `<usa-globe>` | DOM / CSS | DOM / CSS | DOM / CSS |
| `<usa-gen-art>` | Canvas 2D | Canvas 2D | Canvas 2D |
| `<usa-worker-canvas>` | worker | worker | worker |
| `<usa-particles>` | Canvas 2D | Canvas 2D | Canvas 2D |
| `<usa-blobs>` | DOM / CSS | DOM / CSS | DOM / CSS |
| `<usa-dot-network>` | Canvas 2D | Canvas 2D | Canvas 2D |
| `<usa-grid-glow>` | DOM / CSS | DOM / CSS | DOM / CSS |
| `<usa-water-ripple>` | Canvas 2D | Canvas 2D | Canvas 2D |
| `<usa-ambient>` | Canvas 2D | Canvas 2D | Canvas 2D |
| `<usa-gesture-fx>` | DOM / CSS | DOM / CSS | DOM / CSS |
| `<usa-skeleton-reveal>` | DOM / CSS | DOM / CSS | DOM / CSS |
| `<usa-lottie-player>` | Canvas 2D | Canvas 2D | Canvas 2D |
| `<usa-dotlottie>` | Canvas 2D | Canvas 2D | Canvas 2D |
| `<usa-audio>` | DOM / CSS | DOM / CSS | DOM / CSS |

The components degrade instead of failing: with no WebGL, `<usa-shader>` / `<usa-distort>` / `<usa-liquid>` /
`<usa-post-fx>` set `data-fallback="webgl"` and show their CSS / image fallback, `<usa-shader-backdrop>` uses its CSS
backdrop, `<usa-gl-scene>` / `<usa-gl-model>` report `data-backend="none"`, and `<usa-gpu-particles>` draws with Canvas 2D.
The resource checks still run in that case — they then prove that nothing was created and nothing leaks.

## Documented limitations

- **Firefox headless without WebGL.** Headless Firefox on a machine with no usable GL driver (the linux-arm64 sandbox;
  some CI images) exposes neither `webgl` nor `webgl2`. The WebGL components take their Canvas 2D / CSS fallback there,
  so Firefox runs cover the fallback path; the WebGL path is covered by Chromium and WebKit. This is the case on GitHub Actions `ubuntu-latest` too (Firefox reports no `webgl` / `webgl2` there), so in CI Firefox exercises the fallback paths for every WebGL component.
- **`<usa-rive>` is excluded** from the lifecycle sweep: it needs the optional peer `@rive-app/canvas` from npm / a CDN,
  and the suite runs offline. It is covered by unit tests and the component playground.
- **WebKit Tab order.** Like Safari, Playwright's WebKit skips buttons and links on Tab unless "Press Tab to highlight
  each item" is on; the keyboard spec presses Alt+Tab there (Safari's Option+Tab), which is what a keyboard user does.
- **Native `<dialog>` in WebKit** lets Tab leave the open modal for the browser's own UI; the assertion is "focus never
  reaches the page behind the modal", which holds in all three engines.
- **WebGPU** is not available to headless browsers in CI (`navigator.gpu` has no adapter); the suite records it but no
  component requires it.
- **Frame timing is environment-bound.** Headless browsers on shared CI machines render in software, so the perf budget
  is relative to the CI baseline with generous headroom (×3) plus absolute ceilings; it catches regressions such as an
  extra frame loop per component or a teardown that leaks, not small timing drift.
- **Perf limits are for CI.** On a slow machine without GPU acceleration (the linux-arm64 development sandbox) headless
  WebKit draws the 32-component page at about one frame per second (p95 ≈ 1 s), so `perf.spec.mjs` fails its frame-interval
  limit there while every functional check passes; run the perf spec on CI-class hardware.
- **Chromium build.** CI uses Playwright's Chromium; local runs on linux-arm64 use another Chromium build through
  `CHROME_PATH` (Playwright publishes no linux-arm64 Chromium).

## Results for 13.1.0

| | Chromium | Firefox | WebKit |
|---|---|---|---|
| CI (`ubuntu-latest`, PR #135) | 309 passed, 1 skipped | 308 passed, 2 skipped | 309 passed, 1 skipped |
| Local (linux-arm64 sandbox) | all functional pass ¹ | 308 passed, 2 skipped | 308 passed; perf frame interval over its limit ² |
| Complex page on CI — mount / p95 frame / rAF per frame | 703 ms / 33.4 ms / 1.22 | 738 ms / 17.1 ms / 1.32 | 1973 ms / 227 ms / 1.03 |
| Perf limit (max(ceiling, baseline × 3)) — mount / p95 | 6000 ms / 100 ms | 6000 ms / 51 ms | 6000 ms / 681 ms |

¹ Chromium 129 via `CHROME_PATH`; ² see "Perf limits are for CI". Skipped: `<usa-rive>` (all), and in Firefox the
image-fallback check, which needs WebGL.

On 13.0.2 the same suite failed 33 tests in Chromium, 23 in Firefox and 31 in WebKit (the bugs fixed in 13.1.0, see the
CHANGELOG). WebKit on Linux renders in software, hence its frame interval; the budget guards against regressions relative
to that, not against Safari on a Mac.
