# Scene Format v2

> **Official since 14.0.** `motionary-scene` v2 is Motionary's motion document (drafted in 13.9; the shape did not change). `<usa-player>` plays it natively, the Timeline editor reads and writes it, and Motion Engine v2 plays it with `playScene()` (`motionary/motion`). Version 1 documents (`motionary-timeline` v1, `<usa-player>` animation JSON v1) are read through auto-migration. Schema: [scene-v2.schema.json](./scene-v2.schema.json). Entry: `motionary/scene` (`motionary/components/scene-v2` stays as an alias).

In 13.x, motion data comes in three shapes. Scene v2 is one document for all of them:

| 13.x source | Carries | In scene v2 |
|---|---|---|
| Timeline document `motionary-timeline` v1 (13.6) | layers, groups, lock / mute / solo, keyframes with per-segment easing, seed, meta | identical layers and keyframes; lossless both ways |
| `<usa-player>` animation JSON v1 | keyframe, preset and effect tracks with start / duration / easing | one track layer per track; keyframe offsets become absolute `time`; `start`, `duration`, `easing`, `preset`, `effect`, `options` sit on the layer |
| Component motion props + motion tokens | `duration`, `delay`, `easing`, … on `usa-*` elements; the token scale | `component: { tag, props }` on a layer; any value can reference a token as `"{duration.fast}"`; scene-local `tokens` |

```json
{
  "format": "motionary-scene",
  "version": 2,
  "name": "hero",
  "tokens": { "duration": { "hero": 720 } },
  "layers": [
    { "id": "title", "type": "track", "target": ".title", "keyframes": [
      { "id": "k1", "time": 0, "props": { "opacity": 0 }, "easing": "{easing.standard}" },
      { "id": "k2", "time": 600, "props": { "opacity": 1 } } ] },
    { "id": "cta", "type": "track", "target": ".cta", "start": 400, "duration": 500, "preset": "fade-up" },
    { "id": "card", "type": "track", "target": ".card", "component": { "tag": "usa-fade-up", "props": { "duration": "{duration.hero}" } } }
  ],
  "source": { "format": "motionary-timeline", "version": 1 }
}
```

## API: `motionary/scene`

This is an opt-in entry point (same files as `motionary/components/scene-v2`). It is not part of `motionary/components`, and adds 0 bytes to lite.

| Export | What it does |
|---|---|
| `SCENE_V2_FORMAT`, `SCENE_V2_VERSION`, `SCENE_V2_STATUS` (`'stable'` since 14.0; `'draft'` in 13.9), `SCENE_V2_LIMITS`, `SCENE_V2_SCHEMA` | constants and the JSON Schema (draft 2020-12) |
| `validateSceneV2(docOrText)` | every problem as `{ path, message }`. **Never throws**, not on wrong types, circular objects or invalid JSON. Also checks what the schema cannot: unique ids, parents that are groups, group cycles, easings, token references |
| `isSceneV2(x)` | `validateSceneV2(x).length === 0` |
| `detectMotionFormat(x)` | `'motionary-scene@2' \| 'motionary-timeline@1' \| 'animation@1' \| 'playground' \| 'unknown'` |
| `migrateToSceneV2(x, { tokenize? })` | `{ ok, doc, problems, report }`. `report` holds `from`, `changes`, `lost`, `warnings` and `stats`. Never throws; a v2 input is validated and normalised (idempotent) |
| `sceneV2FromTimeline` / `sceneV2FromAnimation` | the converters behind `migrateToSceneV2` |
| `sceneV2ToTimeline(doc)` / `sceneV2ToAnimation(doc)` | back to 13.x formats, with a `lost` list of what the target cannot hold |
| `resolveSceneTokens(doc, tokens?)` | replaces token references, using scene tokens first, then the given or built-in scale |
| `sceneV2ComponentLayer(id, tag, props, { tokenize?, target? })`, `tokenizeValue` | builds component bindings; `tokenize` turns `300` into `"{duration.normal}"` |
| `normalizeSceneV2`, `serializeSceneV2` | canonical form and text (key order, sorted keyframes) |
| `diffJson(a, b)`, `formatMigrationReport(result)` | what `motionary migrate --diff` / `--report` print |

## CLI: `npx motionary migrate`

```sh
npx motionary migrate src/motion/*.json              # dry run: report only, nothing written
npx motionary migrate hero.json --diff               # + structural diff (input → scene)
npx motionary migrate src/motion/*.json --write      # writes <name>.scene.json next to each file (never the input)
npx motionary migrate hero.json --out hero.v2.json   # one input, explicit output
npx motionary migrate src/motion/*.json --json       # machine-readable results
npx motionary migrate hero.json --tokenize --write   # literal easings / component durations equal to tokens → "{group.name}"
```

The exit code is 0 when every file migrated, 1 when any failed (problems are printed and nothing is written for that file), and 2 for usage errors.

## Who reads it (14.0)

| Consumer | Scene v2 | v1 documents |
|---|---|---|
| `<usa-player>` / `createPlayer()` | native: layers → tracks (token references resolved, muted / solo honoured, `random()` with the seed) | timeline v1: auto-migrated; animation JSON v1 with `format` / `version`: as before. Playground state and unversioned JSON: removed, `installCompatV13()` from `motionary/compat-v13` reads them |
| Timeline editor (`motionary/components/timeline-editor`) | `timelineDocToScene(doc)` writes v2 losslessly; `timelineDocFromScene(scene)` opens v2 with a `lost` list; `loadMotionDoc(any)` opens any motion document | editor documents are timeline v1 internally (a subset of v2) |
| Motion Engine v2 (`motionary/motion`) | `playScene(root, scene)` returns the standard controller (play / pause / seek / reverse / finished / cancel) | timeline v1 and animation JSON v1 too |

## Round trips (tested on golden fixtures in `test/fixtures/scene-v2/`)

- timeline v1 → v2 → timeline v1: equal to `parseTimelineDoc(input)`, with nothing lost.
- animation v1 → v2 → animation v1: every track's target, start, duration, keyframes (offsets, easings, composite), preset, effect, options, label and easing kept; `loop` / `duration` / `name` kept.
- playground → v2: one preset layer per track; plays the same tracks.
- Migrating a v2 document again is a no-op.
