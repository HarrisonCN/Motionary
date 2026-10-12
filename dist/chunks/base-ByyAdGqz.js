/**
 * motionary/components — shared base for the `<usa-*>` custom elements.
 *
 * Everything here is lazy: nothing touches `window`, `document`,
 * `HTMLElement` or `matchMedia` at import time, so the components can be
 * imported during SSR (Next, Nuxt, Astro…) and in Electron/Tauri preload
 * scripts. Classes are created the first time a `define*()` function runs.
 */
const MOTION_SENSITIVITY_LEVELS = ['full', 'gentle', 'minimal', 'static'];
const MOTION_SCALE = { low: 0.6, normal: 1, high: 1.25 };
const config = { injectStyles: true, reducedMotion: 'user', motionIntensity: 'normal', motionSensitivity: 'full' };
/** Change global component settings (call before `define*()` for `injectStyles`). */
function configureComponents(options) {
    options = { ...options };
    // 5.0: removed values are ignored (see docs/upgrading-5.md)
    if (options.motionIntensity && !(options.motionIntensity in MOTION_SCALE))
        delete options.motionIntensity;
    if (options.reducedMotion && options.reducedMotion !== 'reduce')
        options.reducedMotion = 'user';
    Object.assign(config, options);
    const { motionIntensity: mi, motionSensitivity: ms } = options;
    if (typeof document == 'undefined')
        return;
    const de = document.documentElement;
    if (mi) {
        de.style.setProperty('--usa-motion', String(MOTION_SCALE[mi] ?? 1));
        de.setAttribute('data-usa-motion', mi);
    }
    if (ms)
        ms == 'full' ? de.removeAttribute('data-usa-sensitivity') : de.setAttribute('data-usa-sensitivity', ms);
}
/** The current motion-sensitivity level (v4.4). */
function getMotionSensitivity() {
    return config.motionSensitivity;
}
const VESTIBULAR = /rotate|scale|skew|perspective|matrix3d/;
/**
 * Adapt keyframes to the sensitivity level: `gentle` drops transforms that
 * spin, zoom or skew (and 3D), `minimal` keeps opacity only, `static` keeps
 * just the final frame. `full` returns them unchanged.
 */
function adaptKeyframes(frames, level = config.motionSensitivity) {
    if (level === 'full' || !frames.length)
        return frames;
    if (level === 'static')
        return [frames[frames.length - 1]];
    return frames.map((f) => {
        const out = {};
        for (const [k, v] of Object.entries(f))
            if (k === 'offset' ||
                k === 'easing' ||
                k === 'composite' ||
                (level === 'minimal' ? k === 'opacity' : !(k === 'rotate' || k === 'scale' || (k === 'transform' && VESTIBULAR.test(String(v))))))
                out[k] = v;
        return out;
    });
}
/** Run `fn` without 4.9 deprecation warnings (library-internal calls). The suppression counter was never read, so this simply runs `fn` (counter removed in 13.4). */
function withoutDeprecations(fn) {
    return fn();
}
/** The current global motion intensity. */
function getMotionIntensity() {
    return config.motionIntensity;
}
/** Duration multiplier for the current intensity (1 when `normal`). */
function motionScale() {
    return MOTION_SCALE[config.motionIntensity] ?? 1;
}
/**
 * `querySelector` for a selector the page wrote in an attribute (`target`, `for`, `scope` …): an invalid selector finds
 * nothing instead of throwing, so the element falls back to its documented default (13.1.0, component contract).
 */
