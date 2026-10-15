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
const GL = /^(webgl2?|experimental-webgl)$/;
const leases = /*#__PURE__*/ new Map();
/** owners waiting for a context: evicted, denied or lost — re-mounted when visible + a slot is free */
const waiting = /*#__PURE__*/ new Map();
const recovers = /*#__PURE__*/ new WeakMap();
let max = 8;
let budget = 256 * 1024 * 1024;
let io = null;
let orig = null;
let pending = false;
const st = { peak: 0, evicted: 0, denied: 0, reclaimed: 0, lost: 0, recovered: 0 };
const t = () => (typeof performance == 'object' ? performance.now() : Date.now());
/** Nearest Motionary component (custom element with a re-mount hook) that holds `c`, through shadow roots. */
function ownerOf(c) {
    let n = c.parentNode;
    while (n) {
        if (n.nodeType === 1 && n.localName.startsWith('usa-') && typeof n.changed == 'function')
            return n;
        n = n.parentNode || n.host;
    }
    return null;
}
const owner = (l) => (l.c.isConnected ? (l.o = ownerOf(l.c) || l.o || null) : l.o || null);
const texels = (a) => {
    if (a.length >= 8)
        return (a[3] | 0) * (a[4] | 0);
    const s = a[a.length - 1];
    const w = s && (s.videoWidth || s.naturalWidth || s.displayWidth || s.width);
    const h = s && (s.videoHeight || s.naturalHeight || s.displayHeight || s.height);
    return (w | 0) * (h | 0);
};
/** Instance-level accounting wrappers (own properties: the prototypes are untouched). */
function account(l) {
    const g = l.gl;
    const wrap = (name, after) => {
        const f = g[name];
        if (typeof f != 'function')
            return;
        g[name] = function (...a) {
            const r = f.apply(this, a);
            after(a);
            return r;
        };
    };
    wrap('bindTexture', (a) => l.bound.set(a[0], a[1]));
    wrap('bindBuffer', (a) => l.bound.set(a[0], a[1]));
    const tex = (n, target) => {
        const k = l.bound.get(target === g.TEXTURE_2D || target === g.TEXTURE_3D || target === g.TEXTURE_2D_ARRAY ? target : g.TEXTURE_CUBE_MAP);
        if (k)
            l.tex.set(k, (target >= 0x8515 && target <= 0x851a ? (l.tex.get(k) || 0) : 0) + n * 4), check();
    };
    wrap('texImage2D', (a) => a[1] === 0 && tex(texels(a), a[0]));
    wrap('texStorage2D', (a) => tex((a[3] | 0) * (a[4] | 0), a[0]));
    wrap('bufferData', (a) => {
        const k = l.bound.get(a[0]);
        if (k)
            l.buf.set(k, typeof a[1] == 'number' ? a[1] : (a[1] && a[1].byteLength) || 0), check();
    });
    wrap('deleteTexture', (a) => l.tex.delete(a[0]));
    wrap('deleteBuffer', (a) => l.buf.delete(a[0]));
    // anything beyond a feature check marks the context as in use (never reclaimed as a probe)
    for (const n of ['drawArrays', 'drawElements', 'createProgram', 'createBuffer', 'createTexture'])
        wrap(n, () => l.draws++);
}
const bytesOf = (l) => {
    let n = (l.c.width | 0) * (l.c.height | 0) * 4;
    l.tex.forEach((v) => (n += v));
    l.buf.forEach((v) => (n += v));
    return n;
};
function release(l) {
    if (leases.get(l.c) !== l)
        return;
    leases.delete(l.c);
    l.c.removeEventListener('webglcontextlost', onLost);
    io?.unobserve(l.c);
    if (!leases.size && !waiting.size && io)
        io.disconnect(), (io = null);
    // a slot freed: wake one visible waiting component
    schedule();
}
function lose(l) {
    l.ours = true;
    release(l);
    try {
        l.gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
    catch {
        /* already lost */
    }
}
/** Free up to `n` slots: probes / detached first, then off-screen Motionary components (least recently seen). */
function free(n, now = t()) {
    let got = 0;
    for (const l of [...leases.values()]) {
        if (got >= n)
            return got;
        if (l.gl.isContextLost())
            release(l), got++;
        else if (!l.c.isConnected && (l.wasIn ? !!l.o : !l.draws && now - l.born > 500))
            lose(l), st.reclaimed++, got++;
    }
    const off = [...leases.values()].filter((l) => !l.vis && l.c.isConnected && owner(l)).sort((a, b) => a.seen - b.seen);
    for (const l of off) {
        if (got >= n)
            break;
        evict(l);
        got++;
    }
    return got;
}
function evict(l) {
    const o = owner(l);
    lose(l);
    st.evicted++;
    if (o)
        wait(o, 'evicted');
}
let checking = false;
function check() {
    if (checking || !budget)
        return;
    checking = true;
    queueMicrotask(() => {
        checking = false;
        let total = 0;
        leases.forEach((l) => (total += bytesOf(l)));
        if (total <= budget)
            return;
        const off = [...leases.values()].filter((l) => !l.vis && l.c.isConnected && owner(l)).sort((a, b) => bytesOf(b) - bytesOf(a));
        for (const l of off) {
            if (total <= budget)
                break;
            total -= bytesOf(l);
            evict(l);
        }
    });
}
/** The shared IntersectionObserver: lease canvases (visibility, last seen) and waiting owners (re-mount on view). */
function obs() {
    if (!io && typeof IntersectionObserver == 'function')
        io = new IntersectionObserver((es) => {
            for (const e of es) {
                const m = leases.get(e.target);
                if (m) {
                    m.vis = e.isIntersecting;
                    if (m.vis)
                        m.seen = t();
                    if (e.target.isConnected)
                        (m.wasIn = true), owner(m);
                }
            }
            schedule();
        });
    return io;
}
/** Park `o` until it is visible and a context is free. */
function wait(o, why, attr = why) {
    o.setAttribute('data-usa-gl', attr);
    waiting.set(o, why);
    obs()?.observe(o);
}
/** Re-mount waiting components that are visible, while slots are free (coalesced to one task). */
function schedule() {
    if (pending || !waiting.size)
        return;
    pending = true;
    setTimeout(() => {
        pending = false;
        for (const [o, why] of [...waiting]) {
            if (!o.isConnected) {
                waiting.delete(o);
                io?.unobserve(o);
                continue;
            }
            if (!inView(o) || (leases.size >= max && !free(leases.size - max + 1)))
                continue;
            waiting.delete(o);
            io?.unobserve(o);
            if (why === 'lost')
                st.recovered++;
            o.setAttribute('data-usa-gl', why === 'lost' ? 'restored' : 'live');
            o.changed('gl');
        }
    }, 16);
}
const inView = (o) => {
    if (typeof IntersectionObserver != 'function')
        return true;
    const r = o.getBoundingClientRect();
    return r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth;
};
function onLost() {
    const l = leases.get(this);
    if (!l || l.ours)
        return;
    release(l);
    const o = owner(l);
    // decide after the current task: a component tearing down removes its canvas right after losing it
    setTimeout(() => {
        if (!o || !o.isConnected || !l.c.isConnected || [...leases.values()].some((m) => m !== l && owner(m) === o))
            return;
        st.lost++;
        const now = t();
        const hist = (recovers.get(o) || []).filter((x) => now - x < 10000);
        recovers.set(o, hist);
        if (hist.length >= 3)
            return o.setAttribute('data-usa-gl', 'lost');
        hist.push(now);
        wait(o, 'lost', 'restoring');
        schedule();
    });
}
function track(c, gl, kind) {
    const now = t();
    const l = { c, gl, kind, born: now, seen: now, vis: true, wasIn: c.isConnected, draws: 0, ours: false, tex: new Map(), buf: new Map(), bound: new Map() };
    if (l.wasIn)
        l.o = ownerOf(c);
    leases.set(c, l);
    account(l);
    c.addEventListener('webglcontextlost', onLost);
    obs()?.observe(c);
    // a probe (detached canvas that only asked for a context) is released after a second instead of lingering until GC
    if (!l.wasIn)
        setTimeout(() => {
            if (leases.get(c) === l && !c.isConnected && !l.draws)
                lose(l), st.reclaimed++;
        }, 1000);
    st.peak = Math.max(st.peak, leases.size);
    const o = l.o;
    if (o && o.getAttribute('data-usa-gl') !== 'restored')
        o.setAttribute('data-usa-gl', 'live');
}
/**
 * Install the pool (idempotent; a second call only updates the options).
 * Returns the uninstall function: the original `getContext` comes back, live
 * contexts stay as they are and are no longer counted.
 */
function installGLPool(o = {}) {
    if (o.maxContexts != null)
        max = Math.min(16, Math.max(1, Number.isFinite(o.maxContexts) ? Math.round(o.maxContexts) : 8));
    if (o.budgetBytes != null)
        budget = Math.max(0, o.budgetBytes);
    if (!orig && typeof HTMLCanvasElement == 'function') {
        const P = HTMLCanvasElement.prototype;
        const g = (orig = P.getContext);
        P.getContext = function (type, attrs) {
            if (!GL.test(type) || leases.has(this))
                return g.call(this, type, attrs);
            if (leases.size >= max && !free(leases.size - max + 1)) {
                st.denied++;
                const w = this.isConnected && ownerOf(this);
                if (w)
                    wait(w, 'denied', 'waiting');
                return null;
            }
            const gl = g.call(this, type, attrs);
            if (gl && !gl.isContextLost())
                track(this, gl, type);
            return gl;
        };
    }
    return uninstallGLPool;
}
/** Remove the pool (see `installGLPool`). */
function uninstallGLPool() {
    if (!orig)
        return;
    HTMLCanvasElement.prototype.getContext = orig;
    orig = null;
    for (const l of leases.values())
        l.c.removeEventListener('webglcontextlost', onLost);
    leases.clear();
    waiting.clear();
    io?.disconnect();
    io = null;
    max = 8;
    budget = 256 * 1024 * 1024;
    Object.assign(st, { peak: 0, evicted: 0, denied: 0, reclaimed: 0, lost: 0, recovered: 0 });
}
/** Counters and the live leases (for dashboards, tests and `perf` overlays). */
function glPoolStats() {
    let bytes = 0;
    const list = [];
    leases.forEach((l) => {
        const b = bytesOf(l);
        bytes += b;
        list.push({ owner: owner(l)?.localName || null, kind: l.kind, bytes: b, visible: l.vis });
    });
    return { installed: !!orig, live: leases.size, max, bytes, budget, ...st, leases: list };
}
const probes = {};
/**
 * `true` when this browser can create a `kind` context — one shared probe per kind,
 * released immediately (no lingering probe context per component).
 */
function glSupport(kind = 'webgl2') {
    if (kind in probes)
        return probes[kind];
    let ok = false;
    try {
        const gl = document.createElement('canvas').getContext(kind);
        ok = !!gl;
        gl?.getExtension('WEBGL_lose_context')?.loseContext();
    }
    catch {
        /* no canvas */
    }
    return (probes[kind] = ok);
}

export { glPoolStats, glSupport, installGLPool, uninstallGLPool };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v16.0.0-rc.1/dist/components/gl-pool.js.map