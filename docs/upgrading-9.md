# Upgrading to 9.0

9.0.0 is released. 8.9 **warned once in the console** for everything below, and a codemod rewrites it:

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

## New in 9.0

- **Declarative motion DSL — `motionary/dsl`.** Describe motion as one string: `data-motion="enter: fade-up 600ms ease-out stagger 80ms; hover: pop; click: confetti count=40"` (triggers `enter` · `click` · `hover` · `load` · `loop` · `manual`; modifiers: duration, `delay`, `stagger`, easing, `once`, `key=value` options). `applyMotion(root, { observe })` binds every `[data-motion]`, `bindMotion(el, rules)` one element, `parseMotion()` / `serializeMotion()` round-trip, `motion\`…\`` tagged template, `createComponent(json)` builds markup from the 8.9 component JSON. `<usa-motion rules="…">` is the same as an element.
- **Plugin marketplace GA — `motionary/marketplace`** (also `motionary/components/marketplace`, which keeps the 6.9 manifest API): `MARKETPLACE` (first-party catalogue), `searchPlugins()`, `installPlugin(listing | url, { load })`, `installedPlugins()`, `fetchMarketplace(url)` for third-party indexes; `<usa-plugin-store>` puts search + one-click install on a page.
- `motionary` and the `use-scroll-animate` alias are both published with the npm `latest` tag.

## Behaviour

- Nothing else changes: every 8.x widget, effect pack and engine API stays the same; `data-usa-theme`, `themeVars`, `themeCss`, `themePreset`, `playThemeEffect` and `THEME_ROLES` are unchanged.

## New in 8.9 (before the break)

- **Low-code export.** `exportComponent(el, 'html' | 'react' | 'vue' | 'json')` turns any live, configured component into copy-paste code (runtime parts stripped); `describeComponent(el)` gives the portable JSON. `<usa-code-export>` shows it in tabs with a copy button and follows attribute changes; `<usa-prop-panel for="#el" props="…">` edits a live component's attributes with typed fields.

See the [CHANGELOG](../CHANGELOG.md) for the full list.
