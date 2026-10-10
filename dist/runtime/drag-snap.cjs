'use strict';

var registry = require('../chunks/registry-U0scTJZr.cjs');

/**
 * `motionary/runtime/drag-snap` (10.8) — pointer drag with inertia and snap
 * points, for carousels, sheets, sliders and pickers (own implementation).
 *
 * - one axis (`x` / `y`) per controller; pointer, touch and pen through
 *   Pointer Events, a movement threshold before a drag starts (so clicks
 *   inside still work), `touch-action` set for the other axis;
 * - velocity from the last 100 ms of samples; release projects the throw
 *   with constant deceleration and snaps to the nearest point (or to the
 *   next / previous point for a fast flick, `flick`), with a critically
 *   damped spring on the shared ticker;
 * - bounds with rubber-band resistance past the ends;
 * - `createDragSnap(el, options)`; `snapTo(index)`, `setPosition(px)`, `setSnapPoints([...])`; reduced
 *   motion: no inertia, snaps without the spring.
 *
 * The maths (`projectThrow`, `nearestSnap`, `rubberband`, `springStep`,
 * `velocityTracker`) is pure and exported for tests / workers.
 */
/** Where a throw at `velocity` (px/s) ends with constant `deceleration` (px/s²). */
function projectThrow(position, velocity, deceleration = 3000) {
    return position + (velocity * Math.abs(velocity)) / (2 * Math.max(1, deceleration));
}
/** Index of the snap point nearest to `p` (points in any order). */
function nearestSnap(points, p) {
    let best = 0, d = Infinity;
    points.forEach((x, i) => {
        const e = Math.abs(x - p);
        if (e < d)
            (d = e), (best = i);
    });
    return best;
}
/** Rubber-band: how far content moves when dragged `over` px past an edge of a `size` px viewport. */
function rubberband(over, size, c = 0.55) {
    const s = Math.sign(over), x = Math.abs(over);
    return s * (1 - 1 / ((x * c) / Math.max(1, size) + 1)) * size;
}
/** One semi-implicit Euler step of a damped spring towards `target`. Returns [position, velocity]. */
function springStep(x, v, target, dt, stiffness = 260, damping = 2 * Math.sqrt(260)) {
    const a = -stiffness * (x - target) - damping * v;
    const nv = v + a * dt;
    return [x + nv * dt, nv];
}
/** Velocity estimate (units/s) from the samples of the last `window` ms. */
function velocityTracker(window = 100) {
    let s = [];
    return {
        add(t, p) {
            s.push([t, p]);
            while (s.length > 2 && t - s[0][0] > window)
                s.shift();
        },
        velocity(now) {
            if (s.length < 2)
                return 0;
            const [t1, p1] = s[s.length - 1];
            if (now !== undefined && now - t1 > 60)
                return 0; // finger stopped before release
            const [t0, p0] = s[0];
            return t1 > t0 ? ((p1 - p0) / (t1 - t0)) * 1000 : 0;
        },
        reset() {
            s = [];
        },
    };
}
/** Make `el` draggable along one axis; `onUpdate(px)` applies the position (e.g. a transform). */
function createDragSnap(el, o = {}) {
    const core = registry.requireModule('core', 'motionary/runtime/drag-snap');
    const X = (o.axis || 'x') === 'x';
    let points = (o.snap || []).slice();
    let lo = 0, hi = 0;
    const setBounds = (b) => {
        if (b)
            [lo, hi] = [Math.min(b[0], b[1]), Math.max(b[0], b[1])];
        else if (points.length)
            [lo, hi] = [Math.min(...points), Math.max(...points)];
        else
            [lo, hi] = [-Infinity, Infinity];
    };
    setBounds(o.bounds);
    let pos = o.position ?? (points.length ? points[0] : 0), vel = 0, target = null, idx = points.length ? nearestSnap(points, pos) : 0;
    let drag = false, down = false, startP = 0, startPos = 0, pid = -1, off = null;
    const vt = velocityTracker();
    const reduced = () => !!o.reducedMotion;
    const clampB = (p) => Math.min(hi, Math.max(lo, p));
    const emit = () => o.onUpdate?.(pos);
    const stop = () => {
        off?.();
        off = null;
    };
    const settle = (t, animate = true) => {
        target = t;
        if (!animate || reduced()) {
            pos = t;
            vel = 0;
            target = null;
            stop();
            emit();
            if (points.length)
                o.onSnap?.(idx, pos);
            return;
        }
        if (!off)
            off = core.getTicker().add((_, ms) => {
                if (target === null)
                    return stop();
                let left = Math.min(ms, 64) / 1000;
                while (left > 0) {
                    const dt = Math.min(left, 1 / 120);
                    [pos, vel] = springStep(pos, vel, target, dt, o.stiffness, o.damping);
                    left -= dt;
                }
                if (Math.abs(pos - target) < 0.3 && Math.abs(vel) < 8) {
                    pos = target;
                    vel = 0;
                    target = null;
                    stop();
                    emit();
                    if (points.length)
                        o.onSnap?.(idx, pos);
                    return;
                }
                emit();
            });
    };
    const targetFor = (p, v) => {
        if (!points.length)
            return -1;
        const thrown = o.inertia === false || reduced() ? p : projectThrow(p, v, o.deceleration);
        let i = nearestSnap(points, thrown);
        const from = nearestSnap(points, startPos);
        if (i === from && Math.abs(v) > (o.flick ?? 400)) {
            // a short fast flick still moves one point in the throw direction
            const sorted = points.map((x, k) => [x, k]).sort((a, b) => a[0] - b[0]);
            const at = sorted.findIndex((s) => s[1] === from);
            const n = sorted[at + (v > 0 ? 1 : -1)];
            if (n)
                i = n[1];
        }
        return i;
    };
    const coord = (e) => (X ? e.clientX : e.clientY);
    const onDown = (e) => {
        if (e.button > 0 || down)
            return;
        down = true;
        drag = false;
        pid = e.pointerId;
        startP = coord(e);
        startPos = pos;
        vt.reset();
        vt.add(e.timeStamp ?? performance.now(), pos);
    };
    const onMove = (e) => {
        if (!down || e.pointerId !== pid)
            return;
        const d = coord(e) - startP;
        if (!drag) {
            if (Math.abs(d) < (o.threshold ?? 4))
                return;
            drag = true;
            target = null;
            stop();
            try {
                el.setPointerCapture?.(pid);
            }
            catch {
                /* synthetic events */
            }
            o.onDragStart?.();
        }
        const raw = startPos + d;
        const r = o.resistance ?? 0.55;
        const size = (X ? el.parentElement?.clientWidth : el.parentElement?.clientHeight) || 300;
        pos = raw < lo ? (r ? lo + rubberband(raw - lo, size, r) : lo) : raw > hi ? (r ? hi + rubberband(raw - hi, size, r) : hi) : raw;
        vt.add(e.timeStamp ?? performance.now(), pos);
        emit();
        e.preventDefault?.();
    };
    const onUp = (e) => {
        if (!down || e.pointerId !== pid)
            return;
        down = false;
        if (!drag)
            return;
        drag = false;
        const v = vt.velocity(e.timeStamp ?? performance.now());
        o.onDragEnd?.(v);
        // a click right after a drag must not activate links / buttons inside
        const eat = (c) => (c.stopPropagation(), c.preventDefault());
        el.addEventListener('click', eat, { capture: true, once: true });
        setTimeout(() => el.removeEventListener('click', eat, { capture: true }), 0);
        vel = reduced() ? 0 : v;
        if (points.length) {
            idx = targetFor(pos, v);
            settle(points[idx]);
        }
        else
            settle(clampB(o.inertia === false || reduced() ? pos : projectThrow(pos, v, o.deceleration)));
    };
    el.style.touchAction = X ? 'pan-y' : 'pan-x';
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    emit();
    return {
        get position() {
            return pos;
        },
        get index() {
            return idx;
        },
        get dragging() {
            return drag;
        },
        get moving() {
            return target !== null || drag;
        },
        snapTo(i, animate = true) {
            if (!points.length)
                return;
            idx = Math.max(0, Math.min(points.length - 1, Math.round(i)));
            vel = 0;
            settle(points[idx], animate);
        },
        setPosition(px, animate = false) {
            vel = 0;
            if (points.length)
                idx = nearestSnap(points, px);
            settle(clampB(px), animate);
        },
        setSnapPoints(p, b) {
            points = p.slice();
            setBounds(b);
            if (points.length) {
                idx = Math.min(idx, points.length - 1);
                pos = points[idx];
                target = null;
                stop();
                emit();
            }
        },
        targetFor,
        dispose() {
            stop();
            el.removeEventListener('pointerdown', onDown);
            el.removeEventListener('pointermove', onMove);
            el.removeEventListener('pointerup', onUp);
            el.removeEventListener('pointercancel', onUp);
        },
    };
}
/** The module object: `use(dragSnap)`. */
const dragSnap = { id: 'drag-snap', version: registry.RUNTIME_VERSION, tier: 'standard', requires: ['core'], api: { createDragSnap, projectThrow, nearestSnap, rubberband, springStep, velocityTracker } };

exports.createDragSnap = createDragSnap;
exports.dragSnap = dragSnap;
exports.nearestSnap = nearestSnap;
exports.projectThrow = projectThrow;
exports.rubberband = rubberband;
exports.springStep = springStep;
exports.velocityTracker = velocityTracker;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.9.0/dist/runtime/drag-snap.cjs.map