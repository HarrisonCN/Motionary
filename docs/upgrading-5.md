# Upgrading to 5.0

5.0 is the next major. 4.9 already **warns once in the console** for everything below, and a codemod rewrites most of it:

```sh
npx usa-codemod-5 src            # dry run: lists every change
npx usa-codemod-5 --write src    # apply
```

## Removed in 5.0 (deprecated in 4.9)

| 4.x | 5.0 | Codemod |
|---|---|---|
| `configureComponents({ motionIntensity: 'off' })`, `setMotionIntensity('off')` | `motionSensitivity: 'minimal'` / `setMotionSensitivity('minimal')` (4.4) — intensity is `'low' \| 'normal' \| 'high'` | ✅ |
| `configureComponents({ reducedMotion: 'no-preference' })` | removed — the OS "reduce motion" setting is always honoured; `'user'` (default) or `'reduce'` | ✅ (→ `'user'`) |
| `<usa-timeline scrub="js">` | `scrub` — the JS engine is picked automatically where native scroll timelines are missing; `smooth="…"` opts into smoothing | ✅ (→ `scrub smooth="0.1"`) |
| `configureComponents`, `prefersReducedMotion`, `ComponentsConfig`, `UsaElement` re-exported from every category entry (`use-scroll-animate/components/<category>`) | import them from `use-scroll-animate/components` | ✅ |

`<usa-motion-switch>` keeps its **Off** button; in 5.0 it maps to sensitivity `minimal`.

## Modern-browser baseline

5.0 requires **Custom Elements, Web Animations, IntersectionObserver, ResizeObserver and constructable stylesheets** (`adoptedStyleSheets`) — every evergreen browser since 2023 (Chrome / Edge ≥ 111, Safari ≥ 16.4, Firefox ≥ 115, WebView2, Electron ≥ 24). The no-WAAPI / no-IntersectionObserver / `experimental-webgl` code paths are removed. View Transitions and scroll-driven animations stay **progressive** (used when present, JS fallback otherwise).

Check a browser with `baselineReport()` / `warnBaseline()` from `use-scroll-animate/components/a11y` (4.9).

## New in 5.0

- **Unified plugin-style effect registration**: `registerEffect({ name, kind, run })`, `playEffect(el, name, options)`, `<usa-fx effect="…" trigger="…">` — every built-in click / card / hover effect is registered the same way, and so are yours.

See the [CHANGELOG](../CHANGELOG.md) for the full list.
