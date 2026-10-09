# Upgrading to 8.0

8.0 is the next major release. 7.9 **warns once in the console** for everything that 8.0 removes, and a codemod rewrites it:

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
| `defineRating()` | `defineStarRating()` from `motionary/components/widgets` | ⚠️ manual |

`document.createElement('usa-rating')` and CSS selectors on `usa-rating` / `.usa-rating-star` are reported for a manual edit.

## Coming in 8.0

- **Unified timeline engine** — every component, effect and scroll animation is driven by one shared clock, so they can be paused, slowed down, scrubbed and sequenced together.
- **SSR hydration animations** — server-rendered markup animates in on hydration without a flash of the final state.
- `motionary` and the `use-scroll-animate` alias are both published with the npm `latest` tag.

Nothing else changes: the 5.0 browser baseline, the `<usa-player>` JSON format (`use-scroll-animate/animation` v1) and every other 7.x widget / effect API stay the same.

## New in 7.9 (before the break)

- `<usa-command-palette>` (⌘K) and `<usa-shortcut>` keyboard hints; `<usa-star-rating>` is form-associated (`name`) and fires a native `change`.

See the [CHANGELOG](../CHANGELOG.md) for the full list.
