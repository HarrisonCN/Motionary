# Versions, npm dist-tags and the `use-scroll-animate` alias

## Two package names, one build

`motionary` is the package. `use-scroll-animate` (the project's name before 6.1.1) is a **compatibility alias**: every
release is published under both names at the same version, from the same build. Its README starts with a short note that
points to `motionary`. To switch, run `npm i motionary` and replace `use-scroll-animate` with `motionary` in imports and CDN
URLs. Nothing else changes: the `<usa-*>` tags, the `usa-` classes, the globals and the data formats stay the same.

## npm dist-tags

| Tag | Points to | Install |
|---|---|---|
| `latest` | the newest release of the current major (14.2.0 today) | `npm i motionary` |
| `v<major>-line` | each major line from 14 on, e.g. `v14-line` → the newest 14.x release (a bare `v14` is not allowed: npm rejects tag names that are valid SemVer ranges) | `npm i motionary@v14-line` |
| `v13-lts` | the last 13.x release (13.9.0), for projects that stay on 13 | `npm i motionary@v13-lts` |
| `v<major>-<minor>` | each minor release, e.g. `v12-9` → 12.9.0, `v12-5` → 12.5.0 | `npm i motionary@v12-9` or `npm i motionary@12.9.0` |

`latest` moves when a new major ships (x.0.0). From 14.1 on, it also moves with each minor and patch release of that major,
once the release passes its post-publish checks (tarballs, ESM / CJS, main CI). Up to 14.0, minors stayed off `latest`.
Every minor release also gets its own `v<major>-<minor>` tag, so you can pin a minor, or stay on a major line with
`v<major>-line`. Exact versions always work. Both package names
use the same tags. To see the current tags, run `npm view motionary dist-tags`.

## How a release is gated

Every release (major, minor or patch) is published from a pull request whose head commit passed all required CI checks —
contract, size, tree-shaking, playground, the Node matrix and the Chromium / Firefox / WebKit browser jobs. See
[release-gate.md](./release-gate.md) for the gate script and the branch settings.

## CDN majors

CDN URLs pin a major: `https://unpkg.com/motionary@14/dist/…` or `https://cdn.jsdelivr.net/npm/motionary@14/dist/…`. A new
major changes the docs, the showcase and `RUNTIME_CDN` to the new major. URLs pinned to an exact version (`motionary@12.4.0`)
keep working. `npx usa-codemod-13 --write` rewrites URLs pinned to `@10` / `@11` / `@12`.

## What "breaking" means here

Breaking changes come only in majors, and each one has a guide and a codemod:

- [migrating-to-v14.md](./migrating-to-v14.md): Motion Engine v2, Scene Format v2, removals kept in `motionary/compat-v13`, `npx motionary migrate --code`
- [upgrading-13.md](./upgrading-13.md): removed import paths, `npx usa-codemod-13`
- [upgrading-12.md](./upgrading-12.md): component contract, legacy event names, `npx usa-codemod-12`
- [upgrading-11.md](./upgrading-11.md), [upgrading-10.md](./upgrading-10.md) and older (`docs/upgrading-*.md`)

Deprecations announced in a minor stay in place, with `@deprecated` types and no runtime warning, until the next major.
`npx motionary doctor` lists what your project still uses.

## Which version has what

- [version-compat.md](./version-compat.md): `since` / `changed` for every component and runtime module.
  `npx motionary compat <version>` and the `check_compat` tool of `motionary-mcp` read the same data.
- [compat-matrix.md](./compat-matrix.md): feature-by-feature browser and format support for the runtime modules.
- [CHANGELOG.md](../CHANGELOG.md): the notes for every release.
