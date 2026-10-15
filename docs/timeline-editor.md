# Timeline editor model (13.6)

> **Experimental** — may change in a minor release; not covered by the stability promise ([stability.md](./stability.md)).

`motionary/components/timeline-editor` is the editing model behind a timeline UI such as the Timeline Playground:
a versioned document format, layer and keyframe operations, undo / redo, and a reproducible preview. It is
editor-only: nothing in `motionary`, `motionary/core`, `motionary/components/lite` or `motionary/components/timeline`
imports it, so it adds nothing to those bundles. Zero dependencies; DOM-free except `createTimelinePreview` and
`bindHistoryKeys`.

```js
import {
  parseTimelineDoc, serializeTimelineDoc, createTimelineHistory, bindHistoryKeys,
  groupLayers, updateLayers, shiftKeyframes, scaleKeyframes, setKeyframeEasing, copyKeyframes, pasteKeyframes,
  createTimelinePreview, timelineDocToAnimation,
} from 'motionary/components/timeline-editor';

const history = createTimelineHistory(parseTimelineDoc(savedText));   // throws TimelineDocError on bad input
const preview = createTimelinePreview(document.querySelector('#stage'), history.doc);
history.subscribe((doc) => preview.setDoc(doc));
bindHistoryKeys(document, history);                                    // ⌘/Ctrl+Z, ⇧⌘/Ctrl+Shift+Z, Ctrl+Y

// one undo step per drag
history.begin('Move keyframes');
onDrag((dt) => history.apply((d) => shiftKeyframes(d, selection, dt)));
onDrop(() => history.commit());

preview.seek(750);                                                     // same time → same frame, always
save(serializeTimelineDoc(history.doc));                               // canonical, lossless
player.animation = timelineDocToAnimation(history.doc);                // play it in <usa-player>
```

## The document: `motionary-timeline` v1

```json
{
  "format": "motionary-timeline",
  "version": 1,
  "name": "Hero",
  "duration": 1500,
  "seed": 42,
  "layers": [
    { "id": "hero", "type": "group", "name": "Hero", "locked": true },
    { "id": "title", "type": "track", "parent": "hero", "target": ".title", "keyframes": [
      { "id": "k1", "time": 0, "props": { "opacity": 0, "transform": "translateY(24px)" }, "easing": "ease-out" },
      { "id": "k2", "time": 600, "props": { "opacity": 1, "transform": "translateY(0px)" } }
    ] },
    { "id": "spark", "type": "track", "target": ".spark", "solo": true, "keyframes": [
      { "id": "k3", "time": 200, "props": { "--x": "random(0, 100)" } }
    ] }
  ],
  "meta": { "editor": { "zoom": 1.5 } }
}
```

| Field | Meaning |
|---|---|
| `layers` | Top to bottom. A `group` has children (layers whose `parent` is its id); a `track` has a `target` selector (inside the preview root; `:scope` = the root) and `keyframes`. |
| `locked` | Editing operations leave the layer (and everything in a locked group) unchanged. Mute / solo still work. |
| `muted` / `solo` | Playback: a muted layer or group is left out; when any layer is solo, only solo layers (and their children) play. Applied by the preview and by `timelineDocToAnimation`. |
| `keyframes[].props` | CSS property → value (`opacity`, `transform`, `backgroundColor`, `--custom`). Numbers for unitless properties, strings otherwise. `random(a, b)` inside a value is resolved from `seed`. |
| `keyframes[].easing` | Easing of the segment to the next keyframe: `linear` (default), `ease`, `ease-in-out`, `cubic-bezier(…)`, `steps(n, end)`, or a named ease (`cubic-out`, `back-out`, …). |
| `meta` | Any JSON (editor state, authoring info). Kept verbatim. |

- **Validation** — `validateTimelineDoc(value)` returns every problem with its path (`layers[2].keyframes[0].easing`)
  and never throws. `parseTimelineDoc(textOrObject)` throws a `TimelineDocError` (`.problems`) for: invalid JSON,
  text over 5 MB, another format, a newer version ("needs a newer motionary"), unknown keys, duplicate layer or
  keyframe ids, a parent that is missing / not a group / a cycle, keyframes on a group, non-finite or negative times,
  unknown easings, invalid property names (`__proto__`, `color;background:…`), non-scalar values, and limits (1000
  layers, 100 000 keyframes, 64 props per keyframe, 32 levels of `meta`). Input is only read, never evaluated.
- **Canonical, lossless round trip** — `serializeTimelineDoc(doc)` writes fixed key order, keyframes sorted by time
  (stable for equal times), sorted property names, and omits defaults (`linear`, `false` flags). Parsing that text
  gives a deep-equal document, and serializing it again gives the same text. Layers, groups, flags, ids, easing,
  seed and `meta` all survive.
