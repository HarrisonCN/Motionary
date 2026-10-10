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
"CI" is GitHub Actions `ubuntu-latest` (x64, headless, software GL); "local" is the linux-arm64 development sandbox.

CI_GPU_TABLE

The components degrade instead of failing: with no WebGL, `<usa-shader>` / `<usa-distort>` / `<usa-liquid>` /
`<usa-post-fx>` set `data-fallback="webgl"` and show their CSS / image fallback, `<usa-shader-backdrop>` uses its CSS
backdrop, `<usa-gl-scene>` / `<usa-gl-model>` report `data-backend="none"`, and `<usa-gpu-particles>` draws with Canvas 2D.
The resource checks still run in that case — they then prove that nothing was created and nothing leaks.

## Documented limitations

- **Firefox headless without WebGL.** Headless Firefox on a machine with no usable GL driver (the linux-arm64 sandbox;
  some CI images) exposes neither `webgl` nor `webgl2`. The WebGL components take their Canvas 2D / CSS fallback there,
  so Firefox runs cover the fallback path; the WebGL path is covered by Chromium and WebKit. FIREFOX_CI_NOTE
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
- **Chromium build.** CI uses Playwright's Chromium; local runs on linux-arm64 use another Chromium build through
  `CHROME_PATH` (Playwright publishes no linux-arm64 Chromium).

## Results for 13.1.0

RESULTS_TABLE
