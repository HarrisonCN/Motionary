# Standalone export & reproducible frames (`motionary/studio/export`) — 14.7

> **Experimental** — may change in a minor release; not covered by the stability promise ([stability.md](./stability.md)).

Turn a Studio project into a work that **plays without the editor and without a network**: an `index.html`, a
`scene.css` that animates with scripts switched off, an optional `scene.js` player, and the project's assets — or one
self-contained HTML file. The same scene always gives the same bytes, and at every frame time the exported values are
exactly what the Studio preview shows.

`motionary/studio/export` (also `motionary/components/studio-export`) is an opt-in entry with its own size budget: it is
not part of `lite`, `core`, `motion`, `motionary/studio`, `motionary/studio/assets` or `motionary/studio/ai`. Zero runtime
dependencies. The exporter is pure — it reads no DOM, fetches nothing and evaluates nothing (the player it writes is a
string) — so it runs in a browser, a worker, Node or a build script.

```js
import { exportStandalone, frameDigest, createFrameExportJob, createJsonFramesAdapter } from 'motionary/studio/export';

const { files, report } = exportStandalone(projectText, { assets: myFiles, title: 'Launch hero' });
// files: Map { 'assets/img/sky.png' → Uint8Array, 'index.html' → string, 'scene.css' → string, 'scene.js' → string }
if (!report.ok) console.warn(report.assets.missing, report.assets.rejected, report.warnings);
```

Input is anything `parseStudioProject` opens — a Studio project (object or text), a Scene v2 document, a
`motionary-timeline` v1 document, `<usa-player>` animation JSON — or `{ pack }` with a 14.5 offline project pack (its
files are used as the assets). Malformed input throws a `TimelineDocError`, like everywhere else in the Studio.

## What is exported

| File | What it is |
| --- | --- |
| `index.html` | `<main data-motionary-export>` with your stage markup, `<meta name="motionary-digest">`, the baked scene as `<script type="application/json" id="motionary-scene">` (only with the player) |
| `scene.css` | one `@keyframes mo-<n>` per active track, `linear` between baked points; `html:not(.mo-js) [data-motionary-export] <target> { animation: … both }`; `prefers-reduced-motion: reduce` shows the final frame |
| `scene.js` | the player (`PLAYER_JS`, ES5, no dependencies, under 2.4 KB): writes each frame as inline styles, exactly like the Studio preview; adds `<html class="mo-js">` so the CSS fallback steps aside |
| `assets/<path>` | every referenced local asset you passed in, at its project-relative path |

Options: `fps` (default 60), `assets` (path → bytes, the 14.5 `AssetFiles`), `inline: true` (ONE `index.html`: CSS in
`<style>`, the player inline, local assets as `data:` URIs), `js: false` (CSS only — no script at all), `title`, `lang`,
`loop`, `stage` (your markup).

**Stage.** The tracks target elements by selector (`#title`, `.card`, `:scope` = the export root). Pass your markup as
`stage`; scripts, frames / objects / embeds, `<meta>` / `<link>` / `<base>` / `<style>`, inline `on…` handlers and
`javascript:` / `vbscript:` / `data:` URLs in `href` / `src` attributes are removed (`cleanStage`; a guard for your own markup,
not a sanitizer for untrusted HTML).
Without `stage`, one element is generated per simple `#id`, `.class` or tag target.

### The player

```js
motionary.seek(300);   // ms → the frame state (pure: same time, same styles)
motionary.play(); motionary.pause();
motionary.duration; motionary.digest; motionary.time;
```

`index.html?t=300` freezes the work at 300 ms (for screenshots and recorders). Under `prefers-reduced-motion: reduce`
the player shows the final frame and does not play.

### Scripts off (CSS only)

With `js: false`, or when scripts are blocked, `scene.css` plays the same baked points as CSS animations. At frame times
the values are the same as the player's. One difference: when **two tracks target the same element**, CSS applies only
the later rule's `animation`, while the player (and the Studio) apply both. Keep targets distinct, or ship the player.

## Same scene, same frames

- **Baking.** `bakeScene(input, { fps })` turns every active track into per-property points. A linear segment between
  two values the browser interpolates component by component (opacity, transforms, colours, lengths, shadows, …) keeps
  only its end points. Every other segment — eased, discrete (`display`, mismatched strings), custom properties — is
  sampled at each frame of the frame grid (`frameTime`) with `sampleTimelineDoc`. `random()` values are resolved by the
  document's seed. Muted and non-solo layers are left out; keyframes after `duration` are cut there (the value at the cut
  is the interpolated one). Hex colours are written as `rgb()`.
