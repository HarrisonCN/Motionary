# Cross-platform 3.0: web, mini programs, HarmonyOS (12.1)

Motionary's `<usa-*>` elements run anywhere a modern web view runs (browsers, Electron, Tauri, MAUI, Flutter, WebView2, ArkWeb —
see [hybrid-apps.md](./hybrid-apps.md) and [windows-apps.md](./windows-apps.md)). Two popular targets have **no** Custom Elements:
mini programs and native ArkUI. For those, 12.1 exports the motion itself — the presets, durations and easings from
[motion.tokens.json](./motion.tokens.json) — as code those platforms run natively.

| Target | Command | Output | Runs |
|---|---|---|---|
| Web / any CSS | `npx motionary export --target css` | custom properties + `@keyframes` + `.usa-<preset>` classes | browsers, web views |
| Mini programs | `npx motionary export --target wxss [--rpx]` | the same CSS subset, variables on `page` | WeChat (WXSS), Alipay (ACSS), Douyin (TTSS) |
| HarmonyOS | `npx motionary export --target arkts` | ArkTS module: `USA_DURATION`, `USA_CURVE`, `USA_PRESETS`, `usaAnimate()` | ArkUI (`animateTo`) |

Options: `--presets a,b,c` (default: all core presets), `--duration <token>` (default `normal`), `--easing <token>` (default
`standard`), `--rpx` (WXSS: 1px → 2rpx), `--out <file>` (default: stdout).

## What maps where

- CSS and WXSS keep every preset exactly (opacity, transform, filter, clip-path).
- ArkTS maps opacity, translate (px or %), scale, rotate / rotateX / rotateY, blur and brightness to ArkUI attributes. Skew,
  perspective and clip-path have no direct ArkUI attribute: they are listed in a `// Not mapped:` comment at the end of the generated
  file — never silently dropped — and the rest of the preset still plays.
- Spring tokens stay web-only for now (ArkUI springs take different parameters).

## Reduced motion

- CSS / WXSS: `@media (prefers-reduced-motion: reduce)` shortens every exported animation to 1 ms, and a `.usa-reduce-motion` class on
  any ancestor does the same for an in-app setting. Not every mini program renderer exposes the OS setting, so wire the class to your
  own switch there.
- ArkTS: `usaAnimate(preset, apply, { reduceMotion: true })` jumps straight to the end frame.

## Examples and previewer

- [examples/miniapp](../examples/miniapp) — a WeChat mini program page with three entrance presets and a reduce-motion switch.
- [examples/harmony-arkts](../examples/harmony-arkts) — an ArkUI page that binds a `UsaFrame` and replays presets with `usaAnimate()`.
- **Cross-platform previewer** — `showcase/xplat.html` (on the site: `/showcase/xplat.html`): one preset on the web, in a mini program
  and as ArkUI maps it, side by side, with the generated CSS / WXSS / ArkTS to copy. The ArkUI pane renders only what the ArkTS export
  maps, so an unmapped part is visible before you ship it.

The exporter is `bin/xplat.mjs` (pure functions: `toCss`, `toWxss`, `toArkTs`, `exportMotion`, `arkFrame`, `arkCurve`), shared by the
CLI and the previewer. It adds nothing to any runtime bundle.
