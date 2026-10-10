# Upgrading to Motionary 13

> 13.0 is released: the paths below are gone from `package.json` `exports`.

13.0 finishes the four-layer layout (Motion Core · Runtime · Components · Tooling) and makes the 12.x tooling stable. One thing
breaks: **the import paths deprecated in 11.5 are removed**. Everything else in 12.x keeps working.

```bash
npx motionary doctor            # lists every removed path (and any legacy event name) in your project
npx usa-codemod-13 --write      # rewrites them, plus CDN URLs pinned to @10 / @11 / @12 → @13
```

## Removed in 13.0

| Removed subpath | Use instead |
|---|---|
| `motionary/components/core` | `motionary/core` |
| `motionary/components/ai` | `motionary/tooling/ai` |
| `motionary/components/design`, `motionary/design` | `motionary/tooling/design` |
| `motionary/components/angular` | `motionary/angular` |
| `motionary/manifest.json` | `motionary/tooling/manifest.json` |
| `motionary/manifest.schema.json` | `motionary/tooling/manifest.schema.json` |

The same applies to the `use-scroll-animate` alias package. The new paths have existed since 11.5 and serve the same files, so the
rewrite changes no behaviour and no bundle size. Through 12.x the old paths work, their types are marked `@deprecated`, and nothing
warns at runtime (imports stay side-effect free).

## CDN

URLs move with the major: `https://unpkg.com/motionary@12/dist/…` → `motionary@13/`. Exact pins (`motionary@12.4.0`) keep working.

## Stable in 13.0

- `motionary-mcp` mounted validation (`validate_snippet { mount: true }`) and version-aware answers (`check_compat`, `version` args).
- The Figma plugin export (tokens + runnable snippets), the component playground (`showcase/run.html`) and `npx motionary export`
  (CSS / mini program WXSS / HarmonyOS ArkTS) and `npx motionary compat`.
- The component contract ([component-contract.md](./component-contract.md)) and the manifest schema v2 (with `since` / `changed`).

## Not changing

Components, attributes, events (`usa:*`), runtime modules and their size budgets, optional peers, reduced-motion behaviour and the
local deterministic parser default are the same in 12.9 and 13.0.
