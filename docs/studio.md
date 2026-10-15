# Motion Studio 1.0 (14.4)

> **Experimental** — may change in a minor release; not covered by the stability promise ([stability.md](./stability.md)).

`motionary/studio` (= `motionary/components/studio`) is Motion Studio 1.0: a timeline you build animations in without
touching JSON. You add tracks and track groups, scrub a playhead, drag keyframes, draw easing curves, type values at
the current time and step through the result frame by frame. Then you save it as Scene Format v2 and open it again.

It is an opt-in entry with its own 25 KB gzip budget. It is not part of `components/lite`, `motionary/core` or
`motionary/motion`, and it has no runtime dependencies.

The Studio is built from existing parts and reimplements none of them:

| Part | Comes from |
| --- | --- |
| Document, edits, undo / redo | the [timeline editor model](./timeline-editor.md) (13.6): `addLayer`, `shiftKeyframes`, `addKeyframe`, `setKeyframeProps`, `setKeyframeEasing`, `copyKeyframes` / `pasteKeyframes`, `createTimelineHistory` |
| Preview and seeking | the editor model's `createTimelinePreview` and `sampleTimelineDoc` (same time → same frame) |
| Save / load | the editor model's Scene Format v2 mapping (`timelineDocToScene`, `loadMotionDoc`) |
| Canvas (select, move, resize, rotate) | [`motionary/studio/canvas`](./studio-canvas.md) (14.3), created on your stage |

## Why 25 KB

The budget line measures everything the entry pulls in, not only the new code. About 10 KB of it is the 14.3 canvas
and about 6 KB is the editor model (document validation, operations, preview, Scene v2 mapping, easing parser). The
Studio's own UI (timeline grid, keyframe gestures, curve editor, inspector, save / load) is the remaining 7–8 KB. The
parts are shared through the module graph, so a page that also imports `motionary/studio/canvas` or
`motionary/components/timeline-editor` loads them once. No existing budget was raised for it.

## Quick start

```html
<div id="studio"></div>
<div id="stage" style="position: relative; width: 640px; height: 360px">
  <h2 id="title" style="position: absolute; left: 40px; top: 40px">Hello</h2>
  <img id="hero" src="hero.png" style="position: absolute; left: 300px; top: 120px; width: 240px">
</div>
```

```js
import { createTimelineDoc, createTimelineHistory } from 'motionary/components/timeline-editor';
import { createStudio } from 'motionary/studio';

const history = createTimelineHistory(createTimelineDoc({ name: 'promo' }));
const studio = createStudio(document.getElementById('studio'), {
  history,
  stage: document.getElementById('stage'), // previewed frame by frame and edited by the canvas
  fps: 60,
  zoom: 200, // px per second
});

// Save: a Studio project (Scene v2 + editor state) — or studio.exportScene() for the bare Scene v2 document
localStorage.setItem('promo', studio.save());
// Open again (also accepts Scene v2, timeline v1 and the player's animation JSON)
studio.load(localStorage.getItem('promo'));
```

Options: `history` (required), `stage`, `canvas` (`false` to leave the canvas out, or canvas options such as
`measure`, `snap`, `grid`, `guides`), `fps` (60), `zoom` (100 px/s), `rowHeight` (24, 32 on coarse pointers), `length`
(the shortest scrubbable length, 2000 ms, so an empty document has room), `snap` (true), `label` ("Timeline").

## The timeline

- **Tracks and track groups.** "+ Track" adds a track (name and target selector from the toolbar fields), "+ Group" a
  group. A new layer goes into the focused group. Each row has **collapse** (groups; this is editor state, saved with
  the project but not part of the scene), **mute** (`muted`: left out of the preview and export) and **lock**
  (`locked`: a locked group locks everything inside it).
- **Time ruler and playhead.** Press or drag on the ruler to scrub; the playhead always lands on a frame. The playhead
  is a `slider` (Arrow keys: one frame, Page Up / Down: ten, Home / End).
- **Zoom.** The toolbar buttons, Ctrl / ⌘ + wheel over the timeline, `-` / `=` on the grid, or `setZoom(pxPerSecond)`.

## Keyframes

- **Drag** a key to move it. Every key in the selection moves with it, as one undo step.
- **Snapping:** a dragged key snaps to another key or to the playhead when it is within 6 px, otherwise to the nearest
  frame. Hold **Alt** to move freely.
- **Select:** click a key. Shift / Ctrl / ⌘ + click toggles it. Drag a **marquee** from empty track space across rows
  (Shift adds to the selection). A click on empty track space clears the selection.
