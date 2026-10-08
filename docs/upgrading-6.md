# Upgrading to 6.0

6.0.0 is released. 5.9 **warned once in the console** for everything below, and a codemod rewrites most of it:

```sh
npx usa-codemod-6 src            # dry run: lists every change (and what needs a manual edit)
npx usa-codemod-6 --write src    # apply
```

## Removed in 6.0 (deprecated in 5.9)

6.0 finishes the move to the 5.0 effect registry: every effect is registered once and played the same way (`playEffect()`, `bindEffect()`, `<usa-fx>`). The ad-hoc helpers that bypassed it go away.

| 5.x | 6.0 | Codemod |
|---|---|---|
| `burst(x, y, options)` from `use-scroll-animate/components` / `/components/click` | `playEffect(document.body, 'burst', { x, y, ...options })` from `use-scroll-animate/components/fx` | ✅ |
| `confetti(options)` | `playEffect(document.body, 'confetti', options)` (`x` / `y` in the options, or play it on the element to fire from its centre) | ✅ |
| `shake(el, intensity, duration)` | `playEffect(el, 'shake', { intensity, duration })` | ✅ |
| `UsaComponents.burst / confetti / shake` (UMD global) | `UsaComponents.playEffect(…)` | ✅ |
| `<usa-cursor mode="trail">` | wrap the content: `<usa-fx effect="comet-trail" trigger="load" self>…</usa-fx>` (5.7; scoped, touch-aware, overlay canvas). `mode="dot" \| "magnetic" \| "glow"` stay. | ⚠️ reported, manual |

`haptic()` stays. The registered `burst` effect accepts `x` / `y` since 5.9, so the rewrite keeps the exact origin.

## Behaviour

- Nothing else changes in 6.0: the modern-browser baseline is the 5.0 one, every 5.1–5.9 pack keeps its API, and `<usa-player>` JSON (`format: "use-scroll-animate/animation"`, `version: 1`) stays readable.

## New in 5.9 (before the break)

- `<usa-player>` plays JSON animations (keyframe tracks, timeline presets, registered effects) — exported from the playground's **`<usa-player> JSON`** tab. See [components.md](./components.md#v59-usa-player).

See the [CHANGELOG](../CHANGELOG.md) for the full list.
