# Accessibility (`motionary/components`)

Audited in v2.9 (automated sweep in `test/components-a11y-frameworks.test.ts` + per-component tests).

## Motion
- Every `<usa-*>` element honours **`prefers-reduced-motion: reduce`**: entrances fade or appear, loops/particles/cursors stop, springs jump to their target, page transitions update instantly. Override per app with `configureComponents({ reducedMotion: 'reduce' | 'no-preference' | 'user' })`.
- **Global motion intensity** (v2.7): `setMotionIntensity('off' | 'low' | 'normal' | 'high', persist)` or let users choose with `<usa-motion-switch>`. `off` behaves exactly like reduced motion; `low` shortens every animation to 60 %.
- No component flashes more than 3×/s; glitch and grain effects are disabled under reduced motion.

## Keyboard
| Component | Keys |
|---|---|
| `<usa-switch>`, `<usa-checkbox>`, `<usa-like>` | Space / Enter |
| `<usa-hold>` | hold Space / Enter |
| `<usa-slider>` | ←/→/↑/↓, PageUp/PageDown, Home/End |
| `<usa-tabs>` | ←/→/↑/↓, Home/End (roving tabindex) |
| `<usa-draggable>` | arrows (by `step` / `snap`), Home / Esc resets |
| `<usa-card-stack>` | ← / → swipe |
| `<usa-carousel-3d>` | ← / → |
| `<usa-fullpage>` | PageUp/PageDown, ↑/↓, Space, Home/End |
| `<usa-card effect="flip" trigger="click">`, `effect="expand"` | Enter / Space; Esc collapses |
| `<usa-drawer>`, `<usa-bottom-sheet>`, `<usa-popover>`, `<usa-fab>`, `<usa-tip>`, `<usa-dialog>` | Esc closes, focus returns to the trigger |
| `<usa-double-tap>` | `L` |

## Roles & states
`switch` (toggle), `checkbox` (+ `aria-checked="mixed"`), `slider` (slider, star rating; `aria-valuenow/-text`), `tablist`/`tab`/`tabpanel`, `dialog` + `aria-modal` (drawer, sheet, dialog, popover), `button` + `aria-pressed` (like, click-flip card, icon-morph toggle) / `aria-expanded` (fab, popover, expand card), `progressbar` (progress, loading bar, scroll progress), `status` live regions (toasts, submit button, pull-to-refresh, badge), `radiogroup` (motion switch), `aria-busy` while loading (submit, pull-refresh, auto-skeleton, splash).

Animated text (`<usa-split-text>`, `<usa-typewriter>`, `<usa-wave-text>`, `<usa-handwriting>`, `<usa-scroll-highlight>` …) renders an `aria-hidden` animated copy plus a visually hidden plain copy. Decorative layers (`<usa-cursor>`, `<usa-ambient>`, particles, sheens, goo) are `aria-hidden` and never take pointer events.

## Transparency & contrast
Glass, acrylic and Fluent materials fall back to solid surfaces under `prefers-reduced-transparency: reduce` and `forced-colors: active`.

## Motion-sensitivity levels (4.4)

`import { setMotionSensitivity, restoreMotionSensitivity } from 'motionary/components/a11y'`

| Level | What moves | Use for |
|---|---|---|
| `full` (default) | everything | — |
| `gentle` | fades and translations; **no** spins, zooms, skews, 3D or parallax | vestibular disorders, motion sickness |
| `minimal` | fades only (components use their reduced-motion variants) | `prefers-reduced-motion` plus |
| `static` | nothing — every component shows its static alternative; your own CSS animations are stopped too | seizure / attention sensitivity, kiosks, screenshots |

`setMotionSensitivity(level, persist)` sets `data-usa-sensitivity` on `<html>` (style your own CSS with it) and dispatches `usa:sensitivity`; `motionAllowed('rotate')` tells your code what the level permits; `adaptKeyframes(frames)` filters your own WAAPI keyframes the same way the components do.

## Static alternatives

Every category has a defined static rendering (`STATIC_ALTERNATIVES`): content lands on its final, readable state; loops, particles and cursors stop; gestures keep keyboard / button equivalents. `staticAlternative(root)` freezes any subtree (finishes finite animations, cancels endless ones).

## aria-live conventions

- One shared **polite** region (`#usa-live-polite`, `role="status"`) and one **assertive** region (`#usa-live-assertive`, `role="alert"`) — `announce(message, { politeness })`.
- Polite for results of the user's own action (added, copied, saved, loading done); assertive only for blocking errors.
- Identical messages within 500 ms are dropped; the region is cleared before each message so repeats are read.
- Component-owned regions (toasts, submit button, pull-to-refresh, badge) stay `role="status"` / polite.

## Automated regression tests

`test/a11y-regression.test.ts` mounts **every** `<usa-*>` element at every sensitivity level and runs `auditMotionA11y()`: focusable content inside `aria-hidden`, widget roles without a name, sliders without `aria-valuenow`, images without `alt` (errors), assertive regions outside `role="alert"` and endless animations without a motion control (WCAG 2.2.2, warnings). Run the same audit in your app's tests.
