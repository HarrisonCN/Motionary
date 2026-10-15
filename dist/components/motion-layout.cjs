'use strict';

var base = require('../chunks/base-BvH4nAcv.cjs');
var components_tokens = require('./tokens.cjs');
var components_motion = require('../chunks/index-C9_FEsfz.cjs');

/**
 * `motionary/motion/layout` (= `motionary/components/motion-layout`, 14.2) — **Layout Motion 2.0** on Motion Engine v2.
 *
 * ```ts
 * import { flip, layoutGroup, setLayoutId, layoutTransition } from 'motionary/motion/layout';
 *
 * flip('.card', () => grid.classList.toggle('dense'));            // FLIP with scale + border-radius correction
 * const g = layoutGroup('.accordion > section');                  // siblings reflow together
 * g.flip(() => item.classList.toggle('open'));
 * setLayoutId(thumb, 'photo-1');                                  // shared element (layoutId)
 * await layoutTransition(() => router.go('/photo/1'));            // View Transitions API, FLIP fallback
 * ```
 *
 * - **FLIP 2.0**: elements are measured before and after a DOM change, then shown at their old box with a
 *   `translate3d() scale()` (origin `0 0`) that eases to none. Direct children are counter-scaled so text and
 *   images do not stretch (`correct`), border-radius is corrected for the current scale (`radius`), and nested
 *   layout elements animate in their parent's frame.
 * - **Interruptible**: a new layout change on an element that is still animating starts from where it is now.
 * - **Scroll / transforms / sticky**: boxes are measured scroll-independently (window and scroll containers
 *   scrolling during an update are not layout changes), deltas are converted into the local px of scaled
 *   ancestors, and sticky / fixed elements are measured in viewport space.
 * - **Shared elements**: `data-layout-id` (`setLayoutId`) pairs elements across states and routes.
 * - **View Transitions**: `layoutTransition()` uses `document.startViewTransition` when present and falls back to
 *   FLIP; `crossDocumentLayout()` enables cross-document view transitions or a sessionStorage FLIP fallback.
 * - **Reduced motion**: instant by default, `reducedMotion: 'crossfade'` for an opacity-only change.
 *
 * Every animation is a standard {@link MotionControls}. Not part of `motionary/motion` or `lite`; zero
 * dependencies. docs/layout-motion.md
 */
/** Layout Motion generation (14.2 = 2). */
const LAYOUT_MOTION_VERSION = 2;
// --- pure math ---------------------------------------------------------------------------
const r4 = (v) => Math.round(v * 1e4) / 1e4 || 0;
const mix = (a, b, p) => a + (b - a) * p;
const ONE = { x: 1, y: 1 };
/** The transform that shows an element laid out at `to` at the box `from` (`ps` = ancestor scale). */
function layoutDelta(from, to, ps = ONE) {
    return { x: (from.x - to.x) / ps.x, y: (from.y - to.y) / ps.y, sx: to.width ? from.width / to.width : 1, sy: to.height ? from.height / to.height : 1 };
}
/** Interpolate two boxes. */
function mixBox(a, b, p) {
    return { x: mix(a.x, b.x, p), y: mix(a.y, b.y, p), width: mix(a.width, b.width, p), height: mix(a.height, b.height, p) };
}
/**
 * The transform that shows an element laid out at `to` at the box `want`. With `parent` (an animated layout
 * ancestor: its layout box `to` and the box it is `shown` at) the result is in the parent's frame, so a child
 * that should look untouched is counter-scaled (scale correction).
 */
