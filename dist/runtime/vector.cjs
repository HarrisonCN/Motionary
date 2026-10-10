'use strict';

var registry = require('../chunks/registry-U0scTJZr.cjs');
var tween = require('../chunks/tween-DRtewovf.cjs');
require('../chunks/ticker-D58R9_k6.cjs');
require('../chunks/ease-HwYZnZat.cjs');

const ALLOWED = /*#__PURE__*/ new Set(['time', 'value', 'thisComp', 'thisLayer', 'thisProperty', 'Math', 'wiggle', 'loopOut', 'loopIn', 'loopOutDuration', 'loopInDuration', 'linear', 'ease', 'easeIn', 'easeOut', 'clamp', 'valueAtTime', 'framesToTime', 'timeToFrames', 'degreesToRadians', 'radiansToDegrees', 'add', 'sub', 'mul', 'div', 'length', 'true', 'false', '$bm_rt', 'index']);
function lex(src) {
    const t = [];
    const re = /\s*(?:(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(\d+\.?\d*(?:e[+-]?\d+)?|\.\d+)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|([A-Za-z_$][\w$]*)|(===|!==|==|!=|<=|>=|&&|\|\||[-+*/%()[\],.;=<>!?:{}]))/gy;
    let m, at = 0;
    while (at < src.length) {
        re.lastIndex = at;
        if (!(m = re.exec(src)))
            break;
        at = re.lastIndex;
        if (m[1])
            continue;
        const tok = m[2] || m[3] || m[4] || m[5];
        if (tok)
            t.push(m[2] ? '#' + tok : m[3] ? '"' + m[3].slice(1, -1) : tok);
    }
    if (src.slice(at).trim())
        throw new Error('expr: unexpected ' + src.slice(at, at + 10));
    return t;
}
/** Compile an expression to an AST (throws on anything outside the subset). */
function compileExpression(src) {
    const T = lex(src);
    let i = 0;
    const peek = () => T[i], next = () => T[i++];
    const eat = (s) => {
        if (T[i] !== s)
            throw new Error(`expr: expected ${s} got ${T[i]}`);
        i++;
    };
    const declared = new Set();
    const prim = () => {
        const k = next();
        if (k === undefined)
            throw new Error('expr: unexpected end');
        if (k[0] === '#')
            return ['n', +k.slice(1)];
        if (k[0] === '"')
            return ['s', k.slice(1)];
        if (k === '(') {
            const e = expr();
            eat(')');
            return e;
        }
        if (k === '[') {
            const a = [];
            while (peek() !== ']') {
                a.push(expr());
                if (peek() === ',')
                    next();
            }
            eat(']');
            return ['arr', a];
        }
        if (/^[A-Za-z_$]/.test(k)) {
            if (!ALLOWED.has(k) && !declared.has(k))
                throw new Error('expr: unsupported ' + k);
            return ['id', k];
        }
        throw new Error('expr: unexpected ' + k);
    };
    const post = () => {
        let e = prim();
        for (;;) {
            if (peek() === '.') {
                next();
                e = ['get', e, ['s', next()]];
            }
            else if (peek() === '[') {
                next();
                e = ['get', e, expr()];
                eat(']');
            }
            else if (peek() === '(') {
                next();
                const a = [];
                while (peek() !== ')') {
                    a.push(expr());
                    if (peek() === ',')
                        next();
                }
                eat(')');
                e = ['call', e, a];
            }
            else
                return e;
        }
    };
    const un = () => (peek() === '-' || peek() === '+' || peek() === '!' ? ['un', next(), un()] : post());
    const bin = (ops, sub) => () => {
        let e = sub();
        while (ops.includes(peek()))
            e = ['bin', next(), e, sub()];
        return e;
    };
    const mul = bin(['*', '/', '%'], un), add = bin(['+', '-'], mul), cmp = bin(['<', '>', '<=', '>='], add), eq = bin(['==', '!=', '===', '!=='], cmp), and = bin(['&&'], eq), or = bin(['||'], and);
    const expr = () => {
        const c = or();
        if (peek() !== '?')
            return c;
        next();
        const a = expr();
        eat(':');
        return ['if', c, a, expr()];
    };
    const stmts = [];
    while (i < T.length) {
        if (peek() === ';') {
            next();
            continue;
        }
        if (['var', 'let', 'const'].includes(peek())) {
            next();
            const name = next();
            declared.add(name);
            eat('=');
            stmts.push(['set', name, expr()]);
        }
        else if (/^[A-Za-z_$]/.test(peek() || '') && T[i + 1] === '=') {
            const name = next();
            next();
            declared.add(name);
            stmts.push(['set', name, expr()]);
        }
        else
            stmts.push(expr());
    }
    if (!stmts.length)
        throw new Error('expr: empty');
    return ['prog', stmts];
}
// ------------------------------------------------------------------ values
const isA = Array.isArray;
const zip = (a, b, f) => (isA(a) && isA(b) ? Array.from({ length: Math.max(a.length, b.length) }, (_, i) => f(a[i] ?? 0, b[i] ?? 0)) : isA(a) ? a.map((x) => f(x, b)) : isA(b) ? b.map((y) => f(a, y)) : f(a, b));
const vadd = (a, b) => (typeof a === 'string' || typeof b === 'string' ? String(a) + String(b) : zip(a, b, (x, y) => x + y));
const vsub = (a, b) => zip(a, b, (x, y) => x - y);
const vmul = (a, b) => zip(a, b, (x, y) => x * y);
const vdiv = (a, b) => zip(a, b, (x, y) => x / y);
const lerpV = (a, b, p) => vadd(a, vmul(vsub(b, a), p));
// smooth 1D value noise in [-1, 1]
const hash = (n) => {
    const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return (s - Math.floor(s)) * 2 - 1;
};
const noise = (x) => {
    const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
    return hash(i) * (1 - u) + hash(i + 1) * u;
};
function remap(ease, args) {
    const [t, a, b, c, d] = args;
    let tMin = 0, tMax = 1, v1, v2;
    if (args.length >= 5)
        (tMin = a), (tMax = b), (v1 = c), (v2 = d);
    else
        (v1 = a), (v2 = b);
    const p = tMax === tMin ? (t >= tMax ? 1 : 0) : Math.min(1, Math.max(0, (t - tMin) / (tMax - tMin)));
    return lerpV(v1, v2, ease(tMax < tMin ? 1 - p : p));
}
function loop(c, out, type = 'cycle', n = 0, dur = 0) {
    const K = c.keys, f = c.time * c.fr;
    if (K.length < 2)
        return c.value;
    const first = K[0], last = K[K.length - 1];
    let a = out ? (n > 0 ? K[Math.max(0, K.length - 1 - n)] : first) : first;
    let b = out ? last : n > 0 ? K[Math.min(K.length - 1, n)] : last;
    if (dur > 0)
        out ? (a = last - dur * c.fr) : (b = first + dur * c.fr);
    if (out ? f <= b : f >= a)
        return c.value;
    const d = b - a || 1;
    if (type === 'continue') {
        const e = out ? b : a, v = c.at(e), slope = out ? vsub(v, c.at(e - 1)) : vsub(c.at(e + 1), v);
        return vadd(v, vmul(slope, f - e));
    }
    const over = out ? f - b : a - f, k = Math.floor(over / d), r = over - k * d;
    if (type === 'pingpong')
        return c.at(out ? (k % 2 ? a + r : b - r) : k % 2 ? b - r : a + r);
    const base = c.at(out ? a + r : b - r);
    if (type === 'offset')
        return vadd(base, vmul(vsub(c.at(b), c.at(a)), out ? k + 1 : -(k + 1)));
    return base; // cycle
}
/** Evaluate a compiled expression. */
function runExpression(ast, c) {
    const vars = {};
    const fr = c.fr;
    const lib = {
        Math,
        thisComp: { frameDuration: 1 / fr },
        thisLayer: {},
        thisProperty: { value: c.value },
        index: 1,
        true: true,
        false: false,
        wiggle: (freq, amp, oct = 1, mult = 0.5, t = c.time) => {
            const w = (d) => {
                let s = 0, a = 1, fq = freq, tot = 0;
                for (let o = 0; o < Math.max(1, oct); o++)
                    (s += a * noise(t * fq + c.seed * 13.7 + d * 101.3)), (tot += a), (a *= mult), (fq *= 2);
                return s / tot;
            };
            return isA(c.value) ? c.value.map((v, d) => v + (isA(amp) ? amp[d] ?? 0 : amp) * w(d)) : c.value + amp * w(0);
        },
        loopOut: (t, n) => loop(c, true, t, n),
        loopIn: (t, n) => loop(c, false, t, n),
        loopOutDuration: (t, d) => loop(c, true, t, 0, d),
        loopInDuration: (t, d) => loop(c, false, t, 0, d),
        linear: (...a) => remap((p) => p, a),
        ease: (...a) => remap((p) => p * p * (3 - 2 * p), a),
        easeIn: (...a) => remap((p) => p * p, a),
        easeOut: (...a) => remap((p) => 1 - (1 - p) * (1 - p), a),
        clamp: (v, lo, hi) => zip(zip(v, lo, Math.max), hi, Math.min),
        valueAtTime: (t) => c.at(t * fr),
        framesToTime: (f) => f / fr,
        timeToFrames: (t = c.time) => t * fr,
        degreesToRadians: (d) => (d * Math.PI) / 180,
        radiansToDegrees: (r) => (r * 180) / Math.PI,
        add: vadd,
        sub: vsub,
        mul: vmul,
        div: vdiv,
        length: (a, b) => {
            const d = b === undefined ? a : vsub(a, b);
            return isA(d) ? Math.hypot(...d) : Math.abs(d);
        },
    };
    const ev = (n) => {
        switch (n[0]) {
            case 'n':
            case 's':
                return n[1];
            case 'arr':
                return n[1].map(ev);
            case 'id': {
                const k = n[1];
                if (k in vars)
                    return vars[k];
                if (k === 'time')
                    return c.time;
                if (k === 'value')
                    return c.value;
                return lib[k];
            }
            case 'get': {
                const o = ev(n[1]), k = ev(n[2]);
                if (o === null || o === undefined || (typeof k === 'string' && /^(__proto__|constructor|prototype)$/.test(k)))
                    throw new Error('expr: bad member');
                if (o === Math && typeof k === 'string' && !(k in Math))
                    throw new Error('expr: Math.' + k);
                return o[k];
            }
            case 'call': {
                const f = ev(n[1]);
                if (typeof f !== 'function')
                    throw new Error('expr: not a function');
                return f(...n[2].map(ev));
            }
            case 'un': {
                const v = ev(n[2]);
                return n[1] === '-' ? vmul(v, -1) : n[1] === '!' ? !v : v;
            }
            case 'bin': {
                const a = ev(n[2]), b = ev(n[3]);
                switch (n[1]) {
                    case '+': return vadd(a, b);
                    case '-': return vsub(a, b);
                    case '*': return vmul(a, b);
                    case '/': return vdiv(a, b);
                    case '%': return zip(a, b, (x, y) => x % y);
                    case '<': return a < b;
                    case '>': return a > b;
                    case '<=': return a <= b;
                    case '>=': return a >= b;
                    case '==':
                    case '===': return a === b;
                    case '!=':
                    case '!==': return a !== b;
                    case '&&': return a && b;
                    default: return a || b;
                }
            }
            case 'if':
                return ev(n[1]) ? ev(n[2]) : ev(n[3]);
            case 'set':
                return (vars[n[1]] = ev(n[2]));
            default: {
                let r;
                for (const s of n[1])
                    r = ev(s);
                return '$bm_rt' in vars ? vars.$bm_rt : r;
            }
        }
    };
    return ev(ast);
}
const cache = /*#__PURE__*/ new Map();
/** Compile (cached); null when outside the subset. */
function expression(src) {
    if (!cache.has(src)) {
        let ast = null;
        try {
            ast = compileExpression(src);
        }
        catch {
            ast = null;
        }
        cache.set(src, ast);
    }
    return cache.get(src);
}

/**
 * `motionary/runtime/vector` (10.6) — a Lottie (bodymovin JSON) + dotLottie
 * player written for Motionary (own renderer on Canvas 2D; no lottie-web
 * code). Supported subset — see the compatibility table in
 * `docs/runtime/vector.md`:
 *
 * - layers: shape, solid, null, image, precomp (with time stretch / time
 *   remap), parenting, in / out points, hidden layers;
 * - transforms: anchor, position (incl. split X / Y and spatial bezier
 *   paths), scale, rotation, skew, opacity;
 * - shapes: groups, paths, rectangles (rounded), ellipses, stars / polygons;
 *   fills (non-zero / even-odd), strokes (caps, joins, dashes), linear and
 *   radial gradient fills / strokes, **trim paths** (individually /
 *   simultaneously);
 * - **masks** (add, subtract, intersect, inverted, opacity) and **track
 *   mattes** (alpha, alpha inverted; luma approximated by alpha);
 * - keyframes: bezier easing per dimension, hold keyframes, v4 (`e`) and v5+
 *   (`s` only) files;
 * - **dotLottie** (`.lottie`): zip (stored + deflate via the native
 *   `DecompressionStream`; 11.0: entry-count / size / ratio limits enforced
 *   while inflating — `ZipLimits`, `ZIP_LIMITS`), `manifest.json` v1 / v2, several animations,
 *   embedded images.
 *
 * 10.8: **text layers** (system / web fonts by family + style, justification,
 * tracking, line height, fill + stroke, box text with wrapping, source-text
 * keyframes and expressions) and an **expression subset** (see
 * `lottie-expr.ts`: time, value, wiggle, loopOut / loopIn, linear / ease,
 * Math…; no eval). Not supported (documented): 3D layers, effects, text
 * animators, glyph outlines (`chars`), merge paths, repeaters. `lottiePlayer()` is a
 * runtime timeline (seek, reverse, scrub with `progress`, markers → labels).
 */
// ------------------------------------------------------------------ keyframes
function bez(x1, y1, x2, y2, x) {
    if (x <= 0)
        return 0;
    if (x >= 1)
        return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
        const cx = 3 * x1 * t * (1 - t) ** 2 + 3 * x2 * t * t * (1 - t) + t ** 3 - x;
        const d = 3 * x1 * (1 - t) ** 2 + 6 * (x2 - x1) * t * (1 - t) + 3 * (1 - x2) * t * t;
        if (Math.abs(cx) < 1e-5)
            break;
        if (Math.abs(d) < 1e-6)
            break;
        t -= cx / d;
    }
    t = Math.min(1, Math.max(0, t));
    return 3 * y1 * t * (1 - t) ** 2 + 3 * y2 * t * t * (1 - t) + t ** 3;
}
const pick = (v, i, d) => (Array.isArray(v) ? v[Math.min(i, v.length - 1)] ?? d : v ?? d);
const lerpAny = (a, b, p) => {
    if (typeof a === 'number')
        return a + (b - a) * (Array.isArray(p) ? p[0] : p);
    if (Array.isArray(a))
        return a.map((v, i) => (typeof v === 'number' ? v + ((b?.[i] ?? v) - v) * (Array.isArray(p) ? pick(p, i, 0) : p) : lerpAny(v, b?.[i], p)));
    if (a && typeof a === 'object' && a.v)
        return { c: a.c, v: lerpAny(a.v, b.v, p), i: lerpAny(a.i, b.i, p), o: lerpAny(a.o, b.o, p) };
    return a;
};
let FR = 30; // frame rate of the composition being rendered (expressions)
const seedOf = (s) => Array.from(s).reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 9973, 7);
const isKeyed = (p) => !!(p.a || (Array.isArray(p.k) && p.k.length && typeof p.k[0] === 'object' && 't' in p.k[0]));
/** Run a property's expression (10.8 subset) on its keyframed value; the value itself when there is none or it is unsupported. */
function withExpr(p, f, v) {
    const ast = typeof p.x === 'string' ? expression(p.x) : null;
    if (!ast)
        return v;
    try {
        const r = runExpression(ast, { time: f / FR, value: v, fr: FR, at: (g) => keyValue(p, g), keys: isKeyed(p) ? p.k.map((k) => k.t) : [], seed: seedOf(p.x) });
        return r === undefined || (typeof r === 'number' && !isFinite(r)) ? v : r;
    }
    catch {
        return v;
    }
}
/** Value of an (animated or static) property at frame `f` (10.8: with its expression applied). */
function propValue(p, f, fallback) {
    if (!p)
        return fallback;
    return withExpr(p, f, keyValue(p, f));
}
function keyValue(p, f) {
    if (!p.a && !(Array.isArray(p.k) && p.k.length && typeof p.k[0] === 'object' && 't' in p.k[0]))
        return p.k;
    const ks = p.k;
    if (f <= ks[0].t)
        return unwrap(ks[0].s);
    for (let n = 0; n < ks.length - 1; n++) {
        const a = ks[n], b = ks[n + 1];
        if (f >= b.t)
            continue;
        const s = unwrap(a.s), e = unwrap(a.e !== undefined ? a.e : b.s);
        if (a.h === 1 || e === undefined)
            return s;
        const x = (f - a.t) / (b.t - a.t || 1);
        const dims = Array.isArray(s) ? s.length : 1;
        const ease = Array.from({ length: dims }, (_, i) => bez(pick(a.o?.x, i, 0), pick(a.o?.y, i, 0), pick(a.i?.x, i, 1), pick(a.i?.y, i, 1), x));
        if (a.to && a.ti && Array.isArray(s) && (a.to.some(Boolean) || a.ti.some(Boolean))) {
            // spatial bezier (position paths)
            const t = ease[0], u = 1 - t;
            return s.map((v, i) => u * u * u * v + 3 * u * u * t * (v + (a.to[i] || 0)) + 3 * u * t * t * (e[i] + (a.ti[i] || 0)) + t * t * t * e[i]);
        }
        return lerpAny(s, e, dims > 1 ? ease : ease[0]);
    }
    const last = ks[ks.length - 1];
    return unwrap(last.s !== undefined ? last.s : ks[ks.length - 2]?.e);
}
const unwrap = (v) => (Array.isArray(v) && v.length === 1 && typeof v[0] === 'object' ? v[0] : v);
const I = [1, 0, 0, 1, 0, 0];
const mul = (m, n) => [m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1], m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3], m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5]];
const ap = (m, x, y) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
const D = Math.PI / 180;
/** Transform matrix + opacity (0–1) of a `ks` / `tr` block at frame f. */
function transformAt(ks, f) {
    if (!ks)
        return { m: I, o: 1 };
    const a = propValue(ks.a, f, [0, 0]) || [0, 0];
    let p;
    if (ks.p?.s)
        p = [propValue(ks.p.x, f, 0), propValue(ks.p.y, f, 0)];
    else
        p = propValue(ks.p, f, [0, 0]) || [0, 0];
    const s = propValue(ks.s, f, [100, 100]) || [100, 100];
    const r = propValue(ks.r ?? ks.rz, f, 0) || 0;
    const sk = propValue(ks.sk, f, 0) || 0, sa = propValue(ks.sa, f, 0) || 0;
    let m = [1, 0, 0, 1, p[0], p[1]];
    if (r)
        m = mul(m, [Math.cos(r * D), Math.sin(r * D), -Math.sin(r * D), Math.cos(r * D), 0, 0]);
    if (sk) {
        const c = Math.cos(sa * D), sn = Math.sin(sa * D), t = Math.tan(-sk * D);
        m = mul(m, mul([c, -sn, sn, c, 0, 0], mul([1, 0, t, 1, 0, 0], [c, sn, -sn, c, 0, 0])));
    }
    m = mul(m, [s[0] / 100, 0, 0, (s[1] ?? s[0]) / 100, 0, 0]);
    m = mul(m, [1, 0, 0, 1, -a[0], -(a[1] || 0)]);
    const o = propValue(ks.o, f, 100);
    return { m, o: (o ?? 100) / 100 };
}
const K = 0.5519150244935105;
function shapePath(it, f) {
    switch (it.ty) {
        case 'sh': {
            const v = propValue(it.ks, f);
            if (!v?.v?.length)
                return [];
            const pts = [v.v[0][0], v.v[0][1]];
            const n = v.v.length;
            for (let i = 1; i < n + (v.c ? 1 : 0); i++) {
                const a = v.v[(i - 1) % n], b = v.v[i % n], ao = v.o[(i - 1) % n] || [0, 0], bi = v.i[i % n] || [0, 0];
                pts.push(a[0] + ao[0], a[1] + ao[1], b[0] + bi[0], b[1] + bi[1], b[0], b[1]);
            }
            return [{ pts, closed: !!v.c }];
        }
        case 'rc': {
            const [px, py] = propValue(it.p, f, [0, 0]), [w, h] = propValue(it.s, f, [0, 0]);
            const r = Math.min(propValue(it.r, f, 0) || 0, w / 2, h / 2), x = px - w / 2, y = py - h / 2;
            if (!r)
                return [{ pts: [x + w, y, x + w, y, x + w, y + h, x + w, y + h, x + w, y + h, x, y + h, x, y + h, x, y + h, x, y, x, y, x, y, x + w, y], closed: true }];
            const k = r * K;
            // starts at top-right, clockwise like After Effects
            return [{ pts: [x + w - r, y, x + w - r + k, y, x + w, y + r - k, x + w, y + r, x + w, y + r, x + w, y + h - r, x + w, y + h - r, x + w, y + h - r + k, x + w - r + k, y + h, x + w - r, y + h, x + w - r, y + h, x + r, y + h, x + r, y + h, x + r - k, y + h, x, y + h - r + k, x, y + h - r, x, y + h - r, x, y + r, x, y + r, x, y + r - k, x + r - k, y, x + r, y, x + r, y, x + w - r, y], closed: true }];
        }
        case 'el': {
            const [cx, cy] = propValue(it.p, f, [0, 0]), [w, h] = propValue(it.s, f, [0, 0]);
            const rx = w / 2, ry = h / 2, kx = rx * K, ky = ry * K;
            return [{ pts: [cx, cy - ry, cx + kx, cy - ry, cx + rx, cy - ky, cx + rx, cy, cx + rx, cy + ky, cx + kx, cy + ry, cx, cy + ry, cx - kx, cy + ry, cx - rx, cy + ky, cx - rx, cy, cx - rx, cy - ky, cx - kx, cy - ry, cx, cy - ry], closed: true }];
        }
        case 'sr': {
            const [cx, cy] = propValue(it.p, f, [0, 0]), n = Math.round(propValue(it.pt, f, 5)), rot = (propValue(it.r, f, 0) || 0) * D;
            const or = propValue(it.or, f, 50), ir = it.sy === 1 ? propValue(it.ir, f, 25) : or;
            const count = it.sy === 1 ? n * 2 : n, pts = [];
            for (let i = 0; i <= count; i++) {
                const ang = rot - Math.PI / 2 + (i * 2 * Math.PI) / count, rr = it.sy === 1 && i % 2 ? ir : or;
                const x = cx + Math.cos(ang) * rr, y = cy + Math.sin(ang) * rr;
                if (!i)
                    pts.push(x, y);
                else
                    pts.push(pts[pts.length - 2], pts[pts.length - 1], x, y, x, y);
            }
            return [{ pts, closed: true }];
        }
    }
    return [];
}
const txContour = (c, m) => {
    const pts = c.pts.slice();
    for (let i = 0; i < pts.length; i += 2)
        [pts[i], pts[i + 1]] = ap(m, pts[i], pts[i + 1]);
    return { pts, closed: c.closed };
};
/** Flatten a contour to a polyline (for trim paths). */
function flatten(c) {
    const out = [c.pts[0], c.pts[1]];
    for (let i = 2; i < c.pts.length; i += 6) {
        const x0 = c.pts[i - 2], y0 = c.pts[i - 1];
        const [x1, y1, x2, y2, x3, y3] = c.pts.slice(i, i + 6);
        const straight = x1 === x0 && y1 === y0 && x2 === x3 && y2 === y3;
        const steps = straight ? 1 : 16;
        for (let s = 1; s <= steps; s++) {
            const t = s / steps, u = 1 - t;
            out.push(u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3, u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3);
        }
    }
    return out;
}
const polyLen = (p) => {
    let l = 0;
    for (let i = 2; i < p.length; i += 2)
        l += Math.hypot(p[i] - p[i - 2], p[i + 1] - p[i - 1]);
    return l;
};
/** Cut a polyline to [from, to] (lengths along it) → open polylines (as straight cubic contours). */
function cutPoly(p, from, to) {
    const out = [];
    let acc = 0;
    for (let i = 2; i < p.length; i += 2) {
        const x0 = p[i - 2], y0 = p[i - 1], x1 = p[i], y1 = p[i + 1], l = Math.hypot(x1 - x0, y1 - y0);
        const a = Math.max(from, acc), b = Math.min(to, acc + l);
        if (b > a && l) {
            const ta = (a - acc) / l, tb = (b - acc) / l;
            const ax = x0 + (x1 - x0) * ta, ay = y0 + (y1 - y0) * ta, bx = x0 + (x1 - x0) * tb, by = y0 + (y1 - y0) * tb;
            if (!out.length)
                out.push(ax, ay);
            out.push(ax, ay, bx, by, bx, by);
        }
        acc += l;
    }
    return out.length ? [{ pts: out, closed: false }] : [];
}
/** Apply trim paths to contours ('simultaneously' = per contour, 'individually' = along all of them). */
function trimContours(cs, start, end, offset, mode) {
    let s = start / 100, e = end / 100;
    if (s > e)
        [s, e] = [e, s];
    const o = ((offset % 360) + 360) % 360 / 360;
    if (e - s >= 1)
        return cs;
    if (e - s <= 0)
        return [];
    const polys = cs.map(flatten), lens = polys.map(polyLen);
    const cut = (poly, L, a, b) => {
        a += o;
        b += o;
        const parts = [];
        for (const k of [-1, 0, 1])
            parts.push(...cutPoly(poly, (a + k) * L, (b + k) * L));
        return parts;
    };
    if (mode === 2) {
        const total = lens.reduce((x, y) => x + y, 0), out = [];
        let acc = 0;
        polys.forEach((p, i) => {
            const a = ((s + o) % 1) * total, b = a + (e - s) * total;
            for (const k of [0, 1])
                out.push(...cutPoly(p, a - acc + k * -total, b - acc + k * -total));
            acc += lens[i];
        });
        return out;
    }
    return polys.flatMap((p, i) => cut(p, lens[i], s, e));
}
function toPath(cs) {
    const P = new Path2D();
    for (const c of cs) {
        P.moveTo(c.pts[0], c.pts[1]);
        for (let i = 2; i < c.pts.length; i += 6)
            P.bezierCurveTo(c.pts[i], c.pts[i + 1], c.pts[i + 2], c.pts[i + 3], c.pts[i + 4], c.pts[i + 5]);
        if (c.closed)
            P.closePath();
    }
    return P;
}
// ------------------------------------------------------------------ colours
const col = (c, o = 1) => {
    if (!c)
        return 'transparent';
    const big = c.some((v) => v > 1);
    const v = c.map((x) => Math.round(Math.min(1, Math.max(0, big ? x / 255 : x)) * 255));
    return `rgba(${v[0]},${v[1]},${v[2]},${Math.max(0, Math.min(1, (c[3] ?? 1) * o))})`;
};
function buildOps(items, f, parent, parentO, ops) {
    const tr = items.find((x) => x.ty === 'tr');
    const { m: tm, o: to } = transformAt(tr, f);
    const m = mul(parent, tm), o = parentO * to;
    const shapes = [];
    const mine = [];
    for (const it of items) {
        if (it.hd)
            continue;
        if (it.ty === 'gr') {
            const sub = [];
            shapes.push(...buildOps(it.it || [], f, m, o, sub));
            mine.push(...sub);
        }
        else if (it.ty === 'sh' || it.ty === 'rc' || it.ty === 'el' || it.ty === 'sr')
            shapes.push({ c: shapePath(it, f).map((c) => txContour(c, m)) });
        else if (it.ty === 'tm') {
            // modifies every path above it (also paths already referenced by styles above — After Effects order)
            const s = propValue(it.s, f, 0), e = propValue(it.e, f, 100), off = propValue(it.o, f, 0);
            if (it.m === 2) {
                const all = trimContours(shapes.flatMap((x) => x.c), s, e, off, 2);
                shapes.forEach((x, i) => (x.c = i ? [] : all));
            }
            else
                shapes.forEach((x) => (x.c = trimContours(x.c, s, e, off, 1)));
        }
        else if (it.ty === 'fl' || it.ty === 'gf')
            mine.push({ kind: 'fill', it, shapes: shapes.slice(), m, o });
        else if (it.ty === 'st' || it.ty === 'gs')
            mine.push({ kind: 'stroke', it, shapes: shapes.slice(), m, o });
    }
    // items listed first paint on top → draw in reverse
    ops.push(...mine.reverse());
    return shapes;
}
function paint(ctx, op, f) {
    const it = op.it;
    const paths = op.shapes.flatMap((x) => x.c);
    if (!paths.length)
        return;
    const opacity = (propValue(it.o, f, 100) / 100) * op.o;
    let style;
    if (it.ty === 'gf' || it.ty === 'gs') {
        const sp = ap(op.m, ...propValue(it.s, f, [0, 0])), ep = ap(op.m, ...propValue(it.e, f, [0, 0]));
        const g = it.t === 2 ? ctx.createRadialGradient(sp[0], sp[1], 0, sp[0], sp[1], Math.hypot(ep[0] - sp[0], ep[1] - sp[1])) : ctx.createLinearGradient(sp[0], sp[1], ep[0], ep[1]);
        const n = it.g?.p || 0, k = propValue(it.g?.k, f, []) || [];
        const alphas = k.length >= n * 4 + 2 ? k.slice(n * 4) : null;
        for (let i = 0; i < n; i++) {
            let a = 1;
            if (alphas) {
                // opacity stops: pairs [offset, alpha]; use the nearest one
                let best = 1, bd = Infinity;
                for (let j = 0; j + 1 < alphas.length; j += 2) {
                    const d = Math.abs(alphas[j] - k[i * 4]);
                    if (d < bd)
                        [bd, best] = [d, alphas[j + 1]];
                }
                a = best;
            }
            g.addColorStop(Math.min(1, Math.max(0, k[i * 4])), col([k[i * 4 + 1], k[i * 4 + 2], k[i * 4 + 3], a]));
        }
        style = g;
    }
    else
        style = col(propValue(it.c, f, [0, 0, 0]));
    ctx.save();
    ctx.globalAlpha *= Math.max(0, Math.min(1, opacity));
    const path = toPath(paths);
    if (op.kind === 'fill') {
        ctx.fillStyle = style;
        ctx.fill(path, it.r === 2 ? 'evenodd' : 'nonzero');
    }
    else {
        const sc = Math.sqrt(Math.abs(op.m[0] * op.m[3] - op.m[1] * op.m[2])) || 1;
        ctx.strokeStyle = style;
        ctx.lineWidth = propValue(it.w, f, 1) * sc;
        ctx.lineCap = ['butt', 'round', 'square'][(it.lc || 2) - 1] || 'round';
        ctx.lineJoin = ['miter', 'round', 'bevel'][(it.lj || 2) - 1] || 'round';
        ctx.miterLimit = it.ml || 4;
        if (it.d?.length) {
            const dashes = it.d.filter((d) => d.n === 'd' || d.n === 'g').map((d) => propValue(d.v, f, 0) * sc);
            const off = it.d.find((d) => d.n === 'o');
            if (dashes.length && dashes.some((x) => x > 0))
                ctx.setLineDash(dashes.length % 2 ? [...dashes, ...dashes] : dashes);
            if (off)
                ctx.lineDashOffset = -propValue(off.v, f, 0) * sc;
        }
        ctx.stroke(path);
    }
    ctx.restore();
}
const scratch = (w, h) => {
    const g = globalThis;
    const c = typeof g.OffscreenCanvas === 'function' ? new g.OffscreenCanvas(w, h) : Object.assign(document.createElement('canvas'), { width: w, height: h });
    return { c, x: c.getContext('2d') };
};
const localFrame = (L, f) => (f - (L.st || 0)) / (L.sr || 1);
function layerMatrix(L, all, f, depth = 0) {
    const own = transformAt(L.ks, localFrame(L, f)).m;
    if (L.parent === undefined || depth > 50)
        return own;
    const P = all.find((x) => x.ind === L.parent);
    return P ? mul(layerMatrix(P, all, f, depth + 1), own) : own;
}
function maskPath(L, f, m, ctx, w, h) {
    // composite the masks into the layer's pixels (already drawn in ctx)
    const masks = (L.masksProperties || []).filter((k) => k.mode !== 'n');
    if (!masks.length)
        return;
    const { c: mc, x: mx } = scratch(w, h);
    mx.setTransform(ctx.getTransform());
    masks.forEach((k, i) => {
        const v = propValue(k.pt, f);
        if (!v?.v)
            return;
        const path = toPath(shapePath({ ty: 'sh', ks: { k: v } }, f).map((c) => txContour(c, m)));
        const o = (propValue(k.o, f, 100) ?? 100) / 100;
        mx.save();
        mx.fillStyle = `rgba(0,0,0,${o})`;
        const mode = k.mode;
        if (k.inv) {
            const full = new Path2D();
            full.rect(-1e5, -1e5, 2e5, 2e5);
            full.addPath(path);
            mx.globalCompositeOperation = mode === 's' ? 'destination-out' : mode === 'i' ? 'destination-in' : i ? 'source-over' : 'source-over';
            mx.fill(full, 'evenodd');
        }
        else {
            mx.globalCompositeOperation = mode === 's' ? 'destination-out' : mode === 'i' && i ? 'destination-in' : 'source-over';
            if (mode === 's' && !i) {
                // first mask subtracts from "everything"
                mx.save();
                mx.setTransform(1, 0, 0, 1, 0, 0);
                mx.globalCompositeOperation = 'source-over';
                mx.fillRect(0, 0, w, h);
                mx.restore();
                mx.globalCompositeOperation = 'destination-out';
            }
            mx.fill(path);
        }
        mx.restore();
    });
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(mc, 0, 0);
    ctx.restore();
}
/** Draw frame `f` of an animation (or precomp layer list) into `ctx` with base matrix `base`. */
function drawLayers(ctx, anim, layers, f, o, base, w, h, depth = 0) {
    if (depth > 16)
        return;
    for (let i = layers.length - 1; i >= 0; i--) {
        const L = layers[i];
        if (L.td || L.hd || L.ty === 3 || f < L.ip || f >= L.op)
            continue;
        const matte = L.tt ? layers[i - 1] : undefined;
        const needsOff = !!(matte || (L.masksProperties && L.masksProperties.length));
        const target = needsOff ? scratch(w, h) : null;
        const x = target ? target.x : ctx;
        x.save();
        x.setTransform(ctx.getTransform());
        const m = mul(base, layerMatrix(L, layers, f));
        const lf = localFrame(L, f);
        x.globalAlpha *= transformAt(L.ks, lf).o; // opacity is not inherited from parents (After Effects)
        if (L.ty === 4) {
            const ops = [];
            buildOps(L.shapes || [], lf, m, 1, ops);
            for (const p of ops)
                paint(x, p, lf);
        }
        else if (L.ty === 5) {
            drawText(x, anim, L, lf, m);
        }
        else if (L.ty === 1) {
            x.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
            x.fillStyle = L.sc || '#000';
            x.fillRect(0, 0, L.sw || 0, L.sh || 0);
        }
        else if (L.ty === 2) {
            const img = o.images?.[L.refId || ''];
            if (img) {
                x.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
                x.drawImage(img, 0, 0);
            }
        }
        else if (L.ty === 0) {
            const asset = anim.assets?.find((a) => a.id === L.refId);
            if (asset?.layers) {
                let cf = lf;
                if (L.tm)
                    cf = propValue(L.tm, f, 0) * anim.fr;
                x.save();
                x.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
                if (L.w && L.h) {
                    x.beginPath();
                    x.rect(0, 0, L.w, L.h);
                    x.clip();
                }
                drawLayers(x, anim, asset.layers, cf, o, I, w, h, depth + 1);
                x.restore();
            }
        }
        if (L.masksProperties?.length)
            maskPath(L, lf, m, x, w, h);
        x.restore();
        if (target) {
            if (matte) {
                const mt = scratch(w, h);
                mt.x.setTransform(ctx.getTransform());
                const hidden = { ...matte, td: 0 };
                drawLayers(mt.x, anim, [hidden], f, o, base, w, h, depth + 1);
                target.x.save();
                target.x.setTransform(1, 0, 0, 1, 0, 0);
                target.x.globalCompositeOperation = L.tt === 2 || L.tt === 4 ? 'destination-out' : 'destination-in';
                target.x.drawImage(mt.c, 0, 0);
                target.x.restore();
            }
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.drawImage(target.c, 0, 0);
            ctx.restore();
        }
    }
}
// ------------------------------------------------------------------ text layers (10.8)
function textDoc(L, f) {
    const d = L.t?.d;
    let s = d?.k?.[0]?.s;
    for (const k of d?.k || [])
        if (k.t <= f)
            s = k.s;
    if (s && typeof d.x === 'string')
        s = { ...s, t: String(withExpr({ k: s.t, x: d.x }, f, s.t)) };
    return s;
}
function drawText(x, anim, L, f, m) {
    const d = textDoc(L, f);
    if (!d)
        return;
    x.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
    const font = anim.fonts?.list?.find((q) => q.fName === d.f);
    const st = (font?.fStyle || d.f || '').toLowerCase();
    const wt = /black|heavy/.test(st) ? 900 : /extra ?bold/.test(st) ? 800 : /semi ?bold|demi/.test(st) ? 600 : /bold/.test(st) ? 700 : /medium/.test(st) ? 500 : /light/.test(st) ? 300 : /thin/.test(st) ? 100 : 400;
    x.font = `${/italic|oblique/.test(st) ? 'italic ' : ''}${wt} ${d.s}px ${font?.fFamily ? `"${font.fFamily}", ` : ''}sans-serif`;
    x.textAlign = d.j === 1 ? 'right' : d.j === 2 ? 'center' : 'left';
    x.textBaseline = 'alphabetic';
    if ('letterSpacing' in x)
        x.letterSpacing = `${((d.tr || 0) * d.s) / 1000}px`;
    const lh = d.lh || d.s * 1.2;
    let lines = String(d.t ?? '').split(/\r\n|\r|\n|\u0003/);
    let ox = 0, oy = 0;
    if (d.sz) {
        // box text: wrap to the box width; `ps` is the box's top-left
        const bw = d.sz[0], [px, py] = d.ps || [0, 0];
        lines = lines.flatMap((ln) => {
            const out = [];
            let cur = '';
            for (const w of ln.split(' ')) {
                const t = cur ? cur + ' ' + w : w;
                if (cur && x.measureText(t).width > bw)
                    out.push(cur), (cur = w);
                else
                    cur = t;
            }
            return out.concat(cur);
        });
        ox = px + (d.j === 1 ? bw : d.j === 2 ? bw / 2 : 0);
        oy = py + d.s;
    }
    const fill = d.fc ? col(d.fc) : null, stroke = d.sc && d.sw ? col(d.sc) : null;
    lines.forEach((ln, i) => {
        const y = oy + i * lh;
        const F = () => fill && ((x.fillStyle = fill), x.fillText(ln, ox, y));
        const S = () => stroke && ((x.strokeStyle = stroke), (x.lineWidth = d.sw), (x.lineJoin = 'round'), x.strokeText(ln, ox, y));
        if (d.of)
            F(), S();
        else
            S(), F();
    });
}
/** Render one frame onto a 2D context sized `width × height` (the animation is fitted with `fit`). */
function renderLottieFrame(ctx, anim, frame, o = {}) {
    const W = o.width ?? ctx.canvas.width, H = o.height ?? ctx.canvas.height;
    FR = anim.fr || 30;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, W, H);
    if (o.background) {
        ctx.fillStyle = o.background;
        ctx.fillRect(0, 0, W, H);
    }
    const sx = W / anim.w, sy = H / anim.h;
    const s = o.fit === 'cover' ? Math.max(sx, sy) : Math.min(sx, sy);
    if (o.fit === 'fill')
        ctx.setTransform(sx, 0, 0, sy, 0, 0);
    else
        ctx.setTransform(s, 0, 0, s, (W - anim.w * s) / 2, (H - anim.h * s) / 2);
    ctx.beginPath();
    ctx.rect(0, 0, anim.w, anim.h);
    ctx.clip();
    drawLayers(ctx, anim, anim.layers, frame, o, I, W, H);
    ctx.restore();
}
/** List what a file uses that this renderer skips (3D layers, effects, text, expressions, merge paths, repeaters…). */
function inspectLottie(anim) {
    const u = new Set();
    const walkShapes = (items) => items?.forEach((it) => {
        if (it.ty === 'gr')
            walkShapes(it.it);
        if (it.ty === 'mm')
            u.add('merge paths');
        if (it.ty === 'rp')
            u.add('repeaters');
        if (it.ty === 'rd')
            u.add('round corners');
        if (it.ty === 'pb')
            u.add('pucker / bloat');
        if (it.ty === 'tw')
            u.add('twist');
    });
    const walk = (ls) => ls.forEach((l) => {
        if (l.ddd)
            u.add('3D layers');
        if (l.ef?.length)
            u.add('effects');
        if (l.ty === 5 && l.t?.a?.length)
            u.add('text animators (range selectors)');
        if (l.tt === 3 || l.tt === 4)
            u.add('luma mattes (approximated by alpha)');
        JSON.stringify([l.ks, l.t, l.shapes], (k, v) => {
            if (k === 'x' && typeof v === 'string' && !expression(v))
                u.add('expressions outside the supported subset');
            return v;
        });
        walkShapes(l.shapes || []);
    });
    walk(anim.layers);
    anim.assets?.forEach((a) => a.layers && walk(a.layers));
    if (anim.chars?.length)
        u.add('glyph outlines (chars): drawn with system fonts');
    return { layers: anim.layers.length, unsupported: [...u] };
}
const ZIP_LIMITS = { maxEntries: 1000, maxEntryBytes: 32 << 20, maxTotalBytes: 64 << 20, maxRatio: 100 };
const zipErr = (m) => new Error(`[motionary] vector: zip limit exceeded — ${m} (see ZipLimits)`);
/** Read a zip archive's entries (central directory; stored + deflate). Pure; inflating uses `DecompressionStream`. */
function unzipEntries(input, limits = {}) {
    const L = { ...ZIP_LIMITS, ...limits };
    const b = input instanceof Uint8Array ? input : new Uint8Array(input);
    const v = new DataView(b.buffer, b.byteOffset, b.byteLength);
    let e = b.length - 22;
    while (e >= 0 && v.getUint32(e, true) !== 0x06054b50)
        e--;
    if (e < 0)
        throw new Error('[motionary] vector: not a zip / .lottie file');
    const count = v.getUint16(e + 10, true);
    if (count > L.maxEntries)
        throw zipErr(`${count} entries > maxEntries ${L.maxEntries}`);
    let p = v.getUint32(e + 16, true);
    const out = [];
    for (let i = 0; i < count && p + 46 <= b.length; i++) {
        if (v.getUint32(p, true) !== 0x02014b50)
            break;
        const method = v.getUint16(p + 10, true), csize = v.getUint32(p + 20, true), size = v.getUint32(p + 24, true), nlen = v.getUint16(p + 28, true), xlen = v.getUint16(p + 30, true), clen = v.getUint16(p + 32, true), lho = v.getUint32(p + 42, true);
        const name = new TextDecoder().decode(b.subarray(p + 46, p + 46 + nlen));
        if (size > L.maxEntryBytes)
            throw zipErr(`${name}: ${size} bytes > maxEntryBytes ${L.maxEntryBytes}`);
        if (lho + 30 > b.length)
            throw new Error('[motionary] vector: corrupt zip (' + name + ')');
        const lnl = v.getUint16(lho + 26, true), lxl = v.getUint16(lho + 28, true);
        const start = lho + 30 + lnl + lxl;
        out.push({ name, method, size, data: b.subarray(start, start + csize) });
        p += 46 + nlen + xlen + clen;
    }
    return out;
}
/** Inflate one entry, counting the real output against `limits`; `used` is shared across one archive. */
async function inflateEntry(e, limits = {}, used = { total: 0 }) {
    const L = { ...ZIP_LIMITS, ...limits };
    const check = (n) => {
        if (n > L.maxEntryBytes)
            throw zipErr(`${e.name}: > maxEntryBytes ${L.maxEntryBytes}`);
        if (used.total + n > L.maxTotalBytes)
            throw zipErr(`archive > maxTotalBytes ${L.maxTotalBytes}`);
        if (n > 1 << 20 && n > Math.max(1, e.data.length) * L.maxRatio)
            throw zipErr(`${e.name}: compression ratio > maxRatio ${L.maxRatio}`);
    };
    if (e.method === 0) {
        check(e.data.length);
        used.total += e.data.length;
        return e.data;
    }
    if (e.method !== 8)
        throw new Error(`[motionary] vector: zip method ${e.method} unsupported (${e.name})`);
    const DS = globalThis.DecompressionStream;
    if (!DS)
        throw new Error('[motionary] vector: DecompressionStream is missing — cannot inflate .lottie entries here');
    const r = new Response(e.data).body.pipeThrough(new DS('deflate-raw')).getReader();
    const parts = [];
    let n = 0;
    for (;;) {
        const { done, value } = await r.read();
        if (done)
            break;
        n += value.length;
        try {
            check(n);
        }
        catch (err) {
            r.cancel().catch(() => undefined);
            throw err;
        }
        parts.push(value);
    }
    used.total += n;
    const out = new Uint8Array(n);
    let o = 0;
    for (const x of parts)
        out.set(x, (o += x.length) - x.length);
    return out;
}
/** Unpack a `.lottie` (dotLottie v1 or v2). 11.0: `limits` (zip-bomb protection, safe defaults in `ZIP_LIMITS`). */
async function parseDotLottie(input, o = {}) {
    const entries = unzipEntries(input, o.limits);
    const files = {};
    const used = { total: 0 };
    for (const e of entries)
        if (!e.name.endsWith('/'))
            files[e.name.replace(/^\.?\//, '')] = await inflateEntry(e, o.limits, used);
    const td = new TextDecoder();
    const json = (n) => JSON.parse(td.decode(files[n]));
    const manifest = files['manifest.json'] ? json('manifest.json') : { animations: [] };
    const animations = {}, images = {}, themes = {}, stateMachines = {};
    for (const [name, data] of Object.entries(files)) {
        const m = /^(animations|a)\/(.+)\.json$/.exec(name);
        if (m)
            animations[m[2]] = JSON.parse(td.decode(data));
        else if (/^(images|i)\//.test(name))
            images[name.replace(/^(images|i)\//, '')] = data;
        else if (/^(themes|t)\/(.+)\.json$/.test(name))
            themes[name.replace(/^(themes|t)\/|\.json$/g, '')] = JSON.parse(td.decode(data));
        else if (/^(states|s)\/(.+)\.json$/.test(name))
            stateMachines[name.replace(/^(states|s)\/|\.json$/g, '')] = JSON.parse(td.decode(data));
    }
    return { manifest, animations, images, themes, stateMachines };
}
/** Decode the images an animation references (embedded data URIs, dotLottie images, or URLs relative to `base`). */
async function loadLottieImages(anim, o = {}) {
    const out = {};
    await Promise.all((anim.assets || []).filter((a) => a.p && !a.layers).map(async (a) => {
        let blob = null;
        if (a.p.startsWith('data:'))
            blob = await (await fetch(a.p)).blob();
        else {
            const key = Object.keys(o.files || {}).find((k) => k.endsWith('/' + a.p) || k === a.p);
            if (key)
                blob = new Blob([o.files[key]], { type: /\.jpe?g$/i.test(key) ? 'image/jpeg' : /\.webp$/i.test(key) ? 'image/webp' : 'image/png' });
            else if (o.base)
                blob = await (await fetch(new URL((a.u || '') + a.p, o.base).href)).blob();
        }
        if (blob)
            out[a.id] = await createImageBitmap(blob);
    }));
    return out;
}
/** Fetch a `.json` Lottie or a `.lottie` file. `animation` picks one of several in a dotLottie (default: the manifest's first / active one). */
async function loadLottie(src, o = {}) {
    let bytes;
    const base = o.base || (typeof src === 'string' && typeof location !== 'undefined' ? new URL(src, location.href).href : undefined);
    if (typeof src === 'string') {
        const r = await fetch(src);
        if (!r.ok)
            throw new Error(`[motionary] vector: could not load ${src} (${r.status})`);
        bytes = new Uint8Array(await r.arrayBuffer());
    }
    else
        bytes = src instanceof Uint8Array ? src : new Uint8Array(src);
    if (bytes[0] === 0x50 && bytes[1] === 0x4b) {
        const dl = await parseDotLottie(bytes, { limits: o.limits });
        const ids = Object.keys(dl.animations);
        const want = o.animation || dl.manifest.activeAnimationId || dl.manifest.animations?.[0]?.id || ids[0];
        const animation = dl.animations[want] || dl.animations[ids[0]];
        if (!animation)
            throw new Error('[motionary] vector: the .lottie file has no animations');
        const files = {};
        for (const [k, v] of Object.entries(dl.images))
            files[k] = v;
        return { animation, images: await loadLottieImages(animation, { files }), dotLottie: dl };
    }
    const animation = JSON.parse(new TextDecoder().decode(bytes));
    return { animation, images: await loadLottieImages(animation, { base }), dotLottie: null };
}
class LPlayer extends tween.Playable {
    constructor(canvas, animation, o) {
        super({ repeat: o.loop === true || o.loop === undefined ? -1 : typeof o.loop === 'number' ? o.loop : 0, yoyo: !!o.bounce });
        this.canvas = canvas;
        this.animation = animation;
        this.o = o;
        this.frame = 0;
        this.markers = {};
        this.timeScale = o.speed || 1;
        const c = canvas.getContext('2d');
        if (!c)
            throw new Error('[motionary] vector: no 2D canvas context');
        this.ctx = c;
        for (const m of animation.markers || [])
            this.markers[m.cm] = [m.tm, m.tm + m.dr];
        this.seg = [animation.ip, animation.op];
        this.setSegment(o.segment || null);
        this.goToFrame(this.seg[0]);
        if (o.autoplay !== false)
            this.play();
    }
    get totalFrames() {
        return this.seg[1] - this.seg[0];
    }
    get duration() {
        return (this.totalFrames / this.animation.fr) * 1000;
    }
    setSegment(s) {
        this.seg = !s ? [this.animation.ip, this.animation.op] : typeof s === 'string' ? this.markers[s] || [this.animation.ip, this.animation.op] : s;
    }
    goToFrame(f) {
        this.frame = f;
        renderLottieFrame(this.ctx, this.animation, f, this.o);
    }
    renderLocal(ms) {
        const f = Math.min(this.seg[0] + (ms / 1000) * this.animation.fr, this.seg[1] - 0.001);
        if (Math.abs(f - this.frame) < 0.01)
            return;
        this.goToFrame(f);
    }
}
/** Play a Lottie animation on a canvas as a runtime timeline. */
function lottiePlayer(canvas, animation, o = {}) {
    return new LPlayer(canvas, animation, o);
}
/** Evaluate a Lottie expression (10.8 subset) on a value at `time` seconds — `undefined` when it is outside the subset. */
function evalExpression(src, value, time = 0, fr = 30) {
    const ast = expression(src);
    try {
        return ast ? runExpression(ast, { time, value, fr, at: () => value, keys: [], seed: seedOf(src) }) : undefined;
    }
    catch {
        return undefined;
    }
}
/** The module object for `use(vector)`. */
const vector = { id: 'vector', version: registry.RUNTIME_VERSION, tier: 'standard', requires: ['core'], api: { evalExpression, loadLottie, parseDotLottie, unzipEntries, lottiePlayer, renderLottieFrame, inspectLottie, propValue, transformAt, trimContours, loadLottieImages } };

exports.ZIP_LIMITS = ZIP_LIMITS;
exports.evalExpression = evalExpression;
exports.inflateEntry = inflateEntry;
exports.inspectLottie = inspectLottie;
exports.loadLottie = loadLottie;
exports.loadLottieImages = loadLottieImages;
exports.lottiePlayer = lottiePlayer;
exports.parseDotLottie = parseDotLottie;
exports.propValue = propValue;
exports.renderLottieFrame = renderLottieFrame;
exports.transformAt = transformAt;
exports.trimContours = trimContours;
exports.unzipEntries = unzipEntries;
exports.vector = vector;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.8.0/dist/runtime/vector.cjs.map