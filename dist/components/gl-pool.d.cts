/**
 * motionary/components/gl-pool (13.8) — WebGL context pool + GPU resource budget.
 *
 * Browsers keep only a handful of live WebGL contexts (Chrome / Edge 16, Firefox and
 * Safari fewer on phones) and silently drop the oldest one past that — a page with
 * 30 shader cards ends up with blank canvases. Installing the pool puts a cap
 * (default 8, 1–16) in front of every `getContext('webgl' | 'webgl2')` on the page
 * and keeps the page under it:
 *
 * - **Reuse / reclaim** — a canvas asking twice gets the same context (one lease).
 *   Probe contexts (a detached canvas that never drew, e.g. `supportsWebGL()`) and
 *   contexts left on canvases that were taken out of the document are released
 *   first when a slot is needed.
 * - **Eviction** — at the cap, the least recently seen *off-screen* Motionary
 *   component gives its context back (`data-usa-gl="evicted"`, its render loop is
 *   already parked by the scheduler's offscreen pause) and is re-mounted when it
 *   scrolls back into view. On-screen components and contexts the page created
 *   itself (no `usa-*` owner) are never evicted.
 * - **Graceful denial** — when every live context is on screen, the request
 *   returns `null`, so the component takes its own fallback (CSS still, Canvas 2D);
 *   it is re-mounted when a slot frees and it is visible (`data-usa-gl="waiting"`).
 * - **Context loss / restore** — a context lost while its component is still in the
 *   document (GPU reset, driver update, `WEBGL_lose_context`) re-mounts the
 *   component on a fresh canvas (at most 3 times in 10 s, then it stays on its
 *   fallback: `data-usa-gl="lost"`).
 * - **GPU budget** — textures (`texImage2D` / `texStorage2D`), buffers (`bufferData`)
 *   and drawing buffers are accounted per context (an estimate: level 0, 4 bytes /
 *   texel). Over `budgetBytes` (default 256 MiB), off-screen Motionary components
 *   are evicted, largest first.
 *
 * Opt-in and not part of `motionary/components/lite` (lite stays within budget);
 * zero dependencies. Leaves the page exactly as it was on `uninstall()`.
 *
 * ```ts
 * import { installGLPool, glPoolStats } from 'motionary/components/gl-pool';
 * installGLPool({ maxContexts: 8 });
 * // later: glPoolStats() → { live, peak, max, bytes, budget, evicted, denied, lost, recovered, … }
 * ```
 */
interface GLPoolOptions {
    /** Live WebGL contexts allowed at once (default 8, clamped to 1–16). */
    maxContexts?: number;
    /** Estimated GPU memory (bytes) before off-screen components are evicted (default 256 MiB). */
    budgetBytes?: number;
}
interface GLLeaseInfo {
    /** Tag of the owning component (`usa-shader`…), or `null` for a context the page created itself. */
    owner: string | null;
    kind: string;
    /** Estimated bytes: drawing buffer + textures + buffers. */
    bytes: number;
    visible: boolean;
}
interface GLPoolStats {
    installed: boolean;
    /** Live contexts now / the most at once since install / the cap. */
    live: number;
    peak: number;
    max: number;
    /** Estimated GPU bytes now / the budget. */
    bytes: number;
    budget: number;
    /** Off-screen components that gave their context back. */
    evicted: number;
    /** Requests answered with `null` (every live context was on screen). */
    denied: number;
    /** Probe / detached contexts released to make room. */
    reclaimed: number;
    /** Contexts lost while their component was in the document / components re-mounted after it. */
    lost: number;
    recovered: number;
    leases: GLLeaseInfo[];
}
/**
 * Install the pool (idempotent; a second call only updates the options).
 * Returns the uninstall function: the original `getContext` comes back, live
 * contexts stay as they are and are no longer counted.
 */
declare function installGLPool(o?: GLPoolOptions): () => void;
/** Remove the pool (see `installGLPool`). */
declare function uninstallGLPool(): void;
/** Counters and the live leases (for dashboards, tests and `perf` overlays). */
declare function glPoolStats(): GLPoolStats;
/**
 * `true` when this browser can create a `kind` context — one shared probe per kind,
 * released immediately (no lingering probe context per component).
 */
declare function glSupport(kind?: 'webgl' | 'webgl2'): boolean;

export { glPoolStats, glSupport, installGLPool, uninstallGLPool };
export type { GLLeaseInfo, GLPoolOptions, GLPoolStats };
