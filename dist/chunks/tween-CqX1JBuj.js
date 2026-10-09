import { g as getTicker } from './ticker-CM_56oVy.js';

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

/**
 * Tween + timeline engine (original implementation). Times are in
 * milliseconds. Targets are plain objects (numeric props) or elements
 * (CSS: numbers with units, colours, `opacity`, custom properties, and the
 * transform shorthands `x y rotate scale scaleX scaleY skewX skewY`,
 * composed in that order). Driven by the shared ticker; a tween placed in a
 * timeline is driven by the timeline instead.
 */
const TRANSFORM = ['x', 'y', 'rotate', 'scale', 'scaleX', 'scaleY', 'skewX', 'skewY'];
const DEFAULT_UNIT = { x: 'px', y: 'px', rotate: 'deg', skewX: 'deg', skewY: 'deg', scale: '', scaleX: '', scaleY: '' };
const tstate = new WeakMap();
const isEl = (t) => typeof Element !== 'undefined' && t instanceof Element;
/** Parse '12px', '-3.5', '50%', '#0af', 'rgb(1 2 3 / .5)', 'rgba(…)'. */
function parseValue(v) {
    if (typeof v === 'number')
        return { kind: 'num', v, u: '' };
    const s = v.trim();
    let m = /^#([0-9a-f]{3,8})$/i.exec(s);
    if (m) {
        let h = m[1];
        if (h.length <= 4)
            h = h.split('').map((c) => c + c).join('');
        const n = (i) => parseInt(h.slice(i, i + 2), 16);
        return { kind: 'col', c: [n(0), n(2), n(4), h.length === 8 ? n(6) / 255 : 1] };
    }
    m = /^rgba?\(([^)]+)\)$/i.exec(s);
    if (m) {
        const p = m[1].split(/[\s,/]+/).filter(Boolean).map((x) => (x.endsWith('%') ? (parseFloat(x) / 100) * 255 : parseFloat(x)));
        return { kind: 'col', c: [p[0], p[1], p[2], p[3] === undefined ? 1 : p[3] > 1 ? p[3] / 255 : p[3]] };
    }
    if (s === 'transparent')
        return { kind: 'col', c: [0, 0, 0, 0] };
    m = /^(-?[\d.]+(?:e-?\d+)?)([a-z%]*)$/i.exec(s);
    if (m)
        return { kind: 'num', v: parseFloat(m[1]), u: m[2] };
    throw new Error(`[motionary] cannot tween value "${s}"`);
}
const lerpVal = (a, b, p) => {
    if (a.kind === 'col' || b.kind === 'col') {
        const ca = a.kind === 'col' ? a.c : [0, 0, 0, 0], cb = b.kind === 'col' ? b.c : [0, 0, 0, 0];
        const c = ca.map((x, i) => x + (cb[i] - x) * p);
        return `rgba(${Math.round(c[0])}, ${Math.round(c[1])}, ${Math.round(c[2])}, ${+c[3].toFixed(3)})`;
    }
    const v = a.v + (b.v - a.v) * p;
    const u = b.u || a.u;
    return u ? `${+v.toFixed(4)}${u}` : +v.toFixed(6);
};
const kebab = (k) => (k.startsWith('--') ? k : k.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase()));
function readProp(t, k) {
    if (!isEl(t))
        return t[k] ?? 0;
    if (TRANSFORM.includes(k)) {
        const s = tstate.get(t)?.[k];
        return s ? s.v + s.u : k.startsWith('scale') ? 1 : 0;
    }
    const inline = t.style.getPropertyValue(kebab(k));
    if (inline)
        return inline;
    const cs = typeof getComputedStyle === 'function' ? getComputedStyle(t).getPropertyValue(kebab(k)) : '';
    return cs || (k === 'opacity' ? 1 : 0);
}
function writeTransform(el) {
    const s = tstate.get(el);
    const g = (k, d) => (s[k] ? s[k].v : d);
    const u = (k) => (s[k]?.u ?? DEFAULT_UNIT[k]);
    const parts = [];
    if (s.x || s.y)
        parts.push(`translate(${g('x', 0)}${u('x') || 'px'}, ${g('y', 0)}${u('y') || 'px'})`);
    if (s.rotate)
        parts.push(`rotate(${g('rotate', 0)}${u('rotate') || 'deg'})`);
    if (s.scale)
        parts.push(`scale(${g('scale', 1)})`);
    if (s.scaleX || s.scaleY)
        parts.push(`scale(${g('scaleX', 1)}, ${g('scaleY', 1)})`);
    if (s.skewX)
        parts.push(`skewX(${g('skewX', 0)}${u('skewX') || 'deg'})`);
    if (s.skewY)
        parts.push(`skewY(${g('skewY', 0)}${u('skewY') || 'deg'})`);
    el.style.transform = parts.join(' ');
}
function writeProp(t, k, v) {
    if (!isEl(t)) {
        t[k] = typeof v === 'string' && typeof t[k] === 'number' ? parseFloat(v) : v;
        return;
    }
    if (TRANSFORM.includes(k)) {
        const p = parseValue(v);
        const s = tstate.get(t) || {};
        s[k] = { v: p.v, u: p.u };
        tstate.set(t, s);
        return;
    }
    t.style.setProperty(kebab(k), typeof v === 'number' && !['opacity', 'zIndex', 'z-index'].includes(k) && !k.startsWith('--') ? v + 'px' : String(v));
}
/** Common playback: delay, repeat, yoyo, direction, ticker attachment, promise. */
class Playable {
    constructor(o) {
        /** Playback rate multiplier. */
        this.timeScale = 1;
        this._t = 0;
        this._dir = 1;
        this._off = null;
        this._done = false;
        /** Set when owned by a timeline (then the ticker never drives it). */
        this.parent = null;
        this.delay = o.delay || 0;
        this.repeat = o.repeat || 0;
        this.yoyo = !!o.yoyo;
        this.onUpdate = o.onUpdate;
        this.onComplete = o.onComplete;
        this.finished = new Promise((r) => (this._resolve = r));
    }
    get totalDuration() {
        return this.repeat < 0 ? Infinity : this.delay + this.duration * (this.repeat + 1);
    }
    get time() {
        return this._t;
    }
    get progress() {
        const td = this.totalDuration;
        return td === Infinity ? ((this._t - this.delay) % this.duration) / this.duration : td ? this._t / td : 1;
    }
    set progress(p) {
        this.seek(p * (this.totalDuration === Infinity ? this.delay + this.duration : this.totalDuration));
    }
    get isActive() {
        return !!this._off;
    }
    get reversed() {
        return this._dir < 0;
    }
    /** Jump to `ms` (total time, including the delay) and render. */
    seek(ms) {
        const td = this.totalDuration;
        this._t = Math.max(0, Math.min(ms, td));
        const t = this._t - this.delay;
        const d = this.duration || 0;
        if (t < 0)
            this.renderLocal(0, false);
        else if (!d)
            this.renderLocal(0, true);
        else {
            let it = d === Infinity ? 0 : Math.floor(t / d);
            let local = d === Infinity ? t : t - it * d;
            if (t >= td - this.delay && td !== Infinity) {
                it = this.repeat;
                local = d;
            }
            const back = this.yoyo && it % 2 === 1;
            this.renderLocal(back ? d - local : local, local === d);
        }
        this.onUpdate?.(this.progress);
        return this;
    }
    play() {
        this._dir = 1;
        if (this._t >= this.totalDuration)
            this._t = 0;
        return this.attach();
    }
    pause() {
        this._off?.();
        this._off = null;
        return this;
    }
    /** Play backwards from the current time. */
    reverse() {
        this._dir = -1;
        if (this._t <= 0)
            this._t = this.totalDuration === Infinity ? this.delay + this.duration : this.totalDuration;
        return this.attach();
    }
    restart() {
        this._done = false;
        this.seek(0);
        return this.play();
    }
    /** Stop and detach for good. */
    kill() {
        this.pause();
        this.parent?.remove(this);
    }
    /** Promise-like: `await tween(...)`. */
    then(ok, err) {
        return this.finished.then(ok, err);
    }
    attach() {
        if (this.parent || this._off)
            return this;
        this._done = false;
        this._off = getTicker().add((_, dt) => this.advance(dt));
        return this;
    }
    advance(dt) {
        const td = this.totalDuration;
        this.seek(this._t + dt * this._dir * this.timeScale);
        if ((this._dir > 0 && this._t >= td) || (this._dir < 0 && this._t <= 0))
            this.complete();
    }
    complete() {
        this.pause();
        if (this._done)
            return;
        this._done = true;
        this.onComplete?.();
        this._resolve();
    }
}
/** A tween of one target. */
class Tween extends Playable {
    constructor(target, o) {
        super(o);
        this.tracks = null;
        this.target = target;
        this._dur = o.duration ?? 600;
        this.ease = parseEase(o.ease);
        this.toProps = o.to || {};
        this.fromProps = o.from || {};
    }
    get duration() {
        return this._dur;
    }
    /** Capture start values (first render). */
    init() {
        const keys = Array.from(new Set([...Object.keys(this.fromProps), ...Object.keys(this.toProps)]));
        return keys.map((k) => {
            const fromRaw = k in this.fromProps ? this.fromProps[k] : readProp(this.target, k);
            const toRaw = k in this.toProps ? this.toProps[k] : readProp(this.target, k);
            return { k, fromRaw, toRaw, from: parseValue(fromRaw), to: parseValue(toRaw) };
        });
    }
    renderLocal(ms, ended) {
        this.tracks || (this.tracks = this.init());
        const p = this._dur ? (ended ? this.ease(ms >= this._dur ? 1 : 0) : this.ease(ms / this._dur)) : 1;
        let tr = false;
        for (const t of this.tracks) {
            writeProp(this.target, t.k, lerpVal(t.from, t.to, p));
            if (TRANSFORM.includes(t.k))
                tr = true;
        }
        if (tr && isEl(this.target))
            writeTransform(this.target);
    }
}
/** A sequence of tweens, nested timelines and callbacks. */
class Timeline extends Playable {
    constructor(o = {}) {
        super(o);
        this.children = [];
        this.labels = {};
        this.prevStart = 0;
        this.prevEnd = 0;
        this.lastLocal = 0;
        this.defaults = o.defaults;
    }
    get duration() {
        let d = 0;
        for (const c of this.children)
            d = Math.max(d, c.start + (typeof c.item === 'function' ? 0 : c.item.totalDuration));
        return d;
    }
    resolve(pos) {
        if (pos === undefined || pos === '>')
            return this.prevEnd;
        if (typeof pos === 'number')
            return Math.max(0, pos);
        const m = /^([<>]|[\w-]+)?\s*(?:([+-])=\s*([\d.]+))?$/.exec(pos.trim());
        if (!m)
            throw new Error(`[motionary] bad timeline position "${pos}"`);
        let base = this.prevEnd;
        if (m[1] === '<')
            base = this.prevStart;
        else if (m[1] && m[1] !== '>') {
            if (!(m[1] in this.labels))
                throw new Error(`[motionary] unknown timeline label "${m[1]}"`);
            base = this.labels[m[1]];
        }
        const off = m[2] ? (m[2] === '+' ? 1 : -1) * parseFloat(m[3]) : 0;
        return Math.max(0, base + off);
    }
    /** Add a tween, timeline or callback at a position. */
    add(item, position) {
        const start = this.resolve(position);
        if (typeof item !== 'function') {
            item.pause();
            item.parent = this;
        }
        this.children.push({ item, start });
        this.prevStart = start;
        this.prevEnd = start + (typeof item === 'function' ? 0 : item.totalDuration);
        return this;
    }
    /** `tween(target, vars)` placed at `position` (stagger across several targets). */
    to(target, vars, position) {
        const list = toList(target);
        const start = this.resolve(position);
        let end = start;
        list.forEach((t, i) => {
            const tw = new Tween(t, { ...this.defaults, ...vars, delay: (vars.delay || 0) + (vars.stagger || 0) * i, paused: true });
            tw.parent = this;
            this.children.push({ item: tw, start });
            end = Math.max(end, start + tw.totalDuration);
        });
        this.prevStart = start;
        this.prevEnd = end;
        return this;
    }
    call(fn, position) {
        return this.add(fn, position);
    }
    label(name, position) {
        this.labels[name] = this.resolve(position);
        return this;
    }
    /** Time of a label, ms. */
    labelTime(name) {
        return this.labels[name];
    }
    remove(item) {
        this.children = this.children.filter((c) => c.item !== item);
    }
    /** Children in start order (callbacks excluded). */
    getChildren() {
        return this.children.filter((c) => typeof c.item !== 'function').map((c) => c.item);
    }
    renderLocal(ms) {
        const forward = ms >= this.lastLocal;
        const list = [...this.children].sort((a, b) => (forward ? a.start - b.start : b.start - a.start));
        for (const c of list) {
            if (typeof c.item === 'function') {
                if (forward && !c.fired && ms >= c.start && this.lastLocal <= c.start) {
                    c.fired = true;
                    c.item();
                }
                else if (!forward && ms < c.start)
                    c.fired = false;
                continue;
            }
            const local = ms - c.start;
            const p = c.item;
            if (local < 0) {
                if (p._started)
                    p.seek(0);
                continue;
            }
            p._started = true;
            p.seek(Math.min(local, p.totalDuration));
        }
        this.lastLocal = ms;
    }
}
function toList(t) {
    if (Array.isArray(t))
        return t;
    if (t && typeof t.length === 'number' && !isEl(t))
        return Array.from(t);
    return [t];
}
/**
 * Tween one or more targets. Returns a `Tween` (or a `Timeline` holding one
 * tween per target when several are given) that starts on the next frame
 * unless `paused`. `await` it for completion.
 */
function tween(target, o) {
    const list = toList(target);
    let p;
    if (list.length === 1)
        p = new Tween(list[0], o);
    else {
        const tl = new Timeline({ repeat: o.repeat, yoyo: o.yoyo, onUpdate: o.onUpdate, onComplete: o.onComplete, delay: o.delay });
        tl.to(list, { ...o, delay: 0, repeat: 0, yoyo: false, onUpdate: undefined, onComplete: undefined }, 0);
        p = tl;
    }
    if (!o.paused)
        p.play();
    return p;
}
/** A new timeline (plays on the next frame unless `paused`). */
function timeline(o = {}) {
    const tl = new Timeline(o);
    if (!o.paused)
        tl.play();
    return tl;
}

export { EASES as E, Playable as P, Timeline as T, Tween as a, tween as b, cubicBezier as c, parseValue as d, parseEase as p, steps as s, timeline as t };
//# sourceMappingURL=tween-CqX1JBuj.js.map
