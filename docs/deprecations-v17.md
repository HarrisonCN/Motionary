# Removed in 17.0.0 (announced in 16.9)

17.0 removes only what 16.9 announced below, and introduces the `mo-*` names ([below](#mo-names)). Studio (incl. the
plugin API), MCP, AI, the Figma plugin and cross-platform export stay experimental ([stability.md](./stability.md)). Everything on this page still works in 16.x (`v16-lts`).
In 16.9 each item had a development warning (once per session), a `doctor --v17` finding and a migration path; nothing
here is in `motionary/components/lite` — lite stays ≤ 70 KB gzip with zero dependencies.

Find every use: `npx motionary doctor --v17` (exit 1 when anything is found). Fix it: `npx motionary migrate --to 17`
(dry run) then `--write` (a `.bak` of every changed file first; an existing backup is never overwritten). Guide:
[migrating-to-v17.md](./migrating-to-v17.md). The ids are exported as `DEPRECATIONS_V17` from the CLI module
(`motionary/bin/motionary.mjs`).

| id | Removed in 17.0 | Replacement | Migration |
|---|---|---|---|
| [`scene-v3-preview`](#scene-v3-preview) | the import path `motionary/scene/v3-preview` (+ `motionary/components/scene-v3-preview`) | `motionary/scene/v3` (same API) | `migrate --to 17 --write` rewrites the imports |
| [`cli-migrate-15`](#cli-migrate-15) | `motionary doctor --v15` and `motionary migrate --to 15` (13.x / 14.x → 15 projects) | run them with the 16.x CLI first | manual: `npx motionary@v16-lts migrate --to 15 --write` |

<a id="scene-v3-preview"></a>
## `scene-v3-preview` — the 15.9 preview import path

`motionary/scene/v3-preview` was the name of the Scene v3 draft in 15.9. Since 16.0 the format is stable at
`motionary/scene/v3`; the old path stayed as an alias. In 16.9 it is a small module of its own that forwards every
call to `motionary/scene/v3` and warns once per session (`console.warn`, nothing on import). 17.0 removes the path.

```js
// before
import { migrateToSceneV3 } from 'motionary/scene/v3-preview';
// after (16.0+)
import { migrateToSceneV3 } from 'motionary/scene/v3';
```

<a id="cli-migrate-15"></a>
## `cli-migrate-15` — the v15 project migration in the CLI

`doctor --v15` / `migrate --to 15` convert 13.x / 14.x projects (compat-v13 imports, animation JSON v1, the 13.x
codemod runner) for 15.0. In 16.9 both print a notice on stderr. 17.0 removes them; the 16.x CLI keeps them:
`npx motionary@v16-lts doctor --v15` and `npx motionary@v16-lts migrate --to 15 --write`, then upgrade.

Not removed in 17.0: Scene v2 stays readable (and `exportScene({ version: 2 })` / `sceneV3ToV2()` keep writing it on
request), `doctor --v16` / `migrate --to 16` stay, the codemods `usa-codemod-11` … `13` stay.

<a id="mo-names"></a>
## `mo-*` names (17.0) — `usa-*` deprecated, kept

17.0 adds Motionary-named aliases. The old names keep working; they are deprecated, and their removal is **not before a
future major** (none is planned). Nothing to do now; prefer the new names in new code.

| Deprecated (still works) | Preferred since 17.0 |
|---|---|
| every `<usa-*>` element, e.g. `<usa-switch>` | `<mo-*>`, e.g. `<mo-switch>` (same element: a subclass, same attributes, properties and `usa:*` events) — on in the CDN bundles; with ESM call `defineMoAliases()` from `motionary/components/mo` |
| `window.UsaComponents` (CDN bundle `components.umd.js`) | `window.MotionaryComponents` (the same object) |
| `npx -p motionary usa-codemod-<n>` | `npx -p motionary mo-codemod <n>` (same runner as `npx motionary codemod <n>`) |

Turning the names on:

- **CDN / no-build** (`components.umd.js`, `widgets.umd.js`): nothing to do, both bundles turn them on before they
  register anything.
- **ESM / bundlers:** one call, ideally before you define components. The alias code is its own entry, so pages that only
  use `usa-*` names (and every per-component import, and `motionary/components/lite`) keep their 16.9 size:

  ```ts
  import { defineMoAliases } from 'motionary/components/mo';
  import { defineComponents } from 'motionary/components';
  defineMoAliases();
  defineComponents(); // <mo-card>, <mo-tabs>, … and <usa-*> both work
  ```

  Called later, it still aliases the default components already defined and anything behind a `<mo-*>` element already
  on the page; everything defined afterwards is aliased as it is defined.

Notes: aliases exist for `usa-*` tags; an element you registered under your own name (`defineSwitch('my-switch')`)
gets none. CSS that targets `usa-switch` does not match `<mo-switch>`; the component's own styles are copied for `mo-*`
(tag selectors renamed) the first time a `mo-*` element connects. With `motionary/components/lite` the category CSS files
are copied once they load; a CSS file served from another origin without CORS cannot be read, so `<mo-*>` stays
unstyled there — use `<usa-*>` names with lite from a CDN. Event names stay `usa:*`.
