# Animated components (`motionary/components`)

Since **v2.2** (now **v3**) the package ships **30 animated UI components** as standard Web Components (`<usa-*>` custom elements) plus three transition helpers. They are built only on Custom Elements, CSS and the Web Animations API, so the same code runs:

- in any modern browser (Chrome, Edge, Firefox, Safari), and with React, Vue, Svelte, Solid, Angular or no framework;
- in **Windows desktop software** that renders its UI with a web view — Electron, Tauri (WebView2), WinUI 3 / WPF / WinForms with WebView2, and installed PWAs. See **[Windows apps guide](./windows-apps.md)**.

Live gallery: <https://harrisoncn.github.io/Motionary/showcase/components.html>

## Principles

- **Zero dependencies, tree-shakable.** Import one category (`motionary/components/text`) or one component (`import { defineTypewriter } …`) and only that ships.
- **SSR-safe.** Importing never touches `window`/`document`; every `define*()` is a no-op on the server.
- **Opt-in registration.** Nothing is registered until you call `define*()` (or load the IIFE bundle). Every `define*()` accepts a custom tag name: `defineSpinner('my-loader')`.
- **`prefers-reduced-motion` everywhere.** Each component has a calm variant (instant reveal, fade instead of slide, static background…). Override globally with `configureComponents({ reducedMotion: 'reduce' | 'no-preference' | 'user' })`.
- **GPU-friendly.** Animations use `transform` / `opacity` (plus `filter` for blur effects); layout is read and written in separate phases, at most once per frame, and loops pause when off-screen or the tab is hidden.
- **Accessible.** Animated text keeps a visually-hidden plain copy for screen readers; switches, progress bars, toasts and dialogs carry the right roles and ARIA states.
- **Styles included.** Each component injects its own small stylesheet once (as a constructable stylesheet, which a `style-src 'self'` CSP allows). Prefer a file? `import 'motionary/components.css'` (or `/components/<category>.css`) and call `configureComponents({ injectStyles: false })`.

## Install & register

```bash
npm i motionary
```

```js
// everything
import { defineComponents } from 'motionary/components';
defineComponents();                       // or defineComponents(['text', 'feedback'])

// one category
import { defineTextComponents } from 'motionary/components/text';
defineTextComponents();

// one component
import { defineTypewriter } from 'motionary/components/text';
defineTypewriter();
```

No build step (registers every `<usa-*>` and exposes the API as `window.UsaComponents`):

```html
<script src="https://unpkg.com/motionary@6/dist/components.umd.js"></script>
<usa-typewriter words="Hello, Windows.|Hello, web."></usa-typewriter>
<script>UsaComponents.toast('Ready', { type: 'success' });</script>
```

| Entry | Contents |
|---|---|
| `motionary/components` | everything + `defineComponents()`, `COMPONENT_CATEGORIES`, `configureComponents()` |
| `motionary/components/reveal` · `/text` · `/interaction` · `/feedback` · `/background` · `/transitions` | one category + `define<Category>Components()` |
| `motionary/components.css`, `/components/<category>.css` | the same styles as files |
| `dist/components.umd.js` | IIFE/UMD bundle for `<script>` tags, auto-registers |

## Components by category

All attributes are optional unless noted. Events are `CustomEvent`s that bubble, named `usa:*`.

### 1. Entrance & scroll — `components/reveal`

| Element | What it does | Key attributes | JS API / events |
|---|---|---|---|
| `<usa-reveal>` | Reveals content when it enters the viewport | `effect` (`fade`, `fade-up`*, `fade-down`, `fade-left`, `fade-right`, `zoom-in`, `zoom-out`, `blur`, `blur-up`, `flip-up`, `flip-left`, `rise`, or since 6.1 any registered scroll preset name such as `bounce-in-up` / `clip-diamond` once `motionary` or `motionary/presets/extended` is loaded — see [presets.md](./presets.md)), `duration` (700), `delay`, `distance` (32), `easing`, `threshold` (0.15), `root-margin`, `repeat` | `reveal()`, `reset()`, `revealed`; `usa:enter`, `usa:leave`, `usa:complete` |
| `<usa-stagger>` | Reveals its children one after another | `effect`, `interval` (70 ms), `duration`, `delay`, `distance`, `threshold`, `repeat` | `reveal()`, `reset()`; `usa:enter`, `usa:complete` |
| `<usa-scroll-progress>` | Reading-progress bar for the page or one article | `target` (selector), `position` (`top`*, `bottom`, `inline`), `label`; CSS `--usa-progress-color/-height/-track` | `progress`, `update()`; `usa:progress` (`detail.progress`); `--usa-progress` on the element |
| `<usa-scrolly>` | Sticky scrollytelling: `[data-sticky]` stays pinned while `[data-step]` children scroll by | `offset` (trigger line, 0.5) | `active`, `steps`; `usa:step` (`detail.index/step/name`); `data-step-name` + `--usa-step` on the host, `data-active` on the step |

### 2. Text — `components/text`

| Element | What it does | Key attributes | JS API / events |
|---|---|---|---|
| `<usa-typewriter>` | Types text, or cycles phrases (type → pause → delete) | `text` or `words` (`a\|b\|c`), `speed` (55), `delete-speed` (30), `pause` (1400), `delay`, `loop`, `cursor="false"`, `start` (`view`*, `load`, `manual`) | `start()`, `stop()`, `restart()`; `usa:complete` |
| `<usa-split-text>` | Splits into characters or words and cascades them in | `by` (`chars`*, `words`), `effect` (`rise`*, `fade`, `blur`, `flip`, `pop`), `stagger`, `duration` (620), `delay`, `trigger` (`view`*, `load`, `manual`), `repeat` | `play()`, `reset()`, `units`; `usa:complete` |
| `<usa-scramble>` | Decodes text out of random glyphs | `text`, `duration` (900), `chars`, `trigger` (`view`*, `hover`, `load`, `manual`) | `play()`; `usa:complete` |
| `<usa-counter>` | Counts to a number when visible (locale-formatted, tabular digits) | `to` (required), `from`, `duration` (1600), `decimals`, `locale`, `prefix`, `suffix`, `grouping="false"`, `start` | `value` (set to animate), `play(to?)`, `format(n)`; `usa:complete` |
| `<usa-shimmer-text>` | Light sweep across gradient text (CSS only) | `duration` (2600), `color`, `shine`, `angle` | — |
| `<usa-text-rotate>` | Cycles words in place without reflow | `words`, `interval` (2200), `effect` (`slide`*, `fade`, `flip`, `blur`), `paused` | `next()`, `index`; `usa:change` |

### 3. Interaction — `components/interaction`

| Element | What it does | Key attributes | JS API / events |
|---|---|---|---|
| `<usa-ripple>` | Ink ripple from the pointer (centre for Space/Enter) | `color`, `opacity` (0.22), `duration` (550), `centered`, `disabled`, `block` | `ripple(x?, y?)` |
| `<usa-magnetic>` | Content leans toward a nearby pointer and springs back | `strength` (0.35), `radius` (60), `disabled` | — (fine pointers only) |
| `<usa-tilt>` | 3D tilt toward the pointer, optional glare | `max` (10°), `scale` (1.03), `perspective` (900), `glare`, `reverse`, `disabled` | `--usa-tilt-x/-y` (−1…1) for inner parallax |
| `<usa-spotlight>` | Windows Fluent **Reveal highlight**: light follows the pointer across a group, lighting borders | `size` (160), `color`, `border` (1), `no-fill`; items = children or `[data-spotlight]` | — |
| `<usa-press>` | Press feedback: dip + spring back, or `bounce` | `scale` (0.95), `bounce`, `disabled`, `block` | `pressed` |
| `<usa-toggle>` | Windows 11-style switch, form-associated | `checked`, `disabled`, `name`, `value`, `label` | `checked`, `toggle(force?)`; `change`, `usa:change` |