function queryAttr(sel, root = document) {
    try {
        return sel ? root.querySelector(sel) : null;
    }
    catch {
        return null;
    }
}
/** Focusable descendants (internal; shared by the a11y audit and the modal panels' focus trap). */
const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
const canDefine = () => typeof customElements !== 'undefined' && typeof HTMLElement !== 'undefined';
/** `true` when animations should be reduced (OS setting or `configureComponents`). */
function prefersReducedMotion() {
    if (config.motionSensitivity === 'minimal' || config.motionSensitivity === 'static')
        return true;
    if (config.reducedMotion === 'reduce')
        return true;
    return typeof matchMedia === 'function' && !!matchMedia('(prefers-reduced-motion: reduce)')?.matches;
}
const injected = /*#__PURE__*/ new Set();
/** Add a component's stylesheet to the document once. */
function adoptStyles(id, css) {
    if (!config.injectStyles || !css || injected.has(id) || typeof document === 'undefined')
        return;
    injected.add(id);
    if (!adopt(document, css, true))
        (document.head || document.documentElement).appendChild(styleEl(css)).setAttribute('data-usa', id);
}
/** Constructable stylesheet onto `root` (appended for a document, replacing for a shadow root); false without support. */
function adopt(root, css, add) {
    try {
        // no CSSStyleSheet constructor → ReferenceError → caught → <style>
        if ('adoptedStyleSheets' in root) {
            const sheet = new CSSStyleSheet();
            sheet.replaceSync(css);
            root.adoptedStyleSheets = add ? [...root.adoptedStyleSheets, sheet] : [sheet];
            return true;
        }
    }
    catch {
        /* fall through to <style> */
    }
    return false;
}
const styleEl = (css) => {
    const style = document.createElement('style');
    style.textContent = css;
    return style;
};
/** Attach `css` to a shadow root (constructable sheet where supported, else `<style>`). */
function shadowStyles(root, css) {
    if (!adopt(root, css))
        root.prepend(styleEl(css));
}
let baseClass = null;
/** The lazily created base class (needs `HTMLElement`). */
function getBase() {
    if (baseClass)
        return baseClass;
    class Base extends HTMLElement {
        constructor() {
            super(...arguments);
            this._cleanups = [];
        }
        get reduced() {
            return prefersReducedMotion();
        }
        connectedCallback() {
            if (this._connected)
                return;
            this._connected = true;
            // 13.5.0: a property set before the element was defined (React 18 wrappers, Vue `.prop`, Svelte, Angular
            // `[prop]` while hydrating, then define) sits on the instance and hides the class's setter — move it through.
            for (const [k, v] of Object.entries(this))
                if (k in Object.getPrototypeOf(this))
                    delete this[k], (this[k] = v);
            styleLoader?.(this.localName);
            // Upgraded while the parser is still inside us (a <script> in <head>
            // defined the element): children/text are not there yet, so wait.
            if (document.readyState === 'loading' && !this.nextSibling && !this.childNodes.length) {
                // listen() = addEventListener + a cleanup that removes it (same as before, smaller)
                return this.listen(document, 'DOMContentLoaded', () => this._connected && this.isConnected && this.mount(), { once: true });
            }
            this.mount();
        }
        disconnectedCallback() {
            this._connected = false;
            this.teardown();
        }
        attributeChangedCallback(_name, oldValue, value) {
            if (!this._connected || oldValue === value)
                return;
            this.changed(_name);
        }
        /** Re-mount on attribute change (override for finer updates). */
        changed(_name) {
            this.teardown();
            this.mount();
        }
        teardown() {
            this._cleanups.splice(0).reverse().forEach((fn) => fn());
            this.unmount();
        }
        mount() { }
        unmount() { }
        str(name, fallback = '') {
            return this.getAttribute(name) ?? fallback;
        }
        num(name, fallback) {
            const v = this.getAttribute(name);
            const n = v?.trim() ? Number(v) : NaN;
            return Number.isFinite(n) ? n : fallback;
        }
        /** Boolean attribute: present and not `"false"`. */
        flag(name) {
            const v = this.getAttribute(name);
            return v !== null && v !== 'false';
        }
        setFlag(name, on) {
            this.toggleAttribute(name, !!on);
        }
        onCleanup(fn) {
            this._cleanups.push(fn);
        }
        listen(target, type, fn, options) {
            target.addEventListener(type, fn, options);
            this.onCleanup(() => target.removeEventListener(type, fn, options));
        }
        /** Calls `cb(true/false)` as the element enters / leaves the viewport. */
        inView(cb, init, target = this) {
            if (typeof IntersectionObserver === 'undefined') {
                cb(true);
                return;
            }
            const f = (entries) => {
                for (const e of entries)
                    cb(e.isIntersecting, e);
            };
            let io;
            try {
                io = new IntersectionObserver(f, init);
            }
            catch {
                io = new IntersectionObserver(f); // 13.1.0: an invalid root-margin / threshold attribute falls back to the defaults
            }
            io.observe(target);
            this.onCleanup(() => io.disconnect());
        }
        /** `el.animate()` that returns `null` (and applies the last frame) without WAAPI. */
        motion(el, keyframes, options) {
            return animateWithMotion(el, keyframes, options);
        }
        emit(type, detail) {
            // 13.0.1: composed — usa:* events cross Shadow DOM boundaries (documented since 12.0, missing until now)
            return this.dispatchEvent(new CustomEvent(`usa:${type}`, { detail, bubbles: true, composed: true, cancelable: true }));
        }
    }
    baseClass = Base;
    return baseClass;
}
/**
 * `el.animate()` with the library's motion rules (5.0, shared by elements and
 * registered effects): motion sensitivity (keyframes adapted, `static` →
 * final frame), intensity (duration scale) and the animation budget. Returns
 * `null` (final frame applied) when nothing should animate.
 */
