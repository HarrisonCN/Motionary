# Tree-shaking (11.1)

Motionary is one package with many entry points. Since 11.1 every module is **side-effect free on import**:

- Importing a module registers nothing — no custom element, no effect, no runtime module — and writes nothing to
  `globalThis`. Registration happens only when you call `define*()`, `register*()`, `use()` or `defineComponents()`.
  The per-page tables (the effect table, the shared motion clock, the runtime registry) are created on first use and
  are still shared by every bundle on the page (`Symbol.for` keys).
- Every module-level call that builds a value (`Object.values(…)`, `new Set(…)`, the plugin objects, the per-effect
  entries) carries `/*#__PURE__*/`, so a bundler can drop it when its result is unused.
- `package.json` `sideEffects` lists only the files that really run code on import:

  | Pattern | Why |
  |---|---|
  | `*.css` | stylesheets |
  | `./dist/*.umd.js`, `./dist/runtime.iife.js`, `./dist/runtime/*.iife.js` | `<script>` / CDN builds register themselves |
  | `./dist/presets/extended.{js,cjs}` | `import 'motionary/presets/extended'` registers the extended presets |
  | `./dist/components/lite.{js,cjs}` | points the on-demand CSS loader at its own `dist/` folder |
  | `./src/…` counterparts | for tools that bundle the sources directly |

## What you get

Importing one export pulls in only its own code. Measured with esbuild (minified, gzip) on the 11.1 build:

| Import | 11.0 | 11.1 |
|---|---|---|
| `import { defineAddToCart } from 'motionary/components/widgets'` | every widget (≈ 156 KB) | ≈ 5 KB |
| `import { gpu } from 'motionary/plugins'` | every effect pack (≈ 44 KB) | the GPU pack only (≈ 9 KB) |
| `import 'motionary/components'` (nothing used) | — | 0 bytes |

The per-component entries (`motionary/widgets/<name>`, `motionary/effects/<name>`) stay the smallest way in, with
their fixed budgets.

## Checks

- `test/widgets-11-1.test.ts` bundles the sources with esbuild: a bare import of any library module bundles to
  nothing; one define / one plugin / the runtime core contain none of the other modules' code; every module-level
  call initializer is `/*#__PURE__*/`; importing registers nothing.
- `npm run check:treeshake` (CI, after the build) does the same on `dist/` through the package's own exports map:
  every entry point is empty when imported for nothing (except the `sideEffects` ones), and single-export bundles stay
  under fixed limits.