### 4. Loading & feedback — `components/feedback`

| Element | What it does | Key attributes | JS API / events |
|---|---|---|---|
| `<usa-spinner>` | Indeterminate indicators | `kind` (`fluent`* = WinUI ProgressRing, `windows` = Windows 10 orbiting dots, `ring`, `dots`, `pulse`, `bars`), `size` (32), `label`, `paused` | `kind` |
| `<usa-skeleton>` | Shimmer placeholders; content fades in when loading ends | `loading`, `lines` (3), `avatar`, `circle`, `width`, `height`, `radius` | `loading`; `usa:loaded` |
| `<usa-progress>` | Linear progress; Fluent indeterminate animation without a value | `value`, `max` (100), `indeterminate`, `state` (`paused`, `error`), `label` | `value`, `max`, `ratio`; `usa:complete` |
| `<usa-toaster>` + `toast()` | Notifications that slide in, pause on hover, stack with FLIP | `position` (`bottom-right`*, `bottom-left`, `bottom-center`, `top-*`), `max` (4), `label` | `toast(msg, { type, duration, action, dismissible })` → `{ element, close() }`; `show()`, `clear()` |
| `<usa-check>` | Animated success / error / warning icon | `kind` (`success`*, `error`, `warning`), `size` (56), `start`, `label` | `play()`, `reset()`; `usa:complete` |

### 5. Background & decoration — `components/background`

| Element | What it does | Key attributes | JS API / events |
|---|---|---|---|
| `<usa-aurora>` | Drifting aurora / gradient mesh behind content | `colors` (comma list), `speed` (1), `intensity` (0.7), `paused` | — (pauses off-screen) |
| `<usa-particles>` | Canvas constellation that avoids the pointer | `count` (60), `color`, `size`, `speed`, `links` (110, `0` = off), `interactive`, `paused` | `reset()` |
| `<usa-grain>` | SVG-noise film-grain overlay | `opacity` (0.12), `animated`, `blend`, `scale` | — |
| `<usa-marquee>` | Seamless infinite ticker | `speed` (50 px/s), `direction` (`left`*, `right`, `up`, `down`), `gap`, `pause-on-hover`, `fade`, `paused` | `pause()`, `resume()` |
| `<usa-acrylic>` | Fluent **Acrylic** / **Mica** materials | `kind` (`acrylic`*, `mica`), `tint`, `tint-opacity`, `blur`, `shimmer` (`hover`, `load`) | — (solid under `prefers-reduced-transparency` / forced colours) |

### 6. Transitions — `components/transitions`

| Element / helper | What it does | Key attributes / options | JS API / events |
|---|---|---|---|
| `<usa-dialog>` | Animated modal / drawer / sheet on the native `<dialog>` (focus trap, Esc, top layer); content is slotted, so frameworks keep owning it | `open`, `kind` (`modal`*, `drawer-start`, `drawer-end`, `drawer-bottom`, `sheet`), `label`, `no-backdrop-close`, `no-esc`; `[data-close]` children close it; `::part(panel/backdrop)`, `--usa-dialog-*` | `show()`, `close(value?)`, `open`, `returnValue`; `usa:open`, `usa:beforeclose` (cancelable), `usa:close` |
| `<usa-accordion>` | Smooth height animation for native `<details>` | `multiple`, `duration` (300) | `toggleItem(details, open?)`, `items`; `usa:toggle` |
| `<usa-view-switch>` | One view at a time with direction-aware transitions | `active` (name or index), `effect` (`slide`*, `fade`, `scale`, `drill`), `duration` | `show(view)`, `active`, `views`; `usa:change` |
| `viewTransition(update, opts?)` | Runs a DOM update inside `document.startViewTransition()`, cross-fade fallback | `{ fallback, duration, types }` | `Promise<void>` |
| `flip(targets, mutate, opts?)` | FLIP-animates any layout change | `{ duration, easing, animateEnter }` | `Promise<void>` |

### 7. Spring & physics — `components/physics`

| Element / API | What it does | Key attributes / options | JS API / events |
|---|---|---|---|
| `<usa-spring>` | Spring entrances (`bounce-in`, `pop`, `drop`) and attention effects (`jelly`, `rubber-band`) | `effect`, `trigger` (`view` · `hover` · `click` · `manual`), `preset` or `stiffness` / `damping` / `mass`, `delay`, `duration` (attention, 900), `repeat`, `block` | `play()`, `reset()`; `usa:complete` |
| `<usa-draggable>` | Drag with pointer or arrow keys, physics on release | `axis` (`both` · `x` · `y`), `spring-back`, `inertia`, `snap` (`80` grid or `0,120,240` points), `bounds="parent"`, `preset` (`wobbly`), `step` (16), `disabled` | `x`, `y`, `dragging`, `moveTo(x, y, animate?)`, `reset()`; `usa:drag-start`, `usa:drag`, `usa:drag-end`, `usa:settle`; `--usa-drag-x/-y` |
| `<usa-overscroll>` | Elastic scroll container (rubber-band edges) | `axis` (`y` · `x`), `max` (120), `preset`, `disabled` | `offset`; `--usa-overscroll` |
| `spring(el, keyframes, preset?, options?)` | WAAPI animation with spring timing | preset name or `{ stiffness, damping, mass, velocity }` | returns `Animation` (or `null` under reduced motion) |
| `springEasing(preset?)` | `{ easing: 'linear(…)', duration }` for CSS / WAAPI | — | cubic-bezier fallback without `linear()` |
| `createSpring({ value, spring, onUpdate, onRest })` | Interruptible spring value for gestures | — | `set(target, velocity?)`, `jump(v)`, `stop()`, `configure()` |
| `projectInertia(v, velocity)` · `snapTo(v, grid \| points)` · `rubberBand(d, dim)` | Inertia, snapping and resistance math | — | pure functions |

Presets (`SPRING_PRESETS`): `default` (170/26), `gentle` (120/14), `wobbly` (180/12), `stiff` (210/20), `bouncy` (300/10), `slow` (280/60), `molasses` (280/120) — stiffness/damping, mass 1.

### 8. Card effects — `components/cards`

| Element | What it does | Key attributes | JS API / events |
|---|---|---|---|
| `<usa-card>` | Combinable card effects: `flip`, `holo`, `glass`, `border-glow`, `conic-border`, `lift`, `spotlight`, `sheen`, `parallax-layers`, `expand` | `effect` (space-separated), `trigger` (`hover` · `click`, flip), `axis` (`y` · `x`), `depth` (16), `color`, `flipped`, `disabled`; children `[data-front]` / `[data-back]` / `[data-detail]` / `[data-depth]` / `[data-close]` | `flip(force?)`, `expand()`, `collapse()`, `flipped`, `expanded`; `usa:flip`, `usa:expand`, `usa:collapse`; `--usa-card-x/-y/-nx/-ny`, `--usa-card-radius`, `--usa-card-bg`, `--usa-card-glow` |
| `<usa-card-stack>` | Swipeable deck, cards fan out behind the top one | `threshold` (90), `visible` (3), `offset` (10), `loop`, `disabled` | `top`, `swipe('left' \| 'right')`; `usa:swipe`, `usa:empty` |
| `<usa-sticky-stack>` | Cards stack while scrolling; covered ones shrink & dim | `top` (80), `gap` (16), `scale` (0.06) | `update()` |
| `<usa-carousel-3d>` | 3D ring carousel with spring rotation | `radius` (auto), `perspective` (1200), `autoplay` (ms), `index` | `index`, `next()`, `prev()`, `goTo(i)`; `usa:change` |

