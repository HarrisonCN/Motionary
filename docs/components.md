# Animated components (`use-scroll-animate/components`)

Since **v2.2** the package ships **30 animated UI components** as standard Web Components (`<usa-*>` custom elements) plus three transition helpers. They are built only on Custom Elements, CSS and the Web Animations API, so the same code runs:

- in any modern browser (Chrome, Edge, Firefox, Safari), and with React, Vue, Svelte, Solid, Angular or no framework;
- in **Windows desktop software** that renders its UI with a web view — Electron, Tauri (WebView2), WinUI 3 / WPF / WinForms with WebView2, and installed PWAs. See **[Windows apps guide](./windows-apps.md)**.

Live gallery: <https://harrisoncn.github.io/use-scroll-animate/showcase/components.html>

## Principles

- **Zero dependencies, tree-shakable.** Import one category (`use-scroll-animate/components/text`) or one component (`import { defineTypewriter } …`) and only that ships.
- **SSR-safe.** Importing never touches `window`/`document`; every `define*()` is a no-op on the server.
- **Opt-in registration.** Nothing is registered until you call `define*()` (or load the IIFE bundle). Every `define*()` accepts a custom tag name: `defineSpinner('my-loader')`.
- **`prefers-reduced-motion` everywhere.** Each component has a calm variant (instant reveal, fade instead of slide, static background…). Override globally with `configureComponents({ reducedMotion: 'reduce' | 'no-preference' | 'user' })`.
- **GPU-friendly.** Animations use `transform` / `opacity` (plus `filter` for blur effects); layout is read and written in separate phases, at most once per frame, and loops pause when off-screen or the tab is hidden.
- **Accessible.** Animated text keeps a visually-hidden plain copy for screen readers; switches, progress bars, toasts and dialogs carry the right roles and ARIA states.
- **Styles included.** Each component injects its own small stylesheet once (as a constructable stylesheet, which a `style-src 'self'` CSP allows). Prefer a file? `import 'use-scroll-animate/components.css'` (or `/components/<category>.css`) and call `configureComponents({ injectStyles: false })`.

## Install & register

```bash
npm i use-scroll-animate
```

```js
// everything
import { defineComponents } from 'use-scroll-animate/components';
defineComponents();                       // or defineComponents(['text', 'feedback'])

// one category
import { defineTextComponents } from 'use-scroll-animate/components/text';
defineTextComponents();

// one component
import { defineTypewriter } from 'use-scroll-animate/components/text';
defineTypewriter();
```

No build step (registers every `<usa-*>` and exposes the API as `window.UsaComponents`):

```html
<script src="https://unpkg.com/use-scroll-animate@2/dist/components.umd.js"></script>
<usa-typewriter words="Hello, Windows.|Hello, web."></usa-typewriter>
<script>UsaComponents.toast('Ready', { type: 'success' });</script>
```

| Entry | Contents |
|---|---|
| `use-scroll-animate/components` | everything + `defineComponents()`, `COMPONENT_CATEGORIES`, `configureComponents()` |
| `use-scroll-animate/components/reveal` · `/text` · `/interaction` · `/feedback` · `/background` · `/transitions` | one category + `define<Category>Components()` |
| `use-scroll-animate/components.css`, `/components/<category>.css` | the same styles as files |
| `dist/components.umd.js` | IIFE/UMD bundle for `<script>` tags, auto-registers |

## Components by category

All attributes are optional unless noted. Events are `CustomEvent`s that bubble, named `usa:*`.

### 1. Entrance & scroll — `components/reveal`

