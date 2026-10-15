# Cross-platform export 2.0 (`motionary/studio/native`, 15.2)

One Scene v2 document (or a timeline v1 document, or a Studio project `{ doc }`) → source code for five targets, each
with a **per-property loss report**. Every animated property of every playing track appears in the report exactly once,
as `supported` or as `lost` with a reason. Nothing is dropped silently. Pure functions: no DOM, no Node APIs, the same
input always gives the same text.

```js
import { exportNative, NATIVE_TARGETS, nativeSupport } from 'motionary/studio/native';

const { code, file, report } = exportNative(scene, { target: 'compose' });
// file   → 'card-intro.kt'
// report → { target: 'compose', supported: [{ layer: 'title', prop: 'opacity' }, …],
//            lost: [{ layer: 'card', prop: 'filter', reason: 'no compose equivalent in the supported subset' }], notes: [] }
```

```sh
npx motionary export --scene card.json --target swiftui --out CardIntro.swift --report loss.json
npx motionary export --scene card.json --target compose --strict   # exit 1 when anything is lost
```

## Targets

| Target | Output | Runtime it needs |
|---|---|---|
| `css` | `@keyframes` per track + `animation` rule, per-segment `animation-timing-function`, `prefers-reduced-motion` block and a `.usa-reduce-motion` class | any browser |
| `wxss` | the same for mini programs (WXSS / ACSS / TTSS); `rpx: true` turns `1px` into `2rpx` | WeChat / Alipay / ByteDance mini programs |
| `arkts` | one `Frame` interface + `START` / `END` constants + `play…(ctx, apply, reduceMotion)` per track using `UIContext.keyframeAnimateTo` | HarmonyOS API 11+ |
| `compose` | one `Modifier.…(play, reduceMotion)` per track: `updateTransition` + `keyframes { … at … using … }`, `graphicsLayer` for alpha / translation / scale / rotation, `background` for background color | Jetpack Compose (animation-core) |
| `swiftui` | one `ViewModifier` + `View` extension per track: `keyframeAnimator` with `LinearKeyframe(…, timingCurve: .bezier(…))`; `accessibilityReduceMotion` jumps to the end | iOS 17+ / macOS 14+ |

## Supported subset (native targets)

| Property / feature | `css` `wxss` | `arkts` `compose` `swiftui` |
|---|---|---|
| `opacity` | ✅ | ✅ |
| `transform`: `translate` / `translateX` / `translateY` (px), `scale` / `scaleX` / `scaleY`, `rotate` / `rotateZ` (deg, rad, turn, grad) | ✅ | ✅ |
| other transform functions (`skew`, `matrix`, 3D, `%` / `em` lengths) | ✅ | lost (the whole `transform` of that track, with the functions named) |
| `color`, `background-color` | ✅ | ✅ as hex (`#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`); other color syntaxes are lost |
| easings `linear`, `ease`, `ease-in`, `ease-out`, `ease-in-out`, `cubic-bezier()` | ✅ | ✅ (as cubic Béziers) |
| other easings (`steps()`, `linear()`, springs) | ✅ | reported as lost `easing`; those segments play linear |
| any other CSS property (`filter`, `clip-path`, `box-shadow`, …) | ✅ | lost |

`nativeSupport(target, feature)` answers the same question in code. Muted layers (and everything outside a soloed
layer) are left out of the export and of the report, as in the Studio preview.

`report.ai` lists the 15.1 provenance records (`meta["motionary:provenance"]`, see
[studio-provenance.md](./studio-provenance.md)) that touched an exported layer — `{ id, generator, model?, requestId?, at,
layers }`, oldest first — so a reviewer can see which parts of the exported motion came from an AI edit. The generated
code is identical with or without provenance.

## Notes

- Segment easing follows CSS: the easing on a keyframe shapes the segment that **starts** there. Compose `using` and
  ArkTS `curve` take it from the same keyframe; SwiftUI's `timingCurve` sits on the keyframe that **ends** the segment, so
  the generator moves it one keyframe on.
- Tracks that start after 0 hold their first value until then (CSS `0%` block, Compose / SwiftUI hold keyframe).
- Golden files for the test scene live in `test/golden/native-15-2/`. CI has no Kotlin / Swift / ArkTS compiler: the
  tests check the generated text against the golden files and with a bracket / string balance check. Compile the output
  in your own app before shipping it; report a generator bug with the scene JSON and the target.
- The 12.1 `motionary export --target css|wxss|arkts` (presets + tokens) is unchanged; `--scene` selects this exporter.