### 9. Click & tap — `components/click`

| Element / API | What it does | Key attributes | JS API / events |
|---|---|---|---|
| `<usa-button>` | **Button click deformation**: `squash`, `wobble`, `gooey`, `dent` (combinable); shape morph; submit morph | `deform`, `shape` (`pill` · `circle` · `icon`), `morph="submit"`, `state` (`idle` · `loading` · `success` · `error`), `reset` (1800 ms), `haptic`, `disabled`; children `[data-label]`, `[data-icon]` | `target`, `shape`, `state`, `morphTo(shape)`; `usa:submit` (`detail.done(ok)`), `usa:state`; `--usa-dent-x/-y` |
| `<usa-icon-morph>` | Spring icon morphs (play/pause, menu/close, plus/minus, check, arrow-right) | `icons` (`play,pause`), `index`, `size` (24), `toggle`, `labels`, `preset` | `next()`, `show(name \| i)`, `icon`; `usa:change` |
| `<usa-click>` | `ripple`, `burst`, `confetti`, `squish`, `press-spring`, `shake` (combinable) | `effect`, `color` (comma list), `shape`, `count`, `trigger="click"` (shake), `haptic`, `disabled` | `play(x?, y?)`, `shake()`; `usa:click-effect` |
| `<usa-like>` | Heart toggle with pop + burst | `liked`, `count`, `label`, `color`, `size`, `haptic` | `liked`, `count`, `toggle()`; `change`, `usa:change` |
| `<usa-hold>` | Hold-to-confirm ring | `duration` (1200), `label`, `color`, `haptic` | `progress`, `cancel()`; `usa:progress`, `usa:confirm`, `usa:cancel`; `--usa-hold` |
| `<usa-double-tap>` | Double tap → heart at the point | `icon` (♥), `color`, `delay` (300), `haptic` | `pop(x?, y?)`; `usa:double-tap` |
| `<usa-checkbox>` | Animated form-associated checkbox | `checked`, `indeterminate`, `name`, `value`, `label`, `shape` (`circle`) | `checked`, `toggle()`; `change`, `usa:change` |
| `haptic()` · `playEffect(el, 'burst' \| 'confetti' \| 'shake', …)` | Haptics; the click effects from code go through the effect registry (6.0 removed `burst()` / `confetti()` / `shake()`) | — | particles skip under reduced motion |

### 10. UI components & variants — `components/ui`

**Style variants.** `variant="minimal | neon | glass | brutalist | fluent | material"` works on every `<usa-*>` element (or `data-usa-variant` on an ancestor, or `setVariant('fluent')` page-wide). Variants only set design tokens — `--usa-accent`, `--usa-accent-text`, `--usa-surface`, `--usa-text`, `--usa-radius`, `--usa-border`, `--usa-shadow`, `--usa-blur`, `--usa-font` — which you can also set yourself. (`<usa-spinner>`, `<usa-check>`, `<usa-dialog>` and `<usa-acrylic>` pick their kind with `kind`; since 3.0 `variant` is only a style variant everywhere.)

| Element | What it does | Key attributes | JS API / events |
|---|---|---|---|
| `<usa-tabs>` | Tabs with a sliding spring indicator (`[data-tab]` + `[data-panel]`) | `selected`, `indicator` (`line` · `pill`) | `selected`, `select(i)`; `usa:change` |
| `<usa-drawer>` | Side panel, swipe to close | `open`, `side` (`left` · `right` · `top` · `bottom`), `label`; `[data-close]` | `open`, `show()`, `close()`; `usa:open`, `usa:close` |
| `<usa-bottom-sheet>` | Draggable sheet with snap points | `open`, `snap` (`0.5,0.92`), `start`, `label`; `[data-handle]` | `usa:open`, `usa:close`, `usa:snap` |
| `<usa-pull-refresh>` | Pull-to-refresh scroller | `threshold` (70), `label`, `disabled` | `refresh()`, `refreshing`; `usa:refresh` (`detail.done()`), `onrefresh` |
| `<usa-fab>` | FAB speed dial (first child = main button) | `open`, `direction` (`up` · `down` · `left` · `right` · `radial`), `position`, `gap` (56) | `open`, `toggle()`; `usa:toggle` |
| `<usa-navbar>` | Auto-hiding app bar | `threshold` (64), `shrink`, `target` | `show()`, `hiddenByScroll`; `usa:hide`, `usa:show` |
| `<usa-slider>` | Range slider (form-associated) | `value`, `min`, `max`, `step`, `name`, `label`, `bubble`, `disabled` | `value`; `input`/`change`, `usa:input`/`usa:change`; `--usa-slider` |
| `<usa-rating>` | Star rating | `value`, `max` (5), `icon`, `readonly`, `label`, `name` | `value`; `change`, `usa:change` |
| `<usa-tooltip>` | Tooltip on hover / focus | `text`, `placement` (`top`), `delay` (300) | `show()`, `hide()` |
| `<usa-popover>` | Click-to-open panel (`[data-popover]`) | `open`, `placement` (`bottom`) | `open`, `toggle()`; `usa:open`, `usa:close` |
| `<usa-badge>` | Count / dot badge | `value`, `max` (99), `dot`, `pulse`, `show-zero`, `label` | `value` |
| `<usa-avatar-stack>` | Overlapping avatars | `max` (5), `size` (36), `overlap` (0.35), `label` | — |
| `setVariant(v)` · `VARIANTS` · `adoptVariants()` | Page-wide variant / token sheet | — | — |

### 11. Page & app-wide — `components/page`

| Element / API | What it does | Key attributes / options | JS API / events |
|---|---|---|---|
| `pageTransition(update, opts)` | SPA page transition (View Transitions) | `effect` (`fade` · `slide` · `slide-left` · `slide-right` · `slide-up` · `circle` · `blinds` · `pixel` · `zoom`), `x`, `y`, `duration`, `fallback` | Promise |
| `enableMpaTransitions(effect)` | Cross-document (MPA) transitions | effect, duration | — |
| `themeTransition(apply, { x, y })` | Circle-reveal theme switch | — | Promise |
| `<usa-cursor>` | Custom cursor | `mode` (`dot` · `magnetic` · `glow`; 6.0 removed `trail` → `comet-trail` effect), `color`, `size`, `hide-native`, `targets` | `active` |
| `smoothScroll(opts)` · `scrollToTarget(to, opts)` | Wheel smoothing · spring scroll-to | `target`, `lerp` (0.12), `wheelMultiplier` · `offset`, `preset` | returns stop fn · Promise |
| `<usa-fullpage>` | Full-screen snapping sections | `dots`, `axis` (`y` · `x`) | `index`, `go(i)`, `next()`, `prev()`; `usa:section` |
| `<usa-loading-bar>` · `loadingBar` | Top loading bar | `color`, `height` (3), `position` | `start()`, `set(p)`, `done()`, `track(promise)` |
| `<usa-back-to-top>` | Back-to-top with progress ring | `offset` (300), `label`, `focus-target`, `position` | `visible` |
| `<usa-ambient>` | Page-wide ambient layer | `effect` (`particles` · `snow` · `stars` · `noise` · `gradient`), `density`, `color`, `opacity`, `layer`, `speed` | — |
| `<usa-splash>` | Splash / launch screen | `min` (600), `exit` (`fade` · `scale` · `slide-up` · `circle`), `manual`, `label` | `done()`; `usa:done` |
| `<usa-auto-skeleton>` | Automatic skeletons | `loading`; `data-no-skeleton` on children | `loading` |
| `<usa-motion-switch>` · `setMotionIntensity()` | Global motion intensity | `labels`, `label` · `'off' \| 'low' \| 'normal' \| 'high'`, `persist` | `usa:change`; `--usa-motion`, `data-usa-motion` |

