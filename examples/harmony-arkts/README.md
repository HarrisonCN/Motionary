# Motionary on HarmonyOS (ArkTS / ArkUI)

ArkUI has its own animation system (`animateTo`, `curves`), so Motionary exports its presets, durations and easings as an
ArkTS module instead of shipping Web Components. For `<usa-*>` elements inside an ArkWeb `Web` component, follow
[docs/hybrid-apps.md](../../docs/hybrid-apps.md) like any other web view.

```bash
npx motionary export --target arkts --presets fade-in-up,zoom-in,rotate-in --out entry/src/main/ets/motion/Motionary.ets
```

- `USA_PRESETS[name]` is a `{ from, to }` pair of frames (`opacity`, `tx`/`ty` translate, `sx`/`sy` scale, `rx`/`ry`/`rz` rotate, `blur`, `brightness`).
- `usaAnimate(preset, apply, { duration, curve, reduceMotion })` sets the start frame and animates to the end frame with `animateTo`.
- Parts with no direct ArkUI attribute (skew, perspective, clip-path) are listed in a `// Not mapped:` comment at the end of the file,
  never silently dropped.
- Reduced motion: pass `reduceMotion: true` from your app's own setting; the preset then jumps to its end state.

`entry/src/main/ets/pages/Index.ets` binds a frame to a `Column` and replays three presets. Regenerate `Motionary.ets` when you upgrade.
