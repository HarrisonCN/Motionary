'use strict';

const out = (f) => (t) => 1 - f(1 - t);
const inOut = (f) => (t) => (t < 0.5 ? f(t * 2) / 2 : 1 - f((1 - t) * 2) / 2);
const pow = (p) => (t) => Math.pow(t, p);
const sine = (t) => 1 - Math.cos((t * Math.PI) / 2);
const expo = (t) => (t === 0 ? 0 : Math.pow(2, 10 * t - 10));
const circ = (t) => 1 - Math.sqrt(1 - t * t);
const back = (s = 1.70158) => (t) => t * t * ((s + 1) * t - s);
const elastic = (t) => (t === 0 || t === 1 ? t : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * ((2 * Math.PI) / 3)));
const bounceOut = (t) => {
    const n = 7.5625, d = 2.75;
    if (t < 1 / d)
        return n * t * t;
    if (t < 2 / d)
        return n * (t -= 1.5 / d) * t + 0.75;
    if (t < 2.5 / d)
        return n * (t -= 2.25 / d) * t + 0.9375;
    return n * (t -= 2.625 / d) * t + 0.984375;
};
/** cubic-bezier(x1, y1, x2, y2), solved with Newton steps + bisection fallback. */
function cubicBezier(x1, y1, x2, y2) {
    const a = (p1, p2) => 1 - 3 * p2 + 3 * p1;
    const b = (p1, p2) => 3 * p2 - 6 * p1;
    const c = (p1) => 3 * p1;
    const at = (t, p1, p2) => ((a(p1, p2) * t + b(p1, p2)) * t + c(p1)) * t;
    const slope = (t, p1, p2) => 3 * a(p1, p2) * t * t + 2 * b(p1, p2) * t + c(p1);
    return (x) => {
        if (x <= 0 || x >= 1)
            return x <= 0 ? 0 : 1;
        let t = x;
        for (let i = 0; i < 6; i++) {
            const s = slope(t, x1, x2);
            if (Math.abs(s) < 1e-6)
                break;
            t -= (at(t, x1, x2) - x) / s;
        }
        if (t < 0 || t > 1 || Math.abs(at(t, x1, x2) - x) > 1e-4) {
            let lo = 0, hi = 1;
            t = x;
            for (let i = 0; i < 30; i++) {
                const v = at(t, x1, x2);
                if (Math.abs(v - x) < 1e-6)
                    break;
                if (v < x)
                    lo = t;
                else
                    hi = t;
                t = (lo + hi) / 2;
            }
        }
        return at(t, y1, y2);
    };
}
/** steps(n, 'end' | 'start'). */
const steps = (n, pos = 'end') => (t) => {
    const k = pos === 'start' ? Math.ceil(t * n) : Math.floor(t * n);
    return Math.min(1, Math.max(0, k / n));
};
/** Named eases: linear, quad/cubic/quart/quint, sine, expo, circ, back, elastic, bounce — each `.in`, `.out`, `.inOut` via 'name-in' | 'name-out' | 'name-in-out'. */
const BASE = { quad: pow(2), cubic: pow(3), quart: pow(4), quint: pow(5), sine, expo, circ, back: back(), elastic, bounce: out(bounceOut) };
const EASES = { linear: (t) => t, ease: cubicBezier(0.25, 0.1, 0.25, 1), 'ease-in': cubicBezier(0.42, 0, 1, 1), 'ease-out': cubicBezier(0, 0, 0.58, 1), 'ease-in-out': cubicBezier(0.42, 0, 0.58, 1), smooth: cubicBezier(0.22, 1, 0.36, 1) };
for (const [k, f] of Object.entries(BASE)) {
    EASES[`${k}-in`] = f;
    EASES[`${k}-out`] = out(f);
    EASES[`${k}-in-out`] = inOut(f);
}
/** Resolve an ease: a function, a name ('cubic-out', 'ease-in-out', 'linear'), 'cubic-bezier(a,b,c,d)' or 'steps(n[, start|end])'. Unknown names throw. */
function parseEase(e) {
    if (typeof e === 'function')
        return e;
    if (!e)
        return EASES['cubic-out'];
    const s = e.trim();
    if (EASES[s])
        return EASES[s];
    let m = /^cubic-bezier\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)$/.exec(s);
    if (m)
        return cubicBezier(+m[1], +m[2], +m[3], +m[4]);
    m = /^steps\(\s*(\d+)\s*(?:,\s*(jump-)?(start|end)\s*)?\)$/.exec(s);
    if (m)
        return steps(+m[1], m[3] || 'end');
    if (s === 'step-start')
        return steps(1, 'start');
    if (s === 'step-end')
        return steps(1, 'end');
    throw new Error(`[motionary] unknown ease "${s}" — use a name from EASES, cubic-bezier(…) or steps(…)`);
}

exports.EASES = EASES;
exports.cubicBezier = cubicBezier;
exports.parseEase = parseEase;
exports.steps = steps;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v13.0.0/dist/chunks/ease-HwYZnZat.cjs.map