### v2.8 additions to Text, Background & Windows

| Element / API | Category | What it does | Key attributes |
|---|---|---|---|
| `<usa-wave-text>` | text | Letters bob in a wave | `amplitude` (0.25em), `speed` (1.6s), `stagger` (0.06s) |
| `<usa-glitch>` | text | RGB-split glitch | `trigger` (`always` · `hover`), `intensity` (3px) |
| `<usa-gradient-text>` | text | Flowing gradient fill | `colors`, `speed` (6s), `angle` (90) |
| `<usa-handwriting>` | text | Stroke-by-stroke draw, then fill | `text`, `duration` (2400), `size` (64), `font`, `stroke`; `play()`, `usa:complete` |
| `<usa-scroll-highlight>` | text | Words light up while reading / marker sweep | `mode` (`words` · `marker`), `dim` (0.2), `color`; `progress` |
| `<usa-grid-glow>` | background | Grid lit around the pointer | `size` (32), `radius` (220), `color` |
| `<usa-blobs>` | background | Fluid morphing blobs | `colors`, `speed` (1), `blur` (60) |
| `<usa-water-ripple>` | background | Interactive water ripples (canvas) | `damping` (0.96), `strength` (1), `color` (`r,g,b`); `drop(x, y, s?)` |
| `<usa-dot-network>` | background | Dot grid linking to the pointer (canvas) | `gap` (28), `radius` (140), `color` (`r,g,b`) |
| `fluentPreset(opts)` | background | Windows 11 Fluent: variant + Mica tint + Acrylic + Reveal highlight | `reveal`, `mica`, `selector`, `root`; returns undo |

WinUI 3 / WebView2 sample app: [`examples/webview2-winui/`](../examples/webview2-winui/).

## Theme tokens

Every component reads these CSS custom properties (set them on `:root`, any ancestor, or via `variant` / `setVariant()`):

| Token | Used for |
|---|---|
| `--usa-accent` / `--usa-accent-text` | primary colour (toggles, sliders, tabs indicator, checkbox, progress, focus rings) / text on it |
| `--usa-surface` / `--usa-text` | panels (drawer, sheet, popover, tooltip, back-to-top) |
| `--usa-radius`, `--usa-border`, `--usa-shadow`, `--usa-blur`, `--usa-font` | shape, outline, elevation, glass blur, typography |
| `--usa-motion` | global motion intensity (0 · 0.6 · 1 · 1.25), set by `setMotionIntensity()` |

## Framework entry points (v2.9)

| Import | What |
|---|---|
| `motionary/components/react` | `createUsaComponents(React)` typed wrappers (props, ref, `onUsa*` events) |
| `motionary/components/vue` | `isUsaElement`, `UsaPlugin` |
| `motionary/components/jsx` | `UsaIntrinsicElements` JSX types |
| `motionary/components/lazy` | `lazyDefine()`, `defineUsed()`, `loadCategory()` |

See [frameworks-ssr.md](./frameworks-ssr.md) and [accessibility.md](./accessibility.md).

### v3.1 Timeline & choreography (`components/timeline`)

| Element / API | What it does | Key options |
|---|---|---|
| `timeline(opts)` | One playhead for many animations | `.to(target, frames \| preset, { at, duration, easing, stagger })`, `.label()`, `.call()`, `play()`, `reverse()`, `seek()`, `progress()`, `scrub(el, { smooth })` |
| `<usa-timeline>` | `data-tl` children become steps | `trigger` (`view` · `click` · `manual`), `scrub`, `overlap`, `duration`, `stagger`, `repeat`; child `data-at`, `data-duration`, `data-label` |

Positions: `'>'` chain (default) · `'<'` with previous · `'-=200'` overlap · `'+=100'` gap · `'<+=50'` · `'label+=100'` · ms.

### v3.2 Gestures (`components/gesture`)

| Element / API | What it does | Key options |
|---|---|---|
| `gesture(el, handlers, opts)` | Pan · swipe · pinch · long-press · tap · double-tap | `onPan({ dx, dy, vx, vy, first, last })`, `onSwipe({ direction, velocity })`, `onPinch({ scale })`, `onLongPress`, `onTap`, `onDoubleTap`; `axis`, `threshold`, `swipeDistance`, `swipeVelocity`, `longPress`, `wheelPinch` |
| `<usa-swipeable>` | Swipe to dismiss, spring home | `axis`, `distance` (120), `preset`, `dismiss`; `usa:swipe`, `usa:dismiss`; `swipe(dir)`, `reset()` |
| `<usa-pinch-zoom>` | Pinch / Ctrl+wheel zoom + pan | `min` (1), `max` (4), `double-tap` (2), `preset`; `zoomTo(k)`, `usa:zoom` |

### v3.3 SVG (`components/svg`)

| Element / API | What it does | Key attributes |
|---|---|---|
| `<usa-draw>` | Strokes draw themselves | `trigger` (`view` · `hover` · `click` · `scrub`), `duration` (1600), `stagger` (0.2), `fill`, `repeat`; `progress`, `play()` |
| `<usa-morph>` | Path morph through shapes | `paths="A \| B"`, `trigger` (`click` · `hover` · `view` · `auto`), `interval` (2000), `duration` (600); `next()`, `usa:change` |
| `<usa-mask-reveal>` | Mask / clip-path reveal | `shape` (`circle` · `diamond` · `star` · `iris` · `wipe` · `wipe-up`), `at`, `duration` (900), `trigger`, `repeat` |
| `<usa-anim-icon>` | Animated stroke icons | `name` (`bell` · `heart` · `check` · `arrow` · `star` · `gear` · `search` · `download`), `size`, `label`, `trigger` (`hover` · `click` · `view` · `loop`) |
| `morphTo(path, d, opts)` · `interpolatePath(a, b, t)` · `drawLines(root)` | Path helpers | `duration`, `easing`; `stagger` |

### v3.4 Canvas & WebGL (`components/webgl`)

| Element / API | What it does | Key attributes |
|---|---|---|
| `<usa-shader>` | GPU shader background | `preset` (`gradient` · `plasma` · `waves` · `aurora`), `speed` (1); custom `<script type="x-shader/x-fragment">` |
| `<usa-distort>` | Hover distortion + RGB split on the `<img>` inside | — (fallback: CSS zoom) |
| `<usa-liquid>` | Click ripples + hover wobble on the `<img>` inside | `strength` (1) |
| `glQuad(canvas, frag)` · `supportsWebGL()` | Single-quad WebGL runner | `render({ time, mouse, hover, ripples })`, `resize()`, `texture(img)`, `dispose()` |

Fallbacks set `data-fallback` (`webgl` · `image` · `no-image`); cross-origin images need CORS headers.

### v3.5 3D & depth (`components/depth`)

| Element / API | What it does | Key attributes |
|---|---|---|
| `<usa-cube>` | CSS 3D cube, children = faces | `size` (200), `autoplay` (ms), `perspective` (900); `show(face)`, `next()`, `prev()`, `usa:change` |
| `<usa-depth>` | Depth parallax for `data-depth` layers | `source` (`pointer` · `orientation` · `scroll`), `strength` (40), `rotate` (0); `requestPermission()` |
| `deviceTilt(cb, opts)` · `requestOrientationPermission()` | Gyroscope tilt -1…1 | `range` (30°), `smooth` (0.2) |

