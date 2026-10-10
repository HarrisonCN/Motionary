# Motionary — Figma plugin (12.3)

Exports **motion tokens** and **runnable component snippets** from a Figma file.

1. Figma → Plugins → Development → Import plugin from manifest… → pick `figma-plugin/manifest.json` (from the repo or `node_modules/motionary/figma-plugin/`).
2. Select layers and run **Motionary export**. Three tabs, each with a Copy button:
   - **HTML page** — a complete page you can paste into a file and open: the tokens as CSS, every prerequisite script in the right
     order (`motionary/runtime` core, then its modules), the component bundle, and one element per selected layer.
   - **CSS tokens** — `--usa-duration-*` / `--usa-easing-*` custom properties.
   - **motion.tokens.json** — W3C design tokens, the same format as `docs/motion.tokens.json`.

## How layers map

- A layer named after a component — `usa-tilt`, `<usa-tilt>`, `Card / usa-tilt` — becomes that element (plugin data
  `motionary:tag` works too). An instance's **component properties** become attributes, but only attributes the component has
  (booleans: `true` → bare attribute). Text inside the layer becomes the element's text.
- Prototype interactions become a `data-motion` string (DISSOLVE → `fade`, SMART_ANIMATE → `scale`, MOVE_IN / SLIDE_IN / PUSH →
  `fade-<direction>`, durations, easings) and the page calls `applyMotion()`; the mapping matches `figmaToMotion()` in `motionary/tooling/design`.
- Variables named `motion/duration/<name>` (number, ms) and `motion/easing/<name>` (string, e.g. `cubic-bezier(0.2, 0, 0, 1)`)
  override or extend Motionary's default tokens.

The plugin never touches the network (`networkAccess: none`) and never edits the document. `code.js` is generated from
`plugin-src.js` by `node scripts/gen-figma-plugin.mjs` (it embeds the component catalog); edit the source, not the output.
