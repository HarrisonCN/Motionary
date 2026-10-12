'use strict';

var base = require('./base-BvH4nAcv.cjs');
var core = require('./core-DjjKLmZ6.cjs');
var components_tokens = require('../components/tokens.cjs');
var spring$1 = require('./spring-XEl_diDJ.cjs');

/**
 * 14.0 Motion Engine v2 — the one controller every animation and composition returns.
 *
 * A motion is a *node*: a span `d` (ms) and `r(t)`, which renders the state at local time `t`
 * (t < 0: not started; t > d: held at the end). Leaves render DOM elements (paused WAAPI
 * animations whose `currentTime` the controller sets), plain objects or callbacks; compositions
 * render their children at offsets. The controller owns time: it advances on the shared frame
 * scheduler (`onFrame`, 13.4) with the 8.0 motion clock's scaled `dt`, so pausing or slowing the
 * clock applies, and nothing runs its own requestAnimationFrame loop.
 */
const abort = () => {
    const e = new Error('Motion cancelled');
    e.name = 'AbortError';
    return e;
};
/** @internal Wrap a node in controls. */
function control(node, o = {}) {
    let time = 0;
    let rate = o.playbackRate ?? 1;
    let state = 'idle';
    let stop = null;
    let adopted = false;
    let res;
    let rej;
    let fin;
    let settled = false;
    const fresh = () => {
        settled = false;
        fin = new Promise((a, b) => ((res = a), (rej = b)));
        fin.catch(() => undefined); // unhandled only if someone awaits it
    };
    fresh();
    const D = node.d;
    const halt = () => {
        stop?.();
        stop = null;
    };
    const render = () => {
        node.r(time);
        o.onUpdate?.(D ? Math.min(1, time / D) : 1);
    };
    const set = (ms) => {
        time = Math.min(D, Math.max(0, Number(ms) || 0));
        render();
    };
    const done = () => {
        halt();
        state = 'finished';
        settled = true;
        o.onComplete?.();
        res(c);
    };
    const atEnd = () => (rate < 0 ? time <= 0 : time >= D);
    const c = {
        _n: node,
        _a() {
            adopted = true;
            halt();
            state = 'idle';
        },
        get duration() {
            return D;
        },
        get currentTime() {
            return time;
        },
        set currentTime(ms) {
            c.seek(ms);
        },
        get progress() {
            return D === Infinity ? 0 : D ? time / D : 1;
        },
        set progress(p) {
            c.seek(p * D);
        },
        get playbackRate() {
            return rate;
        },
        set playbackRate(r) {
            if (Number.isFinite(r))
                rate = r;
        },
        get playState() {
            return state;
        },
        get finished() {
            return fin;
        },
        play() {
            if (adopted)
                return c;
            if (o.reducedMotion !== 'ignore' && base.prefersReducedMotion())
                return c.finish();
            if (state === 'running')
                return c;
            if (settled)
                fresh();
            if (state === 'finished' || atEnd())
                set(rate < 0 ? D : 0);
            state = 'running';
            stop = base.onFrame((_t, dt) => {
                set(time + dt * rate);
                if (atEnd())
                    done();
            });
            return c;
        },
        pause() {
            halt();
            if (state !== 'idle' || time)
                state = 'paused';
            return c;
        },
        seek(ms) {
            set(ms);
            if (state === 'finished')
                state = 'paused';
            return c;
        },
        reverse() {
            rate = -rate || -1;
            if (state === 'idle' && !time && rate < 0)
                set(D);
            halt();
            state = 'paused';
            return c.play();
        },
        finish() {
            if (D === Infinity)
                return c;
            set(rate < 0 ? 0 : D);
            done();
            return c;
        },
        cancel() {
            halt();
            node.x?.();
            time = 0;
            state = 'idle';
            if (settled)
                fresh();
            rej(abort());
            fresh();
        },
    };
    if (o.autoplay !== false)
        c.play();
    return c;
}
/** @internal Repeat / alternate a node (`repeat` = extra passes). */
function loop(n, repeat = 0, alternate = false) {
    if (!(repeat > 0))
        return n;
    const d = n.d;
    return {
        d: repeat === Infinity ? Infinity : d * (repeat + 1),
        r(t) {
            if (t <= 0 || !d)
                return n.r(t <= 0 ? t : d);
            const total = d * (repeat + 1);
            if (t >= total) {
                const i = repeat; // last pass
                return n.r(alternate && i % 2 ? 0 : d);
            }
            const i = Math.floor(t / d);
            const lt = t - i * d;
            n.r(alternate && i % 2 ? d - lt : lt);
        },
        x: n.x,
    };
}
/** @internal Children at offsets; rendered in start order so later-starting children win. */
function group(items, o = {}) {
    for (const [ch] of items) {
        if (ch._n.d === Infinity)
            throw new Error('[motionary] motion: a child with infinite repeat cannot be composed');
        ch._a();
    }
    const list = items.map(([ch, at]) => [ch._n, Math.max(0, at)]).sort((a, b) => a[1] - b[1]);
    const node = {
        d: list.reduce((m, [n, at]) => Math.max(m, at + n.d), 0),
        r(t) {
            for (const [n, at] of list)
                n.r(Math.min(t - at, n.d));
        },
        x() {
            for (const [n] of list)
                n.x?.();
        },
    };
    return control(loop(node, o.repeat, o.alternate), o);
}