3D ring carousel: `<usa-carousel-3d>` (cards).

### v3.6 Layout animation (`components/layout`)

| Element / API | What it does | Key options |
|---|---|---|
| `<usa-auto-animate>` · `autoAnimate(el)` | Add / remove / move / resize of children animates | `duration` (300), `no-scale` / `scale`; `enable()`, `disable()`, `stop()` |
| `<usa-masonry>` | Masonry grid with animated reflow | `columns` or `min` (220), `gap` (16); `layout()` |
| `sharedTransition(update, root?)` | Shared-element transition via `data-shared="id"` | `duration` (450), `easing`; View Transitions API or FLIP |

Also see `flip()` in `components/transitions`. (4.0 removed `<usa-flip-list>` and `connectedAnimation()` in favour of these.)

### v3.7 Visual playground

[`showcase/playground.html`](../showcase/playground.html) — stack `<usa-*>` effects around sample content, tweak every attribute live, and export HTML / ES module / React / Vue code or a share link (state in the URL hash).

### v3.8 Svelte, Solid & Angular

| Entry | API |
|---|---|
| `components/svelte` | `use:usa={{ props, on }}`, `defineUsa()` |
| `components/solid` | `use:usa` directive, `defineUsa()`, JSX types (`prop:` / `on:usa:*` natively) |
| `components/angular` | `usaInitializer()` (`APP_INITIALIZER`), `defineUsa()`, `usaDetail()`; `CUSTOM_ELEMENTS_SCHEMA` |

Hybrid / desktop hosts (MAUI, Flutter WebView, Electron, Tauri): [hybrid-apps.md](./hybrid-apps.md).

### v3.9 Effect packs (`components/packs`)

| Pack | `data-role` → effect |
|---|---|
| `ecommerce` | `product` reveal + lift · `add-to-cart` press + fly to `cart` · `cart` bump · `price` count up · `badge` pulse |
| `portfolio` | `project` reveal + lift · `heading` reveal · `stat` count up · `contact` press + pulse |
| `dashboard` | `card` reveal · `stat` count up · `alert` pulse · `action` press |
| `game` | `button` press · `score` count up + bump · `item` float · `hit` shake · `reward` pulse |
| `landing` | `hero` reveal · `feature` reveal + lift · `cta` press + pulse · `logo` float · `stat` count up |

`<usa-pack>` (e.g. `<usa-pack name="ecommerce">…</usa-pack>`) or `applyPack('ecommerce', root)`; helpers `flyToCart(from, to)`, `countUp(el)`.

**Deprecated in 3.9, removed in 4.0.0:** `sequence()`, `connectedAnimation()`, `<usa-flip-list>` — see [upgrading-4.md](./upgrading-4.md).

### v4.8 GPU particles, post-processing & adaptive quality (`components/webgl`)

- **Particle presets** for `<usa-shader preset="…">`: `snow`, `fireflies`, `stars` (warp starfield), `bokeh`, `rain` — procedural in the fragment shader, no buffers or per-particle JS.
- **`<usa-post-fx>`** (`definePostFx()`), e.g. `<usa-post-fx effects="vignette grain" intensity="0.6"><img …></usa-post-fx>` — chained passes `vignette` · `grain` · `chromatic` · `scanlines` · `crt` · `bloom` · `pixelate` · `duotone` · `glitch`; `postFxShader(list)` builds the same shader for your own `glQuad()`.
- **Unified fallback** — without WebGL every preset shows a still CSS rendering (`GL_FALLBACKS`, `glFallbackCss()`); post-fx images get an approximate CSS filter.
- **Adaptive quality** — every GL element measures its frame rate: after two slow seconds (< 40 fps) the drawing buffer drops to 50 % then 35 % resolution and climbs back after five good seconds; on battery saver (Battery Status API ≤ 20 % and not charging, or Save-Data) it renders at ≤ 30 fps and ≤ 60 % resolution. `quality="high"` opts out; `data-quality` shows the current scale. `glGovernor()` / `watchPowerSaver()` for your own loops; `glQuad().render({ extra })` sets any float uniform, `resize(scale)` scales the buffer.

### v5.0 Effects — unified plugin API (`components/fx`)

`<usa-fx>` (`defineFx()`, `defineFxComponents()`) plays any registered effect on its first child: `<usa-fx effect="jelly" trigger="click"><button>Go</button></usa-fx>` — `trigger` `click` · `hover` · `enter` · `load` · `loop` · `manual`, `options` (JSON), `once`, `self`.

```js
import { registerEffect, playEffect, bindEffect, listEffects } from 'motionary/components/fx';
registerEffect({ name: 'spin-pop', kind: 'attention', run: (el, o, ctx) => ctx.animate(el, frames, { duration: 700 }) });
await playEffect(el, 'spin-pop');
const unbind = bindEffect(card, 'fade-up', { trigger: 'enter' });
```

Built-ins (`BUILTIN_EFFECTS`): every timeline preset as an `enter` effect (`fade-up`, `clip-up`, `blur`…), attention seekers `pulse` · `pop` · `jelly` · `wiggle` · `heartbeat` · `bounce` · `flash` · `tada` · `shake`, click effects `burst` · `confetti` · `ripple`. `ctx.animate()` applies reduced motion, motion sensitivity, intensity and the animation budget; `loop` / `background` / `cursor` effects are skipped under reduced motion unless they declare `reduced: 'run'`.

### v5.1 Card & click effects 2.0 (`components/effects`)

The 5.x effect packs live in `motionary/components/effects` (not in `components` / `components/lite`). Register them once, then use any name with `<usa-fx>`, `playEffect()` or `bindEffect()`:

```js
import { registerAllEffects } from 'motionary/components/effects';
registerAllEffects();
```
```html
<usa-fx effect="holo" trigger="load"><article class="card">…</article></usa-fx>
<usa-fx effect="shockwave"><button>Boom</button></usa-fx>
```

Card: `holo` · `glare-sweep` · `book-open` · `card-fan` · `topple` · `float-tilt`. Click: `shockwave` · `ink-splash` · `star-burst` · `jelly-press` · `ring-ripple` · `emoji-rain`. Reduced motion: particles skipped, presses fade, loops don’t start.

### v5.2 Bounce & physics (`components/effects`)

`bounce-in` · `rubber-band` · `elastic-hover` · `drop-bounce` · `gravity-text` · `spring-follow` · `bell-swing` — keyframes come from a damped-spring / gravity solver and play on WAAPI.

```js
import { registerAllEffects, solveSpring, springKeyframes } from 'motionary/components/effects';
registerAllEffects();
const { frames, duration } = springKeyframes((p) => ({ transform: `scale(${p})` }), { stiffness: 220, damping: 11 });
el.animate(frames, { duration });
```
```html
<usa-fx effect="drop-bounce" trigger="enter" options='{"height":160,"bounce":0.6}'><img src="badge.svg" alt="New"></usa-fx>
<usa-fx effect="elastic-hover" trigger="load"><article class="card">…</article></usa-fx>
```

### v5.3 Page-wide effects (`components/effects`)

Transitions `curtain` · `iris` · `pixel-dissolve` · `blinds` cover the viewport, await `onCovered()`, then reveal:

