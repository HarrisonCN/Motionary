# Changed in 16.0.0 (announced in 15.9)

16.0 is the **Scene Format v3 + motionary-mcp 3.0** major; every row below is in effect from 16.0.0. Everything on this
page still works in 15.x (`v15-lts`). In 15.9 each item had a development warning or a machine-readable deprecation, a `doctor --v16` finding and a migration path:

- the Studio warns once in development (`process.env.NODE_ENV !== 'production'`, so production builds drop the text;
  `globalThis.MOTIONARY_NO_DEPRECATION = true` silences it);
- motionary-mcp 2.5 adds a `deprecations` array to the result of any call that uses a shape 3.0 removes (and logs one
  line per id on stderr);
- nothing here is in `motionary/components/lite`, `motionary/components`, `motionary` or `motionary/core` — lite is
  unchanged (≤ 70 KB gzip, zero dependencies).

Find every use: `npx motionary doctor --v16` (exit 1 when anything is found). Preview the move:
`npx motionary migrate --to 16` (15.x only reports — a Scene v3 file does not open in 15.x; 16.0 adds `--write`, which
keeps a `.bak` of every file it changes). Guide: [migrating-to-v16.md](./migrating-to-v16.md). Format draft:
[scene-v3.md](./scene-v3.md). The ids are exported as `DEPRECATIONS_V16` from `motionary/scene/v3` (15.9: `motionary/scene/v3-preview`).

| id | What changes in 16.0 | Replacement | Migration |
|---|---|---|---|
| [`scene-v2-write`](#scene-v2-write) | Studio, the CLI and MCP write Scene v3; v2 is read and migrated on open | `exportScene({ version: 2 })` / `sceneV3ToV2()` where v2 is still needed | `migrate --to 16` (files); code: manual (listed in the report) |
| [`variants-meta`](#variants-meta) | breakpoint variants move from `meta["motionary:variants"]` to a top-level `variants` array | `variantsOf()` from `motionary/studio/a11y` (reads both in 16.x) | `migrate --to 16` moves them |
| [`mcp-snippet-scene`](#mcp-snippet-scene) | motionary-mcp 3.0: `validate_snippet` takes `code` only | `validate_scene` (motionary-mcp 2.5+) | manual (listed in the report) |
| [`mcp-scene-text`](#mcp-scene-text) | motionary-mcp 3.0: `scene` arguments are objects only | pass the parsed object | manual (runtime deprecation only) |
| [`mcp-check-compat`](#mcp-check-compat) | motionary-mcp 3.0 removes `check_compat` (1.0) | `check_compatibility` (since 13.7) | manual (listed in the report) |

Not changed in 16.0: `motionary/scene` keeps reading and validating Scene v2 (`validateSceneV2`, `migrateToSceneV2`,
`serializeSceneV2` stay); timeline v1 and animation JSON v1 (with `format` / `version`) are still read; the physics
world format `motionary-scene@1` is a different format and stays as it is.

<a id="scene-v2-write"></a>
## `scene-v2-write`: Scene v3 becomes the write format

16.0 writes `{ "format": "motionary-scene", "version": 3 }` from the Studio (`exportScene()`, saved projects), the CLI
(`migrate`, `export`) and motionary-mcp 3.0. Scene v2 documents still open everywhere and are migrated on read
(`migrateToSceneV3`, lossless for every v2 document — see the corpus test).

In 15.9 `studio.exportScene()` warns once in development. Code that must keep producing v2 (for example to feed a
15.x player) passes the version explicitly — `exportScene({ version: 2 })` is silent in 15.9 and keeps returning v2 in
16.x.

**Fix:** convert scene files with `npx motionary migrate --to 16` (16.0 `--write`; 15.9 previews the report). In code,
call `studio.exportScene({ version: 2 })` where you need v2, or read v3 with `sceneV3ToV2()` from
`motionary/scene/v3-preview`.

<a id="variants-meta"></a>
## `variants-meta`: variants move out of `meta`

15.3 stored breakpoint variants in `meta["motionary:variants"]`. Scene v3 makes them a first-class `variants` array
(same entries: `{ id, media: { minWidth?, maxWidth? }, layers? }`). `migrateToSceneV3` moves them and drops an empty
`meta`; a non-array value is reported as a loss and left where it was.

**Fix:** `npx motionary migrate --to 16` moves them. Code that reads the meta key directly switches to `variantsOf()`
from `motionary/studio/a11y`, which reads both places in 16.x.

<a id="mcp-snippet-scene"></a>
## `mcp-snippet-scene`: `validate_snippet { scene }`

14.6 let `validate_snippet` take a Scene v2 document instead of code. motionary-mcp 2.5 adds `validate_scene` with the
same checks (schema, component compatibility, headless render, optional ops and real browser); 3.0 removes the
`scene` argument from `validate_snippet`. 2.5 results of `validate_snippet { scene }` carry
`deprecations: [{ id: "mcp-snippet-scene", removedIn: "16.0", … }]`.

**Fix:** call `validate_scene { scene, ops?, version?, browser? }`.

<a id="mcp-scene-text"></a>
## `mcp-scene-text`: scenes as JSON text

motionary-mcp 2.x accepts `scene` as an object or as JSON text. 3.0 takes objects only (the input schema becomes
`{ type: "object" }`), so a tool schema can be checked by the client before the call.

**Fix:** pass the parsed object: `{ scene: JSON.parse(text) }`.

<a id="mcp-check-compat"></a>
## `mcp-check-compat`: the `check_compat` tool

`check_compat` (schema 1.0) has been superseded by `check_compatibility` since 13.7 (framework / version / browser,
scenes too). motionary-mcp 3.0 removes it.

**Fix:** call `check_compatibility { tags, version }` (or `{ code }` / `{ scene }`).
