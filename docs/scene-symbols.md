# Symbols (16.1)

A **symbol** is one motion definition used in several places. Since 16.1 Motionary edits symbols on Scene v3 with
no format change: a symbol is an entry of the top-level `components` map, an **instance** is a `type: "component"`
layer that references it ([scene-v3.md](./scene-v3.md)). Edit the master once and every instance follows; an
instance can override a layer's `target`, `muted` or `props` without touching the master.

```js
import { createSymbol, addInstance, setOverride, updateSymbol, symbolsToCss } from 'motionary/scene/symbols';

let doc = createSymbol(scene, ['card'], { id: 'card', instanceId: 'card1', target: '#card' });
doc = addInstance(doc, 'card', { id: 'card2', target: '#card2', start: 600 });
doc = setOverride(doc, 'card2', 'glow', { props: { opacity: 0.2 } });
doc = updateSymbol(doc, 'card', (layers) => layers.map((l) => (l.id === 'face' ? { ...l, name: 'Face' } : l)));
const { css, report } = symbolsToCss(doc); // one @keyframes per symbol layer, one rule per instance
```

| Function | What it does |
|---|---|
| `createSymbol(doc, layerIds, { id, name?, instanceId?, target? })` | Moves the layers (with group descendants) into `components[id]` and leaves one instance in their place. One group selected → the group becomes the instance. Keyframe times become content time (earliest = 0; the instance `start` keeps the timing); targets under `target` become relative (`#card .face` → `.face`). |
| `addInstance(doc, symbolId, { id, target?, start?, parent?, overrides? })` | Another instance at the end of the layer list. |
| `setOverride(doc, instanceId, layerId, { target?, muted?, props? })` / `clearOverride(doc, instanceId, layerId?)` | Per-instance changes of one symbol layer (`props` are set on every keyframe); merged with an existing override. |
| `updateSymbol(doc, symbolId, (layers) => layers)` | Edits the master; instances follow, overrides are kept. A symbol that would contain itself is refused. |
| `renameSymbol(doc, from, to)` | Renames the symbol and every reference. |
| `detachInstance(doc, instanceId)` | Replaces one top-level instance by plain layers (a group + `instance/layer` tracks, exactly as `sceneV3ToV2` reads them); `{ doc, lost }`. |
| `symbolUsage(doc)` | `{ [symbolId]: { instances, overrides } }`. |
| `validateSymbols(doc)` | Unknown symbols, override keys naming no symbol layer, cycles, unused symbols (`validateSceneV3` still checks the document itself). |
| `symbolsToCss(doc, { prefix? })` | CSS: one `@keyframes <prefix>-<symbol>-<layer>` per symbol track however many instances use it; each instance adds one `animation` rule per layer (selector, duration, delay). An instance with `props` overrides gets its own block (`…--<instance>`); muted layers are skipped; plain top-level tracks export as `<prefix>-<layer>`. Compositions and symbols inside symbols are listed in `report.lost` (export those through `sceneV3ToV2` and `motionary/studio/native`). |

Every function is pure: the input is never changed and the result is a new document — apply it through the timeline
/ Studio history as one undo step. The entry is opt-in with its own size line (4 KB gzip); it is not part of lite,
`motionary/scene` or the Studio entries.
