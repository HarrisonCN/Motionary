# Studio canvas (14.3)

> **Experimental** — may change in a minor release; not covered by the stability promise ([stability.md](./stability.md)).

`motionary/studio/canvas` (= `motionary/components/studio-canvas`) is the foundation of the Motion Studio canvas: you
point at elements to select them, drag a marquee, move, resize and rotate with a mouse, pen or finger, pinch to zoom,
snap to guides, to the other layers and to a grid, and nudge with the keyboard. It is an opt-in entry with its own
12 KB budget. It is not part of `components/lite`, `motionary/core` or `motionary/motion`, and it has no runtime
dependencies.

The canvas adds **no new document format**. It edits the [timeline editor](./timeline-editor.md) model, the
`motionary-timeline` subset of **Scene Format v2**, through the editor's own operations and its undo history:

| On the canvas | In the document |
| --- | --- |
| Position | the `translate` prop (`"Xpx Ypx"`) of the keyframe at the edit time |
| Size | the `width` / `height` props (`"Npx"`) of that keyframe |
| Rotation | the `rotate` prop (`"Ddeg"`) of that keyframe |
| Lock | the layer's `locked` flag (a locked group locks its children) |
| Hide | the layer's `muted` flag (hidden on the canvas, left out of preview and export) |
| Order | the layer order: the first layer of a group is in front |

`translate`, `rotate`, `width` and `height` are plain CSS properties, so `<usa-player>` and `playScene` animate what
the canvas writes without a conversion step.

## Quick start

```html
<div id="viewport" style="position: relative; width: 800px; height: 500px; overflow: hidden">
  <div id="stage" style="position: relative; width: 800px; height: 500px">
    <h2 id="title" style="position: absolute; left: 40px; top: 40px">Hello</h2>
    <img id="hero" src="hero.png" style="position: absolute; left: 300px; top: 120px; width: 240px">
  </div>
</div>
```

```js
import { createTimelineDoc, createTimelineHistory, timelineDocToScene } from 'motionary/components/timeline-editor';
import { createStudioCanvas } from 'motionary/studio/canvas';

const history = createTimelineHistory(createTimelineDoc({
  layers: [
    { id: 'title', type: 'track', name: 'Title', target: '#title', keyframes: [] },
    { id: 'hero', type: 'track', name: 'Hero image', target: '#hero', keyframes: [] },
  ],
}));

const canvas = createStudioCanvas(document.getElementById('viewport'), {
  history,
  stage: document.getElementById('stage'), // zoom / pan transform this element
  time: 0,                                  // the edit time in ms (the playhead)
  grid: 8,
  guides: { x: [400], y: [250] },
  onEdit: ({ label, ops }) => console.log(label, ops),
});

// save: the document is Scene Format v2
const scene = timelineDocToScene(history.doc);
```

Every layer whose `target` matches an element inside the stage becomes a canvas layer. Groups and layers whose
target is missing are skipped. Layer elements are usually absolutely positioned. The canvas measures each element's
untransformed layout box once (`offsetLeft` / `offsetTop` / `offsetWidth` / `offsetHeight` up to the stage, or your
own `measure(el)`), so call `canvas.refresh()` after a layout change.

## Options

| Option | Default | |
| --- | --- | --- |
| `history` | required | A `createTimelineHistory()`; every edit goes through it, and undo / redo re-render the canvas. |
| `time` | `0` | The edit time in ms. Geometry is read and written at this time (`setTime(ms)` changes it). |
| `stage` | the root | The element that holds the layer elements; zoom and pan transform it. |
| `grid` | `0` (off) | Grid size in canvas px (`setGrid(px)`). |
| `snap` | on | `false`, or `{ threshold: 6, guides: true, siblings: true, grid: true }`. The threshold is in screen px. |
| `guides` | none | `{ x: [...], y: [...] }` guide lines in canvas px (`setGuides()`). |
| `zoom`, `minZoom`, `maxZoom` | `1`, `0.1`, `8` | Initial zoom and its limits. |
| `measure` | offsets | `(el) => ({ x, y, width, height })`, the untransformed layout box in canvas px. |
| `label` | `"Canvas"` | The accessible name of the canvas (an existing `aria-label` / `aria-labelledby` wins). |
| `onSelect(ids)` | | Called when the selection changes. |
| `onEdit({ label, ops })` | | Called with each committed edit and its ops. |
| `onZoom(zoom)` | | Called when the zoom changes. |