/**
 * `motionary/motion` (= `motionary/components/motion`, 14.0) — **Motion Engine v2**: one composable
 * animation API with one controller interface.
 *
 * ```ts
 * import { animate, sequence, parallel, stagger, spring, timeline } from 'motionary/motion';
 * import { playScene } from 'motionary/motion/scene'; // scene v2 → one controller (own entry)
 *
 * const intro = sequence([
 *   animate('.title', 'fade-up', { duration: '{duration.slow}' }),
 *   parallel([
 *     stagger('.card', [{ opacity: 0, transform: 'scale(.9)' }, { opacity: 1, transform: 'none' }], { each: 60 }),
 *     spring('.cta', [{ transform: 'scale(0)' }, { transform: 'none' }], 'bouncy'),
 *   ]),
 * ]);
 * intro.pause(); intro.seek(400); intro.reverse(); await intro.finished;
 * ```
 *
 * Every function returns {@link MotionControls}: `play()`, `pause()`, `seek(ms)`, `reverse()`,
 * `finish()`, `cancel()`, `finished`, `currentTime`, `progress`, `duration`, `playbackRate`,
 * `playState`. A controller passed into `sequence` / `parallel` / `stagger` / `timeline` is adopted:
 * the composition drives it from then on. Built on the shared frame scheduler and motion clock
 * (13.4 / 8.0) and the timeline runtime (3.1 position grammar `'>' '<' '+=n' '-=n' 'label+=n'`,
 * named presets, motion tokens). DOM targets run as paused WAAPI animations (`fill: forwards`);
 * without WAAPI they jump to the frame at the playhead. Reduced motion: playing jumps to the end.
 * Not part of `motionary/components/lite`; zero dependencies.
 */
