# Project & asset workflow (`motionary/studio/assets`) — 14.5

> **Experimental** — may change in a minor release; not covered by the stability promise ([stability.md](./stability.md)).

A Motion Studio project refers to images, SVGs, fonts, video clips and audio by **project-relative paths** inside
keyframe values. `motionary/studio/assets` (also `motionary/components/studio-assets`) finds those references,
keeps them confined to the project directory, packs a project and its files into **one offline file**, and tells you
exactly what is missing — and where it probably went — after a project is opened on another device.

It is an opt-in entry with its own size budget: it is not part of `lite`, `core`, `motion` or `motionary/studio`.
It is pure: no DOM, no network, no file system. You pass bytes and file lists in and get bytes and reports out, so it
works the same in a browser, a worker, Node, Deno or a desktop shell.

```js
import { collectAssetRefs, checkAssets, relinkAssets, packStudioProject, unpackStudioProject } from 'motionary/studio/assets';
```

## What counts as an asset reference

- `url(...)` in any string value — `background-image: url("img/sky.png")`, `mask-image: url(svg/mask.svg)`.
- The whole value of a property whose name ends in `src`: `--src`, `--font-src`, `--video-src`, `--audio-src`.

`https:` and `data:` references are **external**: they are listed, never resolved and never packed. `http:`,
`file:`, `javascript:` and every other scheme are rejected.

Kinds come from the extension (`assetKind`): `image`, `svg`, `font`, `video`, `audio`, `data`, `other` — and `script`
for `.js` / `.mjs` / `.cjs` / `.html` / `.wasm` / shell files.

## Paths are confined to the project directory

`normalizeAssetPath(path)` returns a project-relative POSIX path: `./` and inner `..` are resolved, `//` is collapsed
and Windows `\` separators become `/` (so a project made on Windows opens on macOS / Linux). It throws an
`AssetPathError` with a `reason` for anything unsafe:

| reason | example |
| --- | --- |
| `outside` | `../secret.png`, `img/../../x.png`, `img/%2e%2e/%2e%2e/x.png` |
| `absolute` | `/etc/passwd`, `C:\a.png`, `\\host\share\a.png` |
| `scheme` | `file:///…`, `javascript:…`, `http://…` |
| `control` / `encoding` / `empty` / `directory` / `length` / `forbidden` | NUL or newlines, a bad `%` escape, `''`, `img/`, over 1024 characters, `__proto__` |

Percent escapes are decoded once before the checks, so encoded traversal is caught. `resolveAssetPath(ref, from)`
resolves a reference relative to the project file that holds it (`resolveAssetPath('../img/a.png', 'scenes/intro.json')`
→ `img/a.png`) with the same confinement.

## Manifest and missing-asset report

```js
const manifest = createAssetManifest(doc, files);   // [{ path, kind, bytes, crc32 }] sorted by path
const report = checkAssets(manifest, availablePaths); // or checkAssets(doc, files)
report.ok;        // false when anything is missing, changed or rejected
report.missing;   // entries not found on this device
report.changed;   // found, but size / CRC-32 differ from the manifest
report.rejected;  // unsafe references (with layer / keyframe / prop)
report.messages;  // one readable line per problem
```

`available` can be a list of paths, a `{ path: Uint8Array }` record, a `Map` or a `(path) => boolean` function.

## Relinking after a move

`relinkAssets(manifest, files)` suggests a new location for each missing asset: **by content** (same size and CRC-32)
when exactly one file matches, otherwise **by name** when exactly one file of the same kind has that file name.
Ambiguous matches get no suggestion — you choose. Scripts and unsafe paths are never suggested. Suggestions are only
suggestions: nothing is rewritten until you apply them.

## Offline project pack

```js
const { text, missing, skipped } = packStudioProject(projectText, files); // one JSON file, deterministic
const { project, files: restored, problems } = unpackStudioProject(text);
```

A pack is `{ format: 'motionary-studio-pack', version: 1, project, files: [{ path, kind, bytes, crc32, data }] }`
with base64 data. Only assets the document references are packed; external URLs stay references; files that are not
there are listed in `missing`. Unpacking checks the project like `parseStudioProject` and every entry's path, size,
CRC-32 and base64; a bad entry is listed in `problems` and left out without failing the rest. Limits: 2000 assets,
50 MB per file, 200 MB per pack.

## Nothing is executed

Projects and packs are data and are never executed. Script-like files are reported (`skipped` / `problems` with reason `script`) and are
never packed, unpacked, returned or suggested; nothing is evaluated, imported or fetched — there are no import scripts.

## Checklist: moving a project to another device

1. On the old device: `packStudioProject(projectText, files)`; check `missing` and `skipped` are empty.
2. Copy the one pack file to the new device.
3. On the new device: `unpackStudioProject(text)`; check `problems` is empty; write `files` into the project directory.
4. Or, without a pack: copy the project directory, then run `checkAssets(doc, files)` — `missing` lists what did not
   come along, `relinkAssets(manifest, files)` suggests where moved files went.
5. Open the project in Motion Studio and scrub: the frames are the same (`sampleFrames` is a pure function of the document).