- **Schema** — `TIMELINE_DOC_SCHEMA` (also [timeline-doc.schema.json](./timeline-doc.schema.json), JSON Schema
  2020-12) for editors. The validator is the authority: it also checks cross-references (ids, parents, cycles,
  easings) that a schema cannot.
- **`<usa-player>`** — `timelineDocToAnimation(doc)` exports the playing tracks as `use-scroll-animate/animation` v1
  (lossy by design: groups, locks and ids are editor state). `timelineDocFromAnimation(json)` imports keyframe and
  preset tracks (effect tracks have no keyframes and are listed in `skipped`).
- Golden fixtures: `test/fixtures/timeline/valid/*.json` with their canonical text (`*.golden.json`) and sampled
  frames (`*.frames.json`); `test/fixtures/timeline/invalid/*.json` must all be rejected.

## Layers

`addLayer`, `removeLayers` (a group takes its children), `updateLayers(doc, ids, { name, locked, muted, solo, target })`,
`groupLayers(doc, ids, { name })` → `{ doc, id }`, `ungroupLayer`, `moveLayer(doc, id, index, { parent })` (reorder
among siblings, or into / out of a group; a group moves with its children), `isLayerActive`, `isLayerLocked`.

## Keyframe batch editing

A selection is an array of keyframe ids (across layers). `shiftKeyframes(doc, ids, dt)` keeps spacing and stops at 0;
`scaleKeyframes(doc, ids, factor, pivot?)` (pivot defaults to the earliest selected keyframe);
`setKeyframeEasing(doc, ids, easing)`; `removeKeyframes`; `setKeyframeProps`; `addKeyframe`;
`copyKeyframes(doc, ids)` → a clip with relative times, `pasteKeyframes(doc, clip, { at, layer? })` → `{ doc, ids }`
(fresh, deterministic ids). Keyframes in locked layers are skipped; `editableKeyframes(doc, ids)` tells which remain.

Every operation is pure and returns a new document (or the same one when nothing changed). Unchanged layers are
shared between versions, so keeping snapshots is cheap.

## Undo / redo

`createTimelineHistory(doc, { limit = 100, coalesceMs = 1000, now })`:

- `apply(docOrFn, { label, coalesce })` — a no-op change adds no step; steps with the same `coalesce` key within
  `coalesceMs` merge (typing, nudging with arrow keys);
- `begin(label)` … `commit()` / `cancel()` — a gesture (drag, scale handle) becomes one step; `cancel()` restores;
- `undo()`, `redo()`, `canUndo`, `canRedo`, `undoLabel`, `redoLabel`, `size`, `reset(doc)`, `subscribe(fn)`;
- bounded: the oldest steps are dropped beyond `limit`.

`bindHistoryKeys(target, history)` maps ⌘/Ctrl+Z → undo, ⇧⌘/Ctrl+Shift+Z and Ctrl+Y → redo, and ignores keys typed
in inputs, textareas, selects and contenteditable (their own undo wins). `historyKeyAction(event)` exposes the mapping.

## Reproducible preview

- `sampleTimelineDoc(doc, t)` → `{ time, layers: { [trackId]: { prop: value } } }` is a pure function of the document
  and the time: scrubbing back and forth, jumping or playing never changes what time t looks like. Numbers, strings
  with matching shapes (`translateX(10px) scale(1)`), `rgb()` and `#hex` colours interpolate; other values switch at
  the midpoint (like CSS discrete animation). Values are rounded to 4 decimals.
- `random(a, b)` depends only on `seed`, the layer, the keyframe and the property — never on call order.
  `createSeededRandom(seed)` is the PRNG (mulberry32) for your own tools.
- `createFixedClock({ step = 1000 / 60 })` moves only in whole steps (frame n is always at n × step), for tests and
  frame-exact exports.
- `createTimelinePreview(root, doc, { clock })` writes the frame to inline styles: each `seek(t)` writes the full
  state and removes properties that are no longer animated (a muted layer is cleared), `advance(n)` steps the fixed
  clock, `play()` / `pause()` use `requestAnimationFrame`, `setDoc(doc)` re-renders after an edit or undo,
  `destroy()` removes every style it wrote.

Tests: `test/timeline-editor-13-6.test.ts` (unit, golden fixtures, malformed input) and
`test/browser/timeline-editor.spec.mjs` (same time → same DOM state in Chromium, Firefox and WebKit; same pixels in
Chromium after stepping, jumping, scrubbing backwards and reloading; seeded random across reloads; undo / redo).

Not in 13.6: the playground UI itself (layer panel, multi-select marquee, curve editor) — planned for the Motion
Studio work in 14.4, which builds on this model.
