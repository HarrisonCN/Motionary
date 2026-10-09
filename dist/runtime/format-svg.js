import { R as RUNTIME_VERSION } from '../chunks/registry-D87dP_aR.js';
import { T as Timeline, P as Playable, p as parseValue } from '../chunks/tween-_Lld1MsF.js';
import { c as cubicBezier } from '../chunks/ease-XN8_0sXu.js';
import '../chunks/ticker-CJYI5Pxc.js';

/**
 * `motionary/runtime/format-svg` (10.2) — SVG animation with the runtime
 * (original implementation):
 *
 * - **Path geometry** without the DOM (SSR / workers): `parsePath(d)` (all
 *   commands, relative + absolute, arcs), `flattenPath(d)`, `pathLength(d)`,
 *   `pointAtLength(d, len)`, `samplePath(d, n)`.
 * - **Path morphing**: `morphPath(from, to, { points })` → `(p) => d` — both
 *   paths are resampled to the same number of points (any command mix, any
 *   point counts), aligned to the closest start point, then interpolated.
 * - **SMIL playback**: `playSmil(svg)` reads `<animate>`, `<set>`,
 *   `<animateTransform>` (translate / scale / rotate / skewX / skewY) and
 *   `<animateMotion>` (`path` or `<mpath>`, `rotate="auto"`) — `from` / `to` /
 *   `by` / `values`, `keyTimes`, `keySplines` (`calcMode="spline"`),
 *   `calcMode="discrete"`, `dur`, numeric `begin` offsets, `repeatCount`
 *   (incl. `indefinite`), `fill="freeze"` — and replays them as a runtime
 *   timeline (seek, scrub, reverse, timeScale) instead of the browser's SMIL clock.
 * - CSS-animated SVG: use `motionary/runtime/format-css` (`@keyframes` in the SVG's `<style>`).
 *
 * Not supported (documented): event / syncbase `begin` values (`click`,
 * `a.end`), `accumulate` / `additive="sum"`, `<animateColor>` (deprecated).
 */
