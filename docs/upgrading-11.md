# Upgrading to Motionary 11

11.0 removes what 10.9 deprecated and freezes the stable surfaces. Run the codemod first:

```bash
npx usa-codemod-11 src          # dry run
npx usa-codemod-11 --write src  # apply
```

| Removed in 11.0 | Use instead | Codemod |
|---|---|---|
| `<usa-three-scene>` / `defineThreeScene()` (10.5 alias) | `<usa-gl-scene>` / `defineGlScene()` — same attributes, events and methods | automatic |
| a **string** program for `offscreenRender()` / `<usa-worker-canvas>` that falls back to the main thread (evaluated with `new Function`) | pass a function; string programs still run in a worker (OffscreenCanvas) | flagged for a manual change |

Stable from 11.0 (semver-protected until 12.0):

- `motionary/runtime` and every `motionary/runtime/<module>` export and module id;
- the AI manifest **schema v2** (`components.json`, `dist/manifest.json`) and the `motionary-scene@1` format;
- `motionary-mcp` **2.x** tool names and result shapes (the server has reported 2.0.0 since 10.7; the roadmap's "1.0" label is retired);
- the compatibility matrix — [docs/compat-matrix.md](./compat-matrix.md), summarised in the README (format × feature, generated from the tested module data; a ✅ row is not removed before 12.0).

Not changed: npm package names (`motionary`, alias `use-scroll-animate`), CDN paths (only the major moves: `motionary@10` → `motionary@11`), the fixed gzip budgets, the individual entry points of 10.8+ components.
