# Migrating to 17.0

> 16.x stays supported as `v16-lts` (security and severe fixes at least until 18.0 ships). Stable core, experimental
> surfaces and the LTS policy: [stability.md](./stability.md).

17.0 removes only what 16.9 announced and adds Motionary-named aliases:

- **Removed:** the `motionary/scene/v3-preview` import path and the CLI's v15 project migration
  ([deprecations-v17.md](./deprecations-v17.md)).
- **New names, old ones kept:** `<mo-*>` for every `<usa-*>` element (on in the CDN bundles; with ESM call
  `defineMoAliases()` from `motionary/components/mo`), `window.MotionaryComponents`, `mo-codemod`. The `usa-*` names are
  deprecated but keep working; removal not before a future major ([details](./deprecations-v17.md#mo-names)).
- **Unchanged:** Scene Format v3 stays stable; Studio (incl. the plugin API), MCP 3.x, AI, the Figma plugin and
  cross-platform export stay experimental.

## Steps

1. Upgrade to the newest 16.x (`npm i motionary@v16-line`) and run `npx motionary doctor --v17`.
2. `npx motionary migrate --to 17` (dry run), then `npx motionary migrate --to 17 --write` — it rewrites
   `motionary/scene/v3-preview` imports to `motionary/scene/v3` (a `.bak` first).
3. Scripts that call `motionary doctor --v15` / `migrate --to 15`: run them once with `npx motionary@v16-lts …`, then
   delete them (17.0 removes these commands).
4. `npm i motionary@17` (or `motionary@next` for the release candidate).

What each item is and why: [deprecations-v17.md](./deprecations-v17.md). Lite (`motionary/components/lite`) is unchanged:
≤ 70 KB gzip, zero dependencies.
