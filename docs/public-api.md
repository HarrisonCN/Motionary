# Public API by layer (11.5)

Motionary is one package (`motionary`, alias `use-scroll-animate`) whose subpaths follow the four layers of
[architecture.md](./architecture.md). 11.5 adds the missing layer and framework subpaths as **aliases**: they point at
the same files as the paths they replace, so nothing gets bigger — the root entry and every per-entry / tier budget are
unchanged.

| Layer | Subpaths |
|---|---|
| Motion Core | `motionary/core` (`createMotion()`, zero-dep, ≤ 10 KB gzip) · `motionary/runtime` (ticker, tween, timeline, `use()`) |
| Runtime | `motionary/runtime/<module>` — scroll, smooth, text, drag-snap, physics, vector, gl, format-* … (tiers in [runtime-tiers.md](./runtime-tiers.md)) |
| Components | `motionary/components` · `motionary/components/<category>` · `motionary/widgets/<name>` · `motionary/effects/<name>` |
| Motion Intelligence & Tooling | `motionary/tooling/ai` · `motionary/tooling/design` · `motionary/tooling/manifest.json` · `motionary/tooling/manifest.schema.json` · `npx motionary doctor` · `npx motionary-mcp` · `npx usa-codemod-*` |
| Public API — frameworks | `motionary/react` · `motionary/vue` · `motionary/svelte` · `motionary/solid` · **`motionary/angular`** (new) |

Framework wrappers for the `<usa-*>` elements stay at `motionary/components/react` · `vue` · `svelte` · `solid`;
Angular's wrapper is now `motionary/angular` (it has no separate HTML-API binding).

## Angular parity

`motionary/angular` (framework-free, no `@angular/*` import) now covers what the other wrappers do:

| Need | React | Vue | Svelte / Solid | Angular |
|---|---|---|---|---|
| register the elements | `defineComponents()` | `UsaPlugin` | `defineUsa()` | `defineUsa()` · `usaInitializer()` · **`provideUsa(APP_INITIALIZER, categories)`** |
| tag list / predicate | `USA_TAGS` | `isUsaElement` | — | **`USA_TAGS`** · **`isUsaElement`** |
| bind props + events | wrapper props | `.prop` · `@usa:x` | `use:usa` / `bindUsa` | `[prop]` · `(usa:x)` · `bindUsa` |
| event name / payload | `eventName()` | — | `usaEventName()` | `usaEventName()` · `usaDetail()` |

## Deprecated paths (work until 13.0)

| Old | New |
|---|---|
| `motionary/components/core` | `motionary/core` |
| `motionary/components/ai` | `motionary/tooling/ai` |
| `motionary/design`, `motionary/components/design` | `motionary/tooling/design` |
| `motionary/components/angular` | `motionary/angular` |
| `motionary/manifest.json`, `motionary/manifest.schema.json` | `motionary/tooling/manifest.json`, `motionary/tooling/manifest.schema.json` |

The same applies to `use-scroll-animate/…`.

- **No runtime warning.** Importing stays free of side effects (the 11.1 guarantee): an old path never logs.
- **Types:** the old paths' declarations mark every export `@deprecated`, so editors strike the import through and name the new path.
- **Find them:** `npx motionary doctor [paths…]` lists every old path with file and line (exit code 1 when any is found — usable in CI; `--json` for tools).
- **Fix them:** `npx usa-codemod-12 --write [paths…]` rewrites the import specifiers (dry run without `--write`).