- **Copy / paste:** Ctrl / ⌘ + C copies the selection, Ctrl / ⌘ + V pastes it at the playhead (onto the tracks it came
  from) and selects the pasted keys. Delete / Backspace removes the selection. Ctrl / ⌘ + A selects every key.

## Curve editor

The easing of a key shapes the segment from that key to the next one. With keys selected, the curve editor shows the
first one's curve:

- Drag the two **cubic-bezier** handles (x stays in 0…1, y may overshoot). One drag is one undo step. The handles are
  sliders too: Arrow keys move them by 0.01 (Shift: 0.1).
- Pick a **preset**: `linear`, `ease`, `ease-in`, `ease-out`, `ease-in-out`, `smooth`, `snappy`, `anticipate`,
  `overshoot` (`CURVE_PRESETS`).
- Enter **spring** parameters (stiffness, damping, mass) and press "Spring". The timeline stores a `cubic-bezier()`
  per key, so the spring is fitted to the closest cubic curve (`springBezier`): an underdamped spring keeps its first
  overshoot and loses later wobbles, a spring that never overshoots gets a curve that never does. The parameters are
  kept in the project file (`studio.springs`) so the editor shows them again; when the key's easing changes later, they
  are dropped.

## Property inspector

Focus a track (click its name, or select one of its keys, or select its layer on the canvas). The inspector lists its
values **at the playhead** (interpolated between keys):

- Typing a value **changes the key at the playhead**, or **adds a key** there when there is none.
- The ◆ / ◇ button next to a value removes that property from the key at the playhead, or keys the current value. A
  key whose last property is removed is deleted.
- "+ Key" adds a new property (name and value) at the playhead.

Numbers stay numbers (`0.5`); anything else is stored as written (`10px 0px`, `rgb(…)`).

## Preview

The Studio previews on `stage` with the editor model's `createTimelinePreview`: every seek writes the complete frame
state, so the DOM at a time is the same however you got there (deterministic seek).

- **Frame by frame:** ⏮ / ⏭, `,` / `.` on the grid (Shift: ten frames), or `step(n)`.
- **Play / pause:** ▶ / ⏸ or `K`. Pausing lands on the nearest frame.
- `sampleFrames(doc, { fps })` returns every frame of a document. It is the reference the tests use for "the same
  animation" after saving and reopening.

## Undo / redo

Every edit goes through your `createTimelineHistory`: a drag (keys, curve handles, or on the canvas) is one step, and
so is every inspector change, nudge, paste, delete, mute or lock. Selecting, collapsing, zooming and scrubbing are not
edits. Ctrl / ⌘ + Z undoes, Ctrl / ⌘ + Shift + Z or Ctrl + Y redoes; a shortcut another handler already took (for
example the canvas inside the Studio) is not applied twice.

## Save and load

```js
import { serializeStudioProject, parseStudioProject, sampleFrames } from 'motionary/studio';

const text = serializeStudioProject(history.doc, { time: 500, zoom: 200, fps: 60, collapsed: ['g1'] });
const { doc, ui, lost } = parseStudioProject(text); // also takes Scene v2, timeline v1, animation JSON
```

A project file is `{ "format": "motionary-studio", "version": 1, "scene": <Scene Format v2>, "studio": { … } }`.

- `scene` is `timelineDocToScene(doc)`: lossless, so reopening gives back the same document and the same frames.
- `studio` is editor state: `time`, `zoom`, `fps`, `collapsed`, `springs`. On load it is checked against the
  document: unknown ids, numbers out of range and springs whose key easing changed are dropped.
- `parseStudioProject` checks size (5 MB of text) and shape before it maps anything, never evaluates input, and throws
  `TimelineDocError` for malformed or hostile input (for example `__proto__` ids). `lost` lists what a Scene v2
  document had that the editor cannot hold (preset / effect layers, `loop`, tokens …).
- `studio.save()`, `studio.exportScene()` and `studio.load(input)` do the same for a running Studio; `load` resets the
  history.

## Keyboard

The timeline is a `role="grid"` (`aria-multiselectable`). Each layer is a `row` (with `aria-level`, and
`aria-expanded` on groups) holding a `rowheader` (name, collapse, mute, lock) and a `gridcell` with the keys. Keys are
buttons with `aria-pressed` for the selected state and a label like "Title: opacity at 0.500 s". One element in the
rows is in the tab order at a time (roving `tabindex`); the playhead slider is a separate tab stop.