function solveLayoutTransform(want, to, parent, ps = ONE) {
    if (!parent)
        return layoutDelta(want, to, ps);
    const px = parent.to.width ? parent.shown.width / parent.to.width : 1;
    const py = parent.to.height ? parent.shown.height / parent.to.height : 1;
    return {
        x: ((want.x - parent.shown.x) / px - (to.x - parent.to.x)) / ps.x,
        y: ((want.y - parent.shown.y) / py - (to.y - parent.to.y)) / ps.y,
        sx: to.width ? want.width / (px * to.width) : 1,
        sy: to.height ? want.height / (py * to.height) : 1,
    };
}
/** `translate3d(x, y, 0) scale(sx, sy)`; `''` at identity. */
function layoutTransform(d) {
    const x = r4(d.x), y = r4(d.y), sx = r4(d.sx), sy = r4(d.sy);
    return !x && !y && sx === 1 && sy === 1 ? '' : `translate3d(${x}px, ${y}px, 0) scale(${sx}, ${sy})`;
}
/** Border-radius (visible px) that looks right on an element shown at scale `sx`, `sy`. */
function correctRadius(r, sx, sy) {
    const [rx, ry] = typeof r === 'number' ? [r, r] : r;
    return !rx && !ry ? '' : `${r4(rx / (sx || 1))}px / ${r4(ry / (sy || 1))}px`;
}
// --- measuring ---------------------------------------------------------------------------
const hasDoc = () => typeof document !== 'undefined';
const cs = (el) => (typeof getComputedStyle === 'function' ? getComputedStyle(el) : {});
const pinned = (el) => /^(sticky|fixed)$/.test(cs(el).position || '');
/** Scroll offsets that do not change how `el` is laid out: scroll containers up to a sticky / fixed ancestor, then the window. */
function scrollOffset(el) {
    if (pinned(el))
        return [0, 0];
    let x = 0, y = 0;
    const se = hasDoc() ? document.scrollingElement : null;
    for (let n = el.parentElement; n; n = n.parentElement) {
        if (n !== se)
            (x += n.scrollLeft || 0), (y += n.scrollTop || 0);
        if (pinned(n))
            return [x, y];
    }
    return typeof window === 'undefined' ? [x, y] : [x + (window.scrollX || 0), y + (window.scrollY || 0)];
}
/** The element's box as rendered, in scroll-independent coordinates (see {@link Box}). */
function measureLayout(el) {
    const r = el.getBoundingClientRect();
    const [ox, oy] = scrollOffset(el);
    return { x: r.left + ox, y: r.top + oy, width: r.width, height: r.height };
}
/** Cumulative scale of the ancestors (rendered size / layout size of the parent). */
function ancestorScale(el) {
    const p = el.parentElement;
    if (!p || !p.offsetWidth || !p.offsetHeight)
        return ONE;
    const r = p.getBoundingClientRect();
    return { x: r.width / p.offsetWidth || 1, y: r.height / p.offsetHeight || 1 };
}
function readRadius(el, b) {
    const s = cs(el);
    const v = (s.borderTopLeftRadius || s.borderRadius || '').split('/')[0].trim().split(/\s+/);
    const px = (t, of) => (!t ? 0 : t.endsWith('%') ? (parseFloat(t) / 100) * of : parseFloat(t) || 0);
    return [px(v[0], b.width), px(v[1] ?? v[0], b.height)];
}
const toEls = (t) => {
    if (typeof t === 'function')
        t = t();
    if (typeof t === 'string')
        return hasDoc() ? Array.from(document.querySelectorAll(t)) : [];
    if (typeof Element !== 'undefined' && t instanceof Element)
        return [t];
    return Array.from(t);
};
const KEYS = ['transform', 'transformOrigin', 'borderRadius', 'opacity', 'visibility'];
const running = /*#__PURE__*/ new WeakMap();
const save = (el) => Object.fromEntries(KEYS.map((k) => [k, el.style[k]]));
const restore = (el, s) => KEYS.forEach((k) => (el.style[k] = s[k]));
const restoreItem = (i) => {
    restore(i.el, i.s);
    i.kids.forEach((k) => restore(k.el, k.s));
};
/** Is a layout animation of this package running on `el`? */
function isLayoutAnimating(el) {
    return running.has(el);
}
/** Measure `el` as shown now; if a layout animation runs on it, take it over (stop it and keep its current box). */
function capture(el) {
    const run = running.get(el);
    const box = measureLayout(el);
    const it = run?.items.find((i) => i.el === el);
    const radius = it?.R || readRadius(el, box);
    run?.drop(el);
    return { el, box, radius };
}
const PIN = '0px 0px';
function render(i, p, o) {
    const D = (i.D = mixBox(i.from, i.dest, p));
    if (o.scale === false)
        (D.width = i.to.width), (D.height = i.to.height);
    const el = i.el.style;
    el.transformOrigin = PIN;
    el.transform = layoutTransform(solveLayoutTransform(D, i.to, i.parent && i.parent.D ? { shown: i.parent.D, to: i.parent.to } : null, i.ps));
    const sx = i.to.width ? D.width / i.to.width : 1, sy = i.to.height ? D.height / i.to.height : 1;
    if (o.radius !== false && i.r0 && i.r1 && (i.r0[0] || i.r1[0]) && (Math.abs(sx - 1) > 1e-3 || Math.abs(sy - 1) > 1e-3 || i.r0[0] !== i.r1[0])) {
        i.R = [mix(i.r0[0], i.r1[0], p), mix(i.r0[1], i.r1[1], p)];
        el.borderRadius = correctRadius(i.R, sx, sy);
    }
    if (i.op)
        el.opacity = String(r4(mix(i.op[0], i.op[1], p)));
    if (i.hide)
        el.visibility = 'hidden';
    for (const k of i.kids) {
        k.el.style.transformOrigin = PIN;
        k.el.style.transform = layoutTransform(solveLayoutTransform({ x: D.x + k.off[0], y: D.y + k.off[1], width: k.to.width, height: k.to.height }, k.to, { shown: D, to: i.to }, i.ps));
    }
}
const tok = (v) => (typeof v === 'string' ? v.replace(/^\{duration\.([\w-]+)\}$/, '$1') : v);
/** `'instant' | 'crossfade' | null` — what reduced motion asks for right now. */
const reducedMode = (o) => (o.reducedMotion === 'ignore' || !base.prefersReducedMotion() ? null : o.reducedMotion === 'crossfade' ? 'crossfade' : 'instant');
/** Build items into one Motion Engine v2 controller. */
function play(items, o) {
    const rm = reducedMode(o);
    if (rm === 'crossfade') {
        items = items.filter((i) => !i.op || i.op[1] > 0);
        for (const i of items)
            (i.from = i.dest = i.to), (i.op = [0, 1]), (i.kids = []), (i.r0 = i.r1 = undefined), (i.hide = false);
    }
    // parents first; nested items animate in their parent's frame; children of scaling items get corrected
    const map = new Map(items.map((i) => [i.el, i]));
    for (const i of items) {
        for (let n = i.el.parentElement; n && !i.parent; n = n.parentElement)
            i.parent = map.get(n) || null;
    }
    const depth = (i) => (i.parent ? 1 + depth(i.parent) : 0);
    items.sort((a, b) => depth(a) - depth(b));
    for (const i of items) {
        i.ps = i.parent ? i.parent.ps : ancestorScale(i.el);
        const scales = o.scale !== false && (Math.abs(i.from.width - i.to.width) > 0.5 || Math.abs(i.from.height - i.to.height) > 0.5 || Math.abs(i.dest.width - i.to.width) > 0.5);
        if (scales && o.correct !== false && rm !== 'crossfade') {
            const list = typeof o.correct === 'string' ? Array.from(i.el.querySelectorAll(o.correct)) : Array.from(i.el.children);
            i.kids = list.filter((k) => !map.has(k) && k.style).map((k) => {
                const to = measureLayout(k);
                return { el: k, to, off: [to.x - i.to.x, to.y - i.to.y], s: save(k) };
            });
        }
    }
    const dur = Math.max(0, components_tokens.resolveDurationToken(tok(o.duration), 300));
    const delay = o.delay || 0;
    const ease = components_motion.toEasingFn(o.easing ?? base.EASE_OUT);
    const unreg = () => items.forEach((i) => running.get(i.el) === run && running.delete(i.el));
    const node = {
        d: delay + dur,
        r(t) {
            const p = t <= delay ? 0 : dur ? Math.min(1, (t - delay) / dur) : 1;
            if (p >= 1)
                items.forEach(restoreItem);
            else {
                const e = ease(p);
                items.forEach((i) => render(i, e, o));
            }
        },
        x() {
            items.forEach(restoreItem);
            unreg();
        },
    };
    const ctl = components_motion.control(node, { ...o, autoplay: false, reducedMotion: 'ignore', onComplete: () => (unreg(), o.onComplete?.()) });
    const run = {
        items,
        ctl,
        drop(el) {
            const k = items.findIndex((i) => i.el === el);
            if (k < 0)
                return;
            restoreItem(items[k]);
            items.splice(k, 1);
            running.delete(el);
            if (!items.length)
                ctl.cancel();
        },
    };
    for (const i of items) {
        running.get(i.el)?.drop(i.el);
        running.set(i.el, run);
    }
    if (rm === 'instant' || !items.length)
        return ctl.finish();
    node.r(0);
    if (o.autoplay !== false)
        ctl.play();
    return ctl;
}
const same = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.width - b.width) + Math.abs(a.height - b.height) < 0.5;
function item(el, from, fromR, extra = {}) {
    if (!el.isConnected)
        return null;
    const to = measureLayout(el);
    if (!to.width && !to.height)
        return null; // display: none
    const r1 = readRadius(el, to);
    const it = { el, from, dest: to, to, r0: fromR || r1, r1, ps: ONE, kids: [], s: save(el), ...extra };
    if (!extra.op && !extra.hide && extra.dest === undefined && same(from, to) && it.r0[0] === r1[0])
        return null;
    return it;
}
/** Capture the boxes of `targets` (taking over running layout animations); call `animate()` after the DOM changed. */
function snapshotLayout(targets, defaults = {}) {
    const caps = toEls(targets).map(capture);
    return {
        elements: caps.map((c) => c.el),
        animate: (o = defaults) => play(caps.map((c) => item(c.el, c.box, c.radius)).filter(Boolean), o),
    };
}
/**
 * FLIP: measure `targets`, run `update()` (synchronous DOM change), measure again and animate each element
 * from its old box to the new one with transforms (scale + children + border-radius corrected).
 */
