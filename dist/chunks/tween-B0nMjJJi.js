import { g as getTicker } from './ticker-wWXyZQwD.js';
import { p as parseEase } from './ease-XN8_0sXu.js';

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
const tstate = /*#__PURE__*/ new WeakMap();
const isEl = (t) => typeof Element !== 'undefined' && t instanceof Element;
const NUM_RE = /-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?/gi;
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
    return { kind: 'str', s, parts: s.split(NUM_RE), nums: (s.match(NUM_RE) || []).map(Number) };
}
const lerpVal = (a, b, p) => {
    if (a.kind === 'str' || b.kind === 'str') {
        if (a.kind === 'str' && b.kind === 'str' && a.parts.join('\u0000') === b.parts.join('\u0000') && a.nums.length === b.nums.length) {
            return a.parts.map((t, i) => t + (i < a.nums.length ? +(a.nums[i] + (b.nums[i] - a.nums[i]) * p).toFixed(4) : '')).join('');
        }
        const src = p < 0.5 ? a : b;
        return src.kind === 'str' ? src.s : src.kind === 'num' ? (src.u ? src.v + src.u : src.v) : `rgba(${src.c.join(', ')})`;
    }
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
        if (p.kind !== 'num')
            throw new Error(`[motionary] ${k} needs a number (got "${v}")`);
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

export { Playable as P, Timeline as T, Tween as a, tween as b, parseValue as p, timeline as t };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.7.0/dist/chunks/tween-B0nMjJJi.js.map