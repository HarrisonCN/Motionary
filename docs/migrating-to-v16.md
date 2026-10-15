# Migrating to v16

> **16.0** — Scene Format v3 + motionary-mcp 3.0. Staying on 15.x? `npm i motionary@v15-lts` (15.9.x: security and
> severe fixes at least until 17.0 ships).

16.0 is the Scene Format v3 + motionary-mcp 3.0 major. Its changes are listed in
[deprecations-v16.md](./deprecations-v16.md); each one warns or reports a deprecation since 15.9, and the CLI finds and
previews them for you. Lite stays ≤ 70 KB gzip with zero dependencies.

## 1. Upgrade to 15.9 first

```sh
npm i motionary@^15.9
```

Run your app in development: `studio.exportScene()` logs one `console.warn` if your code relies on its v2 output.
MCP clients see a `deprecations` array on results of calls that use a shape motionary-mcp 3.0 removes.

## 2. Find every use

```sh
npx motionary doctor --v16            # exit 1 when anything is found
npx motionary doctor --v16 --json src scenes
```

It lists Scene v2 files (16.0 writes v3), `meta["motionary:variants"]`, `exportScene()` calls without
`{ version: 2 }`, and MCP 2.x shapes in your code (`check_compat`, `validate_snippet` with `scene`).

## 3. Preview the move

```sh
npx motionary migrate --to 16                 # dry run: per-file report
npx motionary migrate --to 16 --json --report motionary-migrate-report.json
```

For every Scene v2 file the report says whether the move to v3 is lossless, what changes (version 2 → 3, variants out
of `meta`) and what would be lost. Code findings are listed as manual work. Studio projects (`*.motionary.json`) are
never rewritten — the 16.0 Studio upgrades them on open.

15.x refuses `--write` (exit 2): a v3 file does not open in 15.x. After upgrading, run
`npx motionary@16 migrate --to 16 --write` — every changed file gets a byte-identical `.bak` first (an existing
backup is never overwritten: `.bak.1`, `.bak.2` …).

## 4. Try the format in code

```ts
import { migrateToSceneV3, sceneV3ToV2, validateSceneV3 } from 'motionary/scene/v3'; // 15.9: motionary/scene/v3-preview (alias until 17.0)

const { ok, doc, report } = migrateToSceneV3(sceneV2); // never writes, never mutates its input
report.lossless; // true for every Scene v2 document
const back = sceneV3ToV2(doc!); // read v3 in 15.x; names what v2 cannot express (comps, component instances)
```

`motionary/scene/v3` (16.0; `motionary/scene/v3-preview` stays as a deprecated alias until 17.0) is an opt-in entry with its own size line; it is not in lite or `motionary/scene`. The player, the timeline editor and the Studio open Scene v3 without it.

## 5. Update code

- Need v2 from the Studio? `studio.exportScene({ version: 2 })` (works in 15.9 and 16.x).
- Reading variants? `variantsOf(doc)` from `motionary/studio/a11y`.
- MCP clients: `validate_scene` instead of `validate_snippet { scene }`, `check_compatibility` instead of
  `check_compat`, scene arguments as objects.