function flip(targets, update, options = {}) {
    const snap = snapshotLayout(targets);
    update();
    return snap.animate(options);
}
/** A set of elements that animate together when any of them changes layout. */
function layoutGroup(members = [], options = {}) {
    const base = typeof members === 'string' ? members : toEls(members);
    const extra = new Set();
    const out = new Set();
    const g = {
        id: options.id,
        get members() {
            const list = [...toEls(base), ...extra];
            return [...new Set(list)].filter((e) => !out.has(e));
        },
        add: (el) => (out.delete(el), extra.add(el), g),
        remove: (el) => (extra.delete(el), out.add(el), g),
        snapshot: (o) => snapshotLayout(g.members, { ...options, ...o }),
        flip: (update, o) => flip(g.members, update, { ...options, ...o }),
        shared: (update, o) => sharedLayout(update, { ...options, ...o, scope: options.id ? options.id + '/' : o?.scope }),
    };
    return g;
}
// --- shared elements (layoutId) -------------------------------------------------------------
const ATTR = 'data-layout-id';
/** Pair elements across states / routes: same layoutId = same element. `null` removes it. */
function setLayoutId(el, id, group) {
    if (id == null)
        el.removeAttribute(ATTR);
    else
        el.setAttribute(ATTR, group?.id ? `${group.id}/${id}` : id);
}
/** The layoutId (`data-layout-id`, or the 13.x `data-shared`). */
function getLayoutId(el) {
    return el.getAttribute(ATTR) ?? el.getAttribute('data-shared');
}
function collect(root = document, scope) {
    const m = new Map();
    root.querySelectorAll(`[${ATTR}],[data-shared]`).forEach((el) => {
        const id = getLayoutId(el);
        if (id && (!scope || id.startsWith(scope)))
            m.set(id, el);
    });
    return m;
}
function sharedItems(before, after, o) {
    const items = [];
    after.forEach((el, id) => {
        const b = before.get(id);
        if (!b)
            return void (o.enter !== 'none' && items.push(item(el, measureLayout(el), undefined, { op: [0, 1] })));
        if (b.el === el)
            return void items.push(item(el, b.box, b.radius));
        const n = item(el, b.box, b.radius, o.crossfade && b.el.isConnected ? { op: [0, 1] } : {});
        items.push(n);
        if (n && b.el.isConnected)
            items.push(item(b.el, b.box, b.radius, o.crossfade ? { dest: n.to, op: [1, 0] } : { hide: true }));
    });
    return items.filter(Boolean);
}
/**
 * Shared-element transition (FLIP): elements with a layoutId before `update()` (sync or async — a route
 * change) fly to the element with the same layoutId afterwards.
 */