```js
import { registerAllEffects } from 'motionary/components/effects';
import { playEffect } from 'motionary/components/fx';
registerAllEffects();
link.addEventListener('click', (e) => {
  e.preventDefault();
  playEffect(link, 'iris', { onCovered: () => router.go(link.href), color: '#111' });
});
```

Persistent: `<usa-fx effect="velocity-skew" trigger="load">`, `spotlight` (`radius`, `dim`), `edge-glow` (`color`, `size`). Reduced motion: transitions cross-fade (150 ms), persistent effects are off.

### v5.4 Scroll stories — `<usa-story>` (`components/effects`)

```js
import { defineStory } from 'motionary/components/effects';
defineStory();
```
```html
<usa-story template="pin">
  <figure data-stage>…</figure>
  <section data-step>Chapter 1</section>
  <section data-step>Chapter 2</section>
</usa-story>
<usa-story template="gallery"><div data-sticky><div data-track>…cards…</div></div></usa-story>
<usa-story template="compare" label="Before / after"><div data-sticky><img data-before …><img data-after …></div></usa-story>
<usa-story template="counter"><strong data-count="12,480">0</strong></usa-story>
```

Templates `pin` · `gallery` · `zoom` (`zoom="6"`) · `compare` · `counter` · `highlight`. Each sets `--usa-story-progress`, fires `usa-story-step`, and exposes `progress`, `step`, `update()`. Reduced motion: no sliding / zooming, final counter values. Demo: `showcase/story.html`.

### v5.5 Generative backgrounds (`components/effects`)

`flow-field` · `voronoi` · `mesh-gradient` · `starfield` · `metaballs` · `contours` (kind `background`) — Canvas 2D behind the element’s content, rendering only while visible, with adaptive quality; reduced motion draws one static frame.

```html
<usa-fx effect="mesh-gradient" trigger="load" self class="hero" options='{"colors":["#7c5cff","#ff5c8a","#22d3ee"],"speed":0.6}'>
  <h1>Hello</h1>
</usa-fx>
```
```js
import { registerEffect } from 'motionary/components/fx';
import { canvasBackground } from 'motionary/components/effects';
registerEffect({ name: 'pulse-bg', kind: 'background', reduced: 'run',
  run: (el, o, ctx) => canvasBackground(el, ctx, { draw: ({ ctx: g, w, h, t }) => { g.fillStyle = `hsl(${t * 40} 70% 50%)`; g.fillRect(0, 0, w, h); } }, o) });
```

### v5.6 Sound-reactive effects (`components/effects`)

`spectrum-bars` · `pulse-ring` · `wave-ring` (kind `background`) react to a Web Audio analyser; `enableAudio()` must run inside a user gesture. Beat detection plays any registered effect.

```html
<audio id="track" src="song.mp3" controls></audio>
<usa-audio source="#track" label="Play with visuals">
  <usa-fx effect="spectrum-bars" trigger="load" self options='{"mirror":true}'><h2>Now playing</h2></usa-fx>
  <div data-usa-beat="pop">♪</div>
</usa-audio>
```
```js
import { enableAudio, bindBeat, registerAllEffects } from 'motionary/components/effects';
registerAllEffects();
button.addEventListener('click', async () => {
  await enableAudio('mic');            // or an <audio>/<video> element, selector or MediaStream
  bindBeat(logo, 'pop', { threshold: 1.4, cooldown: 300 });
});
```
Reduced motion: visuals skipped, beats trigger nothing; audio keeps playing.

### v5.7 Cursor & gesture packs (`components/effects`)

Cursor effects (`comet-trail` · `ribbon-trail` · `sparkle-trail` · `magnetic-dots` · `spotlight-cursor`, kind `cursor`) are persistent and scoped to the element; gestures (`fling`, `twist`, `long-press`) fire any registered effect.

```html
<usa-fx effect="comet-trail" trigger="load" self options='{"color":"#22d3ee"}'><section class="hero">…</section></usa-fx>
<usa-gesture-fx gesture="long-press" effect="tada"><button>Hold me</button></usa-gesture-fx>
```
```js
import { bindGesture, registerAllEffects } from 'motionary/components/effects';
registerAllEffects();
bindGesture(card, 'fling', 'confetti', { velocity: 1 });
bindGesture(dial, 'twist', ({ direction }) => step(direction === 'cw' ? 1 : -1));
```
`--usa-charge` (0–1) lets CSS show long-press progress. Reduced motion: cursor effects off.

### v5.8 Theme packs & micro-interactions (`components/effects`)

```html
<usa-theme name="glass">
  <div class="usa-surface">
    <button data-theme-fx="click">Tap</button>
    <usa-fx effect="like-heart" trigger="click"><button aria-pressed="false">♥ <span data-count="12">12</span></button></usa-fx>
    <usa-fx effect="copy-success" trigger="click"><button data-copy="npm i motionary">Copy</button></usa-fx>
  </div>
</usa-theme>
```
```js
import { applyTheme, themeCss, playEffect, registerAllEffects } from 'motionary/components/effects';
registerAllEffects();
const undo = applyTheme('neon');          // whole page: design + motion tokens + data-usa-theme
const css = themeCss('paper', ':root');   // static CSS for SSR
playEffect(passwordToggle, 'password-reveal');
```
Themes: `neon` · `paper` · `glass` · `retro` · `brutalist`. Micro effects keep working (state, labels, counts) under reduced motion.

### v5.9 `<usa-player>`

Plays JSON animations made of timeline presets, keyframes and registered effects on one clock.

```html
<usa-player trigger="view" controls>
  <h1>Title</h1>
  <a class="cta">Start</a>
  <script type="application/json">
  { "format": "use-scroll-animate/animation", "version": 1,
    "tracks": [
      { "target": "h1", "start": 0, "duration": 600, "preset": "fade-up" },
      { "target": ".cta", "start": 400, "duration": 500, "keyframes": [{ "opacity": 0, "transform": "scale(.8)" }, { "opacity": 1, "transform": "none" }] },
      { "target": ".cta", "start": 1000, "effect": "jelly" }
    ] }
  </script>
</usa-player>
```
```js
import { createPlayer, registerAllEffects } from 'motionary/components/effects';
registerAllEffects();
const p = createPlayer(hero, await (await fetch('/hero.json')).json());
p.play(); p.seek(500); p.rate = 0.5;
```
`trigger="scroll"` scrubs the animation with the page. Reduced motion: the final state, no effects. Export JSON from the Playground (`<usa-player> JSON` tab).

### v6.2 Widgets: carousel, tab bar, accordion 2.0, stories (`components/widgets`) + GPU pack (`components/fx-gpu`)

```html
<usa-carousel effect="cards" loop autoplay="4000" label="Featured">
  <img src="a.jpg" alt="…"><img src="b.jpg" alt="…"><img src="c.jpg" alt="…">
</usa-carousel>

<usa-tab-bar indicator="pill">
  <button>Overview</button><button>Specs</button>
  <div data-panel>…</div><div data-panel>…</div>
</usa-tab-bar>

<usa-disclosure variant="cards">
  <details><summary>Shipping</summary><p>…</p></details>
</usa-disclosure>

<usa-stories duration="5000" loop><img src="1.jpg" alt="…"><img src="2.jpg" alt="…"></usa-stories>

<usa-fx effect="fluid" trigger="load" self class="hero"><h1>Hello</h1></usa-fx>
```
```js
import { defineWidgets } from 'motionary/components/widgets';
import { defineFx } from 'motionary/components/fx';
import { registerGpuEffects } from 'motionary/components/fx-gpu';
defineWidgets(); defineFx(); registerGpuEffects();
document.querySelector('usa-carousel').next();
```
No build: `components.umd.js` + `widgets.umd.js`. GPU effects: `fluid` · `smoke` · `fire` · `ink` · `fireflies` (WebGL2 → Canvas 2D) · `sakura` · `leaves` (Canvas 2D) · `splash` (click). Reduced motion: instant switches, no autoplay, one still frame.

