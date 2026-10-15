# Accessible & responsive motion (`motionary/studio/a11y`, 15.3)

Three motion sensitivity tiers and breakpoint variants for Scene v2 documents. Both are plain data transforms:
`resolveVariant(doc, { width, sensitivity })` returns an ordinary Scene v2 document, so the Studio app, the 14.7
standalone export and the 15.2 native exporters play exactly the same motion for a given context (tested: equal frame
digests in Studio and the standalone export, and the native report lists the same layers).

```js
import { resolveVariant, motionSensitivity } from 'motionary/studio/a11y';
import { exportNative } from 'motionary/studio/native';

const phone = resolveVariant(scene, { width: 390, sensitivity: motionSensitivity() });
exportNative(phone, { target: 'swiftui' });
```

## Sensitivity tiers

| Tier | When | What changes |
|---|---|---|
| `full` | default | nothing |
| `gentle` | the page opts in: `<html data-usa-motion-mode="gentle">` (e.g. from your own settings screen) | translate / rotate / skew × 0.5, scale halfway to 1, overshooting `cubic-bezier()` → `cubic-bezier(0.2, 0, 0, 1)`, timelines longer than 600 ms compressed to 600 ms |
| `reduced` | `prefers-reduced-motion: reduce`, or `data-usa-motion-mode="reduced"` | no travel (translate 0, scale 1, rotate 0), opacity and colors kept, the whole timeline ≤ 150 ms |

`motionSensitivity()` reads the OS setting first, then the page attribute. `applySensitivity(doc, tier)` applies a
tier to a document. Motion tokens have the same tiers: `withMode(tokens, 'gentle')` (built in next to `reduced`:
distances × 0.5, durations ≤ 300 ms, no overshoot, springs ≥ 80 % of critical damping), and `motionTokenSetToCss`
writes a `[data-usa-motion-mode~="gentle"]` block — never a media query, since no OS setting maps to "gentle".

## Breakpoint variants

```json
{ "meta": { "motionary:variants": [
  { "id": "phone",  "media": { "maxWidth": 600 },                   "layers": { "bg": { "muted": true }, "title": { "distanceScale": 0.5 } } },
  { "id": "tablet", "media": { "minWidth": 600, "maxWidth": 1024 }, "layers": { "bg": { "timeScale": 0.8 } } }
] } }
```

- `minWidth` is inclusive, `maxWidth` exclusive; the first matching variant wins; no match = the document as is.
- Per layer: `muted`, `distanceScale` (translations only, 0–4), `timeScale` (keyframe times, 0–4).
- The resolved document records the variant in `meta["motionary:variant"]`. The variant is applied first, then the tier.
- `variantsOf(doc)`, `validateVariants(doc)` (`[]` or the problems: ranges, unknown layers, value types).

## Studio app

- Every app toolbar action is reachable with Tab and shows a focus indicator; no serious / critical axe-core
  (WCAG 2.1 A/AA) findings in the app; at 200 % zoom (640 × 400 CSS px) nothing scrolls sideways
  (`test/browser/accessible-motion.spec.mjs`, Chromium / Firefox / WebKit in CI).
- Preview a variant today by opening its resolved document (`app.open(resolveVariant(doc, ctx))`); width and tier
  switches in the Studio toolbar are planned for a later minor (they would grow the studio-app budget, which is at
  26.0 / 27 KB).

## Real-device checklist — **not run**

Needs physical devices (Winston's); not executed for 15.3:

- iOS Safari + VoiceOver: Studio toolbar order, focus after dialogs, Reduce Motion → `reduced`.
- Android Chrome + TalkBack: same; "Remove animations" → `reduced`.
- Windows high contrast / forced colors: focus indicators visible.
- Browser zoom 200 % and 400 % on a 1280 px wide desktop.
