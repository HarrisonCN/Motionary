# Accessibility (`use-scroll-animate/components`)

Audited in v2.9 (automated sweep in `test/components-a11y-frameworks.test.ts` + per-component tests).

## Motion
- Every `<usa-*>` element honours **`prefers-reduced-motion: reduce`**: entrances fade or appear, loops/particles/cursors stop, springs jump to their target, page transitions update instantly. Override per app with `configureComponents({ reducedMotion: 'reduce' | 'no-preference' | 'user' })`.
- **Global motion intensity** (v2.7): `setMotionIntensity('off' | 'low' | 'normal' | 'high', persist)` or let users choose with `<usa-motion-switch>`. `off` behaves exactly like reduced motion; `low` shortens every animation to 60 %.
- No component flashes more than 3×/s; glitch and grain effects are disabled under reduced motion.

## Keyboard
| Component | Keys |
|---|---|
| `<usa-toggle>`, `<usa-checkbox>`, `<usa-like>` | Space / Enter |
| `<usa-hold>` | hold Space / Enter |
| `<usa-slider>` | ←/→/↑/↓, PageUp/PageDown, Home/End |
| `<usa-rating>` | ←/→, number keys, Home/End |
| `<usa-tabs>` | ←/→/↑/↓, Home/End (roving tabindex) |
| `<usa-draggable>` | arrows (by `step` / `snap`), Home / Esc resets |
| `<usa-card-stack>` | ← / → swipe |
| `<usa-carousel-3d>` | ← / → |
| `<usa-fullpage>` | PageUp/PageDown, ↑/↓, Space, Home/End |
| `<usa-card effect="flip" trigger="click">`, `effect="expand"` | Enter / Space; Esc collapses |
| `<usa-drawer>`, `<usa-bottom-sheet>`, `<usa-popover>`, `<usa-fab>`, `<usa-tooltip>`, `<usa-dialog>` | Esc closes, focus returns to the trigger |
| `<usa-double-tap>` | `L` |

## Roles & states
`switch` (toggle), `checkbox` (+ `aria-checked="mixed"`), `slider` (slider, rating; `aria-valuenow/-text`), `tablist`/`tab`/`tabpanel`, `dialog` + `aria-modal` (drawer, sheet, dialog, popover), `button` + `aria-pressed` (like, click-flip card, icon-morph toggle) / `aria-expanded` (fab, popover, expand card), `progressbar` (progress, loading bar, scroll progress), `status` live regions (toasts, submit button, pull-to-refresh, badge), `radiogroup` (motion switch), `aria-busy` while loading (submit, pull-refresh, auto-skeleton, splash).

Animated text (`<usa-split-text>`, `<usa-typewriter>`, `<usa-wave-text>`, `<usa-handwriting>`, `<usa-scroll-highlight>` …) renders an `aria-hidden` animated copy plus a visually hidden plain copy. Decorative layers (`<usa-cursor>`, `<usa-ambient>`, particles, sheens, goo) are `aria-hidden` and never take pointer events.

## Transparency & contrast
Glass, acrylic and Fluent materials fall back to solid surfaces under `prefers-reduced-transparency: reduce` and `forced-colors: active`.