### v6.3 Widgets: toast stack, dialog, drawer, menu (`components/widgets`) + text effects 3.0 (`components/fx-text`)

```html
<button data-usa-toast="Saved" data-usa-toast-type="success">Save</button>
<usa-toast-stack position="bottom-right" duration="4000" max="3"></usa-toast-stack>

<button data-usa-open="welcome">Open</button>
<usa-modal id="welcome" effect="origin" label="Welcome">
  <h2>Hello</h2><button data-usa-close="ok">Got it</button>
</usa-modal>

<usa-sheet id="cart" side="bottom" label="Cart">…<button data-usa-close>Close</button></usa-sheet>

<usa-menu placement="bottom-start" effect="scale">
  <button>Actions ▾</button><button>Edit</button><hr><button>Delete</button>
</usa-menu>

<usa-fx effect="flip-chars" trigger="enter"><h1>Motionary</h1></usa-fx>
```
```js
import { defineWidgets, stackToast } from 'motionary/components/widgets';
import { defineFx } from 'motionary/components/fx';
import { registerTextEffects3 } from 'motionary/components/fx-text';
defineWidgets(); defineFx(); registerTextEffects3();
stackToast({ title: 'Done', message: 'Saved', type: 'success', action: { label: 'Undo', onClick: undo } });
document.querySelector('usa-modal').show();
```
- `<usa-toast-stack>`: collapsed stack that fans out on hover / focus, auto-dismiss paused while hovered, swipe to dismiss; `show()`, `dismiss()`, `clear()`, `stackToast()`; `usa:show`, `usa:dismiss`.
- `<usa-modal effect="scale | slide-up | flip | origin">` and `<usa-sheet side="right | left | bottom | top">`: native `<dialog>` (top layer, focus trap, Esc), blurred backdrop, `persistent`, `data-usa-open` / `data-usa-close`, bottom sheet drag-to-dismiss; `show()`, `close(value)`, `toggle()`; `usa:open`, `usa:close`.
- `<usa-menu placement effect="scale | fold | slide">`: ARIA menu, cascade-in items, arrows / Home / End / Esc / Tab; `usa:select`.
- Text effects 3.0: `liquid-text` · `neon-write` · `particle-text` · `glitch-text` · `text-trail` (cursor) · `font-breathe` · `flip-chars`; split text keeps a screen-reader copy. Reduced motion: overlays fade, loops / trail / particles are skipped, one-shots show their final state.

### v6.4 Widgets: progress ring, odometer, skeleton reveal, star rating (`components/widgets`) + light & materials (`components/fx-light`)

```html
<usa-progress-ring value="72" gradient="#7c5cff,#22d3ee"></usa-progress-ring>
<usa-progress-ring variant="semi" value="88"></usa-progress-ring>
<usa-odometer value="1284" locale="en-US" prefix="$"></usa-odometer>
<usa-skeleton-reveal loading variant="wave">
  <img src="avatar.jpg" alt="" data-skeleton="circle"><h3>Ada Lovelace</h3><p>…</p>
</usa-skeleton-reveal>
<usa-star-rating value="3.5" step="0.5" label="Your rating"></usa-star-rating>

<usa-fx effect="light-follow" trigger="load"><div class="card">…</div></usa-fx>
<usa-fx effect="god-rays" trigger="load" self class="hero"><h1>Dawn</h1></usa-fx>
```
```js
import { defineWidgets } from 'motionary/components/widgets';
import { defineFx } from 'motionary/components/fx';
import { registerLightEffects } from 'motionary/components/fx-light';
defineWidgets(); defineFx(); registerLightEffects();
document.querySelector('usa-odometer').value = 2048;      // every digit rolls
document.querySelector('usa-skeleton-reveal').loading = false; // dissolve → content
```
- `<usa-progress-ring variant="ring | bar | semi">`: eased arc with overshoot, counting label, gradient, indeterminate without `value`; `role="progressbar"`, `usa:complete`.
- `<usa-odometer>`: rolling digit wheels (always forward), new digits slide in, `locale` / `decimals` / `prefix` / `suffix`; the formatted number is the accessible name.
- `<usa-skeleton-reveal loading variant="wave | pulse | glow">`: placeholders measured from the real content (text lines via Range rects, images, `[data-skeleton]`), synchronized shimmer, top-to-bottom dissolve; `aria-busy`, `reveal()`, `usa:reveal`.
- `<usa-star-rating max step icon="star | heart" readonly>`: hover preview, half stars, pop + sparkle burst, `role="slider"` keyboard, `usa:change`.
- Light & materials: `light-follow` · `refraction` · `pointer-shadow` (hover) · `brushed-metal` · `pearlescent` (card) · `god-rays` (background). Helper `trackPointer()`. Reduced motion: fixed lighting, one still frame, values switch instantly.

### v6.5 Widgets: milestones, masonry flow, compare, cube gallery (`components/widgets`) + 3D scene cards (`components/fx-3d`)

```html
<usa-milestones>
  <div data-date="2024"><h3>Idea</h3></div><div data-date="2026"><h3>Launch</h3></div>
</usa-milestones>
<usa-masonry-flow min="160" gap="12"><img src="1.jpg" alt="…"><img src="2.jpg" alt="…"></usa-masonry-flow>
<usa-compare labels="Before,After" intro><img src="before.jpg" alt="Before"><img src="after.jpg" alt="After"></usa-compare>
<usa-cube-gallery autoplay="4000"><img src="a.jpg" alt="…"><img src="b.jpg" alt="…"></usa-cube-gallery>

<usa-fx effect="depth-stack" trigger="load"><div class="card"><img data-depth="1" src="bg.png" alt=""><h3 data-depth="3">Title</h3></div></usa-fx>
<usa-fx effect="card-flip-3d"><div class="card"><div>Front</div><div>Back</div></div></usa-fx>
```
```js
import { defineWidgets } from 'motionary/components/widgets';
import { defineFx } from 'motionary/components/fx';
import { register3dEffects } from 'motionary/components/fx-3d';
defineWidgets(); defineFx(); register3dEffects();
document.querySelector('usa-masonry-flow').filter('.cats'); // items glide (FLIP)
```
- `<usa-milestones layout="alternate | left">`: scroll-drawn rail, dots pop and cards slide in when reached; `usa:reach`.
- `<usa-masonry-flow min gap>`: masonry with FLIP layout animation; `layout()`, `filter()`, `shuffle()`, `sort()`; `usa:layout`.
- `<usa-compare orientation labels intro hover>`: before / after slider (`role="slider"`, keyboard), click-to-jump easing; `usa:change`.
- `<usa-cube-gallery axis="y | x" autoplay>`: slides on a turning 3D cube, swipe / keys / buttons; `next()`, `prev()`, `goTo()`; `usa:change`.
- 3D scene cards: `depth-stack` · `product-spin` (card) · `card-flip-3d` (click) · `origami` (enter) · `orbit-camera` (scroll). Reduced motion: no tilt / spin / orbit / fold, flips crossfade, milestones fully shown, cube fades.

### v6.6 Widgets: dock, nav morph, menu toggle, tip (`components/widgets`) + morph & SVG 2.0 (`components/fx-morph`)

