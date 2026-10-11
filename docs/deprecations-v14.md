# Deprecated in 13.9, removed in 14.0 (kept in `motionary/compat-v13`)

14.0 removed these four interfaces from the main entries. Each one still works through the compat entry
**`motionary/compat-v13`** (planned removal: 15.0), so an upgrade does not have to migrate them first:

- `installCompatV13()` lets `<usa-player>` / `createPlayer()` read playground documents and unversioned animation JSON again;
- `normalizeAnimation()` is exported from `motionary/compat-v13`;
- the old codemods run as `npx motionary codemod <5–10>`.

In development the compat layer logs one `console.warn` per item you still use, with a link to its section below. The
check is guarded by `process.env.NODE_ENV !== 'production'`, so production builds drop it; a CDN `<script type="module">`
without a bundler never warns; `globalThis.MOTIONARY_NO_DEPRECATION = true` (or the `MOTIONARY_NO_DEPRECATION`
environment variable for the CLI) silences it. Nothing here is in `motionary/components/lite`, `motionary/components`,
`motionary` or `motionary/core`. In 13.9 the same items warned from their original places (history: CHANGELOG 13.9.0).

How to move: [migrating-to-v14.md](./migrating-to-v14.md). Data: `npx motionary migrate` ([scene-v2.md](./scene-v2.md));
imports: `npx motionary migrate --code`.

| id | Removed in 14.0 | Replacement | Kept in compat-v13 as |
|---|---|---|---|
| [`player-playground-format`](#player-playground-format) | `use-scroll-animate/playground` documents in `<usa-player>` / `createPlayer()` | Animation JSON v1, or scene v2 via `npx motionary migrate` | `installCompatV13()` |
| [`player-unversioned-json`](#player-unversioned-json) | Animation JSON without `"format"` and `"version"` | Add `"format": "use-scroll-animate/animation", "version": 1`, or migrate to scene v2 | `installCompatV13()` |
| [`normalize-animation`](#normalize-animation) | `normalizeAnimation()` from `motionary/components/effects` | `validateSceneV2()` / `migrateToSceneV2()` from `motionary/scene` | `import { normalizeAnimation } from 'motionary/compat-v13'` |
| [`old-codemods`](#old-codemods) | The `usa-codemod-5` to `usa-codemod-10` bins | `npx motionary doctor` + `npx usa-codemod-13` | `npx motionary codemod <n>` |

<a id="player-playground-format"></a>
## `player-playground-format`: playground state documents

`{ "format": "use-scroll-animate/playground", "state": "…" }` was the 5.x playground's share format. Inside it is base64 state that maps presets to the player's children by position. In 14.0, `<usa-player>` reads scene v2, timeline v1 and animation JSON v1 only (playground documents need `installCompatV13()`).

- **Fix:** `npx motionary migrate hero.json --write` turns it into `hero.scene.json`, with one preset layer per track. The current playground also exports animation JSON directly.

<a id="player-unversioned-json"></a>
## `player-unversioned-json`: animation JSON without `format` / `version`

13.x treats `{ "tracks": […] }` as animation JSON v1. In 14.0 the player requires an explicit format, so it can tell v1 and v2 documents apart.

- **Fix:** add `"format": "use-scroll-animate/animation", "version": 1`, or run `npx motionary migrate` to convert to scene v2.

<a id="normalize-animation"></a>
## `normalize-animation`: `normalizeAnimation()`

This was an internal helper that 5.9 exported by accident. It throws on bad input and returns the player's own internal shape. `createPlayer()` and `<usa-player>` behave exactly as before; they no longer call the exported function.

- **Fix:** to check a document without throwing, use `validateSceneV2()` (scene v2) or `migrateToSceneV2()` (any 13.x motion JSON). Both are in `motionary/scene`.

<a id="old-codemods"></a>
## `old-codemods`: `usa-codemod-5` to `usa-codemod-10`

These bins rewrite projects for the 5.0 to 10.0 upgrades. 14.0 drops them from the package's `bin` field (`usa-codemod-11`, `usa-codemod-12` and `usa-codemod-13` remain); the scripts still ship and run as `npx motionary codemod <5–10>`.

- **Fix:** run `npx motionary doctor` to find old import paths and event names, then `npx usa-codemod-13 --write`. A project still on 4.x to 9.x can run an older codemod with `npx motionary codemod <n>` (or `npx -p motionary@13 usa-codemod-<n>`).

## Not deprecated

The 13.6 Timeline document (`motionary-timeline` v1) and its API (`parseTimelineDoc`, `timelineDocToAnimation`, …) stay. 14.0 reads v1 timeline documents through auto-migration (`<usa-player>`, the Timeline editor, `playScene()`). `<usa-*>` tags, presets, tokens and the runtime are unaffected.