function animateWithMotion(el, keyframes, options) {
    // no WAAPI / `static` → the unadapted final frame; over the animation budget → the adapted one
    if (typeof el.animate !== 'function' || config.motionSensitivity === 'static' || ((keyframes = adaptKeyframes(keyframes)), active >= maxActive)) {
        applyFrame(el, keyframes[keyframes.length - 1]);
        return null;
    }
    const k = motionScale();
    if (k !== 1 && k > 0 && typeof options.duration === 'number')
        options = { ...options, duration: options.duration * k, delay: (options.delay || 0) * k };
    const a = el.animate(keyframes, options);
    trackAnimation(a);
    if (options.iterations !== Infinity) {
        active++;
        // settles exactly once (fulfilled or rejected), so no guard is needed
        const end = () => void active--;
        a?.finished?.then(end, end);
    }
    return a;
}
/** Write a keyframe's properties as inline styles (no-WAAPI fallback). */
function applyFrame(el, frame) {
    if (!frame)
        return;
    for (const [k, v] of Object.entries(frame)) {
        if (k === 'offset' || k === 'easing' || k === 'composite' || v == null)
            continue;
        el.style[k] = String(v);
    }
}
/**
 * Register `tag` with the class built by `make(Base)`. Returns the
 * constructor, the already registered one, or `undefined` without DOM.
 */