async function sharedLayout(update, options = {}) {
    const root = options.root || document;
    const before = new Map([...collect(root, options.scope)].map(([id, el]) => [id, capture(el)]));
    await update();
    return play(sharedItems(before, collect(root, options.scope), options), options);
}
// --- View Transitions ------------------------------------------------------------------------
/** Same-document View Transitions API available. */
function supportsViewTransitions() {
    return hasDoc() && typeof document.startViewTransition === 'function';
}
/** Cross-document view transitions (`@view-transition { navigation: auto }`, pageswap / pagereveal) available. */
function supportsCrossDocumentViewTransitions() {
    return typeof window !== 'undefined' && 'onpagereveal' in window && typeof CSS !== 'undefined' && !!CSS.supports?.('view-transition-name', 'a');
}
/** `view-transition-name` for a layoutId (`mo-` + id with unsafe characters as `_`). */
function viewTransitionName(id) {
    return 'mo-' + id.replace(/[^\w-]/g, '_');
}
const VTN = 'view-transition-name';
const nameAll = (m) => m.forEach((el, id) => el.style.setProperty(VTN, viewTransitionName(id)));
const clearAll = (m) => m.forEach((el) => el.style.removeProperty(VTN));
const timingCss = (o) => {
    const e = typeof o.easing === 'string' ? o.easing : typeof o.easing === 'function' ? '' : base.EASE_OUT;
    return `::view-transition-group(*),::view-transition-old(*),::view-transition-new(*){animation-duration:${Math.max(0, components_tokens.resolveDurationToken(tok(o.duration), 300))}ms;${o.delay ? `animation-delay:${o.delay}ms;` : ''}${e ? `animation-timing-function:${e};` : ''}}`;
};
const styleEl = (attr, css) => {
    const s = document.createElement('style');
    s.setAttribute(attr, '');
    s.textContent = css;
    document.head.append(s);
    return s;
};
let currentVT = null;
const settle = (p) => p.then(() => undefined, () => undefined);
/**
 * Animate a DOM change (sync or async: state change, route change) with shared elements: the View Transitions
 * API when present (layoutIds become `view-transition-name`s), FLIP otherwise or when it fails. A new transition
 * skips the running one. Resolves once the DOM is updated.
 */
