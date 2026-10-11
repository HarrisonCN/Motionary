# Migrating to Motionary 14 (draft)

> **Draft (13.9).** 14.0 is not released. This guide tracks the plan: 14.0 introduces Motion Engine v2 and Scene Format v2, and gives older interfaces versioned migrations instead of a rewrite. Sections will change as 14.0 takes shape. Everything below already works on 13.9, so you can prepare now with no breaking change.

## 1. Find what will change

```sh
npx motionary doctor            # old import paths + legacy event names (since 11.5)
```

In development, 13.9 also logs one console notice per deprecated API you use (production builds stay silent). The full list is in [deprecations-v14.md](./deprecations-v14.md).

## 2. Convert motion data to Scene Format v2

```sh
npx motionary migrate src/motion/*.json --diff     # look first (dry run)
npx motionary migrate src/motion/*.json --write    # then write <name>.scene.json files
```

- `motionary-timeline` v1 (Timeline editor exports) converts losslessly.
- `<usa-player>` animation JSON v1 keeps every track. Documents with no `format` / `version` are flagged.
- Playground state documents (`use-scroll-animate/playground`) become preset layers.
- Add `--tokenize` to replace literal easings and durations that match your motion tokens with references (`"{duration.fast}"`), so a later token change reaches the scene.

The format and API are in [scene-v2.md](./scene-v2.md). Until 14.0, keep shipping the v1 files to the 13.x player, and use the `.scene.json` files with tools, or convert back with `sceneV2ToAnimation()`.

## 3. Replace deprecated APIs

| 13.x | 14.0 |
|---|---|
| playground documents in `<usa-player>` | animation JSON v1 or scene v2 |
| animation JSON without `format` / `version` | add them, or use scene v2 |
| `normalizeAnimation()` | `validateSceneV2()` / `migrateToSceneV2()` |
| `usa-codemod-5` … `usa-codemod-10` | `npx motionary doctor` + `npx usa-codemod-13` |

## 4. What stays the same

- `<usa-*>` tags, attributes, events (`usa:*`), presets and motion tokens.
- The Timeline document v1 API. 14.0 reads v1 files through the migrator.
- Zero runtime dependencies, and the lite size budget (≤ 70 KB gzip).

## Open questions for 14.0 (feedback welcome)

- Whether the player gains a native scene v2 loader in 14.0, or reads v2 through `sceneV2ToAnimation()` first.
- Whether token references in keyframe props support arithmetic (`calc()` with tokens), or only whole-value references.
- Whether component bindings move to a separate top-level `components` list.
