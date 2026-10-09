# Motionary 10.9 audit (before 11.0)

Scope: every `motionary/runtime/*` module, the components added in 10.1–10.9, the AI manifest and `motionary-mcp`. Findings that changed code are in the 10.9 CHANGELOG; the rest are recorded here with the decision.

## Accessibility
- Every runtime-powered component renders a labelled element (`role="img"` canvas with `label`, or a labelled `region` / `group`) and shows the clear "module missing" notice as `role="alert"` text, not only a console error.
- Reduced motion is honoured by every 10.x component: Lottie / dotLottie show the first frame of each state, 3D scenes skip auto-rotate and animation playback, drag-snap snaps without inertia or spring, physics settles off-screen, smooth scrolling stays native.
- Keyboard: `<usa-snap-carousel>` (←/→ / Home / End, real buttons), `<usa-gl-scene controls>` (arrow keys), `<usa-physics-playground>` (arrow keys), `<usa-dotlottie>` (Enter / Space feed the state machine's PointerDown + Click). **Gap kept:** state-machine interactions bound to a Lottie layer (`layerName`) fire for the whole canvas — hit-testing layers is not done (documented in the compatibility table).

## Performance
- Fixed gzip budgets per module, CI-enforced (`size-budget.json`); none was raised in 10.x. Budget review (measured at 10.8, ESM import incl. the core parts it uses / CDN IIFE):

| Module | ESM import (gzip) | budget | headroom | CDN IIFE (gzip) | budget | verdict |
|---|---|---|---|---|---|---|
| `motionary/runtime` | 5.17 KB | 5.5 KB | 6 % | 5.22 KB | 5.5 KB | tight — watch |
| `motionary/runtime/format-css` | 6.03 KB | 8.0 KB | 25 % | 2.35 KB | 2.5 KB | keep |
| `motionary/runtime/format-motion` | 5.79 KB | 8.0 KB | 28 % | 2.18 KB | 2.5 KB | keep |
| `motionary/runtime/scroll` | 3.00 KB | 4.5 KB | 33 % | 2.65 KB | 4.5 KB | keep |
| `motionary/runtime/format-svg` | 7.45 KB | 10.5 KB | 29 % | 3.80 KB | 5.0 KB | keep |
| `motionary/runtime/text` | 1.10 KB | 3.0 KB | 63 % | 1.17 KB | 2.5 KB | keep |
| `motionary/runtime/format-sprite` | 3.26 KB | 8.5 KB | 62 % | 2.09 KB | 3.0 KB | keep |
| `motionary/runtime/smooth` | 3.48 KB | 4.5 KB | 23 % | 2.26 KB | 3.5 KB | keep |
| `motionary/runtime/format-gif` | 3.50 KB | 4.0 KB | 12 % | 2.32 KB | 3.5 KB | keep |
| `motionary/runtime/format-apng` | 3.82 KB | 4.0 KB | 5 % | 2.65 KB | 3.5 KB | tight — watch |
| `motionary/runtime/format-webp` | 3.70 KB | 4.0 KB | 7 % | 2.52 KB | 3.5 KB | tight — watch |
| `motionary/runtime/gl` | 7.74 KB | 10.0 KB | 23 % | 7.80 KB | 9.0 KB | keep |
| `motionary/runtime/format-gltf` | 4.53 KB | 7.0 KB | 35 % | 4.59 KB | 6.0 KB | keep |
| `motionary/runtime/format-obj` | 3.07 KB | 5.0 KB | 39 % | 3.14 KB | 4.0 KB | keep |
| `motionary/runtime/vector` | 10.67 KB | 12.0 KB | 11 % | 9.54 KB | 12.0 KB | keep |
| `motionary/runtime/physics` | 5.50 KB | 10.0 KB | 45 % | 5.14 KB | 9.0 KB | keep |
| `motionary/runtime/format-scene` | 2.96 KB | 4.0 KB | 26 % | 2.56 KB | 3.5 KB | keep |
| `motionary/runtime/drag-snap` | 2.17 KB | 4.0 KB | 46 % | 1.77 KB | 3.5 KB | keep |
| `motionary/runtime/gltf-anim` | 3.49 KB | 4.5 KB | 22 % | 3.08 KB | 4.0 KB | keep |

  Decision: keep every budget. The three "tight" ones (core 5.5 KB, APNG / WebP 4 KB) have no planned growth; any change that needs more must trim first.
- The all-components `motionary/components/lite` bundle stays at its fixed 70 KB (69.03 KB at 10.7). From 10.8 new components ship as **their own entry points** (`motionary/components/snap-carousel`, `/gl-model`, `/dotlottie`) and are not added to `widgets` or `lite`.
- Runtime-powered components render only while visible (IntersectionObserver) and stop their ticker listeners when idle; skinning is CPU-side and re-uploads only changed geometry (`geometry.version`).

## Security
- No `eval` / `new Function` in `motionary/runtime/*`: the Lottie expression subset (10.8) is a parser + interpreter over an allow-list (no member access to `constructor` / `__proto__` / `prototype`, `Math.*` only).
- **Finding:** `offscreenRender()` / `<usa-worker-canvas>` (9.6) evaluate a *string* program with `new Function` when they fall back to the main thread — blocked by a strict CSP and a code-injection risk if the string comes from data. **Deprecated in 10.9** (warning once), **refused in 11.0** (string programs run only in a worker; pass a function).
- dotLottie state machines: `OpenUrl` is refused on purpose (a file must not navigate the page); `inspectStateMachine()` lists it.
- `motionary-mcp` is read-only (every tool annotated `readOnlyHint`, no file writes, no child processes, no network); `validate_snippet` never executes code.
- Official decoders (draco3d, Basis Universal, Rive) are optional peers, lazy-loaded from the user's own install / CDN choice; Motionary never fetches them by itself.

## API consistency
- Runtime modules: the module object is the camel-cased id (`dragSnap`, `gltfAnim`, `lottieState`, `gltfDecoders`) and is what `use()` takes; factories are verbs (`createWorld`, `createDragSnap`, `createStateMachine`, `gltfAnimator`). Kept for 11.0.
- Components: `define<Name>()` per element, `usa:<event>` events with `detail`, `label` for the accessible name, `usa:runtime-missing` when a prerequisite is missing.
- **Finding:** `<usa-three-scene>` duplicated `<usa-gl-scene>` under a misleading name (no Three.js involved). **Deprecated in 10.9, removed in 11.0** (`npx usa-codemod-11`).

## AI manifest
- `components.json` / `dist/manifest.json` move to **schema v2** (additive): `stability` (top level, components, prerequisites), `deprecated` { since, removedIn, use }, `optional` on official-runtime prerequisites. v1 readers keep working; the schema is frozen in 11.0.
- The 10.7 scene format stays **`motionary-scene@1`** (no breaking change was needed); its JSON Schema is published at `docs/schemas/motionary-scene-1.schema.json` and the presets are validated against it in CI.
