# Motion Studio 2.0: `motionary/studio/app` (15.0)

> **Experimental** — may change in a minor release; not covered by the stability promise ([stability.md](./stability.md)).

`motionary/studio/app` (= `motionary/components/studio-app`) puts the 14.x Studio parts together into one authoring
loop you can drop into a page:

**new → edit (timeline + canvas) → preview → save → reopen → export**

| Step | What does it | Since |
| --- | --- | --- |
| Edit | the Studio timeline + inspector ([studio.md](./studio.md)) and the canvas on your stage ([studio-canvas.md](./studio-canvas.md)), one undo history | 14.3 / 14.4 |
| Preview | the Studio playhead samples the document on your stage (`sampleTimelineDoc`: same time → same frame) | 13.6 / 14.4 |
| Save / reopen | a Studio project (Scene Format v2 + editor state) through a storage adapter | 15.0 |
| Packs and assets | 14.5 packs open with their files; missing assets are listed with relink suggestions ([studio-assets.md](./studio-assets.md)) | 14.5 |
| Export | the 14.7 standalone export: HTML / CSS (+ a tiny player) or one inline file, offline ([studio-export.md](./studio-export.md)) | 14.7 |
| AI (optional) | the 14.6 assistant; every proposal is reviewed op by op before it is written ([studio-ai.md](./studio-ai.md)) | 14.6 |

It is an opt-in entry with its own gzip budget, not part of `components/lite`, `motionary/core` or `motionary/studio`,
and it has no runtime dependencies. Export, assets and AI are loaded with a dynamic `import()` the first time you use
them, so opening the app costs the Studio only.

## Quick start

```html
<div id="app"></div>
<div id="stage" style="position: relative; width: 640px; height: 360px">
  <h2 id="title" style="position: absolute; left: 40px; top: 40px">Hello</h2>
</div>
```

```js
import { createStudioApp, createLocalStorage } from 'motionary/studio/app';

const app = await createStudioApp(document.getElementById('app'), {
  stage: document.getElementById('stage'),
  storage: createLocalStorage(), // default: in memory (createMemoryStorage())
  name: 'promo',                 // the storage key
  fps: 60,
});

await app.save();                // → storage 'promo'
await app.reopen();              // ← storage 'promo'
const out = await app.exportStandalone({ inline: true }); // { files: Map, report: { ok, digest, … } }
```

The app adds a toolbar above the Studio: **New**, **Open…** (a file picker for `.json` projects, Scene v2, timeline v1,
animation JSON or a 14.5 pack), **Save**, **Reopen**, **Export** (one inline HTML file, offered as a download link),
**Undo**, **Redo**, plus a polite status line (`role="status"`). Every button is a real `<button>` with `data-app="…"`.

## API

`createStudioApp(root, options) → Promise<StudioApp>`

Options: everything `createStudio` takes except `history` (`stage`, `canvas`, `fps`, `zoom`, `rowHeight`, `length`,
`snap`, `label`), plus `name` (default `"untitled"`), `storage` (`{ read(name), write(name, text) }`, sync or async),
`assets` (project-relative path → bytes), `ai` (`{ provider, … }` for the 14.6 panel) and `onStatus(message)`.

| Member | |
| --- | --- |
| `el`, `studio`, `history`, `name` | the app's element, the Studio, its undo history, the project name |
| `dirty` | the scene differs from the last save / open (playhead, zoom and selection do not count) |
| `newProject(name?)` | an empty document, history cleared |
| `open(input, { assets?, name? })` | `{ ok, error?, lost, missing, relink }`; on `ok: false` the current project is unchanged |
| `save()` | writes the project text to storage and returns it |
| `reopen(name?)` | opens what storage holds |
| `savePack()` | `{ text, missing }`: the project as a 14.5 pack with the available assets |
| `exportStandalone(options?)` | the 14.7 export of the current project (the app's assets, the app's fps) |
| `digest()` | `frameDigest` (14.7) of the current project: equal before save and after reopen |
| `destroy()` | removes the app and the Studio |

`createMemoryStorage()` and `createLocalStorage(prefix = 'motionary-studio:')` are the two built-in storages. Your own
storage can be anything with `read` / `write`, for example a fetch to your backend; Motionary ships no server.

## Guarantees (tested)

- Save → reopen in a fresh app gives the same project text and the same `frameDigest` (unit + Chromium / Firefox / WebKit).
- The exported file, opened in a sandboxed iframe with no network, shows the preview's value at the same frame (browser spec).
- A truncated or corrupted file is reported in the status line and the current project is kept.
- On a phone viewport the toolbar wraps inside the screen and taps save / reopen (mobile spec).

## Size

`motionary/components/studio-app` has its own budget line (see `size-budget.json`): the app UI plus the Studio it opens
with. Export, assets and AI load on first use and are measured in their own lines. No existing line changed.