const ARGS = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7, Z: 0 };
/** Parse path data into absolute commands (M L C Q A Z; H/V/S/T expanded). */
function parsePath(d) {
    const toks = d.match(/[a-zA-Z]|[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g) || [];
    const out = [];
    let i = 0, cmd = '', x = 0, y = 0, sx = 0, sy = 0, lc = null, lq = null;
    const num = () => parseFloat(toks[i++]);
    while (i < toks.length) {
        if (/[a-zA-Z]/.test(toks[i]))
            cmd = toks[i++];
        else if (!cmd)
            throw new Error('[motionary] format-svg: path must start with a command');
        const C = cmd.toUpperCase(), rel = cmd !== C;
        const n = ARGS[C];
        if (n === undefined)
            throw new Error(`[motionary] format-svg: unknown path command "${cmd}"`);
        if (C === 'Z') {
            out.push(['Z']);
            x = sx;
            y = sy;
            lc = lq = null;
            continue;
        }
        const a = [];
        for (let k = 0; k < n; k++)
            a.push(num());
        if (a.some((v) => Number.isNaN(v)))
            break;
        const ox = rel ? x : 0, oy = rel ? y : 0;
        switch (C) {
            case 'M':
                x = a[0] + ox;
                y = a[1] + oy;
                sx = x;
                sy = y;
                out.push(['M', x, y]);
                cmd = rel ? 'l' : 'L';
                lc = lq = null;
                break;
            case 'L':
                x = a[0] + ox;
                y = a[1] + oy;
                out.push(['L', x, y]);
                lc = lq = null;
                break;
            case 'H':
                x = a[0] + ox;
                out.push(['L', x, y]);
                lc = lq = null;
                break;
            case 'V':
                y = a[0] + (rel ? y : 0);
                out.push(['L', x, y]);
                lc = lq = null;
                break;
            case 'C': {
                const c = [a[0] + ox, a[1] + oy, a[2] + ox, a[3] + oy, a[4] + ox, a[5] + oy];
                out.push(['C', ...c]);
                lc = [c[2], c[3]];
                x = c[4];
                y = c[5];
                lq = null;
                break;
            }
            case 'S': {
                const c1 = lc ? [2 * x - lc[0], 2 * y - lc[1]] : [x, y];
                const c = [a[0] + ox, a[1] + oy, a[2] + ox, a[3] + oy];
                out.push(['C', c1[0], c1[1], ...c]);
                lc = [c[0], c[1]];
                x = c[2];
                y = c[3];
                lq = null;
                break;
            }
            case 'Q': {
                const c = [a[0] + ox, a[1] + oy, a[2] + ox, a[3] + oy];
                out.push(['Q', ...c]);
                lq = [c[0], c[1]];
                x = c[2];
                y = c[3];
                lc = null;
                break;
            }
            case 'T': {
                const c1 = lq ? [2 * x - lq[0], 2 * y - lq[1]] : [x, y];
                x = a[0] + ox;
                y = a[1] + oy;
                out.push(['Q', c1[0], c1[1], x, y]);
                lq = c1;
                lc = null;
                break;
            }
            case 'A': {
                x = a[5] + ox;
                y = a[6] + oy;
                out.push(['A', a[0], a[1], a[2], a[3], a[4], x, y]);
                lc = lq = null;
                break;
            }
        }
    }
    return out;
}
/** Endpoint-parameterised arc → points (SVG spec F.6.5 conversion). */
function arcPoints(x1, y1, rx, ry, phiDeg, large, sweep, x2, y2, seg) {
    if (!rx || !ry)
        return [[x2, y2]];
    rx = Math.abs(rx);
    ry = Math.abs(ry);
    const phi = (phiDeg * Math.PI) / 180, cos = Math.cos(phi), sin = Math.sin(phi);
    const dx = (x1 - x2) / 2, dy = (y1 - y2) / 2;
    const xp = cos * dx + sin * dy, yp = -sin * dx + cos * dy;
    const lam = (xp * xp) / (rx * rx) + (yp * yp) / (ry * ry);
    if (lam > 1) {
        rx *= Math.sqrt(lam);
        ry *= Math.sqrt(lam);
    }
    const num = rx * rx * ry * ry - rx * rx * yp * yp - ry * ry * xp * xp;
    const den = rx * rx * yp * yp + ry * ry * xp * xp;
    let co = Math.sqrt(Math.max(0, num / den));
    if (large === sweep)
        co = -co;
    const cxp = (co * rx * yp) / ry, cyp = (-co * ry * xp) / rx;
    const cx = cos * cxp - sin * cyp + (x1 + x2) / 2, cy = sin * cxp + cos * cyp + (y1 + y2) / 2;
    const ang = (ux, uy, vx, vy) => Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
    const t1 = ang(1, 0, (xp - cxp) / rx, (yp - cyp) / ry);
    let dt = ang((xp - cxp) / rx, (yp - cyp) / ry, (-xp - cxp) / rx, (-yp - cyp) / ry);
    if (!sweep && dt > 0)
        dt -= 2 * Math.PI;
    if (sweep && dt < 0)
        dt += 2 * Math.PI;
    const n = Math.max(2, Math.ceil((Math.abs(dt) / (Math.PI / 2)) * seg));
    const pts = [];
    for (let k = 1; k <= n; k++) {
        const t = t1 + (dt * k) / n;
        pts.push([cx + rx * Math.cos(t) * cos - ry * Math.sin(t) * sin, cy + rx * Math.cos(t) * sin + ry * Math.sin(t) * cos]);
    }
    return pts;
}
/** Flatten a path into polylines (one per subpath); `segments` points per curve. */
function flattenPath(d, segments = 16) {
    const cmds = typeof d === 'string' ? parsePath(d) : d;
    const subs = [];
    let cur = [], x = 0, y = 0;
    for (const c of cmds) {
        const [k, ...a] = c;
        if (k === 'M') {
            if (cur.length)
                subs.push(cur);
            cur = [[a[0], a[1]]];
            x = a[0];
            y = a[1];
            continue;
        }
        if (!cur.length)
            cur = [[x, y]];
        if (k === 'L')
            cur.push([a[0], a[1]]);
        else if (k === 'C')
            for (let i = 1; i <= segments; i++) {
                const t = i / segments, u = 1 - t;
                cur.push([u * u * u * x + 3 * u * u * t * a[0] + 3 * u * t * t * a[2] + t * t * t * a[4], u * u * u * y + 3 * u * u * t * a[1] + 3 * u * t * t * a[3] + t * t * t * a[5]]);
            }
        else if (k === 'Q')
            for (let i = 1; i <= segments; i++) {
                const t = i / segments, u = 1 - t;
                cur.push([u * u * x + 2 * u * t * a[0] + t * t * a[2], u * u * y + 2 * u * t * a[1] + t * t * a[3]]);
            }
        else if (k === 'A')
            cur.push(...arcPoints(x, y, a[0], a[1], a[2], a[3], a[4], a[5], a[6], segments / 4));
        else if (k === 'Z') {
            cur.push([cur[0][0], cur[0][1]]);
            subs.push(cur);
            x = cur[0][0];
            y = cur[0][1];
            cur = [];
            continue;
        }
        const last = cur[cur.length - 1];
        x = last[0];
        y = last[1];
    }
    if (cur.length)
        subs.push(cur);
    return subs;
}
const dist = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
/** Total length of a path. */
function pathLength(d) {
    return flattenPath(d, 48).reduce((s, pl) => s + pl.slice(1).reduce((t, p, i) => t + dist(pl[i], p), 0), 0);
}
/** Point (and tangent angle, degrees) at a distance along the path. */
function pointAtLength(d, len) {
    const pl = flattenPath(d, 48).flat();
    let acc = 0;
    for (let i = 1; i < pl.length; i++) {
        const s = dist(pl[i - 1], pl[i]);
        if (acc + s >= len || i === pl.length - 1) {
            const t = s ? Math.min(1, Math.max(0, (len - acc) / s)) : 0;
            return { x: pl[i - 1][0] + (pl[i][0] - pl[i - 1][0]) * t, y: pl[i - 1][1] + (pl[i][1] - pl[i - 1][1]) * t, angle: (Math.atan2(pl[i][1] - pl[i - 1][1], pl[i][0] - pl[i - 1][0]) * 180) / Math.PI };
        }
        acc += s;
    }
    return { x: pl[0]?.[0] ?? 0, y: pl[0]?.[1] ?? 0, angle: 0 };
}
/** `n` points evenly spaced along the path (all subpaths joined). */
function samplePath(d, n = 64) {
    const total = pathLength(d);
    return Array.from({ length: n }, (_, i) => {
        const p = pointAtLength(d, (total * i) / (n - 1 || 1));
        return [p.x, p.y];
    });
}
const r3 = (v) => Math.round(v * 1000) / 1000;
const closed = (d) => /z\s*$/i.test(d.trim());
/**
 * Morph between two paths of any shape: `const f = morphPath(a, b); el.setAttribute('d', f(0.5))`.
 * Closed paths are rotated so their start points line up (less twisting).
 */
function morphPath(from, to, o = {}) {
    const n = o.points ?? 64;
    const A = samplePath(from, n);
    let B = samplePath(to, n);
    const isClosed = closed(from) && closed(to);
    if (isClosed) {
        let best = 0, bestD = Infinity;
        for (let s = 0; s < n; s++) {
            let sum = 0;
            for (let i = 0; i < n; i += 4)
                sum += dist(A[i], B[(i + s) % n]);
            if (sum < bestD) {
                bestD = sum;
                best = s;
            }
        }
        B = B.map((_, i) => B[(i + best) % n]);
    }
    return (p) => {
        if (p <= 0)
            return from;
        if (p >= 1)
            return to;
        return 'M' + A.map((a, i) => `${r3(a[0] + (B[i][0] - a[0]) * p)} ${r3(a[1] + (B[i][1] - a[1]) * p)}`).join('L') + (isClosed ? 'Z' : '');
    };
}
/* ------------------------------------------------------------------ SMIL */
/** '2s', '150ms', '1.5', 'indefinite' → ms (NaN for indefinite / unsupported). */
function smilTime(v) {
    if (!v)
        return NaN;
    const s = v.trim();
    const m = /^(-?[\d.]+)(ms|s|min|h)?$/.exec(s);
    if (!m) {
        const c = /^(?:(\d+):)?(\d+):(\d+(?:\.\d+)?)$/.exec(s);
        return c ? ((+(c[1] || 0) * 60 + +c[2]) * 60 + +c[3]) * 1000 : NaN;
    }
    const n = parseFloat(m[1]);
    return m[2] === 'ms' ? n : m[2] === 'min' ? n * 60000 : m[2] === 'h' ? n * 3600000 : n * 1000;
}
const numList = (s) => s.trim().split(/[\s,]+/).filter(Boolean).map(Number);
const lerpNumbers = (a, b, p) => {
    const x = numList(a), y = numList(b);
    return x.map((v, i) => r3(v + ((y[i] ?? v) - v) * p)).join(' ');
};
const lerpAny = (a, b, p) => {
    try {
        const x = parseValue(a), y = parseValue(b);
        if (x.kind === 'str' || y.kind === 'str')
            throw 0; // number lists / keywords: handled below
        if (x.kind === 'col' || y.kind === 'col') {
            const ca = x.kind === 'col' ? x.c : [0, 0, 0, 1], cb = y.kind === 'col' ? y.c : [0, 0, 0, 1];
            const c = ca.map((v, i) => v + (cb[i] - v) * p);
            return `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${r3(c[3])})`;
        }
        return `${r3(x.v + (y.v - x.v) * p)}${y.u || x.u}`;
    }
    catch {
        if (/^[-\d.\s,e]+$/i.test(a) && /^[-\d.\s,e]+$/i.test(b))
            return lerpNumbers(a, b, p);
        return p < 0.5 ? a : b;
    }
};
/** Read the SMIL animation elements of an SVG (without playing them). */
function readSmil(svg) {
    const out = [];
    svg.querySelectorAll('animate, set, animateTransform, animateMotion').forEach((el) => {
        const kind = el.localName;
        const href = el.getAttribute('href') || el.getAttribute('xlink:href');
        const target = href ? svg.querySelector(href) : el.parentElement;
        if (!target)
            return;
        const begin = smilTime((el.getAttribute('begin') || '0').split(';')[0]);
        const dur = kind === 'set' ? smilTime(el.getAttribute('dur')) || 0 : smilTime(el.getAttribute('dur'));
        const rc = el.getAttribute('repeatCount');
        const rd = smilTime(el.getAttribute('repeatDur'));
        let repeat = rc === 'indefinite' || el.getAttribute('repeatDur') === 'indefinite' ? -1 : rc ? Math.max(0, Math.ceil(parseFloat(rc)) - 1) : 0;
        if (!rc && rd > 0 && dur > 0)
            repeat = Math.ceil(rd / dur) - 1;
        const attribute = kind === 'animateTransform' ? 'transform' : kind === 'animateMotion' ? 'transform' : el.getAttribute('attributeName') || '';
        let values;
        const v = el.getAttribute('values');
        if (kind === 'set')
            values = [el.getAttribute('to') || ''];
        else if (kind === 'animateMotion') {
            const mp = el.querySelector('mpath');
            const ref = mp && (mp.getAttribute('href') || mp.getAttribute('xlink:href'));
            values = [(ref && svg.querySelector(ref)?.getAttribute('d')) || el.getAttribute('path') || ''];
        }
        else if (v)
            values = v.split(';').map((s) => s.trim()).filter((s) => s !== '');
        else {
            const base = target.getAttribute(attribute) || (attribute === 'opacity' ? '1' : '0');
            const from = el.getAttribute('from') ?? base;
            const by = el.getAttribute('by');
            const to = el.getAttribute('to') ?? (by !== null ? numList(from).map((x, i) => x + (numList(by)[i] ?? 0)).join(' ') : base);
            values = [from, to];
        }
        const kt = el.getAttribute('keyTimes');
        out.push({ kind, target, attribute, begin: Number.isFinite(begin) ? begin : 0, dur: Number.isFinite(dur) ? dur : 0, repeat, freeze: el.getAttribute('fill') === 'freeze' || (kind === 'set' && !el.getAttribute('dur')) /* a <set> without dur holds its value */, values, keyTimes: kt ? kt.split(';').map(Number) : [], calcMode: el.getAttribute('calcMode') || (kind === 'animateMotion' ? 'paced' : 'linear'), type: el.getAttribute('type') || undefined, ...(el.getAttribute('rotate') ? { rotate: el.getAttribute('rotate') } : {}), ...(el.getAttribute('keySplines') ? { keySplines: el.getAttribute('keySplines') } : {}) });
    });
    return out;
}
/** One SMIL animation replayed as a runtime Playable. */
class SmilTrack extends Playable {
    constructor(info) {
        super({ repeat: info.repeat });
        this.info = info;
        this.morphs = [];
        this.base = info.target.getAttribute(info.attribute);
        this.interp = info.attribute === 'd' ? (a, b, p) => this.morph(a, b)(p) : info.kind === 'animateTransform' ? lerpNumbers : lerpAny;
        this.splines = (info.keySplines || '').split(';').filter((s) => s.trim()).map((s) => { const n = numList(s); return cubicBezier(n[0], n[1], n[2], n[3]); });
    }
    morph(a, b) {
        const key = a + '|' + b;
        const hit = this.morphs[key];
        return hit || (this.morphs[key] = morphPath(a, b));
    }
    get duration() {
        return this.info.dur;
    }
    write(v) {
        const { kind, target, type } = this.info;
        if (kind === 'animateTransform')
            target.setAttribute('transform', `${type || 'translate'}(${v})`);
        else
            target.setAttribute(this.info.attribute, v);
    }
    renderLocal(ms, ended) {
        const i = this.info;
        if (ended && ms >= i.dur && !i.freeze && this.repeat >= 0) {
            if (this.base === null)
                i.target.removeAttribute(i.attribute);
            else
                i.target.setAttribute(i.attribute, this.base);
            return;
        }
        const p = i.dur ? Math.min(1, ms / i.dur) : 1;
        if (i.kind === 'set')
            return this.write(i.values[0]);
        if (i.kind === 'animateMotion') {
            const d = i.values[0];
            const len = pathLength(d);
            const pt = pointAtLength(d, len * p);
            const rot = i.rotate;
            const a = rot === 'auto' ? pt.angle : rot === 'auto-reverse' ? pt.angle + 180 : parseFloat(rot) || 0;
            i.target.setAttribute('transform', `translate(${r3(pt.x)} ${r3(pt.y)})${a ? ` rotate(${r3(a)})` : ''}`);
            return;
        }
        const vals = i.values;
        if (vals.length === 1)
            return this.write(vals[0]);
        const kt = i.keyTimes.length === vals.length ? i.keyTimes : vals.map((_, k) => k / (vals.length - 1));
        if (i.calcMode === 'discrete') {
            const kd = i.keyTimes.length === vals.length ? i.keyTimes : vals.map((_, k) => k / vals.length);
            let k = 0;
            while (k < kd.length - 1 && p >= kd[k + 1])
                k++;
            return this.write(vals[k]);
        }
        let k = 0;
        while (k < kt.length - 2 && p > kt[k + 1])
            k++;
        const span = kt[k + 1] - kt[k] || 1;
        let local = Math.min(1, Math.max(0, (p - kt[k]) / span));
        if (i.calcMode === 'spline' && this.splines[k])
            local = this.splines[k](local);
        this.write(this.interp(vals[k], vals[k + 1], local));
    }
}
/**
 * Replay an SVG's SMIL animations with the runtime. The SMIL elements are
 * detached while the runtime drives the attributes (call `restore()` to put
 * them back). Playing unless `paused: true`.
 */
function playSmil(svg, o = {}) {
    const animations = readSmil(svg);
    const els = Array.from(svg.querySelectorAll('animate, set, animateTransform, animateMotion'));
    const parents = els.map((e) => [e, e.parentNode, e.nextSibling]);
    els.forEach((e) => e.remove());
    const tl = new Timeline({});
    for (const a of animations)
        tl.add(new SmilTrack(a), a.begin);
    if (o.timeScale)
        tl.timeScale = o.timeScale;
    if (!o.paused)
        tl.play();
    return {
        timeline: tl,
        animations,
        restore() {
            tl.kill();
            parents.forEach(([e, p, next]) => p?.insertBefore(e, next && next.parentNode === p ? next : null));
        },
    };
}
/** The module object for `use(formatSvg)`. */
const formatSvg = { id: 'format-svg', version: RUNTIME_VERSION, requires: ['core'], api: { parsePath, flattenPath, pathLength, pointAtLength, samplePath, morphPath, readSmil, playSmil, smilTime } };

export { flattenPath, formatSvg, morphPath, parsePath, pathLength, playSmil, pointAtLength, readSmil, samplePath, smilTime };
//# sourceMappingURL=format-svg.js.map