function defineElement(tag, make, css) {
    if (!canDefine())
        return undefined;
    adoptStyles('base', BASE_CSS);
    if (css)
        adoptStyles(css.id, css.text);
    const existing = customElements.get(tag);
    if (existing)
        return existing;
    const ctor = make(getBase());
    customElements.define(tag, ctor);
    return ctor;
}
const BASE_CSS = '.usa-sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;border:0}';
/** A visually hidden copy of `text` for screen readers (the animated copy is `aria-hidden`). */
function srText(text) {
    const s = document.createElement('span');
    s.className = 'usa-sr';
    s.textContent = text;
    return s;
}
// --- shared rAF scheduler (4.5) ----------------------------------------------
// One requestAnimationFrame per frame for every component loop; a throwing
// callback no longer starves the others (the first error is rethrown).
// 13.4: frame budget (over-budget callbacks wait for the next frame, oldest
// first); a callback / loop given an owner element is dropped once the owner
// is detached. Offscreen / hidden-tab pause is a plug-in (setPauseHook,
// installed by motionary/components/offscreen — not part of lite).
const frameQueue = /*#__PURE__*/ new Map();
let frameSeq = 1;
let frameHandle = 0;
let frameVia = null;
const frameStats = { frames: 0, callbacks: 0, peak: 0, last: 0, deferred: 0, parked: 0, budget: 8 };
/** loop → owner element */
const frameListeners = /*#__PURE__*/ new Map();
let pauseHook;
let watchHook;
/** 0 run, 1 park (detached owner / pause hook), 2 drop (raf callback of a detached owner). */
const gate = (el) => (el && !el.isConnected ? 2 : pauseHook?.(el) ? 1 : 0);
function flushFrame(t) {
    const st = frameStats;
    frameHandle = 0;
    const dt = st.last && t > st.last ? t - st.last : 16.7;
    st.last = t;
    st.frames++;
    const start = now();
    let n = 0;
    let p = 0;
    let live = 0;
    let error = null;
    for (const [id, [cb, el]] of [...frameQueue]) {
        if (n && now() - start > st.budget) {
            st.deferred++;
            break;
        }
        const g = gate(el);
        if (g & 1)
            p++;
        else if ((frameQueue.delete(id), !g))
            try {
                n++;
                cb(t);
            }
            catch (e) {
                error ?? (error = e);
            }
    }
    st.callbacks += n;
    st.peak = Math.max(st.peak, n);
    // 8.0: loops run on the unified motion clock — dt scaled by its rate, frozen while paused
    const c = clk();
    if (!c.paused) {
        const cdt = dt * c.rate;
        c.time += cdt;
        frameListeners.forEach((el, fn) => (gate(el) ? p++ : (live++, fn(t, cdt))));
    }
    st.parked += p;
    // everything parked: the pause hook's wake() restarts the loop
    if (live || frameQueue.size > p)
        requestFlush();
    if (error)
        throw error;
}
function requestFlush() {
    const native = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : null;
    // A stale handle from a replaced requestAnimationFrame (tests, iframes) is dropped.
    if (frameHandle && frameVia === native)
        return;
    frameVia = native;
    frameHandle = native ? native(flushFrame) : setTimeout(() => flushFrame(now()), 16);
}
/**
 * requestAnimationFrame through the shared scheduler (timeout fallback in jsdom / hidden documents).
 * 13.4: with an owner `el` the callback is dropped once `el` is detached (and paused off screen when the offscreen plug-in is installed).
 */
const raf = (cb, el) => {
    const id = frameSeq++;
    frameQueue.set(id, [cb, el]);
    el && watchHook?.(el);
    requestFlush();
    return id;
};
/** High-resolution time (13.4: `performance` is global in every supported browser and Node ≥ 16). */
const now = () => performance.now();
const caf = (id) => {
    frameQueue.delete(id);
};
/**
 * Run `fn(time, dt)` every frame on the shared scheduler until the returned function is called.
 * 13.4: with an owner `el` the loop stops running once `el` is detached (and pauses off screen with the offscreen plug-in).
 */
function onFrame(fn, el) {
    frameListeners.set(fn, el);
    el && watchHook?.(el);
    if (!clk().paused)
        requestFlush();
    return () => frameListeners.delete(fn);
}
/** Scheduler counters: frames flushed, callbacks run, peak per frame, pending now, loops, frames split by the budget, callbacks / loops parked, budget ms. */
function schedulerStats() {
    const { last, ...rest } = frameStats;
    return { ...rest, pending: frameQueue.size, loops: frameListeners.size };
}
/** 13.4: per-frame time budget in ms for queued callbacks (default 8; `Infinity` = never split a frame). */
function setFrameBudget(ms) {
    frameStats.budget = ms > 0 ? ms : 8;
}
/**
 * 13.4: plug a pause predicate into the scheduler. `park(el)` returning truthy holds an owned
 * callback / loop (el is undefined for unowned ones); `watch(el)` is told about every new owner.
 * Returns `wake()`, to call when the predicate may have flipped back.
 */
