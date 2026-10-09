# Motionary — Figma plugin scaffold (9.7)

Turns Figma prototype interactions into Motionary `data-motion` strings.

1. Figma → Plugins → Development → Import plugin from manifest… → pick `figma-plugin/manifest.json`.
2. Select frames / components that have prototype interactions and run **Motionary export**.
3. Copy the `data-motion="…"` strings into your markup and call `applyMotion()` from `motionary/dsl`.

The mapping (DISSOLVE → `fade`, SMART_ANIMATE → `scale`, MOVE_IN / SLIDE_IN / PUSH → `fade-<direction>`, durations, easings, AFTER_TIMEOUT → `load` + `delay`) is the same as `figmaToMotion()` in `motionary/design`; Framer users can generate a code component with `framerComponent()`.
