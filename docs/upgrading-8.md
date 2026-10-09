# Upgrading to 8.0

8.0.0 is released. 7.9 **warned once in the console** for everything below, and a codemod rewrites it:

```sh
npx usa-codemod-8 src            # dry run: lists every change (and what needs a manual edit)
npx usa-codemod-8 --write src    # apply
```

## Removed in 8.0 (deprecated in 7.9)

| 7.x | 8.0 | Codemod |
|---|---|---|
| `<usa-rating value max readonly label name>` | `<usa-star-rating …>` (6.4 — pointer-following fill, half stars, sparkle pop; form-associated since 7.9) | ✅ tags |
| `<usa-rating icon="♥">` / `icon="★"` | `<usa-star-rating icon="heart">` / `icon="star"` | ✅ |
| `--usa-rating-on` | `--usa-star-on` | ✅ |
| `<usa-rating variant="…">` | (no variants — style with `--usa-star-on`, `--usa-star-off`, `--usa-star-size`) | ✅ dropped |
| `defineRating()` (`motionary/components/ui`) | `defineStarRating()` from `motionary/components/widgets` | ⚠️ manual |

`document.createElement('usa-rating')` and CSS selectors on `usa-rating` / `.usa-rating-star` are reported for a manual edit.

## New in 8.0

- **Unified timeline engine — `motionary/engine`.** Every component, effect and frame loop now runs on one shared clock: `motionClock.rate = 0.25` slows *everything* Motionary animates on the page, `motionClock.pause()` / `resume()` freezes and resumes it (WAAPI animations and canvas / WebGL loops alike). `createTimeline()` sequences animations on that clock with positions (`1200`, `'+=200'`, `'-=100'`, `'<'`, `'<+=80'`), `play()`, `pause()`, `seek(ms)`, `progress`, `finished`. `<usa-clock-control>` is a ready-made pause / speed bar.
- **SSR hydration animations.** Put `ssrHead()` in the server-rendered `<head>`, mark elements `data-usa-hydrate="fade-up"` (or wrap them in `<usa-hydrate>`) and call `hydrateMotion()` after hydration: they animate in, staggered, without a flash of the final state. Without JS the content is simply visible; if JS never runs, a CSS fallback reveals it after 3 s; reduced motion shows it at once.
- `motionary` and the `use-scroll-animate` alias are both published with the npm `latest` tag.

## Behaviour

- Animations started through the library are now registered with the clock (`getClock().tracked`). With the default rate (1) and not paused, nothing changes. Frame loops receive a `dt` scaled by the clock rate (unchanged at rate 1) and are not called while the clock is paused.
- Nothing else changes: the 5.0 browser baseline, the `<usa-player>` JSON format (`use-scroll-animate/animation` v1) and every other 7.x widget / effect API stay the same.

## New in 7.9 (before the break)

- `<usa-command-palette>` (⌘K) and `<usa-shortcut>` keyboard hints; `<usa-star-rating>` is form-associated (`name`) and fires a native `change`.

See the [CHANGELOG](../CHANGELOG.md) for the full list.
