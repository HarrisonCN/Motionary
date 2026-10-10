'use strict';

var registry = require('../chunks/registry-U0scTJZr.cjs');
var tween = require('../chunks/tween-DRtewovf.cjs');
var ease = require('../chunks/ease-HwYZnZat.cjs');
var keyframes = require('../chunks/keyframes-DA6Ie3XT.cjs');
require('../chunks/ticker-D58R9_k6.cjs');

/**
 * `motionary/runtime/format-motion` (10.1) — play Motion / Framer-style
 * keyframe JSON with the runtime:
 *
 * ```json
 * { "initial": { "opacity": 0, "y": 40 },
 *   "animate": { "opacity": 1, "y": [40, -8, 0], "rotate": 0 },
 *   "transition": { "duration": 0.6, "ease": "easeOut", "times": [0, 0.7, 1], "delay": 0.1,
 *                   "repeat": 1, "repeatType": "reverse", "opacity": { "duration": 0.3 } } }
 * ```
 *
 * Supported: `initial` / `animate` (numbers, unit strings, colours, arrays as
 * keyframes), the transform shorthands `x y scale scaleX scaleY rotate skewX skewY`,
 * transition `duration` / `delay` (seconds) / `ease` (names or `[x1, y1, x2, y2]`) /
 * `times` / `repeat` (`Infinity` ok) / `repeatType` (`loop`, `reverse`, `mirror`),
 * per-property transitions, and `type: "spring"` (`stiffness`, `damping`, `mass`,
 * or `bounce` + `duration`) simulated into an easing curve.
 * Not supported: `layout`, gestures (`whileHover` …), variants propagation,
 * `staggerChildren` (use the runtime timeline `stagger`).
 */
const NAMES = { linear: 'linear', easeIn: 'cubic-in', easeOut: 'cubic-out', easeInOut: 'cubic-in-out', circIn: 'circ-in', circOut: 'circ-out', circInOut: 'circ-in-out', backIn: 'back-in', backOut: 'back-out', backInOut: 'back-in-out', anticipate: 'back-in-out' };
/** A Motion ease → runtime ease. */
function motionEase(e) {
    if (Array.isArray(e))
        return ease.cubicBezier(e[0], e[1], e[2], e[3]);
    if (!e)
        return ease.EASES['cubic-out'];
    const n = NAMES[e] || e;
    if (!ease.EASES[n])
        throw new Error(`[motionary] format-motion: unknown ease "${e}"`);
    return ease.EASES[n];
}
/** Simulate a damped spring (unit step) → [ease, duration ms]. */
function springEase(o) {
    let k = o.stiffness ?? 100, c = o.damping ?? 10;
    const m = o.mass ?? 1;
    if (o.bounce !== undefined && o.duration !== undefined) {
        // map bounce + duration to stiffness / damping (critical damping at bounce 0)
        const zeta = 1 - Math.min(0.95, Math.max(0, o.bounce));
        const w = (2 * Math.PI) / Math.max(0.05, o.duration);
        k = m * w * w;
        c = 2 * zeta * Math.sqrt(k * m);
    }
    const dt = 1 / 120;
    const samples = [0];
    let x = 0, v = 0, t = 0, still = 0;
    while (t < 10) {
        const a = (-k * (x - 1) - c * v) / m;
        v += a * dt;
        x += v * dt;
        t += dt;
        samples.push(x);
        if (Math.abs(x - 1) < 0.001 && Math.abs(v) < 0.01) {
            if (++still > 12)
                break;
        }
        else
            still = 0;
    }
    const n = samples.length - 1;
    samples[n] = 1;
    const ease = (p) => {
        if (p <= 0)
            return 0;
        if (p >= 1)
            return 1;
        const f = p * n, i = Math.floor(f);
        return samples[i] + (samples[i + 1] - samples[i]) * (f - i);
    };
    return [ease, Math.round(t * 1000)];
}
/** Motion def → one keyframe track per transition group (`[frames, transition]`). */
function fromMotion(def) {
    const base = def.transition || {};
    const groups = new Map();
    for (const k of Object.keys(def.animate)) {
        const own = base[k] && typeof base[k] === 'object' ? k : '';
        groups.set(own, [...(groups.get(own) || []), k]);
    }
    return Array.from(groups.entries()).map(([g, props]) => {
        const tr = g ? { ...base, ...base[g] } : base;
        const len = Math.max(...props.map((p) => (Array.isArray(def.animate[p]) ? def.animate[p].length : 1)));
        const n = Math.max(2, len);
        const times = tr.times && tr.times.length === n ? tr.times : Array.from({ length: n }, (_, i) => i / (n - 1));
        const frames = times.map((offset) => ({ offset, props: {} }));
        for (const p of props) {
            const v = def.animate[p];
            const arr = Array.isArray(v) ? v : [def.initial && p in def.initial ? def.initial[p] : undefined, v];
            const list = arr.length === n ? arr : [...Array(n - arr.length).fill(arr[0]), ...arr];
            list.forEach((x, i) => { if (x !== undefined && x !== null)
                frames[i].props[p] = x; });
        }
        if (Array.isArray(tr.ease) && tr.ease.length && (Array.isArray(tr.ease[0]) || typeof tr.ease[0] === 'string')) {
            tr.ease.forEach((e, i) => { if (frames[i])
                frames[i].easing = Array.isArray(e) ? `cubic-bezier(${e.join(',')})` : NAMES[e] || e; });
        }
        return { frames, transition: tr, props };
    });
}
/**
 * Apply `initial` immediately and play `animate` with the transition.
 * Returns a runtime `Timeline` (one child per transition group), playing unless `paused`.
 */
function playMotion(target, def, o = {}) {
    const tl = new tween.Timeline({});
    if (def.initial)
        for (const [k, v] of Object.entries(def.initial))
            keyframes.framesToTimeline(target, [{ offset: 0, props: { [k]: v } }], { duration: 0 }).seek(0);
    for (const { frames, transition: tr } of fromMotion(def)) {
        let ease;
        let dur = (tr.duration ?? 0.3) * 1000;
        if (tr.type === 'spring')
            [ease, dur] = springEase({ ...tr, duration: tr.duration });
        else if (!Array.isArray(tr.ease) || typeof tr.ease[0] === 'number')
            ease = motionEase(tr.ease);
        const rep = tr.repeat === Infinity ? -1 : tr.repeat || 0;
        const child = keyframes.framesToTimeline(target, frames, { duration: dur, ease, repeat: rep, yoyo: rep !== 0 && tr.repeatType !== 'loop' && !!tr.repeatType });
        tl.add(child, (tr.delay || 0) * 1000);
    }
    if (!o.paused)
        tl.play();
    return tl;
}
/** The module object for `use(formatMotion)`. */
const formatMotion = { id: 'format-motion', version: registry.RUNTIME_VERSION, tier: 'basic', requires: ['core'], api: { fromMotion, playMotion, springEase, motionEase } };

exports.formatMotion = formatMotion;
exports.fromMotion = fromMotion;
exports.motionEase = motionEase;
exports.playMotion = playMotion;
exports.springEase = springEase;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.9.0/dist/runtime/format-motion.cjs.map