async function layoutTransition(update, options = {}) {
    const o = options;
    const root = o.root || document;
    const rm = reducedMode(o);
    const skipCurrent = () => (currentVT?.skipTransition?.(), (currentVT = null));
    if (rm === 'instant') {
        skipCurrent();
        await update();
        return { method: 'instant', finished: Promise.resolve(), skip() { } };
    }
    if (o.method !== 'flip' && supportsViewTransitions()) {
        let after = new Map();
        const before = rm ? new Map() : collect(root, o.scope);
        let vt;
        let style = null;
        try {
            skipCurrent();
            nameAll(before);
            style = styleEl('data-motionary-vt', timingCss(o));
            const cb = async () => {
                clearAll(before);
                await update();
                if (!rm)
                    nameAll((after = collect(root, o.scope)));
            };
            const doc = document;
            try {
                vt = o.types ? doc.startViewTransition({ update: cb, types: o.types }) : doc.startViewTransition(cb);
            }
            catch (e) {
                if (!(e instanceof TypeError) || !o.types)
                    throw e;
                vt = doc.startViewTransition(cb); // no types support
            }
        }
        catch {
            clearAll(before);
            style?.remove();
            vt = null;
        }
        if (vt) {
            currentVT = vt;
            await vt.updateCallbackDone;
            const finished = settle(vt.finished).then(() => {
                clearAll(after);
                style?.remove();
                if (currentVT === vt)
                    currentVT = null;
            });
            return { method: rm ? 'crossfade' : 'view-transition', finished, viewTransition: vt, skip: () => vt.skipTransition?.() };
        }
    }
    skipCurrent();
    const controls = await sharedLayout(update, o);
    return { method: rm ? 'crossfade' : 'flip', finished: settle(controls.finished), controls, skip: () => controls.finish() };
}
// --- cross-document (MPA) ------------------------------------------------------------------------
const KEY = 'motionary:layout';
const store = () => {
    try {
        return typeof sessionStorage === 'undefined' ? null : sessionStorage;
    }
    catch {
        return null;
    }
};
/** Save the viewport boxes of every layoutId (call on `pagehide` / before navigating) for {@link playLayoutSnapshot}. */
function saveLayoutSnapshot(root = document, key = KEY) {
    const boxes = {};
    collect(root).forEach((el, id) => {
        const r = el.getBoundingClientRect();
        boxes[id] = { x: r.left, y: r.top, width: r.width, height: r.height, r: readRadius(el, r) };
    });
    try {
        store()?.setItem(key, JSON.stringify({ t: Date.now(), boxes }));
    }
    catch {
        /* storage full / blocked */
    }
}
/** On the new page: FLIP every layoutId from the box saved on the previous page (once; ignored after `maxAge` ms, default 5000). */
function playLayoutSnapshot(root = document, options = {}) {
    const s = store();
    const raw = s?.getItem(options.key || KEY);
    if (!raw)
        return null;
    s.removeItem(options.key || KEY);
    let data;
    try {
        data = JSON.parse(raw);
    }
    catch {
        return null;
    }
    if (!data || Date.now() - data.t > (options.maxAge ?? 5000))
        return null;
    const items = [];
    collect(root).forEach((el, id) => {
        const b = data.boxes?.[id];
        if (!b)
            return;
        const [ox, oy] = scrollOffset(el);
        const it = item(el, { x: b.x + ox, y: b.y + oy, width: b.width, height: b.height }, b.r);
        if (it)
            items.push(it);
    });
    return items.length ? play(items, options) : null;
}
/**
 * Shared elements across page loads (MPA): native cross-document view transitions where supported (adds
 * `@view-transition { navigation: auto }` and names layoutIds on `pageswap` / `pagereveal`), otherwise the
 * sessionStorage FLIP fallback (save on `pagehide`, play on load). Include it on both pages, early (render-
 * blocking) for `pagereveal`. Returns an undo.
 */
