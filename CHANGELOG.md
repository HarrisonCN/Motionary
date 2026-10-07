# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