| Element | What it does | Key attributes | JS API / events |
|---|---|---|---|
| `<usa-reveal>` | Reveals content when it enters the viewport | `effect` (`fade`, `fade-up`*, `fade-down`, `fade-left`, `fade-right`, `zoom-in`, `zoom-out`, `blur`, `blur-up`, `flip-up`, `flip-left`, `rise`), `duration` (700), `delay`, `distance` (32), `easing`, `threshold` (0.15), `root-margin`, `repeat` | `reveal()`, `reset()`, `revealed`; `usa:enter`, `usa:leave`, `usa:complete` |
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
| `<usa-spinner>` | Indeterminate indicators | `variant` (`fluent`* = WinUI ProgressRing, `windows` = Windows 10 orbiting dots, `ring`, `dots`, `pulse`, `bars`), `size` (32), `label`, `paused` | `variant` |
| `<usa-skeleton>` | Shimmer placeholders; content fades in when loading ends | `loading`, `lines` (3), `avatar`, `circle`, `width`, `height`, `radius` | `loading`; `usa:loaded` |
| `<usa-progress>` | Linear progress; Fluent indeterminate animation without a value | `value`, `max` (100), `indeterminate`, `state` (`paused`, `error`), `label` | `value`, `max`, `ratio`; `usa:complete` |
| `<usa-toaster>` + `toast()` | Notifications that slide in, pause on hover, stack with FLIP | `position` (`bottom-right`*, `bottom-left`, `bottom-center`, `top-*`), `max` (4), `label` | `toast(msg, { type, duration, action, dismissible })` → `{ element, close() }`; `show()`, `clear()` |
| `<usa-check>` | Animated success / error / warning icon | `variant` (`success`*, `error`, `warning`), `size` (56), `start`, `label` | `play()`, `reset()`; `usa:complete` |

### 5. Background & decoration — `components/background`

| Element | What it does | Key attributes | JS API / events |
|---|---|---|---|
| `<usa-aurora>` | Drifting aurora / gradient mesh behind content | `colors` (comma list), `speed` (1), `intensity` (0.7), `paused` | — (pauses off-screen) |
| `<usa-particles>` | Canvas constellation that avoids the pointer | `count` (60), `color`, `size`, `speed`, `links` (110, `0` = off), `interactive`, `paused` | `reset()` |
| `<usa-grain>` | SVG-noise film-grain overlay | `opacity` (0.12), `animated`, `blend`, `scale` | — |
| `<usa-marquee>` | Seamless infinite ticker | `speed` (50 px/s), `direction` (`left`*, `right`, `up`, `down`), `gap`, `pause-on-hover`, `fade`, `paused` | `pause()`, `resume()` |
| `<usa-acrylic>` | Fluent **Acrylic** / **Mica** materials | `variant` (`acrylic`*, `mica`), `tint`, `tint-opacity`, `blur`, `shimmer` (`hover`, `load`) | — (solid under `prefers-reduced-transparency` / forced colours) |

### 6. Transitions — `components/transitions`

| Element / helper | What it does | Key attributes / options | JS API / events |
|---|---|---|---|
| `<usa-dialog>` | Animated modal / drawer / sheet on the native `<dialog>` (focus trap, Esc, top layer); content is slotted, so frameworks keep owning it | `open`, `variant` (`modal`*, `drawer-start`, `drawer-end`, `drawer-bottom`, `sheet`), `label`, `no-backdrop-close`, `no-esc`; `[data-close]` children close it; `::part(panel/backdrop)`, `--usa-dialog-*` | `show()`, `close(value?)`, `open`, `returnValue`; `usa:open`, `usa:beforeclose` (cancelable), `usa:close` |
| `<usa-accordion>` | Smooth height animation for native `<details>` | `multiple`, `duration` (300) | `toggleItem(details, open?)`, `items`; `usa:toggle` |
| `<usa-flip-list>` | Children glide to new places on add / remove / reorder (FLIP) | `duration` (420), `easing`, `disabled` | `flip(mutate)` |
| `<usa-view-switch>` | One view at a time with direction-aware transitions | `active` (name or index), `effect` (`slide`*, `fade`, `scale`, `drill`), `duration` | `show(view)`, `active`, `views`; `usa:change` |
| `viewTransition(update, opts?)` | Runs a DOM update inside `document.startViewTransition()`, cross-fade fallback | `{ fallback, duration, types }` | `Promise<void>` |
| `flip(targets, mutate, opts?)` | FLIP-animates any layout change | `{ duration, easing, animateEnter }` | `Promise<void>` |
| `connectedAnimation(from, to, opts?)` | WinUI-style connected / shared-element animation | `{ duration, easing, hideSource }` | `Promise<void>` |

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

## Frameworks

Custom elements work in every framework. Register once (e.g. in your entry file), then use the tags.

```jsx
// React 19 passes props to custom elements as properties; React 18 passes strings — both work for attributes.
import { defineFeedbackComponents, toast } from 'use-scroll-animate/components/feedback';
defineFeedbackComponents();

export function Save() {
  return <button onClick={() => toast('Saved', { type: 'success' })}>Save <usa-spinner variant="dots" size="16" /></button>;
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

The scroll-animation core (`use-scroll-animate`) is unchanged and is not pulled in by the components.
