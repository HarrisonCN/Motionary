# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [11.4.0] - 2026-10-09

### Runtime tiers (Runtime)
- Every `motionary/runtime` module now belongs to a tier: **basic** — core (ticker, tween, timeline), `scroll`, `text`, `format-css`, `format-motion`; **standard** — `smooth`, `drag-snap`, `format-svg`, `format-sprite`, `format-gif`, `format-apng`, `format-webp`, `vector` (Lottie), `lottie-state`, official Rive runtime; **advanced** — `gl`, `format-gltf`, `format-obj`, `gltf-anim`, `gltf-decoders`, `physics`, `format-scene`, Draco and Basis decoders. A module only depends on its own tier or below.
- `motionary/runtime` exports `RUNTIME_TIERS`, `TIER_ORDER`, `tierOf(id)`, `maxTier(ids)` and the `RuntimeTier` type; every module object carries `tier`.
- Manifest (schema v2, new optional property): `runtimeModules[].tier`, `components[].tier` (highest tier among the component's prerequisites, `basic` for none) — served by `motionary-mcp` too.
- Store: a tier badge next to "Requires"; the gallery prerequisites panel names the tier; every `docs/runtime/<module>.md` states it.
- New [docs/runtime-tiers.md](./docs/runtime-tiers.md); README note.

### Checks
- New `npm run check:tiers` (`scripts/check-tiers.mjs`, CI after the build): all modules of a tier (plus lower tiers) bundled with `use()` stay within fixed gzip budgets — basic 12 KB (10.84 measured), standard 37 KB (33.73), advanced 60 KB (54.55) — and a lower-tier bundle never contains a higher-tier module.
- New `test/widgets-11-4.test.ts`: tier table, module objects, dependency direction, showcase/runtime tables equal, manifest schema, Store/gallery/docs wiring.

## [11.3.0] - 2026-10-09

### Performance metrics in CI (Tooling)
- New `npm run perf` (`scripts/perf-ci.mjs`): runs three fixture pages (`perf/`) in headless Chrome over the DevTools Protocol — no Puppeteer / Playwright dependency (Node ≥ 22) — and fails on any metric above its fixed budget in `perf/budgets.json`:
  - **first screen** — four components through `motionary/components/lazy`: gzip bytes of every JS / CSS file downloaded (45.7 KB, 10 files; budget 56 KB), script parse / compile / execute time (`ScriptDuration`), time to defined + painted, console errors;
  - **GPU resources** — `<usa-gl-scene>`: WebGL contexts, live textures / buffers / programs while running, and leaks after the element is removed (0 / 0);
  - **frame stability** — 300 elements tweened for 2 s: dropped frames and p95 frame time relative to the browser's own idle interval, longest frame, JS time per frame in `requestAnimationFrame` callbacks (3.8 ms; budget 8 ms), long tasks.
- CI (Node 22) runs it after the build and writes the table to the job summary. Budgets are never raised automatically.
- New [docs/perf-ci.md](./docs/perf-ci.md) (linked from docs/performance.md); README note.

### Checks
- New `test/widgets-11-3.test.ts`: CI wiring, fixtures, fixed budgets, metric helpers (`percentile`, `frameStats`, `overBudget`).

## [11.2.0] - 2026-10-09

### Source maps (Tooling)
- **Source maps are no longer published to npm** (`files` excludes `dist/**/*.map`). Measured on 11.0.0: the tarball drops from 6.33 MB to 3.28 MB (−48 %), unpacked from 27.08 MB to 12.02 MB (−56 %), 914 fewer files.
- Maps are still built and committed with every release. The last build step (`scripts/sourcemap-urls.mjs`) rewrites each file's `sourceMappingURL` to the map's permanent URL in the release tag — `https://raw.githubusercontent.com/HarrisonCN/Motionary/v<version>/dist/…` — so DevTools resolves it on demand, whether the file came from npm, a CDN or your bundle.
- New [docs/source-maps.md](./docs/source-maps.md) (measurements, where the maps are, alternatives considered); README note.

### Checks
- New `npm run check:pack` (`scripts/check-pack.mjs`, CI on Node 22): the dry-run package contains no `.map` file and stays within fixed limits (4.0 MB packed, 14 MB unpacked, 2300 files).
- New `test/widgets-11-2.test.ts`: `files` / build / CI wiring, URL rewriting (relative → tag URL; idempotent; absolute and data URLs untouched).

## [11.1.0] - 2026-10-09

### Tree-shaking (Motion Core · Components)
- **Nothing runs on import.** Importing any library module registers nothing (no custom element, effect or runtime module) and writes nothing to `globalThis`; the effect table and the shared motion clock are now created on first use (still one per page via `Symbol.for`, shared across bundles). Registration happens only when you call `define*()` / `register*()` / `use()`.
- **`/*#__PURE__*/` on every module-level call initializer** in `src/` (e.g. `WIDGET_TAGS`, the `motionary/plugins` pack objects, theme / token tables) and in the generated `motionary/effects/<name>` entries. Before, `WIDGET_TAGS = Object.values(WIDGETS)…` kept every widget alive: `import { defineAddToCart } from 'motionary/components/widgets'` bundled ≈ 156 KB gzip with esbuild; it is now ≈ 5 KB. One plugin from `motionary/plugins` no longer brings all 31 packs.
- **Precise `sideEffects`** in package.json: only `*.css`, the UMD / IIFE builds (`dist/*.umd.js`, `dist/runtime.iife.js`, `dist/runtime/*.iife.js`), `presets/extended` (registers on import, by design) and `components/lite` (sets its CSS base — previously missing from the list), plus their `src/` counterparts.
- New [docs/tree-shaking.md](./docs/tree-shaking.md); README note.

### Checks
- New `test/widgets-11-1.test.ts`: esbuild bundles the sources — a bare import of any library module bundles to nothing; one widget / one plugin / the runtime core contain none of the other modules' code; every module-level call is annotated; importing registers nothing.
- New `npm run check:treeshake` (`scripts/check-treeshake.mjs`, CI step after `check:exports`): every `exports` entry is empty when imported for nothing (except the `sideEffects` ones) and single-export bundles stay under fixed limits.
- `esbuild` is now an explicit devDependency (it was already installed through Vite). `dependencies` stays empty.

## [11.0.0] - 2026-10-09

### ⚠️ Breaking
- **`<usa-three-scene>` / `defineThreeScene()` / `motionary/widgets/three-scene` removed** (the 10.5 alias, deprecated in 10.9) → `<usa-gl-scene>` / `defineGlScene()` / `motionary/widgets/gl-scene` — same attributes, events and methods. `npx usa-codemod-11 --write src` rewrites it.
- **String draw programs are never evaluated on the main thread.** `offscreenRender()` / `<usa-worker-canvas>` still run a string program in a worker (OffscreenCanvas); where no worker is available a string program is refused (`backend: 'none'`, one console error) instead of being run through `new Function` — pass a function. The built-in `scene`s (`particles`, `orbits`, `starfield`) now ship function versions (`WORKER_SCENE_FNS`) for that fallback, so `<usa-worker-canvas scene="…">` keeps working everywhere and under a strict CSP. `offscreenRender()` gains `opts.fallback`.
- CDN URLs move to the new major: `https://cdn.jsdelivr.net/npm/motionary@11/dist/…` / `https://unpkg.com/motionary@11/dist/…` (runtime `RUNTIME_CDN`, every prerequisite, the install button, README, AGENTS.md, docs). The README quickstart and the playground snippets still said `@6` — they now say `@11` too.

### Stable from 11.0 (semver until 12.0)
- `motionary/runtime` and every `motionary/runtime/<module>` export and module id.
- The AI manifest **schema v2** (`components.json`, `motionary/manifest.json`) is frozen: `stability: "stable"`, no deprecated components left. The `motionary-scene@1` format.
- **`motionary-mcp` 2.x** tool names and result shapes (the server stays at 2.0.0; the roadmap's "MCP 1.0" label is retired).
- The individual entry points (`motionary/widgets/<name>`, `motionary/effects/<name>`, `motionary/components/<name>`) and their fixed gzip budgets.
- **Compatibility matrix frozen**: new generated page [docs/compat-matrix.md](./docs/compat-matrix.md) (every runtime module and official runtime, feature by feature, from the same tested data as `docs/runtime/<module>.md`; checked by `check:peer-docs`) and a README section **"Stable API (11.x) & compatibility matrix"**. A ✅ row is not removed before 12.0.

### Security
- **Zip-bomb protection for dotLottie / zip decoding** (`motionary/runtime/vector`, the only archive / inflate path): `unzipEntries()`, `parseDotLottie()` and `loadLottie()` take `limits` (`ZipLimits`: `maxEntries` 1000, `maxEntryBytes` 32 MB, `maxTotalBytes` 64 MB, `maxRatio` 100 once an entry passes 1 MB — defaults in `ZIP_LIMITS`). Declared sizes are not trusted: inflating streams through `DecompressionStream`, counts the real output and cancels as soon as a limit is crossed; entries inflate one at a time. Tests build a zip bomb at test time (24 MB of zeros in < 64 KB with a lying size field) plus entry-count / per-entry / total / stored-entry cases.

### Architecture
- New [docs/architecture.md](./docs/architecture.md) (Chinese, Mermaid + ASCII): four logical layers — **Public API** (HTML · React · Vue · Svelte · Solid · Angular) → **Components** · **Motion Core** · **Runtime** → **Motion Intelligence & Tooling** (Manifest · MCP · Code Generation · Validation · Figma) — every `src/` folder and roadmap item mapped onto them, with dependency rules (Core depends on nothing; Runtime / Components on Core only; Public API wraps them; Tooling reads the manifest). Not separate npm packages.
- **`test/architecture.test.ts`** enforces the layer import rules on every value import in `src/` (type-only imports are ignored), forbids `src/` importing `scripts/` / `bin/` / `figma-plugin/`, and checks `dependencies` stays empty with every peer optional. One recorded exception (`<usa-motion-prompt>` → the AI layer) may only be removed, never added to.

### CI
- Removed `.github/workflows/jekyll-gh-pages.yml`, which failed at "Build with Jekyll" on every push; `pages.yml` (Showcase deploy) is the only Pages workflow.

### Changed
- ROADMAP: new **11.1 → 13.0** plan (Chinese) — 11.x light / side-effect-free / tree-shakable core, source-map strategy, CI performance metrics, runtime tiers (basic / standard / advanced), Public API alignment, pluggable LLM provider for the AI layer, component-contract audit; 12.0 unified component contract; 12.x cross-platform, MCP validation, Figma export, playground, version compatibility; 13.0 discover · copy · run.
- ROADMAP: 11.0 done; "`motionary-mcp` 2.x 稳定版"; the cross-platform 3.0 items (mini-program, HarmonyOS ArkTS samples, cross-platform previewer) are moved past 11.0.
- npm: `motionary` and the `use-scroll-animate` alias are published with the `latest` tag.

### Upgrading
See [docs/upgrading-11.md](./docs/upgrading-11.md): run `npx usa-codemod-11 --write src`, replace `@10` with `@11` in CDN URLs. Nothing else changes — package names, budgets and entry points stay the same.

## [10.9.0] - 2026-10-09

### Added
- **Per-component entry points** (requested by the blog integration, which had to load the whole ~150 KB gzip widgets group): every `<usa-*>` widget has its own subpath **`motionary/widgets/<name>`** (the tag without `usa-`, e.g. `motionary/widgets/toast-stack`, `motionary/widgets/dock`, `motionary/widgets/snap-carousel`) and every 6.x+ effect has **`motionary/effects/<name>`** (e.g. `motionary/effects/pearlescent`, `motionary/effects/spectrum-mirror`, exporting `register<Name>()` + `effect`). Each entry registers **only its own tag / effect** — CI loads every entry into a fresh module graph and custom-element registry and checks it — and has its own fixed gzip budget in `size-budget.json` (set from the first measurement, never raised). Listed in `components.json` (`components[].entry`, top-level `effects[]`), the README and `docs/entry-points.md`. The group entries (`motionary/components/widgets`, `/fx2`, `/lite`) are unchanged. Note: an effect entry carries its pack file (the effects of a pack share helpers).
- **`motionary/runtime/lottie-state`** — dotLottie **themes** (Lottie slots + theme rules: Color, Scalar, Vector, Text; static or keyframed; per-animation) and a **state machine subset** (playback states, GlobalState transitions, Event / Numeric / String / Boolean guards, PointerDown / Up / Enter / Exit, Click, OnComplete interactions, Fire / Set* / Toggle / Increment / Decrement / Reset / SetTheme / SetFrame / SetProgress / FireCustomEvent actions; **OpenUrl is refused** on purpose). `applyTheme()`, `createStateMachine()`, `inspectStateMachine()`. Fixed gzip budget.
- **`<usa-dotlottie>`** (**Requires: motionary/runtime/vector + motionary/runtime/lottie-state**; own entry `motionary/components/dotlottie`) — `<usa-lottie-player>` with `theme` and `state-machine`; pointer and keyboard (Enter / Space) interactions; `stateMachine`, `state`, `fire()`, `setInput()`, `setTheme()`; `usa:state`, `usa:custom`.
- **`motionary/runtime/gltf-decoders`** — hooks for the **official decoders**, as optional peers: Google **`draco3d`** for `KHR_draco_mesh_compression` and Binomial's **Basis Universal transcoder** for `KHR_texture_basisu` (KTX2). `provideGltfDecoder(kind, loader)` registers a lazy loader (fetched only when a file needs it); `prepareGltf()` rewrites the file for `loadGltf(src, { prepare })`. Missing decoder → a clear error naming the package and the provide line. `draco3d` is an optional `peerDependency` (never bundled).
- **`<usa-gl-model>`** (**Requires: motionary/runtime/gl + format-gltf + gltf-decoders + draco3d + basis_transcoder.js**; own entry `motionary/components/gl-model`) — `<usa-gl-scene>` for compressed glTF. Prerequisites (runtime modules and both official decoders) appear in all five places.
- **AI manifest schema v2** (additive over v1): `stability`, `deprecated` { since, removedIn, use }, `entry`, top-level `effects[]`, `optional` on official-runtime prerequisites; validated against `scripts/manifest.schema.json` in CI. The `motionary-scene@1` format is unchanged and now has a published JSON Schema (`docs/schemas/motionary-scene-1.schema.json`); every preset is validated against it.
- **`docs/audit-10.9.md`** — accessibility, performance (per-module gzip budget review: all kept), security, API consistency and manifest audit before 11.0.
- **`docs/upgrading-11.md`** + **`npx usa-codemod-11`**.

### Deprecated (removed in 11.0)
- `<usa-three-scene>` / `defineThreeScene()` — use `<usa-gl-scene>` / `defineGlScene()` (same API); warns once. The codemod rewrites it.
- String programs for `offscreenRender()` / `<usa-worker-canvas>` that fall back to the main thread, where they were evaluated with `new Function` (CSP / injection risk, found by the audit) — pass a function; warns once. The codemod flags it.

### Fixed
- `format-gltf`: the error for a Draco / KTX2 file pointed at "decoder hooks planned for 10.9"; it now names `<usa-gl-model>` / `motionary/runtime/gltf-decoders`.

### Accessibility
- `<usa-dotlottie>` is a labelled, focusable `img` canvas; Enter / Space feed the state machine like a tap; under reduced motion each state shows its first frame instead of playing. `<usa-gl-model>` behaves like `<usa-gl-scene>` (labelled canvas, keyboard orbit controls, no auto-rotate / animation under reduced motion).

## [10.8.0] - 2026-10-09

### Added
- **`motionary/runtime/drag-snap`** — pointer drag along one axis with velocity tracking (last 100 ms), inertial throws (constant deceleration), snap points (nearest to the projected throw; a fast flick always moves one point), rubber-band edges and a critically damped spring on the shared ticker; the click that ends a drag is swallowed, clicks inside still work. `createDragSnap(el, { snap, onUpdate, onSnap, … })` → `snapTo()`, `setPosition()`, `setSnapPoints()`; pure helpers `projectThrow`, `nearestSnap`, `rubberband`, `springStep`, `velocityTracker`. Reduced motion: no inertia, no spring. CDN `dist/runtime/drag-snap.iife.js`; fixed gzip budget.
- **`<usa-snap-carousel>`** (**Requires: motionary/runtime/drag-snap**) — drag / swipe carousel with real inertia and snapping, slides that keep their own width (peek), `align` (center · start), `gap`, `index`, `autoplay` (pauses on hover, focus, off screen; never under reduced motion), prev / next buttons, dots, ←/→ / Home / End; `next()`, `prev()`, `goTo()`, `controller`, `usa:change`. Without the runtime module it stays a native CSS scroll-snap strip (plus the clear notice). **Shipped as its own entry point `motionary/components/snap-carousel`** — from 10.8 new components are not added to `motionary/components/widgets` or the all-components `motionary/components/lite` bundle, whose fixed 70 KB gzip budget stays as it is.
- **`motionary/runtime/gltf-anim`** — glTF 2.0 **animation** (translation / rotation / scale / weights channels; `LINEAR` with quaternion slerp, `STEP`, `CUBICSPLINE` Hermite with in / out tangents), **skinning** (joint hierarchy, inverse bind matrices, 4 influences per vertex) and **morph targets** (POSITION + NORMAL deltas; mesh, node and animated weights) for models loaded by `motionary/runtime/format-gltf`, deformed on the CPU so every runtime/gl material works. `gltfAnimator(model, { clip, loop, speed })` → `seek()`, `update(dt)`, `play()` on the shared ticker; `gltfClips`, `sampleChannel`, `applyClip`, `deformModel`, `deformGeometry` are pure. Fixed gzip budget.
- `motionary/runtime/format-gltf`: **sparse accessors**; skin and morph data are kept on each geometry (`geometry.deform`) and node (`extras.skin`, `extras.weights`). `motionary/runtime/gl`: `geometry.version` — bump it after changing positions / normals and the renderer re-uploads them.
- **`<usa-gl-scene animation>`** plays a clip (name or index; empty = the first) with `animation-speed`; reduced motion shows the first pose; `animator` property; `usa:load` lists the clips. Animation needs `motionary/runtime/gltf-anim` (all five prerequisite places list it for the new "3D animation" card).
- **Lottie text layers** in `motionary/runtime/vector`: fonts by family + style (weight / italic), justification, tracking, line height, fill + stroke (stroke over fill), box text with word wrapping, source-text keyframes and source-text expressions.
- **Lottie expression subset** with Motionary's own interpreter — **no `eval` / `new Function`** (works under a strict CSP; an expression can only call the listed helpers): `time`, `value`, `wiggle()`, `loopOut()` / `loopIn()` (cycle · pingpong · offset · continue, + `…Duration`), `linear()`, `ease()`, `easeIn()`, `easeOut()`, `clamp()`, `valueAtTime()`, `framesToTime()`, `timeToFrames()`, `degreesToRadians()`, `radiansToDegrees()`, `add` / `sub` / `mul` / `div` / `length`, `Math.*`, arithmetic on numbers and arrays, `var` / `$bm_rt =`, comparisons and `?:`. Anything else keeps the keyframed value and `inspectLottie()` lists "expressions outside the supported subset". `evalExpression(src, value, time, fr)` is exported.
- New gallery / Store cards: snap carousel, 3D animation (a self-made skinned tentacle with two clips), Lottie text + expressions. Self-made, MIT test fixtures: `sample-skin.gltf`, `sample-morph.gltf` (one sparse target), `motionary-tentacle.glb`, `sample-text.json` (credits in `test/fixtures/formats/CREDITS.md`).
- Prerequisites for both new runtime modules appear in all five places (gallery card, Store detail with the **Requires:** badge, `docs/runtime/drag-snap.md` + `docs/runtime/gltf-anim.md` with compatibility tables, README, AI manifest); the format-gltf and vector compatibility tables are updated.

### Accessibility
- `<usa-snap-carousel>` is a labelled `region` (`aria-roledescription="carousel"`), slides are `group`s labelled "n of N", the viewport is focusable with ←/→ / Home / End, prev / next are real buttons (disabled at the ends), dots are labelled buttons with `aria-current`, slide changes made with keys or buttons are announced politely; autoplay pauses on hover / focus and is off under reduced motion, where moves are instant.
- `<usa-gl-scene animation>`: reduced motion shows the first pose instead of playing.

### Deferred (from the 10.8 plan)
- Cross-platform 3.0 (mini-program / HarmonyOS ArkTS samples, cross-platform previewer) and "manifest covers all effects" are not in this release; they stay on the roadmap after 11.0.

## [10.7.0] - 2026-10-09

### Added
- **AI-assisted motion — `motionary/components/ai`**: `describeMotion(text)` turns a short description in English or Chinese ("fade the cards up slowly when they scroll into view, one after another" / "卡片从下往上依次淡入") into a motion spec — effect, direction, distance, duration, delay, easing, trigger, repeat, stagger, Web Animations keyframes + options, a CSS rule with a `prefers-reduced-motion` guard, and the Motionary components that implement it; `motionSnippet(intent, 'waapi' | 'css' | 'component')` gives ready code. A small deterministic parser — **no model, no network**, pure (SSR / workers). Pinned by an **evaluation set** of 30 English + Chinese prompts (`test/fixtures/ai-eval.json`) that CI runs (≥ 90 % must be fully right; 30 / 30 at release).
- **`motionary-mcp` 2.0** (`npx -y -p motionary motionary-mcp`): new read-only tools **`suggest_motion`** (the parser above, with prerequisite-aware component suggestions) and **`validate_snippet`** (static analysis of HTML / ESM / JSX / Vue / Svelte: unknown components with "did you mean" suggestions, unknown attributes, missing or mis-ordered prerequisites, a runtime module imported but never `use()`d, components never defined, hand-written animation without a reduced-motion path). Verified with the official MCP SDK client over stdio.
- **`motionary/runtime/physics`** — a 2D rigid-body engine written for Motionary (own implementation and API; no Matter.js / Box2D code): circles, boxes and convex polygons; static / dynamic / kinematic bodies; mass from density, restitution, Coulomb friction, sensors, collision categories / masks, sleeping; sort-and-sweep broad phase + SAT narrow phase with clipped 2-point manifolds and warm-started accumulated impulses; distance / spring / pin constraints and a pointer-drag constraint; fixed time step with an accumulator (same result at any frame rate), `world.run()` on the shared ticker. CDN `dist/runtime/physics.iife.js`; fixed gzip budget.
- **`motionary/runtime/format-scene`** — the versioned **`motionary-scene@1`** JSON format (world, named materials, bodies, constraints, per-body style): `validateScene()` (lists every problem, never throws), `migrateScene()` (unversioned / `@0` drafts → `@1`, with a change list), `parseScene()`, `sceneToWorld()`, `worldToScene()`. Fixed gzip budget.
- **New components (10.7)** in `motionary/components/widgets`: `<usa-physics-playground>` — presets (balls, pyramid, pendulum, dominoes), `src` or an inline `<script type="application/json">` scene, `gravity`, `spawn`, `paused`; drag bodies, tap to spawn, arrow keys nudge; `world`, `bodies`, `toScene()`, `reset()`, `play()` / `pause()`, `usa:collision` (**Requires: motionary/runtime/physics + motionary/runtime/format-scene**); `<usa-motion-prompt>` — type a description, get a live preview and WAAPI / CSS / component code with a copy button (`value`, `format`, `placeholder`, `label`; `usa:suggest`, `usa:copy`).
- Prerequisites for both runtime modules appear in all five places (gallery card, Store detail with the **Requires:** badge, `docs/runtime/physics.md` + `docs/runtime/format-scene.md` with compatibility tables, README, AI manifest).

### Fixed
- `motionary-mcp` listed `<usa-rive>`'s prerequisite (10.6, an official runtime) as `motionary/runtime/rive` and `scaffold_snippet` emitted an import of that non-existent module. Prerequisites are now peer-aware: `@rive-app/canvas`, its install command and the `provideRiveRuntime(() => import('@rive-app/canvas'))` line.

### Accessibility
- `<usa-physics-playground>` is a labelled, focusable canvas (arrow keys nudge the last body touched); under reduced motion the scene is settled off-screen and drawn once, and dragging advances it only while you move. `<usa-motion-prompt>` uses a labelled input, announces suggestions in a polite live region, shows the end state instead of animating under reduced motion, and every code sample it generates carries a `prefers-reduced-motion` guard.

## [10.6.0] - 2026-10-09

### Added
- **Motion design tokens 2.0 — W3C Design Tokens (DTCG 2025.10)** in `motionary/components/tokens`: `importDesignTokens()` (resolves `{group.token}` aliases, also inside composite values; `$type` inherited from groups; springs from `$extensions["org.motionary"]`), `exportDesignTokens()` (stable `2025.10` shape — durations as `{ value, unit: "ms" }` — or the earlier draft `"150ms"`; optional `transition` composites), `validateDesignTokens()` (unknown `$type`, malformed durations / cubic béziers, broken or circular aliases — listed, not thrown) and `resolveTokenAliases()`.
- **`motionary/runtime/vector`** — a Lottie (bodymovin JSON) + **dotLottie** player written for Motionary (own Canvas 2D renderer, no lottie-web code): shape / solid / null / image / precomp layers (time stretch + time remap), parenting, transforms incl. split and spatial-bezier positions, paths / rectangles / ellipses / stars, fills and strokes (dashes), linear + radial gradients, **trim paths**, **masks** (add / subtract / intersect / inverted / opacity), **track mattes** (alpha, alpha inverted; luma approximated), per-dimension bezier and hold keyframes; `.lottie` zip archives (stored + deflate via the native `DecompressionStream`, manifest v1 / v2, several animations, embedded images); `lottiePlayer()` is a runtime timeline (seek, reverse, scrub, markers → segments); `inspectLottie()` lists what a file uses that the renderer skips (text, expressions, effects, 3D, merge paths, repeaters — text layers and an expression subset follow in 10.8). CDN `dist/runtime/vector.iife.js`; fixed gzip budget.
- **Official Rive runtime as an optional peer dependency.** `.riv` is Rive's proprietary binary format, so Motionary does not reimplement it: `<usa-rive>` plays `.riv` files through the official MIT-licensed `@rive-app/canvas` (declared in `peerDependencies` with `peerDependenciesMeta.optional`, never bundled). It is lazy-loaded when the first `<usa-rive>` mounts — from `provideRiveRuntime(() => import('@rive-app/canvas'))` (bundlers), `window.rive` (the official CDN script), an import map, or a `runtime-src` URL — and a missing runtime gives a clear message in place (install command, the `provideRiveRuntime()` line, the pinned CDN URL) plus `usa:runtime-missing`. Its prerequisites appear in all five places (gallery card, Store detail with a **Requires: @rive-app/canvas** badge, `docs/runtime/rive.md`, README, AI manifest); prerequisite entries now have a `kind: 'peer'` for official runtimes.
- **New components (10.6)** in `motionary/components/widgets`: `<usa-lottie-player>` — `src` (.json / .lottie), `animation`, `autoplay`, `loop`, `speed`, `mode` (normal · bounce), `segment` (frames or a marker), `hover`, `scrub`, `fit`, `background` (**Requires: motionary/runtime/vector**); `<usa-rive>` — `src`, `artboard`, `animation`, `state-machine`, `autoplay`, `fit`, `runtime-src`, `input(name)` (**Requires: @rive-app/canvas**, optional peer); `<usa-token-editor>` — edit duration / easing tokens with live previews, export / import DTCG (`format`, `groups`, `apply`).
- Test fixtures: a self-made Lottie + dotLottie that exercise one supported feature per region (MIT), and Rive's own `message_icon.riv` sample (MIT, © Rive) — sources and licences in `test/fixtures/formats/CREDITS.md`.

### Accessibility
- `<usa-lottie-player>` and `<usa-rive>` draw into a labelled `img` canvas (`label`); under reduced motion they show the first frame and do not autoplay; Lottie renders only while on screen. `<usa-token-editor>` uses labelled inputs and announces import problems in a polite live region; its previews are decorative.

## [10.5.0] - 2026-10-09

### Added
- **`motionary/runtime/gl`** — a small WebGL2 scene renderer written for Motionary (own API and shaders, not a Three.js clone): scene graph (`GlNode` with position / quaternion / scale or a fixed matrix, hierarchy, `traverse`, `find`), `Camera` + `frameNode()` / `bounds()`, ambient + up to 4 directional / point lights, geometry builders (`box`, `plane`, `sphere`, `torus`, `computeNormals`), materials (`standardMaterial` metallic-roughness approximation with sRGB handling and tone mapping, `unlitMaterial`, `shaderMaterial` with your GLSL ES 3.00 `shade()`), image / canvas / bitmap / raw RGBA textures and **video textures** (MP4 / WebM, updated per decoded frame via `requestVideoFrameCallback`; `scrubVideo()` for scroll-scrubbed video), `orbitControls()` (drag, wheel, pinch, arrow keys; auto-rotate off under reduced motion). Math, geometry and the scene graph are pure (SSR / workers). CDN `dist/runtime/gl.iife.js`; fixed gzip budget.
- **`motionary/runtime/format-gltf`** — glTF 2.0 loader: `.gltf` (external or `data:` buffers / images) and `.glb`; scenes, node hierarchy (TRS / matrix), meshes with several primitives (all component types, normalised integers, interleaved strides; points / lines / triangles / strips / fans), PBR metallic-roughness materials (base colour factor + texture, emissive incl. `KHR_materials_emissive_strength`, `KHR_materials_unlit`, alpha blend, double-sided). Files that *require* unimplemented extensions (Draco, meshopt, KTX2) fail with a clear error. Skins, morph targets and animations follow in 10.8.
- **`motionary/runtime/format-obj`** — Wavefront OBJ + MTL loader: any polygon (fan-triangulated), negative indices, `o` / `g` groups, one mesh per `usemtl`, `Kd` / `Ks` + `Ns` / `Ke` / `d` / `Tr` / `map_Kd`, flat normals when missing.
- **WebGPU effects 2.0**: `<usa-gpu-particles>` — up to 200 000 particles integrated by a **WebGPU compute shader** (storage buffer, `@workgroup_size(64)`) and drawn as instanced soft quads (swirl · galaxy · fountain, pointer repulsion, trails), Canvas 2D fallback; `<usa-shader-backdrop>` — animated shader background (aurora · plasma · waves · nebula or your own GLSL) through a **post-processing chain** (`bloom`, `vignette`, `grain`, `chromatic`, `pixelate`, `scanlines`, any order, ping-pong framebuffers), CSS gradient fallback.
- **New components (10.5)** in `motionary/components/widgets`: `<usa-gl-scene>` (alias `<usa-three-scene>`) — glTF / GLB / OBJ model or built-in shape, `controls`, `auto-rotate`, `color` / `metallic` / `roughness`, `background`, `exposure`, `video` texture with optional `video-scrub` (**Requires: motionary/runtime/gl**, + `format-gltf` / `format-obj` for models); `<usa-gpu-particles>`; `<usa-shader-backdrop>`.
- Test fixtures: self-made GLB / glTF (interleaved, strips, normalised UVs, matrix node, two scenes), OBJ / MTL + texture, WebM / MP4 clips, and the Khronos sample "Box" (CC-BY 4.0, Cesium) — sources and licences in `test/fixtures/formats/CREDITS.md`.

### Accessibility
- `<usa-gl-scene>`'s canvas is a labelled `img` (`label`), keyboard-orbitable when `controls` is set (focusable; arrow keys, + / −); auto-rotate and the particle / shader animations stop under reduced motion (one still frame). Everything renders only while on screen.

### Fixed
- Build: `npm run build` runs Rollup in four smaller processes (JS bundles, then the declaration bundles in three slices) instead of one 6 GB process, which the out-of-memory killer stopped on 8 GB machines; the output is unchanged.
- Tests: the orbit-controls test no longer needs `PointerEvent` (missing in jsdom).
- `check:peer-docs` now accepts the combined registration `use(gl, formatGltf, formatObj);` for components that need several runtime modules (it used to demand one `use()` per module), and treats an alias tag defined next to a carded element (`<usa-three-scene>`) as covered by that card.

## [10.4.0] - 2026-10-09

### Added
- **Scroll-driven 3.0 — native `animation-timeline` first.** The new scroll components animate with the browser's own scroll / view timelines (`animation-timeline: scroll()` / `view()`, named timelines + `timeline-scope` for containers) where supported — no script per frame — and fall back to a small passive JS loop elsewhere (`engine="auto | native | js"`, the engine in use is reflected in `data-engine`).
- **`motionary-mcp`** — a read-only [MCP](https://modelcontextprotocol.io) server for the component catalog, shipped in the package (`npx -y -p motionary motionary-mcp`, stdio, zero dependencies). Tools: `list_components`, `search_components`, `get_component`, `get_example`, `scaffold_snippet` (snippets for HTML / ESM / React / Vue / Svelte with every prerequisite installed, imported and registered first); resources `motionary://manifest`, `motionary://llms.txt`, `motionary://component/{tag}`. Answers from the bundled AI manifest only — no file writes, code execution or network; all tools annotated `readOnlyHint`. Tested in CI with the official MCP TypeScript SDK client over stdio. Docs: `docs/mcp.md`.
- **`motionary/runtime/smooth`** — smooth, inertial wheel scrolling (frame-rate-independent lerp, or `duration` + `ease`) for the window or any scroll container, vertical or horizontal; anchor links glide (offset, focus moved, hash kept); keyboard, scrollbar, find-in-page and assistive-tech scrolling stay native (the target follows them); touch native by default; nested scrollables, `[data-smooth-ignore]` and ctrl+wheel zoom are left alone; **disabled under `prefers-reduced-motion`** (live). Real `scroll` events still fire, so scroll scenes, observers and CSS scroll timelines keep working. CDN `dist/runtime/smooth.iife.js`; fixed gzip budget.
- **Animated image loaders** (own implementations, fixed gzip budgets, real sample files with reference results): **`motionary/runtime/format-gif`** — complete GIF decoder with its own LZW (GIF87a / 89a, global / local palettes, transparency, interlacing, disposal 0–3, delays, NETSCAPE2.0 loop count), pure (works in workers / Node), pixel-exact against Pillow on the test files; **`motionary/runtime/format-apng`** — APNG `acTL` / `fcTL` / `fdAT` split into standalone frame PNGs (fresh CRCs) decoded by the browser, composited with `dispose_op` / `blend_op`; **`motionary/runtime/format-webp`** — animated WebP `ANIM` / `ANMF` split into standalone frames (lossless VP8L, lossy VP8 with `ALPH` via an added VP8X header) decoded by the browser, composited with blend / dispose. Shared `animatedImagePlayer(canvas, anim)` plays any of them as a runtime timeline (pause, reverse, `speed`, scrub with `progress`). Compatibility tables in `docs/runtime/format-gif.md`, `format-apng.md`, `format-webp.md`; sample files and how they were made in `test/fixtures/formats/CREDITS.md`.
- **New components (10.4)** in `motionary/components/widgets`: `<usa-scroll-ring>` — circular scroll-progress indicator for the page or a container (`for`), `label`, `back-to-top`, `size`, `thickness`; `<usa-parallax-layers>` — `data-depth` layers move at different speeds through the viewport, optional `pointer` tilt; `<usa-smooth-scroll>` — page or `wrapper` smooth scrolling with `lerp`, `duration`, `offset`, `anchors` (**Requires: motionary/runtime/smooth**).
- Showcase: new gallery cards with copyable code (prerequisites first), live demos and live Store thumbnails.

### Accessibility
- `<usa-smooth-scroll>` / `motionary/runtime/smooth` switch themselves off while `prefers-reduced-motion: reduce` matches, never hijack keyboard, scrollbar or touch scrolling, and move focus to anchor targets. `<usa-parallax-layers>` is static under reduced motion. `<usa-scroll-ring>` is a labelled `progressbar` (`aria-valuenow`), or a labelled "Back to top" button with `back-to-top`; its back-to-top jump is instant under reduced motion.

## [10.3.0] - 2026-10-09

### Added
- **View Transitions 2.0** — `<usa-route-transition>`: a route container that swaps its content on same-origin link clicks (fetched pages, using the element that matches `selector` / its id) or inline `<template data-route>` routes; animated with the View Transitions API when available (`engine="auto"`) or the Web Animations fallback (`engine="waapi"`, effects `fade` / `slide` / `zoom`); `data-shared="name"` elements morph between routes (`view-transition-name`); `cross-document` opts the site into native cross-document (MPA) view transitions (`@view-transition { navigation: auto }`); history push / replace / off with `popstate`; `navigate(url)`, `current`; `usa:navigate` (cancelable), `usa:navigated`.
- **`motionary/runtime/text`** — `splitText(el, { type: 'chars,words,lines' })`: grapheme-aware characters (`Intl.Segmenter`: emoji, combining marks, CJK), words, lines grouped by rendered position; nested inline markup kept; accessible (`aria-label` with the full text, pieces `aria-hidden`); `--i` index custom property; `revert()` / `resplit()`; pure `segment()` for SSR / workers. CDN `dist/runtime/text.iife.js`; fixed gzip budget.
- **`motionary/runtime/format-sprite`** — sprite sheets and image sequences: `parseSpriteSheet()` (TexturePacker JSON hash + array with trimmed / rotated frames; Aseprite JSON hash + array with per-frame `duration` and `frameTags` forward / reverse / pingpong / pingpong_reverse), `gridSheet()`, `frameOrder()`, `drawFrame()`, `spritePlayer()` (canvas or element background), `imageSequence('frame_{0001}.webp', …)`, `preloadImages()`, `sequencePlayer()` (cover-fit, scrub with `progress`). All players are runtime timelines (seek, reverse, scroll-scrub). Test fixtures in the real export formats; `test/fixtures/formats/CREDITS.md` lists sample licences.
- **Runtime tween**: numbers inside any CSS string are interpolated when both ends share the same text (`filter: blur(8px) saturate(0%)`, `box-shadow`, `clip-path`, `matrix(…)`), and values that cannot be interpolated (keywords such as `display`) switch at 50 % like CSS — previously they threw.
- **New components (10.3)** in `motionary/components/widgets`: `<usa-route-transition>` and `<usa-text-splitter>` — splits into chars / words / lines and staggers them in (`rise`, `fade`, `blur`, `flip`, `wave`) on view, load or hover, optional `loop` (**Requires: motionary/runtime/text**). The 4.x `<usa-split-text>` keeps its name and API; the runtime-powered element is a new tag.
- Showcase: new gallery cards with copyable code, live demos and live Store thumbnails.

### Accessibility
- `<usa-text-splitter>` keeps the full sentence as the element's accessible name and hides the animated pieces from screen readers; under reduced motion the text is shown at once. `<usa-route-transition>` swaps instantly under reduced motion and keeps native link semantics (modifier-clicks, `target`, downloads and cross-origin links are left alone).

### Fixed
- `<usa-route-transition>` (Web Animations fallback) no longer hangs when the exit animation's `finished` promise never settles (background tabs, DOMs without animation timing): the swap waits at most the exit duration.
- `format-svg`: value interpolation narrows the runtime's new string values correctly (TypeScript build error after the 10.3 tween change; behaviour unchanged).

## [10.2.0] - 2026-10-09

### Added
- **`motionary/runtime/scroll`** — scroll-linked scenes (original implementation, own API): `scrollScene({ trigger, start, end, scrub, pin, markers, actions, toggleClass, once, horizontal, scroller, onEnter, onLeave, onEnterBack, onLeaveBack, onUpdate, onToggle, animation })`. Rules like `"top 80%"`, `"center center+=100"`, end `"+=600"`; scrub direct (`true`) or smoothed (ms) on the shared ticker; pinning with a layout-preserving spacer (fixed in the window, transform inside scroll containers); start / end / viewport markers; per-edge actions (`play pause resume reverse restart reset complete none`); `refreshScenes()`, `killScenes()`, `allScenes()`, `parseEdge()`, `resolveRule()`. CDN `dist/runtime/scroll.iife.js`; fixed gzip budget.
- **`motionary/runtime/format-svg`** — SVG loader: SMIL playback on the runtime timeline (`<animate>` from / to / by / values, `keyTimes`, `calcMode` linear / discrete / spline + `keySplines`; `<set>`; `<animateTransform>` translate / scale / rotate / skewX / skewY; `<animateMotion>` path / `<mpath>`, `rotate="auto"`; `dur`, numeric `begin`, `repeatCount` incl. `indefinite`, `repeatDur`, `fill="freeze"`), `playSmil()` (seek / scrub / reverse / timeScale, `restore()`), `readSmil()`; path geometry without the DOM — `parsePath()` (all commands incl. arcs and S/T reflections), `flattenPath()`, `pathLength()`, `pointAtLength()`, `samplePath()` — and **path morphing** between any two paths (`morphPath()`, also used for `attributeName="d"`). Compatibility table in `docs/runtime/format-svg.md`.
- **`data-motion` in `motionary/core`** — `applyMotionAttributes(motion, root?, { observe })` wires `data-motion="enter: fade-up 600ms stagger 80ms; click: pop"` (triggers `enter`, `load`, `click`, `hover`, `loop`; duration, `delay`, `stagger`, `ease`, `once`) without the DSL package; `parseMotionAttr()`. Core stays far under its 10 KB budget.
- **Per-component Markdown docs** — `docs/components/<tag>.md` for every element (attributes, events, slots, methods, import, CDN, prerequisites, minimal example, variants) + index, generated from the same data as `components.json` / `llms-full.txt` (`npm run docs:components`; `check:peer-docs` fails when they are stale).
- **`AGENTS.md`** (repo root, also in the npm package) and **`docs/ai-prompt-guide.md`** — how AI assistants should pick components, start from the manifest example, and handle prerequisites; review checklist and common misuses.
- **New components (10.2)** in `motionary/components/widgets`: `<usa-scroll-scene>` — scroll-scrubbed scene for `[data-scrub="prop: from -> to"]` children with `scrub`, `pin`, `markers`, `stagger`, `toggle-class`, `preview` (**Requires: motionary/runtime/scroll**); `<usa-motion-inspector>` — live list of running animations (CSS, WAAPI, components) with pause / play all, 0.25× slow motion, per-row scrub and the runtime ticker's fps.
- Showcase: new gallery cards with copyable code (prerequisites first), live demos and live Store thumbnails.

### Accessibility
- `<usa-scroll-scene>` is user-driven (it only moves when the reader scrolls); under reduced motion the scrub is linear and the preview loop does not run. `<usa-motion-inspector>` controls are a labelled `toolbar`, rows have labelled scrub sliders, and its slow-motion switch helps people check motion for vestibular safety.

### Fixed
- Runtime timeline: a timeline holding an infinitely repeating child no longer seeks to `NaN` (`0 × Infinity`) — infinite-duration timelines seek on the raw time.
- `format-svg`: SMIL `<set>` without `dur` is applied and holds its value (duration 0, freeze) instead of being dropped with a `NaN` duration.
- Tests: the 10.1 manifest test no longer pins the exact runtime module list, so releases that add modules keep it green.

## [10.1.0] - 2026-10-09

### Added
- **`motionary/runtime` — Motionary's own zero-dependency animation runtime** (original implementation; no third-party code). Shared ticker (`getTicker()`: one rAF loop, lag smoothing, `timeScale`, `step()` for tests / workers), tween + timeline engine (`tween()`, `timeline()`, `Tween`, `Timeline`: plain objects and elements — CSS lengths, colours, custom properties, transform shorthands `x y rotate scale scaleX scaleY skewX skewY`; positions `<`, `>`, `+=`, `-=`, labels; `repeat`, `yoyo`, `reverse()`, `seek()`, `await`), easing (`EASES`, `cubicBezier()`, `steps()`, `parseEase()`), and the module registry (`use()`, `requireModule()`, `hasModule()`, `RuntimeModuleError` with install / import / CDN instructions). SSR-safe (no `window` at import), works in Web Workers, TypeScript types. CDN: `dist/runtime.iife.js` (`window.MotionaryRuntime`, registers itself) and per-module `dist/runtime/<module>.iife.js`; ESM at `dist/runtime.js` / `dist/runtime/<module>.js`.
- **Format loaders** (each its own tree-shakable module with a fixed gzip budget): `motionary/runtime/format-css` — CSS `@keyframes` (prefixed rules, selector lists, per-frame `animation-timing-function`, transforms as shorthands) and Web Animations API keyframes (array + property-indexed, offsets distributed like the WAAPI) → runtime timeline (`parseKeyframes`, `fromCssRule`, `fromWaapi`, `toWaapi`, `playKeyframes`); `motionary/runtime/format-motion` — Motion / Framer-style `{ initial, animate, transition }` JSON (array keyframes, `times`, ease names / cubic arrays, `repeat` + `repeatType`, per-property transitions, `type: "spring"` simulated into an easing) (`fromMotion`, `playMotion`, `springEase`, `motionEase`). Compatibility tables in `docs/runtime/format-css.md` and `docs/runtime/format-motion.md`.
- **Prerequisites system**: `showcase/catalog/prereqs.js` is the single source for every component prerequisite (runtime modules now; official third-party runtimes for formats we cannot implement, from 10.6). Gallery cards get a **Requires** block (install, import & register order, CDN, minimal example), Store cards a **"Requires: motionary/runtime/…"** badge and a Prerequisites section in the detail; code snippets include the prerequisites; `scripts/gen-runtime-docs.mjs` writes `docs/runtime/<module>.md` and the README / `docs/components.md` prerequisite blocks.
- **`npm run check:peer-docs`** (in CI): every runtime-powered component documents its prerequisites in all five places (gallery card, Store detail, docs page, README, AI manifest); every `runtimeModule()` call is declared on its card; every module has a docs page, a compatibility table and a size budget; generated docs are current.
- **AI-readable components**: `dist/manifest.json` (npm `motionary/manifest.json`, Pages `/components.json`) with JSON Schema (`motionary/manifest.schema.json`, Pages `/components.schema.json`) — every component's tag, attributes, events, slots, methods, import path, define function, CDN URL, minimal example and prerequisites, plus the runtime modules; `llms.txt` (index) and `llms-full.txt` (full reference) at the Pages root. All generated from the source at build time.
- **Plugin ecosystem**: `create-motionary-plugin` scaffold (`npx -p motionary create-motionary-plugin my-plugin`: EffectPlugin, node:test test, README, `scripts/sign.mjs` writing the SHA-256 integrity into `motionary-plugin.json`); `motionary/marketplace` adds `pluginIntegrity()`, `verifyPlugin()` (SRI-style sha256/384/512 via Web Crypto), `satisfies()` (semver ranges) and `checkCompat()` (`engines.motionary`).
- **New components (10.1)** in `motionary/components/widgets`: `<usa-plugin-card>` — plugin detail card with compatibility + signature badges, animated download counter and expandable details (**Requires: motionary/runtime**); `<usa-install-button>` — npm / pnpm / yarn / bun / CDN tabs with copy-to-clipboard.
- Showcase: new gallery cards with copyable code, live demos and live Store thumbnails; the gallery and thumbnails register the runtime modules.

### Changed
- ROADMAP (track B): no third-party peer libraries and no umbrella bundle — each planned component is powered by a `motionary/runtime` module (scroll, text, smooth, gl, vector, physics, drag-snap) plus a format loader per version; official third-party runtimes only where a format cannot reasonably be implemented (Rive `.riv`, optional Lottie full-fidelity, Draco / KTX2), listed with reasons. `<usa-split-text>` and `<usa-carousel>` already exist, so the planned runtime components are `<usa-text-splitter>` and `<usa-snap-carousel>`.

### Accessibility
- `<usa-plugin-card>` counts and expands without animation under reduced motion; its details button exposes `aria-expanded`. `<usa-install-button>` tabs are a labelled `tablist`; the copy confirmation is announced (`aria-live`). A missing runtime module renders a visible `role="alert"` message instead of failing silently.

### Fixed
- The showcase snippet tests now accept the documented `motionary/runtime` and `motionary/runtime/<module>` entry points used by runtime-powered components' code tabs.
- `<usa-install-button>`: switching package-manager tabs now animates the command in (it changed abruptly); skipped under reduced motion.

## [10.0.0] - 2026-10-09

### ⚠️ Breaking
- **`registerEffectPacks()` removed** from `motionary/fx2` (deprecated in 9.9) → `registerAllPlugins()` (same behaviour) or only the plugins you use. `npx usa-codemod-10 --write src` rewrites it. See [docs/upgrading-10.md](./docs/upgrading-10.md).

### Added
- **New architecture — zero-dependency core `motionary/core`** (= `motionary/components/core`), **under 10 KB gzip** (≈ 2 KB; fixed size budget + test): `createMotion({ reducedMotion, rate })` → `use(...plugins)`, `play()`, `bind(el, effect, { trigger })`, `reveal(targets, preset, { stagger, once, threshold })`, `animate()`, `pause()` / `resume()` / `setRate()`, `has()`, `effects()`, `destroy()`; `PRESETS` (10 entrance presets), `preferredBackend()` (`webgpu` → `webgl2` → `canvas`), `VERSION`. See [docs/core.md](./docs/core.md).
- **Every effect as a plugin — `motionary/plugins`** (= `motionary/components/plugins`): every built-in effect pack as an `{ name, effects }` plugin (`retro`, `cinema`, `paper`, `cyber`, `weather`, …, `ALL_PLUGINS`) for `createMotion().use(…)` or `usePlugins(…)`; each import pulls in only its own pack.
- **WebGPU by default**: GPU effects and backgrounds keep `backend: 'auto'` = WebGPU → WebGL2 → Canvas, and plugins built on the core use the same order via `preferredBackend()`.
- Chinese roadmap v10.1 → v11.0 in [docs/ROADMAP.md](./docs/ROADMAP.md), with two new tracks across the minors: **AI-readable components** (components manifest + `llms.txt` in 10.1, per-component Markdown docs + `AGENTS.md` in 10.2, the `motionary-mcp` MCP server in 10.4) and **components that need peer plugins** (GSAP/ScrollTrigger, SplitType, Lenis, Three.js, lottie-web/Rive, Matter.js, Embla — optional peerDependencies, lazy-loaded with a clear error, prerequisites stated on every card / Store detail / docs page / README / manifest, and a "Requires: X" Store badge).
- npm: `motionary` and the `use-scroll-animate` alias are published with the `latest` tag.

### Accessibility
- The core honours reduced motion everywhere (OS setting or `reducedMotion: 'reduce'`): entrance presets fade instead of moving, loop / background / cursor effects are skipped, effects get `ctx.reduced`. `pause()` stops everything an instance started (WCAG 2.2.2).

### Fixed

- Tests: running `usa-codemod-10 --write` over the test suite also rewrote assertions about historical artifacts — the `usa-codemod-7` output and `docs/upgrading-7.md`, which still (correctly) name `registerEffectPacks` — and the new "`registerEffectPacks` is gone" check itself; those assertions are restored.

## [9.9.0] - 2026-10-09

### Added
- **Plugins API (9.9)** in `motionary/fx2` — every effect pack is a plugin: `definePlugin(name, effects, install?)`, `usePlugins(...plugins)` (registers each plugin once, returns its effect names), `effectPlugins()` (all built-in packs as `{ name: '<pack>', effects }`), `registerAllPlugins()`.
- `usa-codemod-10` (`npx usa-codemod-10 --write src`) and [docs/upgrading-10.md](docs/upgrading-10.md) — the 10.0 plan: zero-dependency core under 10 KB, effects only as plugins, WebGPU by default.

### Deprecated (removed in 10.0)
- `registerEffectPacks()` → `registerAllPlugins()` (same behaviour; warns once) — the codemod rewrites it. The showcase, `motionary/components/widgets/auto` and the internals already use the new names.

## [9.8.0] - 2026-10-09

### Added
- **Native 2.0 — `motionary/native`** (= `motionary/components/native`): `toReactNative(rules, { name })` (React Native component: `Animated` with the native driver, `Easing.bezier` from the rule's easing, token springs for presses, stagger via `index`, `AccessibilityInfo.isReduceMotionEnabled()`), `toFlutter(rules, { name })` (Flutter widget: `AnimationController` + `Cubic` curve, press `AnimatedScale`, `MediaQuery.disableAnimations`), `nativeEasing(easing, platform)`, `nativeTokens()` (durations, bezier arrays, springs as JSON), `entranceFrom(effect)`.
- Samples generated with them: `examples/native/react-native/` (`MotionView.tsx` + `App.tsx`) and `examples/native/flutter/lib/motion_view.dart`.
- **New component (9.8)** `<usa-native-preview>` in `motionary/components/widgets` — iOS / Android device frame that replays the entrance with the rule's curve and springs on press, with React Native / Flutter code tabs; `platform`, `rules`, `name`; `replay()`, `code(platform)`; `usa:replay`.
- Showcase: a new gallery card with copyable code, live demo and live Store thumbnail.

### Accessibility
- The generated native code honours the platform's reduce-motion setting (React Native `isReduceMotionEnabled`, Flutter `disableAnimations`). The preview's code tabs are a labelled `tablist`; the code panel is focusable.

### Fixed

- `toReactNative()` imported `Pressable` even when the motion string had no press / hover rule (unused import in the generated component); it is now imported only when the press wrapper is emitted.
- `prefersReducedMotion()` threw `Cannot read properties of undefined (reading 'matches')` when `matchMedia()` returned nothing (stubbed / partial environments), e.g. from a `<usa-splash>` timer firing after a test's teardown; it now treats a missing result as "no preference".

## [9.7.0] - 2026-10-09

### Added
- **Design tool integration — `motionary/design`** (= `motionary/components/design`):
  - `figmaToMotion(reactions)` — Figma prototype reactions (ON_CLICK / ON_HOVER / ON_PRESS / AFTER_TIMEOUT; DISSOLVE / SMART_ANIMATE / MOVE_IN / SLIDE_IN / PUSH; easing presets or custom bezier; duration) → a `data-motion` DSL string.
  - `framerComponent(desc, { name })` — a Framer code component (TSX with `addPropertyControls` for every attribute) from the 8.9 component JSON.
  - `motionToCss(rules, selector)` — `@keyframes` + rules (with stagger delays and a reduced-motion guard) for the entrance rules of a motion string.
  - `easingPoints(easing)` — cubic-bezier control points of a CSS easing.
- **Figma plugin scaffold** — `figma-plugin/` (manifest, code, UI, README; shipped in the npm package): select layers with prototype interactions → copy their `data-motion` strings.
- **New component (9.7)** `<usa-motion-spec>` in `motionary/components/widgets` — motion spec sheet for hand-off: per-rule trigger, timing bar on a shared axis, easing curve, Play playhead, Copy CSS; `parsed`, `css`, `play()`; `usa:copy`.
- Showcase: a new gallery card with copyable code, live demo and live Store thumbnail.

### Accessibility
- The spec sheet is a real `table` with row / column headers and a label; curves and bars are decorative next to their text values.

## [9.6.0] - 2026-10-09

### Added
- **Performance 3.0 — `motionary/fx/perf`** (= `motionary/components/fx-perf`, `registerPerf3Pack()`, also in `registerEffectPacks()` and the marketplace): `offscreenRender(canvas, program, { worker, paused })` (canvas animation in a Web Worker via OffscreenCanvas, main-thread fallback on the shared frame loop; `{ backend, stop, resize }`), `runInWorker(fn, ...args)` (one-off pure computation in a worker, inline fallback), `fpsMeter()`. Effects `idle-reveal` (enter — waits for `requestIdleCallback`) and `gpu-lift` (hover — compositor-only).
- **2 new components (9.6)** in `motionary/components/widgets`:
  - `<usa-perf-monitor>` — live overlay: FPS + sparkline, active animations, frame-loop callbacks, long tasks, clock state; `corner` (or `inline`), `collapsed`, `warn`; `stats`; `usa:jank` { fps }.
  - `<usa-worker-canvas>` — canvas animation rendered off the main thread (`scene` particles · orbits · starfield, or your `program`); `data-usa-backend` worker / main; `backend`; `usa:backend`; `WORKER_SCENES`.
- Showcase: 3 new gallery cards with copyable code, live demos and live Store thumbnails.

### Accessibility
- The perf monitor is a labelled `status` region with a real expand / collapse button (`aria-expanded`). The worker canvas is an `img` with `label`. Reduced motion: the worker canvas paints one still frame, `idle-reveal` shows at once, `gpu-lift` does nothing.

## [9.5.0] - 2026-10-09

### Added
- **Accessible motion 2.0 — `motionary/fx/safe`** (= `motionary/components/fx-safe`, `registerSafePack()`, also in `registerEffectPacks()` and the marketplace): `vestibularSafe(keyframes)` (strip movement, keep opacity / colour), `flashCount()` / `isFlashSafe(keyframes, duration, iterations)` (WCAG 2.3.1 three-flashes check), `applyMotionPreferences(prefs)` / `loadMotionPreferences()` (sensitivity level, shared clock speed, `data-usa-pause-autoplay` / `data-usa-no-parallax` on `<html>`, persisted). Effects that never move: `safe-fade` (enter), `focus-glow` (attention), `color-pulse` (attention), `underline-sweep` (hover) — they run under reduced motion too.
- **2 new components (9.5)** in `motionary/components/widgets`:
  - `<usa-motion-prefs>` — motion preference panel: level (Full · Gentle · Minimal · None), speed 0.25–2×, pause autoplaying video, no parallax, live sample, Reset; applies instantly and persists; `prefs`, `reset()`; `usa:change` { prefs }.
  - `<usa-pause-all>` — one button that pauses / resumes all motion (shared clock, CSS / Web animations, autoplaying media; WCAG 2.2.2), `aria-pressed`, synced with `motionClock`; `scope` limits it to a subtree; `paused`, `toggle()`; `usa:pause-all` { paused }.
- Showcase: 3 new gallery cards with copyable code, live demos and live Store thumbnails.

### Accessibility
- The preference panel is a labelled `form` with a `fieldset` / `legend` of radio buttons, a labelled range with an `<output>`, and checkboxes; its sample is `aria-hidden`. The pause button is a real `button` with `aria-pressed` and a text label.

### Fixed

- Build: Rollup ran out of heap at the 4 GB cap (`npm run build` aborted with "JavaScript heap out of memory") once the 9.5 entries were added; the build script's `--max-old-space-size` is raised to 6144.

## [9.4.0] - 2026-10-09

### Added
- **Video motion — `motionary/fx/video`** (= `motionary/components/fx-video`, `registerVideoPack()`, also in `registerEffectPacks()` and the marketplace): `scrubVideo(video, trigger?)` (scroll-driven video, eased `currentTime`), `frameSequence(canvas, { count, src | draw }, trigger?)` (Apple-style image sequences scrubbed by scroll, preloaded), `scrollProgress(el)`. Effects `film-burn` (enter) and `jump-cut` (attention).
- **2 new components (9.4)** in `motionary/components/widgets`:
  - `<usa-video-card>` — hover / focus plays a muted preview with a progress line, play badge and duration chip (`duration` or read from the video); poster Ken Burns drift when there is no playable video; click / Enter → `usa:open` { src }; `previewing`.
  - `<usa-hero-video>` — full-bleed hero: poster (`poster`, `<img>` or gradient) cross-fades to the background video when it can play, scrim, always-present pause / play button, `scrub` for a scroll-driven video, poster drift when no video; `paused`, `toggle()`; `usa:play` / `usa:pause`.
- Showcase: 3 new gallery cards with copyable code, live demos and live Store thumbnails.

### Accessibility
- The hero always offers a labelled pause / play button for moving video (WCAG 2.2.2) and is a labelled `region`; background videos are muted and `aria-hidden`. The video card is a focusable button labelled "Play <title>". Reduced motion: no autoplay or preview (poster only), scrubbing shows the first frame, `film-burn` fades, `jump-cut` does nothing.

## [9.3.0] - 2026-10-09

### Added
- **2 new components (9.3)** in `motionary/components/widgets`:
  - `<usa-gen-art>` — seeded generative artwork on a canvas: `art` = `flow` (flow field) · `circles` (circle packing) · `truchet` (quarter-arc tiles) · `waves` (layered ridges), `seed`, `palette`, `label`; draws itself in on screen; click / Enter re-seeds; `generate(seed?)`, `toDataURL()`, `seed`; `usa:generate` { seed }.
  - `<usa-bg-generator>` — background generator: palette + style (`mesh`, `grain`, `stripes`, `dots`) + shuffle, live preview with a cross-fade, copy the CSS; `css`, `shuffle()`, `copy()`; `usa:change` { css, seed }; `backgroundCss()`.
- **Generative art 2.0 pack — `motionary/fx/genart`** (= `motionary/components/fx-genart`, `registerGenArtPack()`, also in `registerEffectPacks()` and the marketplace): `halftone-in` (enter), `mesh-drift` (loop), `kaleido` (loop), `grain-flicker` (loop). `PALETTES`, `seededRandom()`, `meshGradient()`.
- Showcase: 4 new gallery cards with copyable code, live demos and live Store thumbnails.

### Accessibility
- `<usa-gen-art>` is a focusable `img` whose label names the art style and seed (updated on re-seed). `<usa-bg-generator>` is a labelled `group` of real `<select>`s and buttons; the preview is `aria-hidden` and the CSS is shown as text. Reduced motion: artwork is drawn at once, no cross-fade, `halftone-in` fades, the loops are skipped.

## [9.2.0] - 2026-10-09

### Added
- **Lottie / Rive import — `motionary/fx/lottie`** (= `motionary/components/fx-lottie`, `registerLottiePack()`, also in `registerEffectPacks()` and the marketplace): `lottieToKeyframes(json)` (layer position / anchor / rotation / scale / opacity → WAAPI keyframes + duration), `lottieToSvg(json)` (ellipse / rect / path shapes with fill / stroke, nested groups), `riveInputs(instance, stateMachine, el, { hover, press, click, enter })` (drive a Rive state machine's boolean / trigger inputs). Effects `lottie-play` (attention) and `icon-pop` (click).
- **2 new components (9.2)** in `motionary/components/widgets`:
  - `<usa-lottie>` — Lottie player without lottie-web: `src` or `json`, `autoplay` (on screen), `loop`, `speed`, `label`; `play()`, `pause()`, `stop()`, `parsed`; `usa:load` { duration, layers }, `usa:complete`, `usa:error`.
  - `<usa-lottie-icon>` — animated icon set shipped as tiny Lottie files (`heart`, `bell`, `check`, `spinner`, `star`, `bolt`; JSON exported as `LOTTIE_ICONS`); `trigger` click · hover · enter · loop, `size`, `color`, `label`; `play()`.
- Showcase: 3 new gallery cards with copyable code, live demos and live Store thumbnails.

### Accessibility
- `<usa-lottie>` is an `img` with `label`; icons are decorative (`aria-hidden`) unless they get a `label` (then `img`). Reduced motion: the first frame is shown, nothing autoplays, `icon-pop` / `lottie-play` do nothing.

## [9.1.0] - 2026-10-09

### Added
- **2 new components (9.1)** in `motionary/components/widgets` (also in `dist/widgets.umd.js`):
  - `<usa-chapter-nav>` — chapter navigation for long-form stories: one entry per `[data-chapter]` section in `for` (title from `data-chapter` or its first heading), per-chapter reading-progress bars, `aria-current="step"` on the current chapter, click to glide there; `orientation`, `label`; `current`, `goTo(i)`; `usa:chapter` { index, title }.
  - `<usa-scene>` — scroll-scrubbed cinematic shot: its media (`img` / `video` / `[data-shot]`) follows a `camera` move (`dolly-in` · `dolly-out` · `pan-left` · `pan-right` · `tilt-up` · `tilt-down` · `zoom-in` · `zoom-out` · `orbit`, `strength`) as the scene crosses the viewport; `[data-caption][data-at]` captions fade in on cue; `autoplay` plays the move on its own (back and forth) instead of following the scroll; `progress`, `setProgress(p)`; `usa:shot`.
- **Cinematic pack — `motionary/fx/cinema`** (= `motionary/components/fx-cinema`, `registerCinemaPack()`, also in `registerEffectPacks()`): `dolly-in` (enter), `pan-reveal` (enter), `letterbox` (enter), `rack-focus` (attention). `cameraFrame(move, p, strength)`, `CAMERA_MOVES`. Listed in the `motionary/marketplace` catalogue.
- Showcase: 4 new gallery cards with copyable code, live demos and live Store thumbnails.

### Accessibility
- Chapter nav is a labelled `navigation` with an ordered list of real buttons; the current one has `aria-current="step"`; bars are `aria-hidden`. Scene captions are real text in reading order. Reduced motion: the scene is a still frame with captions shown, chapter jumps are instant, entrances fade, `rack-focus` does nothing.

## [9.0.0] - 2026-10-09

### ⚠ Breaking
- Removed the 8.9 deprecations: `applyTheme()`, `THEMES`, `THEME_NAMES`, `<usa-theme>` / `defineTheme()` (`motionary/components/effects`). Use `applyMotionTheme()`, `MOTION_THEMES`, `MOTION_THEME_NAMES`, `<usa-motion-theme>` / `defineMotionTheme()` — same behaviour. `npx usa-codemod-9 --write src` rewrites identifiers and tags; see [docs/upgrading-9.md](docs/upgrading-9.md).

### Added
- **Declarative motion DSL — `motionary/dsl`** (= `motionary/components/dsl`): one readable string per element — `data-motion="enter: fade-up 600ms ease-out stagger 80ms; hover: pop; click: confetti count=40"`. Triggers `enter` · `click` · `hover` · `load` · `loop` · `manual`; modifiers: duration (`600ms` / `0.6s`), `delay`, `stagger` (children in turn — `delay` / `stagger` are passed as the effect's `delay` option, honoured by the entrance presets and every effect that takes one), easing (`ease-out`, `spring`, `smooth`, `cubic-bezier(…)`, `steps(…)`), `once`, `key=value` effect options. `applyMotion(root, { observe })`, `bindMotion(el, rules)`, `parseMotion()` (rules + readable errors), `serializeMotion()`, `motion` tagged template, `createComponent(json)` (builds live markup from the 8.9 `describeComponent()` JSON).
- **Plugin marketplace GA — `motionary/marketplace`** (`motionary/components/marketplace` now re-exports it and keeps the 6.9 manifest API): `MARKETPLACE` (first-party catalogue of the 8.x effect packs), `searchPlugins(query)`, `installPlugin(listing | url, { load })` (first-party registrar or validated third-party pack), `installedPlugins()`, `fetchMarketplace(url)` (`motionary/marketplace` v1 index).
- **2 new components (9.0)** in `motionary/components/widgets`: `<usa-motion rules="…">` (the DSL as an element; `parsed`, `errors`, `usa:motion-error`) and `<usa-plugin-store>` (search + one-click install with staggered result cards; `plugins`, `loader`, `search()`, `install()`; `usa:install` / `usa:install-error`).
- Chinese roadmap 9.1 → 10.0 (`docs/ROADMAP.md`). `motionary` and `use-scroll-animate` are published with the npm `latest` tag.

### Accessibility
- `<usa-plugin-store>` is a labelled `search` region with a labelled search field, a live result count and real buttons whose text reports the install state. `<usa-motion>` adds no semantics; effects bound by the DSL honour reduced motion like every other effect.

### Fixed
- `<usa-plugin-store>` called `CSS.escape` without checking that the `CSS` global exists (throws in jsdom / some SSR shims) — now guarded with a fallback.
- the 9.0 removal check treated the internal style-sheet id and the theme switcher's `localStorage` key `'usa-theme'` as leftovers of `<usa-theme>`; they are kept (saved theme choices survive the upgrade).
- the gallery / Store motion-theme cards still named the removed `defineTheme` (they would not have defined their element) → `defineMotionTheme`.

## [8.9.0] - 2026-10-09

### Added
- **Low-code component export (8.9)** in `motionary/components/widgets` (also in `dist/widgets.umd.js`):
  - `exportComponent(el, 'html' | 'react' | 'vue' | 'json')` — copy-paste code for any live, configured element (runtime attributes / generated parts stripped; HTML gets a CDN module import, React a `useEffect(defineWidgets)` component, Vue an SFC); `describeComponent(el)` — the portable JSON (`motionary/component@1`) the 9.0 declarative DSL reads.
  - `<usa-code-export>` — shows that code in HTML / React / Vue / JSON tabs (`formats`) for its child or `for` target, follows attribute changes, one-click copy (`copy()`, `usa:copy` { format, ok }); `format`, `code`.
  - `<usa-prop-panel>` — property editor bound to a live component's attributes (`for` selector or `previous`): `props="value:number:0:100, icon:select:star|heart, readonly:boolean, color:color, label:text"` (falls back to its `observedAttributes`); `reset()` (also a Reset button); `usa:prop` { name, value }; `parseProps()`.
- `usa-codemod-9` (`npx usa-codemod-9 --write src`) and [docs/upgrading-9.md](docs/upgrading-9.md).
- `applyMotionTheme()`, `MOTION_THEMES`, `MOTION_THEME_NAMES`, `<usa-motion-theme>` / `defineMotionTheme()` — the 9.0 names of the 5.8 motion-theme API (`motionary/components/effects`).

### Deprecated (removed in 9.0)
- `applyTheme()`, `THEMES`, `THEME_NAMES`, `<usa-theme>` / `defineTheme()` — renamed with a `Motion` prefix so they can't be confused with the 8.6 surface themes (`applySurfaceTheme`, `SURFACE_THEMES`). `applyTheme()` and `<usa-theme>` warn once in the console; the codemod rewrites identifiers and tags.

### Accessibility
- Code export: a `tablist` with arrow keys and a focusable `tabpanel`; the copy button reports "Copied ✓" in text. Property panel: a labelled `form` with a `<label>` for every field, `<output>` readouts and `role="switch"` checkboxes.

### Fixed
- the low-code export test checked the whole `<usa-hud-panel>` description for `usa-hud` (always present in the tag name); it now checks that the generated HUD parts are stripped from the children.

## [8.8.0] - 2026-10-09

### Added
- **2 new components (8.8)** in `motionary/components/widgets` (also in `dist/widgets.umd.js`):
  - `<usa-panorama>` — 360° panorama viewer: drag / swipe to look around with inertia, slow `autorotate` (°/s, `0` off, pauses on hover / focus), ← / → keys, compass, built-in procedural landscape when no `src`; "View in XR" badge when WebXR immersive sessions are offered (`usa:xr` { mode }, `usa:xr-request`); `yaw`, `lookAt(deg)`; `usa:look` { yaw }.
  - `<usa-spatial-card>` — spatial-computing window: frosted glass floating in depth, gaze highlight following the pointer, `[data-depth]` layers, `[slot=ornament]` bar below the window; eases forward on hover / focus, sinks on press; `active`; `usa:focus-depth` { active }.
- **XR / spatial pack — `motionary/fx/spatial`** (= `motionary/components/fx-spatial`, `registerSpatialPack()`, also in `registerEffectPacks()`): `portal-open` (enter), `orbit-in` (enter), `spatial-float` (loop), `depth-pop` (attention). `yawToOffset()`, `xrSupport()` (WebXR session detection).
- Showcase: 4 new gallery cards with copyable code, live demos and live Store thumbnails.

### Accessibility
- The panorama is a focusable `img` (roledescription "panorama") with your `label`; ← / → look around; auto-rotate pauses while hovered or focused. The spatial card keeps its content in reading order, the gaze layer is `aria-hidden`. Reduced motion: no auto-rotate, inertia or depth transitions; `portal-open` / `orbit-in` just show, `spatial-float` is skipped, `depth-pop` does nothing.

## [8.7.0] - 2026-10-09

### Added
- **2 new components (8.7)** in `motionary/components/widgets` (also in `dist/widgets.umd.js`):
  - `<usa-gyro-card>` — 3D card that tilts with the phone's gyroscope (`deviceorientation`, iOS permission asked on first tap) and with the pointer on desktop; moving glare, `[data-depth]` layers float at different depths; `max`, `glare`; `tilt(rx, ry)`, `wobble()`, `source`; `usa:tilt` { rx, ry, source }.
  - `<usa-gesture-sticker>` — multi-touch sticker: one finger drags, two fingers pinch-scale and twist-rotate simultaneously, lifted shadow while held, springy settle; wheel / Shift + wheel; arrows, + / −, [ / ], 0; `min`, `max`; `x`, `y`, `scale`, `angle`, `transformTo()`, `reset()`; `usa:transform`.
- **Gestures 3.0 pack — `motionary/fx/gesture`** (= `motionary/components/fx-gesture`, `registerGesture3Pack()`, also in `registerEffectPacks()`): `swipe-hint` (attention), `pinch-hint` (attention), `tilt-wobble` (attention), `depth-in` (enter). `pinchScale()`, `pinchAngle()`, `orientationToTilt()`.
- Showcase: 4 new gallery cards with copyable code, live demos and live Store thumbnails.

### Accessibility
- The sticker is a focusable `group` (roledescription "sticker") whose label explains the gestures; every gesture has a keyboard equivalent. The gyro card keeps your content readable and the glare is `aria-hidden`. Reduced motion: the gyro card stays flat, the sticker moves without spring, the hints and wobble do nothing, `depth-in` just shows.

### Fixed
- the gallery id `fx-depth` is taken by the 6.5 depth card → the 8.7 card is `fx-depth-in`.
- `orientationToTilt()` returned `-0` for a device at rest (beta = rest angle) — the tilt is now normalised to `0` (no `-0` in `usa:tilt` details / CSS vars).
- the gyro card only moved with a real gyroscope or a mouse over it, so its gallery card and Store thumbnail sat still — added `wobble()` (a short tilt sweep, skipped under reduced motion) and a "Wobble" button in the gallery / Store demo.

## [8.6.0] - 2026-10-09

### Added
- **Theme system (8.6)** — five surface themes (`light`, `dark`, `neon`, `glass`, `neu` / neumorphism) driven by a `data-usa-surface` attribute; `SURFACE_THEMES`, `applySurfaceTheme(name, target?)`.
- **2 new components (8.6)** in `motionary/components/widgets` (also in `dist/widgets.umd.js`):
  - `<usa-theme-switcher>` — segmented theme switcher: sets `data-usa-surface` on `target` (default `<html>`), sliding pill, circular View-Transition wipe from the click point (page-level), `themes`, `value`, `persist` (localStorage key); `usa:change` { theme }.
  - `<usa-theme-surface>` — themeable card that follows the nearest `data-usa-surface` (or its own `theme`): neon glow edge that pulses, frosted glass with a sheen, soft neumorphic relief that presses; cross-fades on theme change; `theme`; `usa:theme` { theme }.
- **Surface theme pack — `motionary/fx/surface`** (= `motionary/components/fx-surface`, `registerSurfacePack()`, also in `registerEffectPacks()`): `neon-ignite` (enter), `neon-pulse` (loop), `glass-frost` (enter), `neu-press` (attention). Names chosen not to override the existing 3.x `neon-flicker` theme effect.
- Showcase: 4 new gallery cards with copyable code, live demos and live Store thumbnails.

### Accessibility
- Theme switcher is a labelled `radiogroup` of `radio`s with roving tabindex and arrow keys; the swatches are `aria-hidden`. Theme surfaces keep your content and text contrast in every theme. Reduced motion: the switch is instant (no wipe, no pill slide), the neon / sheen loops stop, `neon-ignite` / `glass-frost` just show, `neon-pulse` is skipped, `neu-press` does nothing.

### Fixed
- the 5.8 theme packs (applyTheme / <usa-theme>) already own the `data-usa-theme` attribute, so the 8.6 surface themes use `data-usa-surface` instead (no clash with neon/paper/glass/retro/brutalist motion themes); effect names neon-ignite (not the 5.8 neon-flicker) and 8.5 paper-unfold (not 5.8 paper-fold) avoid overriding existing effects.

## [8.5.0] - 2026-10-09

### Added
- **2 new components (8.5)** in `motionary/components/widgets` (also in `dist/widgets.umd.js`):
  - `<usa-sticky-wall>` — wall of sticky notes: each child becomes a pinned paper note (`data-color` yellow · pink · blue · green, or cycling) with a slight tilt (`seed`); notes drop onto the wall one by one on first view; click / Enter lifts a note to the front (`pick(index)`, `usa:pick` { index }); `notes`, `label`.
  - `<usa-sketch-chart>` — hand-drawn chart: wobbly pencil axes, hatched bars (`type="bar"`) or a sketchy line with dots (`type="line"`), sketched in stroke by stroke on first view; `values`, `labels`, `color`, `label`; `values` / `setValues()`; `usa:drawn`.
- **Paper & hand-drawn pack — `motionary/fx/paper`** (= `motionary/components/fx-paper`, `registerPaperPack()`, also in `registerEffectPacks()`): `paper-unfold` (enter), `pencil-sketch` (enter), `watercolor` (enter), `crumple` (attention). `roughLine()`, `paperRandom()`.
- Showcase: 4 new gallery cards with copyable code, live demos and live Store thumbnails.

### Accessibility
- Sticky wall is a `list` of focusable `listitem`s (Enter / Space picks a note). Sketch chart is an `img` whose label lists every label and value; the drawing is `aria-hidden`. Reduced motion: notes and charts are shown at once, `paper-unfold` / `watercolor` fade in, `pencil-sketch` shows the drawing, `crumple` does nothing.

### Fixed
- the 5.8 theme pack already registers a `paper-fold` effect, so the 8.5 unfold effect is named `paper-unfold` (registering it as `paper-fold` would have overridden the 5.8 theme effect).
- the sketch chart only sketched itself once, on first view — it now re-sketches on click / `redraw()` (gallery and Store demos replay it).
- the sticky-wall and sketch-chart gallery / Store demos only animated once on first view — demos now have "Pick a note" / "New data" buttons (wired to `pick()` / `setValues()` + `redraw()`).

## [8.4.0] - 2026-10-09

### Added
- **2 new components (8.4)** in `motionary/components/widgets` (also in `dist/widgets.umd.js`):
  - `<usa-hud-panel>` — sci-fi HUD panel: angled corners, a glowing frame that draws itself in on first view, header with blinking status light (`title`, `status`, `color`), `<p data-value="72">` rows become animated bar readouts; `boot()` replays the intro, `usa:boot`.
  - `<usa-radar>` — radar scope: a conic beam sweeps round (`speed` s per turn, `rings`) and targets (`targets="Name:bearing,distance; …"`) light up as the beam passes; `targets` / `setTargets()`, `usa:ping` { name }; `parseTargets()`.
- **Cyber pack — `motionary/fx/cyber`** (= `motionary/components/fx-cyber`, `registerCyberPack()`, also in `registerEffectPacks()`): `hud-frame` (enter), `scanline-sweep` (attention), `hologram` (loop), `data-decode` (enter). `decodeFrame()`.
- Showcase: 4 new gallery cards with copyable code, live demos and live Store thumbnails.

### Accessibility
- HUD panel is a labelled `region` (its `title`); the frame and bars are `aria-hidden`, the percentage is real text. Radar is an `img` whose label lists every target with its bearing; the sweep only runs on screen. `data-decode` keeps the real text as `aria-label` while it scrambles. Reduced motion: the panel shows at once, the radar is a still scope with all targets lit, `hud-frame` / `data-decode` just show, `scanline-sweep` does nothing, `hologram` is skipped.

### Fixed
- the 8.4 hologram gallery card id `fx-holo` collided with the 5.x "Holographic card" card (catalog ids must be unique — caught by the showcase catalog test) → renamed `fx-hologram`; a duplicate-id check now runs at staging.


## [8.3.0] - 2026-10-09

### Added
- **2 new components (8.3)** in `motionary/components/widgets` (also in `dist/widgets.umd.js`):
  - `<usa-organic-card>` — card with a soft, living blob outline: breathes slowly while on screen, morphs on hover (`morph(seed)`), `tint` leaf · ocean · petal · sand, `seed` for the starting shape.
  - `<usa-liquid-nav>` — navigation bar with a liquid-drop indicator that stretches towards the next item and settles with a wobble (gooey SVG filter); children are links / buttons, `aria-current="page"`, `value`, arrow keys, `label`; `usa:change` { index, item }.
- **Organic pack — `motionary/fx/organic`** (= `motionary/components/fx-organic`, `registerOrganicPack()`, also in `registerEffectPacks()`): `vine-grow` (enter), `bloom` (enter), `water-drop` (attention), `breathe` (loop). `blobRadius()`.
- Showcase: 4 new gallery cards with copyable code, live demos and live Store thumbnails; Animation Store 343 → 347 items.

### Accessibility
- Liquid nav is a labelled `navigation` that keeps `aria-current="page"` on the active item and moves focus with ← / →; the drop is `aria-hidden`. Organic card keeps your content and shows a focus ring when something inside is focused. Reduced motion: static blob, the drop jumps, `vine-grow` shows the vine, `bloom` fades in, `water-drop` does nothing, `breathe` is skipped.

## [8.2.0] - 2026-10-08

### Added
- **2 new components (8.2)** in `motionary/components/widgets` (also in `dist/widgets.umd.js`):
  - `<usa-terminal>` — retro terminal window: child `<p data-cmd>` lines are typed after the `prompt` (default `$`) with a blinking block cursor, other children print as output, line by line, when it scrolls into view; `title`, `theme` (dark · green · amber phosphor glow), `speed`, `loop`; `replay()`, `skip()`; `usa:done`.
  - `<usa-retro-button variant="pixel | crt | y2k | win95">` — retro buttons with era-true press motion (stepped 8-bit press, phosphor flicker, chrome bounce, bevel sink); the content becomes a real `<button>` (`type`, `disabled`, `name`, `value`); `RETRO_VARIANTS`.
- **Retro pack — `motionary/fx/retro`** (= `motionary/components/fx-retro`, `registerRetroPack()`, also in `registerEffectPacks()`): `pixelate-in` (enter), `crt-power` (enter), `vhs-glitch` (attention), `y2k-shine` (attention). `pixelSteps()`. (The 5.8 theme effects `retro` / `retro-scanlines` are unchanged.)
- Showcase: 4 new gallery cards with copyable code, live demos and live Store thumbnails; Animation Store 339 → 343 items.

### Accessibility
- Terminal output is a labelled `role="log"`; the prompt and cursor are `aria-hidden`. Retro buttons are real `<button>`s with visible focus styles per variant. Reduced motion: the terminal shows everything at once (no blink), buttons only change colour, `pixelate-in` / `crt-power` fade in, `vhs-glitch` does nothing, `y2k-shine` is a short brightness flash.

## [8.1.0] - 2026-10-08

### Added
- **2 new components (8.1)** in `motionary/components/widgets` (also in `dist/widgets.umd.js`):
  - `<usa-red-envelope>` — Lunar New Year red envelope (红包): tap / Enter / Space → the flap swings open, the card slides out with `amount` counting up (`currency`, default ¥) and gold coins pop out; `message` (恭喜发财), `from`, `opened`; `open()`, `close()`, `opened`; `usa:open` { amount }.
  - `<usa-festival-banner theme="lunar | xmas | halloween | fireworks">` — announcement banner with an ambient festive scene behind its text (lanterns + sparkles, lights + snow, bats + moon, rockets), animating only while on screen; `dismissible` → close button (`usa:dismiss`), `label`; `FESTIVAL_THEMES`.
- **Festival packs — `motionary/fx/festival`** (= `motionary/components/fx-festival`, `registerFestivalPack()`, also in `registerEffectPacks()`): `firework-burst` (attention), `lantern-rise` (enter), `xmas-snow` (loop), `spooky-float` (attention). `sparkVectors()`.
- Showcase: 4 new gallery cards with copyable code, live demos and live Store thumbnails; Animation Store 335 → 339 items.

### Fixed
- Store live thumbnails (`showcase/thumb.js`): the CDN fallback still pointed at `motionary@7` after 8.0 → `motionary@8`.

### Accessibility
- Red envelope is a real `<button aria-expanded>` with a descriptive label; the amount is announced through a polite live region. Banner: labelled `region`, decorations `aria-hidden`, real dismiss button. Reduced motion: envelope opens without swing / slide / count / coins, the banner scene is static, `firework-burst` / `spooky-float` do nothing, `xmas-snow` is skipped, `lantern-rise` fades in.

## [8.0.0] - 2026-10-08

### ⚠️ Breaking
- **`<usa-rating>` / `defineRating()` removed** (deprecated in 7.9) → `<usa-star-rating>` / `defineStarRating()` from `motionary/components/widgets` (same `value`, `max`, `readonly`, `label`, `name`; `icon="heart"`; `--usa-star-on`). `npx usa-codemod-8 --write src` rewrites tags, icons and the CSS variable. See [docs/upgrading-8.md](./docs/upgrading-8.md).
- Frame loops on the shared scheduler receive a `dt` scaled by the motion clock rate (identical at the default rate 1) and are not called while the clock is paused.

### Added
- **Unified timeline engine — `motionary/engine`** (= `motionary/components/engine`): one clock drives every component, effect and frame loop. `motionClock` (`rate` 0.05–8, `pause()`, `resume()`, `toggle()`, `paused`, `time`, `onChange()`); low-level `getClock()`, `setClock({ rate, paused })`, `onClockChange()`, `trackAnimation()` (also in `motionary/components`' base). Every animation started through the library (`animateWithMotion`, so all `<usa-*>` elements and registered effects) is on the clock.
- **`createTimeline()`** — sequence animations on the clock: `add(target | targets, keyframes, duration | options (+ stagger), position)` with positions `1200`, `'+=200'`, `'-=100'`, `'<'`, `'<+=80'`, `'>'`; `play()`, `pause()`, `seek(ms)`, `restart()`, `cancel()`, `progress` (get / set), `duration`, `playing`, `finished`; `resolvePosition()`.
- **SSR hydration animations** — `ssrHead(nonce?)` (`<style>` + one-line `<script>` for the server-rendered head), `HYDRATION_CSS`, `hydrateMotion(root, { stagger, duration, preset, easing })` animates `[data-usa-hydrate="fade | fade-up | fade-down | scale | blur | slide-left"]` (per-element `data-usa-delay`) and emits `usa:hydrated`; `HYDRATE_PRESETS`. No-JS: content visible; JS that never runs: 3 s CSS fallback.
- **2 new components (8.0)** in `motionary/components/widgets`: `<usa-clock-control>` (pause / speed bar for the motion clock, `speeds`, `usa:change`) and `<usa-hydrate effect stagger duration>` (SSR hydration wrapper for its children, `replay()`, `timeline`, `usa:hydrated`).
- Chinese roadmap v8.1 → v9.0 in [docs/ROADMAP.md](./docs/ROADMAP.md).
- Showcase: 2 new gallery cards with copyable code, live demos and live Store thumbnails; the legacy Rating gallery card is gone (Animation Store 333 → 335 items).
- npm: `motionary` and the `use-scroll-animate` alias are published with the `latest` tag.

### Accessibility
- Clock control: labelled group, play / pause toggle with `aria-pressed` and a changing label, speeds as a `radiogroup` of `radio` buttons — a page-wide "pause animations" control (WCAG 2.2.2). Hydration never hides content without JS or under reduced motion, and the CSS fallback reveals it after 3 s. Reduced motion: timelines jump to their end, hydration shows at once.

## [7.9.0] - 2026-10-08

### Added
- **2 new components (7.9)** in `motionary/components/widgets` (also in `dist/widgets.umd.js`):
  - `<usa-command-palette>` — ⌘K command palette on the native `<dialog>` (top layer, Esc, focus returns): scales in, fuzzy filtering with highlighted letters, results stagger in, a highlight glides between rows (↑ / ↓ / Enter, hover, click), groups. Commands from child `<option value data-group data-keys>` or `setCommands([{ id, label, group, keys }])`; `hotkey` (default `mod+k`, `none`), `inline` (rendered open in the page, no dialog), `placeholder`, `label`; `show()`, `close()`, `toggle()`, `opened`; `usa:run` { id, label }, `usa:open`, `usa:close`. Helpers `fuzzyMatch()`, `keyLabels()`, `matchesKeys()`.
  - `<usa-shortcut keys="mod+k">` — keyboard-shortcut hint as keycaps (⌘ / ⇧ / ⌥ on Apple platforms, Ctrl / Shift / Alt elsewhere) with an optional `label`; pressing the combination anywhere presses the caps one after another and fires `usa:trigger` (`for="id"` clicks that element, `listen="false"` only displays); `press()`.
- **`npx usa-codemod-8`** (new bin) and **[docs/upgrading-8.md](./docs/upgrading-8.md)**.
- `<usa-star-rating>` is now form-associated (`name` submits the value) and also fires a native `change`; `icon` accepts the old `<usa-rating>` characters (★ ♥).
- Showcase: 2 new gallery cards with copyable code, live demos and live Store thumbnails; Animation Store 331 → 333 items.

### Deprecated (removed in 8.0 — warns once in the console)
- `<usa-rating>` / `defineRating()` → `<usa-star-rating>` / `defineStarRating()` (same `value`, `max`, `readonly`, `label`, `name`; `icon="♥"` → `icon="heart"`; `--usa-rating-on` → `--usa-star-on`). `npx usa-codemod-8 --write src` rewrites tags, icons and the CSS variable (manual report for `defineRating`, `createElement` and CSS selectors).

### Accessibility
- Palette: `combobox` input with `aria-activedescendant` over a `listbox` of `option`s (`aria-selected`), group headings are presentational, "No results" is shown as text. Shortcut: keycaps are one `role="img"` with a spoken label ("Command K" / "Control K"). Reduced motion: no scale, stagger, glide or key press.

## [7.8.0] - 2026-10-08

### Added
- **3 new components (7.8)** in `motionary/components/widgets` (also in `dist/widgets.umd.js`):
  - `<usa-chat-composer>` — AI chat input: the textarea grows with its text (up to `rows`, default 6), Enter sends / Shift+Enter new line, the send button pops when there is text and morphs into Stop while `busy`, when a conic "thinking" glow runs round the composer. `usa:send` { text } (cancelable), `usa:stop`; `placeholder`, `label`, `value`, `busy`, `send()`, `clear()`.
  - `<usa-suggestion-chips>` — follow-up prompt chips from `items="a|b|c"` (or child elements): slide in one after another, picking pulses the chip and emits `usa:pick` { text, index }; `dismiss` fades the others; `setItems()` / `items`; arrow keys. `parseChips()`.
  - `<usa-voice-button>` — push-to-talk mic: toggles `listening` (`usa:start` / `usa:stop`), a halo breathes and `bars` (3–9) wave; set `level` (0–1) from an analyser / speech API and both follow it. `toggle()`; `waveBars()`.
- **AI UI motion — `motionary/fx/ai`** (= `motionary/components/fx-ai`, `registerAiPack()`, also in `registerEffectPacks()`): `stream-text` (enter), `thinking-glow` (loop), `voice-wave` (attention), `gen-skeleton` (enter). `splitWords()`.
- Showcase: 5 new gallery cards with copyable code, live demos and live Store thumbnails; Animation Store 326 → 331 items.

### Accessibility
- Composer: labelled textarea, the button's `aria-label` switches Send ↔ Stop generating. Chips: labelled list of real buttons, arrow-key navigation, dismissed chips are disabled. Voice button: a real `<button aria-pressed>`. `stream-text` restores the original text nodes when it finishes (screen readers read the full text). Reduced motion: no glow, pop, slide, halo or wave; `stream-text` shows the text at once, `thinking-glow` is skipped, `voice-wave` does nothing, `gen-skeleton` fades in.

## [7.7.0] - 2026-10-08

### Added
- **3 new components (7.7)** in `motionary/components/widgets` (also in `dist/widgets.umd.js`):
  - `<usa-field>` — animated text input: the `label` floats up on focus / when filled, the underline grows, native validation on blur (`type`, `required`, `pattern`, `minlength`, `maxlength`) — invalid shakes and slides the message in (`usa:invalid`, custom text via `error`), valid draws a check (`usa:valid`); `hint`; `strength` adds a 4-step password meter. The `<input>` is in the light DOM, so forms submit it by `name`. `value`, `validate()`, `input`; `passwordStrength()`.
  - `<usa-otp>` — one-time-code input: `length` boxes (3–10, default 6), auto-advance, Backspace / arrow keys, paste a whole code, `autocomplete="one-time-code"`, `mode="alnum"`, initial `value`; digits pop in; `usa:complete` { code }; `error(message)` shakes red and clears, `success()` green wave, `fillCode(code)`, `clear()`. `sanitizeCode()`.
  - `<usa-upload-progress>` — file row: `name`, `size` (bytes), `value` 0–100 (bar eases, shine while uploading), `status` uploading | done | error, `message`; done draws a check (`usa:done`), error shakes + Retry (`usa:error`, `usa:retry`). `formatBytes()`.
- **Form motion — `motionary/fx/form`** (= `motionary/components/fx-form`, `registerFormPack()`, also in `registerEffectPacks()`): `field-shake` (attention), `field-success` (attention), `label-float` (enter), `form-cascade` (enter). `shakeFrames()`.
- Showcase: 5 new gallery cards with copyable code, live demos and live Store thumbnails; Animation Store 321 → 326 items.
- Note: the plan's "success check" ships as `field-success` (the existing `success-check` effect is unchanged).

### Accessibility
- Field: real `<label for>`, `aria-invalid`, message in an `aria-live` region linked with `aria-describedby`. OTP: labelled `role="group"`, each box labelled "Digit n of N". Upload: `role="progressbar"` with `aria-valuenow` / `aria-valuetext`, a real Retry button. Reduced motion: no shake, pop, wave, shine or easing — states switch at once; `field-shake` / `field-success` only flash the outline, `label-float` / `form-cascade` fade in.

## [7.6.0] - 2026-10-08

### Added
- **2 new components (7.6)** in `motionary/components/widgets` (also in `dist/widgets.umd.js`):
  - `<usa-globe>` — SVG globe in orthographic projection (no WebGL, no tiles): graticule, pulsing `markers` ("Shanghai:31.2,121.5; London:51.5,-0.1"), `speed` (°/s, 0 = still), `tilt`, `lon`; spins only while on screen, drag to turn; `flyTo(name)` eases a marker round to the front (`usa:focus`). `project()`, `parseMarkers()`.
  - `<usa-location-card>` — place card with a stylised mini map: `name`, `address`, `lat`/`lon`, origin `from-lat`/`from-lon` (distance by haversine, `unit` km | mi, or `distance`), `href` → “Directions”. On first view the route draws itself, the pin drops with a bounce and a ring pulses; `replay()`; `usa:arrive`. `haversine()`, `formatDistance()`.
- **Maps & geo motion — `motionary/fx/geo`** (= `motionary/components/fx-geo`, `registerGeoPack()`, also in `registerEffectPacks()`): `route-draw` (enter), `marker-pulse` (attention), `pin-drop` (enter), `globe-spin` (enter). `routeLength()`.
- Showcase: 4 new gallery cards with copyable code and live demos (and live Store thumbnails); Animation Store 317 → 321 items.
- Note: the plan's “flight lines” (飞线) ship as `route-draw` over any SVG path.

### Accessibility
- Globe = `role="img"` labelled with its marker names; location card = labelled `<article>` with a heading and a real link. Reduced motion: the globe does not spin and `flyTo()` jumps; pin and route appear at once; `route-draw` shows the routes, `marker-pulse` does nothing, `pin-drop` / `globe-spin` fade in.

## [7.5.0] - 2026-10-08

### Added
- **4 new components (7.5)** in `motionary/components/widgets` (also in `dist/widgets.umd.js`):
  - `<usa-leaderboard>` — ranked list from `<li data-score>` children or `rows`: on score changes rows glide to their new rank (FLIP), climbers flash green with ▲n, fallers red with ▼n, scores roll; 🥇🥈🥉 for the top three; `limit`, `me`; `setScore()`; `usa:rank`. `rankRows()`.
  - `<usa-xp-bar>` — experience bar (`level`, `xp`, `per`): `add(n)` fills smoothly; overflow fills to the end, the level badge pops and the bar restarts with the remainder (multi-level); `usa:xp`, `usa:levelup`. `levelFor()`.
  - `<usa-badge-wall>` — achievement grid from `<li data-icon data-locked>`: locked badges are grey with 🔒; `unlock(name)` flips the badge to colour with a shine and updates the “n / m unlocked” counter; `badges`, `usa:unlock`. `badgeProgress()`.
  - `<usa-prize-wheel>` — lottery wheel from `segments`: Spin whirls it, it eases out on a random result (or `spin(index)`), the pointer ticks, the wheel glows; `duration`, `turns`, `result`, `spinning`; `usa:result`. `wheelAngle()`.
- **Gamification motion — `motionary/fx/game`** (= `motionary/components/fx-game`, `registerGamePack()`, also in `registerEffectPacks()`): `achievement-unlock` (attention), `level-up` (attention), `chest-open` (click), `coin-burst` (click), `xp-gain` (enter). `throwPath()`.
- Showcase: 6 new gallery cards with copyable code and live demos; Animation Store 311 → 317 items.
- Note: the plan's “lottery” ships as `<usa-prize-wheel>` (wheel + lottery in one component).

### Accessibility
- Leaderboard = labelled ordered list ("1. Ada, 980 points"), rank changes announced politely; XP bar = `progressbar` labelled "Level 3, 40 of 100 XP", level-ups announced; badge wall = labelled list, each badge "First win, locked/unlocked", unlocks announced; prize wheel = real button (disabled while spinning), result announced. Reduced motion: rows jump, no flash or roll; bar and level change at once; badges change without flip or shine; the wheel jumps to the result; `achievement-unlock` / `level-up` fade, `chest-open` sets the lid open, `coin-burst` / `xp-gain` do nothing.

### Fixed
- **Store thumbnails are live demos (user report, mobile ~390px).** Cards in “组件 6.x” (now “Components 6.x–7.x”, 90 items incl. every 7.x widget/effect pack) and “框架 / Frameworks” (5) showed only a generic purple tile with a bouncing emoji or letter. Every component card now renders the real `<usa-*>` element with its gallery demo markup + wiring in a lazily mounted frame (`showcase/thumb.html`, mounted by IntersectionObserver near the viewport, dropped 4 s after leaving it, scaled to fit with no overflow, inert on cards, interactive in the detail view and its “related” minis). Framework cards show a live scroll-reveal demo driven through the real adapter (React hooks / Vue composables via minimal hook stand-ins, the Svelte action, `<scroll-animate>`; Solid via the core) next to its code snippet. Reduced motion: the demos are still, the components follow their own reduced-motion paths. Audit: no Store item (all 317) uses the placeholder any more.
- Showcase: the global icon rule `svg:not([width]) { width: 1.25em }` in `showcase/styles.css` shrank the SVGs inside live demos — `<usa-gauge>` and `<usa-sparkline>` (and the KPI trend) rendered as a 15 px speck in the component gallery. Scoped to UI icons with `:where(…)`.
- Store detail for components: dropped the meaningless duration/easing controls, keyframes and scroll-test mode; Replay remounts the live demo; the note no longer says “preview only”.

## [7.4.0] - 2026-10-08

### Added
- **4 new components (7.4)** in `motionary/components/widgets` (also in `dist/widgets.umd.js`):
  - `<usa-message-list>` — chat thread from `<p data-from data-me data-time>` children or `push(msg)`: bubbles pop in from their side, consecutive messages group, the list sticks to the bottom (smooth) or shows a “↓ New messages” pill when you scrolled up; `typing(name)` shows animated typing dots until the next message; `messages`, `usa:message`. `role="log"` + `aria-live="polite"`.
  - `<usa-reactions>` — emoji reaction bar (`emojis`, `counts`, `picker`): clicking toggles your reaction (emoji pop, count roll, floating copies), ＋ springs open a picker; `counts`, `mine`, `toggle()`, `usa:react`. `parseReactions()`.
  - `<usa-notification-bell>` — bell + unread badge + dropdown (`<li data-time data-read>` children): `notify()` swings the bell, bumps the badge and slides the notice in; `markAllRead()` shrinks the badge away; `unread`, `notices`, `open`, `ring()`; Esc / outside click close; `usa:notify`, `usa:read`.
  - `<usa-presence>` — avatar + status dot (`status` online | away | busy | offline, `name`, `src`): coming online sends a ripple, `speaking` pulses a ring, `story` spins a gradient ring; initials fallback. `PRESENCE_STATES`, `initials()`.
- **Chat & social motion — `motionary/fx/social`** (= `motionary/components/fx-social`, `registerSocialPack()`, also in `registerEffectPacks()`): `typing-dots` (loop), `message-in` (enter), `reaction-burst` (click), `read-receipt` (enter), `mention-glow` (attention). `fanAngles()`.
- Showcase: 6 new gallery cards with copyable code and live demos; Animation Store 305 → 311 items.
- Note: the plan's “avatar stack” already ships as `<usa-avatar-stack>` (unchanged), so 7.4 adds `<usa-presence>` instead.

### Fixed
- `<usa-reactions>` (pre-release staging): two type errors broke `tsc` — `picker.hidden` (now `boolean | "until-found"` in the DOM lib) passed to a boolean toggle, and `.type` set on an `HTMLElement` — fixed (`=== true`, `setAttribute('type','button')`).

### Accessibility
- Message list = `log` (polite) with a labelled typing bubble; reactions = labelled `group` of `aria-pressed` toggle buttons with counts in their labels; bell = `button` with `aria-expanded` and the unread count in its label, list = labelled region, Esc returns focus; presence = labelled `img` ("Ada Lovelace, online"). Reduced motion: no pop, smooth scroll, roll, float, swing, bump, slide, ripple, pulse or ring spin; typing dots are static; `reaction-burst` does nothing, `read-receipt` / `mention-glow` show their end state.

## [7.3.0] - 2026-10-08

### Added
- **4 new components (7.3)** in `motionary/components/widgets` (also in `dist/widgets.umd.js`):
  - `<usa-add-to-cart>` — buy button: the product photo (`from`, or the closest `[data-product] img`) flies on an arc into the cart (`cart` selector; a `<usa-cart-drawer>` gets `add(item)` with the `item` JSON), the button morphs to ✓ `added` for `hold` ms; `usa:add`; live-region announcement.
  - `<usa-cart-drawer>` — cart button + count badge + side drawer: lines slide in or bump their quantity, removed lines collapse, the badge bumps, the total rolls; `add()` / `removeItem()` / `items` / `total` / `count` / `open` / `toggle()`; Esc / backdrop close, focus moves in and back; `currency`, `label`; `usa:change` / `usa:open` / `usa:close`. `cartTotal()`.
  - `<usa-product-gallery>` — `<img>` children become a stage + thumbnail tabs: the stage cross-slides in the direction of travel, the selection ring glides, hover zoom under the pointer (`zoom`, `nozoom`), swipe and ←/→; `index`, `go()` / `next()` / `prev()`, `usa:change`. `wrapIndex()`.
  - `<usa-countdown>` — split-flap countdown to `to` or for `seconds` (`units`, `labels`): changed digits flip; `usa:tick` / `usa:done`, `data-done`; `role="timer"` with a label updated once a minute. `splitTime()`.
- **E-commerce motion — `motionary/fx/shop`** (= `motionary/components/fx-shop`, `registerShopPack()`, also in `registerEffectPacks()`): `fly-to-cart` (click), `price-flip` (enter), `stock-pulse` (loop), `sale-shine` (hover), `badge-pop` (attention). `arcPath()`.
- Showcase: 6 new gallery cards with copyable code and live demos; Animation Store 299 → 305 items.

### Fixed
- `<usa-cart-drawer>` (pre-release staging): the panel's `display:flex` overrode `[hidden]`, so the drawer showed while closed — `[hidden]` now wins.
- `<usa-countdown>`: restarting (changing `to` / `seconds`) after it finished kept `data-done` — now cleared.

### Accessibility
- Add-to-cart = real `<button>` + polite live region; cart drawer = `dialog` with `aria-modal`, labelled toggle with the item count, Esc; product gallery = labelled stage group + thumbnail `tab`s with roving tabindex; countdown = `timer` labelled once a minute. Reduced motion: no flight, morph, slide, glide, zoom, flip, bump or roll — state changes at once; `stock-pulse` / `sale-shine` do nothing, `fly-to-cart` only fades the cart.

## [7.2.0] - 2026-10-08

### Added
- **4 new components (7.2)** in `motionary/components/widgets` (also in `dist/widgets.umd.js`):
  - `<usa-bar-chart>` — animated bar chart from `values` + `labels`, `<data>` children or the `data` property: bars grow in a stagger on first view, value labels show with `unit`; new data glides every bar (appearing bars grow, leaving bars shrink away); `horizontal`, `max`. A labelled `figure` with a list of “label: value” items.
  - `<usa-gauge>` — semicircular gauge: the needle swings to `value` on a damped spring, the arc fills in the colour of its `zones` (`"60:#22c55e,85:#f59e0b,100:#ef4444"`), the number counts; `min` / `max` / `unit` / `label`; `role="meter"` with `aria-valuetext`.
  - `<usa-sparkline>` — inline trend line (`values` or `data`): draws on first view, area fades in, the last point pulses, new data morphs point by point; `variant="line | area | bars"`, `color`; hover tooltip; text summary as `aria-label`. `SPARK_VARIANTS`, `sparkPoints()`.
  - `<usa-kpi>` — KPI card: the value counts up keeping prefix / suffix / decimals, the `delta` chip slides in with a ▲ / ▼ coloured by sign (`invert` when down is good), optional `trend` sparkline, `caption`; setting `value` rolls from the old number and flashes the card.
- **Data-viz motion — `motionary/fx/chart`** (= `motionary/components/fx-chart`, `registerChartPack()`, also in `registerEffectPacks()`): entrances for charts you already have (any SVG / HTML chart library) — `bars-grow`, `line-draw`, `ring-sweep`, `dots-pop`, `number-roll` (enter) and `sankey-flow` (loop). `parseFigure()`.
- Showcase: 7 new gallery cards with copyable code and live “new data” buttons; Animation Store 292 → 299 items.

### Accessibility
- Bar chart = `figure` + list items labelled “label: value”; gauge = `meter` with `aria-valuenow` / `aria-valuetext`; sparkline = `img` with a trend summary; KPI = labelled `group`. Reduced motion: no growth, glide, swing, count, draw, morph, pulse or flash — final values are shown at once; chart effects end in their final state with a short fade and `sankey-flow` is static.

## [7.1.0] - 2026-10-08

### Added
- **4 new components (7.1)** in `motionary/components/widgets` (also in `dist/widgets.umd.js`; the existing `<usa-audio>`, `<usa-beat>` and `<usa-player>` are unchanged):
  - `<usa-music-player>` — music player card: the cover spins like a record while playing, play ↔ pause, dancing mini equalizer bars, scrubbable progress slider (← / → ±5 s); plays a child `<audio>` / `src` or simulates `duration`; `play()`, `pause()`, `toggle()`, `seek()`; `usa:play`, `usa:pause`, `usa:seek`, `usa:prev`, `usa:next`.
  - `<usa-volume-knob>` — rotary knob (`role="slider"`): drag, wheel or keys; value arc + LED tick ring; the cap springs to the angle; `usa:input` / `usa:change`.
  - `<usa-equalizer>` — graphic EQ: one vertical slider per band with springy caps and a smooth response curve; presets `flat | bass | vocal | rock | electronic` glide every band (`applyPreset()`); `values`; `usa:change`. `EQ_PRESETS`.
  - `<usa-lyrics>` — synced karaoke lyrics from LRC or `[data-t]` lines: the active line glows, centres and fills word by word, past lines dim; follows `for` (`<audio>`, `<video>`, `<usa-music-player>`); click to `usa:seek`. `parseLRC()`.
- **Music visualization — `motionary/fx/music`** (= `motionary/components/fx-music`, `registerMusicPack()`, also in `registerEffectPacks()`): `waveform-scope`, `radial-spectrum`, `spectrum-mirror`, `sound-particles` (Canvas 2D backgrounds) and `beat-bounce`, `vinyl-spin` (loops). They read the live analyser (`enableAudio()` / `<usa-audio>`) or a synthetic signal (`syntheticSample()`, `musicSample()`).
- Showcase: 7 new gallery cards with copyable code (the lyrics card follows a demo player); Animation Store 285 → 292 items.

### Accessibility
- The player is a labelled group with a `slider` for progress and an `aria-pressed` play button; the knob and every EQ band are `slider`s with `aria-valuetext`; the lyrics region marks the current line with `aria-current`. Reduced motion: no spin, dancing bars, cap spring, glide, sweep or smooth scroll; visual backgrounds draw one static frame and the loop effects do nothing.

## [7.0.0] - 2026-10-08

### ⚠️ Breaking — removed (deprecated in 6.9; `npx usa-codemod-7 --write src`)
- `registerFx2()` → `registerEffectPacks()`; `FX2_PACKS` → `EFFECT_PACKS`.
- `registerGpuEffects` / `registerTextEffects3` / `registerLightEffects` / `register3dEffects` / `registerMorphEffects2` / `registerTransitionEffects2` / `registerWeatherEffects` / `registerPhysicsEffects2` → `registerGpuPack` / `registerTextPack` / `registerLightPack` / `register3dPack` / `registerMorphPack` / `registerTransitionsPack` / `registerWeatherPack` / `registerPhysicsPack`.
- `<usa-tooltip>` (`defineTooltip`) → `<usa-tip>` (`defineTip`, 6.6); `<usa-toggle>` (`defineToggle`) → `<usa-switch>` (`defineSwitch`, 6.7). Docs, framework examples and the showcase use the new tags.

### Added
- **WebGPU backend** for shader backgrounds: `backend: 'auto'` now tries WebGPU first (the GLSL body is translated by `glslToWgsl()`, or a spec ships `wgsl`), then WebGL2, then Canvas 2D; `el.dataset.usaBackend` = `webgpu` / `webgl2` / `canvas`. New exports `supportsWebGPU()`, `glslToWgsl()`, `wgslModule()`, `webgpuBackground()`, `WGSL_HEAD`.
- **Per-pack entries**: `motionary/fx` (every pack) and `motionary/fx/gpu`, `/fx/text`, `/fx/light`, `/fx/3d`, `/fx/morph`, `/fx/transitions`, `/fx/weather`, `/fx/physics`, `/fx/focus`, `/fx/marketplace` (same builds as `motionary/components/fx-*`, which keep working).
- **docs/ROADMAP.md** replaced by the post-7.0 roadmap (v7.1 → v8.0).
- npm: `motionary@7.0.0` and the `use-scroll-animate@7.0.0` alias are published with the `latest` tag.

### Upgrading
- See [docs/upgrading-7.md](./docs/upgrading-7.md). Everything else (browser baseline, `<usa-player>` JSON, every 6.x widget API) is unchanged.

## [6.9.0] - 2026-10-08

### Added
- **4 new components (6.9)** in `motionary/components/widgets` (also in `dist/widgets.umd.js`):
  - `<usa-date-picker>` — inline calendar: months slide in from the direction of travel, the chosen day pops in a spring circle, today has a ring; full date-grid keyboard (arrows, PageUp / PageDown, Home / End, Enter), `min` / `max`, `first-day`, `locale`; `usa:change`. Helpers `monthGrid()`, `parseISODate()`.
  - `<usa-color-picker>` — saturation / brightness square + hue strip (keyboard sliders, Shift ×10) with spring-follow thumbs, morphing preview chip, popping `swatches`; `value` `#rrggbb`; `usa:input` / `usa:change`. Helpers `hsvToHex()`, `hexToHsv()`.
  - `<usa-file-drop>` — drop zone with marching-ants on drag-over and a lifting icon; files (dropped or browsed via the built-in input) fly into a list with progress bars and a drawn check; `setProgress(i, p)`, `simulate`, `accept`, `multiple`; `usa:files`.
  - `<usa-keyframe-editor>` — **animation editor 2.0**: a timeline for `<usa-player>` JSON — drag bars to move tracks, drag edges to resize (or ← / →, Shift + ← / →), scrub or play the preview of the `for` element; reads / writes format `use-scroll-animate/animation` v1; `usa:change`.
- **Focus & feedback — `motionary/components/fx-focus`** (`registerFocusPack()`): `focus-draw`, `marching-ants`, `success-check`, `highlight-sweep`.
- **Effect marketplace manifest — `motionary/components/marketplace`**: format `motionary/effect-pack` v1; `packManifest()`, `validateManifest()`, `loadEffectPack(url | module, { override })` (validates, refuses to replace existing effects unless `override`). Also exported from `motionary/components/fx2`.
- **`npx usa-codemod-7`** (new bin) and **[docs/upgrading-7.md](./docs/upgrading-7.md)**.
- Consistent pack registrars: `registerGpuPack()`, `registerTextPack()`, `registerLightPack()`, `register3dPack()`, `registerMorphPack()`, `registerTransitionsPack()`, `registerWeatherPack()`, `registerPhysicsPack()`, `registerFocusPack()`; `registerEffectPacks()` + `EFFECT_PACKS` for all of them.
- Showcase: 6 new gallery cards with copyable code; Animation Store “Components 6.x” 52 → 58 entries (279 → 285 items).

### Deprecated (removed in 7.0 — warn once in the console)
- `registerFx2()` → `registerEffectPacks()`; `FX2_PACKS` → `EFFECT_PACKS`.
- `registerGpuEffects` / `registerTextEffects3` / `registerLightEffects` / `register3dEffects` / `registerMorphEffects2` / `registerTransitionEffects2` / `registerWeatherEffects` / `registerPhysicsEffects2` → the `register*Pack()` names above.
- `<usa-tooltip>` → `<usa-tip>` (6.6); `<usa-toggle>` → `<usa-switch>` (6.7). Same attributes.
- `npx usa-codemod-7 --write src` rewrites all of the above (manual report for `defineTooltip` / `defineToggle`, `createElement` and CSS selectors).

### Accessibility
- Date picker is a `grid` with labelled cells, `aria-selected`, `aria-disabled` and a live month title; color picker areas are `slider`s with `aria-valuetext`; file drop is a keyboard button around a real file input with a polite list; editor clips are keyboard sliders. Reduced motion: no slide / pop / ants / fly-in; the editor preview jumps to the end; every focus effect becomes a fade (marching-ants static).

## [6.8.0] - 2026-10-08

### Added
- **4 new components (6.8)** in `motionary/components/widgets` (also in `dist/widgets.umd.js`; the existing `<usa-swipeable>`, `<usa-draggable>` and `<usa-pull-refresh>` are unchanged):
  - `<usa-kanban>` — kanban board with drag-sort: lifted card tilts with the drag, a placeholder opens at the drop point and the other cards glide aside (FLIP); full keyboard move (Space / arrows / Space, Esc) with polite announcements; `move()`; `usa:move`.
  - `<usa-swipe-deck>` — Tinder-style deck: drag / fling the top card off with rotation and LIKE / NOPE stamps, spring back below `threshold`; `like()`, `nope()`, `undo()`, ← / →; `usa:swipe`, `usa:empty`.
  - `<usa-weather-card>` — animated weather widget: `condition="clear | cloudy | rain | snow | storm | fog | night"` scenes (turning sun, drifting clouds, rain, snow, flash-safe bolt, fog bands, stars), cross-fade on change, temperature count-up; `temp`, `unit`, `place`, `label`.
  - `<usa-pull-cord>` — lamp pull-cord switch: drag the cord past `threshold`, release to toggle; the cord swings back on a damped spring (SVG); click / Space / Enter tug it; `role="switch"`; `usa:change`.
- **Weather & ambience — `motionary/components/fx-weather`** (6 Canvas 2D backgrounds, `registerWeatherEffects()`, also in `registerFx2()`): `rain-glass`, `snowfall` (piles up), `lightning` (photosensitive-safe: ≥ 2.5 s between bolts, glow ≤ 22 %, none under reduced motion), `fog`, `aurora-veil`, `day-cycle` (dawn → night, sun / moon arc, or fixed `hour`). Helper `skyAt(hour)`.
- **Physics 2.0 — `motionary/components/fx-physics`** (`registerPhysicsEffects2()`, also in `registerFx2()`): `soft-body` and `magnet` (hover), `cloth`, `rope` and `pinball` (Canvas 2D backgrounds that react to the pointer); exported `VerletWorld` (points, sticks, gravity, damping, `push()`).
- Showcase: 10 new gallery cards with copyable code; Animation Store “Components 6.x” 42 → 52 entries (269 → 279 items).

### Accessibility
- Kanban columns are labelled lists, cards are focusable with keyboard pick-up / move / drop and live announcements; the deck is a labelled region with arrow keys; the weather card is a group whose label is the text summary (scene `aria-hidden`); the pull-cord is a `switch`. Reduced motion: no tilt / glide / fly / swing / count-up; weather and physics backgrounds draw one static frame; lightning never flashes.

## [6.7.0] - 2026-10-08

### Added
- **4 new components (6.7)** in `motionary/components/widgets` (also in `dist/widgets.umd.js`; the existing `<usa-toggle>` and `<usa-tabs>` are unchanged):
  - `<usa-stepper>` — step indicator / wizard: the rail fills toward the current step, finished steps pop a drawn check, the current step pulses; horizontal or vertical, `clickable`, `next()` / `prev()` / `value`; `usa:change`.
  - `<usa-pagination>` — pager with a sliding, squashing ink and page numbers that slide in from the direction of travel; `total`, `page`, `siblings`, ellipses, prev / next, `aria-current`; `usa:change`. Helper `pageWindow()`.
  - `<usa-segmented>` — segmented control whose thumb springs and stretches between segments; radio group with arrow keys; `variant="ios | pill | outline"`; `usa:change`.
  - `<usa-switch>` — toggle switch variants `ios` (press-stretch), `daynight` (sun → moon + stars), `bounce` (squash), `liquid` (gooey pour); `role="switch"`, form value via `name`, `disabled`; `usa:change`.
- **Transitions 2.0 — `motionary/components/fx-transitions`** (6 effects of kind `page`, `registerTransitionEffects2()`, also in `registerFx2()`; option `mode: "in" | "out"`): `ripple-dissolve`, `shatter`, `mosaic-flip`, `liquid-wipe`, `page-curl`, `camera-dolly`. `pageTransition(update, effect)` runs a DOM update inside the View Transitions API (fallback: update + effect); `crossDocumentTransitions(effect)` opts an MPA into cross-document view transitions with the same look.
- Showcase: 7 new gallery cards with copyable code; Animation Store “Components 6.x” 35 → 42 entries (262 → 269 items).

### Accessibility
- Stepper is a labelled list with `aria-current="step"`; pagination is a labelled navigation with `aria-current="page"` and disabled prev / next at the ends; segmented is a `radiogroup` with roving tabindex; switch is `role="switch"` with `aria-checked`. Reduced motion: no pop, ink squash, thumb stretch, bounce or pour; every transition becomes a short fade (and cross-document transitions ~1 ms).

## [6.6.0] - 2026-10-08

### Added
- **4 new components (6.6)** in `motionary/components/widgets` (also in `dist/widgets.umd.js`; the existing `<usa-navbar>`, `<usa-tooltip>`, `<usa-popover>` and `<usa-icon-morph>` are unchanged):
  - `<usa-dock>` — macOS-style dock: cosine-falloff magnification along the pointer (`magnify`, `range`), neighbours make room, `data-label` tooltips, click `bounce`, keyboard focus magnifies, vertical orientation; `role="toolbar"`.
  - `<usa-nav-morph>` — navigation with an indicator that stretches to the hovered / focused link and settles on the current page; `indicator="underline | pill | blob | dot"`, arrow-key focus, manages `aria-current`; `usa:change`.
  - `<usa-menu-toggle>` — hamburger that morphs into `cross`, `arrow`, `minus` or `plus-x`; a button with `aria-expanded` that opens / closes its `for` target (`hidden`, or `show()` / `close()` — works with `<usa-sheet>` and `<usa-modal>`); `usa:toggle`.
  - `<usa-tip>` — tooltip / popover 2.0: springs out with an arrow, flips and shifts to stay in the viewport, hover + focus + Esc (WCAG 1.4.13) or `trigger="click"` popovers with rich `[slot="tip"]` content; `usa:open`, `usa:close`.
- **Morph & SVG 2.0 — `motionary/components/fx-morph`** (5 effects, `registerMorphEffects2()`, also in `registerFx2()`): `path-morph` (resampled point morph between any SVG paths), `blob-button` (liquid blob that bulges toward the pointer), `stroke-draw` (every stroke draws, then fills fade in), `noise-reveal` (SVG turbulence + blur filter transition), `icon-swap` (gooey icon morph). Helpers `samplePath()`, `pointsToPath()`.
- Showcase: 7 new gallery cards with copyable code; Animation Store “Components 6.x” 28 → 35 entries (255 → 262 items).

### Accessibility
- Dock is a toolbar with labelled items, the nav manages `aria-current`, the toggle exposes `aria-expanded` / `aria-controls`, tips use `role="tooltip"` + `aria-describedby` (or `role="dialog"` for click popovers) and close on Esc. Reduced motion: no magnification, stretch or morph loops; reveals and swaps fade.

## [6.5.0] - 2026-10-08

### Added
- **4 new components (6.5)** in `motionary/components/widgets` (also in `dist/widgets.umd.js`; the existing `<usa-timeline>`, `<usa-masonry>` and `<usa-cube>` are unchanged):
  - `<usa-milestones>` — scroll-drawn timeline: the rail fills as you scroll, each milestone pops its dot and slides its card in when reached; `layout="alternate | left"` (one column below 640 px), `data-date` labels; `role="list"`; `usa:reach`.
  - `<usa-masonry-flow>` — masonry grid with FLIP layout animation on resize, insert / remove, `filter()`, `shuffle()`, `sort()`; `min` column width, `gap`; `usa:layout`.
  - `<usa-compare>` — before / after compare slider: drag, click-to-jump (eased), `hover` mode, keyboard (`role="slider"`), `orientation="vertical"`, `labels`, one-time `intro` sweep; `usa:change`.
  - `<usa-cube-gallery>` — slides on adjacent faces of a 3D cube that turns between them; swipe, arrow keys, buttons, `autoplay` (pauses on hover / focus / off screen), `axis="x"`; `usa:change`.
- **3D scene cards — `motionary/components/fx-3d`** (5 effects, `register3dEffects()`, also in `registerFx2()`): `depth-stack` (layers separate in Z and parallax with the tilt), `product-spin` (drag-to-rotate 360° viewer with inertia + idle turntable), `card-flip-3d` (thick card flip, faces swap `aria-hidden`), `origami` (panel-by-panel unfold), `orbit-camera` (scroll-linked camera orbit, `--usa-orbit` progress variable).
- Showcase: 7 new gallery cards (shuffle / filter buttons for the masonry) with copyable code; Animation Store “Components 6.x” 21 → 28 entries (248 → 255 items).

### Accessibility
- Milestones are a list, the compare slider and cube gallery are keyboard operable with ARIA roles. Reduced motion: milestones are shown at once, the cube fades, masonry items jump, 3D tilt / spin / orbit / origami are off and the flip crossfades.

## [6.4.0] - 2026-10-08

### Added
- **4 new components (6.4)** in `motionary/components/widgets` (also in `dist/widgets.umd.js`; the existing `<usa-progress>`, `<usa-counter>`, `<usa-skeleton>` and `<usa-rating>` are unchanged):
  - `<usa-progress-ring>` — ring, `bar` or `semi` gauge; the arc eases to each new value with a small overshoot while the label counts; `gradient`, `duration`, `no-label`; indeterminate without `value`; `role="progressbar"`, `usa:complete`.
  - `<usa-odometer>` — rolling digit wheels: each digit spins forward to its new value, added digits slide in; `locale` (Intl.NumberFormat grouping), `decimals`, `prefix`, `suffix`, `duration`; the formatted number is the accessible name.
  - `<usa-skeleton-reveal>` — a skeleton generated from the real content (one bar per rendered text line, blocks for images / buttons / `[data-skeleton]`), synchronized `wave` / `pulse` / `glow` shimmer; removing `loading` (or `reveal()`) dissolves the bars top-to-bottom while the content fades in from a blur; `aria-busy`, `usa:reveal`.
  - `<usa-star-rating>` — rating stars 2.0: hover preview, `step="0.5"` half stars, click pop + sparkle burst + ripple, `icon="heart"`, `readonly`; keyboard slider; `usa:change`.
- **Light & materials — `motionary/components/fx-light`** (6 effects, `registerLightEffects()`, also in `registerFx2()`): `light-follow` (point light + specular hot spot), `refraction` (glass lens following the pointer, backdrop-filter), `brushed-metal` (anisotropic sheen), `pearlescent` (nacre / holographic film), `god-rays` (volumetric light shafts, Canvas 2D), `pointer-shadow` (real-time cast shadow away from the pointer). Helper `trackPointer()`.
- Showcase: 7 new gallery cards (live value buttons for the ring, odometer and skeleton) with copyable code; Animation Store “Components 6.x” 14 → 21 entries (241 → 248 items).

### Accessibility
- Progress ring and odometer expose their values (`aria-valuenow`, accessible name); the skeleton sets `aria-busy`; the rating is a keyboard slider. Reduced motion: values switch instantly, no shimmer / pop, lights stay fixed, god rays draw one still frame.

### Fixed
- Links: the repository is now **HarrisonCN/Motionary** (capital M). GitHub Pages URLs are case-sensitive, so every showcase / docs link in the README (EN / ZH / JA), `package.json` (`homepage`, `repository`, `bugs`), showcase meta / Open Graph tags, docs and issue templates now point to `https://harrisoncn.github.io/Motionary/…` (the lowercase `/motionary/` path returned 404).

## [6.3.0] - 2026-10-08

### Added
- **4 new components (6.3)** in `motionary/components/widgets` (also in `dist/widgets.umd.js`):
  - `<usa-toast-stack>` — notifications pile into a collapsed stack (newest in front, older ones peeking behind) and fan out on hover / focus; auto-dismiss paused while hovered, swipe to dismiss, action + close buttons, six `position`s, `max`, `contained`; polite live region (errors use `role="alert"`). API `show()`, `dismiss()`, `clear()`, module helper `stackToast()`, declarative `[data-usa-toast]` triggers; events `usa:show`, `usa:dismiss`.
  - `<usa-modal>` — modal on the native `<dialog>` (top layer, focus trap, Esc) with a fading blurred backdrop; `effect="scale | slide-up | flip | origin"` (`origin` grows out of the opener); `persistent`; `[data-usa-open="id"]` / `[data-usa-close]`; focus returns to the opener. API `show()`, `close(value)`, `toggle()`; `usa:open`, `usa:close`.
  - `<usa-sheet>` — side / bottom sheet (`side="right | left | bottom | top"`) on the same overlay core; the bottom sheet has a grab handle and drag-to-dismiss with spring-back.
  - `<usa-menu>` — dropdown menu that scales / folds / slides out of its button with cascading items; full menu keyboard support, outside click closes; `usa:select`.
- **Text effects 3.0 — `motionary/components/fx-text`** (7 effects, `registerTextEffects3()`, also in `registerFx2()`): `liquid-text` (animated SVG displacement), `neon-write` (letters flicker on like a neon sign), `particle-text` (particles assemble into the glyphs), `glitch-text` (RGB-split slices), `text-trail` (cursor: letters fall off the pointer), `font-breathe` (variable-font weight wave), `flip-chars` (per-character 3D flip). Helper `splitChars()` keeps a visually hidden copy for screen readers.
- Showcase: 7 new gallery cards with copyable HTML / ESM / React / Vue / desktop code; Animation Store “Components 6.x” 7 → 14 entries (234 → 241 items).

### Accessibility
- Overlays use the native `<dialog>` modal semantics; menu and tabs follow the WAI-ARIA patterns. Under reduced motion overlays and menus fade, text loops / trail / particles are skipped and one-shot text effects show their final state.

## [6.2.0] - 2026-10-08

### Added
- **New entry `motionary/components/widgets`** — the 6.x animated UI widgets, kept out of `motionary/components` and `components/lite` (lite stays ≤ 70 KB). `defineWidgets(release?)`, `WIDGETS` (by release), `WIDGET_TAGS`. No-build bundle **`dist/widgets.umd.js`** (`window.UsaWidgets`) registers every widget and every 6.x effect pack.
- **4 new components (6.2)**:
  - `<usa-carousel>` — swipe / drag / arrow keys / dots / autoplay (pauses on hover, focus, off screen); effects `slide`, `fade`, `scale`, `cards` (3D coverflow); `loop`; API `next()`, `prev()`, `goTo()`, `index`, `usa:change`.
  - `<usa-tab-bar>` — tabs whose indicator stretches from the old tab to the new one (leading edge first); `indicator="pill | underline | glow | gooey"`; panels (`data-panel`) slide in from the side of travel; full tablist keyboard support; `select()`, `usa:change`.
  - `<usa-disclosure>` — accordion 2.0 on native `<details>`: spring height + fade, overshooting chevron, single or `multiple`, `variant="cards"`; `toggle()`, `openAll()`, `closeAll()`, `usa:toggle`.
  - `<usa-stories>` — story viewer: segmented progress, auto-advance, tap left / right, press-and-hold pause, pause button (WCAG 2.2.2); `usa:change`, `usa:end`.
- **GPU effect pack `motionary/components/fx-gpu`** (8 effects, `registerGpuEffects()`): WebGL2 shaders `fluid` (swirls around the pointer), `smoke`, `fire`, `ink`, `fireflies` with an automatic **Canvas 2D fallback** (no WebGL2, compile error or lost context; `data-usa-backend="webgl2 | canvas"`, `backend: 'canvas'` to force it); Canvas 2D particles `sakura` and `leaves`; click effect `splash`. Visible-only rendering, adaptive resolution. Helpers `shaderBackground()`, `supportsWebGL2()`, `fieldFallback()`, `GLSL_HEAD` for your own shaders. `motionary/components/fx2` registers every 6.x pack (`registerFx2()`).
- Showcase: gallery cards for the 4 widgets + 3 effect cards (copyable HTML / ESM / React / Vue / desktop code); **Animation Store: new “Components 6.x” chip** with 7 entries (snippets for every tab + link to the live demo) — 227 → 234 items.

### Changed
- The effect registry is shared per page through `Symbol.for('use-scroll-animate.effects')`, so several bundles (e.g. `components.umd.js` + `widgets.umd.js`) register into one table.
- docs/ROADMAP.md: 6.2 → 7.0 replanned — every release now also adds new animated UI components; weather and interactive physics 2.0 merge into 6.8, 7.0 prep is 6.9.

### Accessibility
- Every widget is keyboard accessible with ARIA roles; under reduced motion the carousel and tabs switch instantly, accordions open instantly, stories don't auto-advance, GPU backgrounds draw a single still frame.

## [6.1.1] - 2026-10-08

### Changed — the project is now **Motionary**
- **Renamed to Motionary** (formerly `use-scroll-animate`): npm package **`motionary`**, repository `HarrisonCN/motionary`, showcase at `https://harrisoncn.github.io/Motionary/showcase/`, CDN `https://unpkg.com/motionary@6/dist/…` (jsDelivr: `cdn.jsdelivr.net/npm/motionary@6`). **No breaking change**: every API name, the `<usa-*>` tags, `usa-` CSS classes, the `ScrollAnimate` / `UsaComponents` globals, the `usa-codemod-*` bins and the `use-scroll-animate/animation` player format id stay the same.
- `use-scroll-animate` keeps being published at the same versions as a compatibility alias (same build); switching is `npm i motionary` + replacing `use-scroll-animate` with `motionary` in imports and CDN URLs.
- New package description and keywords; `homepage` is the showcase.

### Docs
- README (EN / 中文 / 日本語) rewritten for 6.1: tagline, showcase links (Store · Components · Playground · Story), install (npm + CDN @6), 30-second quickstart (data attributes, JS API, React / Vue / Svelte / Solid / Angular), feature overview with real counts, all 94 animated elements, accessibility, measured gzip sizes, browser baseline, upgrading, roadmap, license. Stale per-version sections removed (details live in `docs/`).
- Docs, examples, showcase code snippets and issue templates use the new name; showcase pages get Motionary titles and Open Graph / Twitter meta.

## [6.1.0] - 2026-10-08

### Added — Scroll presets 2.0
- **181 new scroll-reveal presets** (214 in total) in a separate, tree-shakeable entry: `import 'use-scroll-animate/presets/extended'` registers them on import (exports `EXTENDED_PRESETS`, `EXTENDED_PRESET_CATEGORIES`, `registerExtendedPresets()`); `<script>` pages load `dist/presets-extended.umd.js` after (or before) `dist/index.umd.js`. ≈ 4.7 kB gzip; the core bundle stays within its budget (UMD 8.81 kB / 9 kB).
  - Fade (+14: small/large distances, diagonals, settle, half) · Zoom & scale (+18: zoom-in/out up/down/left/right, from zero / 2×, zoom-bounce, origin-aware scale-x/y, stretch) · Flip 3D (+18: reverse, half turn, diagonal, edge flips, door-open, unfold, fold, bounce flips, swing-in) · Slide (+16: overshoot slides, back-in ×4, light-speed ×2, rise / sink, float) · Rotate & skew (+16: roll, spiral, spin, corner pivots, skew / shear, twist, tilt) · Blur & mask (+12: directional blur, zoom blur, motion blur, mask-up/down/left/right) · Clip reveal (+17: circles from edges/corner, ellipse, diamond, curtains, box, pill, blinds, diagonal & slanted wipes) · **Bounce & elastic** (+17: bounce-in ×5, elastic, rubber band, jello, wobble, tada, heartbeat, drop, pop, squash & stretch, shake, swing) · **Color & light** (+14: brightness, darken, colour / saturate / hue / sepia / invert / contrast / exposure / vintage, bloom, shadow lift, neon glow, glow) · **Depth & perspective** (+10) · **Glitch & special** (+9: glitch, colour glitch, typewriter, typewriter lines, hinge, flicker, scan, materialize, teleport) · **Stagger-ready** (+8 `stagger-*`) · **Scroll-linked** (+12 `scrub-*`: parallax drift, rotate / spin / scale / shrink / tilt on scroll, horizontal pan, sticky fade, focus through, wipe — for `engine: 'css'` with `viewRange: ['cover 0%', 'cover 100%']`).
  - Only `transform`, `opacity`, `filter` and `clip-path` are animated (plus a constant `transform-origin`); reduced motion shows the element without moving it.
- Presets may carry **intermediate keyframes** (`frames: [{ offset, …props }]`, optional per-keyframe `easing`), played between `from` and `to` by the JS and native engines and reversed for `exit`. Custom `{ from, to, frames }` animations work too.
- `registerPresets(map)` and `reversePreset(p)` in the main entry. `PRESETS` is now one table per page shared through `Symbol.for('use-scroll-animate.presets')`, so the ESM entries, the UMD bundle and the extended set see each other's presets.
- `<usa-reveal effect>` / `<usa-stagger effect>` accept any registered preset name (their own effects keep priority).
- Types: `CorePreset`, `ExtendedPreset` (`AnimationPreset` = both), `PresetKeyframes`, `AnimationFrame`.

### Showcase
- The Animation Store lists all 214 presets (**227 items**, up from 46) in 14 preset categories with filter chips, live demos and copy-paste code; extended presets add the `presets/extended` import (or the CDN script) to every code tab. Scroll-linked presets demo on the native view timeline; stagger-ready presets demo on a row of items; the keyframes panel shows intermediate keyframe counts. The demo page loads the extended set too.

### Docs
- New `docs/presets.md` (every preset by category), README (EN / 中文 / 日本語) "Scroll presets 2.0" section, API reference, `<usa-reveal>` docs. `docs/ROADMAP.md`: 6.1 is Scroll presets 2.0; the previous 6.1–6.9 plans move to 6.2–6.10.

### Tests
- New `test/presets-extended.test.ts`: every preset (core + extended) has interpolable keyframes (same properties and function lists from → frames → to, GPU-friendly properties, ordered offsets), type union / categories in sync, shared registry (ESM + UMD source), frames through `observe()`, reduced motion, `<usa-reveal>` lookup, store count ≥ 160, recipes and generated code.

## [6.0.1] - 2026-10-08

### Fixed
- **Showcase — components gallery overflowed phones horizontally (~48 px at 390 px wide).** The header's six nav items (Store · Playground · Story · language · theme · GitHub) could not shrink, so the whole page scrolled sideways and the scroll-progress bar ran past the edge. On screens ≤ 480 px the bar now shrinks and tightens to one row (the sticky filter bar keeps its offset): the duplicate “Animation Store” link is hidden (the logo already links to the store) along with the “Components” badge, and below 375 px the GitHub icon moves to the footer link only. Checked in headless Chromium at 320 / 360 / 390 / 414 / 480 px in English and Chinese: `scrollWidth` equals the viewport width and every remaining header control is on screen.
- Crawl of all showcase pages (`/showcase/`, `components.html`, `playground.html`, `story.html`, desktop 1280 px + mobile 390 px): no other console errors, failed requests or overflow found.

### Tests
- New `test/fixes-6-0-1.test.ts` regression suite.

## [6.0.0] - 2026-10-08

### ⚠ BREAKING CHANGES
- **Removed `burst()`, `confetti()`, `shake()`** from `use-scroll-animate/components`, `/components/click` and the UMD global (deprecated in 5.9). Play the registered effects instead: `playEffect(document.body, 'burst', { x, y, …options })`, `playEffect(el, 'confetti', options)`, `playEffect(el, 'shake', { intensity, duration })` (`use-scroll-animate/components/fx`). `haptic()` stays.
- **Removed `<usa-cursor mode="trail">`** (deprecated in 5.9): `CURSOR_MODES` is now `dot` · `magnetic` · `glow`, and an unknown mode renders as `dot`. Use the 5.7 `comet-trail` effect: `<usa-fx effect="comet-trail" trigger="load" self>…</usa-fx>`.
- Every effect now goes through the 5.0 registry (`registerEffect()` / `playEffect()` / `bindEffect()` / `<usa-fx>`); the 5.1–5.9 packs live in `use-scroll-animate/components/effects`.

### Migration
- `npx usa-codemod-6 --write src` rewrites the helper calls and imports (aliases and the `UsaComponents` global included) and lists `<usa-cursor mode="trail">` for a manual edit. Guide: `docs/upgrading-6.md`.
- CDN URLs move to the `@6` range: `https://unpkg.com/use-scroll-animate@6/dist/components.umd.js`.

### Docs
- README (EN / 中文 / 日本語): new **Effect packs** (`/components/effects`) row.
- `docs/ROADMAP.md`: post-6.0 roadmap (v6.1 → v7.0).

## [5.9.0] - 2026-10-08

### Added
- **`<usa-player>`** (`use-scroll-animate/components/effects`, `definePlayer()`) — plays JSON animations (`format: "use-scroll-animate/animation"`, `version: 1`): tracks with a `target` selector, `start` / `duration`, and a timeline `preset`, your own `keyframes` + `easing`, or any registered `effect` fired at `start`. Source: `src="…json"` or an inline `<script type="application/json">`. `trigger="load | view | scroll | click | manual"` (`scroll` scrubs with the page), `loop`, `rate`, `controls`; methods `play()`, `pause()`, `seek(ms)`, `load(json)`; events `usa-player-ready`, `usa-player-finish`; `data-error` on bad input.
- `createPlayer(root, animation, { autoplay, loop, rate })` → `{ play, pause, seek, rate, duration, currentTime, playing, finished, destroy }` — keyframe tracks are WAAPI animations driven by one clock; `normalizeAnimation()` validates (and reads Playground presets too).
- Playground: new **`<usa-player> JSON`** export tab (`tracksToAnimation()`).
- The registered `burst` effect accepts `x` / `y`.
- `docs/upgrading-6.md` and **`npx usa-codemod-6 [--write] [paths]`**.

### Deprecated (removed in 6.0 — warned once in the console)
- `burst()`, `confetti()`, `shake()` (components / components/click entries, UMD global) → `playEffect(el, 'burst' | 'confetti' | 'shake', …)` — the codemod rewrites calls and imports.
- `<usa-cursor mode="trail">` → the 5.7 `comet-trail` effect (`<usa-fx effect="comet-trail" trigger="load" self>`) — reported by the codemod for a manual edit.

### Accessibility
- Under reduced motion `<usa-player>` jumps to the final state and fires no effects.

## [5.8.0] - 2026-10-08

### Added
- **Theme packs** (`use-scroll-animate/components/effects`): `neon`, `paper`, `glass`, `retro`, `brutalist` — each = design tokens (`--usa-theme-bg|fg|accent|accent-2|surface|border|radius|shadow|font`), motion tokens merged over the motion scale, and effect presets per role (`enter`, `hover`, `click`, `attention`, `background`). API: `THEMES`, `applyTheme(name, root?)` (on `<html>` also activates the motion tokens; on an element scopes them; returns an undo), `themeVars()`, `themeCss(name, selector?)` for static / SSR CSS, `themePreset(name, role)`, `playThemeEffect(el, role)`. Helper classes `.usa-surface`, `.usa-accent`.
- `<usa-theme name="…">` — a themed subtree; children with `data-theme-fx="click | hover | enter | attention"` get that role's preset.
- Theme effects: `neon-flicker` (dims, never blacks out; < 3 flashes / s), `paper-fold`, `glass-shine`, `retro-scanlines` (static under reduced motion), `brutal-shift`.
- **23 micro-interactions** (`MICRO_FX`, `registerMicroEffects()`), each doing the UI work as well as the motion: `copy-success` (clipboard + "Copied ✓"), `toggle-morph`, `password-reveal`, `favorite-star`, `like-heart`, `bookmark-flip` (all `aria-pressed`), `download-progress` / `submit-loading` (`aria-busy`, `usa-done`), `send-plane`, `add-to-cart`, `counter-bump`, `upvote`, `clap`, `emoji-react`, `refresh-spin`, `trash-shake` (`remove: true`), `check-toggle` (`aria-checked` on `role=checkbox`), `input-shake` (`aria-invalid`), `error-flash`, `success-check`, `nudge-hint`, `focus-pulse`, `notify-badge`. Helpers `togglePressed()`, `swapLabel()`, `bumpCount()`.
- Showcase: **Micro-interactions** and **Theme packs** cards.

### Accessibility
- State changes (pressed, busy, invalid, counts, labels via a polite live region) happen with or without motion; under reduced motion only the animation is dropped.

## [5.7.0] - 2026-10-08

### Added
- **Cursor pack** (`use-scroll-animate/components/effects`, `registerCursorEffects()`, `CURSOR_FX`, kind `cursor`, persistent, scoped to the bound element): `comet-trail` (`color`, `width`, `life`), `ribbon-trail` (rainbow, `width`, `life`), `sparkle-trail` (`colors`, `spacing`, `size`), `magnetic-dots` (dot grid behind the content leaning toward the pointer; `gap`, `radius`, `color`), `spotlight-cursor` (eased soft light; `color`, `size`, `ease`). Trails draw on one fixed, pointer-transparent overlay canvas that only animates while a tail is fading. Mouse / pen only by default — `touch: true` opts touch in.
- **Gestures → effects**: `bindGesture(el, 'fling' | 'twist' | 'long-press', effectNameOrCallback, { velocity, angle, duration, tolerance, effectOptions })` — fling = fast release (px/ms, with direction), twist = two-finger rotation past `angle`° (`cw` / `ccw`), long press charges `--usa-charge` 0 → 1 (`data-charging` while charging) and fires when full; moving cancels. Every fire dispatches `usa-gesture`. Pure helpers `flingVelocity()`, `angleDelta()`.
- `<usa-gesture-fx gesture effect options velocity angle duration [self]>` — plays the effect on its first child.
- Showcase: **Cursor trails** and **Gesture triggers** cards.

### Accessibility
- Cursor effects are skipped under reduced motion; gesture-fired effects go through `playEffect()`, which applies reduced motion. Gestures only add effects — they never replace a click / keyboard action.

## [5.6.0] - 2026-10-08

### Added
- **Sound-reactive pack** (`use-scroll-animate/components/effects`, `registerAudioEffects()`, `AUDIO_FX`, kind `background`): `spectrum-bars` (`bars`, `gap`, `mirror`), `pulse-ring` (`rings`, `color`), `wave-ring` (`color`, `amplitude`) — Canvas 2D on the 5.5 `canvasBackground()` runner (visible-only, adaptive quality); they idle gently until audio is enabled.
- `enableAudio(input)` — analyse the microphone (`'mic'`), an `<audio>` / `<video>` element or selector, or a `MediaStream` through one shared Web Audio analyser. Must be called from a user gesture (the context is resumed there). The microphone is never routed to the speakers and is released on `stop()`; media stays audible after `stop()`. Also `disableAudio()`, `getAudio()`, `sample()` → `{ level, bass, freq, wave }`.
- Beat detection: `createBeatDetector({ threshold, cooldown, history, floor })` (pure), `onBeat(cb)`, and `bindBeat(el, effect, options)` — plays **any registered effect** on every beat.
- `<usa-audio source="#track | mic" label="…">` — renders (or uses your `[data-audio-toggle]`) an `aria-pressed` toggle button; children with `data-usa-beat="effect"` (`data-usa-beat-options` JSON) play that effect on beats; events `usa-beat`, `usa-audio-error` (`data-audio-error` on the host).
- While audio runs, `--usa-audio-level` / `--usa-audio-bass` (0–1) are set on `<html>` for CSS-driven reactions.
- Showcase: **Sound-reactive backgrounds** and **Beat-triggered effects** cards.

### Accessibility
- Audio only starts from a user gesture. Under reduced motion the visual effects are skipped, beats trigger no effects and the CSS variables stay at 0 (sound keeps playing).

## [5.5.0] - 2026-10-08

### Added
- **Generative backgrounds pack** (`use-scroll-animate/components/effects`, `registerGenerativeEffects()`, `GENERATIVE_FX`, kind `background`): `flow-field`, `voronoi`, `mesh-gradient`, `starfield`, `metaballs`, `contours` — Canvas 2D, options `colors`, `background`, `speed`, `quality` plus per-effect knobs (`count`, `seeds`, `blobs`, `stars`, `balls`, `levels`, `cell`…).
- `canvasBackground(el, ctx, { init, draw }, options)` — the shared runner, exported for custom generative effects: an `aria-hidden`, pointer-transparent canvas behind the content (`isolation: isolate`), renders only while visible (IntersectionObserver) and the tab is shown, resizes with the element, and adapts quality (render scale 0.35–1 drops on sustained slow frames, recovers on fast ones). Helpers `noise2()`, `hexRgb()`.
- Showcase: **Generative backgrounds** card (switch between all six).

### Accessibility
- Under reduced motion each background draws one static frame and never loops; canvases are `aria-hidden` and never take pointer events.

## [5.4.0] - 2026-10-08

### Added
- **`<usa-story template="…">`** (`defineStory()` from `use-scroll-animate/components/effects`; `defineEffectElements()` defines every element of the entry) — six scroll-storytelling templates:
  - `pin` — a sticky `[data-stage]` while `[data-step]` sections scroll past; the active step gets `data-active`, the stage `data-active-step="<i>"`.
  - `gallery` — a horizontal `[data-track]` slides sideways as you scroll down.
  - `zoom` — zoom-through: the stage scales up to `zoom="6"` and fades.
  - `compare` — before / after wipe driven by scroll, with a draggable, keyboard-accessible handle (`role="slider"`, ←/→, Shift for ×5, Home/End).
  - `counter` — `[data-count="12,480"]` numbers count up on entering view (separators, decimals, prefix / suffix kept).
  - `highlight` — the paragraph (or `[data-step]`) crossing the viewport center is highlighted.
- Every template sets `--usa-story-progress` (0–1), exposes `progress` / `step` / `update()` and fires `usa-story-step`. Helpers: `storyProgress(el)`, `formatCount(target, t)`, `STORY_TEMPLATES`.
- Showcase: new **[Scroll stories](./showcase/story.html)** page with all six templates full-page; gallery cards **Story: before / after**, **Story: data counters**, **Story: step highlight**. Gallery code tabs import from the card’s own entry.

### Accessibility
- Under reduced motion nothing slides or zooms (the gallery stacks vertically), counters show their final values immediately; counted numbers carry the final value as `aria-label`.

## [5.3.0] - 2026-10-08

### Added
- **Page-wide pack** (`use-scroll-animate/components/effects`, `registerPageEffects()`, `PAGE_FX`):
  - Transitions — `curtain`, `iris` (closes on the click point), `pixel-dissolve` (`cols` × `rows`), `blinds` (`slats`). Each covers the viewport, awaits `onCovered()` (swap your route / content there), optionally `hold`s, then reveals; `playEffect()` resolves when the page is visible again.
  - Persistent — `velocity-skew` (skews with scroll speed, eases back), `spotlight` (dims everything but a circle at the pointer), `edge-glow` (lights the viewport edge you scroll toward).
- Showcase: **Page transitions** and **Velocity skew & edge glow** cards.

### Accessibility
- Transition layers are `aria-hidden`; under reduced motion every transition becomes a 150 ms cross-fade that still calls `onCovered()`. `velocity-skew`, `spotlight` and `edge-glow` don’t run under reduced motion.

## [5.2.0] - 2026-10-08

### Added
- **Bounce & physics pack** (`use-scroll-animate/components/effects`, `registerPhysicsEffects()`, `PHYSICS_FX`): `bounce-in` (spring overshoot), `rubber-band`, `elastic-hover` (springy lift, persistent), `drop-bounce` (gravity + restitution), `gravity-text` (per-character drop, keeps `aria-label`), `spring-follow` (element springs toward the pointer), `bell-swing` (damped swing from the top).
- Physics helpers: `solveSpring({ stiffness, damping, mass, steps })` → progress samples + settle time, `springKeyframes(map, spring)`, `bounceKeyframes(restitution, steps)` — physical motion that still runs on the Web Animations API.
- Showcase: **Bounce & physics**, **Gravity text** and **Elastic hover & spring follow** cards.

### Accessibility
- Under reduced motion `bounce-in` / `drop-bounce` become a short fade; `rubber-band`, `bell-swing`, `gravity-text`, `elastic-hover` and `spring-follow` don’t move.

## [5.1.0] - 2026-10-08

### Added
- **New entry `use-scroll-animate/components/effects`** — the 5.x effect packs, all registered through `registerEffect()` and playable with `playEffect()`, `bindEffect()` or `<usa-fx>`: `registerAllEffects()`, `registerCardClickEffects()`, `EFFECT_PACKS`, `CARD_FX`, `CLICK_FX`, `fxLayer()`. Kept out of `components` / `components/lite` (lite stays under its 70 KB budget); the UMD bundle registers every pack.
- **Card effects 2.0**: `holo` (holographic foil + 3D tilt following the pointer), `glare-sweep`, `book-open`, `card-fan`, `topple`, `float-tilt`.
- **Click effects 2.0**: `shockwave`, `ink-splash`, `star-burst`, `jelly-press`, `ring-ripple`, `emoji-rain` — particles spawn from the click point in a fixed, `aria-hidden`, pointer-transparent layer.
- Showcase: **Holographic card**, **Card moves** and **Click effects 2.0** cards in the Effects category (code tabs import `components/effects`).

### Changed
- `bindEffect()` — a persistent effect (one that returns a cleanup) now *replaces* its previous run on re-trigger instead of stacking; every effect kind honours `reduced`.

### Accessibility
- Under reduced motion particles are skipped, presses fade instead of squashing, loops don’t start, `holo` keeps a static sheen.

## [5.0.0] - 2026-10-08

### ⚠ BREAKING CHANGES (see [docs/upgrading-5.md](./docs/upgrading-5.md); `npx usa-codemod-5 --write src`)
- **Modern-browser baseline**: Custom Elements, Web Animations, IntersectionObserver, ResizeObserver and constructable stylesheets are required (Chrome / Edge ≥ 111, Safari ≥ 16.4, Firefox ≥ 115, WebView2, Electron ≥ 24). The `experimental-webgl` context is no longer requested. View Transitions and scroll-driven animations remain progressive.
- `motionIntensity: 'off'` / `setMotionIntensity('off')` removed (ignored at runtime) → `motionSensitivity: 'minimal'`. `MotionIntensity` is `'low' | 'normal' | 'high'`; `MOTION_SCALE` has no `off`.
- `reducedMotion: 'no-preference'` removed (treated as `'user'`) — the OS setting is always honoured.
- `<usa-timeline scrub="js">` removed — `scrub` picks the JS engine automatically; `smooth="…"` opts into smoothing.
- Category entries (`use-scroll-animate/components/<category>`) no longer re-export `configureComponents`, `prefersReducedMotion`, `ComponentsConfig`, `UsaElement` — import them from `use-scroll-animate/components`.

### Added
- **Unified plugin-style effect registration** — new category `use-scroll-animate/components/fx`: `registerEffect({ name, kind, defaults, reduced, run })`, `registerEffects()`, `playEffect(el, name, options)`, `bindEffect(el, name, { trigger: 'click' | 'hover' | 'enter' | 'load' | 'loop' | 'manual' })`, `listEffects(kind?)`, `getEffect()`, `hasEffect()`, `EFFECT_KINDS`, `EFFECT_TRIGGERS`. Effects receive a context whose `animate()` applies reduced motion, motion sensitivity, intensity and the animation budget.
- **`<usa-fx effect="…" trigger="…">`** plays any registered effect on its child.
- **Built-in effects** (`BUILTIN_EFFECTS`): every timeline preset as an `enter` effect; attention seekers `pulse` · `pop` · `jelly` · `wiggle` · `heartbeat` · `bounce` · `flash` · `tada` · `shake`; click effects `burst` · `confetti` · `ripple`.
- `animateWithMotion(el, frames, options)` — the shared motion-aware `animate()` used by elements and effects.
- `<usa-motion-switch>` keeps its Off button (now motion sensitivity `minimal`); `setMotionLevel()`, `getMotionLevel()`, `MotionSwitchLevel`.
- Showcase: new **Effects (plugin API)** category — attention seekers, click effects, scroll entrances, `registerEffect()` live demo.
- **[docs/ROADMAP.md](./docs/ROADMAP.md)**: the 5.1 → 6.0 plan (card & click 2.0, bounce physics, page-wide, scroll storytelling, generative backgrounds, sound-reactive, cursor & gesture packs, theme packs & micro-interactions, JSON animation player, 6.0 cleanup).
- CDN examples now use `use-scroll-animate@5`.

## [4.9.0] - 2026-10-08

### Deprecated (removed in 5.0 — each warns once in the console)
- `configureComponents({ motionIntensity: 'off' })` and `setMotionIntensity('off')` → `motionSensitivity: 'minimal'` / `setMotionSensitivity('minimal')`. (`<usa-motion-switch>`'s Off button and restoring a saved level stay silent.)
- `configureComponents({ reducedMotion: 'no-preference' })` → removed; the OS setting is always honoured (`'user'` / `'reduce'`).
- `<usa-timeline scrub="js">` → `scrub` (automatic JS fallback) + `smooth="…"`.
- `configureComponents` / `prefersReducedMotion` / `ComponentsConfig` / `UsaElement` imported from category entries → import from `use-scroll-animate/components`.

### Added
- **Codemod** `npx usa-codemod-5 [--write] [paths…]` (new `bin`): rewrites all of the above in `.js/.ts/.jsx/.tsx/.vue/.svelte/.html/.astro` files; dry run by default.
- **[docs/upgrading-5.md](./docs/upgrading-5.md)** — removals, the 5.0 modern-browser baseline, what's new.
- `baselineReport()` / `warnBaseline()` (`components/a11y`): which 5.0-required (Custom Elements, WAAPI, IntersectionObserver, ResizeObserver, adoptedStyleSheets) and progressive (View Transitions, scroll-driven animations, WebGL) features this browser has.
- `withoutDeprecations(fn)` for library-internal calls.

## [4.8.0] - 2026-10-08

### Added
- **GPU particle presets** on `glQuad()` for `<usa-shader preset="…">`: `snow`, `fireflies`, `stars` (warp starfield), `bokeh`, `rain` — procedural in one fragment shader (no buffers, no per-particle JS). `PARTICLE_PRESETS`.
- **`<usa-post-fx effects="…" intensity="0.6">`** — chainable GPU post-processing over an `<img>`: `vignette` · `grain` · `chromatic` · `scanlines` · `crt` · `bloom` · `pixelate` · `duotone` · `glitch`. `POST_EFFECTS`, `postFxShader(list)` for your own `glQuad()`.
- **Unified WebGL fallback** — every preset has a still CSS rendering (`GL_FALLBACKS`, `glFallbackCss()`; `--usa-gl-fallback` on `<usa-shader>`), post-fx images get an approximate CSS filter (`--usa-gl-filter`).
- **Battery / fps adaptive quality** for all GL elements: resolution steps 100 % → 50 % → 35 % after two slow seconds (< 40 fps) and back after five good ones; battery saver (≤ 20 % and discharging, or Save-Data) caps at 30 fps and ≤ 60 % resolution. `quality="high"` opts out; `data-quality` reflects the scale. `glGovernor()`, `watchPowerSaver()`.
- `glQuad().render({ extra })` sets any float uniform; `resize(scale)` scales the drawing buffer.
- Showcase: **GPU particles** and **Post-processing** cards (Canvas & WebGL). All new shaders verified to compile in Chromium (SwiftShader).

## [4.7.0] - 2026-10-08

### Added
- **Native shell bridges** — new entry `use-scroll-animate/components/bridge` (also on `UsaComponents` in the UMD build): `connectNativeShell()` syncs the host app's **reduce motion**, **light / dark / high-contrast theme** and **accent color** (and optional motion-sensitivity level) into every `<usa-*>` component. JSON protocol `usa:ready` / `usa:request-settings` / `usa:settings` over WebView2 web messages, `window.postMessage` or `window.usaNative.apply()`; incoming values validated. Helpers `detectNativeHost()`, `postToNative()`, `parseNativeSettings()`, `applyNativeSettings()`; event `usa:native-settings`.
- **Official samples** in [examples/native](./examples/native/): **WinUI 3** (`UISettings.AnimationsEnabled`, accent, high contrast → `PostWebMessageAsJson`), **.NET MAUI** (Android animator scale, iOS Reduce Motion, Windows `UISettings`, `RequestedThemeChanged` → `EvaluateJavaScriptAsync`), **Flutter** (`MediaQuery.disableAnimations`, brightness, high contrast via a `UsaBridge` JavaScriptChannel), sharing one web page.
- Showcase: **connectNativeShell()** card (Page & app-wide) — simulate host messages on a demo tile.
- Docs: "Native shell bridge" in [docs/hybrid-apps.md](./docs/hybrid-apps.md).

## [4.6.0] - 2026-10-08

### Added
- **Playground 2.0** ([showcase/playground.html](https://harrisoncn.github.io/Motionary/showcase/playground.html)):
  - **Keyframe track editor** — one lane per timeline step on a ms ruler; drag a bar to move it, drag its right edge to change duration (50 ms snapping), arrow keys (Shift = resize) for keyboard users; preset, label, start and duration fields; **Play timeline** previews it with a real `<usa-timeline>`.
  - **Save / share presets** — named presets in localStorage, share links now carry the tracks (old links still open), portable preset JSON (`Copy preset JSON` / `Import JSON…`).
  - **Export as `<usa-timeline>`** — new code tab with declarative markup (`data-tl`, absolute `data-at`, `data-duration`) plus the `defineTimeline()` import.
- `showcase/playground-core.js`: `newTrack`, `normalizeTracks`, `tracksDuration`, `trackBar`, `dragTrack`, `timelineMarkup`, `listPresets` / `savePreset` / `loadPreset` / `deletePreset`, `presetToJSON` / `presetFromJSON` (pure, unit-tested).

## [4.5.0] - 2026-10-08

### Added
- **Shared rAF scheduler** — every component loop now runs on one `requestAnimationFrame` per frame (batched, ordered; a throwing callback no longer starves the others). New entry `use-scroll-animate/components/perf`: `onFrame(fn)`, `schedulerStats()`.
- **Animation budget & auto-degrade** — `setAnimationBudget(n)` / `animationBudget()` / `activeAnimations()`; `autoDegrade({ minFps, maxActive, sample, patience, recovery, onChange })` steps motion to `low` and halves the budget while fps drops or too many animations run, restores when frames recover, dispatches `usa:degrade`.
- **On-demand CSS** — new entry **`use-scroll-animate/components/lite`**: the whole library without inlined CSS; each category's `dist/components/<cat>.css` is linked the first time one of its elements connects. **≈ 62 KB gzip** for everything (vs ≈ 79 KB), CI budget **≤ 70 KB**. `onDemandStyles(base)`, `loadCategoryStyles(cat, base)`, `categoryOf(tag)`, `loadedStyles()`.
- Showcase: **autoDegrade()** card (Page & app-wide) — stress 120 animations, toggle a budget, watch scheduler stats.
- Docs: [docs/performance.md](./docs/performance.md).

## [4.4.0] - 2026-10-08

### Added
- **Accessibility toolkit** — new entry `use-scroll-animate/components/a11y` (also re-exported from `use-scroll-animate/components`):
  - **Motion-sensitivity levels** `setMotionSensitivity('full' | 'gentle' | 'minimal' | 'static', persist?)`, `restoreMotionSensitivity()`, `getMotionSensitivity()`, `motionAllowed(kind)`, `MOTION_SENSITIVITY`. `gentle` strips spins, zooms, skews and 3D from every component animation (vestibular-safe); `minimal` = fades only; `static` = no animation at all (also stops page CSS animations). `configureComponents({ motionSensitivity })` and `adaptKeyframes(frames, level)` for your own WAAPI code.
  - **Static alternatives** — `STATIC_ALTERNATIVES` documents the static rendering of every category; `staticAlternative(root)` freezes a subtree at its final state.
  - **aria-live conventions** — one shared polite (`role="status"`) and one assertive (`role="alert"`) region; `announce(message, { politeness, dedupe })`, `liveRegion()`.
  - **`auditMotionA11y(root)`** — focusable-in-`aria-hidden`, unnamed widget roles, sliders without `aria-valuenow`, `<img>` without `alt`, assertive regions outside alerts, endless animations without a motion control (WCAG 2.2.2).
- **Automated a11y regression tests**: every `<usa-*>` element is mounted at all four sensitivity levels and audited (`test/a11y-regression.test.ts`).
- Showcase: **setMotionSensitivity()** card (Page & app-wide) — replay a spin-zoom entrance at each level, announce, audit the page.
- Docs: levels, static alternatives, live-region conventions and the audit in [docs/accessibility.md](./docs/accessibility.md).

### Fixed
- `<usa-cursor>` under reduced motion / on touch no longer keeps author content inside its `aria-hidden` host (found by the new audit).

## [4.3.0] - 2026-10-08

### Added
- **`splitText(el, { by: 'char' | 'word' | 'line' })`** in `use-scroll-animate/components/text` — `Intl.Segmenter`-aware splitting (emoji / grapheme clusters, Chinese & Japanese word boundaries), Arabic-script words kept whole so shaping survives, RTL aware, inline markup preserved; returns `{ units, chars, words, lines, revert() }`. Lines are re-measured on resize.
- **`splitTimeline(el, options)`** — turns the split units into a `timeline()` (preset, stagger, duration, easing tokens) with `from: 'start' | 'end' | 'center' | 'edges' | 'random'`; `.play()` or `.scrub(section)`.
- Helpers `splitOrder()`, `graphemes()`, `splitWords()`, `JOINING_SCRIPT`.
- `<usa-split-text>` upgraded: `by="lines"` and `from="center|edges|end|random"` attributes, now built on `splitText()`.
- Showcase: **splitText()** card (Text) — Latin + emoji, Chinese and Arabic RTL lines, replay from start / center / edges / random.

## [4.2.0] - 2026-10-08

### Added
- **Motion design tokens** — new entry `use-scroll-animate/components/tokens` (also re-exported from `use-scroll-animate/components`): one duration / easing / spring scale as CSS custom properties (`--usa-duration-fast`, `--usa-easing-emphasized`, `--usa-spring-bouncy-stiffness`…), W3C Design Tokens (DTCG) JSON and JS values.
  - `MOTION_TOKENS` (durations `instant`→`slowest`, easings `standard` · `emphasized` · `decelerate` · `accelerate` · `spring` · `bounce`, springs `gentle` · `snappy` · `bouncy` · `wobbly` · `stiff`).
  - `applyMotionTokens(partial?, root?)` (writes the vars, sets the active scale, returns undo), `motionToken()`, `motionVar()`, `getMotionTokens()`.
  - `importMotionTokens(json)` reads **Figma Tokens / Tokens Studio** (`value` / `type`), **Style Dictionary** (nested `value`) and **DTCG** (`$value` / `$type`, incl. `transition` composites) exports; `motionTokensToCss()`, `motionTokensToVars()`, `motionTokensToJSON()`.
  - Prebuilt `docs/motion-tokens.css` and `docs/motion.tokens.json`; guide in [docs/motion-tokens.md](./docs/motion-tokens.md).
- `timeline()` steps and defaults accept token names: `{ duration: 'slow', easing: 'spring' }`.
- Showcase: **applyMotionTokens()** card (Page & app-wide) — play a stagger at `fast` / `normal` / `slow` with any easing token.

## [4.1.0] - 2026-10-08

### Added
- **Native scroll-driven scrub** — `timeline().scrub(el)` now runs on the browser's `ViewTimeline` (default; `el` moving through the viewport, range `cover`) or `ScrollTimeline` (`{ source: 'scroll' }`; `el` is the scroll container) when available. Each step becomes one scroll-driven animation over its slice of the range, so the playhead is driven off the main thread with no per-frame JS.
- `scrub()` options: `source` (`'view'` · `'scroll'`), `engine` (`'auto'` · `'native'` · `'js'`), `axis` (`block` · `inline` · `x` · `y`). The returned stop function carries `.native`.
- `supportsNativeScrub(source?)` (main entry and `components/timeline`); `ScrubHandle` type.
- `<usa-timeline scrub>` uses the native engine (sets `data-native`); `scrub="scroll"`, `scrub="js"` and `smooth="0.2"` tune it.
- JS fallback (rAF-throttled scroll listener) for browsers without scroll-driven animations and whenever JS is needed: `smooth`, `offset`, `call()` cues, `onUpdate`, `engine: 'js'`. The fallback now also supports `{ source: 'scroll' }` and horizontal axes.
- Showcase: **supportsNativeScrub()** card — a scroll box scrubbing a three-step timeline, showing which engine runs it (verified in Chromium: native ScrollTimeline).

### Changed
- `<usa-timeline scrub>` no longer smooths by default (`smooth` was 0.2) so it can run natively; add `smooth="0.2"` for the previous feel.

## [4.0.1] - 2026-10-08

### Fixed
- **`<usa-mask-reveal>` never revealed in Chromium** (trigger `view`): Chromium's IntersectionObserver honours the target's own `clip-path`, so a fully clipped element never reported as intersecting. It now waits hidden with `opacity: 0`, and the clip-path animation uses `fill: 'both'` so the closed mask also covers the `delay`.
- **`<usa-timeline trigger="click">` was invisible until first clicked** — it now shows the finished composition and replays from the start on click, `Enter` or `Space` (focusable by default).
- **WebGL elements (`<usa-shader>`, `<usa-distort>`, `<usa-liquid>`)** only resized their canvas on window resize; they now follow their own size with a `ResizeObserver` (grid reflow, card expand, sidebars).
- **`<usa-handwriting>`** keeps its intrinsic size when a page has a global `svg { width: … }` icon rule.
- **Solid:** the `use:usa` directive (`components/solid`) and the `use:scrollAnimate` directive (`/solid`) now track their accessor with `createRenderEffect` — signals update props / options / handlers without calling `refresh()`; listeners are removed on cleanup.
- **Showcase (checked in headless Chromium at 1280 px and 390 px):** demo SVGs (line drawing, handwriting, `morphTo()`) were squashed to 20 px by the showcase's global icon rule; the pinch-zoom and mask-reveal demos used undefined CSS classes (text overflowed the tile); the header hid the Playground / Store links on phones; deep links to `#c-carousel-3d` (ids with digits) did not resolve; the playground's copy / share buttons threw an unhandled rejection when clipboard access was denied and gave no feedback; stale “v2” / “v3.0” kickers and a Chinese phrase in the English category text.

### Tests
- New `test/fixes-4-0-1.test.ts` regression suite; `<usa-mask-reveal>` and Solid adapter tests updated.

## [4.0.0] - 2026-10-07

4.0 completes the 3.x release train by consolidating overlapping APIs. Every removal has a drop-in replacement that shipped during 3.x — see **[Upgrading to 4.0](./docs/upgrading-4.md)** (run your app on 3.9 first: it warns once wherever removed APIs are used).

### ⚠ Breaking changes
- **`sequence()` removed** from `use-scroll-animate` → use **`timeline()`**, now also exported from the root entry (`import { timeline } from 'use-scroll-animate'`, `ScrollAnimate.timeline` in the UMD build) alongside `resolvePosition` and `TIMELINE_PRESETS`. `SequenceStep` / `SequenceOptions` / `SequenceController` types removed (use `Timeline`, `TimelineOptions`, `TimelineStepOptions`).
- **`connectedAnimation()` removed** from `components/transitions` → use **`sharedTransition(update)`** with `data-shared="id"` (`components/layout`; View Transitions API + FLIP fallback). `ConnectedOptions` type removed.
- **`<usa-flip-list>` / `defineFlipList()` removed** from `components/transitions` → use **`<usa-auto-animate>` / `autoAnimate()`** (`components/layout`), which also animates additions, removals and size changes. `flip()` stays.
- CDN snippets in docs and the showcase now point at `use-scroll-animate@4`.

### Changed
- The Animation Store's timeline recipe, the vanilla example, README (EN / 中文 / 日本語), API docs and the AOS / GSAP migration guides use `timeline()`.
- The component gallery's transitions category shows a `flip()` demo instead of the removed helpers.

### Docs
- New **[docs/upgrading-4.md](./docs/upgrading-4.md)** (step-by-step migration with before / after code).
- New **[docs/ROADMAP.md](./docs/ROADMAP.md)** — the post-4.0 plan (v4.1 → v5.0).

### Migration
| 3.x | 4.0 |
|---|---|
| `sequence([{ target: '.a' }, { target: '.b', gap: -200 }], { trigger: '.hero' })` | `timeline().to('.a', 'fade-up').to('.b', 'fade-up', { at: '-=200' })` + play on view / `scrub()` |
| `connectedAnimation(thumb, detail)` | `sharedTransition(() => { … })` with `data-shared="id"` on both |
| `<usa-flip-list>` | `<usa-auto-animate>` |

npm: **4.0.0 is published as `latest`**; 3.x remains installable as `use-scroll-animate@3`.

## [3.9.0] - 2026-10-07

### Added
- **Effect packs** — new category `use-scroll-animate/components/packs`: ready-made motion for whole page types. Mark elements with `data-role` and apply a pack with `<usa-pack name="…">` or `applyPack(name, root)` (returns undo):
  - `ecommerce` — `product` (reveal + lift), `add-to-cart` (press + fly to cart), `cart` (bump), `price` (count up), `badge` (pulse)
  - `portfolio` — `project`, `heading`, `stat`, `contact`
  - `dashboard` — `card`, `stat`, `alert`, `action`
  - `game` — `button`, `score`, `item` (float), `hit` (shake), `reward`
  - `landing` — `hero`, `feature`, `cta`, `logo`, `stat`
  - Helpers: `flyToCart(from, to)` (arc flight + cart bump), `countUp(el)` (keeps currency / separators / decimals, accessible label), `PACKS`, `PACK_PRIMITIVES`.
- Reduced motion: packs leave content static (numbers show their final value, no flights / pulses / floats).
- Showcase: new **Effect packs** gallery category with a live demo per pack and a `flyToCart()` demo.

### Deprecated (removed in 4.0)
- `sequence()` → `timeline()` (since 3.1).
- `connectedAnimation()` → `sharedTransition()` (since 3.6).
- `<usa-flip-list>` / `defineFlipList()` → `<usa-auto-animate>` / `autoAnimate()` (since 3.6).

Each logs a one-time console warning linking to the new **[Upgrading to 4.0](./docs/upgrading-4.md)** guide.

## [3.8.0] - 2026-10-07

### Added
- **Svelte** — `use-scroll-animate/components/svelte`: `use:usa={{ props, on }}` action (sets DOM properties, binds `usa:*` events with update / destroy; works in Svelte 3, 4 and 5) and `defineUsa(categories?)` (client-only, SvelteKit-safe).
- **Solid** — `use-scroll-animate/components/solid`: `use:usa` directive (`refresh()` / `destroy()`), `defineUsa()`, `SolidUsaIntrinsicElements` JSX types; native `prop:` / `on:usa:change` documented.
- **Angular** — `use-scroll-animate/components/angular`: `usaInitializer(categories?)` for `APP_INITIALIZER`, `defineUsa()`, `usaDetail($event)`; `CUSTOM_ELEMENTS_SCHEMA` + `[prop]` / `(usa:event)` binding documented. No `@angular/*` import.
- Shared framework-neutral `bindUsa(el, { props, on })` / `usaEventName()` (exported from all three entries).
- **Docs**: new [docs/hybrid-apps.md](./docs/hybrid-apps.md) — .NET MAUI (`HybridWebView`, `BlazorWebView`), Flutter (`webview_flutter` / `flutter_inappwebview`, `JavaScriptChannel`), Electron (context isolation, preload bridge), Tauri v2 (strict CSP, `invoke`), with native ↔ web event bridges and OS reduced-motion mirroring; `docs/frameworks-ssr.md` gains Svelte, Solid and Angular sections.

## [3.7.0] - 2026-10-07

### Added
- **Visual playground** — [`showcase/playground.html`](./showcase/playground.html) (no build, dogfoods `dist/components.js` with a CDN fallback):
  - **Compose**: stack effect layers around a card, button, heading or image — scroll reveal, 3D tilt, magnetic, spring, mask reveal, depth, swipeable, click ripple, shader background, glitch and gradient text — and reorder or remove them.
  - **Tweak**: every attribute has a live control (selects, sliders, toggles); the preview re-renders instantly, with a Replay button.
  - **Export**: HTML (CDN, no build), ES module (per-category imports with the right `define*Components()`), React (JSX via `components/jsx` types) and Vue (`isCustomElement` hint) code, copy to clipboard.
  - **Share**: the composition is encoded in the URL hash (`encodeState()` / `decodeState()`), so a link reproduces it.
  - English / 中文, keyboard accessible controls, honours `prefers-reduced-motion` (shows a notice; effects render their final state).
- Pure, tested playground core in `showcase/playground-core.js` (`PLAYGROUND_EFFECTS`, `composeMarkup()`, `playgroundSnippets()`); the component gallery links to the playground.

## [3.6.0] - 2026-10-07

### Added
- **Layout animation** — new category `use-scroll-animate/components/layout`:
  - `autoAnimate(parent, { duration, easing, scale })` and `<usa-auto-animate>` — zero-config list / grid reflow: added children fade-scale in, removed children fade out in place (as positioned ghosts), moved or resized ones glide with FLIP (sort, filter, insert, container resize); `enable()` / `disable()` / `stop()`.
  - `<usa-masonry>` — masonry grid (`columns` or `min` column width, `gap`): shortest-column placement, items glide when the width, the set of items or their sizes change (ResizeObserver); CSS multi-column before JS runs.
  - `sharedTransition(update, root?, opts)` — shared-element transitions: elements with the same `data-shared="id"` before and after `update()` morph into each other via the View Transitions API (`view-transition-name` assigned per id) with a FLIP fallback.
  - Pure helpers `flipFrames()`, `masonryLayout()`.
- Reduced motion: layout changes apply instantly, masonry does not glide, shared transitions just run `update()`.
- Showcase: new **Layout animation** gallery category (interactive add / shuffle / remove, masonry, shared-element thumbnails → detail).

## [3.5.0] - 2026-10-07

### Added
- **3D & depth** — new category `use-scroll-animate/components/depth`:
  - `<usa-cube>` — CSS 3D cube from up to six children (front, right, back, left, top, bottom): drag / swipe (via `gesture()`), arrow keys, `autoplay` (pauses on hover / focus), `show(face | index)`, `next()`, `prev()`; spring-driven, shortest-path rotation; only the front face is exposed to assistive tech; `usa:change`.
  - `<usa-depth>` — layered depth parallax: `data-depth` (-1…1) layers shift and scale from `source="pointer | orientation | scroll"` (combinable), `strength`, optional scene `rotate`; `requestPermission()` for iOS motion sensors.
  - `deviceTilt(cb, { range, smooth })`, `orientationToTilt()`, `requestOrientationPermission()`, `supportsOrientation()` — device-orientation tilt helpers.
- The 3D ring carousel stays `<usa-carousel-3d>` (in `components/cards`) and is cross-linked from the new category.
- Reduced motion: the cube switches faces instantly with no drag-rotate or autoplay; depth layers stay flat.
- Showcase: new **3D & depth** gallery category (cube, depth scene, gyroscope demo).

## [3.4.0] - 2026-10-07

### Added
- **Canvas & WebGL** — new category `use-scroll-animate/components/webgl` (no three.js; one tiny single-quad runner):
  - `<usa-shader>` — GPU shader backgrounds behind content: presets `gradient`, `plasma`, `waves`, `aurora`, or your own GLSL in `<script type="x-shader/x-fragment">` (uniforms `u_time`, `u_resolution`, `u_mouse`, `v_uv`); `speed`.
  - `<usa-distort>` — hover image distortion with RGB split around the pointer.
  - `<usa-liquid>` — liquid / ripple images: clicks send up to four water ripples through the image, hover wobbles; `strength`.
  - `glQuad(canvas, fragment)` (returns `{ render, resize, texture, dispose }` or `null`), `supportsWebGL()`, `fragmentSource()`, `SHADERS`.
- **Graceful fallback**: without WebGL, when a shader fails to compile, or for a cross-origin image without CORS, the canvas is removed and `data-fallback="webgl | image | no-image"` is set — `<usa-shader>` keeps its CSS gradient, images stay visible (`<usa-distort>` falls back to a CSS hover zoom).
- Performance: renders only while in view and the tab is visible, DPR capped at 2, contexts released on disconnect.
- Reduced motion: a single static frame, no animation loop.
- Showcase: new **Canvas & WebGL** gallery category (shader presets, distortion, liquid image, live `glQuad()` demo) with a generated demo photo in `showcase/assets/`.

## [3.3.0] - 2026-10-07

### Added
- **SVG** — new category `use-scroll-animate/components/svg`:
  - `<usa-draw>` — line drawing for every stroke of the SVG inside (normalised `pathLength`, no `getTotalLength()`): `trigger` (`view` · `hover` · `click` · `scrub`), `duration`, `stagger`, `fill`, `repeat`; `progress`, `play()`, `usa:complete`.
  - `<usa-morph>` — path morph through `paths="A | B | C"` on `click` (keyboard accessible) · `hover` · `view` · `auto`; same-structure paths morph point by point, others switch at the midpoint.
  - `<usa-mask-reveal>` — clip-path mask reveals: `circle`, `diamond`, `star`, `iris`, `wipe`, `wipe-up`, origin `at`, `trigger`, `repeat`.
  - `<usa-anim-icon>` — animated stroke icons (`bell`, `heart`, `check`, `arrow`, `star`, `gear`, `search`, `download`) on hover / focus, click, view or loop; decorative unless `label` is set.
  - Helpers: `morphTo()`, `interpolatePath()`, `pathsCompatible()`, `drawLines()`, `MASK_SHAPES`, `ANIM_ICONS`.
- Reduced motion: drawings appear complete, morphs switch instantly (`auto` does not cycle), masks are not applied, icons stay still.
- Showcase: new **SVG** gallery category (draw, morph, mask, icons, `morphTo()` demo).

## [3.2.0] - 2026-10-07

### Added
- **Gestures** — new category `use-scroll-animate/components/gesture`:
  - `gesture(el, handlers, options)` — one Pointer Events recognizer for **pan** (`dx`, `dy`, `vx`, `vy`, `first`, `last`), **swipe** (direction + velocity), **pinch** (two pointers, or Ctrl/⌘ + wheel / trackpad pinch), **long-press**, **tap** and **double-tap**; `axis` lock keeps native scrolling on the other axis. Release velocities go straight into springs: `spring.set(0, vx)`. Pure helpers `swipeDirection()` and `pinchScale()` are exported.
  - `<usa-swipeable>` — swipe-to-dismiss / swipe actions: follows the finger (rubber-banded past `distance`), flies out on a swipe, springs home otherwise; `axis`, `distance`, `preset`, `dismiss`; Delete / arrow keys; cancelable `usa:swipe`, `usa:dismiss`.
  - `<usa-pinch-zoom>` — pinch / Ctrl + wheel zoom, pan while zoomed, double-tap toggle, springs back inside bounds; `min`, `max`, `double-tap`; `+` / `-` / `0` keys; `usa:zoom`.
- Reduced motion: no follow or fly-out animation (events still fire), zoom changes instantly.
- Showcase: new **Gestures** gallery category with a live `gesture()` + spring demo.

## [3.1.0] - 2026-10-07

### Added
- **Timeline & choreography** — new category `use-scroll-animate/components/timeline`:
  - `timeline()` — one playhead for many WAAPI animations: `.to(target, keyframes | preset, { at, duration, easing, stagger })`, `.label()`, `.call()`, `play()`, `reverse()`, `pause()`, `seek(ms | label)`, `progress(p)`, `scrub(section, { smooth })` and `cancel()`. Positions: `'>'` (chain, default), `'<'` (with previous), `'-=200'` (overlap), `'+=100'` (gap), `'<+=50'`, `'label+=100'` or absolute ms (`resolvePosition()` is exported).
  - `TIMELINE_PRESETS`: `fade`, `fade-up/down/left/right`, `scale`, `blur`, `rotate`, `clip-up`, `clip-right`.
  - `<usa-timeline>` — declarative: `data-tl` children become steps (`data-at`, `data-duration`, `data-label`); `trigger` (`view` · `click` · `manual`), `scrub`, `overlap`, `stagger`, `repeat`; `usa:complete`.
- Reduced motion: timelines jump to their end state, scrub is disabled; without WAAPI the final frames are applied.
- Showcase: new **Timeline & choreography** gallery category (declarative demo + interactive play / reverse / scrub slider).

## [3.0.0] - 2026-10-07

3.0 removes what 2.9 deprecated. Every change has a drop-in replacement — see **[Upgrading to 3.0](./docs/upgrading-3.md)** (run your app on 2.9 first: it warns once wherever old usage is found).

### ⚠ Breaking changes
- **`variant` no longer selects a component's kind.** `<usa-spinner>`, `<usa-check>`, `<usa-dialog>` and `<usa-acrylic>` use **`kind`** (`<usa-spinner kind="windows">`, `<usa-dialog kind="drawer-end">`, `<usa-acrylic kind="mica">`); `variant` on every element now only selects a style variant (`minimal`, `neon`, `glass`, `brutalist`, `fluent`, `material`). The `spinner.variant` property is removed (use `.kind`); internal state attributes are now `data-kind`.
- **Removed the legacy transform-based parallax** of the scroll engine: the `parallax` option of `observe()` / `animate()`, the `data-sa-parallax-x|y|rotate|scale|speed` attributes (also on `<scroll-animate>`) and the `ParallaxOptions` type. Use `parallax(el, { speed })` (writes `translate` + `--sa-parallax`, composes with entrance animations) or `progressVar`.
- **Node ≥ 20** for SSR imports (`engines`); Node 18 is end-of-life.
- CDN snippets in docs and the showcase now point at `use-scroll-animate@3`.

### Changed
- The scroll core is smaller without the legacy parallax path (`progress` tracking now only runs for `onProgress` / `progressVar`).
- `examples/vanilla` uses `parallax()`.

### Migration
| 2.x | 3.0 |
|---|---|
| `<usa-spinner variant="dots">` | `<usa-spinner kind="dots">` |
| `<usa-check variant="error">` | `<usa-check kind="error">` |
| `<usa-dialog variant="sheet">` | `<usa-dialog kind="sheet">` |
| `<usa-acrylic variant="mica">` | `<usa-acrylic kind="mica">` |
| `spinner.variant = 'ring'` | `spinner.kind = 'ring'` |
| `observe(el, { parallax: { y: 80 } })` / `data-sa-parallax-y="80"` | `parallax(el, { speed: 0.2 })` or `progressVar: '--p'` + CSS |

## [2.9.0] - 2026-10-07

### Added
- **React wrappers** `use-scroll-animate/components/react`: `createUsaComponents(React)` returns a typed wrapper for every `<usa-*>` element (`UsaButton`, `UsaCard`, `UsaToggle`, …) that sets properties (`checked`, `value`, `state`, `open`, …), forwards `ref` and maps `onUsaChange` / `onUsaDragEnd`-style props to `usa:*` events (works on React 18 and 19). `USA_TAGS`, `eventName()`, `pascal()`.
- **Vue integration** `use-scroll-animate/components/vue`: `isUsaElement` (`compilerOptions.isCustomElement`) and `UsaPlugin` (`app.use(UsaPlugin, { categories })`).
- **JSX types** `use-scroll-animate/components/jsx`: `UsaIntrinsicElements` / `UsaTag` / `UsaAttributes` to type raw `<usa-*>` tags in React, Preact or Solid JSX.
- **Lazy per-component registration** `use-scroll-animate/components/lazy`: `lazyDefine()` watches the DOM and dynamically imports only the categories whose tags are used (one chunk per category); `defineUsed(root)`, `loadCategory(cat)`, `categoryOfTag(tag)`.
- **Accessibility audit**: automated sweep that mounts every `<usa-*>` element in normal, reduced-motion and motion-`off` modes and checks roles / focusability of interactive elements and `aria-hidden` on decorative layers; [`docs/accessibility.md`](./docs/accessibility.md) (motion, keyboard map, roles & states, transparency).
- **Guides**: [`docs/frameworks-ssr.md`](./docs/frameworks-ssr.md) — Next.js (App Router), Astro (incl. MPA view transitions), Vue / Nuxt, Svelte, Solid, Angular, lazy loading.
- **Theme tokens** documented: `--usa-accent`, `--usa-accent-text`, `--usa-surface`, `--usa-text`, `--usa-radius`, `--usa-border`, `--usa-shadow`, `--usa-blur`, `--usa-font`, `--usa-motion`.
- **Perf benchmark** `npm run bench` (`scripts/bench.mjs`, jsdom: define + mount/unmount N of every element) and size budgets for the new entries.
- **Showcase**: every card's parameter controls now flow into the generated code (HTML / ESM / React / Vue / desktop tabs) so what you tweak is what you copy; category navigation covers all 11 categories.

### Changed
- `COMPONENT_CATEGORIES` lives in a dependency-free module (re-exported unchanged) so the lazy loader and framework helpers do not pull in every component.

### Deprecated (removed in 3.0)
- `variant` as the **kind** selector of `<usa-spinner>`, `<usa-check>`, `<usa-dialog>` and `<usa-acrylic>` → use the new `kind` attribute / `.kind` property (`<usa-spinner kind="windows">`). `variant` is reserved for style variants. Old usage keeps working in 2.x with a one-time console warning.
- The transform-writing `parallax` option of `observe()` / `data-sa-parallax-*` attributes → use `parallax(el, { speed })` (CSS-variable based, composes with entrance transforms) or `progressVar`. One-time console warning.
- See [docs/upgrading-3.md](./docs/upgrading-3.md).

### Deferred
- Pixel-based visual regression tests need real browsers (Playwright) in CI; deferred to a later release (the jsdom suite covers behaviour, ARIA and reduced motion).

## [2.8.0] - 2026-10-07

### Added
- **Text effects** (in `components/text`): `<usa-wave-text>` (travelling letter wave), `<usa-glitch>` (RGB-split slice glitch, always / hover), `<usa-gradient-text>` (flowing multi-colour gradient fill), `<usa-handwriting>` (text draws itself stroke by stroke, then fills; `usa:complete`), `<usa-scroll-highlight>` (words light up as you read down the page, or `mode="marker"` highlighter sweep). Animated copies are `aria-hidden` with a plain screen-reader copy.
- **Backgrounds** (in `components/background`): `<usa-grid-glow>` (line grid lit around the pointer), `<usa-blobs>` (fluid morphing colour blobs), `<usa-water-ripple>` (interactive canvas water ripples, `drop(x, y)`), `<usa-dot-network>` (dot grid that swells and links to the pointer). Canvas effects run only while visible and the tab is shown, DPR ≤ 2.
- **Windows Fluent preset** `fluentPreset({ reveal, mica, selector })` (in `components/background`): `fluent` variant page-wide (Segoe UI Variable, Windows 11 accent, radii), Mica-style window tint, Acrylic on `.usa-acrylic` / `[data-acrylic]`, and **Reveal highlight** on buttons / `[data-fluent-reveal]`; returns an undo function.
- **WinUI 3 + WebView2 sample app** in [`examples/webview2-winui/`](./examples/webview2-winui/) (Windows App SDK, native Mica backdrop, `SetVirtualHostNameToFolderMapping`, `components.umd.js` + `fluentPreset()`), documented in `docs/windows-apps.md`.
- Reduced motion: wave / glitch / gradient flow stop, handwriting and highlights appear complete, backgrounds are static, no Reveal tracking; reduced transparency keeps materials solid.
- Showcase: the new text and background demos in their categories, plus a `fluentPreset()` card.

## [2.7.0] - 2026-10-07

### Added
- **Page & app-wide effects** — new category `use-scroll-animate/components/page` (+ `components/page.css`):
  - **Page transitions** on the View Transitions API: `pageTransition(update, { effect })` for SPA route changes — `fade`, `slide` / `slide-left` / `slide-right` / `slide-up`, `circle` (reveal from the click point), `blinds`, `pixel` (stepped dissolve), `zoom`; `enableMpaTransitions(effect)` for multi-page sites (`@view-transition { navigation: auto }`); `themeTransition(apply)` circle-reveal theme switch. Falls back to an instant update (optional cross-fade) without View Transitions.
  - `<usa-cursor mode="dot | trail | magnetic | glow">` custom cursors (fine pointers only, `hide-native`).
  - `smoothScroll()` (inertial wheel smoothing, touch/keyboard stay native) and `scrollToTarget()` (spring timing).
  - `<usa-fullpage>` full-screen snapping sections with keyboard paging and dot navigation.
  - `<usa-loading-bar>` + `loadingBar.start() / set() / done() / track(promise)` top loading bar (the scroll progress bar remains `<usa-scroll-progress>`).
  - `<usa-back-to-top>` with a reading-progress ring, spring scroll and focus return.
  - `<usa-ambient effect="particles | snow | stars | noise | gradient">` page-wide ambient layer (scroll-driven gradient, canvas paused in hidden tabs).
  - `<usa-splash>` launch / splash screen (`fade`, `scale`, `slide-up`, `circle` exit; `min` duration; `manual` + `done()`).
  - `<usa-auto-skeleton loading>` automatic skeletons from the existing markup.
  - **Global motion intensity**: `setMotionIntensity('off' | 'low' | 'normal' | 'high', persist?)`, `restoreMotionIntensity()`, `getMotionIntensity()`, `configureComponents({ motionIntensity })` and the `<usa-motion-switch>` control. It scales every component animation (and `spring()`), sets `--usa-motion` / `data-usa-motion` on `<html>`, and `off` behaves like `prefers-reduced-motion`.
  - Reduced motion: transitions update instantly, no cursor / smooth scrolling / ambient animation, instant jumps.
- Showcase: **Page & app-wide** category with live page-transition, theme reveal, cursor, ambient, splash, loading-bar, auto-skeleton, fullpage and motion-intensity demos.

## [2.6.0] - 2026-10-07

### Added
- **Style variants** for every component: `variant="minimal | neon | glass | brutalist | fluent | material"` on any `<usa-*>` element, `data-usa-variant` on any ancestor, or `setVariant()` for the whole app. Variants set shared design tokens (`--usa-accent`, `--usa-accent-text`, `--usa-surface`, `--usa-text`, `--usa-radius`, `--usa-border`, `--usa-shadow`, `--usa-blur`, `--usa-font`) that the components read (existing `<usa-toggle>`, `<usa-progress>`, cards, checkbox… now use `--usa-accent`). `fluent` follows the Windows 11 palette (light/dark), `material` Material 3. `defineComponents()` injects the token sheet; it is also in `components.css`.
- **UI components** — new category `use-scroll-animate/components/ui` (+ `components/ui.css`):
  - `<usa-tabs>` (sliding spring indicator, `line` / `pill`, roving tabindex, panels slide in from the direction of travel),
  - `<usa-drawer>` (left / right / top / bottom, spring in, drag / swipe to close, backdrop, Esc, focus return),
  - `<usa-bottom-sheet>` (snap points, inertia, drag-down-to-dismiss, grabber),
  - `<usa-pull-refresh>` (rubber-band pull, `usa:refresh` with `detail.done()`, `aria-busy` + status),
  - `<usa-fab>` (speed dial: up / down / left / right / radial, staggered spring, `aria-expanded`, inert while closed),
  - `<usa-navbar>` (auto-hide on scroll down, show on scroll up, `shrink`, page or `target` scroller),
  - `<usa-slider>` (form-associated `role="slider"`, spring thumb, value bubble, full keyboard),
  - `<usa-rating>` (hover preview, spring pop, number keys, `readonly`, form value),
  - `<usa-tooltip>` (spring-in, flips to stay on screen, `aria-describedby`),
  - `<usa-popover>` (click-to-open, spring from the trigger, Esc / outside click, focus return),
  - `<usa-badge>` (spring bump on change, `99+`, `dot`, `pulse`),
  - `<usa-avatar-stack>` (overlap that spreads on hover, `+N`).
  - All respect `prefers-reduced-motion` (instant open/close, no bumps, pulses or spreading).
- Showcase: **UI components & variants** category with live demos and per-card variant pickers, plus a `setVariant()` card.

## [2.5.0] - 2026-10-07

### Added
- **Click & tap** — new category `use-scroll-animate/components/click` (+ `components/click.css`):
  - **Button click deformation (按钮点击形变)** — `<usa-button>` around a native `<button>` / `<a>` (or acting as a button itself), spring-driven:
    - `deform="squash"` (squash on press, stretch-and-settle on release), `"wobble"` (elastic border-radius wobble), `"gooey"` (liquid droplets squeeze out from the press point and merge back, SVG goo filter), `"dent"` (the surface dents toward the pressed point: 3D tilt + inner shade). Combinable: `deform="squash wobble"`.
    - **Shape morph** `shape="pill | circle | icon"` / `morphTo(shape)`: the outline springs between pill, circle and icon-only, label (`[data-label]`) and icon (`[data-icon]`) cross-fade.
    - **Submit morph** `morph="submit"`: click → `loading` (shrinks to a spinner, `aria-busy`, live "Loading…" status) → `success` (drawn check) or `error` (shake + cross) → back to `idle` after `reset` ms. Drive with `state` or `event.detail.done(ok)` from `usa:submit`.
  - `<usa-icon-morph>`: point-interpolated, spring-driven icon morphs — `play ↔ pause`, `menu ↔ close`, `plus ↔ minus`, `check`, `arrow-right` (any pair); `toggle` + `labels` make it an accessible button. `MORPH_ICONS`, `morphPath()`.
  - `<usa-click effect="…">` (combinable): enhanced `ripple`, `burst` particles (`shape`: circle, square, star, heart, emoji), `confetti`, `squish`, `press-spring`, `shake` (also on `invalid` form fields).
  - `<usa-like>` (heart pop + burst, `aria-pressed`, count), `<usa-hold>` (hold-to-confirm progress ring; pointer, Space, Enter), `<usa-double-tap>` (heart at the tap point; `L` key), `<usa-checkbox>` (form-associated, spring box, self-drawing check, `indeterminate`).
  - Functions: `burst(x, y, opts)`, `confetti(opts)`, `shake(el)`, `haptic(pattern)` (`navigator.vibrate` where supported); `haptic` attribute on the elements.
  - Reduced motion: no deformation, particles or shaking (an outline flash instead); shape, icon and state changes are instant; statuses are still announced.
- Showcase: **Click & tap** category with button-deformation, shape-morph, submit, icon-morph, like, hold, double-tap, checkbox and confetti demos.

## [2.4.0] - 2026-10-07

### Added
- **Card effects** — new category `use-scroll-animate/components/cards` (+ `components/cards.css`):
  - `<usa-card effect="…">` with ten **combinable** effects (`effect="lift sheen"`): `flip` (hover or `trigger="click"`, `axis="y|x"`, `[data-front]` / `[data-back]`, `aria-pressed`), `holo` (holographic foil following the pointer), `glass` (frosted backdrop blur; solid under `prefers-reduced-transparency` / forced colours), `border-glow`, `conic-border` (rotating gradient border), `lift` (spring rise + slight tilt), `spotlight`, `sheen` (light sweep), `parallax-layers` (`[data-depth]` children) and `expand` (card → detail view with FLIP + spring; Esc / backdrop / `[data-close]` collapse). Pointer position is exposed as `--usa-card-x/-y` and `--usa-card-nx/-ny`.
  - `<usa-card-stack>`: swipeable deck (pointer, touch, arrow keys) with a spring fan-out, `loop`, `usa:swipe` / `usa:empty`.
  - `<usa-sticky-stack>`: cards stick while scrolling and covered cards shrink and dim.
  - `<usa-carousel-3d>`: items on a 3D ring rotated by drag, keys, clicks or `autoplay`, spring-driven, `aria-current` on the front item.
  - Reduced motion: no pointer tracking, tilt, parallax or sweeps; flips and expansions cross-fade; the carousel switches flat and instantly.
- Showcase: **Card effects** category (effect picker, flip, expand, swipe deck, 3D carousel) and a live sticky-stack section. The gallery now allows several demo cards per element.

## [2.3.0] - 2026-10-07

### Added
- **Spring & physics** — new category `use-scroll-animate/components/physics` (+ `components/physics.css`):
  - **Spring core**: a damped-spring solver (`stiffness`, `damping`, `mass`, initial `velocity`) with presets `gentle`, `wobbly`, `stiff`, `bouncy` (plus `default`, `slow`, `molasses`). `springEasing()` converts a spring into a CSS `linear()` easing + duration for WAAPI/CSS (cubic-bezier fallback where `linear()` is unsupported); `spring(el, keyframes, preset)` animates with it; `createSpring()` is an interruptible, velocity-preserving spring value for gestures. Helpers `projectInertia()` (flick projection), `snapTo()` (grid / points) and `rubberBand()` (iOS-style resistance).
  - `<usa-spring>`: `bounce-in`, `pop`, `drop` entrances with true spring timing, `jelly` and `rubber-band` attention effects; `trigger="view|hover|click|manual"`, `preset` or `stiffness`/`damping`/`mass`, `repeat`.
  - `<usa-draggable>`: drag with mouse, touch, pen or arrow keys; `spring-back`, `inertia`, `snap` (grid or points), `bounds="parent"` with rubber-banding, `axis`; events `usa:drag-start` / `usa:drag-end` / `usa:settle`.
  - `<usa-overscroll>`: elastic scroll container — pulling past an edge (touch, trackpad, wheel) stretches with rubber-band resistance and springs back.
  - Reduced motion: entrances fade, attention effects and overscroll stretch are skipped, springs jump to their target.
- Showcase: new **Spring & physics** category in the component gallery with live demos (effect / preset pickers, drag areas, elastic list, `spring()` playground).
- `npm run sync:exports` regenerates the per-category `exports` from `scripts/categories.mjs` (single list used by Rollup, the CSS bundle and a sync test).

## [2.2.0] - 2026-10-07

### Added
- **Animated components** — `use-scroll-animate/components`: 30 framework-agnostic, dependency-free `<usa-*>` custom elements (Custom Elements + CSS + Web Animations API) that run in browsers and in Windows desktop apps rendering with a web view (Electron, Tauri, WebView2 in WinUI 3 / WPF / WinForms, PWAs). Organised in six categories, each its own subpath export:
  - **Entrance & scroll** (`/components/reveal`): `<usa-reveal>` (12 effects, `repeat`), `<usa-stagger>`, `<usa-scroll-progress>` (page or `target`, `role="progressbar"`), `<usa-scrolly>` (sticky scrollytelling with `usa:step`).
  - **Text** (`/components/text`): `<usa-typewriter>`, `<usa-split-text>`, `<usa-scramble>`, `<usa-counter>` (`Intl.NumberFormat`, animated `.value`), `<usa-shimmer-text>`, `<usa-text-rotate>`. Animated text keeps a visually hidden plain copy for screen readers.
  - **Interaction** (`/components/interaction`): `<usa-ripple>`, `<usa-magnetic>`, `<usa-tilt>` (glare, `--usa-tilt-x/y`), `<usa-spotlight>` (Fluent Reveal highlight), `<usa-press>`, `<usa-toggle>` (`role="switch"`, form-associated).
  - **Loading & feedback** (`/components/feedback`): `<usa-spinner>` (`fluent` WinUI ring, `windows` orbiting dots, `ring`, `dots`, `pulse`, `bars`), `<usa-skeleton>`, `<usa-progress>` (Fluent indeterminate, paused / error states), `<usa-toaster>` + `toast()`, `<usa-check>`.
  - **Background & decoration** (`/components/background`): `<usa-aurora>`, `<usa-particles>` (canvas, runs only while visible), `<usa-grain>`, `<usa-marquee>`, `<usa-acrylic>` (Acrylic / Mica, solid under `prefers-reduced-transparency` / forced colours).
  - **Transitions** (`/components/transitions`): `<usa-dialog>` (native `<dialog>`; modal, drawers, sheet), `<usa-accordion>` (native `<details>`), `<usa-flip-list>`, `<usa-view-switch>`, and the helpers `viewTransition()` (View Transitions API with fallback), `flip()` and `connectedAnimation()` (WinUI-style shared-element animation).
- `defineComponents(categories?)`, `define<Category>Components()`, one `define*()` per element (custom tag names supported), `COMPONENT_CATEGORIES`, `configureComponents({ injectStyles, reducedMotion })`. Typed via `HTMLElementTagNameMap`.
- Every component honours `prefers-reduced-motion`, animates `transform` / `opacity` (and `filter` for blurs), batches layout reads/writes per frame, pauses loops off-screen / in hidden tabs, and is SSR-safe (no DOM access at import; `define*()` is a no-op on the server).
- Styles are injected per component as constructable stylesheets (CSP `style-src 'self'` friendly) or loaded as files: `use-scroll-animate/components.css` and `use-scroll-animate/components/<category>.css`.
- **No-build bundle** `dist/components.umd.js` (IIFE/UMD, global `UsaComponents`) registers every element on load.
- Docs: [`docs/components.md`](./docs/components.md) (every element, attribute, method and event, by category) and [`docs/windows-apps.md`](./docs/windows-apps.md) (Electron, Tauri, WinUI 3 / WPF / WinForms with WebView2, PWA, CSP, native Mica). README sections in English, 中文 and 日本語.
- **Showcase**: new component gallery `showcase/components.html` with category navigation, search, live demos of every element, per-card code tabs (HTML / ES module / React / Vue / Electron·Tauri·WebView2), English / 中文, dark / light; linked from the Animation Store and deployed by the existing Pages workflow.
- Size budgets for the bundle, the CSS file, each category and single-component imports (`size-budget.json`); `check:exports` covers the new entries and stylesheets.

### Changed
- `package.json` `sideEffects` is now `["*.css"]` (was `false`) so bundlers keep the optional stylesheet imports; all JS stays side-effect free.

## [2.1.0] - 2026-10-07

### Added
- **Showcase site** (`showcase/`): an "Animation Store" where every preset, feature (stagger, exit, parallax, progressVar, native engine, sequence, combined presets, spring easings) and framework adapter (React, Vue, Svelte, Solid, `<scroll-animate>`) is a product card with a live preview. Opening a card expands it (View Transitions API, FLIP fallback) into a detail view with a tweakable live demo (duration, easing, delay, distance, once/repeat, exit), a scroll test, and generated code for Vanilla / React / Vue / Svelte / Solid / HTML element / CDN with copy buttons. Search, category filters, favorites (localStorage), deep links (`#preset-name`), dark/light theme, English/中文, `prefers-reduced-motion` respected. No build step: it imports the library from `dist/` (dogfooding), falling back to the CDN build.
- **GitHub Pages workflow** (`.github/workflows/pages.yml`): builds `dist/` and deploys `showcase/` + `demo/` on every push to `main`.

## [2.0.1] - 2026-10-07

Bug-fix release; no API changes.

### Fixed
- Native engine (`engine: 'css'` / `'auto'`): elements that left the DOM (pruned by `watch()` / `init()`) stayed referenced by the instance until `destroy()`, which then cancelled their animations and rewrote their styles. They are now released when pruned.

### Changed (maintenance)
- Test for function easings no longer depends on the test DOM lacking `CSS.supports`.
- Dependabot ignores semver-major npm updates (TypeScript 7 breaks the Rollup build, jsdom 30 drops Node 20); majors are adopted deliberately.

## [2.0.0] - 2026-10-07

2.0 collects the 1.6–1.9 roadmap (native scroll timeline, Svelte/Solid/Web Component entries, exit animations and `parallax()`, docs and demo) and removes what 1.9 deprecated. See **MIGRATION from 1.x** below.

### ⚠ Breaking changes
- **`engine` defaults to `'auto'`**: presets run on the native scroll-driven timeline (`animation-timeline: view()`) where supported — scroll-linked instead of time-based. `'auto'` still picks the JS engine when an element sets `duration`, `delay`, `offset` or `stagger` itself. Set `defaultEngine: 'js'` for 1.x behaviour.
- **Removed** the `createReactHooks` / `createVueComposables` re-exports from the main entry: import them from `use-scroll-animate/react` / `use-scroll-animate/vue`.
- **ESM-first package** (`"type": "module"`): `import` → `dist/*.js` + `dist/*.d.ts`, `require` → `dist/*.cjs` + `dist/*.d.cts` for every entry; `main` is `dist/index.cjs`.
- **Removed legacy build artefacts**: the `module` field, `dist/index.esm.js`, `dist/index.mjs`, `dist/*.d.mts`, the per-file `dist/types/*` declarations, and `use-scroll-animate/dist/*` deep imports (only the documented entry points resolve). `dist/index.umd.js` and `dist/element.umd.js` keep their CDN URLs.
- **ES2020 output** (was ES2018): optional chaining / nullish coalescing are no longer down-levelled. Every browser that has `Animation.commitStyles()` (Chrome 84, Firefox 75, Safari 13.1), which the library already relied on, supports ES2020. Together with the removed re-exports: UMD 7.55 → 6.99 kB gz, core-only import 5.63 → 5.40 kB gz.
- `engines.node >= 18` declared (only relevant for SSR imports).

### Added
- **Native scroll-driven engine** (1.6): new `engine: 'auto' | 'js' | 'css'` option (`defaultEngine` config, `data-sa-engine` attribute). With `'auto'`/`'css'`, browsers that support `animation-timeline: view()` run the preset on a native `ViewTimeline` (scroll-linked, off the main thread); others fall back to the JS engine (default `'auto'`, see Breaking changes). New `viewRange` option (`data-sa-view-range`) and `supportsScrollTimeline()` helper.
- **Svelte actions** (1.7): `use-scroll-animate/svelte` exports `scrollAnimate` and `scrollStagger` (`use:` actions with `update`/`destroy`; no `svelte` import).
- **Solid primitives** (1.7): `use-scroll-animate/solid` exports the `scrollAnimate` / `scrollStagger` directives (typed via `JSX.Directives`) and `useScrollAnimate()` ref primitive. `solid-js` is an optional peer dependency.
- **`<scroll-animate>` Web Component** (1.7): `use-scroll-animate/element` exports `defineScrollAnimate(tagName?, instance?)`; attributes mirror `data-sa-*`, and it dispatches `sa:enter`/`sa:leave`/`sa:start`/`sa:complete`/`sa:progress` events. `dist/element.umd.js` registers it on load for CDN use.
- **Subpath exports** (1.7): `./react`, `./vue`, `./svelte`, `./solid`, `./element` (ESM + CJS, each with types). Entries share code through `dist/chunks/`, so importing several never duplicates the core. Optional peer dependencies: `solid-js`, `svelte`.
- **Exit animations** (1.8): `exit: true | preset | presets | { from, to }` (`data-sa-exit`, `exit` attribute on `<scroll-animate>`) plays the entrance (or the given animation) in reverse when the element leaves the viewport and replays the entrance on re-entry; implies `repeat` unless set. Scroll-linked over the `exit` range with the native engine; class swap in class-name mode; skipped under reduced motion.
- **`parallax(target, { speed, axis, progressVar, root, respectReducedMotion })`** (1.8): standalone parallax helper on the scroll-progress scale used by `progressVar`. Writes the progress to `--sa-parallax` and the offset to the individual `translate` property (composes with `transform`/entrance animations); no offset under reduced motion; listens only while targets are visible; returns a stop function. < 1 kB gzipped when tree-shaken.
- **Size budgets** (1.6): `size-budget.json` defines a gzip budget per entry (UMD bundle and tree-shaken imports); `npm run size:check` fails when one is exceeded and runs in CI.
- **Docs** (1.9): `docs/API.md` (full API reference), `docs/migration-from-aos.md`, `docs/migration-from-gsap-scrolltrigger.md`, `docs/deprecations.md` (now "Upgrading to 2.0"), and `demo/index.html` — a no-build preset playground (every preset clickable, scroll-triggered cards, parallax) that loads the UMD bundle.

### Changed
- The default instance export is annotated `/* @__PURE__ */`, so bundlers drop the core when only standalone helpers such as `parallax` are imported (1.8).
- Size budgets for the UMD bundle and "import everything" raised from 7.5 to 8 kB gzip for exit + parallax (1.8).
- Build (1.7): ESM/CJS entries are small files that import shared chunks from `dist/chunks/`; the UMD bundles stay single files.
- Build uses Rollup's ESM config (`rollup.config.mjs`); `@rollup/plugin-commonjs` dropped (no CommonJS inputs). `npm run build` cleans `dist/` first.

### Fixed
- Class-name mode: `destroy()` now clears pending completion timers, so `onComplete` no longer fires after the instance was destroyed. Other instances' timers are unaffected.

### Repository
- Dependabot (npm + GitHub Actions, weekly, grouped), issue templates (bug report, feature request) and a pull-request template.

### MIGRATION from 1.x

1. **React / Vue imports**
   ```diff
   - import { createReactHooks } from 'use-scroll-animate';
   + import { createReactHooks } from 'use-scroll-animate/react';
   - import { createVueComposables } from 'use-scroll-animate';
   + import { createVueComposables } from 'use-scroll-animate/vue';
   ```
   (1.9 already logged a dev-only warning for these.)
2. **Engine**: if you rely on time-based entrances (`duration`/`delay` set globally via `defaultDuration`/`defaultDelay`, `onComplete` timing, `threshold`-based triggering), keep 1.x behaviour with
   ```js
   ScrollAnimate.configure({ defaultEngine: 'js' });      // default instance
   createScrollAnimate({ defaultEngine: 'js' });          // own instances
   ```
   or per element `engine: 'js'` / `data-sa-engine="js"`. Elements that set `duration`, `delay`, `offset` or `stagger` themselves already stay on JS.
3. **Deep imports**: replace `use-scroll-animate/dist/index.js`, `dist/index.mjs`, `dist/index.esm.js` or `dist/types/...` with `use-scroll-animate` (or a subpath entry). Type-only imports come from the package name: `import type { AnimateOptions } from 'use-scroll-animate'`.
4. **CommonJS** consumers: `require('use-scroll-animate')` keeps working (now `dist/index.cjs`). If you referenced `dist/index.js` as CommonJS by path, it is ESM now.
5. **`<script>` / CDN**: no change — `https://unpkg.com/use-scroll-animate/dist/index.umd.js` (global `ScrollAnimate`) and `dist/element.umd.js`.
6. **Old browsers**: if you must support browsers without ES2020 (pre-2020 Safari/Chrome), transpile `use-scroll-animate` in your bundler, or stay on 1.x.

## [1.5.0] - 2026-10-07

### Added
- `watch(root?)` instance method: automatically observes `[data-sa]` elements added to the DOM later; returns a stop function, and `destroy()` stops all watchers.
- `progressVar` option and `data-sa-progress-var` attribute: expose scroll progress (0–1) as a CSS custom property.

### Fixed
- Stopping `staggerChildren` or cancelling a triggered `sequence()` before the content entered the viewport left it at `opacity: 0`; it is now restored (also affects React/Vue `useScrollStagger` unmounting off-screen).

### Tests / CI
- 47 new tests covering reduced motion, SSR, unmount cleanup and lifecycle; CI job timeout and `npm pack --dry-run`.

## [1.4.0] - 2026-10-06

### Added

- **True scroll progress** (`progressMode: 'scroll'`, `data-sa-progress="scroll"`, opt-in): `onProgress` and parallax receive 0→1 as the element travels through the viewport (top enters at the bottom → bottom leaves at the top), including elements taller than the screen. Uses one shared, passive, rAF-throttled scroll listener that is only attached while tracked elements are on screen. New helper `getScrollProgress(el, root?)`.
- **`staggerChildren(container, options, instance?)`** for vanilla JS, and **`observeChildren: true`** for it and `useScrollStagger`: a `MutationObserver` animates children added later. Children added before the reveal join the stagger; children added after it animate when they enter the viewport, staggered per batch.
- **Vue `useScrollStagger`** composable (`{ staggerRef }`).
- **`sequence(steps, options)`** timeline helper: chain animations across targets with `gap` (negative = overlap), `at` (absolute start), per-step `stagger`, optional `trigger` element to auto-play once; `play()` returns a Promise, plus `cancel()` and `duration()`.
- **New presets**: `scale-up`, `blur-in-up`, `flip-up`, `flip-down`, `rotate-left`, `rotate-right`, `clip-up`, `clip-down`, `clip-left`, `clip-right`, `clip-circle`.
- **`autoUnregister`** config (default `true`): finished `once` elements that don't need parallax/`onProgress` are removed from the registry right after they animate, freeing memory. They are tracked in a `WeakSet`, so `init()`/`observe()`/`refresh()` never re-hide or replay them; `unobserve()` forgets them.
- **`exports` map**: `import` → `dist/index.mjs` + `dist/index.d.mts`, `require` → `dist/index.js` + `dist/index.d.ts` (bundled declarations). `main`, `module`, `unpkg`, `types` (old `dist/types/*` still shipped) and `dist/*` deep imports are kept for backward compatibility. Added `"type": "commonjs"`.
- **GitHub Actions CI** (Node 20/22/24): typecheck, test, build, exports smoke test, publint + are-the-types-wrong, bundle size summary.
- Scripts: `check:exports`, `lint:package`, `size`.

### Fixed

- Presets that don't animate `opacity` (`slide-*`, `scale-x`, `scale-y`, `pulse`, `swing`, and custom `{ from, to }` without opacity) stayed invisible after `observe()`, because the `opacity: 0` applied while waiting to enter was never cleared.

### Changed

- `getObservedElements()` no longer lists finished `once` elements (see `autoUnregister`; set it to `false` for the previous behaviour).
- `useScrollStagger` (React) now delegates to `staggerChildren`; behaviour without `observeChildren` is unchanged.

### Fixed (audit, #1)

- **Parallax never worked after the entrance animation**: the `fill: 'both'` animation kept overriding the inline `transform`, and with the default `once: true` the progress observer was disconnected on first entry. Finished animations now commit their end state and are cancelled; the progress observer stays active.
- **`repeat` did not re-hide elements** (the old filling animation kept them visible) and stacked a new `Animation` on every entry. Running animations are now tracked, cancelled and replaced.
- **SSR**: `init()` / `observe()` threw `ReferenceError: document is not defined` on the server. All entry points are now no-ops without a DOM.
- **No IntersectionObserver**: elements were hidden and then `observe()` threw, leaving content invisible. Content is now shown immediately.
- **Reduced motion** was ignored by the React/Vue integrations and by parallax. Elements are no longer hidden and no motion is applied when `prefers-reduced-motion: reduce` is set (callbacks still fire).
- **`offset`** discarded the right/left sides of `rootMargin` and produced an invalid margin (`--20px`, which throws) for negative offsets.
- **`threshold` arrays** (including `data-sa-threshold="0,0.5"`) were truncated to the first value.
- **Custom easing functions** only interpolated `translateY`; every other transform (scale, rotate, translateX, combined presets) jumped at 50%. Uses CSS `linear()` where supported, and generic value interpolation otherwise.
- **`stagger`** delays grew with every registered sibling, so items scrolled into view later waited seconds. Stagger is now relative to the batch of siblings revealed together.
- **`refresh()`** re-hid and replayed elements that had already animated.
- **`unobserve()` / `destroy()`** left never-animated elements permanently invisible.
- **Detached elements** were kept in the registry forever (memory leak in SPAs); they are now pruned.
- **`useClassNames`** never applied `hiddenClass` on observe (only after a `repeat` leave).
- **React hooks** used stale callbacks from the first render and ignored `once`, `offset` and easing functions; Vue composable likewise. Both now delegate to the core engine.
- Malformed `data-sa-easing` JSON or invalid easing strings no longer throw; numeric `data-sa-parallax-x/y` values are treated as px; NaN numeric attributes are ignored.
- Vanilla example used TypeScript syntax and a non-existent `ScrollAnimate.createScrollAnimate`.

### Changed (audit, #1)

- **Performance**: IntersectionObservers are shared between elements with the same root/threshold/rootMargin instead of one (or two, with a 101-step threshold list) per element.
- Removed the `browser` field from `package.json` (it made webpack resolve the minified UMD build instead of the ESM build); added `unpkg`, `jsdelivr`, `files`, `sideEffects`, repository metadata, and real `test`/`typecheck` scripts.
- `ParallaxOptions` is now exported from the package entry.
- Preset end keyframes use explicit units (`translateY(0px)`, `rotateX(0deg)`); visually identical.
- `tsconfig` uses `moduleResolution: "bundler"` (TypeScript 6 rejects `node`/`node10`).
- Added a Vitest + jsdom test suite (25 tests).
- README: accurate size, full option/attribute table, instance API, UMD, React & Vue usage.

## [1.3.0] - 2025-03-25

### Added

- **Custom Easing Curves**: Support for passing a `cubic-bezier` array (e.g., `[0.34, 1.56, 0.64, 1]`) to the `easing` option.
- **Easing Functions**: Support for passing a custom JavaScript function `(t: number) => number` to the `easing` option for complete control over animation timing.
- **New Physics Presets**: Added `soft-spring` and `heavy-bounce` easing presets.
- **HTML Data Attribute Support**: Added support for parsing JSON-style arrays in `data-sa-easing` (e.g., `data-sa-easing="[0.1, 0.7, 1.0, 0.1]"`).

### Changed

- Updated `EasingType` to include `number[]` and `(t: number) => number`.
- Refactored `runAnimation` to handle custom easing functions by generating intermediate keyframes.
- Enhanced `resolveEasing` to handle array-based cubic-bezier definitions.

## [1.2.0] - 2025-03-25

### Added

- **Once Control**: New `once` option to automatically stop observing an element after its animation has triggered, saving system resources.
- **Viewport Offset**: New `offset` option to specify how many pixels an element must enter the viewport before the animation starts.
- **New Animation Presets**: Added `shimmer`, `pulse`, and `swing`.
- **Multi-language Documentation**: Added Chinese (`README_zh.md`) and Japanese (`README_ja.md`) documentation.
- **Fallback Support**: Added a fallback mechanism for browsers that do not support the Web Animations API.

### Fixed

- **Memory Leak**: Improved `IntersectionObserver` cleanup by using `disconnect()` instead of `unobserve()` in key areas.
- **Stagger Bug**: Fixed an issue where `stagger` animation indices were incorrectly calculated when DOM elements were added dynamically.
- **Type Safety**: Improved TypeScript definitions for better developer experience.

## [1.1.0] - 2025-03-25

### Added

- **Multiple Animations**: Support for applying multiple animation presets simultaneously (e.g., `["fade-in-up", "zoom-in"]`).
- **Parallax Effect**: New `parallax` option for creating scroll-driven parallax effects (`x`, `y`, `rotate`, `scale`, `speed`).
- **Scroll Progress Listener**: New `onProgress` callback that provides real-time scroll progress (0 to 1) for an element.
- **New Animation Presets**: Added `skew-in`, `scale-x`, `scale-y`.
- **Threshold Array Support**: `threshold` option now accepts an array of numbers for more granular progress tracking.

## [1.0.0] - 2025-03-25

### Added

- Initial release of `use-scroll-animate`.
- 16 built-in animation presets.
- Core `ScrollAnimate` singleton.
- HTML `data-sa` attribute API.
- React and Vue 3 integrations.
- Zero dependencies.
- ~2.9KB gzipped UMD bundle.