The controller returns `selection`, `focused`, `zoom`, `layers()` (front first), `getBox(id)`, `select(ids, { add,
toggle })`, `selectAll()`, `clearSelection()`, `focus(id)`, `move(dx, dy, ids?)`, `setBox(id, box)`,
`reorder(id, 'forward' | 'backward' | 'front' | 'back')`, `lock(ids?, locked?)`, `hide(ids?, hidden?)`, `setTime()`,
`setZoom(zoom, origin?)`, `setGrid()`, `setGuides()`, `refresh()` and `destroy()`. The edit methods return the ops
they applied (an empty array when nothing changed).

## Editing

- **Select:** click or tap a layer. Shift, Ctrl or ⌘ adds it to the selection, or removes it if it is already
  selected.
- **Marquee:** drag from empty space. Every visible layer the marquee touches is selected (rotated layers by their
  bounds). Shift adds to the current selection. A click on empty space clears the selection.
- **Move:** drag a selected layer. The whole selection moves, except locked layers and layers in a locked group.
- **Resize:** with one layer selected, drag one of its eight handles. The opposite edge stays where it is, also when
  the layer is rotated. Shift keeps the aspect ratio.
- **Rotate:** drag the round handle above the layer. Shift snaps to 15° steps.
- **One gesture = one undo step.** A drag runs inside `history.begin()` … `commit()`, so ⌘Z / Ctrl+Z undoes the whole
  move. Escape or a `pointercancel` cancels a running gesture and restores the document. A click is not an edit.

### Snapping

While you drag, the selection's left / centre / right edges (and top / middle / bottom) snap to the nearest line
within the threshold:

- **guides** from the `guides` option,
- **siblings:** the edges and centres of the other visible layers,
- the **grid**, on an axis where no line is in reach.

The line that was hit is drawn while you drag. Hold **Alt** to move freely. Resizing snaps the moving edges in the
same way (unrotated layers only). Keyboard nudges never snap. The threshold is in screen pixels, so it stays the same
at every zoom.

### Pointer and touch

The canvas uses Pointer Events only. It sets `touch-action: none` on the root while it is active, so the browser does
not scroll or zoom the page under a finger; `destroy()` restores the original value.

- One finger moves, resizes, rotates or draws a marquee, exactly like a mouse.
- **Two fingers pinch-zoom the canvas** around their midpoint and pan with it. A move that the first finger had
  started is cancelled (no undo step) when the second finger lands.
- Ctrl / ⌘ + wheel (a trackpad pinch) zooms around the pointer. A plain wheel scrolls the page as usual.
- Handles are 22 px on coarse pointers and 12 px on fine ones, at any zoom.

### Keyboard

The canvas is a `listbox` with `aria-multiselectable="true"`. Each layer element is an `option` with
`aria-selected`, and focus moves with a roving `tabindex`, so Tab enters and leaves the canvas in one stop.

