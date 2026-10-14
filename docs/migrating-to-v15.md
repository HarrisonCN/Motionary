# Migrating to v15

> 15.0 removed everything listed below. Stay on 14.x with `npm i motionary@v14-lts`; the 14.x CLI
> (`npx motionary@v14-lts …`) still runs codemods 5–10.

15.0 is the Motion Studio 2.0 major. Its only removals are the 13.x compatibility layer listed in
[deprecations-v15.md](./deprecations-v15.md); every one of them warns in development since 14.9, and the CLI finds
and moves them for you. Lite stays ≤ 70 KB gzip with zero dependencies.

## 1. Upgrade to the last 14.x first

```sh
npm i motionary@^14.9
```

Run your app in development: anything that 15.0 removes logs one `console.warn` with a link to its section.

## 2. Find every use

```sh
npx motionary doctor --v15          # text; exit 1 when anything is found
npx motionary doctor --v15 --json   # { "v15": [{ file, line, kind, id, fix, text }] }
```

It lists `motionary/compat-v13` imports and requires (`compat-import`), `motionary codemod <5–10>` /
`usa-codemod-5…10` calls in scripts and docs (`old-codemod`), and JSON files that are playground documents or
animation JSON without `format` / `version` (`legacy-data`).

## 3. Migrate (dry run, then write)

```sh
npx motionary migrate --to 15                 # dry run: what would change, nothing written
npx motionary migrate --to 15 --write         # backups first, then changes; report → motionary-migrate-report.json
npx motionary migrate --to 15 --write --report out/report.json --json
```

- Legacy JSON data is converted **in place** to Scene v2 (`motionary-scene` v2). The original is copied to
  `<file>.bak` first; an existing backup is never overwritten (`.bak.1`, `.bak.2` … instead).
- `import { installCompatV13 } from 'motionary/compat-v13'` and plain `installCompatV13();` statements are removed
  (also after a `.bak`).
- Everything without a mechanical replacement (`normalizeAnimation`, `upgradeLegacyAnimation`, `installCompatV13`
  whose uninstall you keep, old codemod scripts) is left as is and listed under `manual` with the reason.
- Studio project files (`*.motionary.json` or `"format": "motionary-studio"`) that are truncated, corrupted or from
  an unknown version are listed under `problems` and never rewritten; restore them from a backup or a saved pack.
- The report (`format: "motionary-migrate-report"`, `version: 1`) has one entry per file with `changes`, `losses`
  (what the Scene v2 conversion could not carry over) and `warnings`. Running the command again changes nothing.

## 4. Check and upgrade

```sh
npx motionary doctor --v15    # should print ✓ (or only the manual items you chose to keep for now)
npm i motionary@15
```

Staying on 14.x: `npm i motionary@v14-lts` (security and severe fixes at least until 16.0 ships).