function crossDocumentLayout(options = {}) {
    if (typeof window === 'undefined' || !hasDoc())
        return () => { };
    const root = options.root || document;
    const native = options.method === 'view-transition' || (options.method !== 'flip' && supportsCrossDocumentViewTransitions());
    const offs = [];
    const on = (type, fn) => (window.addEventListener(type, fn), offs.push(() => window.removeEventListener(type, fn)));
    if (native) {
        const style = styleEl('data-motionary-cross-document', `@view-transition { navigation: auto; }\n${timingCss(options)}`);
        offs.push(() => style.remove());
        const named = (e) => {
            const rm = reducedMode(options);
            if (rm === 'instant')
                return void e?.viewTransition?.skipTransition?.();
            if (rm)
                return; // cross-fade only
            const m = collect(root, options.scope);
            nameAll(m);
            e?.viewTransition?.finished?.finally?.(() => clearAll(m));
        };
        on('pageswap', named);
        on('pagereveal', named);
    }
    else {
        on('pagehide', () => saveLayoutSnapshot(root));
        const run = () => playLayoutSnapshot(root, options);
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', run, { once: true });
            offs.push(() => document.removeEventListener('DOMContentLoaded', run));
        }
        else
            run();
    }
    return () => offs.splice(0).forEach((f) => f());
}
/** Framework-neutral FLIP helper: `snapshot()` before a render, `animate()` after it. */
function createLayoutTracker(targets, options = {}) {
    let snap = null;
    let last = null;
    return {
        snapshot: () => void (snap = snapshotLayout(toEls(targets), options)),
        animate() {
            if (!snap)
                return null;
            const s = snap;
            snap = null;
            return (last = s.animate(options));
        },
        cancel() {
            snap = null;
            if (last && last.playState !== 'finished')
                last.cancel();
            last = null;
        },
    };
}

exports.LAYOUT_MOTION_VERSION = LAYOUT_MOTION_VERSION;
exports.correctRadius = correctRadius;
exports.createLayoutTracker = createLayoutTracker;
exports.crossDocumentLayout = crossDocumentLayout;
exports.flip = flip;
exports.getLayoutId = getLayoutId;
exports.isLayoutAnimating = isLayoutAnimating;
exports.layoutDelta = layoutDelta;
exports.layoutGroup = layoutGroup;
exports.layoutTransform = layoutTransform;
exports.layoutTransition = layoutTransition;
exports.measureLayout = measureLayout;
exports.mixBox = mixBox;
exports.playLayoutSnapshot = playLayoutSnapshot;
exports.saveLayoutSnapshot = saveLayoutSnapshot;
exports.setLayoutId = setLayoutId;
exports.sharedLayout = sharedLayout;
exports.snapshotLayout = snapshotLayout;
exports.solveLayoutTransform = solveLayoutTransform;
exports.supportsCrossDocumentViewTransitions = supportsCrossDocumentViewTransitions;
exports.supportsViewTransitions = supportsViewTransitions;
exports.viewTransitionName = viewTransitionName;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v16.0.0-rc.1/dist/components/motion-layout.cjs.map