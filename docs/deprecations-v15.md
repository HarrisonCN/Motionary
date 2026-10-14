# Deprecated in 14.9, removed in 15.0

15.0 removes the 13.x compatibility layer that 14.0 kept around. Everything on this page still works in 14.x and
warns once in development (guarded by `process.env.NODE_ENV !== 'production'`, so production builds drop the text;
`globalThis.MOTIONARY_NO_DEPRECATION = true` silences it). Nothing here is in `motionary/components/lite`,
`motionary/components`, `motionary` or `motionary/core`, so lite is unchanged.

Find every use: `npx motionary doctor --v15` (exit 1 when anything is found). Move off it: `npx motionary migrate --to 15`
(dry run first; `--write` keeps a `.bak` of every file it changes and writes a loss / manual-work report).
Guide: [migrating-to-v15.md](./migrating-to-v15.md). History of these items: [deprecations-v14.md](./deprecations-v14.md).

| id | Removed in 15.0 | Replacement | Migration |
|---|---|---|---|
| [`compat-v13-entry`](#compat-v13-entry) | the `motionary/compat-v13` entry (= `motionary/components/compat-v13`) | the 14.x entries | `doctor --v15`, `migrate --to 15` |
| [`install-compat-v13`](#install-compat-v13) | `installCompatV13()`: `<usa-player>` / `createPlayer()` reading playground documents and animation JSON without `format` / `version` | Scene v2 data | `migrate --to 15 --write` converts the data and removes plain `installCompatV13();` calls |
| [`normalize-animation`](#normalize-animation) | `normalizeAnimation()` | `validateSceneV2()` / `migrateToSceneV2()` from `motionary/scene` | manual (listed in the report) |
| [`upgrade-legacy-animation`](#upgrade-legacy-animation) | `upgradeLegacyAnimation()` | `migrateToSceneV2()` from `motionary/scene` | manual (listed in the report) |
| [`old-codemods`](#old-codemods) | `npx motionary codemod <5–10>` (the 13.x upgrade tools) | `npx motionary migrate --to 15`; codemods 11–13 stay | manual (listed in the report) |

Not removed in 15.0: the physics world format `motionary-scene@1` (`motionary/runtime/format-scene`,
`<usa-physics-playground>`) is a different format from Scene Format v2 and stays as it is. `npx motionary migrate` (any old format → Scene v2) and `migrate --code` keep working; reading
`motionary-scene` v2, timeline v1 and animation JSON v1 (with `format` / `version`) stays.

<a id="compat-v13-entry"></a>
## `compat-v13-entry`: the `motionary/compat-v13` entry

14.0 moved the 13.x interfaces into this entry so upgrades could happen one step at a time. 15.0 deletes the entry
(and its `package.json` export), so an import of it fails to resolve.

- **Fix:** run `npx motionary doctor --v15` to list the imports, then `npx motionary migrate --to 15 --write`. What it
  cannot rewrite safely is listed under `manual` in the report with the reason.

<a id="install-compat-v13"></a>
## `install-compat-v13`: `installCompatV13()`

Without it, `<usa-player>` / `createPlayer()` already refuse playground documents
(`{ "format": "use-scroll-animate/playground" }`) and animation JSON without `format` / `version` (since 14.0). Since
14.9 calling it warns once in development.

- **Fix:** convert the data once: `npx motionary migrate --to 15 --write` rewrites each such JSON file **in place** as a
  Scene v2 document (after copying the original to `<file>.bak`, or `.bak.1`, `.bak.2` … when a backup already exists),
  records what was changed and anything lost per file, and removes `import { installCompatV13 } from 'motionary/compat-v13'`
  plus plain `installCompatV13();` statements (also after a `.bak`). If you keep its uninstall function, remove it by hand.

<a id="normalize-animation"></a>
## `normalize-animation`: `normalizeAnimation()`

Removed from `motionary/components/effects` in 14.0 (kept in `motionary/compat-v13`); removed for good in 15.0.

- **Fix:** validate with `validateSceneV2(doc)` (returns problems, never throws) or convert old JSON with
  `migrateToSceneV2(input)` (returns `{ ok, doc, report }`), both from `motionary/scene`. There is no drop-in rewrite,
  so `migrate --to 15` lists it as manual work.

<a id="upgrade-legacy-animation"></a>
## `upgrade-legacy-animation`: `upgradeLegacyAnimation()`

The pure helper that turned a 13.x document into animation JSON v1.

- **Fix:** `migrateToSceneV2(input)` from `motionary/scene` reads the same documents and returns Scene v2 plus a
  migration report. Listed as manual work by `migrate --to 15`.

<a id="old-codemods"></a>
## `old-codemods`: `npx motionary codemod <5–10>`

The 13.x upgrade tools (`usa-codemod-5` … `usa-codemod-10`) left the package bin in 14.0 and ran through
`npx motionary codemod <n>`; since 14.9 that prints a notice on stderr, and 15.0 removes them. Codemods 11–13 stay.

- **Fix:** if a project still needs one, run it with a 14.x CLI (`npx motionary@v14-lts codemod <n> --write`) before
  upgrading, then delete the script. `doctor --v15` finds `package.json` scripts and docs that still call them.