/** Engine generation (14.0 = 2). */
const MOTION_ENGINE_VERSION = 2;
/** `'{duration.fast}'` / `'{easing.standard}'` → the token name. */
const ref = (v) => (typeof v === 'string' ? v.replace(/^\{(?:duration|easing)\.([\w-]+)\}$/, '$1') : v);
const easeCss = (e) => components_tokens.resolveEasingToken(ref(e), 'ease');
// --- easing ---------------------------------------------------------------------------
/** A CSS `cubic-bezier()` as a function of 0–1. */
function cubicBezier(x1, y1, x2, y2) {
    const f = (a, b, t) => ((1 - 3 * b + 3 * a) * t + (3 * b - 6 * a)) * t * t + 3 * a * t;
    return (x) => {
        if (x <= 0 || x >= 1)
            return x <= 0 ? 0 : 1;
        // bisection on x(t): 24 halvings ≈ 6e-8 precision
        let lo = 0, hi = 1, t = x;
        for (let i = 0; i < 24; i++)
            f(x1, x2, t) < x ? (lo = t) : (hi = t), (t = (lo + hi) / 2);
        return f(y1, y2, t);
    };
}
const KW = { ease: '.25,.1,.25,1', 'ease-in': '.42,0,1,1', 'ease-out': '0,0,.58,1', 'ease-in-out': '.42,0,.58,1' };
/** A CSS easing string (keyword, `cubic-bezier()`, `steps()`, `linear(…)`, token) or function → function of 0–1. */
function toEasingFn(e) {
    if (typeof e === 'function')
        return e;
    let s = easeCss(e).trim();
    if (KW[s])
        s = `cubic-bezier(${KW[s]})`;
    const n = (/\(([^)]*)\)/.exec(s)?.[1] || '').split(',').map((x) => parseFloat(x));
    if (s.startsWith('cubic-bezier') && n.length === 4)
        return cubicBezier(n[0], n[1], n[2], n[3]);
    if (s.startsWith('steps') && n[0] > 0)
        return (p) => Math.min(1, Math.floor(p * n[0]) / n[0]);
    if (s.startsWith('linear(') && n.length > 1)
        return pts(n);
    return (p) => p;
}
/** Evenly spaced samples → piecewise-linear easing. */
const pts = (v) => (p) => {
    const x = Math.min(1, Math.max(0, p)) * (v.length - 1);
    const i = Math.min(v.length - 2, Math.floor(x));
    return v[i] + (v[i + 1] - v[i]) * (x - i);
};
// --- leaves ---------------------------------------------------------------------------
const els = (t) => typeof t === 'string' ? (typeof document === 'undefined' ? [] : Array.from(document.querySelectorAll(t))) : typeof Element !== 'undefined' && t instanceof Element ? [t] : Array.from(t);
const isEls = (t) => typeof t === 'string' || (typeof Element !== 'undefined' && t instanceof Element) || (t && typeof t.length === 'number' && typeof t !== 'function');
function frames(k) {
    if (typeof k === 'string')
        return core.TIMELINE_PRESETS[k] || core.TIMELINE_PRESETS.fade;
    if (Array.isArray(k))
        return k;
    const keys = Object.keys(k);
    const n = Math.max(1, ...keys.map((p) => (Array.isArray(k[p]) ? k[p].length : 1)));
    return Array.from({ length: n }, (_, i) => Object.fromEntries(keys.map((p) => { const v = k[p]; return [p, Array.isArray(v) ? v[Math.min(i, v.length - 1)] : v]; })));
}
/** One leaf: delay + duration + endDelay of `draw(p, localMs)`. */
function leaf(o, draw, x) {
    const dur = Math.max(0, components_tokens.resolveDurationToken(ref(o.duration), 300));
    const delay = o.delay || 0;
    const n = { d: delay + dur + (o.endDelay || 0), r: (t) => draw(t - delay, dur), x };
    return loop(n, o.repeat, o.alternate);
}
function node(target, keyframes, o, waapiEasing) {
    const ease = toEasingFn(o.easing || (isEls(target) ? 'ease' : 'linear'));
    if (typeof target === 'function') {
        let last;
        return leaf(o, (t, d) => {
            if (t < 0 && (last === undefined || last === 0))
                return;
            const p = ease(d ? Math.min(1, Math.max(0, t / d)) : 1);
            if (p !== last)
                target((last = p));
        });
    }
    if (isEls(target)) {
        const kf = frames(keyframes || 'fade');
        const list = els(target);
        const anims = new Map();
        const easing = waapiEasing || (typeof o.easing === 'function' ? 'linear' : easeCss(o.easing));
        const fn = !waapiEasing && typeof o.easing === 'function' ? ease : null;
        return leaf(o, (t, d) => {
            for (const el of list) {
                let a = anims.get(el);
                if (a === undefined) {
                    a = typeof el.animate === 'function' ? el.animate(kf, { duration: d || 0.001, easing, fill: 'forwards' }) : null;
                    a?.pause();
                    anims.set(el, a);
                }
                const lt = fn && t >= 0 ? fn(Math.min(1, t / (d || 1))) * d : t;
                if (a)
                    a.currentTime = Math.min(lt, d);
                else if (t >= 0)
                    base.applyFrame(el, kf[Math.round((d ? Math.min(1, t / d) : 1) * (kf.length - 1))]);
            }
        }, () => {
            anims.forEach((a) => a?.cancel());
            anims.clear();
        });
    }
    // plain object: tween numeric props from their current values
    const to = (keyframes || {});
    let from = null;
    return leaf(o, (t, d) => {
        if (t < 0 && !from)
            return;
        from || (from = Object.fromEntries(Object.keys(to).map((k) => [k, Array.isArray(to[k]) ? to[k][0] : Number(target[k]) || 0])));
        const p = ease(d ? Math.min(1, Math.max(0, t / d)) : 1);
        for (const k of Object.keys(to)) {
            const v = to[k];
            const end = Array.isArray(v) ? v[v.length - 1] : v;
            target[k] = from[k] + (end - from[k]) * p;
        }
    });
}
function animate(target, a, b) {
    const fn = typeof target === 'function';
    const o = (fn ? a : b) || {};
    return control(node(target, fn ? undefined : a, o), o);
}
/** Run children one after another (`gap` ms between them; negative overlaps). */
function sequence(children, options = {}) {
    let at = 0;
    return group(children.map((c, i) => {
        const s = at + (i ? options.gap || 0 : 0);
        at = s + c._n.d;
        return [c, s];
    }), options);
}
/** Run children together; the duration is the longest child's. */
function parallel(children, options = {}) {
    return group(children.map((c) => [c, 0]), options);
}
const offsets = (n, o) => {
    const c = o.from === 'last' ? n - 1 : o.from === 'center' ? (n - 1) / 2 : typeof o.from === 'number' ? o.from : 0;
    return Array.from({ length: n }, (_, i) => Math.abs(i - c) * (o.each ?? 50));
};
function stagger(targets, a, b) {
    if (Array.isArray(targets) && targets.length && targets[0]._n) {
        const o = a || {};
        const off = offsets(targets.length, o);
        return group(targets.map((c, i) => [c, off[i]]), o);
    }
    const o = b || {};
    const list = els(targets);
    const off = offsets(list.length, o);
    // repeat / alternate and the control options belong to the group; each leaf gets one pass
    const leafO = { ...o, repeat: 0, alternate: false };
    return group(list.map((el, i) => [control(node(el, a, leafO), { autoplay: false }), off[i]]), o);
}
function spring(target, a, b, c) {
    const fn = typeof target === 'function';
    const input = fn ? a : b;
    const o = (fn ? b : c) || {};
    const tok = typeof input === 'string' && /^\{spring\.(.+)\}$/.exec(input);
    const st = tok && components_tokens.motionToken('spring', tok[1]); // 14.1: the active token set (applyMotionTokens / applyMotionTokenSet), then the defaults
    const cfg = tok ? (st && spring$1.resolveSpring(st)) || undefined : input;
    const { values, duration } = spring$1.springSamples(cfg);
    const css = spring$1.supportsLinearEasing() ? spring$1.linearEasing(values) : 'cubic-bezier(0.34, 1.56, 0.64, 1)';
    const opts = { ...o, duration, easing: pts(values) };
    return control(node(target, fn ? undefined : a, opts, css), opts);
}
/**
 * Place children on one playhead with the timeline position grammar; returns controls that keep
 * accepting `add()` / `label()`. Also accepts `[[child, position], …]` up front.
 */