- **The guarantee.** `sampleBaked(baked, t)` — what the player writes — equals `sampleTimelineDoc(doc, t)` at every frame
  time; between frames it interpolates the baked points. Tested at 24 / 30 / 60 fps in Node and in Chromium, Firefox and
  WebKit (`test/browser/studio-export.spec.mjs`: computed styles of the exported work vs. the reference, through the
  player, through paused CSS animations, from `file://` and under reduced motion).
- **Deterministic files.** The same input and options give byte-identical files (sorted, no timestamps, no random ids).
- **`frameDigest(input, { fps })`** → `mfd1-<fps>-<frames>-<crc32>`: a fingerprint of every frame. It is written into the
  export (`<meta name="motionary-digest">`, `motionary.digest`, `report.digest`), so a work can be checked against the
  project it came from.
- Limits (`EXPORT_LIMITS`): 200 000 baked points per scene, 100 000 frames, 1–240 fps. Longer eased / discrete
  stretches throw instead of writing a huge file.

## Assets

Asset references are found with the 14.5 rules (`url(…)` in any value, whole values of `*src` properties):

- a local asset you passed in → copied to `assets/<path>` (or a `data:` URI with `inline`; `*src` values use a
  percent-encoded `data:` URI so the CSS declaration stays valid);
- a local asset you did not pass in → kept as `assets/<path>` and listed in `report.assets.missing`;
- `https:` / `data:` references → kept and listed in `report.assets.external` (they need the network or are inline);
- a path that leaves the project, is absolute, has another scheme, or is a script-like file (`.js`, `.html`, `.wasm`, …)
  → replaced by `url("about:invalid")` and listed in `report.assets.rejected` with its reason.

## Safety

Exported text can never leave its CSS declaration or HTML element:

- a value with `;`, `{`, `}`, `<`, `>`, `\`, a line break, `/*`, `@import`, `expression(`, `javascript:` … is left out
  (the whole property of that track) and reported in `report.warnings`;
- a target with `{`, `}`, `<`, `>`, `;`, `\`, `@` or a quote leaves its track out (reported);
- the title is HTML-escaped; the scene data block escapes `<` and `>` so it cannot close its `<script>`;
- property names are already restricted by the timeline format.

`report.ok` is `true` only when nothing was missing, rejected or left out.

## Frame-export jobs (GIF / video adapters)

Encoding to GIF, video or an image sequence is an **adapter**: Motionary hands you every frame state in order, your
adapter renders and encodes it (WebCodecs `VideoEncoder`, an `OffscreenCanvas` → PNG sequence, ffmpeg in a worker …). No
encoder ships in this entry.

```js
const job = createFrameExportJob(project, {
  fps: 30,
  adapter: {
    begin({ fps, total, digest }) { /* open the encoder */ },
    async frame(i, frame) { /* render frame.layers to a canvas, encode */ },
    end() { return encoder.finish(); },
    abort() { encoder.close(); },
  },
});
let r = await job.run();
if (!r.ok) {
  localStorage.setItem('job', JSON.stringify(job.checkpoint)); // { format: 'motionary-frame-job', digest, fps, next, total }
  r = await job.resume();                                         // retries the failed frame, continues
}
```

- A frame that throws (or rejects) stops the job: `status: 'failed'`, `error`, and a serializable `checkpoint` with the
  next frame. `resume()` retries that frame and continues; the frames are identical to one clean run.
- After a reload, `createFrameExportJob(project, { adapter, fps, checkpoint })` continues from the checkpoint — refused if
  the checkpoint belongs to another scene (its `digest` differs) or frame rate.
- `abort()` stops the job and calls `adapter.abort()`; an aborted job cannot be resumed.
- The job is independent of `exportStandalone`: the basic export is synchronous, never waits for a job and never fails
  because an encoder did.
- `createJsonFramesAdapter()` keeps every frame state (deterministic; useful in tests or to hand frames to another
  process).

## Not in 14.7

- An "Export" button inside `createStudio` (it would raise the `motionary/studio` budget; three lines with this entry do it).
- A built-in GIF / video encoder (adapters only).
- A motionary-mcp export tool (planned with the 14.8 template tools).
