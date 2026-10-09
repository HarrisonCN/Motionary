# Upgrading to 9.0

9.0.0 is the next major. 8.9 **warns once in the console** for everything below, and a codemod rewrites it:

```sh
npx usa-codemod-9 src            # dry run: lists every change (and what needs a manual edit)
npx usa-codemod-9 --write src    # apply
```

## Removed in 9.0 (deprecated in 8.9)

8.6 added *surface* themes (`applySurfaceTheme`, `SURFACE_THEMES`, `data-usa-surface`). To keep them apart from the 5.8 *motion* themes, the 5.8 names get a `Motion` prefix:

| 8.x | 9.0 | Codemod |
|---|---|---|
| `applyTheme(name, root?)` | `applyMotionTheme(name, root?)` (same signature, returns the undo) | ✅ |
| `THEMES` / `THEME_NAMES` | `MOTION_THEMES` / `MOTION_THEME_NAMES` | ✅ |
| `<usa-theme name="neon">` | `<usa-motion-theme name="neon">` (same `data-theme-fx` bindings) | ✅ tags |
| `defineTheme()` | `defineMotionTheme()` | ⚠️ manual |

`document.createElement('usa-theme')` and CSS selectors on `usa-theme` are reported for a manual edit. `themeVars`, `themeCss`, `themePreset`, `playThemeEffect`, `THEME_ROLES` and the `data-usa-theme` attribute are unchanged.

## New in 8.9 (before the break)

- **Low-code export.** `exportComponent(el, 'html' | 'react' | 'vue' | 'json')` turns any live, configured component into copy-paste code (runtime parts stripped); `describeComponent(el)` gives the portable JSON. `<usa-code-export>` shows it in tabs with a copy button and follows attribute changes; `<usa-prop-panel for="#el" props="…">` edits a live component's attributes with typed fields.

See the [CHANGELOG](../CHANGELOG.md) for the full list.
