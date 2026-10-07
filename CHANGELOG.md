# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Native scroll-driven engine** (1.6): new `engine: 'auto' | 'js' | 'css'` option (`defaultEngine` config, `data-sa-engine` attribute). With `'auto'`/`'css'`, browsers that support `animation-timeline: view()` run the preset on a native `ViewTimeline` (scroll-linked, off the main thread); others fall back to the JS engine. Default stays `'js'` in 1.x. New `viewRange` option (`data-sa-view-range`) and `supportsScrollTimeline()` helper.
- **Svelte actions** (1.7): `use-scroll-animate/svelte` exports `scrollAnimate` and `scrollStagger` (`use:` actions with `update`/`destroy`; no `svelte` import).
- **Solid primitives** (1.7): `use-scroll-animate/solid` exports the `scrollAnimate` / `scrollStagger` directives (typed via `JSX.Directives`) and `useScrollAnimate()` ref primitive. `solid-js` is an optional peer dependency.
- **`<scroll-animate>` Web Component** (1.7): `use-scroll-animate/element` exports `defineScrollAnimate(tagName?, instance?)`; attributes mirror `data-sa-*`, and it dispatches `sa:enter`/`sa:leave`/`sa:start`/`sa:complete`/`sa:progress` events. `dist/element.umd.js` registers it on load for CDN use.
- **Subpath exports** (1.7): `./react`, `./vue`, `./svelte`, `./solid`, `./element` (ESM + CJS, each with types). Entries share code through `dist/chunks/`, so importing several never duplicates the core. Optional peer dependencies: `solid-js`, `svelte`.
- **Exit animations** (1.8): `exit: true | preset | presets | { from, to }` (`data-sa-exit`, `exit` attribute on `<scroll-animate>`) plays the entrance (or the given animation) in reverse when the element leaves the viewport and replays the entrance on re-entry; implies `repeat` unless set. Scroll-linked over the `exit` range with the native engine; class swap in class-name mode; skipped under reduced motion.
- **`parallax(target, { speed, axis, progressVar, root, respectReducedMotion })`** (1.8): standalone parallax helper on the scroll-progress scale used by `progressVar`. Writes the progress to `--sa-parallax` and the offset to the individual `translate` property (composes with `transform`/entrance animations); no offset under reduced motion; listens only while targets are visible; returns a stop function. < 1 kB gzipped when tree-shaken.
- **Size budgets** (1.6): `size-budget.json` defines a gzip budget per entry (UMD bundle and tree-shaken imports); `npm run size:check` fails when one is exceeded and runs in CI.

- **Docs** (1.9): `docs/API.md` (full API reference), `docs/migration-from-aos.md`, `docs/migration-from-gsap-scrolltrigger.md`, `docs/deprecations.md`, and `demo/index.html` — a no-build preset playground (every preset clickable, scroll-triggered cards, parallax) that loads the UMD bundle.

### Deprecated
- Importing `createReactHooks` / `createVueComposables` from the main entry (1.9): use `use-scroll-animate/react` / `use-scroll-animate/vue`. Logs one `console.warn` per API in development builds only (`process.env.NODE_ENV !== 'production'`); removed in 2.0.
- The `module` field / `dist/index.esm.js`, the per-file `dist/types/*` declarations and `use-scroll-animate/dist/*` deep imports (1.9, packaging only, no warning possible): removed in 2.0, see `docs/deprecations.md`.

### Changed
- The default instance export is annotated `/* @__PURE__ */`, so bundlers drop the core when only standalone helpers such as `parallax` are imported (1.8).
- Size budgets for the UMD bundle and "import everything" raised from 7.5 to 8 kB gzip for exit + parallax (1.8).
- Build (1.7): `dist/index.mjs` / `dist/index.js` are now small entry files that import shared chunks from `dist/chunks/` (public import paths are unchanged; `dist/index.esm.js` and `dist/index.umd.js` stay single files).

### Fixed
- Class-name mode: `destroy()` now clears pending completion timers, so `onComplete` no longer fires after the instance was destroyed. Other instances' timers are unaffected.

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