| Key | Does |
| --- | --- |
| ← / → | previous / next key in the row (← from the first key: the row header) |
| ↑ / ↓ | the row above / below (the key nearest in time) |
| Home / End | the row header / the last key |
| Enter / Space | select the focused key (Shift: toggle); on a group header: collapse / expand |
| Alt + ← / → | nudge the selection one frame (Shift: ten) |
| Delete / Backspace | delete the selected keys |
| Ctrl / ⌘ + A, C, V | select all, copy, paste at the playhead |
| `,` / `.` | previous / next frame (Shift: ten) |
| K | play / pause |
| M / L | mute / lock the focused row |
| `-` / `=` | zoom out / in |
| Ctrl / ⌘ + Z, Shift + Z, Ctrl + Y | undo / redo |

A polite live region announces selections and edits.

## Touch and pointers

Pointer Events throughout, with pointer capture on the Studio container, and `touch-action: none` on the ruler, the
key cells and the curve, so a finger drags keys, scrubs the ruler and draws the marquee without scrolling the page.
Keys and curve handles are bigger on coarse pointers. This is basic touch support: there is no pinch-zoom on the
timeline (use the zoom buttons); the canvas has its own pinch-zoom.

## No uncontrolled global listeners

Nothing listens on `window` or `document`. The Studio listens on its own container (and the timeline for Ctrl + wheel),
adds the move / up / cancel listeners when a gesture starts and removes them when it ends. `destroy()` ends a running
gesture, unsubscribes from the history, removes the Studio's DOM, clears the preview's inline styles and destroys the
canvas, which restores the stage.

## API

`createStudio(root, options)` returns:

- state: `el`, `canvas`, `time`, `zoom`, `fps`, `playing`, `selection`, `focusedLayer`, `collapsed`
- playback: `setTime(ms)`, `step(n)`, `play()`, `pause()`, `setZoom(pxPerSecond)`
- selection: `selectKeys(ids, { add, toggle })`, `selectAllKeys()`, `clearSelection()`, `focusLayer(id)`
- edits: `moveKeys(dt, ids?)`, `copy()`, `paste(at?)`, `deleteKeys(ids?)`, `addTrack({ name, target, parent })`,
  `addGroup({ name, parent })`, `collapse(id, collapsed)`, `mute(ids, muted)`, `lock(ids, locked)`,
  `setValue(layer, prop, value)`, `removeKey(layer, prop?)`, `valuesAt(layer)`, `setEasing(easing, ids?)`,
  `setBezier([x1, y1, x2, y2], ids?)`, `setSpring({ stiffness, damping, mass }, ids?)`
- files: `frames()`, `save()`, `exportScene()`, `load(input)`
- `undo()`, `redo()`, `destroy()`

Pure helpers: `parseBezier`, `bezierEasing`, `springBezier`, `springParams`, `CURVE_PRESETS`, `frameTime`,
`sampleFrames`, `serializeStudioProject`, `parseStudioProject`, `cleanUiState`, `STUDIO_PROJECT_FORMAT`.

## Real-device checklist

The automated suites run the Studio in jsdom and in Chromium, Firefox and WebKit with mouse, keyboard and emulated
touch. They do not drive real fingers on real screens or real screen readers, so check these by hand on real devices
before calling a release done. No real devices were available when 14.4.0 was built, so the first person with the
hardware should run through this list.

Devices: **iOS Safari** (an iPhone, plus an iPad with and without a trackpad), **Android Chrome** (a phone), a Windows
or ChromeOS touch laptop with a pen, and a Mac with a trackpad.

1. Open a page with a Studio, a stage with three elements, and an empty document.
2. Add a group and two tracks into it, and one top-level track, using only the toolbar.
3. **Scrub** the ruler with one finger: the playhead follows, lands on frames, and the page does not scroll.
4. Add keys from the inspector at three different times; check the stage shows the values while scrubbing.
5. **Drag** a key with one finger: it snaps to frames and to a key on another row; the page does not scroll.
6. **Marquee** with one finger across two rows: the keys inside are selected. Drag one of them: all move together.
7. **Curve:** drag both handles with a finger and with a pen; pick a preset; apply a spring.
8. **Undo / redo** from the toolbar and from a hardware keyboard: each gesture is exactly one step.
9. **Play / pause** and frame-step: playback is smooth, pausing lands on a frame.
10. Select a layer on the **canvas** and move it: a key appears at the playhead in the timeline.
11. **Save**, reload the page, **load**: the timeline, the collapsed groups and the frames are the same.
12. **Rotate the phone** during a key drag: the gesture ends cleanly (`pointercancel`), nothing is half-applied.
13. **Screen readers:** VoiceOver (iOS / macOS) and TalkBack (Android) announce the timeline as a grid, rows with
    their level and expanded state, keys with their label and pressed state, and the live region after an edit.
14. Call `destroy()`: the page scrolls by touch again and nothing is left on the stage.

Record the device, OS, browser version and the result of each step in the release notes.
