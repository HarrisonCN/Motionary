# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
- **Playground 2.0** ([showcase/playground.html](https://harrisoncn.github.io/use-scroll-animate/showcase/playground.html)):
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