| Keys | Action |
| --- | --- |
| Arrow keys | Nudge the selection by 1 px; **Shift** + arrow: 10 px. A burst of nudges is one undo step. |
| Arrow keys with nothing selected | Move focus to the previous / next layer. |
| Alt + arrow keys | Move focus and select that layer (Alt + Shift: add it). |
| Home / End | Focus and select the first / last layer. |
| Space | Toggle the focused layer in the selection. |
| Enter | Select only the focused layer. |
| Escape | Cancel the running gesture, or clear the selection. |
| Ctrl / ⌘ + A | Select every visible layer. |
| Ctrl / ⌘ + ] / [ | Bring forward / send backward; with Shift: to the front / back. |
| Ctrl / ⌘ + Shift + L | Lock / unlock the selection. |
| Ctrl / ⌘ + Shift + H | Hide / show the selection. |
| Ctrl / ⌘ + Z, Ctrl / ⌘ + Shift + Z, Ctrl + Y | Undo / redo (`bindHistoryKeys`). |

Keys typed into inputs, text areas and contenteditable elements inside the canvas are left alone.

### Accessibility

- A layer's `name` becomes its `aria-label` when the element has no accessible label of its own.
- Locked and hidden layers say so in `aria-description`.
- A polite live region (`role="status"`) announces selections and edits, for example "Title moved to 48, 40".
- Selection outlines and handles are `aria-hidden` decorations. Everything they do is also available from the
  keyboard.

## Ops: every edit as lossless Scene v2 operations

Each edit is returned (from the edit methods and in `onEdit`) as a list of ops:

```ts
type CanvasOp =
  | { op: 'add-keyframe'; layer: string; keyframe: { id: string; time: number; props: Record<string, string> } }
  | { op: 'set-props'; layer: string; keyframe: string; props: Record<string, string> }
  | { op: 'update-layers'; ids: string[]; patch: { locked?: boolean; muted?: boolean } }
  | { op: 'move-layer'; layer: string; index: number };
```

`applyCanvasOps(scene, ops)` replays them on any Scene v2 document. Replaying an edit's ops on the scene of the
document before it gives exactly the scene of the document after it, and the tests check this for every kind of edit.
Unlike opening a full scene in the timeline editor, replaying keeps everything the ops do not name: preset, effect
and component layers, `tokens`, `loop` and keyframe `composite`. An op that does not apply (an unknown layer or
keyframe, a locked layer, a non-string value, a forbidden key such as `__proto__`) throws a `TimelineDocError`
instead of being guessed. This is the structured diff that the AI assistant (14.6) and collaborative editing will
build on.

The pure helpers are exported too:

- `readCanvasGeometry(doc, id, time)` reads a layer's translate, size and rotation at a time. The value is held from
  the last keyframe at or before that time. It returns `null` for values the canvas cannot represent (such as `10%`
  or `calc()`); those layers stay read-only rather than being rewritten.
- `canvasBox`, `canvasBounds`, `rectsIntersect`, `marqueeHits`.
- `snapLines`, `snapValue`, `snapRect`, `snapToGrid`.
- `resizeBox`, `rotationFromPointer`.
- The document operations `canvasSetBox`, `canvasMove`, `canvasSetLocked`, `canvasSetHidden` and `canvasReorder`.
  They return `{ doc, ops }`, and the same `doc` with no ops when nothing changed.

Between keyframes, the canvas shows and edits the held value; curve preview comes with the Studio timeline UI (14.4).
An edit at a time with no keyframe adds one there.

## Listeners and cleanup

The canvas never listens on `window` or `document`. On its root it keeps `pointerdown`, `keydown` and `wheel` (plus
the history keys) while it lives. `pointermove`, `pointerup` and `pointercancel` are added when a gesture starts, with
pointer capture on the root, and removed when it ends. `destroy()` ends any running gesture, removes every listener,
releases the history subscription, removes the overlay and live region, and restores every attribute and inline style
it changed. A test asserts that the listener counts return to their baseline after each gesture and after `destroy()`.

## Tests

- `test/studio-canvas-14-3.test.ts`: op mapping and lossless Scene v2 replay; snapping, hit-testing, resize and
  rotation math; and the controller (selection, marquee, drag / resize / rotate through the history, pinch, keyboard,
  listener counts, full DOM restore) in jsdom.
- `test/browser/studio-canvas.spec.mjs`, run in Chromium, Firefox and WebKit: real mouse drags, marquee, resize and
  rotate handles, snapping to a sibling, keyboard nudge, and touch pointer emulation in a 390 × 844 phone viewport
  (finger drag, pinch-zoom, `touch-action: none`), plus listener counts in a real engine.

## Real-device checklist

The automated suites emulate touch with pointer events. They do not drive real fingers on real screens, so check these
by hand on real devices before calling a release done. No real devices were available when 14.3.0 was built, so the
first person with the hardware should run through this list.

Devices: **iOS Safari** (an iPhone, plus an iPad with and without a trackpad), **Android Chrome** (a phone), a Windows
or ChromeOS touch laptop with a pen, and a Mac with a trackpad.

1. Open a page with a canvas and five absolutely positioned layers, `grid: 8`, and one guide.
2. **Tap** a layer: it is selected and its outline and handles appear. Tap empty space: the selection clears.
3. **Drag** a layer with one finger: it follows the finger without lag or offset, and the page does not scroll or
   bounce (`touch-action`). It snaps to the guide and to a sibling's edge, and the snap line shows.
4. **Marquee** with one finger from empty space across two layers: both are selected.
5. **Resize** from a corner handle with one finger: the handle is easy to hit, and the opposite corner stays put. On a
   rotated layer it behaves the same.
6. **Rotate** with the round handle. On a hardware keyboard, hold Shift: it steps by 15°.
7. **Pinch** with two fingers: the canvas zooms around the fingers and the page itself does not zoom. Start a drag
   with one finger, then add a second: the drag is cancelled and the layer jumps back, with no undo step.
8. **Undo / redo** (toolbar or keyboard): each gesture is exactly one step.
9. **Pen** (Windows / ChromeOS, Apple Pencil on iPad): it behaves like a mouse, and palm rejection does not start a
   marquee.
10. **Trackpad pinch** on a Mac (Ctrl + wheel): it zooms around the pointer. Two-finger scroll scrolls the page.
11. **Rotate the phone** during a drag: the gesture ends cleanly with `pointercancel`, and nothing is half-applied.
12. **Screen readers:** VoiceOver (iOS / macOS) and TalkBack (Android) announce the canvas as a list box, each layer
    by name and selected state, and the live region reads "… moved to x, y" after a nudge from a hardware keyboard.
13. Call `destroy()`: the page scrolls by touch again, and no outline, handle or attribute is left behind.

Record the device, OS, browser version and the result of each step in the release notes.
