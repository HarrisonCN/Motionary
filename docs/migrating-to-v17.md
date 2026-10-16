# Migrating to 17.0

> 17.0.0 is not released yet: this guide is published with 16.9 so you can prepare. 16.x stays supported as
> `v16-lts` (security and severe fixes at least until 18.0 ships).

17.0 is the **platform-stable** major. It freezes three contracts and removes only what 16.9 announced:

- **Scene Format v3** — frozen: 17.x only adds optional fields; validators accept every 16.x v3 file.
- **Studio plugin API v1** (`motionary/studio/plugins`, preview in 16.2) — the manifest (`api: 1`), the permissions and
  the `motionary` object inside a plugin are frozen; 17.x adds permissions only as opt-in.
- **motionary-mcp 3.x** — tool names and input schemas are frozen; 3.x minors only add tools / optional fields.

## Steps

1. Upgrade to the newest 16.x (`npm i motionary@v16-line`) and run `npx motionary doctor --v17`.
2. `npx motionary migrate --to 17` (dry run), then `npx motionary migrate --to 17 --write` — it rewrites
   `motionary/scene/v3-preview` imports to `motionary/scene/v3` (a `.bak` first).
3. Scripts that call `motionary doctor --v15` / `migrate --to 15`: run them once with `npx motionary@v16-lts …`, then
   delete them (17.0 removes these commands).
4. `npm i motionary@17` (or `motionary@next` for the release candidate).

What each item is and why: [deprecations-v17.md](./deprecations-v17.md). Lite (`motionary/components/lite`) is unchanged:
≤ 70 KB gzip, zero dependencies.
