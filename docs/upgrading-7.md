# Upgrading to 7.0

7.0.0 is released. 6.9 **warned once in the console** for everything below, and a codemod rewrites it:

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

## New in 7.0

- **WebGPU first.** Shader backgrounds (`fluid`, `smoke`, `fire`, `ink`, `fireflies`, and any `shaderBackground()` of yours) run on WebGPU where the browser has it — the GLSL body is translated to WGSL (`glslToWgsl()`), or a spec can ship its own `wgsl`. Without WebGPU, or if the adapter / shader is refused, they fall back to WebGL2, then to Canvas 2D, exactly as in 6.x. `el.dataset.usaBackend` is `webgpu`, `webgl2` or `canvas`; force one with `options.backend` (`'webgpu' | 'webgl2' | 'canvas'`).
- **Per-pack entries.** Every effect pack has a short entry: `motionary/fx` (all packs, `registerEffectPacks()`), `motionary/fx/gpu`, `/fx/text`, `/fx/light`, `/fx/3d`, `/fx/morph`, `/fx/transitions`, `/fx/weather`, `/fx/physics`, `/fx/focus`, `/fx/marketplace`. The `motionary/components/fx-*` paths keep working.
- `motionary` and the `use-scroll-animate` alias are both published with the npm `latest` tag.

## Behaviour

- Nothing else changes: the 5.0 browser baseline, the `<usa-player>` JSON format (`use-scroll-animate/animation` v1) and every 6.x widget API stay the same.

## New in 6.9 (before the break)

- `<usa-keyframe-editor>` (animation editor 2.0), `<usa-date-picker>`, `<usa-color-picker>`, `<usa-file-drop>`; focus & feedback effects; the effect marketplace manifest (`motionary/effect-pack` v1, `loadEffectPack()`). See [components.md](./components.md#v69-widgets-date-picker-color-picker-file-drop-keyframe-editor-componentswidgets--focus--feedback-componentsfx-focus--marketplace-manifest-componentsmarketplace).

See the [CHANGELOG](../CHANGELOG.md) for the full list.
