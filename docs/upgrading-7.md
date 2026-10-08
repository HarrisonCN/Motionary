# Upgrading to 7.0

6.9 **warns once in the console** for everything that 7.0 removes, and a codemod rewrites it:

```sh
npx usa-codemod-7 src            # dry run: lists every change (and what needs a manual edit)
npx usa-codemod-7 --write src    # apply
```

## Removed in 7.0 (deprecated in 6.9)

| 6.x | 7.0 | Codemod |
|---|---|---|
| `registerFx2()` | `registerEffectPacks()` | ✅ |
| `FX2_PACKS` | `EFFECT_PACKS` | ✅ |
| `registerGpuEffects()` | `registerGpuPack()` | ✅ |
| `registerTextEffects3()` | `registerTextPack()` | ✅ |
| `registerLightEffects()` | `registerLightPack()` | ✅ |
| `register3dEffects()` | `register3dPack()` | ✅ |
| `registerMorphEffects2()` | `registerMorphPack()` | ✅ |
| `registerTransitionEffects2()` | `registerTransitionsPack()` | ✅ |
| `registerWeatherEffects()` | `registerWeatherPack()` | ✅ |
| `registerPhysicsEffects2()` | `registerPhysicsPack()` | ✅ |
| `<usa-tooltip text placement delay>` | `<usa-tip text placement delay>` (6.6 — springs, flips, click popovers) | ✅ tags · ⚠️ `defineTooltip()` → `defineTip()` manual |
| `<usa-toggle checked disabled label name>` | `<usa-switch …>` (6.7 — `ios`, `daynight`, `bounce`, `liquid`) | ✅ tags · ⚠️ `defineToggle()` → `defineSwitch()` manual |

The codemod also rewrites `UsaWidgets.registerFx2()` (UMD global) and Markdown / MDX docs. `document.createElement('usa-tooltip')` and CSS selectors on the old tags are reported for a manual edit.

## New in 6.9 (before the break)

- `<usa-keyframe-editor>` (animation editor 2.0), `<usa-date-picker>`, `<usa-color-picker>`, `<usa-file-drop>`; focus & feedback effects; the effect marketplace manifest (`motionary/effect-pack` v1, `loadEffectPack()`). See [components.md](./components.md#v69-widgets-date-picker-color-picker-file-drop-keyframe-editor-componentswidgets--focus--feedback-componentsfx-focus--marketplace-manifest-componentsmarketplace).

See the [CHANGELOG](../CHANGELOG.md) for the full list.