function setPauseHook(park, watch) {
    pauseHook = park;
    watchHook = watch;
    return requestFlush;
}
const CLOCK_KEY = /*#__PURE__*/ Symbol.for('motionary.clock');
// 11.1: created on first use, so importing this module writes nothing to globalThis.
const clk = () => { var _a; return ((_a = globalThis)[CLOCK_KEY] || (_a[CLOCK_KEY] = { rate: 1, paused: false, time: 0, anims: new Set(), subs: new Set() })); };
function applyClock(a) {
    const { rate, paused } = clk();
    try {
        if (typeof a.updatePlaybackRate === 'function')
            a.updatePlaybackRate(rate);
        else if (rate !== 1 || a.playbackRate !== undefined)
            a.playbackRate = rate;
        if (paused)
            a.pause?.();
        else if (a.playState === 'paused' && a._usaClockPaused)
            a.play?.();
        a._usaClockPaused = paused;
    }
    catch {
        /* finished / detached animation */
    }
}
/** Put an animation on the shared motion clock (animateWithMotion does this for every component / effect animation). */
function trackAnimation(a) {
    if (!a)
        return;
    if (clk().rate !== 1 || clk().paused)
        applyClock(a);
    clk().anims.add(a);
    const drop = () => clk().anims.delete(a);
    a.finished?.then(drop, drop);
}
/** The motion clock's state: `rate` (1 = normal), `paused`, `time` (clock ms elapsed, scaled by rate). */
function getClock() {
    const { rate, paused, time, anims } = clk();
    return { rate, paused, time, tracked: anims.size };
}
/** Change the shared clock: `{ rate }` (0.05–8) and / or `{ paused }`. Applies to running animations and loops. */
function setClock(next) {
    const c = clk();
    const wasPaused = c.paused;
    if (typeof next.rate === 'number' && Number.isFinite(next.rate))
        c.rate = clamp(next.rate, 0.05, 8);
    if (typeof next.paused === 'boolean')
        c.paused = next.paused;
    c.anims.forEach(applyClock);
    if (wasPaused && !c.paused && frameListeners.size)
        requestFlush();
    c.subs.forEach((fn) => fn());
}
/** Subscribe to clock changes; returns an unsubscribe. */
function onClockChange(fn) {
    clk().subs.add(fn);
    return () => clk().subs.delete(fn);
}
// --- active animation budget (4.5) ---------------------------------------------
let active = 0;
let maxActive = Infinity;
/** Number of component animations running right now. */
const activeAnimations = () => active;
/** Cap concurrent component animations; extra ones jump to their final frame (`Infinity` = no cap). */
function setAnimationBudget(max) {
    maxActive = max > 0 ? max : Infinity;
}
/** The current cap. */
const animationBudget = () => maxActive;
// --- on-demand styles (4.5) -----------------------------------------------------
let styleLoader = null;
/** Called with each element's tag the first time one connects (used by the `lite` build to load CSS on demand). */
function setStyleLoader(fn) {
    styleLoader = fn;
}
const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';
const EASE_SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
/** Windows Fluent "decelerate" / "point-to-point" curves. */
const FLUENT_DECELERATE = 'cubic-bezier(0.1, 0.9, 0.2, 1)';
const warned = /*#__PURE__*/ new Set();
/** Log a deprecation once per key (console.warn). */
function deprecate(key, message) {
    if (warned.has(key))
        return;
    warned.add(key);
    console.warn(`[motionary] ${message}`);
}
/**
 * The `kind` attribute of `<usa-spinner>`, `<usa-check>`, `<usa-dialog>` and
 * `<usa-acrylic>` (3.0: `variant` only selects a style variant).
 */
function kindOf(el, valid, fallback) {
    const k = el.getAttribute('kind');
    return k && (Array.isArray(valid) ? valid.includes(k) : k in valid) ? k : fallback;
}
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export { withoutDeprecations as A, setStyleLoader as B, srText as C, EASE_OUT as D, EASE_SPRING as E, deprecate as F, FOCUSABLE as G, adoptStyles as H, queryAttr as I, kindOf as J, shadowStyles as K, FLUENT_DECELERATE as L, MOTION_SENSITIVITY_LEVELS as M, applyFrame as a, caf as b, configureComponents as c, animateWithMotion as d, clamp as e, defineElement as f, getMotionSensitivity as g, onClockChange as h, setClock as i, getClock as j, canDefine as k, MOTION_SCALE as l, motionScale as m, now as n, onFrame as o, prefersReducedMotion as p, activeAnimations as q, raf as r, setPauseHook as s, trackAnimation as t, adaptKeyframes as u, animationBudget as v, getMotionIntensity as w, schedulerStats as x, setAnimationBudget as y, setFrameBudget as z };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v14.5.0/dist/chunks/base-ByyAdGqz.js.map