```html
<usa-dock magnify="1.9" bounce label="Apps">
  <button data-label="Music" aria-label="Music">🎵</button><a href="/mail" data-label="Mail" aria-label="Mail">✉️</a>
</usa-dock>
<usa-nav-morph indicator="underline"><a href="/" aria-current="page">Home</a><a href="/docs">Docs</a></usa-nav-morph>
<usa-menu-toggle for="site-menu" variant="cross"></usa-menu-toggle><nav id="site-menu" hidden>…</nav>
<usa-tip text="Copied!" placement="top"><button>Copy</button></usa-tip>

<usa-fx effect="path-morph" trigger="loop" options='{"paths":["M…","M…"]}'><svg viewBox="0 0 100 100"><path d="M…"/></svg></usa-fx>
<usa-fx effect="blob-button" trigger="load"><button>Get started</button></usa-fx>
```
```js
import { defineWidgets } from 'motionary/components/widgets';
import { defineFx } from 'motionary/components/fx';
import { registerMorphEffects2 } from 'motionary/components/fx-morph';
defineWidgets(); defineFx(); registerMorphEffects2();
```
- `<usa-dock magnify range bounce orientation>`: cosine magnification, labels from `data-label`, click bounce; `role="toolbar"`.
- `<usa-nav-morph indicator="underline | pill | blob | dot">`: indicator stretches to the hovered / focused link and back to `aria-current="page"`; arrow keys; `usa:change`.
- `<usa-menu-toggle variant="cross | arrow | minus | plus-x" for>`: hamburger morph toggle with `aria-expanded`, controls `hidden` / `show()` / `close()` of its target; `usa:toggle`.
- `<usa-tip text placement trigger="hover | click" delay>`: spring-out tooltip / popover with arrow, viewport flip + shift, Esc, rich `[slot="tip"]` content.
- Morph & SVG 2.0: `path-morph` (loop) · `blob-button` (hover) · `stroke-draw` · `noise-reveal` (enter) · `icon-swap` (click); helpers `samplePath()`, `pointsToPath()`. Reduced motion: no magnification / stretch / morph loops; reveals and swaps fade.

### v6.7 Widgets: stepper, pagination, segmented control, switch (`components/widgets`) + Transitions 2.0 (`components/fx-transitions`)

```html
<usa-stepper value="1"><span>Cart</span><span>Shipping</span><span>Payment</span></usa-stepper>
<usa-pagination total="20" page="1" siblings="1"></usa-pagination>
<usa-segmented variant="ios"><button>Day</button><button>Week</button><button>Month</button></usa-segmented>
<usa-switch variant="daynight" name="dark" label="Dark mode"></usa-switch>

<usa-fx effect="ripple-dissolve" trigger="click" options='{"mode":"in"}'><section>…</section></usa-fx>
```
```js
import { defineWidgets } from 'motionary/components/widgets';
import { registerTransitionEffects2, pageTransition, crossDocumentTransitions } from 'motionary/components/fx-transitions';
defineWidgets(); registerTransitionEffects2();
await pageTransition(() => renderNextView(), 'liquid-wipe');   // SPA: View Transitions API, fallback = update + effect
crossDocumentTransitions('camera-dolly');                       // MPA: @view-transition { navigation: auto }
```
- `<usa-stepper value orientation clickable>`: `next()`, `prev()`, `value`; `usa:change`.
- `<usa-pagination total page siblings>`: `page`; `usa:change` (`{ page }`); `pageWindow(page, total, siblings)`.
- `<usa-segmented variant="ios | pill | outline" value>`: radio group; `usa:change` (`{ value, label }`).
- `<usa-switch variant="ios | daynight | bounce | liquid" checked disabled name value>`: `checked`, `toggle()`; `usa:change`.
- Transitions 2.0 (`mode: "in" | "out"`): `ripple-dissolve` (`x`, `y`, from the pointer on click) · `shatter` (`pieces`) · `mosaic-flip` (`cols`, `rows`) · `liquid-wipe` (`direction`, `waves`) · `page-curl` · `camera-dolly` (`scale`). Reduced motion: short fades.

### v6.8 Widgets: kanban, swipe deck, weather card, pull-cord (`components/widgets`) + weather & ambience (`components/fx-weather`) + physics 2.0 (`components/fx-physics`)

```html
<usa-kanban label="Sprint">
  <section data-title="To do"><h3>To do</h3><div data-card>Design</div></section>
  <section data-title="Done"><h3>Done</h3></section>
</usa-kanban>
<usa-swipe-deck threshold="110"><article>Ada</article><article>Grace</article></usa-swipe-deck>
<usa-weather-card condition="snow" temp="-3" place="Oslo"></usa-weather-card>
<usa-pull-cord label="Desk lamp"></usa-pull-cord>

<usa-fx effect="rain-glass" trigger="load"><header>…</header></usa-fx>
<usa-fx effect="cloth" trigger="load"><div class="banner">…</div></usa-fx>
```
```js
import { defineWidgets } from 'motionary/components/widgets';
import { registerWeatherEffects } from 'motionary/components/fx-weather';
import { registerPhysicsEffects2, VerletWorld } from 'motionary/components/fx-physics';
defineWidgets(); registerWeatherEffects(); registerPhysicsEffects2();
```
- `<usa-kanban>`: columns = children (`data-title` / first heading), cards = `[data-card]` or `<li>`; `move(card, column, index)`; `usa:move` (`{ card, from, to, index }`).
- `<usa-swipe-deck threshold>`: `like()`, `nope()`, `undo()`, `top`; `usa:swipe` (`{ card, dir, index }`), `usa:empty`.
- `<usa-weather-card condition temp unit place label>`: conditions `clear | cloudy | rain | snow | storm | fog | night`.
- `<usa-pull-cord threshold on>`: `on`, `toggle()`; `usa:change` (`{ on }`).
- Weather: `rain-glass` · `snowfall` (`pile`) · `lightning` (`interval` ≥ 2.5, `glow` ≤ 0.22) · `fog` · `aurora-veil` · `day-cycle` (`cycle`, `hour`); `skyAt(hour)`.
- Physics 2.0: `soft-body` (`stiffness`, `damping`) · `magnet` (`strength`, `radius`) · `cloth` · `rope` · `pinball`; `new VerletWorld(gravity, damping, iterations)`.

## Frameworks

Custom elements work in every framework. Register once (e.g. in your entry file), then use the tags.

```jsx
// React 19 passes props to custom elements as properties; React 18 passes strings — both work for attributes.
import { defineFeedbackComponents, toast } from 'motionary/components/feedback';
defineFeedbackComponents();

export function Save() {
  return <button onClick={() => toast('Saved', { type: 'success' })}>Save <usa-spinner kind="dots" size="16" /></button>;
}
```

```js
// Vue (vite.config.js): tell the compiler these are custom elements
vue({ template: { compilerOptions: { isCustomElement: (tag) => tag.startsWith('usa-') } } });
```

TypeScript: the entries augment `HTMLElementTagNameMap`, so `document.querySelector('usa-dialog')` is typed as `UsaDialogElement`.

## Size

Gzipped, minified (budgets enforced in CI by `npm run size:check`):

| Import | gzip |
|---|---:|
| `dist/components.umd.js` (all 30 + CSS) | ≈ 22 kB |
| one category (`components/text`, …) | 3.5 – 6.4 kB |
| one component (`defineTypewriter`, `defineReveal`, `defineRipple`, …) | ≈ 1.8 – 2.5 kB |
| `viewTransition` only | ≈ 0.4 kB |
| `dist/components.css` | ≈ 5.5 kB |

The scroll-animation core (`motionary`) is unchanged and is not pulled in by the components.
