# API reference

`use-scroll-animate` — every public export, option and attribute. See the [README](../README.md) for a tour, the [demo](../demo/index.html) to try every preset, and the migration guides for [AOS](./migration-from-aos.md) and [GSAP ScrollTrigger](./migration-from-gsap-scrolltrigger.md). Upgrading from 1.x: see [Upgrading to 2.0](./deprecations.md).

- [Entry points](#entry-points)
- [Default instance & `createScrollAnimate(config)`](#default-instance--createscrollanimateconfig)
- [Instance methods](#instance-methods)
- [Per-element options (`AnimateOptions`)](#per-element-options-animateoptions)
- [Data attributes](#data-attributes)
- [Global config (`ScrollAnimateConfig`)](#global-config-scrollanimateconfig)
- [Presets & easings](#presets--easings)
- [Helpers: `staggerChildren`, `sequence`, `parallax`, `getScrollProgress`, `supportsScrollTimeline`](#helpers)
- [Framework integrations](#framework-integrations)
- [Behaviour notes](#behaviour-notes)

## Entry points

| Import | Contents |
|---|---|
| `use-scroll-animate` | Default instance, `createScrollAnimate`, `staggerChildren`, `sequence`, `parallax`, `getScrollProgress`, `supportsScrollTimeline`, `PRESETS`, `resolvePreset`, `resolveEasing`, `EASING_MAP`, all types |
| `use-scroll-animate/react` | `createReactHooks(React)` |
| `use-scroll-animate/vue` | `createVueComposables({ ref, onMounted, onUnmounted })` |
| `use-scroll-animate/svelte` | `scrollAnimate`, `scrollStagger` actions |
| `use-scroll-animate/solid` | `scrollAnimate`, `scrollStagger` directives, `useScrollAnimate()` (needs `solid-js`) |
| `use-scroll-animate/element` | `defineScrollAnimate(tagName?, instance?)` for `<scroll-animate>` |
| `dist/index.umd.js` | Global `ScrollAnimate` (`ScrollAnimate.default` is the instance, other exports as properties) |
| `dist/element.umd.js` | Registers `<scroll-animate>` on load; global `ScrollAnimateElement` |
| `use-scroll-animate/components` (+ `/components/reveal`, `/text`, `/interaction`, `/feedback`, `/background`, `/transitions`) | 30 animated `<usa-*>` Web Components, `defineComponents()`, `configureComponents()`, `toast()`, `viewTransition()`, `flip()`, `connectedAnimation()` — see **[components.md](./components.md)** |
| `dist/components.umd.js`, `use-scroll-animate/components.css` | Registers every `<usa-*>` on load (global `UsaComponents`); the component styles as a file |

Every entry is ESM-first (`import` → `.js` + `.d.ts`) with a CommonJS build (`require` → `.cjs` + `.d.cts`), SSR-safe (no DOM access at import), and has zero runtime dependencies.

## Default instance & `createScrollAnimate(config)`

```ts
import ScrollAnimate, { createScrollAnimate } from 'use-scroll-animate';

ScrollAnimate.init();                               // shared default instance
const sa = createScrollAnimate({ defaultDuration: 800, defaultEngine: 'auto' }); // isolated instance
```

`createScrollAnimate(config?: ScrollAnimateConfig): ScrollAnimateInstance`. Instances share no state: each has its own registry, observers, watchers and timers.

## Instance methods

| Method | Description |
|---|---|
| `init(root?: Element \| Document)` | Observe every `[data-sa]` element under `root` (default `document`). Already observed / finished elements are skipped. |
| `watch(root?)` → `() => void` | `init()` and keep observing `[data-sa]` elements added later (MutationObserver); removed elements are released. Returns a stop function. |
| `observe(target, options?)` | Observe a selector, `Element`, `NodeList` or `Element[]`. Elements are hidden until they enter (JS engine). |
| `unobserve(target)` | Stop observing. Elements that never animated are made visible; native scroll-linked animations are cancelled. |
| `animate(target, options?)` | Play the entrance animation now (time-based JS engine), without observing. |
| `refresh()` | Rebuild the observers (e.g. after `configure({ root })`) without replaying finished elements. |
| `configure(config)` | Merge new global config. |
| `getObservedElements()` → `AnimatedElement[]` | Registered elements: `{ element, options, observer, animated, progressObserver?, engine? }`. Finished `once` elements are dropped when `autoUnregister` is on. |
| `destroy()` | Disconnect everything (observers, watchers, scroll listeners, class-name timers), reveal elements that never animated, cancel native animations. |

`target` is always `string | Element | NodeList | Element[]`.

## Per-element options (`AnimateOptions`)

| Option | Type | Default | Description |
|---|---|---|---|
| `animation` | `AnimationPreset \| AnimationPreset[] \| { from, to }` | `'fade-in-up'` | Preset, presets combined (transforms are concatenated), or custom keyframes |
| `duration` | `number` (ms) | `600` | JS engine only (setting it makes `'auto'` pick JS) |
| `delay` | `number` (ms) | `0` | JS engine only (setting it makes `'auto'` pick JS) |
| `easing` | `EasingType` | `'ease'` | CSS easing string, named easing, `[x1, y1, x2, y2]`, or `(t) => number` (sampled into `linear()`) |
| `threshold` | `number \| number[]` | `0.1` | IntersectionObserver threshold(s) |
| `rootMargin` | `string` | `'0px'` | IntersectionObserver root margin |
| `offset` | `number` (px) | `0` | Trigger this many px later (subtracted from the bottom root margin) |
| `once` | `boolean` | `true` | Animate on the first entry only |
| `repeat` | `boolean` | `false` | Re-hide on leave, replay on each entry |
| `exit` | `boolean \| preset \| preset[] \| { from, to }` | `false` | Animate out (in reverse) when leaving; implies `repeat` |
| `stagger` | `number` (ms) | `0` | Extra delay per sibling revealed in the same batch |
| `engine` | `'auto' \| 'js' \| 'css'` | `'auto'` | `'auto'`: native scroll-driven timeline when supported, else JS — and JS when the element sets `duration`/`delay`/`offset`/`stagger`; `'css'`: native whenever supported; `'js'`: always time-based |
| `viewRange` | `[string, string]` | `['entry 0%', 'entry 100%']` | Native engine: view-timeline range of the entrance |
| `progressMode` | `'ratio' \| 'scroll'` | `'ratio'` | `onProgress` source: visible ratio, or true scroll progress (0 = top enters at the bottom, 1 = bottom leaves at the top) |
| `progressVar` | `string` | – | CSS custom property that receives the progress |
| `onEnter` / `onLeave` | `(el) => void` | – | Viewport entry / exit |
| `onStart` / `onComplete` | `(el) => void` | – | Animation start / end (also fired under reduced motion, immediately) |
| `onProgress` | `(el, progress) => void` | – | Progress 0–1 |

## Data attributes

Mark elements with `data-sa` and call `init()` / `watch()`. Every option has an attribute:

`data-sa-animation` (comma-separated to combine), `data-sa-duration`, `data-sa-delay`, `data-sa-easing` (name, CSS string or JSON array), `data-sa-threshold` (comma-separated list allowed), `data-sa-root-margin`, `data-sa-offset`, `data-sa-once`, `data-sa-repeat`, `data-sa-exit` (bare = `true`, or preset name), `data-sa-stagger`, `data-sa-engine`, `data-sa-view-range` (`"entry 0%, cover 40%"`), `data-sa-progress` (`"scroll"`), `data-sa-progress-var` (bare = `--sa-progress`).

Boolean attributes are true when present unless their value is `"false"`.

## Global config (`ScrollAnimateConfig`)

| Key | Default | Description |
|---|---|---|
| `defaultAnimation`, `defaultDuration`, `defaultDelay`, `defaultEasing`, `defaultThreshold`, `defaultRootMargin`, `defaultRepeat`, `defaultOnce`, `defaultOffset` | as per-element defaults | Defaults for options not set per element |
| `defaultEngine` | `'auto'` | Default `engine` (`'js'` = 1.x behaviour) |
| `useClassNames` | `false` | Toggle `hiddenClass`/`visibleClass` instead of Web Animations (animate with your own CSS) |
| `hiddenClass` / `visibleClass` | `'sa-hidden'` / `'sa-visible'` | Class names for class-name mode |
| `disabled` | `false` | Show everything immediately, no motion (callbacks still fire) |
| `root` | `null` | Scroll container for IntersectionObserver / progress |
| `autoUnregister` | `true` | Drop finished `once` elements from the registry (remembered in a `WeakSet`, never replayed) |

## Presets & easings

`PRESETS` (`Record<AnimationPreset, { from, to }>`): `fade-in`, `fade-in-up`, `fade-in-down`, `fade-in-left`, `fade-in-right`, `zoom-in`, `zoom-out`, `scale-up`, `flip-x`, `flip-y`, `flip-up`, `flip-down`, `slide-up`, `slide-down`, `slide-left`, `slide-right`, `bounce`, `rotate-in`, `rotate-left`, `rotate-right`, `blur-in`, `blur-in-up`, `skew-in`, `scale-x`, `scale-y`, `clip-up`, `clip-down`, `clip-left`, `clip-right`, `clip-circle`, `shimmer`, `pulse`, `swing`.

`EASING_MAP`: `linear`, `ease`, `ease-in`, `ease-out`, `ease-in-out`, `spring`, `soft-spring`, `heavy-bounce`. `resolvePreset(animation)` and `resolveEasing(easing)` expose the resolution used internally.

## Helpers

### `staggerChildren(container, options?, instance?)` → `() => void`
Reveal the children of `container` one after another when it enters. `StaggerOptions` = `AnimateOptions` + `stagger` (default `80` ms) + `observeChildren` (MutationObserver for children added later). Stopping before the reveal makes the children visible.

### `sequence(steps, options?)` → `SequenceController`
Timeline across targets. `SequenceStep` = `AnimateOptions` + `target` + `gap` (ms after the previous step; negative overlaps) or `at` (absolute ms). `SequenceOptions` = `AnimateOptions` + `trigger` (play once when it enters) + `instance`. Controller: `play(): Promise<void>`, `cancel()`, `duration()`.

### `parallax(target, options?)` → `() => void`
`{ speed = 0.2, axis = 'y', progressVar = '--sa-parallax', root = null, respectReducedMotion = true }`. Offset `(progress − 0.5) × speed × 100vh` (or `vw`) on the `translate` property; progress (0–1) in the CSS variable. The stop function removes listeners and inline styles.

### `getScrollProgress(el, root?)` → `number`
True scroll progress 0–1 of `el` through the viewport or `root`. `0` without a DOM.

### `supportsScrollTimeline()` → `boolean`
`CSS.supports('animation-timeline: view()')` and `ViewTimeline` available — i.e. whether `engine: 'auto'` will use the native engine.

## Framework integrations

- **React** — `const { useScrollAnimate, useScrollStagger } = createReactHooks(React)`; both return a ref. Callbacks always call the latest render's version.
- **Vue 3** — `createVueComposables({ ref, onMounted, onUnmounted })` → `useScrollAnimate()` (`{ animateRef }`), `useScrollStagger()` (`{ staggerRef }`); component refs (`$el`) are supported.
- **Svelte** — `use:scrollAnimate={options}`, `use:scrollStagger={options}`; `update()` swaps callbacks (and other options before the element animated). Optional `instance`.
- **Solid** — `use:scrollAnimate`, `use:scrollStagger` (typed via `JSX.Directives`), `ref={useScrollAnimate(options)}`.
- **Web Component** — `<scroll-animate animation="…" …>` with the `data-sa-*` attribute names minus the prefix; events `sa:enter`, `sa:leave`, `sa:start`, `sa:complete`, `sa:progress` (`detail.progress`). Attribute changes before the element animated re-apply the options.

## Behaviour notes

- **Reduced motion**: with `prefers-reduced-motion: reduce` (or `disabled: true`) nothing is hidden or moved; callbacks still fire; `progressVar` is still written (it is data); `parallax()` writes only its variable.
- **SSR**: every entry can be imported and called on the server; calls are no-ops without a DOM.
- **No IntersectionObserver**: content is shown immediately.
- **Native engine**: scroll-linked, so `duration`/`delay`/`threshold`/`offset`/`stagger` don't apply; `once` freezes the end state on completion; class-name mode, reduced motion, `animate()`, `sequence()` and `staggerChildren()` always use JS.
- **Native engine by default**: in browsers without `animation-timeline: view()` everything runs on the JS engine.
