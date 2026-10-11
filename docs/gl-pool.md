# WebGL context pool and GPU budget (13.8)

`motionary/components/gl-pool` keeps pages with many WebGL components reliable. It is **opt-in**, has zero
dependencies, and is not part of `motionary/components/lite` (lite's size and behaviour are unchanged).

## Why

Browsers keep only a few live WebGL contexts per page (Chrome / Edge 16; Safari and phones fewer). Past that the
browser silently drops the *oldest* context — on a page with 30 shader cards some cards go blank, whichever were
created first, including ones on screen. GPU memory is also finite: large textures on cards nobody can see push
the page toward a GPU reset, which loses *every* context.

## Use

```ts
import { installGLPool, glPoolStats } from 'motionary/components/gl-pool';

installGLPool({ maxContexts: 8, budgetBytes: 256 * 1024 * 1024 }); // the defaults
```

Install it once, before (or after) the components mount. `installGLPool()` returns the uninstall function
(`uninstallGLPool()` does the same).

| Option | Default | |
|---|---|---|
| `maxContexts` | `8` | live WebGL / WebGL2 contexts allowed at once, clamped to 1–16 |
| `budgetBytes` | 256 MiB | estimated GPU memory before off-screen components are evicted (`0` turns the budget off) |

## What it does

The pool sits in front of every `canvas.getContext('webgl' | 'webgl2' | 'experimental-webgl')` on the page (other
context types pass straight through):

1. **One lease per canvas.** A canvas asking again gets the same context and is counted once.
2. **Reclaim first.** When a slot is needed, probe contexts (a detached canvas that never drew — feature checks)
   and contexts left on canvases a component took out of the document are released first.
3. **Evict off-screen components.** Next, the least recently seen *off-screen* Motionary component gives its
   context back (`data-usa-gl="evicted"`). Its frame loop was already parked by the scheduler's offscreen pause
   ([scheduling.md](scheduling.md)); when it scrolls back into view it is re-mounted on a fresh context.
4. **Never evict what is on screen** — or a context your own code created (no `usa-*` owner). When every live
   context is on screen, the request returns `null` and the component shows its own fallback
   (`data-usa-gl="waiting"`); it is re-mounted as soon as a slot frees and it is visible.
5. **Context loss → restore.** A context lost while its component is still in the document (GPU reset, driver
   update, `WEBGL_lose_context`) re-mounts the component on a new canvas (`data-usa-gl="restored"`). At most 3
   times in 10 s; after that it stays on its fallback (`data-usa-gl="lost"`).
6. **GPU budget.** Textures (`texImage2D`, `texStorage2D`; level 0 at 4 bytes per texel), buffers (`bufferData`)
   and drawing buffers are accounted per context; deletes give the bytes back. Above `budgetBytes`, off-screen
   Motionary components are evicted, largest first. The numbers are estimates (drivers pad and compress), meant to
   keep pages away from the cliff, not to measure VRAM.

`data-usa-gl` on the component: `live` · `evicted` · `waiting` · `restored` · `lost`.

## Stats

```ts
glPoolStats();
// { installed, live, peak, max, bytes, budget, evicted, denied, reclaimed, lost, recovered,
//   leases: [{ owner: 'usa-shader', kind: 'webgl', bytes: 1228800, visible: true }, …] }
```

`glSupport('webgl' | 'webgl2')` answers "can this browser make one?" with one shared probe per kind whose context is
released immediately.

## Fallbacks (with or without the pool)

| Component | No WebGL | Context lost |
|---|---|---|
| `<usa-shader>`, `<usa-distort>`, `<usa-liquid>`, `<usa-post-fx>` | still CSS rendering (`data-fallback`) | pool: re-mount |
| `<usa-shader-backdrop>` | CSS gradient (`data-usa-backend="css"`) | CSS gradient (13.8), pool: re-mount |
| `<usa-gl-scene>`, `<usa-gl-model>` | static poster (`data-usa-backend="none"`, 13.8) | static poster (13.8), pool: re-mount |
| GPU effect packs (`fx-gpu` …) | Canvas 2D | Canvas 2D |

Reduced motion: every WebGL component draws one still frame and runs no frame loop; the pool changes nothing there.

## Verified

`test/gl-pool-13-8.test.ts` (unit) and `test/browser/gl-pool.spec.mjs` (Chromium): 32 WebGL components on one page
never exceed 8 live contexts and every visible one renders while scrolling; a forced `WEBGL_lose_context` loss
re-mounts the component; with WebGL disabled every GPU component paints a fallback; reduced motion runs no loop.
