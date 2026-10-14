'use strict';

var ease$1 = require('./ease-HwYZnZat.cjs');
var base = require('./base-BvH4nAcv.cjs');
var format = require('./format-DrRrPbjl.cjs');

/**
 * 13.6: reproducible preview. `sampleTimelineDoc(doc, t)` is a pure function of
 * the document and the time — the same time always gives the same frame state,
 * whatever was seeked before (scrubbing back and forth, jumping, playing), and
 * `random(a, b)` values depend only on the seed. `createTimelinePreview` writes
 * that state to the DOM; `createFixedClock` drives it in fixed steps for tests.
 */
const round = (n) => {
    const r = Math.round(n * 1e4) / 1e4;
    return r === 0 ? 0 : r;
};
const NUM = /-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi;
const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const hexRgb = (h) => {
    const m = HEX.exec(h.trim());
    if (!m)
        return h;
    const s = m[1].length === 3 ? m[1].replace(/./g, (c) => c + c) : m[1];
    return `rgb(${parseInt(s.slice(0, 2), 16)}, ${parseInt(s.slice(2, 4), 16)}, ${parseInt(s.slice(4, 6), 16)})`;
};
const easeCache = /*#__PURE__*/ new Map();
const ease = (e) => {
    const k = e || 'linear';
    let f = easeCache.get(k);
    if (!f) {
        try {
            f = ease$1.parseEase(k);
        }
        catch {
            f = ease$1.parseEase('linear');
        }
        easeCache.set(k, f);
    }
    return f;
};
/**
 * Interpolate two values at `p` (0–1): numbers, and strings whose non-numeric
 * parts match (`translateX(10px) scale(1)`, `rgb(…)`, `#hex` colours); anything
 * else switches at the midpoint (like CSS discrete animation). `p` outside 0–1
 * (overshooting easings) extrapolates numbers.
 */
function interpolateValue(a, b, p) {
    // eased progress may leave 0–1 (back / elastic overshoot): numbers extrapolate, discrete values clamp
    if (p === 0)
        return a;
    if (p === 1)
        return b;
    if (typeof a === 'number' && typeof b === 'number')
        return round(a + (b - a) * p);
    const sa = HEX.test(String(a).trim()) && HEX.test(String(b).trim()) ? hexRgb(String(a)) : String(a);
    const sb = sa !== String(a) ? hexRgb(String(b)) : String(b);
    const na = sa.match(NUM) || [];
    const nb = sb.match(NUM) || [];
    if (na.length && na.length === nb.length && sa.replace(NUM, '#') === sb.replace(NUM, '#')) {
        let i = 0;
        const rgb = /^rgba?\(/.test(sa);
        return sa.replace(NUM, () => {
            const k = i++;
            const v = +na[k] + (+nb[k] - +na[k]) * p;
            return String(rgb && k < 3 ? Math.min(255, Math.max(0, Math.round(v))) : round(v));
        });
    }
    return p < 0.5 ? a : b;
}
/** The frame state at `time` ms (active tracks only; mute / solo applied; `random()` resolved by seed). */
function sampleTimelineDoc(doc, time) {
    const total = format.timelineDocDuration(doc);
    const t = Math.min(Math.max(Number.isFinite(time) ? time : 0, 0), total);
    const seed = doc.seed ?? 1;
    const layers = {};
    for (const l of doc.layers) {
        if (l.type !== 'track' || !l.keyframes?.length || !format.isLayerActive(doc, l.id))
            continue;
        const ks = l.keyframes.map((k, i) => [k, i]).sort((x, y) => x[0].time - y[0].time || x[1] - y[1]).map(([k]) => k);
        const names = [];
        for (const k of ks)
            for (const n of Object.keys(k.props))
                if (!names.includes(n))
                    names.push(n);
        const state = {};
        for (const name of names.sort()) {
            const own = ks.filter((k) => name in k.props);
            const val = (i) => format.resolveRandom(own[i].props[name], seed, `${l.id}/${own[i].id}/${name}`);
            let i = 0;
            while (i < own.length - 1 && own[i + 1].time <= t)
                i++;
            if (t <= own[0].time)
                state[name] = val(0);
            else if (i >= own.length - 1)
                state[name] = val(own.length - 1);
            else {
                const a = own[i], b = own[i + 1];
                const span = b.time - a.time;
                state[name] = interpolateValue(val(i), val(i + 1), span > 0 ? ease(a.easing)((t - a.time) / span) : 1);
            }
        }
        layers[l.id] = state;
    }
    return { time: t, layers };
}
/** A clock that only moves in fixed steps (default 1000/60 ms) — frame n is always at n × step. */
function createFixedClock(o = {}) {
    const step = o.step && o.step > 0 ? o.step : 1000 / 60;
    let n = Math.round((o.start ?? 0) / step);
    const at = () => round(n * step);
    return {
        get time() { return at(); },
        step,
        tick(k = 1) { n += Math.round(k); return at(); },
        set(ms) { n = Math.round(ms / step); return at(); },
    };
}
const cssName = (p) => (p.startsWith('--') ? p : p.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase()));
const pick = (root, sel) => {
    if (sel === ':scope')
        return [root];
    try {
        return Array.from(root.querySelectorAll(sel));
    }
    catch {
        return [];
    }
};
/**
 * Drive the elements under `root` from a timeline document. Each `seek()`
 * writes the full frame state (and clears properties no longer animated), so
 * the DOM at time t is the same however you got there.
 */
function createTimelinePreview(root, doc, o = {}) {
    let d = doc;
    let t = 0;
    let id = 0;
    const written = new Map();
    const render = (ms) => {
        const f = sampleTimelineDoc(d, ms);
        t = f.time;
        const next = new Map();
        for (const l of d.layers) {
            const state = f.layers[l.id];
            if (!state)
                continue;
            for (const el of pick(root, l.target || ':scope')) {
                const m = next.get(el) || new Map();
                for (const [p, v] of Object.entries(state))
                    m.set(cssName(p), String(v));
                next.set(el, m);
            }
        }
        for (const [el, props] of written)
            for (const p of props)
                if (!next.get(el)?.has(p))
                    el.style.removeProperty(p);
        written.clear();
        for (const [el, m] of next) {
            for (const [p, v] of m)
                el.style.setProperty(p, v);
            written.set(el, new Set(m.keys()));
        }
        o.onFrame?.(f);
        return f;
    };
    const stop = () => {
        if (id)
            base.caf(id);
        id = 0;
    };
    const p = {
        get time() { return t; },
        get duration() { return format.timelineDocDuration(d); },
        seek: (ms) => render(ms),
        setDoc(next) { d = next; render(t); },
        play() {
            stop();
            if (t >= p.duration)
                t = 0;
            let last = base.now();
            const loop = () => {
                const n = base.now();
                render(t + (n - last));
                last = n;
                id = t < p.duration ? base.raf(loop, root) : 0;
            };
            id = base.raf(loop, root);
        },
        pause: stop,
        advance(n = 1) {
            const c = o.clock || createFixedClock({ start: t });
            if (!o.clock)
                o.clock = c;
            return render(c.tick(n));
        },
        destroy() {
            stop();
            for (const [el, props] of written)
                for (const prop of props)
                    el.style.removeProperty(prop);
            written.clear();
        },
    };
    return p;
}

exports.createFixedClock = createFixedClock;
exports.createTimelinePreview = createTimelinePreview;
exports.interpolateValue = interpolateValue;
exports.sampleTimelineDoc = sampleTimelineDoc;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v14.8.0/dist/chunks/preview-CyTKsXQP.cjs.map