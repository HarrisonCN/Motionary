# Deprecated in 13.9, planned for removal in 14.0

Everything listed here **still works in 13.x, and works the same as before**. 13.9 only adds hints:

- **Types:** each API carries `@deprecated` JSDoc, so editors strike it through and say what to use instead.
- **Runtime (development only):** the first use logs one `console.warn` per item, with a link to its section below. Call sites are guarded by `process.env.NODE_ENV !== 'production'`, so production builds from any bundler (Vite, webpack, Rollup, esbuild, Parcel) drop the check and the message text. Code loaded in a browser with no bundler (a CDN `<script type="module">`) never warns. Turn notices off with `globalThis.MOTIONARY_NO_DEPRECATION = true`, or set the `MOTIONARY_NO_DEPRECATION` environment variable for the CLI tools.
- **Size:** none of this is in `motionary/components/lite`, `motionary/components`, `motionary` or `motionary/core`. Lite is unchanged at ≤ 70 KB gzip.

How to move: [migrating-to-v14.md](./migrating-to-v14.md) (draft). To convert motion data, run `npx motionary migrate` ([scene-v2.md](./scene-v2.md)).

| id | Deprecated | Replacement | Runtime notice |
|---|---|---|---|
| [`player-playground-format`](#player-playground-format) | `use-scroll-animate/playground` documents in `<usa-player>` / `createPlayer()` | Animation JSON v1, or scene v2 via `npx motionary migrate` | yes, dev only |
| [`player-unversioned-json`](#player-unversioned-json) | Animation JSON without `"format"` and `"version"` | Add `"format": "use-scroll-animate/animation", "version": 1`, or migrate to scene v2 | yes, dev only |
| [`normalize-animation`](#normalize-animation) | `normalizeAnimation()` from `motionary/components/effects` | `validateSceneV2()` / `migrateToSceneV2()` from `motionary/components/scene-v2` | yes, dev only |
| [`old-codemods`](#old-codemods) | The `usa-codemod-5` to `usa-codemod-10` bins | `npx motionary doctor` + `npx usa-codemod-13` | stderr line |

<a id="player-playground-format"></a>
## `player-playground-format`: playground state documents

`{ "format": "use-scroll-animate/playground", "state": "…" }` was the 5.x playground's share format. Inside it is base64 state that maps presets to the player's children by position. In 14.0, `<usa-player>` reads scene v2 and animation JSON v1 only.

- **Fix:** `npx motionary migrate hero.json --write` turns it into `hero.scene.json`, with one preset layer per track. The current playground also exports animation JSON directly.

<a id="player-unversioned-json"></a>
## `player-unversioned-json`: animation JSON without `format` / `version`

13.x treats `{ "tracks": […] }` as animation JSON v1. In 14.0 the player requires an explicit format, so it can tell v1 and v2 documents apart.

- **Fix:** add `"format": "use-scroll-animate/animation", "version": 1`, or run `npx motionary migrate` to convert to scene v2.

<a id="normalize-animation"></a>
## `normalize-animation`: `normalizeAnimation()`

This was an internal helper that 5.9 exported by accident. It throws on bad input and returns the player's own internal shape. `createPlayer()` and `<usa-player>` behave exactly as before; they no longer call the exported function.

- **Fix:** to check a document without throwing, use `validateSceneV2()` (scene v2) or `migrateToSceneV2()` (any 13.x motion JSON). Both are in `motionary/components/scene-v2`.

<a id="old-codemods"></a>
## `old-codemods`: `usa-codemod-5` to `usa-codemod-10`

These bins rewrite projects for the 5.0 to 10.0 upgrades. 14.0 drops them from the package's `bin` field; `usa-codemod-11`, `usa-codemod-12` and `usa-codemod-13` remain. In 13.9 they still run, after printing one line to stderr.

- **Fix:** run `npx motionary doctor` to find old import paths and event names, then `npx usa-codemod-13 --write`. A project still on 4.x to 9.x can run an older codemod with `npx -p motionary@13 usa-codemod-<n>`.

## Not deprecated

The 13.6 Timeline document (`motionary-timeline` v1) and its API (`parseTimelineDoc`, `timelineDocToAnimation`, …) stay. 14.0 reads v1 timeline documents through the migrator. `<usa-*>` tags, presets, tokens and the runtime are unaffected.
