# Scene Format v3

> **Stable (16.0).** Scene v3 is the format the Studio (`exportScene()`), `motionary migrate` and motionary-mcp write.
> `motionary/scene/v3` validates, migrates and reads it back as v2 (`motionary/scene/v3-preview`, the 15.9 name, is an
> alias until 17.0). The player and the timeline editor open flat v3 directly; the Studio opens any v3 (compositions and
> component instances through `sceneV3ToV2`, losses reported). JSON Schema: [`scripts/scene-v3.schema.json`](../scripts/scene-v3.schema.json). Changes it brings:
> [deprecations-v16.md](./deprecations-v16.md).

## Why a new version

Scene v2 ([scene-v2.md](./scene-v2.md)) is a flat list of `track` / `group` layers. Three things the Studio needs for
16.x cannot be expressed in it without loss:

1. **Nested compositions** — a block of layers with its own clock (start, clip, playback rate) placed in a parent scene.
2. **Components as layers** — one definition instantiated several times with overrides (the basis for 16.1 symbols).
3. **Breakpoint variants as format** — 15.3 kept them in `meta["motionary:variants"]`, which validators cannot check.

## The document

```json
{
  "format": "motionary-scene",
  "version": 3,
  "name": "Launch",
  "components": {
    "card": { "name": "Card", "layers": [
      { "id": "face", "type": "track", "target": ".face", "keyframes": [
        { "id": "f0", "time": 0, "props": { "opacity": 0 } }, { "id": "f1", "time": 300, "props": { "opacity": 1 } } ] }
    ] }
  },
  "layers": [
    { "id": "intro", "type": "comp", "start": 100, "timeRemap": { "offset": 0, "rate": 1 }, "layers": [
      { "id": "title", "type": "track", "target": "#t", "keyframes": [
        { "id": "a", "time": 0, "props": { "opacity": 0 } }, { "id": "b", "time": 200, "props": { "opacity": 1 } } ] }
    ] },
    { "id": "card1", "type": "component", "ref": "card", "start": 50, "target": "#card1", "overrides": { "face": { "muted": true } } }
  ],
  "variants": [{ "id": "phone", "media": { "maxWidth": 600 }, "layers": { "intro": { "muted": true } } }]
}
```

Everything Scene v2 has stays: `name`, `duration`, `loop`, `seed`, `tokens`, `source`, `meta`, and `track` / `group`
layers with exactly the v2 rules (keyframes, presets, effects, component bindings, token references).

### `"comp"` layers

`{ id, type: "comp", layers: [...], start?, duration?, timeRemap?: { offset?, rate? }, name?, parent?, locked?, muted?, solo? }`

- `layers` is a full layer list (tracks, groups, comps, component instances); keyframe times inside are **content time**.
- Content time `t` plays at `start + (t - offset) / rate` in the parent (`offset` ≥ 0 ms, `0 < rate ≤ 16`).
- `duration` clips the composition (16.0 player; `sceneV3ToV2` reports it as not applied).
- Compositions nest up to 8 levels. Layer ids are unique across the whole tree.

### `"component"` layers and `components`

`{ id, type: "component", ref, target?, start?, overrides?: { [layerId]: { target?, muted?, props? } } }`

- `ref` names an entry of the top-level `components` map: `{ name?, layers: [...] }` (its own id scope).
- `target` scopes the definition's selectors (`#card1 .face`; `:scope` becomes the instance target).
- `overrides` change one definition layer for this instance: a new `target`, `muted`, or `props` set on every keyframe.
- A component may not instantiate itself, directly or through other components (cycles are refused).

### `variants`

The 15.3 variant entries, unchanged: `[{ id, media: { minWidth?, maxWidth? }, layers?: { [id]: { muted?, distanceScale?, timeScale? } } }]`
(`minWidth` inclusive, `maxWidth` exclusive, first match wins). Layer ids must exist in the scene.

## API (`motionary/scene/v3`; 15.9: `motionary/scene/v3-preview`)

| Export | What it does |
|---|---|
| `validateSceneV3(input)` | every problem (`[]` = valid); object or JSON text; never throws |
| `migrateToSceneV3(input, { dryRun })` | v2 (or any 13.x format `migrateToSceneV2` reads) → v3 preview: `{ ok, dryRun: true, doc, problems, report: { from, lossless, changes, lost, warnings, stats } }`; never mutates its input |
| `sceneV3ToV2(doc)` | read v3 as v2: comps → groups (start / time remap baked into keyframe times), component instances expanded (`card1/face`), variants back to meta; `lost` names each step |
| `normalizeSceneV3` / `serializeSceneV3` | canonical form / JSON text |
| `DEPRECATIONS_V16` | the 16.0 change list (ids, fix, doc anchor) |

Guarantees tested in 15.9: every Scene v2 document in the corpus (shipped templates, the 15.3 variants scene, grouped
and token scenes) migrates **losslessly** and `sceneV3ToV2(migrateToSceneV3(d).doc)` equals the canonical v2 document,
so `frameDigest` (14.7) fingerprints are identical.

## CLI

- `npx motionary doctor --v16` — Scene v2 files, variants in meta, `exportScene()` without `{ version: 2 }`, MCP 2.x shapes.
- `npx motionary migrate --to 16` — per-file report; `--write` (with `.bak` copies) comes with 16.0.

The entry is opt-in with its own size line; it is not part of lite, `motionary/components` or `motionary/scene`.
