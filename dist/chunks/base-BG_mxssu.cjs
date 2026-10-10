'use strict';

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
    if (options.motionIntensity && typeof document !== 'undefined') {
        document.documentElement.style.setProperty('--usa-motion', String(MOTION_SCALE[options.motionIntensity] ?? 1));
        document.documentElement.setAttribute('data-usa-motion', options.motionIntensity);
    }
    if (options.motionSensitivity && typeof document !== 'undefined') {
        if (options.motionSensitivity === 'full')
            document.documentElement.removeAttribute('data-usa-sensitivity');
        else
            document.documentElement.setAttribute('data-usa-sensitivity', options.motionSensitivity);
    }
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
        for (const [k, v] of Object.entries(f)) {
            if (k === 'offset' || k === 'easing' || k === 'composite')
                out[k] = v;
            else if (level === 'minimal') {
                if (k === 'opacity')
                    out[k] = v;
            }
            else if (k === 'rotate' || k === 'scale' || (k === 'transform' && VESTIBULAR.test(String(v))))
                continue;
            else
                out[k] = v;
        }
        return out;
    });
}
/** Run `fn` without 4.9 deprecation warnings (library-internal calls). */
function withoutDeprecations(fn) {
    try {
        return fn();
    }
    finally {
    }
}
/** The current global motion intensity. */
function getMotionIntensity() {
    return config.motionIntensity;
}
/** Duration multiplier for the current intensity (1 when `normal`). */
function motionScale() {
    return MOTION_SCALE[config.motionIntensity] ?? 1;
}
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
    try {
        if (typeof CSSStyleSheet === 'function' && 'adoptedStyleSheets' in document) {
            const sheet = new CSSStyleSheet();
            sheet.replaceSync(css);
            document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
            return;
        }
    }
    catch {
        /* fall through to <style> */
    }
    const style = document.createElement('style');
    style.setAttribute('data-usa', id);
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);
}
/** Attach `css` to a shadow root (constructable sheet where supported, else `<style>`). */
function shadowStyles(root, css) {
    try {
        if (typeof CSSStyleSheet === 'function' && 'adoptedStyleSheets' in root) {
            const sheet = new CSSStyleSheet();
            sheet.replaceSync(css);
            root.adoptedStyleSheets = [sheet];
            return;
        }
    }
    catch {
        /* fall through */
    }
    const style = document.createElement('style');
    style.textContent = css;
    root.prepend(style);
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
            this._connected = false;
        }
        get reduced() {
            return prefersReducedMotion();
        }
        connectedCallback() {
            if (this._connected)
                return;
            this._connected = true;
            styleLoader?.(this.localName);
            // Upgraded while the parser is still inside us (a <script> in <head>
            // defined the element): children/text are not there yet, so wait.
            if (typeof document !== 'undefined' && document.readyState === 'loading' && !this.nextSibling && !this.childNodes.length) {
                const go = () => {
                    if (this._connected && this.isConnected)
                        this.mount();
                };
                document.addEventListener('DOMContentLoaded', go, { once: true });
                this._cleanups.push(() => document.removeEventListener('DOMContentLoaded', go));
                return;
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
            const v = this.getAttribute(name);
            return v === null ? fallback : v;
        }
        num(name, fallback) {
            const v = this.getAttribute(name);
            const n = v === null || v.trim() === '' ? NaN : Number(v);
            return Number.isFinite(n) ? n : fallback;
        }
        /** Boolean attribute: present and not `"false"`. */
        flag(name) {
            const v = this.getAttribute(name);
            return v !== null && v !== 'false';
        }
        setFlag(name, on) {
            if (on)
                this.setAttribute(name, '');
            else
                this.removeAttribute(name);
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
            const io = new IntersectionObserver((entries) => {
                for (const e of entries)
                    cb(e.isIntersecting, e);
            }, init);
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
    if (typeof el.animate !== 'function' || config.motionSensitivity === 'static') {
        applyFrame(el, keyframes[keyframes.length - 1]);
        return null;
    }
    keyframes = adaptKeyframes(keyframes);
    if (active >= maxActive) {
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
        let done = false;
        const end = () => {
            if (!done) {
                done = true;
                active--;
            }
        };
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
// Every component loop goes through one requestAnimationFrame per frame
// instead of one per element: callbacks are batched, run in order, and a
// throwing callback no longer starves the others (the first error is rethrown).
const frameQueue = /*#__PURE__*/ new Map();
let frameSeq = 1;
let frameHandle = 0;
let frameVia = null;
const frameStats = { frames: 0, callbacks: 0, peak: 0, last: 0 };
const frameListeners = new Set();
function flushFrame(t) {
    frameHandle = 0;
    const dt = frameStats.last && t > frameStats.last ? t - frameStats.last : 16.7;
    frameStats.last = t;
    frameStats.frames++;
    const cbs = Array.from(frameQueue.values());
    frameQueue.clear();
    frameStats.callbacks += cbs.length;
    frameStats.peak = Math.max(frameStats.peak, cbs.length);
    let error = null;
    for (const cb of cbs) {
        try {
            cb(t);
        }
        catch (e) {
            error ?? (error = e);
        }
    }
    // 8.0: loops run on the unified motion clock — dt scaled by its rate, frozen while paused
    if (!clk().paused) {
        const cdt = dt * clk().rate;
        clk().time += cdt;
        frameListeners.forEach((fn) => fn(t, cdt));
        if (frameListeners.size)
            requestFlush();
    }
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
/** requestAnimationFrame through the shared scheduler (timeout fallback in jsdom / hidden documents). */
const raf = (cb) => {
    const id = frameSeq++;
    frameQueue.set(id, cb);
    requestFlush();
    return id;
};
/** Monotonic time in ms (rAF callback timestamps differ between environments, so loops use this). */
const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
const caf = (id) => {
    frameQueue.delete(id);
};
/** Run `fn(time, dt)` every frame on the shared scheduler until the returned function is called. */
function onFrame(fn) {
    frameListeners.add(fn);
    if (!clk().paused)
        requestFlush();
    return () => frameListeners.delete(fn);
}
/** Scheduler counters: frames flushed, callbacks run, peak callbacks in one frame, pending now. */
function schedulerStats() {
    return { frames: frameStats.frames, callbacks: frameStats.callbacks, peak: frameStats.peak, pending: frameQueue.size, loops: frameListeners.size };
}
const CLOCK_KEY = /*#__PURE__*/ Symbol.for('motionary.clock');
// 11.1: created on first use, so importing this module writes nothing to globalThis.
const clk = () => { var _a; return ((_a = globalThis)[CLOCK_KEY] || (_a[CLOCK_KEY] = { rate: 1, paused: false, time: 0, anims: new Set(), subs: new Set() })); };
function applyClock(a) {
    try {
        if (typeof a.updatePlaybackRate === 'function')
            a.updatePlaybackRate(clk().rate);
        else if (clk().rate !== 1 || a.playbackRate !== undefined)
            a.playbackRate = clk().rate;
        if (clk().paused)
            a.pause?.();
        else if (a.playState === 'paused' && a._usaClockPaused)
            a.play?.();
        a._usaClockPaused = clk().paused;
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
    return { rate: clk().rate, paused: clk().paused, time: clk().time, tracked: clk().anims.size };
}
/** Change the shared clock: `{ rate }` (0.05–8) and / or `{ paused }`. Applies to running animations and loops. */
function setClock(next) {
    const wasPaused = clk().paused;
    if (typeof next.rate === 'number' && Number.isFinite(next.rate))
        clk().rate = Math.min(8, Math.max(0.05, next.rate));
    if (typeof next.paused === 'boolean')
        clk().paused = next.paused;
    clk().anims.forEach(applyClock);
    if (wasPaused && !clk().paused && frameListeners.size)
        requestFlush();
    clk().subs.forEach((fn) => fn());
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
    if (typeof console !== 'undefined')
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

exports.EASE_OUT = EASE_OUT;
exports.EASE_SPRING = EASE_SPRING;
exports.FLUENT_DECELERATE = FLUENT_DECELERATE;
exports.MOTION_SCALE = MOTION_SCALE;
exports.MOTION_SENSITIVITY_LEVELS = MOTION_SENSITIVITY_LEVELS;
exports.activeAnimations = activeAnimations;
exports.adaptKeyframes = adaptKeyframes;
exports.adoptStyles = adoptStyles;
exports.animateWithMotion = animateWithMotion;
exports.animationBudget = animationBudget;
exports.applyFrame = applyFrame;
exports.caf = caf;
exports.canDefine = canDefine;
exports.clamp = clamp;
exports.configureComponents = configureComponents;
exports.defineElement = defineElement;
exports.deprecate = deprecate;
exports.getClock = getClock;
exports.getMotionIntensity = getMotionIntensity;
exports.getMotionSensitivity = getMotionSensitivity;
exports.kindOf = kindOf;
exports.motionScale = motionScale;
exports.now = now;
exports.onClockChange = onClockChange;
exports.onFrame = onFrame;
exports.prefersReducedMotion = prefersReducedMotion;
exports.raf = raf;
exports.schedulerStats = schedulerStats;
exports.setAnimationBudget = setAnimationBudget;
exports.setClock = setClock;
exports.setStyleLoader = setStyleLoader;
exports.shadowStyles = shadowStyles;
exports.srText = srText;
exports.trackAnimation = trackAnimation;
exports.withoutDeprecations = withoutDeprecations;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v13.0.2/dist/chunks/base-BG_mxssu.cjs.map