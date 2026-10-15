# Performance budget in Studio (16.3)

`motionary/studio/budget` tells you what an export will cost **while you edit**, and stops "publish export" when it
is over budget.

- **Bytes:** the files of the 14.7 standalone export (`exportStandalone`, same options), raw and — where
  `CompressionStream` exists (all current browsers, Node 18+) — gzip, file by file.
- **Frame cost:** the scene is baked at `fps` (default 60); every property whose value changes in a frame adds its
  class cost — **composite 1** (`opacity`, `transform`, `translate`, `rotate`, `scale`), **paint 4** (colours,
  shadows, `filter`, `clip-path`, custom properties, anything unknown), **layout 10** (`width` / `height`, `top` /
  `left` / `inset`, margins, paddings, `font-size`, `line-height`, gaps, …). The peak frame and when it happens are
  reported, with the list of `target property` pairs animating layout or paint properties. The numbers are cost
  units for comparing edits, not milliseconds.

```js
import { measureExport, checkBudget, guardPublish, createBudgetMeter } from 'motionary/studio/budget';

const limits = { kb: 20, gzipKb: 6, frameCost: 30, layout: false };
const meter = createBudgetMeter(document.querySelector('#budget'), limits);
history.subscribe(async () => meter.update(await measureExport(studio.getProject(), { js: false })));
// → "4.12 KB / 20 KB · gzip 1.6 KB · cost 14 / 30"; data-over="frameCost" when a metric is over

const r = await guardPublish(studio.getProject(), limits, (files) => upload(files));
if (!r.ok) console.warn('over budget', r.over); // upload() was not called
```

| API | Result |
| --- | --- |
| `propClass(prop)` | `'composite' \| 'paint' \| 'layout'` (camelCase or kebab-case) |
| `frameCost(input, { fps })` | `{ peak, peakAt, frames, layout, paint }` |
| `measureExport(input, exportOptions)` | `{ bytes, gzipBytes \| null, files: { path: bytes }, cost }` — deterministic |
| `checkBudget(measure, { kb, gzipKb, frameCost, layout })` | `{ ok, over: [{ metric, value, limit }] }`; `gzipKb` only when gzip was measured; `layout: false` = no layout property may animate |
| `guardPublish(input, limits, publish, exportOptions)` | `{ ok: true, value, measure }` or `{ ok: false, over, measure }` without calling `publish` |
| `createBudgetMeter(el, limits)` | `role="status"`, `aria-live="polite"`; `update(measure)`, `destroy()` |

Size: its own entry; it includes `motionary/studio/export` (the export it measures), so its budget line equals the
studio-export line (15 KB). Not part of lite or `motionary/studio`.