function timeline(entries, options = {}) {
    if (entries && !Array.isArray(entries))
        (options = entries), (entries = []);
    const items = [];
    const labels = {};
    let end = 0;
    let prev = 0;
    let ctl = group([], { ...options, autoplay: false });
    let queued = options.autoplay !== false;
    const rebuild = () => {
        const was = ctl;
        ctl = group(items, { ...options, autoplay: false });
        if (was.currentTime)
            ctl.seek(was.currentTime);
        if (queued) {
            queued = false;
            queueMicrotask(() => ctl.playState === 'idle' && ctl.play());
        }
    };
    const add = (child, pos) => {
        const at = core.resolvePosition(pos, end, prev, labels);
        items.push([child, (prev = at)]);
        end = Math.max(end, at + child._n.d);
        rebuild();
        return tl;
    };
    const label = (name, pos) => ((labels[name] = core.resolvePosition(pos, end, prev, labels)), tl);
    // the builder forwards to the current composition; chainable methods return the builder
    const tl = new Proxy({}, {
        get: (_, k) => {
            if (k === 'add')
                return add;
            if (k === 'label')
                return label;
            const v = ctl[k];
            return typeof v === 'function' && k !== '_a' ? (...args) => { const r = v.apply(ctl, args); return r === ctl ? tl : r; } : v;
        },
        set: (_, k, v) => ((ctl[k] = v), true),
    });
    for (const [c, p] of entries || [])
        tl.add(c, p);
    if (!entries?.length && queued)
        rebuild();
    return tl;
}

exports.MOTION_ENGINE_VERSION = MOTION_ENGINE_VERSION;
exports.animate = animate;
exports.control = control;
exports.cubicBezier = cubicBezier;
exports.group = group;
exports.parallel = parallel;
exports.sequence = sequence;
exports.spring = spring;
exports.stagger = stagger;
exports.timeline = timeline;
exports.toEasingFn = toEasingFn;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v14.6.0/dist/chunks/index-C9_FEsfz.cjs.map