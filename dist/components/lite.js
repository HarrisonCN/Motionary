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
    if (typeof el.animate !== 'function' || config.motionSensitivity === 'static') {
        applyFrame(el, keyframes[keyframes.length - 1]);
        return null;
    }
    keyframes = adaptKeyframes(keyframes);
    if (active$1 >= maxActive) {
        applyFrame(el, keyframes[keyframes.length - 1]);
        return null;
    }
    const k = motionScale();
    if (k !== 1 && k > 0 && typeof options.duration === 'number')
        options = { ...options, duration: options.duration * k, delay: (options.delay || 0) * k };
    const a = el.animate(keyframes, options);
    trackAnimation(a);
    if (options.iterations !== Infinity) {
        active$1++;
        let done = false;
        const end = () => {
            if (!done) {
                done = true;
                active$1--;
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
// --- active animation budget (4.5) ---------------------------------------------
let active$1 = 0;
let maxActive = Infinity;
/** Number of component animations running right now. */
const activeAnimations = () => active$1;
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

// The component categories and their default tags (no imports: safe for lazy loaders).
/** The component categories and their default tags. */
const COMPONENT_CATEGORIES = {
    reveal: ['usa-reveal', 'usa-stagger', 'usa-scroll-progress', 'usa-scrolly'],
    text: ['usa-typewriter', 'usa-split-text', 'usa-scramble', 'usa-counter', 'usa-shimmer-text', 'usa-text-rotate', 'usa-wave-text', 'usa-glitch', 'usa-gradient-text', 'usa-handwriting', 'usa-scroll-highlight'],
    interaction: ['usa-ripple', 'usa-magnetic', 'usa-tilt', 'usa-spotlight', 'usa-press'],
    feedback: ['usa-spinner', 'usa-skeleton', 'usa-progress', 'usa-toaster', 'usa-check'],
    background: ['usa-aurora', 'usa-particles', 'usa-grain', 'usa-marquee', 'usa-acrylic', 'usa-grid-glow', 'usa-blobs', 'usa-water-ripple', 'usa-dot-network'],
    transitions: ['usa-dialog', 'usa-accordion', 'usa-view-switch'],
    physics: ['usa-spring', 'usa-draggable', 'usa-overscroll'],
    cards: ['usa-card', 'usa-card-stack', 'usa-sticky-stack', 'usa-carousel-3d'],
    click: ['usa-click', 'usa-button', 'usa-icon-morph', 'usa-like', 'usa-hold', 'usa-double-tap', 'usa-checkbox'],
    ui: ['usa-tabs', 'usa-drawer', 'usa-bottom-sheet', 'usa-pull-refresh', 'usa-fab', 'usa-navbar', 'usa-slider', 'usa-popover', 'usa-badge', 'usa-avatar-stack'],
    page: ['usa-cursor', 'usa-fullpage', 'usa-loading-bar', 'usa-back-to-top', 'usa-ambient', 'usa-splash', 'usa-auto-skeleton', 'usa-motion-switch'],
    timeline: ['usa-timeline'],
    gesture: ['usa-swipeable', 'usa-pinch-zoom'],
    svg: ['usa-draw', 'usa-morph', 'usa-mask-reveal', 'usa-anim-icon'],
    webgl: ['usa-shader', 'usa-distort', 'usa-liquid', 'usa-post-fx'],
    depth: ['usa-cube', 'usa-depth'],
    layout: ['usa-auto-animate', 'usa-masonry'],
    packs: ['usa-pack'],
    fx: ['usa-fx'],
};

/**
 * motionary/components/perf — performance toolkit (4.5).
 *
 * - One shared rAF scheduler for every component loop (`onFrame()`, `schedulerStats()`).
 * - Animation budget: `setAnimationBudget(n)` caps concurrent component
 *   animations; extra ones land on their final frame.
 * - `autoDegrade()`: watches frame rate and animation count and steps motion
 *   down (`low`, then a tighter budget) while the device struggles, restoring
 *   it when frames recover.
 * - On-demand CSS: `loadCategoryStyles()` / `onDemandStyles()` — used by
 *   `motionary/components/lite`, the build without inlined CSS.
 */
/**
 * Watch frame rate and animation count; while the device struggles, set
 * motion intensity to `low` and cap concurrent animations at `maxActive / 2`,
 * then restore the previous settings once frames recover. Dispatches
 * `usa:degrade` on `document`. Returns a stop function (restores settings).
 */
function autoDegrade(options = {}) {
    const { minFps = 45, maxActive = 40, sample = 1000, patience = 2, recovery = 3, onChange } = options;
    let frames = 0;
    let elapsed = 0;
    let bad = 0;
    let good = 0;
    let prev = null;
    const state = { degraded: false, fps: 60, active: 0, reason: '' };
    const set = (degraded, reason) => {
        if (degraded === state.degraded)
            return;
        state.degraded = degraded;
        state.reason = reason;
        if (degraded) {
            prev = { intensity: getMotionIntensity(), budget: animationBudget() };
            configureComponents({ motionIntensity: 'low' });
            setAnimationBudget(Math.max(4, Math.floor(maxActive / 2)));
        }
        else if (prev) {
            configureComponents({ motionIntensity: prev.intensity });
            setAnimationBudget(prev.budget);
            prev = null;
        }
        onChange?.({ ...state });
        if (typeof document !== 'undefined')
            document.dispatchEvent(new CustomEvent('usa:degrade', { detail: { ...state } }));
    };
    const stop = onFrame((_t, dt) => {
        frames++;
        elapsed += Math.min(dt, 250);
        if (elapsed < sample)
            return;
        state.fps = Math.round((frames * 1000) / elapsed);
        state.active = activeAnimations();
        frames = 0;
        elapsed = 0;
        const reason = state.fps < minFps ? 'fps' : state.active > maxActive ? 'count' : '';
        if (reason) {
            good = 0;
            if (++bad >= patience)
                set(true, reason);
        }
        else {
            bad = 0;
            if (++good >= recovery)
                set(false, '');
        }
    });
    return () => {
        stop();
        set(false, '');
    };
}
const TAG_CATEGORY = {};
for (const [cat, tags] of Object.entries(COMPONENT_CATEGORIES))
    for (const t of tags)
        TAG_CATEGORY[t] = cat;
/** The category of a default `<usa-*>` tag. */
const categoryOf = (tag) => TAG_CATEGORY[tag];
const loaded = /*#__PURE__*/ new Set();
/**
 * Add `<link rel="stylesheet" href="{base}components/{category}.css">` once.
 * `base` is the URL of the package's `dist/` folder.
 */
function loadCategoryStyles(category, base) {
    if (typeof document === 'undefined' || loaded.has(category))
        return null;
    loaded.add(category);
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${base.replace(/\/?$/, '/')}${category === 'all' ? 'components.css' : `components/${category}.css`}`;
    link.setAttribute('data-usa-css', category);
    document.head.appendChild(link);
    return link;
}
/**
 * Load each category's CSS the first time one of its elements connects
 * (custom tags fall back to the full stylesheet). Returns an undo.
 */
function onDemandStyles(base) {
    setStyleLoader((tag) => loadCategoryStyles(categoryOf(tag) || 'all', base));
    return () => setStyleLoader(null);
}
/** Categories whose CSS has been requested so far. */
const loadedStyles = () => Array.from(loaded);

/** Entrance effects shared by `<usa-reveal>` and `<usa-stagger>` (transform / opacity / filter only). */
const REVEAL_EFFECTS = [
    'fade',
    'fade-up',
    'fade-down',
    'fade-left',
    'fade-right',
    'zoom-in',
    'zoom-out',
    'blur',
    'blur-up',
    'flip-up',
    'flip-left',
    'rise',
];
/** The "from" keyframe of an effect; the "to" keyframe is the element's natural state. */
function revealFrom(effect, distance = 32) {
    const d = `${distance}px`;
    switch (effect) {
        case 'fade':
            return { opacity: 0 };
        case 'fade-down':
            return { opacity: 0, transform: `translate3d(0,-${d},0)` };
        case 'fade-left':
            return { opacity: 0, transform: `translate3d(-${d},0,0)` };
        case 'fade-right':
            return { opacity: 0, transform: `translate3d(${d},0,0)` };
        case 'zoom-in':
            return { opacity: 0, transform: 'scale(0.86)' };
        case 'zoom-out':
            return { opacity: 0, transform: 'scale(1.14)' };
        case 'blur':
            return { opacity: 0, filter: 'blur(12px)' };
        case 'blur-up':
            return { opacity: 0, filter: 'blur(10px)', transform: `translate3d(0,${d},0)` };
        case 'flip-up':
            return { opacity: 0, transform: 'perspective(800px) rotateX(-55deg)', transformOrigin: '50% 100%' };
        case 'flip-left':
            return { opacity: 0, transform: 'perspective(800px) rotateY(55deg)', transformOrigin: '0% 50%' };
        case 'rise':
            return { opacity: 0, transform: `translate3d(0,${distance * 1.5}px,0) scale(0.96)` };
        case 'fade-up':
        default:
            return { opacity: 0, transform: `translate3d(0,${d},0)` };
    }
}
/** Keyframes from the effect to the natural state. */
function revealKeyframes(effect, distance) {
    // Any preset registered with the scroll library (core, `presets/extended`, your own)
    const p = REVEAL_EFFECTS.includes(effect) ? null : globalThis[Symbol.for('use-scroll-animate.presets')]?.[effect];
    if (p)
        return [p.from, ...(p.frames || []), p.to];
    const from = revealFrom(effect, distance);
    const to = {};
    for (const k of Object.keys(from)) {
        if (k === 'opacity')
            to.opacity = 1;
        else if (k === 'transform')
            to.transform = 'none';
        else if (k === 'filter')
            to.filter = 'none';
        else if (k === 'transformOrigin')
            to.transformOrigin = from.transformOrigin;
    }
    return [from, to];
}

var css$13 = "";

function defineReveal(tag = 'usa-reveal') {
    return defineElement(tag, (Base) => class UsaReveal extends Base {
        constructor() {
            super(...arguments);
            this._anim = null;
        }
        static get observedAttributes() {
            return ['effect', 'distance', 'repeat', 'threshold', 'root-margin', 'duration', 'delay', 'easing'];
        }
        get effect() {
            return this.str('effect', 'fade-up');
        }
        set effect(v) {
            this.setAttribute('effect', v);
        }
        get revealed() {
            return this.getAttribute('data-state') !== 'hidden';
        }
        mount() {
            if (this.reduced) {
                this.setAttribute('data-state', 'shown');
                return;
            }
            if (this.getAttribute('data-state') !== 'shown')
                this.setAttribute('data-state', 'hidden');
            this.inView((visible) => {
                if (visible) {
                    this.emit('enter');
                    if (!this.revealed)
                        this.reveal();
                }
                else {
                    this.emit('leave');
                    if (this.flag('repeat') && this.revealed)
                        this.reset();
                }
            }, { threshold: this.num('threshold', 0.15), rootMargin: this.str('root-margin', '0px') });
        }
        unmount() {
            this._anim?.cancel();
            this._anim = null;
        }
        reveal() {
            this._anim?.cancel();
            this.setAttribute('data-state', 'shown');
            if (this.reduced)
                return Promise.resolve();
            const a = this.motion(this, revealKeyframes(this.effect, this.num('distance', 32)), {
                duration: this.num('duration', 700),
                delay: this.num('delay', 0),
                easing: this.str('easing', EASE_OUT),
                fill: 'backwards',
            });
            this._anim = a;
            return new Promise((resolve) => {
                const done = () => {
                    if (this._anim === a)
                        this._anim = null;
                    this.emit('complete');
                    resolve();
                };
                if (!a)
                    done();
                else
                    a.onfinish = done;
            });
        }
        reset() {
            this._anim?.cancel();
            this._anim = null;
            if (!this.reduced)
                this.setAttribute('data-state', 'hidden');
        }
    }, { id: 'reveal', text: css$13 });
}

function defineStagger(tag = 'usa-stagger') {
    return defineElement(tag, (Base) => class UsaStagger extends Base {
        constructor() {
            super(...arguments);
            this._anims = [];
        }
        static get observedAttributes() {
            return ['effect', 'repeat', 'threshold', 'distance', 'interval', 'delay', 'duration', 'easing'];
        }
        mount() {
            if (this.reduced) {
                this.setAttribute('data-state', 'shown');
                return;
            }
            if (this.getAttribute('data-state') !== 'shown')
                this.setAttribute('data-state', 'hidden');
            this.inView((visible) => {
                if (visible && this.getAttribute('data-state') === 'hidden') {
                    this.emit('enter');
                    this.reveal();
                }
                else if (!visible && this.flag('repeat'))
                    this.reset();
            }, { threshold: this.num('threshold', 0.1) });
        }
        unmount() {
            this.cancel();
        }
        cancel() {
            this._anims.splice(0).forEach((a) => a.cancel());
        }
        reveal() {
            this.cancel();
            this.setAttribute('data-state', 'shown');
            const kids = Array.from(this.children);
            if (this.reduced || !kids.length)
                return Promise.resolve();
            const frames = revealKeyframes(this.str('effect', 'fade-up'), this.num('distance', 24));
            const interval = this.num('interval', 70);
            const base = this.num('delay', 0);
            const duration = this.num('duration', 600);
            const easing = this.str('easing', EASE_OUT);
            const anims = kids
                .map((kid, i) => this.motion(kid, frames, { duration, easing, delay: base + i * interval, fill: 'backwards' }))
                .filter((a) => !!a);
            this._anims = anims;
            const last = anims[anims.length - 1];
            return new Promise((resolve) => {
                const done = () => {
                    this.emit('complete');
                    resolve();
                };
                if (!last)
                    done();
                else
                    last.onfinish = done;
            });
        }
        reset() {
            this.cancel();
            if (!this.reduced)
                this.setAttribute('data-state', 'hidden');
        }
    }, { id: 'reveal', text: css$13 });
}

var css$12 = "";

/** Progress (0–1) of `target` scrolling through the viewport, or of the page. */
function readScrollProgress(target) {
    if (typeof window === 'undefined')
        return 0;
    const vh = window.innerHeight || document.documentElement.clientHeight;
    if (target) {
        const r = target.getBoundingClientRect();
        const total = r.height - vh;
        return total <= 0 ? (r.top <= 0 ? 1 : 0) : clamp(-r.top / total, 0, 1);
    }
    const doc = document.documentElement;
    const max = doc.scrollHeight - vh;
    return max <= 0 ? 0 : clamp((window.scrollY || doc.scrollTop) / max, 0, 1);
}
function defineScrollProgress(tag = 'usa-scroll-progress') {
    return defineElement(tag, (Base) => class UsaScrollProgress extends Base {
        constructor() {
            super(...arguments);
            this._bar = null;
            this._p = -1;
            this._frame = 0;
        }
        static get observedAttributes() {
            return ['target', 'label'];
        }
        get progress() {
            return Math.max(0, this._p);
        }
        mount() {
            if (!this._bar) {
                this._bar = document.createElement('span');
                this._bar.className = 'usa-progress-fill';
                this.replaceChildren(this._bar);
            }
            this.setAttribute('role', 'progressbar');
            this.setAttribute('aria-valuemin', '0');
            this.setAttribute('aria-valuemax', '100');
            if (!this.hasAttribute('aria-label'))
                this.setAttribute('aria-label', this.str('label', 'Reading progress'));
            const schedule = () => {
                // contract-exempt: reduced-motion — the bar mirrors scroll position (user-driven), no autonomous motion
                if (!this._frame)
                    this._frame = raf(() => ((this._frame = 0), this.update()));
            };
            this.listen(window, 'scroll', schedule, { passive: true });
            this.listen(window, 'resize', schedule, { passive: true });
            this.update();
        }
        unmount() {
            caf(this._frame);
            this._frame = 0;
        }
        update() {
            const sel = this.getAttribute('target');
            const target = queryAttr(sel);
            const p = readScrollProgress(target);
            if (Math.abs(p - this._p) < 0.0005)
                return;
            this._p = p;
            if (this._bar)
                this._bar.style.transform = `scaleX(${p})`;
            this.style.setProperty('--usa-progress', String(p));
            const pct = String(Math.round(p * 100));
            if (this.getAttribute('aria-valuenow') !== pct)
                this.setAttribute('aria-valuenow', pct);
            this.emit('progress', { progress: p });
        }
    }, { id: 'scroll-progress', text: css$12 });
}

var css$11 = "";

function defineScrolly(tag = 'usa-scrolly') {
    return defineElement(tag, (Base) => class UsaScrolly extends Base {
        constructor() {
            super(...arguments);
            this._active = -1;
        }
        static get observedAttributes() {
            return ['offset'];
        }
        get active() {
            return this._active;
        }
        get steps() {
            return Array.from(this.querySelectorAll('[data-step]'));
        }
        mount() {
            const steps = this.steps;
            if (!steps.length)
                return;
            const offset = clamp(this.num('offset', 0.5), 0, 1);
            // A thin trigger band `offset` down the viewport
            const top = Math.min(99, Math.round(offset * 100));
            const rootMargin = `-${top}% 0px -${Math.max(0, 99 - top)}% 0px`;
            if (typeof IntersectionObserver === 'undefined') {
                this.activate(0);
                return;
            }
            const io = new IntersectionObserver((entries) => {
                for (const e of entries)
                    if (e.isIntersecting)
                        this.activate(steps.indexOf(e.target));
            }, { rootMargin });
            steps.forEach((s) => io.observe(s));
            this.onCleanup(() => io.disconnect());
            if (this._active < 0)
                this.activate(0, true);
        }
        activate(index, silent = false) {
            const steps = this.steps;
            if (index < 0 || index >= steps.length || index === this._active)
                return;
            this._active = index;
            steps.forEach((s, i) => s.toggleAttribute('data-active', i === index));
            const step = steps[index];
            this.setAttribute('active', String(index));
            this.style.setProperty('--usa-step', String(index));
            this.setAttribute('data-step-name', step.dataset.step || String(index));
            if (!silent)
                this.emit('step', { index, step, name: step.dataset.step || '' });
        }
    }, { id: 'scrolly', text: css$11 });
}

/**
 * motionary/components/reveal — entrance & scroll reveal components.
 * `<usa-reveal>`, `<usa-stagger>`, `<usa-scroll-progress>`, `<usa-scrolly>`.
 */
/** Register every component of this category under its default tag. */
function defineRevealComponents() {
    defineReveal();
    defineStagger();
    defineScrollProgress();
    defineScrolly();
}

var css$10 = "";

function defineTypewriter(tag = 'usa-typewriter') {
    return defineElement(tag, (Base) => class UsaTypewriter extends Base {
        constructor() {
            super(...arguments);
            this._source = null;
            this._out = null;
            this._timer = 0;
            this._running = false;
        }
        static get observedAttributes() {
            return ['text', 'words', 'start', 'speed', 'delete-speed', 'pause', 'loop', 'delay'];
        }
        get phrases() {
            const words = this.getAttribute('words');
            if (words)
                return words.split('|').map((w) => w.trim()).filter(Boolean);
            return [this.getAttribute('text') ?? this._source ?? ''];
        }
        mount() {
            if (this._source === null)
                this._source = (this.textContent || '').trim();
            const phrases = this.phrases;
            const sr = srText(phrases.join(', '));
            this._out = document.createElement('span');
            this._out.className = 'usa-tw-text';
            this._out.setAttribute('aria-hidden', 'true');
            const caret = document.createElement('span');
            caret.className = 'usa-tw-caret';
            caret.setAttribute('aria-hidden', 'true');
            this.replaceChildren(sr, this._out, caret);
            this.toggleAttribute('data-no-cursor', this.getAttribute('cursor') === 'false');
            if (this.reduced) {
                this._out.textContent = phrases[0] || '';
                return;
            }
            const start = this.str('start', 'view');
            if (start === 'load')
                this.start();
            else if (start === 'view') {
                this.inView((visible) => {
                    if (visible && !this._running && !this._out?.textContent)
                        this.start();
                });
            }
        }
        unmount() {
            this.stop();
        }
        stop() {
            clearTimeout(this._timer);
            this._timer = 0;
            this._running = false;
            this.removeAttribute('data-typing');
        }
        restart() {
            this.stop();
            if (this._out)
                this._out.textContent = '';
            this.start();
        }
        start() {
            if (this._running || !this._out)
                return;
            const out = this._out;
            const phrases = this.phrases;
            if (this.reduced) {
                out.textContent = phrases[0] || '';
                return;
            }
            this._running = true;
            const speed = this.num('speed', 55);
            const del = this.num('delete-speed', 30);
            const pause = this.num('pause', 1400);
            const loop = this.flag('loop') || phrases.length > 1;
            let p = 0;
            let i = 0;
            let deleting = false;
            const tick = () => {
                const word = phrases[p] || '';
                if (!deleting) {
                    i++;
                    out.textContent = word.slice(0, i);
                    this.setAttribute('data-typing', '');
                    if (i >= word.length) {
                        this.removeAttribute('data-typing');
                        const last = p === phrases.length - 1;
                        if (last)
                            this.emit('complete');
                        if (!loop && last) {
                            this._running = false;
                            return;
                        }
                        deleting = true;
                        this._timer = setTimeout(tick, pause);
                        return;
                    }
                    this._timer = setTimeout(tick, speed * (0.6 + Math.random() * 0.8));
                }
                else {
                    i--;
                    out.textContent = word.slice(0, Math.max(0, i));
                    if (i <= 0) {
                        deleting = false;
                        p = (p + 1) % phrases.length;
                        this._timer = setTimeout(tick, speed * 4);
                        return;
                    }
                    this._timer = setTimeout(tick, del);
                }
            };
            this._timer = setTimeout(tick, this.num('delay', 0));
        }
    }, { id: 'typewriter', text: css$10 });
}

var css$$ = "";

/**
 * Motion design tokens 2.0 (10.6): the W3C Design Tokens Community Group
 * format (DTCG, stable 2025.10) — import with alias resolution and
 * validation, export in the stable or the earlier draft shape.
 *
 * - `resolveTokenAliases(json)` — replaces `{group.token}` references
 *   (whole values and inside composite values), detects cycles and
 *   unknown references;
 * - `validateDesignTokens(json)` — problems (unknown `$type`, malformed
 *   durations / cubic béziers, broken aliases) without throwing;
 * - `importDesignTokens(json)` — resolve + import into `MotionTokens`
 *   (durations, easings, `transition` composites, springs from
 *   `$extensions["org.motionary"]`);
 * - `exportDesignTokens(tokens, { format })` — `2025.10` writes durations
 *   as `{ value, unit: "ms" }`, `draft` as `"150ms"`; springs travel in
 *   `$extensions["org.motionary"].spring` (springs are not a DTCG type).
 */
const REF = /^\{([^{}]+)\}$/;
const isTok = (o) => o && typeof o === 'object' && '$value' in o;
function lookup(root, path) {
    let n = root;
    for (const k of path.split('.'))
        n = n?.[k];
    return n;
}
/** Inherit `$type` from parent groups (DTCG) and resolve `{a.b}` aliases. Throws on cycles / missing targets. */
function resolveTokenAliases(json) {
    const root = JSON.parse(JSON.stringify(json));
    const resolving = new Set();
    const val = (v, at) => {
        if (typeof v === 'string') {
            const m = REF.exec(v.trim());
            if (!m)
                return v;
            const target = lookup(root, m[1]);
            if (!isTok(target))
                throw new Error(`[motionary] tokens: ${at} references {${m[1]}}, which is not a token`);
            if (resolving.has(m[1]))
                throw new Error(`[motionary] tokens: alias cycle through {${m[1]}}`);
            resolving.add(m[1]);
            const out = val(target.$value, m[1]);
            resolving.delete(m[1]);
            if (!target.$type && target.__type)
                target.$type = target.__type;
            return out;
        }
        if (Array.isArray(v))
            return v.map((x, i) => val(x, `${at}[${i}]`));
        if (v && typeof v === 'object')
            return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, val(x, `${at}.${k}`)]));
        return v;
    };
    const walk = (node, path, inherited) => {
        if (!node || typeof node !== 'object')
            return;
        const type = node.$type || inherited;
        if (isTok(node)) {
            if (!node.$type && type)
                node.$type = type;
            if (typeof node.$value === 'string' && REF.exec(node.$value.trim()) && !node.$type) {
                const t = lookup(root, REF.exec(node.$value.trim())[1]);
                if (t?.$type)
                    node.$type = t.$type;
            }
            return;
        }
        for (const [k, v] of Object.entries(node))
            if (!k.startsWith('$'))
                walk(v, [...path, k], type);
    };
    walk(root, []);
    const resolveAll = (node, path) => {
        if (!node || typeof node !== 'object')
            return;
        if (isTok(node)) {
            node.$value = val(node.$value, path.join('.'));
            return;
        }
        for (const [k, v] of Object.entries(node))
            if (!k.startsWith('$'))
                resolveAll(v, [...path, k]);
    };
    resolveAll(root, []);
    return root;
}
const TYPES = ['color', 'dimension', 'fontFamily', 'fontWeight', 'duration', 'cubicBezier', 'number', 'strokeStyle', 'border', 'transition', 'shadow', 'gradient', 'typography', 'string'];
/** Problems in a DTCG file (empty array = valid for motion purposes). */
function validateDesignTokens(json) {
    const out = [];
    let resolved;
    try {
        resolved = resolveTokenAliases(json);
    }
    catch (e) {
        return [String(e.message).replace('[motionary] tokens: ', '')];
    }
    const dur = (v) => (typeof v === 'object' && v && typeof v.value === 'number' && (v.unit === 'ms' || v.unit === 's')) || /^\d*\.?\d+(ms|s)$/.test(String(v));
    const walk = (node, path) => {
        if (!node || typeof node !== 'object')
            return;
        if (isTok(node)) {
            const p = path.join('.'), t = node.$type, v = node.$value;
            if (!t)
                out.push(`${p}: no $type (on the token or a parent group)`);
            else if (!TYPES.includes(t))
                out.push(`${p}: unknown $type "${t}"`);
            else if (t === 'duration' && !dur(v))
                out.push(`${p}: duration must be { value, unit: "ms" | "s" } (or "150ms" in the draft format)`);
            else if (t === 'cubicBezier' && !(Array.isArray(v) && v.length === 4 && v.every((n) => typeof n === 'number') && v[0] >= 0 && v[0] <= 1 && v[2] >= 0 && v[2] <= 1))
                out.push(`${p}: cubicBezier must be [x1, y1, x2, y2] with x in 0–1`);
            else if (t === 'transition' && !(v && dur(v.duration) && dur(v.delay ?? '0ms') && v.timingFunction))
                out.push(`${p}: transition needs duration, delay and timingFunction`);
            return;
        }
        for (const [k, v] of Object.entries(node))
            if (!k.startsWith('$'))
                walk(v, [...path, k]);
    };
    walk(resolved, []);
    return out;
}
/** Resolve aliases, then import (merged over `base`). Springs come from `$extensions["org.motionary"].spring`. */
function importDesignTokens(json, base = MOTION_TOKENS) {
    const r = resolveTokenAliases(json);
    const springs = {};
    const walk = (node, path) => {
        if (!node || typeof node !== 'object')
            return;
        const ext = node.$extensions?.['org.motionary'];
        if (ext?.spring)
            springs[path[path.length - 1]] = ext.spring;
        if (isTok(node))
            return;
        for (const [k, v] of Object.entries(node))
            if (!k.startsWith('$'))
                walk(v, [...path, k]);
    };
    walk(r, []);
    const t = importMotionTokens(r, base);
    for (const [k, s] of Object.entries(springs))
        t.spring[k] = { stiffness: +s.stiffness || 170, damping: +s.damping || 26, mass: +s.mass || 1 };
    return t;
}
/** Export motion tokens as a DTCG document. */
function exportDesignTokens(tokens = getMotionTokens(), o = {}) {
    const stable = (o.format || '2025.10') === '2025.10';
    const g = o.group || 'motion';
    const d = (ms) => (stable ? { value: ms, unit: 'ms' } : `${ms}ms`);
    const bez = (e) => {
        const m = /^cubic-bezier\(([^)]+)\)$/.exec(e.trim());
        if (m)
            return m[1].split(',').map(Number);
        return { linear: [0, 0, 1, 1], ease: [0.25, 0.1, 0.25, 1], 'ease-in': [0.42, 0, 1, 1], 'ease-out': [0, 0, 0.58, 1], 'ease-in-out': [0.42, 0, 0.58, 1] }[e.trim()] || null;
    };
    const doc = { $schema: 'https://www.designtokens.org/schemas/2025.10/format.json', [g]: { $description: 'Motion tokens exported by Motionary', duration: { $type: 'duration' }, easing: { $type: 'cubicBezier' } } };
    for (const [k, v] of Object.entries(tokens.duration))
        doc[g].duration[k] = { $value: d(v) };
    for (const [k, v] of Object.entries(tokens.easing)) {
        const b = bez(v);
        if (b)
            doc[g].easing[k] = { $value: b };
    }
    if (Object.keys(tokens.spring).length) {
        doc[g].spring = { $description: 'Spring parameters (not a DTCG type; carried in $extensions)' };
        for (const [k, v] of Object.entries(tokens.spring))
            doc[g].spring[k] = { $extensions: { 'org.motionary': { spring: { ...v } } } };
    }
    if (o.transitions?.length) {
        doc[g].transition = { $type: 'transition' };
        for (const [name, dur, ease] of o.transitions)
            doc[g].transition[name] = { $value: { duration: `{${g}.duration.${dur}}`, delay: d(0), timingFunction: `{${g}.easing.${ease}}` } };
    }
    return doc;
}

/**
 * motionary/components/tokens — motion design tokens (4.2).
 *
 * One source of truth for durations, easings and springs: as CSS custom
 * properties (`--usa-duration-fast`, `--usa-easing-emphasized`,
 * `--usa-spring-bouncy-stiffness`…), as W3C Design Tokens JSON, and importable
 * from Figma Tokens (Tokens Studio) or Style Dictionary exports.
 *
 * ```ts
 * import { applyMotionTokens, importMotionTokens, motionToken } from 'motionary/components/tokens';
 * applyMotionTokens(importMotionTokens(await (await fetch('/tokens.json')).json()));
 * el.animate(frames, { duration: motionToken('duration', 'slow'), easing: motionToken('easing', 'emphasized') });
 * ```
 */
/** The default motion scale (Material / Fluent-inspired). */
const MOTION_TOKENS = {
    duration: { instant: 0, fast: 150, normal: 300, slow: 600, slower: 900, slowest: 1400 },
    easing: {
        linear: 'linear',
        standard: 'cubic-bezier(0.2, 0, 0, 1)',
        emphasized: 'cubic-bezier(0.22, 1, 0.36, 1)',
        decelerate: 'cubic-bezier(0, 0, 0, 1)',
        accelerate: 'cubic-bezier(0.3, 0, 1, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
    spring: {
        gentle: { stiffness: 120, damping: 14, mass: 1 },
        snappy: { stiffness: 300, damping: 30, mass: 1 },
        bouncy: { stiffness: 260, damping: 12, mass: 1 },
        wobbly: { stiffness: 180, damping: 8, mass: 1 },
        stiff: { stiffness: 500, damping: 40, mass: 1 },
    },
};
let active = /*#__PURE__*/ clone(MOTION_TOKENS);
function clone(t) {
    return { duration: { ...t.duration }, easing: { ...t.easing }, spring: Object.fromEntries(Object.entries(t.spring).map(([k, v]) => [k, { ...v }])) };
}
/** Merge partial tokens over a base (defaults: the built-in scale). */
function mergeMotionTokens(partial, base = MOTION_TOKENS) {
    const out = clone(base);
    Object.assign(out.duration, partial.duration || {});
    Object.assign(out.easing, partial.easing || {});
    for (const [k, v] of Object.entries(partial.spring || {}))
        out.spring[k] = { ...(out.spring[k] || { stiffness: 170, damping: 26, mass: 1 }), ...v };
    return out;
}
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/[\s_.]+/g, '-').toLowerCase();
/** The custom-property map: `{ '--usa-duration-fast': '150ms', … }`. */
function motionTokensToVars(tokens = active, prefix = '--usa') {
    const vars = {};
    for (const [k, v] of Object.entries(tokens.duration))
        vars[`${prefix}-duration-${kebab(k)}`] = `${v}ms`;
    for (const [k, v] of Object.entries(tokens.easing))
        vars[`${prefix}-easing-${kebab(k)}`] = v;
    for (const [k, v] of Object.entries(tokens.spring)) {
        vars[`${prefix}-spring-${kebab(k)}-stiffness`] = String(v.stiffness);
        vars[`${prefix}-spring-${kebab(k)}-damping`] = String(v.damping);
        vars[`${prefix}-spring-${kebab(k)}-mass`] = String(v.mass);
    }
    return vars;
}
/** A stylesheet string: `:root { --usa-duration-fast: 150ms; … }`. */
function motionTokensToCss(tokens = active, selector = ':root', prefix = '--usa') {
    const body = Object.entries(motionTokensToVars(tokens, prefix)).map(([k, v]) => `  ${k}: ${v};`).join('\n');
    return `${selector} {\n${body}\n}\n`;
}
/** W3C Design Tokens (DTCG) JSON: `{ motion: { duration: { fast: { $type: 'duration', $value: '150ms' } } } }`. */
function motionTokensToJSON(tokens = active) {
    const grp = (o, f) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, f(v)]));
    return {
        motion: {
            duration: grp(tokens.duration, (v) => ({ $type: 'duration', $value: `${v}ms` })),
            easing: grp(tokens.easing, (v) => {
                const m = /^cubic-bezier\(([^)]+)\)$/.exec(v);
                return m ? { $type: 'cubicBezier', $value: m[1].split(',').map(Number) } : { $type: 'string', $value: v };
            }),
            spring: grp(tokens.spring, (v) => ({ $type: 'spring', $value: { ...v } })),
        },
    };
}
/** Parse `150ms`, `0.15s`, `150` → ms. */
function parseDuration(v) {
    if (typeof v === 'number' && isFinite(v))
        return v;
    if (typeof v === 'object' && v && 'value' in v && 'unit' in v)
        return parseDuration(`${v.value}${v.unit}`);
    const m = /^\s*(-?\d*\.?\d+)\s*(ms|s)?\s*$/.exec(String(v ?? ''));
    if (!m)
        return undefined;
    return m[2] === 's' ? Number(m[1]) * 1000 : Number(m[1]);
}
/** Parse `[x1,y1,x2,y2]`, `'cubic-bezier(…)'`, `'0.2, 0, 0, 1'` or a keyword → CSS easing. */
function parseEasing(v) {
    if (Array.isArray(v) && v.length === 4 && v.every((n) => typeof n === 'number'))
        return `cubic-bezier(${v.join(', ')})`;
    if (typeof v !== 'string' || !v.trim())
        return undefined;
    const s = v.trim();
    if (/^-?\d*\.?\d+(\s*,\s*-?\d*\.?\d+){3}$/.test(s))
        return `cubic-bezier(${s.split(/\s*,\s*/).join(', ')})`;
    return s;
}
const isLeaf = (o) => o && typeof o === 'object' && ('$value' in o || 'value' in o);
const leafValue = (o) => ('$value' in o ? o.$value : o.value);
const leafType = (o) => String(o.$type ?? o.type ?? '').toLowerCase();
/**
 * Import tokens from W3C DTCG JSON, Figma Tokens / Tokens Studio
 * (`{ value, type }`) or Style Dictionary (`{ value }`, nested) — anything
 * under a `duration` / `easing` / `spring` group (any depth, e.g.
 * `motion.duration.fast` or `global.animation.easing.out`), or typed leaves
 * (`duration`, `cubicBezier`, `transition`, `spring`). Unknown values are
 * skipped; the result is merged over the defaults.
 */
function importMotionTokens(json, base = MOTION_TOKENS) {
    const partial = { duration: {}, easing: {}, spring: {} };
    const walk = (node, path) => {
        if (!node || typeof node !== 'object')
            return;
        if (isLeaf(node)) {
            const name = path[path.length - 1];
            const type = leafType(node);
            const group = path.slice(0, -1).map((p) => p.toLowerCase());
            const val = leafValue(node);
            const inGroup = (g) => group.some((p) => g.includes(p));
            if (type === 'duration' || (!type && inGroup(['duration', 'durations'])) || (type !== 'cubicbezier' && inGroup(['duration', 'durations']))) {
                const ms = parseDuration(val);
                if (ms !== undefined)
                    partial.duration[name] = ms;
            }
            else if (type === 'cubicbezier' || type === 'easing' || inGroup(['easing', 'easings', 'ease'])) {
                const e = parseEasing(val);
                if (e)
                    partial.easing[name] = e;
            }
            else if (type === 'spring' || inGroup(['spring', 'springs'])) {
                if (val && typeof val === 'object')
                    partial.spring[name] = { stiffness: Number(val.stiffness ?? 170), damping: Number(val.damping ?? 26), mass: Number(val.mass ?? 1) };
            }
            else if (type === 'transition' && val && typeof val === 'object') {
                const ms = parseDuration(val.duration);
                if (ms !== undefined)
                    partial.duration[name] = ms;
                const e = parseEasing(val.timingFunction);
                if (e)
                    partial.easing[name] = e;
            }
            return;
        }
        for (const [k, v] of Object.entries(node))
            if (!k.startsWith('$'))
                walk(v, [...path, k]);
    };
    walk(json, []);
    return mergeMotionTokens(partial, base);
}
/** The tokens currently applied (via `applyMotionTokens`), or the defaults. */
function getMotionTokens() {
    return clone(active);
}
/**
 * Write tokens as CSS custom properties on `root` (default `<html>`) and make
 * them the active set for `motionToken()`. Returns an undo function.
 */
function applyMotionTokens(tokens = MOTION_TOKENS, root, prefix = '--usa') {
    const prev = active;
    active = mergeMotionTokens(tokens, MOTION_TOKENS);
    const el = root || (typeof document !== 'undefined' ? document.documentElement : null);
    const vars = motionTokensToVars(active, prefix);
    const old = {};
    if (el)
        for (const [k, v] of Object.entries(vars))
            ((old[k] = el.style.getPropertyValue(k)), el.style.setProperty(k, v));
    return () => {
        active = prev;
        if (el)
            for (const [k, v] of Object.entries(old))
                v ? el.style.setProperty(k, v) : el.style.removeProperty(k);
    };
}
function motionToken(group, name) {
    const g = active[group];
    return g[name] ?? MOTION_TOKENS[group][name];
}
/** `var(--usa-duration-fast, 150ms)` — a CSS reference with the current value as fallback. */
function motionVar(group, name, prop, prefix = '--usa') {
    if (group === 'spring') {
        const s = motionToken('spring', name);
        const p = prop || 'stiffness';
        return `var(${prefix}-spring-${kebab(name)}-${p}, ${s ? s[p] : ''})`;
    }
    const v = group === 'duration' ? `${motionToken('duration', name)}ms` : motionToken('easing', name);
    return `var(${prefix}-${group}-${kebab(name)}, ${v})`;
}
/** Resolve a duration that may be a token name (`'fast'`) or ms. */
function resolveDurationToken(v, fallback) {
    if (typeof v === 'number')
        return v;
    if (typeof v === 'string')
        return (active.duration[v] ?? parseDuration(v)) ?? fallback;
    return fallback;
}
/** Resolve an easing that may be a token name (`'emphasized'`) or CSS. */
function resolveEasingToken(v, fallback) {
    if (!v)
        return fallback;
    return active.easing[v] ?? v;
}

/** 4.1: whether `scrub()` can use native ScrollTimeline / ViewTimeline here. */
function supportsNativeScrub(source = 'view') {
    const g = globalThis;
    return typeof g[source === 'scroll' ? 'ScrollTimeline' : 'ViewTimeline'] === 'function' && typeof g.Element?.prototype?.animate === 'function';
}
const handle = (stop, native) => Object.assign(stop, { native });
/** Keyframe presets usable by name in `to()` and `data-tl`. */
const TIMELINE_PRESETS = {
    fade: [{ opacity: 0 }, { opacity: 1 }],
    'fade-up': [{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }],
    'fade-down': [{ opacity: 0, transform: 'translateY(-24px)' }, { opacity: 1, transform: 'none' }],
    'fade-left': [{ opacity: 0, transform: 'translateX(24px)' }, { opacity: 1, transform: 'none' }],
    'fade-right': [{ opacity: 0, transform: 'translateX(-24px)' }, { opacity: 1, transform: 'none' }],
    scale: [{ opacity: 0, transform: 'scale(0.85)' }, { opacity: 1, transform: 'none' }],
    blur: [{ opacity: 0, filter: 'blur(12px)' }, { opacity: 1, filter: 'blur(0)' }],
    rotate: [{ opacity: 0, transform: 'rotate(-12deg) scale(0.9)' }, { opacity: 1, transform: 'none' }],
    'clip-up': [{ clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0 0 0 0)' }],
    'clip-right': [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }],
};
/** Resolve a position against the previous step and labels (pure). */
function resolvePosition(pos, end, prevStart, labels = {}) {
    if (pos === undefined || pos === '' || pos === '>')
        return end;
    if (typeof pos === 'number')
        return Math.max(0, pos);
    const s = String(pos).trim();
    if (/^-?\d+(\.\d+)?$/.test(s))
        return Math.max(0, Number(s));
    const m = /^(<|>|[A-Za-z_][\w-]*)?\s*(?:([+-])=\s*(\d+(?:\.\d+)?))?$/.exec(s);
    if (!m)
        return end;
    const base = m[1] === '<' ? prevStart : m[1] === '>' || !m[1] ? end : labels[m[1]] ?? end;
    const delta = m[2] ? (m[2] === '-' ? -1 : 1) * Number(m[3]) : 0;
    return Math.max(0, base + delta);
}
const toEls = (t) => typeof t === 'string' ? (typeof document === 'undefined' ? [] : Array.from(document.querySelectorAll(t))) : t instanceof Element ? [t] : Array.from(t);
/**
 * Choreograph animations on one clock: chain, overlap, label, seek, reverse and
 * scrub them with scroll. Built on WAAPI (paused animations driven by one
 * playhead); without WAAPI or under reduced motion it jumps to the end state.
 *
 * @example
 * const tl = timeline({ defaults: { duration: 500 } })
 *   .to('.title', 'fade-up')
 *   .label('cards')
 *   .to('.card', 'scale', { stagger: 80, at: '-=200' })
 *   .to('.cta', [{ opacity: 0 }, { opacity: 1 }], { at: 'cards+=400' });
 * tl.play();             // or tl.scrub(document.querySelector('.hero'))
 */
function timeline(options = {}) {
    const d = { duration: 600, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', stagger: 0, ...options.defaults };
    const steps = [];
    const cues = [];
    const labels = {};
    let end = 0;
    let prevStart = 0;
    let t = 0;
    let frame = 0;
    let dir = 1;
    let settle;
    let built = false;
    const total = () => Math.max(end, ...cues.map((c) => c.at), 0);
    const build = () => {
        if (built)
            return;
        built = true;
        for (const s of steps) {
            if (typeof s.el.animate !== 'function') {
                s.anim = null;
                continue;
            }
            s.anim = s.el.animate(s.frames, { duration: s.duration, delay: s.start, easing: s.easing, fill: 'both' });
            s.anim.pause?.();
        }
    };
    const render = (to, from) => {
        build();
        t = clamp(to, 0, total());
        for (const s of steps) {
            if (s.anim)
                s.anim.currentTime = t;
            else
                applyFrame(s.el, s.frames[t >= s.start ? s.frames.length - 1 : 0]);
        }
        for (const c of cues)
            if ((from < c.at && t >= c.at) || (from > c.at && t <= c.at))
                c.fn();
        options.onUpdate?.(total() ? t / total() : 1);
    };
    const stop = () => {
        if (frame)
            caf(frame);
        frame = 0;
    };
    const run = (direction) => {
        stop();
        settle?.();
        dir = direction;
        const target = dir > 0 ? total() : 0;
        const k = motionScale();
        if (prefersReducedMotion() || k === 0 || !total()) {
            render(target, t);
            options.onComplete?.();
            return Promise.resolve();
        }
        const rate = (options.speed ?? 1) / k;
        return new Promise((resolve) => {
            settle = () => { settle = undefined; resolve(); };
            let last = now();
            const loop = () => {
                const n = now();
                const next = t + (n - last) * rate * dir;
                last = n;
                render(next, t);
                if ((dir > 0 && t >= target) || (dir < 0 && t <= 0)) {
                    frame = 0;
                    options.onComplete?.();
                    settle?.();
                    return;
                }
                frame = raf(loop);
            };
            frame = raf(loop);
        });
    };
    const api = {
        get duration() { return total(); },
        get labels() { return { ...labels }; },
        get time() { return t; },
        to(target, frames, o = {}) {
            const kf = typeof frames === 'string' ? TIMELINE_PRESETS[frames] || TIMELINE_PRESETS.fade : frames;
            const start = resolvePosition(o.at, end, prevStart, labels);
            const duration = resolveDurationToken(o.duration ?? d.duration, 600);
            const stagger = o.stagger ?? d.stagger;
            let last = start;
            toEls(target).forEach((el, i) => {
                const s = start + i * stagger;
                steps.push({ el, frames: kf, start: s, duration, easing: resolveEasingToken(o.easing ?? d.easing, 'cubic-bezier(0.22, 1, 0.36, 1)') });
                last = Math.max(last, s + duration);
            });
            prevStart = start;
            end = Math.max(end, last);
            built = false;
            steps.forEach((s) => s.anim?.cancel?.());
            return api;
        },
        label(name, at) {
            labels[name] = resolvePosition(at, end, prevStart, labels);
            return api;
        },
        call(fn, at) {
            cues.push({ fn, at: resolvePosition(at, end, prevStart, labels) });
            return api;
        },
        play(from) {
            if (from !== undefined)
                render(resolvePosition(from, 0, 0, labels), t);
            else if (t >= total())
                render(0, -1);
            return run(1);
        },
        reverse() {
            return run(-1);
        },
        pause() {
            stop();
            return api;
        },
        seek(to) {
            stop();
            render(resolvePosition(to, 0, 0, labels), t);
            return api;
        },
        progress(p) {
            if (p !== undefined)
                api.seek(clamp(p, 0, 1) * total());
            return total() ? t / total() : 0;
        },
        scrub(source, o = {}) {
            stop();
            if (prefersReducedMotion() || typeof window === 'undefined') {
                render(total(), t);
                return handle(() => { }, false);
            }
            const mode = o.source ?? 'view';
            const axis = o.axis ?? 'block';
            const needsJs = !!o.smooth || !!o.offset || cues.length > 0 || !!options.onUpdate || o.engine === 'js';
            if (!needsJs && total() > 0 && supportsNativeScrub(mode) && steps.every((st) => typeof st.el.animate === 'function')) {
                // Native: one scroll-driven animation per step, its slice of the
                // timeline mapped onto the scroll range (`cover` for a view timeline).
                const g = globalThis;
                const tl = mode === 'scroll' ? new g.ScrollTimeline({ source, axis }) : new g.ViewTimeline({ subject: source, axis });
                const T = total();
                steps.forEach((st) => st.anim?.cancel?.());
                built = false;
                const pct = (ms) => `${((ms / T) * 100).toFixed(3)}%`;
                const live = steps.map((st) => {
                    const range = mode === 'view' ? { rangeStart: `cover ${pct(st.start)}`, rangeEnd: `cover ${pct(st.start + st.duration)}` } : {};
                    const timing = { easing: st.easing, fill: 'both', timeline: tl, ...range };
                    if (mode === 'scroll')
                        Object.assign(timing, { duration: 'auto', rangeStart: pct(st.start), rangeEnd: pct(st.start + st.duration) });
                    return st.el.animate(st.frames, timing);
                });
                return handle(() => {
                    live.forEach((a) => a.cancel());
                    render(t, t);
                }, true);
            }
            let id = 0;
            let cur = t;
            const scroller = mode === 'scroll' ? source : null;
            const progressNow = () => {
                const x = axis === 'x' || axis === 'inline';
                if (scroller) {
                    const max = x ? scroller.scrollWidth - scroller.clientWidth : scroller.scrollHeight - scroller.clientHeight;
                    return clamp((x ? scroller.scrollLeft : scroller.scrollTop) / (max || 1), 0, 1);
                }
                const r = source.getBoundingClientRect();
                const vh = (x ? window.innerWidth : window.innerHeight) || 1;
                const start = x ? r.left : r.top;
                const size = x ? r.width : r.height;
                return clamp((vh + (o.offset ?? 0) - start) / (vh + size || 1), 0, 1);
            };
            const update = () => {
                id = 0;
                const goal = progressNow() * total();
                const sm = clamp(o.smooth ?? 0, 0, 0.95);
                cur = sm ? cur + (goal - cur) * (1 - sm) : goal;
                render(cur, t);
                if (sm && Math.abs(goal - cur) > 0.5)
                    id = raf(update);
            };
            const onScroll = () => { if (!id)
                id = raf(update); };
            const target = scroller || window;
            target.addEventListener('scroll', onScroll, { passive: true });
            window.addEventListener('resize', onScroll, { passive: true });
            update();
            return handle(() => {
                target.removeEventListener('scroll', onScroll);
                window.removeEventListener('resize', onScroll);
                if (id)
                    caf(id);
            }, false);
        },
        cancel() {
            stop();
            settle?.();
            steps.forEach((s) => s.anim?.cancel?.());
            built = false;
        },
    };
    return api;
}

const CJK = /[\u2E80-\u2FFF\u3000-\u303F\u3040-\u30FF\u3100-\u312F\u3130-\u318F\u31A0-\u31FF\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF\uF900-\uFAFF\uFF00-\uFFEF]/;
/** Scripts whose letters join (splitting them would break shaping). */
const JOINING_SCRIPT = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
const RTL = /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/;
const SR = 'position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;border:0';
function segmenter(locale, granularity) {
    const S = globalThis.Intl?.Segmenter;
    if (typeof S !== 'function')
        return null;
    try {
        return new S(locale || undefined, { granularity });
    }
    catch {
        return null;
    }
}
/** Grapheme clusters of `s` (emoji / combining marks stay whole). */
function graphemes(s, locale) {
    const seg = segmenter(locale, 'grapheme');
    if (seg)
        return Array.from(seg.segment(s), (x) => x.segment);
    return Array.from(s);
}
/**
 * Word-ish tokens of `s`, whitespace kept as separate tokens. CJK text is
 * segmented into words with `Intl.Segmenter`, or per character without it.
 */
function words(s, locale) {
    const seg = segmenter(locale, 'word');
    const out = [];
    if (seg) {
        for (const x of seg.segment(s)) {
            const last = out[out.length - 1];
            // glue punctuation onto the previous word so it never starts a line alone
            if (!x.isWordLike && !/^\s+$/.test(x.segment) && last && !/^\s+$/.test(last))
                out[out.length - 1] = last + x.segment;
            else
                out.push(x.segment);
        }
        return out;
    }
    for (const part of s.split(/(\s+)/)) {
        if (!part)
            continue;
        if (/^\s+$/.test(part) || !CJK.test(part))
            out.push(part);
        else {
            let buf = '';
            for (const ch of Array.from(part)) {
                if (CJK.test(ch)) {
                    if (buf)
                        out.push(buf), (buf = '');
                    out.push(ch);
                }
                else if (/[\p{P}]/u.test(ch) && out.length)
                    out[out.length - 1] += ch;
                else
                    buf += ch;
            }
            if (buf)
                out.push(buf);
        }
    }
    return out;
}
function dirOf(el, text) {
    const attr = el.closest?.('[dir]')?.getAttribute('dir');
    if (attr === 'rtl' || attr === 'ltr')
        return attr;
    try {
        const d = getComputedStyle(el).direction;
        if (d === 'rtl')
            return 'rtl';
    }
    catch {
        /* no layout */
    }
    return RTL.test(text) && !/[A-Za-z]/.test(text.replace(RTL, '')) ? 'rtl' : 'ltr';
}
function splitText(el, options = {}) {
    const by = new Set((Array.isArray(options.by) ? options.by : String(options.by ?? 'char').split(/[\s,]+/)).filter(Boolean));
    const cls = options.className || 'usa-split';
    const locale = options.locale || el.closest?.('[lang]')?.getAttribute('lang') || undefined;
    const original = Array.from(el.childNodes).map((n) => n.cloneNode(true));
    const text = el.textContent || '';
    const direction = dirOf(el, text);
    const chars = [];
    const wordEls = [];
    let lines = [];
    const doc = el.ownerDocument;
    const span = (c, t) => {
        const s = doc.createElement('span');
        s.className = c;
        if (t !== undefined)
            s.textContent = t;
        return s;
    };
    const splitNode = (node) => {
        if (node.nodeType === 3) {
            const frag = doc.createDocumentFragment();
            for (const w of words(node.nodeValue || '', locale)) {
                if (/^\s+$/.test(w)) {
                    frag.append(doc.createTextNode(w));
                    continue;
                }
                const wordEl = span(`${cls}-word`);
                wordEl.style.display = 'inline-block';
                wordEl.style.whiteSpace = 'nowrap';
                wordEl.dataset.index = String(wordEls.length);
                wordEls.push(wordEl);
                // Arabic script joins its letters: keep the word whole (shaping), even in char mode.
                if (by.has('char') && !JOINING_SCRIPT.test(w)) {
                    for (const g of graphemes(w, locale)) {
                        const c = span(`${cls}-char`, g);
                        c.style.display = 'inline-block';
                        c.dataset.index = String(chars.length);
                        chars.push(c);
                        wordEl.append(c);
                    }
                }
                else {
                    wordEl.textContent = w;
                    if (by.has('char')) {
                        wordEl.dataset.whole = '';
                        chars.push(wordEl);
                    }
                }
                frag.append(wordEl);
            }
            node.parentNode.replaceChild(frag, node);
        }
        else if (node.nodeType === 1 && !/^(BR|SCRIPT|STYLE|SVG|IMG)$/i.test(node.tagName)) {
            Array.from(node.childNodes).forEach(splitNode);
        }
    };
    const wrap = doc.createElement('span');
    wrap.setAttribute('aria-hidden', 'true');
    wrap.className = `${cls}-body`;
    original.forEach((n) => wrap.append(n.cloneNode(true)));
    Array.from(wrap.childNodes).forEach(splitNode);
    const sr = span(`${cls}-sr`, text.replace(/\s+/g, ' ').trim());
    sr.setAttribute('style', SR);
    el.replaceChildren(sr, wrap);
    el.setAttribute('data-split', [...by].join(' '));
    if (direction === 'rtl')
        el.setAttribute('data-split-dir', 'rtl');
    const relayout = () => {
        // unwrap old lines
        for (const l of lines)
            l.replaceWith(...Array.from(l.childNodes));
        lines = [];
        if (!by.has('line') || !wordEls.length)
            return lines;
        const groups = [];
        let lastTop = null;
        for (const w of wordEls) {
            const top = Math.round(w.offsetTop);
            if (lastTop === null || Math.abs(top - lastTop) > 2)
                groups.push([]);
            groups[groups.length - 1].push(w);
            lastTop = top;
        }
        groups.forEach((g, i) => {
            // only group words that share a parent (inline markup keeps its words)
            const parent = g[0].parentNode;
            const same = g.filter((w) => w.parentNode === parent);
            const line = span(`${cls}-line`);
            line.style.display = 'inline-block';
            line.dataset.index = String(i);
            parent.insertBefore(line, same[0]);
            let n = same[0];
            const end = same[same.length - 1];
            while (n) {
                const next = n.nextSibling;
                line.append(n);
                if (n === end)
                    break;
                n = next;
            }
            // keep the space between lines outside the line box
            lines.push(line);
        });
        return lines;
    };
    relayout();
    return {
        chars,
        words: wordEls,
        get lines() {
            return lines;
        },
        direction,
        relayout,
        revert() {
            el.replaceChildren(...original.map((n) => n.cloneNode(true)));
            el.removeAttribute('data-split');
            el.removeAttribute('data-split-dir');
        },
    };
}
/** Order indices `0…n-1` by choreography: from the start, end, center outwards, edges inwards, or random (seeded). */
function splitOrder(n, from = 'start', seed = 1) {
    const idx = Array.from({ length: n }, (_, i) => i);
    const mid = (n - 1) / 2;
    if (from === 'end')
        return idx.map((i) => n - 1 - i);
    if (from === 'center')
        return idx.map((i) => Math.round(Math.abs(i - mid) * 2) / 2);
    if (from === 'edges')
        return idx.map((i) => Math.round((mid - Math.abs(i - mid)) * 2) / 2);
    if (from === 'random') {
        let s = seed;
        const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
        const shuffled = idx.slice().sort(() => r() - 0.5);
        const rank = [];
        shuffled.forEach((v, i) => (rank[v] = i));
        return rank;
    }
    return idx;
}
/**
 * Split `el` and build a `timeline()` with one step per unit — play it,
 * `scrub()` it with scroll, `reverse()` or `seek()` it.
 *
 * ```ts
 * const { timeline: tl } = splitTimeline(h1, { by: 'char', preset: 'blur', from: 'center' });
 * tl.play();
 * ```
 */
function splitTimeline(el, options = {}) {
    const split = splitText(el, options);
    const by = Array.isArray(options.by) ? options.by : String(options.by ?? 'char').split(/[\s,]+/);
    const unit = options.unit || (by.includes('char') ? 'char' : by.includes('word') ? 'word' : 'line');
    const units = unit === 'char' ? split.chars : unit === 'word' ? split.words : split.lines;
    const stagger = options.stagger ?? (unit === 'char' ? 30 : unit === 'word' ? 80 : 140);
    const order = splitOrder(units.length, options.from);
    const tl = timeline({ defaults: { duration: options.duration ?? 500, easing: options.easing } });
    units.forEach((u, i) => tl.to(u, options.preset || 'fade-up', { at: order[i] * stagger }));
    tl.seek(0);
    return { split, timeline: tl };
}

function defineSplitText(tag = 'usa-split-text') {
    return defineElement(tag, (Base) => class UsaSplitText extends Base {
        constructor() {
            super(...arguments);
            this._source = null;
            this._timer = 0;
            this._steps = 0;
        }
        static get observedAttributes() {
            return ['by', 'text', 'from', 'stagger', 'duration', 'delay', 'trigger', 'repeat'];
        }
        get units() {
            return Array.from(this.querySelectorAll('.usa-split-unit'));
        }
        mount() {
            if (this._source === null)
                this._source = this.getAttribute('text') ?? (this.textContent || '').replace(/\s+/g, ' ').trim();
            const text = this.getAttribute('text') ?? this._source;
            const mode = this.str('by', 'chars');
            const byWords = mode !== 'chars';
            const lang = this.closest('[lang]')?.getAttribute('lang') || undefined;
            const frag = document.createDocumentFragment();
            frag.append(srText(text));
            const units = [];
            for (const word of words(text, lang)) {
                if (/^\s+$/.test(word)) {
                    frag.append(' ');
                    continue;
                }
                const wordEl = document.createElement('span');
                wordEl.className = 'usa-split-word';
                wordEl.setAttribute('aria-hidden', 'true');
                const parts = byWords || JOINING_SCRIPT.test(word) ? [word] : graphemes(word, lang);
                for (const part of parts) {
                    const u = document.createElement('span');
                    u.className = 'usa-split-unit';
                    u.textContent = part;
                    units.push(u);
                    wordEl.append(u);
                }
                frag.append(wordEl);
            }
            this.replaceChildren(frag);
            // cascade order: per unit, or per line for by="lines"
            let rank = units.map((_, k) => k);
            if (mode === 'lines') {
                let line = -1;
                let top = null;
                rank = units.map((u) => {
                    const t = Math.round(u.parentElement.offsetTop);
                    if (top === null || Math.abs(t - top) > 2)
                        line++;
                    top = t;
                    return line;
                });
            }
            const groups = Math.max(0, ...rank) + 1;
            const order = splitOrder(groups, this.str('from', 'start'));
            units.forEach((u, k) => u.style.setProperty('--i', String(order[rank[k]] ?? 0)));
            const i = Math.max(0, ...units.map((_, k) => order[rank[k]] ?? 0)) + 1;
            this._steps = i;
            this.style.setProperty('--usa-split-stagger', `${this.num('stagger', mode === 'lines' ? 140 : byWords ? 70 : 28)}ms`);
            this.style.setProperty('--usa-split-duration', `${this.num('duration', 620)}ms`);
            this.style.setProperty('--usa-split-delay', `${this.num('delay', 0)}ms`);
            this.style.setProperty('--usa-split-count', String(i));
            if (this.reduced) {
                this.setAttribute('data-state', 'shown');
                return;
            }
            this.setAttribute('data-state', 'hidden');
            const trigger = this.str('trigger', 'view');
            if (trigger === 'load')
                this.play();
            else if (trigger === 'view') {
                this.inView((visible) => {
                    if (visible && this.getAttribute('data-state') === 'hidden')
                        this.play();
                    else if (!visible && this.flag('repeat'))
                        this.reset();
                }, { threshold: 0.2 });
            }
        }
        unmount() {
            clearTimeout(this._timer);
        }
        play() {
            clearTimeout(this._timer);
            if (this.reduced) {
                this.setAttribute('data-state', 'shown');
                return;
            }
            // Restart the CSS animations
            this.setAttribute('data-state', 'hidden');
            void this.offsetWidth;
            this.setAttribute('data-state', 'play');
            const by = this.str('by', 'chars');
            const total = this.num('delay', 0) + this.num('duration', 620) + Math.max(0, this._steps - 1) * this.num('stagger', by === 'lines' ? 140 : by === 'words' ? 70 : 28);
            this._timer = setTimeout(() => {
                this.setAttribute('data-state', 'shown');
                this.emit('complete');
            }, total);
        }
        reset() {
            clearTimeout(this._timer);
            this.setAttribute('data-state', this.reduced ? 'shown' : 'hidden');
        }
    }, { id: 'split-text', text: css$$ });
}

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=<>/\\?!';
/** One frame of the scramble: the first `progress` share is resolved. */
function scrambleFrame(text, progress, glyphs = GLYPHS, rnd = Math.random) {
    const done = Math.floor(text.length * progress);
    let out = '';
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        out += i < done || /\s|[.,:;!?'"()\-–—]/.test(ch) ? ch : glyphs[Math.floor(rnd() * glyphs.length)];
    }
    return out;
}
function defineScramble(tag = 'usa-scramble') {
    return defineElement(tag, (Base) => class UsaScramble extends Base {
        constructor() {
            super(...arguments);
            this._source = null;
            this._out = null;
            this._frame = 0;
        }
        static get observedAttributes() {
            return ['text', 'trigger', 'duration', 'chars'];
        }
        get text() {
            return this.getAttribute('text') ?? this._source ?? '';
        }
        mount() {
            if (this._source === null)
                this._source = (this.textContent || '').trim();
            this._out = document.createElement('span');
            this._out.setAttribute('aria-hidden', 'true');
            this._out.textContent = this.text;
            this.replaceChildren(srText(this.text), this._out);
            if (this.reduced)
                return;
            const trigger = this.str('trigger', 'view');
            if (trigger === 'load')
                this.play();
            else if (trigger === 'hover') {
                this.listen(this, 'pointerenter', () => this.play());
                this.listen(this, 'focusin', () => this.play());
            }
            else if (trigger === 'view') {
                let played = false;
                this.inView((v) => {
                    if (v && !played) {
                        played = true;
                        this.play();
                    }
                });
            }
        }
        unmount() {
            caf(this._frame);
            this._frame = 0;
        }
        play() {
            caf(this._frame);
            const out = this._out;
            const text = this.text;
            if (!out || this.reduced) {
                if (out)
                    out.textContent = text;
                return Promise.resolve();
            }
            const duration = this.num('duration', 900);
            const glyphs = this.str('chars', GLYPHS) || GLYPHS;
            const t0 = now();
            let last = -1;
            return new Promise((resolve) => {
                const step = () => {
                    const p = Math.min(1, Math.max(0, now() - t0) / duration);
                    // ~30 fps glyph churn is plenty and halves DOM writes
                    const bucket = Math.floor(p * duration / 33);
                    if (bucket !== last || p === 1) {
                        last = bucket;
                        out.textContent = p === 1 ? text : scrambleFrame(text, p, glyphs);
                    }
                    if (p < 1)
                        this._frame = raf(step);
                    else {
                        this._frame = 0;
                        this.emit('complete');
                        resolve();
                    }
                };
                this._frame = raf(step);
            });
        }
    }, undefined);
}

var css$_ = "";

/** easeOutExpo */
const easeOutExpo = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
function defineCounter(tag = 'usa-counter') {
    return defineElement(tag, (Base) => class UsaCounter extends Base {
        constructor() {
            super(...arguments);
            this._current = NaN;
            this._target = NaN;
            this._frame = 0;
            this._fmt = null;
        }
        static get observedAttributes() {
            return ['to', 'decimals', 'locale', 'prefix', 'suffix', 'grouping', 'from', 'start', 'duration'];
        }
        get value() {
            return Number.isNaN(this._target) ? this.num('to', 0) : this._target;
        }
        set value(v) {
            this.play(Number(v));
        }
        format(n) {
            if (!this._fmt) {
                const d = Math.max(0, Math.min(20, this.num('decimals', 0)));
                const locale = this.getAttribute('locale') || (typeof document !== 'undefined' && document.documentElement.lang) || undefined;
                try {
                    this._fmt = new Intl.NumberFormat(locale, { minimumFractionDigits: d, maximumFractionDigits: d, useGrouping: this.getAttribute('grouping') !== 'false' });
                }
                catch {
                    this._fmt = new Intl.NumberFormat(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
                }
            }
            return `${this.str('prefix')}${this._fmt.format(n)}${this.str('suffix')}`;
        }
        render(n) {
            this._current = n;
            this.textContent = this.format(n);
        }
        changed(name) {
            this._fmt = null;
            if (name === 'to')
                this.play();
            else
                this.render(Number.isNaN(this._current) ? this.num('from', 0) : this._current);
        }
        mount() {
            this._fmt = null;
            const to = this.num('to', 0);
            if (this.reduced) {
                this._target = to;
                this.render(to);
                return;
            }
            if (Number.isNaN(this._current))
                this.render(this.num('from', 0));
            const start = this.str('start', 'view');
            if (start === 'load')
                this.play();
            else if (start === 'view') {
                let done = false;
                this.inView((v) => {
                    if (v && !done) {
                        done = true;
                        this.play();
                    }
                }, { threshold: 0.4 });
            }
        }
        unmount() {
            caf(this._frame);
            this._frame = 0;
        }
        play(to = this.num('to', 0)) {
            caf(this._frame);
            this._target = to;
            const from = Number.isNaN(this._current) ? this.num('from', 0) : this._current;
            if (this.reduced || from === to || !this.isConnected) {
                this.render(to);
                this.emit('complete', { value: to });
                return Promise.resolve();
            }
            const duration = this.num('duration', 1600);
            const t0 = now();
            return new Promise((resolve) => {
                const step = () => {
                    const t = Math.min(1, Math.max(0, now() - t0) / duration);
                    this.render(from + (to - from) * easeOutExpo(t));
                    if (t < 1)
                        this._frame = raf(step);
                    else {
                        this._frame = 0;
                        this.render(to);
                        this.emit('complete', { value: to });
                        resolve();
                    }
                };
                this._frame = raf(step);
            });
        }
    }, { id: 'counter', text: css$_ });
}

var css$Z = "";

function defineShimmerText(tag = 'usa-shimmer-text') {
    return defineElement(tag, (Base) => class UsaShimmerText extends Base {
        static get observedAttributes() {
            return ['duration', 'color', 'shine', 'angle'];
        }
        mount() {
            const set = (attr, prop, unit = '') => {
                const v = this.getAttribute(attr);
                if (v !== null)
                    this.style.setProperty(prop, v + unit);
                else
                    this.style.removeProperty(prop);
            };
            set('duration', '--usa-shimmer-duration', 'ms');
            set('color', '--usa-shimmer-color');
            set('shine', '--usa-shimmer-shine');
            set('angle', '--usa-shimmer-angle', 'deg');
        }
    }, { id: 'shimmer-text', text: css$Z });
}

var css$Y = "";

function defineTextRotate(tag = 'usa-text-rotate') {
    return defineElement(tag, (Base) => class UsaTextRotate extends Base {
        constructor() {
            super(...arguments);
            this._source = null;
            this._index = 0;
            this._timer = 0;
            this._visible = true;
        }
        static get observedAttributes() {
            return ['words', 'interval', 'paused', 'effect'];
        }
        get index() {
            return this._index;
        }
        get words() {
            return (this.getAttribute('words') ?? this._source ?? '').split('|').map((w) => w.trim()).filter(Boolean);
        }
        mount() {
            if (this._source === null)
                this._source = (this.textContent || '').trim();
            const words = this.words;
            this.replaceChildren(srText(words.join(', ')), ...words.map((w, i) => {
                const s = document.createElement('span');
                s.className = 'usa-rotate-word';
                s.textContent = w;
                s.setAttribute('aria-hidden', 'true');
                if (i !== this._index)
                    s.setAttribute('data-hidden', '');
                return s;
            }));
            if (this._index >= words.length)
                this._index = 0;
            if (words.length < 2)
                return;
            this.inView((v) => (this._visible = v));
            if (!this.flag('paused')) {
                this._timer = setInterval(() => {
                    if (this._visible && !(typeof document !== 'undefined' && document.hidden))
                        this.next();
                }, Math.max(400, this.num('interval', 2200)));
            }
        }
        unmount() {
            clearInterval(this._timer);
            this._timer = 0;
        }
        next() {
            const els = Array.from(this.querySelectorAll('.usa-rotate-word'));
            if (els.length < 2)
                return;
            const prev = els[this._index];
            this._index = (this._index + 1) % els.length;
            const cur = els[this._index];
            prev.setAttribute('data-hidden', '');
            cur.removeAttribute('data-hidden');
            const effect = this.reduced ? 'fade' : this.str('effect', 'slide');
            const [inFrom, outTo] = effect === 'fade'
                ? [{ opacity: 0 }, { opacity: 0 }]
                : effect === 'flip'
                    ? [{ opacity: 0, transform: 'perspective(400px) rotateX(-90deg)' }, { opacity: 0, transform: 'perspective(400px) rotateX(90deg)' }]
                    : effect === 'blur'
                        ? [{ opacity: 0, filter: 'blur(8px)' }, { opacity: 0, filter: 'blur(8px)' }]
                        : [{ opacity: 0, transform: 'translateY(0.8em)' }, { opacity: 0, transform: 'translateY(-0.8em)' }];
            const neutral = { opacity: 1, transform: 'none', filter: 'none' };
            const pick = (f) => Object.fromEntries(Object.keys(f).map((k) => [k, neutral[k]]));
            this.motion(prev, [{ ...pick(outTo) }, outTo], { duration: 380, easing: EASE_OUT });
            this.motion(cur, [inFrom, pick(inFrom)], { duration: 520, easing: effect === 'slide' ? EASE_SPRING : EASE_OUT });
            this.emit('change', { index: this._index, word: cur.textContent });
        }
    }, { id: 'text-rotate', text: css$Y });
}

var css$X = "";

/** Split `text` into per-character spans (words never break). The animated copy is aria-hidden. */
function splitChars(host, text) {
    const vis = document.createElement('span');
    vis.setAttribute('aria-hidden', 'true');
    const chars = [];
    text.split(/(\s+)/).forEach((w) => {
        if (/^\s+$/.test(w)) {
            vis.append(document.createTextNode(w));
            return;
        }
        const word = document.createElement('span');
        word.className = 'usa-word';
        for (const c of Array.from(w)) {
            const s = document.createElement('span');
            s.className = 'usa-char';
            s.textContent = c;
            s.style.setProperty('--i', String(chars.length));
            word.append(s);
            chars.push(s);
        }
        vis.append(word);
    });
    host.replaceChildren(srText(text), vis);
    return chars;
}
const textOf = (el) => (el.getAttribute('text') ?? el.dataset.usaText ?? (el.dataset.usaText = (el.textContent || '').trim()));
function defineWaveText(tag = 'usa-wave-text') {
    return defineElement(tag, (Base) => class extends Base {
        static get observedAttributes() { return ['text', 'amplitude', 'speed', 'stagger']; }
        mount() {
            splitChars(this, textOf(this));
            this.style.setProperty('--usa-wave-a', `${this.num('amplitude', 0.25)}em`);
            this.style.setProperty('--usa-wave-s', `${this.num('speed', 1.6)}s`);
            this.style.setProperty('--usa-wave-d', `${this.num('stagger', 0.06)}s`);
        }
    }, { id: 'text-fx', text: css$X });
}
function defineGlitch(tag = 'usa-glitch') {
    return defineElement(tag, (Base) => class extends Base {
        static get observedAttributes() { return ['text', 'intensity']; }
        mount() {
            const t = textOf(this);
            this.setAttribute('data-text', t);
            this.style.setProperty('--usa-glitch-i', `${this.num('intensity', 3)}px`);
            if (!this.firstChild)
                this.textContent = t;
        }
    }, { id: 'text-fx', text: css$X });
}
function defineGradientText(tag = 'usa-gradient-text') {
    return defineElement(tag, (Base) => class extends Base {
        static get observedAttributes() { return ['colors', 'speed', 'angle']; }
        mount() {
            const c = this.str('colors', '#7c5cff,#22d3ee,#f472b6,#facc15').split(',').map((s) => s.trim());
            this.style.setProperty('--usa-grad', `linear-gradient(${this.num('angle', 90)}deg, ${[...c, c[0]].join(', ')})`);
            this.style.setProperty('--usa-grad-s', `${this.num('speed', 6)}s`);
        }
    }, { id: 'text-fx', text: css$X });
}
function defineHandwriting(tag = 'usa-handwriting') {
    return defineElement(tag, (Base) => class extends Base {
        static get observedAttributes() { return ['text', 'size', 'font', 'stroke', 'duration']; }
        mount() {
            const t = textOf(this);
            const size = this.num('size', 64);
            const w = Math.ceil(t.length * size * 0.62) + 8;
            this.replaceChildren(srText(t));
            this.insertAdjacentHTML('beforeend', `<svg aria-hidden="true" viewBox="0 0 ${w} ${Math.ceil(size * 1.3)}" width="${w}" height="${Math.ceil(size * 1.3)}"><text x="4" y="${Math.round(size)}" font-size="${size}"></text></svg>`);
            const text = this.querySelector('text');
            text.textContent = t;
            if (this.str('font'))
                text.setAttribute('font-family', this.str('font'));
            if (this.str('stroke'))
                this.style.setProperty('--usa-hw-stroke', this.str('stroke'));
            this.style.setProperty('--usa-hw-d', `${this.num('duration', 2400)}ms`);
            if (this.reduced) {
                this.setAttribute('data-state', 'done');
                return;
            }
            this.inView((v) => v && this.play(), { threshold: 0.3 });
        }
        play() {
            this.removeAttribute('data-state');
            void this.offsetWidth;
            this.setAttribute('data-state', 'drawing');
            setTimeout(() => {
                this.setAttribute('data-state', 'done');
                this.emit('complete');
            }, this.reduced ? 0 : this.num('duration', 2400));
        }
    }, { id: 'text-fx', text: css$X });
}
function defineScrollHighlight(tag = 'usa-scroll-highlight') {
    return defineElement(tag, (Base) => class extends Base {
        constructor() {
            super(...arguments);
            this._f = 0;
            this._p = 0;
        }
        static get observedAttributes() { return ['mode', 'text', 'color', 'dim']; }
        get progress() { return this._p; }
        mount() {
            const mode = this.str('mode', 'words');
            if (this.str('color'))
                this.style.setProperty('--usa-hl-color', this.str('color'));
            this.style.setProperty('--usa-hl-dim', String(this.num('dim', 0.2)));
            if (mode === 'marker') {
                if (this.reduced)
                    this.setAttribute('data-lit', '');
                else
                    this.inView((v) => v && this.setAttribute('data-lit', ''), { threshold: 0.6 });
                return;
            }
            const t = textOf(this);
            const vis = document.createElement('span');
            vis.setAttribute('aria-hidden', 'true');
            const words = t.split(/\s+/).filter(Boolean).map((w) => {
                const s = document.createElement('span');
                s.className = 'usa-hl-word';
                s.textContent = w;
                vis.append(s, ' ');
                return s;
            });
            this.replaceChildren(srText(t), vis);
            if (this.reduced) {
                words.forEach((w) => w.setAttribute('data-on', ''));
                return;
            }
            const update = () => {
                this._f = 0;
                const r = this.getBoundingClientRect();
                const H = window.innerHeight || 800;
                this._p = clamp((H * 0.85 - r.top) / (r.height + H * 0.35), 0, 1);
                const lit = Math.round(this._p * words.length);
                words.forEach((w, i) => w.toggleAttribute('data-on', i < lit));
            };
            const on = () => !this._f && (this._f = raf(update));
            let active = false;
            this.inView((v) => {
                if (v === active)
                    return;
                active = v;
                if (v)
                    window.addEventListener('scroll', on, { passive: true });
                else
                    window.removeEventListener('scroll', on);
                on();
            });
            this.onCleanup(() => window.removeEventListener('scroll', on));
        }
        unmount() {
            caf(this._f);
            this._f = 0;
        }
    }, { id: 'text-fx', text: css$X });
}

/**
 * motionary/components/text — text effects.
 * `<usa-typewriter>`, `<usa-split-text>`, `<usa-scramble>`, `<usa-counter>`,
 * `<usa-shimmer-text>`, `<usa-text-rotate>`.
 */
/** Register every component of this category under its default tag. */
function defineTextComponents() {
    defineTypewriter();
    defineSplitText();
    defineScramble();
    defineCounter();
    defineShimmerText();
    defineTextRotate();
    defineWaveText();
    defineGlitch();
    defineGradientText();
    defineHandwriting();
    defineScrollHighlight();
}

var css$W = "";

function defineRipple(tag = 'usa-ripple') {
    return defineElement(tag, (Base) => class UsaRipple extends Base {
        static get observedAttributes() {
            return ['disabled', 'centered', 'color', 'opacity', 'duration'];
        }
        mount() {
            this.listen(this, 'pointerdown', (e) => {
                if (e.button !== 0 && e.pointerType === 'mouse')
                    return;
                this.ripple(e.clientX, e.clientY);
            });
            this.listen(this, 'keydown', (e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !e.repeat)
                    this.ripple();
            });
        }
        ripple(x, y) {
            if (this.flag('disabled'))
                return;
            const r = this.getBoundingClientRect();
            const centered = this.flag('centered') || x === undefined || y === undefined;
            const cx = centered ? r.width / 2 : x - r.left;
            const cy = centered ? r.height / 2 : y - r.top;
            const radius = Math.hypot(Math.max(cx, r.width - cx), Math.max(cy, r.height - cy));
            const wave = document.createElement('span');
            wave.className = 'usa-ripple-wave';
            wave.setAttribute('aria-hidden', 'true');
            const size = radius * 2;
            wave.style.cssText = `width:${size}px;height:${size}px;left:${cx - radius}px;top:${cy - radius}px;background:${this.str('color', 'currentColor')}`;
            this.append(wave);
            const opacity = this.num('opacity', 0.22);
            const duration = this.num('duration', 550);
            const frames = this.reduced
                ? [{ opacity }, { opacity: 0 }]
                : [
                    { transform: 'scale(0)', opacity },
                    { transform: 'scale(1)', opacity, offset: 0.7 },
                    { transform: 'scale(1)', opacity: 0 },
                ];
            const a = this.motion(wave, frames, { duration: this.reduced ? 300 : duration, easing: EASE_OUT, fill: 'forwards' });
            if (a)
                a.onfinish = () => wave.remove();
            else
                setTimeout(() => wave.remove(), 0);
        }
    }, { id: 'ripple', text: css$W });
}

var css$V = "";

function defineMagnetic(tag = 'usa-magnetic') {
    return defineElement(tag, (Base) => class UsaMagnetic extends Base {
        constructor() {
            super(...arguments);
            this._frame = 0;
        }
        static get observedAttributes() {
            return ['strength', 'radius', 'disabled'];
        }
        mount() {
            if (this.reduced || this.flag('disabled'))
                return;
            if (typeof matchMedia === 'function' && !matchMedia('(hover: hover) and (pointer: fine)').matches)
                return;
            const strength = this.num('strength', 0.35);
            const radius = this.num('radius', 60);
            let x = 0;
            let y = 0;
            let active = false;
            const apply = () => {
                this._frame = 0;
                const r = this.getBoundingClientRect();
                const dx = x - (r.left + r.width / 2);
                const dy = y - (r.top + r.height / 2);
                const near = Math.abs(dx) < r.width / 2 + radius && Math.abs(dy) < r.height / 2 + radius;
                if (near) {
                    active = true;
                    this.setAttribute('data-active', '');
                    this.style.setProperty('--usa-mx', `${(dx * strength).toFixed(2)}px`);
                    this.style.setProperty('--usa-my', `${(dy * strength).toFixed(2)}px`);
                }
                else if (active)
                    this.release();
            };
            this.listen(document, 'pointermove', (e) => {
                if (e.pointerType !== 'mouse' && e.pointerType !== 'pen')
                    return;
                x = e.clientX;
                y = e.clientY;
                if (!this._frame)
                    this._frame = raf(apply);
            }, { passive: true });
            this.listen(document, 'pointerleave', () => this.release());
            this.listen(window, 'blur', () => this.release());
        }
        release() {
            this.removeAttribute('data-active');
            this.style.removeProperty('--usa-mx');
            this.style.removeProperty('--usa-my');
        }
        unmount() {
            caf(this._frame);
            this._frame = 0;
            this.release();
        }
    }, { id: 'magnetic', text: css$V });
}

var css$U = "";

function defineTilt(tag = 'usa-tilt') {
    return defineElement(tag, (Base) => class UsaTilt extends Base {
        constructor() {
            super(...arguments);
            this._frame = 0;
            this._glare = null;
        }
        static get observedAttributes() {
            return ['max', 'scale', 'perspective', 'glare', 'reverse', 'disabled'];
        }
        mount() {
            if (this.flag('glare') && !this._glare) {
                this._glare = document.createElement('span');
                this._glare.className = 'usa-tilt-glare';
                this._glare.setAttribute('aria-hidden', 'true');
                this.append(this._glare);
            }
            else if (!this.flag('glare') && this._glare) {
                this._glare.remove();
                this._glare = null;
            }
            if (this.reduced || this.flag('disabled'))
                return;
            const max = this.num('max', 10) * (this.flag('reverse') ? -1 : 1);
            const scale = this.num('scale', 1.03);
            const persp = this.num('perspective', 900);
            let px = 0.5;
            let py = 0.5;
            let rect = null;
            const apply = () => {
                this._frame = 0;
                const nx = clamp(px * 2 - 1, -1, 1);
                const ny = clamp(py * 2 - 1, -1, 1);
                this.style.transform = `perspective(${persp}px) rotateX(${(-ny * max).toFixed(2)}deg) rotateY(${(nx * max).toFixed(2)}deg) scale(${scale})`;
                this.style.setProperty('--usa-tilt-x', nx.toFixed(3));
                this.style.setProperty('--usa-tilt-y', ny.toFixed(3));
                this.style.setProperty('--usa-glare-x', `${(px * 100).toFixed(1)}%`);
                this.style.setProperty('--usa-glare-y', `${(py * 100).toFixed(1)}%`);
            };
            this.listen(this, 'pointerenter', (e) => {
                if (e.pointerType === 'touch')
                    return;
                rect = this.getBoundingClientRect();
                this.setAttribute('data-active', '');
            });
            this.listen(this, 'pointermove', (e) => {
                if (e.pointerType === 'touch')
                    return;
                rect = rect || this.getBoundingClientRect();
                px = (e.clientX - rect.left) / (rect.width || 1);
                py = (e.clientY - rect.top) / (rect.height || 1);
                if (!this._frame)
                    this._frame = raf(apply);
            });
            this.listen(this, 'pointerleave', () => this.reset());
        }
        reset() {
            caf(this._frame);
            this._frame = 0;
            this.removeAttribute('data-active');
            this.style.transform = '';
            this.style.setProperty('--usa-tilt-x', '0');
            this.style.setProperty('--usa-tilt-y', '0');
        }
        unmount() {
            this.reset();
        }
    }, { id: 'tilt', text: css$U });
}

var css$T = "";

function defineSpotlight(tag = 'usa-spotlight') {
    return defineElement(tag, (Base) => class UsaSpotlight extends Base {
        constructor() {
            super(...arguments);
            this._frame = 0;
        }
        static get observedAttributes() {
            return ['size', 'color', 'border'];
        }
        items() {
            const marked = Array.from(this.querySelectorAll('[data-spotlight]'));
            const items = marked.length ? marked : Array.from(this.children);
            items.forEach((el) => el.classList.add('usa-spotlight-item'));
            return items;
        }
        mount() {
            const size = this.getAttribute('size');
            if (size)
                this.style.setProperty('--usa-spot-size', `${Number(size)}px`);
            const color = this.getAttribute('color');
            if (color)
                this.style.setProperty('--usa-spot-color', color);
            const border = this.getAttribute('border');
            if (border)
                this.style.setProperty('--usa-spot-border', `${Number(border)}px`);
            let items = this.items();
            let x = 0;
            let y = 0;
            const apply = () => {
                this._frame = 0;
                // All reads, then all writes
                const rects = items.map((el) => el.getBoundingClientRect());
                rects.forEach((r, i) => {
                    items[i].style.setProperty('--usa-spot-x', `${(x - r.left).toFixed(1)}px`);
                    items[i].style.setProperty('--usa-spot-y', `${(y - r.top).toFixed(1)}px`);
                });
            };
            this.listen(this, 'pointerenter', (e) => {
                if (e.pointerType === 'touch')
                    return;
                items = this.items();
                this.setAttribute('data-lit', '');
            });
            this.listen(this, 'pointermove', (e) => {
                if (e.pointerType === 'touch')
                    return;
                x = e.clientX;
                y = e.clientY;
                if (!this.hasAttribute('data-lit'))
                    this.setAttribute('data-lit', '');
                // contract-exempt: reduced-motion — pointer-follow light, not a motion effect (documented to stay on under reduced motion)
                if (!this._frame)
                    this._frame = raf(apply);
            });
            this.listen(this, 'pointerleave', () => this.removeAttribute('data-lit'));
        }
        unmount() {
            caf(this._frame);
            this._frame = 0;
            this.removeAttribute('data-lit');
        }
    }, { id: 'spotlight', text: css$T });
}

var css$S = "";

function definePress(tag = 'usa-press') {
    return defineElement(tag, (Base) => class UsaPress extends Base {
        constructor() {
            super(...arguments);
            this._anim = null;
            this._down = false;
        }
        static get observedAttributes() {
            return ['disabled', 'scale', 'bounce'];
        }
        get pressed() {
            return this._down;
        }
        frame(down) {
            if (this.reduced)
                return { opacity: down ? 0.7 : 1 };
            return { transform: down ? `scale(${this.num('scale', 0.95)})` : 'scale(1)' };
        }
        down() {
            if (this._down || this.flag('disabled'))
                return;
            this._down = true;
            this.setAttribute('data-pressed', '');
            const from = this.currentFrame();
            this._anim?.cancel();
            this._anim = this.motion(this, [from, this.frame(true)], { duration: 120, easing: 'cubic-bezier(0.3, 0, 0.7, 1)', fill: 'forwards' });
        }
        up() {
            if (!this._down)
                return;
            this._down = false;
            this.removeAttribute('data-pressed');
            const from = this.currentFrame();
            this._anim?.cancel();
            const frames = this.flag('bounce') && !this.reduced
                ? [from, { transform: 'scale(1.06)', offset: 0.45 }, { transform: 'scale(0.99)', offset: 0.75 }, this.frame(false)]
                : [from, this.frame(false)];
            const a = this.motion(this, frames, { duration: this.flag('bounce') ? 480 : 320, easing: EASE_SPRING });
            this._anim = a;
            if (a)
                a.onfinish = () => this._anim === a && (this._anim = null);
        }
        currentFrame() {
            if (typeof getComputedStyle !== 'function')
                return this.frame(false);
            const cs = getComputedStyle(this);
            return this.reduced ? { opacity: cs.opacity || '1' } : { transform: cs.transform && cs.transform !== 'none' ? cs.transform : 'scale(1)' };
        }
        mount() {
            this.listen(this, 'pointerdown', (e) => {
                if (e.pointerType === 'mouse' && e.button !== 0)
                    return;
                this.down();
            });
            for (const t of ['pointerup', 'pointerleave', 'pointercancel', 'blur'])
                this.listen(this, t, () => this.up());
            this.listen(this, 'keydown', (e) => (e.key === ' ' || e.key === 'Enter') && !e.repeat && this.down());
            this.listen(this, 'keyup', (e) => (e.key === ' ' || e.key === 'Enter') && this.up());
        }
        unmount() {
            this._anim?.cancel();
            this._anim = null;
            this._down = false;
        }
    }, { id: 'press', text: css$S });
}

/**
 * motionary/components/interaction — micro-interactions.
 * `<usa-ripple>`, `<usa-magnetic>`, `<usa-tilt>`, `<usa-spotlight>`,
 * `<usa-press>`.
 */
/** Register every component of this category under its default tag. */
function defineInteractionComponents() {
    defineRipple();
    defineMagnetic();
    defineTilt();
    defineSpotlight();
    definePress();
}

var css$R = "";

const SPINNER_VARIANTS = ['fluent', 'windows', 'ring', 'dots', 'pulse', 'bars'];
function markup(variant) {
    switch (variant) {
        case 'windows':
            return '<i></i><i></i><i></i><i></i><i></i>';
        case 'dots':
            return '<i></i><i></i><i></i>';
        case 'bars':
            return '<i></i><i></i><i></i><i></i>';
        case 'pulse':
            return '<i></i><i></i>';
        case 'ring':
            return '<i></i>';
        default:
            return '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7" pathLength="100"/></svg>';
    }
}
function defineSpinner(tag = 'usa-spinner') {
    return defineElement(tag, (Base) => class UsaSpinner extends Base {
        static get observedAttributes() {
            return ['kind', 'size', 'label'];
        }
        /** The spinner kind (`kind` attribute). */
        get kind() {
            return kindOf(this, SPINNER_VARIANTS, 'fluent');
        }
        set kind(v) {
            this.setAttribute('kind', v);
        }
        mount() {
            const variant = this.kind;
            if (this.getAttribute('data-kind') !== variant) {
                this.innerHTML = markup(variant);
                this.setAttribute('data-kind', variant);
            }
            const size = this.getAttribute('size');
            if (size)
                this.style.setProperty('--usa-spinner-size', `${Number(size)}px`);
            else
                this.style.removeProperty('--usa-spinner-size');
            this.setAttribute('role', 'progressbar');
            if (!this.hasAttribute('aria-label') || this.hasAttribute('label'))
                this.setAttribute('aria-label', this.str('label', 'Loading'));
        }
    }, { id: 'spinner', text: css$R });
}

var css$Q = "";

function defineSkeleton(tag = 'usa-skeleton') {
    return defineElement(tag, (Base) => class UsaSkeleton extends Base {
        constructor() {
            super(...arguments);
            this._ph = null;
        }
        static get observedAttributes() {
            return ['loading', 'lines', 'width', 'height', 'circle', 'avatar', 'radius'];
        }
        get loading() {
            return this.hasAttribute('loading');
        }
        set loading(v) {
            this.toggleAttribute('loading', !!v);
        }
        changed(name) {
            if (name === 'loading')
                this.sync(true);
            else {
                this._ph?.remove();
                this._ph = null;
                this.sync(false);
            }
        }
        mount() {
            this.sync(false);
        }
        build() {
            const ph = document.createElement('div');
            ph.className = 'usa-skeleton-ph';
            ph.setAttribute('aria-hidden', 'true');
            const bone = (cls = '') => {
                const b = document.createElement('span');
                b.className = `usa-bone ${cls}`.trim();
                return b;
            };
            const radius = this.getAttribute('radius');
            if (radius)
                this.style.setProperty('--usa-skeleton-radius', radius);
            if (this.flag('circle') || this.hasAttribute('width') || this.hasAttribute('height')) {
                const b = bone(this.flag('circle') ? 'usa-bone-circle' : 'usa-bone-block');
                b.style.width = this.str('width', this.flag('circle') ? this.str('height', '48px') : '100%');
                b.style.height = this.str('height', this.flag('circle') ? b.style.width : '120px');
                ph.append(b);
            }
            else {
                if (this.flag('avatar'))
                    ph.append(bone('usa-bone-circle usa-bone-avatar'));
                const col = document.createElement('div');
                col.className = 'usa-bone-lines';
                const n = Math.max(1, Math.min(20, this.num('lines', 3)));
                for (let i = 0; i < n; i++)
                    col.append(bone(i === n - 1 && n > 1 ? 'usa-bone-last' : ''));
                ph.append(col);
            }
            return ph;
        }
        sync(animate) {
            const loading = this.loading;
            this.setAttribute('aria-busy', String(loading));
            if (loading) {
                if (!this._ph) {
                    this._ph = this.build();
                    this.prepend(this._ph);
                }
                return;
            }
            if (this._ph) {
                this._ph.remove();
                this._ph = null;
            }
            if (animate && !this.reduced) {
                for (const kid of Array.from(this.children)) {
                    this.motion(kid, [{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], { duration: 360, easing: EASE_OUT });
                }
            }
            this.emit('loaded');
        }
    }, { id: 'skeleton', text: css$Q });
}

var css$P = "";

function defineProgress(tag = 'usa-progress') {
    return defineElement(tag, (Base) => class UsaProgress extends Base {
        constructor() {
            super(...arguments);
            this._fill = null;
        }
        static get observedAttributes() {
            return ['value', 'max', 'indeterminate', 'label'];
        }
        get value() {
            const v = this.getAttribute('value');
            return v === null || v === '' || Number.isNaN(Number(v)) ? null : Number(v);
        }
        set value(v) {
            if (v === null || v === undefined)
                this.removeAttribute('value');
            else
                this.setAttribute('value', String(v));
        }
        get max() {
            const m = this.num('max', 100);
            return m > 0 ? m : 100;
        }
        set max(v) {
            this.setAttribute('max', String(v));
        }
        get ratio() {
            const v = this.value;
            return this.hasAttribute('indeterminate') || v === null ? null : clamp(v / this.max, 0, 1);
        }
        changed() {
            this.sync();
        }
        mount() {
            if (!this._fill) {
                this.innerHTML = '<span class="usa-progress-bar"></span><span class="usa-progress-bar usa-progress-bar2"></span>';
                this._fill = this.firstElementChild;
            }
            this.setAttribute('role', 'progressbar');
            this.sync();
        }
        sync() {
            const ratio = this.ratio;
            const label = this.getAttribute('label');
            if (label)
                this.setAttribute('aria-label', label);
            this.toggleAttribute('data-indeterminate', ratio === null);
            if (ratio === null) {
                this.removeAttribute('aria-valuenow');
                if (this._fill)
                    this._fill.style.transform = '';
                return;
            }
            this.setAttribute('aria-valuemin', '0');
            this.setAttribute('aria-valuemax', String(this.max));
            this.setAttribute('aria-valuenow', String(this.value));
            if (this._fill)
                this._fill.style.transform = `scaleX(${ratio})`;
            if (ratio === 1)
                this.emit('complete');
        }
    }, { id: 'progress', text: css$P });
}

var css$O = "";

const ICONS = {
    info: '<path d="M12 8h.01M11 12h1v5h1"/>',
    success: '<path d="m8 12.5 3 3 5-6"/>',
    warning: '<path d="M12 8v5M12 16.5h.01"/>',
    error: '<path d="m9 9 6 6M15 9l-6 6"/>',
};
function defineToaster(tag = 'usa-toaster') {
    return defineElement(tag, (Base) => class UsaToaster extends Base {
        static get observedAttributes() {
            return ['label', 'position', 'max'];
        }
        mount() {
            this.setAttribute('role', 'region');
            this.setAttribute('aria-label', this.str('label', 'Notifications'));
        }
        flip(mutate) {
            const kids = Array.from(this.children);
            const before = new Map(kids.map((k) => [k, k.getBoundingClientRect().top]));
            mutate();
            if (this.reduced)
                return;
            for (const k of Array.from(this.children)) {
                const top = before.get(k);
                if (top === undefined || k.hasAttribute('data-leaving'))
                    continue;
                const dy = top - k.getBoundingClientRect().top;
                if (Math.abs(dy) > 0.5)
                    this.motion(k, [{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 320, easing: EASE_OUT, composite: 'add' });
            }
        }
        enterFrames() {
            if (this.reduced)
                return [{ opacity: 0 }, { opacity: 1 }];
            const pos = this.str('position', 'bottom-right');
            const x = pos.endsWith('right') ? '110%' : pos.endsWith('left') ? '-110%' : '0';
            const y = pos.endsWith('center') ? (pos.startsWith('top') ? '-120%' : '120%') : '0';
            return [{ opacity: 0, transform: `translate(${x}, ${y}) scale(0.96)` }, { opacity: 1, transform: 'none' }];
        }
        show(message, options = {}) {
            const type = options.type || 'info';
            const el = document.createElement('div');
            el.className = 'usa-toast';
            el.setAttribute('data-type', type);
            el.setAttribute('role', type === 'error' ? 'alert' : 'status');
            el.innerHTML = `<svg class="usa-toast-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/>${ICONS[type] || ICONS.info}</svg><div class="usa-toast-msg"></div>`;
            el.querySelector('.usa-toast-msg').textContent = message;
            let closed = null;
            let timer = 0;
            const close = () => {
                if (closed)
                    return closed;
                clearTimeout(timer);
                el.setAttribute('data-leaving', '');
                const frames = this.enterFrames().reverse();
                const a = el.isConnected ? this.motion(el, frames, { duration: 220, easing: 'cubic-bezier(0.7, 0, 0.84, 0)', fill: 'forwards' }) : null;
                closed = new Promise((resolve) => {
                    const done = () => {
                        this.flip(() => el.remove());
                        resolve();
                    };
                    if (a)
                        a.onfinish = done;
                    else
                        done();
                });
                return closed;
            };
            if (options.action) {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'usa-toast-action';
                btn.textContent = options.action.label;
                btn.addEventListener('click', () => {
                    options.action.onClick();
                    close();
                });
                el.append(btn);
            }
            if (options.dismissible !== false) {
                const x = document.createElement('button');
                x.type = 'button';
                x.className = 'usa-toast-close';
                x.setAttribute('aria-label', 'Close');
                x.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17"/></svg>';
                x.addEventListener('click', () => close());
                el.append(x);
            }
            const duration = options.duration ?? 4000;
            const arm = () => {
                clearTimeout(timer);
                if (duration > 0)
                    timer = setTimeout(close, duration);
            };
            const hold = () => clearTimeout(timer);
            el.addEventListener('pointerenter', hold);
            el.addEventListener('pointerleave', arm);
            el.addEventListener('focusin', hold);
            el.addEventListener('focusout', arm);
            const top = this.str('position', 'bottom-right').startsWith('top');
            this.flip(() => (top ? this.prepend(el) : this.append(el)));
            this.motion(el, this.enterFrames(), { duration: 420, easing: FLUENT_DECELERATE });
            arm();
            const live = Array.from(this.querySelectorAll('.usa-toast:not([data-leaving])'));
            const max = Math.max(1, this.num('max', 4));
            const extra = live.length - max;
            if (extra > 0)
                (top ? live.slice(-extra) : live.slice(0, extra)).forEach((t) => t._close?.());
            el._close = close;
            this.emit('toast', { element: el, message, type });
            return { element: el, close };
        }
        clear() {
            this.querySelectorAll('.usa-toast').forEach((t) => t._close?.());
        }
    }, { id: 'toast', text: css$O });
}
/**
 * Show a toast. Defines `<usa-toaster>` and adds one to `<body>` if the
 * page has none. Returns a handle with `close()`. No-op on the server.
 *
 * ```js
 * toast('Saved', { type: 'success' });
 * ```
 */
function toast(message, options = {}) {
    if (typeof document === 'undefined' || !defineToaster())
        return null;
    let host = typeof options.toaster === 'string' ? document.querySelector(options.toaster) : options.toaster || document.querySelector('usa-toaster');
    if (!host) {
        host = document.createElement('usa-toaster');
        document.body.append(host);
    }
    return host.show(message, options);
}

var css$N = "";

const PATHS = {
    success: 'M15 27 l7 7 l14 -15',
    error: 'M18 18 L34 34 M34 18 L18 34',
    warning: 'M26 15 V30 M26 37 V37.5',
};
function defineCheck(tag = 'usa-check') {
    return defineElement(tag, (Base) => class UsaCheck extends Base {
        constructor() {
            super(...arguments);
            this._anims = [];
        }
        static get observedAttributes() {
            return ['kind', 'size', 'label', 'start'];
        }
        mount() {
            const variant = kindOf(this, PATHS, 'success');
            this.innerHTML = `<svg viewBox="0 0 52 52" aria-hidden="true"><circle class="usa-check-circle" cx="26" cy="26" r="23" pathLength="1"/><path class="usa-check-mark" d="${PATHS[variant]}" pathLength="1"/></svg>`;
            this.setAttribute('data-kind', variant);
            const size = this.getAttribute('size');
            if (size)
                this.style.setProperty('--usa-check-size', `${Number(size)}px`);
            const label = this.getAttribute('label');
            if (label) {
                this.setAttribute('role', 'img');
                this.setAttribute('aria-label', label);
            }
            if (this.reduced) {
                this.setAttribute('data-state', 'done');
                return;
            }
            this.setAttribute('data-state', 'idle');
            const start = this.str('start', 'view');
            if (start === 'load')
                this.play();
            else if (start === 'view') {
                let done = false;
                this.inView((v) => v && !done && ((done = true), this.play()), { threshold: 0.5 });
            }
        }
        unmount() {
            this._anims.splice(0).forEach((a) => a.cancel());
        }
        reset() {
            this._anims.splice(0).forEach((a) => a.cancel());
            this.setAttribute('data-state', this.reduced ? 'done' : 'idle');
        }
        play() {
            this.reset();
            this.setAttribute('data-state', 'done');
            const circle = this.querySelector('.usa-check-circle');
            const mark = this.querySelector('.usa-check-mark');
            const svg = this.querySelector('svg');
            if (this.reduced || !circle || !mark || !svg) {
                this.emit('complete');
                return Promise.resolve();
            }
            const draw = [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }];
            const anims = [
                this.motion(circle, draw, { duration: 520, easing: EASE_OUT, fill: 'backwards' }),
                this.motion(mark, draw, { duration: 340, delay: 420, easing: EASE_OUT, fill: 'backwards' }),
                this.motion(svg, [{ transform: 'scale(1)' }, { transform: 'scale(1.12)' }, { transform: 'scale(1)' }], { duration: 420, delay: 640, easing: EASE_SPRING }),
            ].filter((a) => !!a);
            this._anims = anims;
            return new Promise((resolve) => {
                const last = anims[anims.length - 1];
                const done = () => {
                    this.emit('complete');
                    resolve();
                };
                if (last)
                    last.onfinish = done;
                else
                    done();
            });
        }
    }, { id: 'check', text: css$N });
}

/**
 * motionary/components/feedback — loading & feedback.
 * `<usa-spinner>`, `<usa-skeleton>`, `<usa-progress>`, `<usa-toaster>` +
 * `toast()`, `<usa-check>`.
 */
/** Register every component of this category under its default tag. */
function defineFeedbackComponents() {
    defineSpinner();
    defineSkeleton();
    defineProgress();
    defineToaster();
    defineCheck();
}

var css$M = "";

function defineAurora(tag = 'usa-aurora') {
    return defineElement(tag, (Base) => class UsaAurora extends Base {
        constructor() {
            super(...arguments);
            this._layer = null;
        }
        static get observedAttributes() {
            return ['colors', 'speed', 'intensity'];
        }
        mount() {
            if (!this._layer) {
                this._layer = document.createElement('div');
                this._layer.className = 'usa-aurora-layer';
                this._layer.setAttribute('aria-hidden', 'true');
                this._layer.innerHTML = '<i></i><i></i><i></i><i></i>';
                this.prepend(this._layer);
            }
            const colors = this.str('colors', '#7c5cff,#22d3ee,#f472b6,#34d399').split(',').map((c) => c.trim()).filter(Boolean);
            Array.from(this._layer.children).forEach((blob, i) => {
                blob.style.setProperty('--c', colors[i % colors.length]);
            });
            const speed = this.num('speed', 1);
            this.style.setProperty('--usa-aurora-speed', `${(18 / Math.max(0.05, speed)).toFixed(2)}s`);
            this.style.setProperty('--usa-aurora-opacity', String(this.num('intensity', 0.7)));
            this.inView((v) => this.toggleAttribute('data-offscreen', !v));
        }
    }, { id: 'aurora', text: css$M });
}

var css$L = "";

function defineParticles(tag = 'usa-particles') {
    return defineElement(tag, (Base) => class UsaParticles extends Base {
        constructor() {
            super(...arguments);
            this._canvas = null;
            this._ctx = null;
            this._ps = [];
            this._frame = 0;
            this._w = 0;
            this._h = 0;
            this._visible = false;
            this._mx = -1e4;
            this._color = '#888';
            this._my = -1e4;
        }
        static get observedAttributes() {
            return ['count', 'color', 'size', 'speed', 'links', 'interactive', 'paused'];
        }
        mount() {
            if (!this._canvas) {
                this._canvas = document.createElement('canvas');
                this._canvas.setAttribute('aria-hidden', 'true');
                this.prepend(this._canvas);
            }
            this._ctx = this._canvas.getContext?.('2d') ?? null;
            if (!this._ctx)
                return;
            this.resize();
            if (typeof ResizeObserver !== 'undefined') {
                const ro = new ResizeObserver(() => {
                    this.resize();
                    if (!this._frame)
                        this.draw();
                });
                ro.observe(this);
                this.onCleanup(() => ro.disconnect());
            }
            this.inView((v) => {
                this._visible = v;
                this.loop();
            });
            this.listen(document, 'visibilitychange', () => this.loop());
            if (this.flag('interactive')) {
                this.listen(window, 'pointermove', (e) => {
                    const r = this.getBoundingClientRect();
                    this._mx = e.clientX - r.left;
                    this._my = e.clientY - r.top;
                }, { passive: true });
            }
            this.draw();
        }
        unmount() {
            caf(this._frame);
            this._frame = 0;
        }
        reset() {
            this._ps = [];
            this.resize();
            this.draw();
        }
        resize() {
            const c = this._canvas;
            if (!c || !this._ctx)
                return;
            const w = this.clientWidth || 300;
            const h = this.clientHeight || 150;
            const dpr = Math.min(2, (typeof devicePixelRatio === 'number' && devicePixelRatio) || 1);
            c.width = Math.round(w * dpr);
            c.height = Math.round(h * dpr);
            this._ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            this._w = w;
            this._h = h;
            this._color = this.getAttribute('color') || (typeof getComputedStyle === 'function' ? getComputedStyle(this).color : '') || '#888';
            const want = Math.round(Math.min(1, (w * h) / (900 * 500)) * Math.max(1, this.num('count', 60))) || 1;
            const speed = this.num('speed', 0.35);
            const size = this.num('size', 2.2);
            while (this._ps.length < want) {
                const a = Math.random() * Math.PI * 2;
                const s = speed * (0.3 + Math.random() * 0.7);
                this._ps.push({ x: Math.random() * w, y: Math.random() * h, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: 0.6 + Math.random() * (size - 0.6) });
            }
            this._ps.length = want;
        }
        loop() {
            const run = this._visible && !this.reduced && !this.flag('paused') && !(typeof document !== 'undefined' && document.hidden);
            if (run && !this._frame) {
                const tick = () => {
                    this.step();
                    this.draw();
                    this._frame = raf(tick);
                };
                this._frame = raf(tick);
            }
            else if (!run && this._frame) {
                caf(this._frame);
                this._frame = 0;
            }
        }
        step() {
            const { _w: w, _h: h } = this;
            for (const p of this._ps) {
                const dx = p.x - this._mx;
                const dy = p.y - this._my;
                const d2 = dx * dx + dy * dy;
                if (d2 < 8100 && d2 > 0.01) {
                    const f = (1 - Math.sqrt(d2) / 90) * 0.6;
                    p.x += (dx / Math.sqrt(d2)) * f;
                    p.y += (dy / Math.sqrt(d2)) * f;
                }
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < -5)
                    p.x = w + 5;
                else if (p.x > w + 5)
                    p.x = -5;
                if (p.y < -5)
                    p.y = h + 5;
                else if (p.y > h + 5)
                    p.y = -5;
            }
        }
        draw() {
            const ctx = this._ctx;
            if (!ctx)
                return;
            const color = this._color;
            ctx.clearRect(0, 0, this._w, this._h);
            ctx.fillStyle = color;
            ctx.strokeStyle = color;
            const ps = this._ps;
            const link = this.num('links', 110);
            if (link > 0) {
                const l2 = link * link;
                ctx.lineWidth = 0.6;
                for (let i = 0; i < ps.length; i++) {
                    for (let j = i + 1; j < ps.length; j++) {
                        const dx = ps[i].x - ps[j].x;
                        const dy = ps[i].y - ps[j].y;
                        const d2 = dx * dx + dy * dy;
                        if (d2 < l2) {
                            ctx.globalAlpha = (1 - d2 / l2) * 0.35;
                            ctx.beginPath();
                            ctx.moveTo(ps[i].x, ps[i].y);
                            ctx.lineTo(ps[j].x, ps[j].y);
                            ctx.stroke();
                        }
                    }
                }
            }
            ctx.globalAlpha = 0.85;
            for (const p of ps) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        }
    }, { id: 'particles', text: css$L });
}

var css$K = "";

const noise = (freq) => `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${freq}' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 1.6 -0.3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;
function defineGrain(tag = 'usa-grain') {
    return defineElement(tag, (Base) => class UsaGrain extends Base {
        constructor() {
            super(...arguments);
            this._layer = null;
        }
        static get observedAttributes() {
            return ['opacity', 'blend', 'scale'];
        }
        mount() {
            if (!this._layer) {
                this._layer = document.createElement('div');
                this._layer.className = 'usa-grain-layer';
                this._layer.setAttribute('aria-hidden', 'true');
                this.append(this._layer);
            }
            const s = this._layer.style;
            s.backgroundImage = noise(0.8);
            s.backgroundSize = `${this.num('scale', 180)}px`;
            s.opacity = String(this.num('opacity', 0.12));
            s.mixBlendMode = this.str('blend', 'overlay');
        }
    }, { id: 'grain', text: css$K });
}

var css$J = "";

function defineMarquee(tag = 'usa-marquee') {
    return defineElement(tag, (Base) => class UsaMarquee extends Base {
        constructor() {
            super(...arguments);
            this._track = null;
            this._anim = null;
            this._hover = false;
            this._visible = true;
            this._size = 0;
        }
        static get observedAttributes() {
            return ['speed', 'direction', 'gap', 'paused', 'pause-on-hover'];
        }
        get vertical() {
            const d = this.str('direction', 'left');
            return d === 'up' || d === 'down';
        }
        mount() {
            if (!this._track) {
                const track = document.createElement('div');
                track.className = 'usa-marquee-track';
                const group = document.createElement('div');
                group.className = 'usa-marquee-group';
                group.append(...Array.from(this.childNodes));
                track.append(group);
                this.append(track);
                this._track = track;
            }
            this.toggleAttribute('data-vertical', this.vertical);
            this.style.setProperty('--usa-marquee-gap', `${this.num('gap', 32)}px`);
            if (this.reduced) {
                this.setAttribute('data-static', '');
                this.syncClones(1);
                return;
            }
            this.removeAttribute('data-static');
            this.build();
            if (typeof ResizeObserver !== 'undefined') {
                const ro = new ResizeObserver(() => this.build());
                ro.observe(this._track.firstElementChild);
                this.onCleanup(() => ro.disconnect());
            }
            this.inView((v) => {
                this._visible = v;
                this.sync();
            });
            this.listen(this, 'pointerenter', () => ((this._hover = true), this.sync()));
            this.listen(this, 'pointerleave', () => ((this._hover = false), this.sync()));
            this.listen(this, 'focusin', () => ((this._hover = true), this.sync()));
            this.listen(this, 'focusout', () => ((this._hover = false), this.sync()));
        }
        unmount() {
            this._anim?.cancel();
            this._anim = null;
            this._size = 0;
        }
        syncClones(n) {
            const track = this._track;
            const group = track.firstElementChild;
            while (track.children.length > n)
                track.lastElementChild.remove();
            while (track.children.length < n) {
                const clone = group.cloneNode(true);
                clone.setAttribute('aria-hidden', 'true');
                clone.setAttribute('inert', '');
                track.append(clone);
            }
        }
        build() {
            const track = this._track;
            const group = track.firstElementChild;
            const vertical = this.vertical;
            const gap = this.num('gap', 32);
            const measured = vertical ? group.offsetHeight : group.offsetWidth;
            if (!measured)
                return; // not laid out yet: the ResizeObserver calls back
            const size = measured + gap;
            if (this._anim && this._size === size)
                return;
            this._size = size;
            const box = (vertical ? this.clientHeight : this.clientWidth) || size;
            // Enough copies to cover the box twice
            this.syncClones(Math.min(50, Math.max(2, Math.ceil(box / size) + 1)));
            const progress = this._anim?.effect?.getComputedTiming().progress ?? 0;
            this._anim?.cancel();
            const axis = vertical ? 'Y' : 'X';
            const reverse = ['right', 'down'].includes(this.str('direction', 'left'));
            const frames = [{ transform: `translate${axis}(0)` }, { transform: `translate${axis}(${-size}px)` }];
            this._anim = this.motion(track, reverse ? frames.reverse() : frames, {
                duration: (Math.max(1, size) / Math.max(1, this.num('speed', 50))) * 1000,
                iterations: Infinity,
            });
            if (this._anim && progress)
                this._anim.currentTime = progress * Number(this._anim.effect?.getTiming().duration || 0);
            this.sync();
        }
        sync() {
            const a = this._anim;
            if (!a)
                return;
            const stop = this.flag('paused') || !this._visible || (this._hover && this.flag('pause-on-hover'));
            if (stop && a.playState === 'running')
                a.pause();
            else if (!stop && a.playState === 'paused')
                a.play();
        }
        pause() {
            this.setAttribute('paused', '');
        }
        resume() {
            this.removeAttribute('paused');
        }
        changed(name) {
            if (name === 'paused')
                this.sync();
            else
                super.changed(name);
        }
    }, { id: 'marquee', text: css$J });
}

var css$I = "";

function defineAcrylic(tag = 'usa-acrylic') {
    return defineElement(tag, (Base) => class UsaAcrylic extends Base {
        static get observedAttributes() {
            return ['tint', 'tint-opacity', 'blur', 'shimmer'];
        }
        mount() {
            const tint = this.getAttribute('tint');
            if (tint)
                this.style.setProperty('--usa-acrylic-tint', tint);
            else
                this.style.removeProperty('--usa-acrylic-tint');
            this.style.setProperty('--usa-acrylic-opacity', `${Math.round(this.num('tint-opacity', 0.55) * 100)}%`);
            this.style.setProperty('--usa-acrylic-blur', `${this.num('blur', 30)}px`);
            if (this.str('shimmer') === 'load' && !this.reduced) {
                this.removeAttribute('data-shine');
                void this.offsetWidth;
                this.setAttribute('data-shine', '');
            }
        }
    }, { id: 'acrylic', text: css$I });
}

var css$H = "";

/** Shared canvas setup: DPR ≤ 2, resize with the host, run only while visible & tab shown. */
function canvasLoop(host, draw, still) {
    const c = document.createElement('canvas');
    c.className = 'usa-bg-canvas';
    c.setAttribute('aria-hidden', 'true');
    host.prepend(c);
    host.onCleanup(() => c.remove());
    const ctx = c.getContext?.('2d');
    if (!ctx)
        return;
    const dpr = Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
    let w = 0;
    let h = 0;
    const size = () => {
        const r = host.getBoundingClientRect();
        w = Math.max(1, r.width || 300);
        h = Math.max(1, r.height || 150);
        c.width = w * dpr;
        c.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(size) : null;
    ro?.observe(host);
    host.onCleanup(() => ro?.disconnect());
    let id = 0;
    let on = false;
    const loop = (t) => {
        if (!document.hidden)
            draw(ctx, w, h, t);
        id = raf(loop);
    };
    if (still) {
        draw(ctx, w, h, 0);
        return;
    }
    host.inView((v) => {
        if (v && !on) {
            on = true;
            id = raf(loop);
        }
        else if (!v && on) {
            on = false;
            caf(id);
        }
    });
    host.onCleanup(() => caf(id));
}
function defineGridGlow(tag = 'usa-grid-glow') {
    return defineElement(tag, (Base) => class extends Base {
        static get observedAttributes() {
            return ['size', 'radius', 'color'];
        }
        mount() {
            this.style.setProperty('--usa-grid', `${this.num('size', 32)}px`);
            this.style.setProperty('--usa-grid-r', `${this.num('radius', 220)}px`);
            if (this.str('color'))
                this.style.setProperty('--usa-grid-color', this.str('color'));
            if (this.reduced)
                return;
            let f = 0;
            let x = 0;
            let y = 0;
            this.listen(this, 'pointermove', (e) => {
                const r = this.getBoundingClientRect();
                x = e.clientX - r.left;
                y = e.clientY - r.top;
                if (!f)
                    f = raf(() => {
                        f = 0;
                        this.style.setProperty('--usa-grid-x', `${x}px`);
                        this.style.setProperty('--usa-grid-y', `${y}px`);
                    });
            });
            this.onCleanup(() => caf(f));
        }
    }, { id: 'bg-fx', text: css$H });
}
function defineBlobs(tag = 'usa-blobs') {
    return defineElement(tag, (Base) => class extends Base {
        static get observedAttributes() {
            return ['colors', 'speed', 'blur'];
        }
        mount() {
            this.querySelector(':scope > .usa-blobs-layer')?.remove();
            const colors = this.str('colors', '#7c5cff,#22d3ee,#f472b6,#34d399').split(',');
            const layer = document.createElement('div');
            layer.className = 'usa-blobs-layer';
            layer.setAttribute('aria-hidden', 'true');
            layer.innerHTML = colors.map((c, i) => `<i style="--c:${c.trim()};--i:${i}"></i>`).join('');
            this.prepend(layer);
            this.style.setProperty('--usa-blobs-speed', String(this.num('speed', 1)));
            this.style.setProperty('--usa-blobs-blur', `${this.num('blur', 60)}px`);
        }
    }, { id: 'bg-fx', text: css$H });
}
function defineWaterRipple(tag = 'usa-water-ripple') {
    return defineElement(tag, (Base) => class extends Base {
        constructor() {
            super(...arguments);
            this._drop = null;
        }
        static get observedAttributes() {
            return ['damping', 'color', 'strength'];
        }
        drop(x, y, s = 1) {
            this._drop?.(x, y, s);
        }
        mount() {
            if (this.reduced)
                return;
            const S = 4;
            let cols = 0;
            let rows = 0;
            let a = new Float32Array(0);
            let b = new Float32Array(0);
            const damp = this.num('damping', 0.96);
            const color = this.str('color', '255,255,255');
            this._drop = (x, y, s = 1) => {
                const cx = Math.floor(x / S);
                const cy = Math.floor(y / S);
                if (cx < 1 || cy < 1 || cx >= cols - 1 || cy >= rows - 1)
                    return;
                a[cy * cols + cx] += 256 * s * this.num('strength', 1);
            };
            canvasLoop(this, (ctx, w, h) => {
                const nc = Math.ceil(w / S);
                const nr = Math.ceil(h / S);
                if (nc !== cols || nr !== rows) {
                    cols = nc;
                    rows = nr;
                    a = new Float32Array(cols * rows);
                    b = new Float32Array(cols * rows);
                }
                ctx.clearRect(0, 0, w, h);
                for (let y = 1; y < rows - 1; y++) {
                    for (let x = 1; x < cols - 1; x++) {
                        const i = y * cols + x;
                        const v = ((a[i - 1] + a[i + 1] + a[i - cols] + a[i + cols]) / 2 - b[i]) * damp;
                        b[i] = v;
                        if (v > 2 || v < -2) {
                            ctx.fillStyle = `rgba(${color},${Math.min(0.5, Math.abs(v) / 300).toFixed(3)})`;
                            ctx.fillRect(x * S, y * S, S, S);
                        }
                    }
                }
                const t = a;
                a = b;
                b = t;
            }, false);
            this.listen(this, 'pointermove', (e) => {
                const r = this.getBoundingClientRect();
                this.drop(e.clientX - r.left, e.clientY - r.top, 0.35);
            });
            // contract-exempt: keyboard-click-only — decorative ripple under the pointer, no action
            this.listen(this, 'pointerdown', (e) => {
                const r = this.getBoundingClientRect();
                this.drop(e.clientX - r.left, e.clientY - r.top, 1.5);
            });
        }
    }, { id: 'bg-fx', text: css$H });
}
function defineDotNetwork(tag = 'usa-dot-network') {
    return defineElement(tag, (Base) => class extends Base {
        static get observedAttributes() {
            return ['gap', 'radius', 'color'];
        }
        mount() {
            const gap = Math.max(8, this.num('gap', 28));
            const R = this.num('radius', 140);
            const color = this.str('color', '124,92,255');
            let px = -1e4;
            let py = -1e4;
            this.listen(this, 'pointermove', (e) => {
                const r = this.getBoundingClientRect();
                px = e.clientX - r.left;
                py = e.clientY - r.top;
            });
            this.listen(this, 'pointerleave', () => (px = py = -1e4));
            canvasLoop(this, (ctx, w, h) => {
                ctx.clearRect(0, 0, w, h);
                const near = [];
                for (let y = gap / 2; y < h; y += gap) {
                    for (let x = gap / 2; x < w; x += gap) {
                        const d = Math.hypot(x - px, y - py);
                        const k = d < R ? 1 - d / R : 0;
                        const ox = k ? ((x - px) / (d || 1)) * k * 8 : 0;
                        const oy = k ? ((y - py) / (d || 1)) * k * 8 : 0;
                        ctx.fillStyle = `rgba(${color},${(0.25 + k * 0.75).toFixed(3)})`;
                        ctx.beginPath();
                        ctx.arc(x + ox, y + oy, 1.2 + k * 2.2, 0, Math.PI * 2);
                        ctx.fill();
                        if (k > 0.2)
                            near.push([x + ox, y + oy, k]);
                    }
                }
                ctx.lineWidth = 1;
                for (const [x, y, k] of near) {
                    ctx.strokeStyle = `rgba(${color},${(k * 0.5).toFixed(3)})`;
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(px, py);
                    ctx.stroke();
                }
            }, this.reduced);
        }
    }, { id: 'bg-fx', text: css$H });
}

var css$G = "";

/**
 * Style variants (v2.6): `variant="minimal | neon | glass | brutalist |
 * fluent | material"` on any `<usa-*>` element — or on any ancestor as
 * `data-usa-variant`, or page-wide with `setVariant()` — sets the shared
 * design tokens every component reads:
 *
 * `--usa-accent`, `--usa-accent-text`, `--usa-surface`, `--usa-text`,
 * `--usa-radius`, `--usa-border`, `--usa-shadow`, `--usa-blur`, `--usa-font`.
 *
 * (`<usa-spinner>`, `<usa-check>` and `<usa-dialog>` already use `variant`
 * for their kind; the token names never clash with those values except
 * `fluent`, which means the same thing there.)
 */
const VARIANTS = ['minimal', 'neon', 'glass', 'brutalist', 'fluent', 'material'];
/** Inject the variant token sheet (done automatically by every `ui` component). */
function adoptVariants() {
    adoptStyles('variants', css$G);
}
/** Apply a variant to the whole page (or `root`); `null` removes it. */
function setVariant(variant, root = typeof document !== 'undefined' ? document.documentElement : null) {
    if (!root)
        return;
    adoptVariants();
    if (variant)
        root.setAttribute('data-usa-variant', variant);
    else
        root.removeAttribute('data-usa-variant');
}

var css$F = "";

/**
 * Windows 11 **Fluent preset** (v2.8): applies the `fluent` variant
 * (Segoe UI Variable, Windows accent, 8 px radii), a Mica-style tinted
 * window background, Acrylic on `.usa-acrylic` / `[data-acrylic]`, and
 * Reveal highlight (a light following the pointer on borders and
 * backgrounds of interactive elements). Ideal for WebView2 / Electron /
 * Tauri apps on Windows. Returns a function that removes it.
 * Respects reduced motion / transparency (no Reveal tracking; solid materials).
 */
function fluentPreset(options = {}) {
    if (typeof document === 'undefined')
        return () => undefined;
    const root = options.root || document.documentElement;
    adoptStyles('fluent-preset', css$F);
    setVariant('fluent', root);
    root.classList.add('usa-fluent');
    if (options.mica !== false)
        root.classList.add('usa-fluent-mica');
    const sel = options.selector || 'button, [role="button"], a.usa-fluent-item, [data-fluent-reveal], .usa-fluent-item';
    let frame = 0;
    let last = null;
    let ev = null;
    const apply = () => {
        frame = 0;
        if (!ev)
            return;
        const t = ev.target?.closest?.(sel);
        if (last && last !== t)
            last.removeAttribute('data-reveal');
        last = t;
        if (!t)
            return;
        const r = t.getBoundingClientRect();
        t.style.setProperty('--usa-reveal-x', `${ev.clientX - r.left}px`);
        t.style.setProperty('--usa-reveal-y', `${ev.clientY - r.top}px`);
        t.setAttribute('data-reveal', '');
    };
    const move = (e) => {
        if (e.pointerType === 'touch')
            return;
        ev = e;
        if (!frame)
            frame = raf(apply);
    };
    const reveal = options.reveal !== false && !prefersReducedMotion();
    if (reveal)
        document.addEventListener('pointermove', move, { passive: true });
    return () => {
        document.removeEventListener('pointermove', move);
        caf(frame);
        last?.removeAttribute('data-reveal');
        root.classList.remove('usa-fluent', 'usa-fluent-mica');
        setVariant(null, root);
    };
}

/**
 * motionary/components/background — backgrounds & decoration.
 * `<usa-aurora>`, `<usa-particles>`, `<usa-grain>`, `<usa-marquee>`,
 * `<usa-acrylic>`.
 */
/** Register every component of this category under its default tag. */
function defineBackgroundComponents() {
    defineAurora();
    defineParticles();
    defineGrain();
    defineMarquee();
    defineAcrylic();
    defineGridGlow();
    defineBlobs();
    defineWaterRipple();
    defineDotNetwork();
}

var shadowCss = ":host{display:contents}dialog{position:fixed;inset:0;width:100%;height:100%;max-width:none;max-height:none;margin:0;padding:0;border:0;background:transparent;color:inherit;overflow:hidden}dialog:not([open]){display:none}dialog::backdrop{background:transparent}[part=\"backdrop\"]{position:absolute;inset:0;background:var(--usa-dialog-backdrop,rgb(0 0 0 / 0.42))}[part=\"panel\"]{position:absolute;left:50%;top:50%;translate:-50% -50%;box-sizing:border-box;width:min(var(--usa-dialog-width,480px),calc(100vw - 32px));max-height:calc(100vh - 32px);overflow:auto;padding:var(--usa-dialog-padding,24px);border-radius:var(--usa-dialog-radius,12px);background:var(--usa-dialog-bg,Canvas);color:var(--usa-dialog-fg,CanvasText);box-shadow:0 32px 64px -12px rgb(0 0 0 / 0.45),0 0 0 1px rgb(127 127 127 / 0.18)}dialog[data-kind^=\"drawer\"] [part=\"panel\"]{top:0;bottom:0;translate:none;max-height:none;height:100%;border-radius:0;width:min(var(--usa-dialog-width,380px),88vw)}dialog[data-kind=\"drawer-start\"] [part=\"panel\"]{left:0}dialog[data-kind=\"drawer-end\"] [part=\"panel\"]{left:auto;right:0}dialog[data-kind=\"drawer-bottom\"] [part=\"panel\"],dialog[data-kind=\"sheet\"] [part=\"panel\"]{top:auto;bottom:0;left:0;right:0;translate:none;width:100%;height:auto;max-height:85vh;border-radius:var(--usa-dialog-radius,16px) var(--usa-dialog-radius,16px) 0 0}dialog[data-kind=\"sheet\"] [part=\"panel\"]{left:50%;translate:-50% 0;width:min(var(--usa-dialog-width,560px),100vw)}";

var css$E = "";

const FROM = {
    modal: 'scale(0.94)',
    'drawer-start': 'translateX(-100%)',
    'drawer-end': 'translateX(100%)',
    'drawer-bottom': 'translateY(100%)',
    sheet: 'translateY(40px)',
};
function defineDialog(tag = 'usa-dialog') {
    return defineElement(tag, (Base) => class UsaDialog extends Base {
        constructor() {
            super(...arguments);
            this._dialog = null;
            this._panel = null;
            this._backdrop = null;
            this._busy = null;
            this._syncing = false;
            this.returnValue = '';
        }
        static get observedAttributes() {
            return ['open', 'kind', 'label', 'no-esc', 'no-backdrop-close'];
        }
        get dialog() {
            return this._dialog;
        }
        get open() {
            return this.hasAttribute('open');
        }
        set open(v) {
            this.toggleAttribute('open', !!v);
        }
        get kind() {
            return kindOf(this, FROM, 'modal');
        }
        changed(name) {
            if (name === 'open') {
                if (this._syncing)
                    return;
                if (this.open)
                    this.show();
                else
                    this.close();
            }
            else
                this.syncAttrs();
        }
        syncAttrs() {
            if (!this._dialog)
                return;
            this._dialog.setAttribute('data-kind', this.kind);
            this._dialog.setAttribute('aria-modal', 'true');
            const label = this.getAttribute('label');
            if (label)
                this._dialog.setAttribute('aria-label', label);
        }
        mount() {
            if (!this._dialog) {
                const root = this.shadowRoot || this.attachShadow({ mode: 'open' });
                root.innerHTML = '<dialog part="dialog"><div part="backdrop" aria-hidden="true"></div><div part="panel"><slot></slot></div></dialog>';
                shadowStyles(root, shadowCss);
                this._dialog = root.querySelector('dialog');
                this._backdrop = root.querySelector('[part=backdrop]');
                this._panel = root.querySelector('[part=panel]');
            }
            this.syncAttrs();
            const dlg = this._dialog;
            this.listen(dlg, 'cancel', (e) => {
                e.preventDefault();
                if (!this.flag('no-esc'))
                    this.close('cancel');
            });
            this.listen(this._backdrop, 'click', () => !this.flag('no-backdrop-close') && this.close('backdrop'));
            this.listen(this, 'click', (e) => {
                const t = e.target.closest?.('[data-close]');
                if (t && this.contains(t))
                    this.close(t.getAttribute('data-close') || 'close');
            });
            if (this.open && !dlg.open)
                this.show();
        }
        unmount() {
            if (this._dialog?.open)
                this._dialog.close();
        }
        setOpenAttr(on) {
            this._syncing = true;
            this.toggleAttribute('open', on);
            this._syncing = false;
        }
        async show() {
            await this._busy;
            const dlg = this._dialog;
            if (!dlg) {
                this.setOpenAttr(true); // opens on connect
                return;
            }
            if (dlg.open)
                return;
            this.setOpenAttr(true);
            try {
                if (typeof dlg.showModal === 'function')
                    dlg.showModal();
                else
                    dlg.setAttribute('open', '');
            }
            catch {
                dlg.setAttribute('open', '');
            }
            this.emit('open');
            if (this.reduced) {
                await this.animate2([{ opacity: 0 }, { opacity: 1 }], [{ opacity: 0 }, { opacity: 1 }], 160, EASE_OUT);
                return;
            }
            await this.animate2([{ opacity: 0, transform: FROM[this.kind] }, { opacity: 1, transform: 'none' }], [{ opacity: 0 }, { opacity: 1 }], this.kind === 'modal' ? 260 : 360, FLUENT_DECELERATE);
        }
        async close(returnValue = '') {
            await this._busy;
            const dlg = this._dialog;
            if (!dlg || !dlg.open) {
                this.setOpenAttr(false);
                return;
            }
            if (!this.emit('beforeclose', { returnValue })) {
                this.setOpenAttr(true);
                return;
            }
            this.returnValue = returnValue;
            this._busy = (async () => {
                const panelTo = this.reduced ? { opacity: 0 } : { opacity: 0, transform: FROM[this.kind] };
                const panelFrom = this.reduced ? { opacity: 1 } : { opacity: 1, transform: 'none' };
                await this.animate2([panelFrom, panelTo], [{ opacity: 1 }, { opacity: 0 }], this.reduced ? 120 : 200, 'cubic-bezier(0.7, 0, 0.84, 0)', 'forwards');
                try {
                    if (typeof dlg.close === 'function')
                        dlg.close(returnValue);
                    else
                        dlg.removeAttribute('open');
                }
                catch {
                    dlg.removeAttribute('open');
                }
                dlg.removeAttribute('open');
                this._panel?.getAnimations?.().forEach((a) => a.cancel());
                this._backdrop?.getAnimations?.().forEach((a) => a.cancel());
                this.setOpenAttr(false);
                this.emit('close', { returnValue });
            })();
            await this._busy;
            this._busy = null;
        }
        animate2(panel, backdrop, duration, easing, fill = 'none') {
            const a = this._panel ? this.motion(this._panel, panel, { duration, easing, fill }) : null;
            const b = this._backdrop ? this.motion(this._backdrop, backdrop, { duration, easing: 'linear', fill }) : null;
            return Promise.all([a?.finished, b?.finished].map((p) => p?.catch(() => undefined))).then(() => undefined);
        }
    }, { id: 'dialog', text: css$E });
}

var css$D = "";

function defineAccordion(tag = 'usa-accordion') {
    return defineElement(tag, (Base) => class UsaAccordion extends Base {
        constructor() {
            super(...arguments);
            this._running = new WeakMap();
        }
        static get observedAttributes() {
            return ['multiple', 'duration'];
        }
        get items() {
            return Array.from(this.children).filter((c) => c.tagName === 'DETAILS');
        }
        mount() {
            this.listen(this, 'click', (e) => {
                const summary = e.target.closest?.('summary');
                const d = summary?.parentElement;
                if (!summary || !d || d.tagName !== 'DETAILS' || d.parentElement !== this)
                    return;
                e.preventDefault();
                this.toggleItem(d);
            });
        }
        /** Height of `d` when closed: its summary plus its own padding and border. */
        closedHeight(d) {
            const summary = d.querySelector(':scope > summary');
            const cs = typeof getComputedStyle === 'function' ? getComputedStyle(d) : null;
            const extra = cs
                ? ['paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth'].reduce((n, k) => n + (parseFloat(cs[k]) || 0), 0)
                : 0;
            return (summary ? summary.getBoundingClientRect().height : 0) + extra;
        }
        async toggleItem(d, open = !d.open || d.hasAttribute('data-closing')) {
            if (open && !this.flag('multiple'))
                this.items.forEach((o) => o !== d && o.open && this.toggleItem(o, false));
            this._running.get(d)?.cancel();
            this._running.delete(d);
            const duration = this.reduced ? 0 : this.num('duration', 300);
            const startH = d.getBoundingClientRect().height;
            if (open) {
                d.removeAttribute('data-closing');
                d.open = true;
            }
            this.emit('toggle', { details: d, open });
            if (!duration || typeof d.animate !== 'function') {
                if (!open)
                    d.open = false;
                return;
            }
            const endH = open ? d.getBoundingClientRect().height : this.closedHeight(d);
            if (!open)
                d.setAttribute('data-closing', '');
            d.style.overflow = 'hidden';
            const a = d.animate([{ height: `${startH}px` }, { height: `${endH}px` }], { duration, easing: EASE_OUT });
            this._running.set(d, a);
            await a.finished.catch(() => undefined);
            if (this._running.get(d) !== a)
                return;
            this._running.delete(d);
            d.style.overflow = '';
            if (!open) {
                d.open = false;
                d.removeAttribute('data-closing');
            }
        }
    }, { id: 'accordion', text: css$D });
}

var css$C = "";

function defineViewSwitch(tag = 'usa-view-switch') {
    return defineElement(tag, (Base) => class UsaViewSwitch extends Base {
        constructor() {
            super(...arguments);
            this._index = -1;
            this._anims = [];
        }
        static get observedAttributes() {
            return ['active', 'duration', 'effect'];
        }
        get views() {
            return Array.from(this.children);
        }
        get active() {
            return this.str('active', '0');
        }
        set active(v) {
            this.setAttribute('active', String(v));
        }
        indexOf(v) {
            const views = this.views;
            const byName = views.findIndex((el) => el.dataset.view === String(v));
            if (byName >= 0)
                return byName;
            const n = Number(v);
            return Number.isInteger(n) && n >= 0 && n < views.length ? n : -1;
        }
        changed() {
            this.show(this.active);
        }
        mount() {
            const i = Math.max(0, this.indexOf(this.active));
            this._index = i;
            this.views.forEach((v, j) => this.setVisible(v, j === i));
        }
        setVisible(v, on) {
            v.hidden = !on;
            v.toggleAttribute('inert', !on);
            v.toggleAttribute('data-active', on);
        }
        async show(view) {
            const next = this.indexOf(view);
            const prev = this._index;
            if (next < 0 || next === prev)
                return;
            const views = this.views;
            const from = views[prev];
            const to = views[next];
            this._index = next;
            const name = to.dataset.view ?? String(next);
            if (this.active !== name && this.active !== String(next))
                this.setAttribute('active', name);
            this._anims.splice(0).forEach((a) => a.finish());
            this.setVisible(to, true);
            this.emit('change', { view: to, index: next, name });
            if (!from)
                return;
            const duration = this.num('duration', 320);
            const effect = this.reduced ? 'fade' : this.str('effect', 'slide');
            const dir = next > prev ? 1 : -1;
            let outF;
            let inF;
            switch (effect) {
                case 'fade':
                    outF = { opacity: 0 };
                    inF = { opacity: 0 };
                    break;
                case 'scale':
                    outF = { opacity: 0, transform: 'scale(0.96)' };
                    inF = { opacity: 0, transform: 'scale(1.04)' };
                    break;
                case 'drill':
                    outF = { opacity: 0, transform: `scale(${dir > 0 ? 1.06 : 0.94})` };
                    inF = { opacity: 0, transform: `scale(${dir > 0 ? 0.94 : 1.06})` };
                    break;
                default:
                    outF = { opacity: 0, transform: `translateX(${-dir * 32}px)` };
                    inF = { opacity: 0, transform: `translateX(${dir * 48}px)` };
            }
            const neutral = (f) => ('transform' in f ? { opacity: 1, transform: 'none' } : { opacity: 1 });
            // Outgoing view stays stacked in the same grid cell while it leaves
            from.setAttribute('data-leaving', '');
            const a = this.motion(from, [neutral(outF), outF], { duration: duration * 0.6, easing: EASE_OUT, fill: 'forwards' });
            const b = this.motion(to, [inF, neutral(inF)], { duration, delay: duration * 0.15, easing: FLUENT_DECELERATE, fill: 'backwards' });
            this._anims = [a, b].filter((x) => !!x);
            await Promise.all(this._anims.map((x) => x.finished.catch(() => undefined)));
            from.removeAttribute('data-leaving');
            if (this._index !== prev)
                this.setVisible(from, false);
            a?.cancel();
        }
    }, { id: 'view-switch', text: css$C });
}

/**
 * Run `update()` (which changes the DOM) inside a view transition:
 * `document.startViewTransition()` where available (Chrome/Edge 111+, so
 * Electron, WebView2 and Tauri on Windows), otherwise a short cross-fade of
 * `options.fallback`. Instant under reduced motion. Resolves when finished.
 *
 * Give elements a `view-transition-name` in CSS for shared-element morphs.
 */
async function viewTransition(update, options = {}) {
    const doc = typeof document !== 'undefined' ? document : null;
    if (!doc || prefersReducedMotion()) {
        await update();
        return;
    }
    if (typeof doc.startViewTransition === 'function') {
        let vt;
        try {
            vt = options.types ? doc.startViewTransition({ update, types: options.types }) : doc.startViewTransition(update);
        }
        catch {
            vt = doc.startViewTransition(update);
        }
        await vt.finished.catch(() => undefined);
        return;
    }
    const el = options.fallback;
    const d = options.duration ?? 200;
    if (!el || typeof el.animate !== 'function') {
        await update();
        return;
    }
    await el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: d * 0.8, easing: 'ease-in', fill: 'forwards' }).finished.catch(() => undefined);
    await update();
    const a = el.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: d * 1.1, easing: EASE_OUT });
    // remove the forwards fill of the fade-out
    el.getAnimations?.().forEach((x) => x !== a && x.cancel());
    await a.finished.catch(() => undefined);
}
const list = (t) => (t instanceof Element ? Array.from(t.children) : Array.from(t));
/**
 * FLIP animation for layout changes (list reorder, filter, grid resize):
 * measures `targets` (an element's children, or a list), runs `mutate()`,
 * then animates each element from its old position to its new one with
 * transforms only. Elements added by `mutate()` fade in.
 *
 * ```js
 * await flip(list, () => list.append(...shuffled));
 * ```
 */
async function flip(targets, mutate, options = {}) {
    const before = new Map(list(targets).map((el) => [el, el.getBoundingClientRect()]));
    await mutate();
    if (prefersReducedMotion())
        return;
    const after = list(targets);
    const duration = options.duration ?? 420;
    const easing = options.easing ?? FLUENT_DECELERATE;
    const anims = [];
    // Read all, then write all
    const rects = after.map((el) => el.getBoundingClientRect());
    after.forEach((el, i) => {
        if (typeof el.animate !== 'function')
            return;
        const first = before.get(el);
        const last = rects[i];
        if (!first) {
            if (options.animateEnter !== false)
                anims.push(el.animate([{ opacity: 0, transform: 'scale(0.9)' }, { opacity: 1, transform: 'none' }], { duration, easing }));
            return;
        }
        const dx = first.left - last.left;
        const dy = first.top - last.top;
        const sx = last.width ? first.width / last.width : 1;
        const sy = last.height ? first.height / last.height : 1;
        if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5 && Math.abs(sx - 1) < 0.01 && Math.abs(sy - 1) < 0.01)
            return;
        anims.push(el.animate([{ transformOrigin: '0 0', transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` }, { transformOrigin: '0 0', transform: 'none' }], { duration, easing }));
    });
    await Promise.all(anims.map((a) => a.finished.catch(() => undefined)));
}

/**
 * motionary/components/transitions — view & layout transitions.
 * `<usa-dialog>`, `<usa-accordion>`, `<usa-view-switch>`
 * and the `viewTransition()` and `flip()` helpers (4.0: `<usa-flip-list>` → `<usa-auto-animate>`,
 * `connectedAnimation()` → `sharedTransition()`, both in `components/layout`).
 */
/** Register every component of this category under its default tag. */
function defineTransitionComponents() {
    defineDialog();
    defineAccordion();
    defineViewSwitch();
}

const SPRING_PRESETS = {
    default: { stiffness: 170, damping: 26, mass: 1 },
    gentle: { stiffness: 120, damping: 14, mass: 1 },
    wobbly: { stiffness: 180, damping: 12, mass: 1 },
    stiff: { stiffness: 210, damping: 20, mass: 1 },
    bouncy: { stiffness: 300, damping: 10, mass: 1 },
    slow: { stiffness: 280, damping: 60, mass: 1 },
    molasses: { stiffness: 280, damping: 120, mass: 1 },
};
/** Resolve a preset name or a partial config to a full config. */
function resolveSpring(input) {
    const base = typeof input === 'string' ? SPRING_PRESETS[input] || SPRING_PRESETS.default : { ...SPRING_PRESETS.default, ...(input || {}) };
    const pos = (v, d) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : d);
    const o = (typeof input === 'object' && input) || {};
    return {
        stiffness: pos(base.stiffness, 170),
        damping: Math.max(0, Number.isFinite(base.damping) ? base.damping : 26),
        mass: pos(base.mass, 1),
        velocity: Number.isFinite(o.velocity) ? o.velocity : 0,
        precision: pos(o.precision, 0.001),
    };
}
/** One integration step (semi-implicit Euler) towards `to`. Returns [x, v]. */
function stepSpring(cfg, x, v, to, dt) {
    const a = (-cfg.stiffness * (x - to) - cfg.damping * v) / cfg.mass;
    const nv = v + a * dt;
    return [x + nv * dt, nv];
}
const cache = /*#__PURE__*/ new Map();
/**
 * Sample the spring from 0 to 1 at `fps` (default 60). `values` may exceed 1
 * (overshoot); `duration` is the time to rest, in ms (max 10 s).
 */
function springSamples(input, fps = 60) {
    const cfg = resolveSpring(input);
    const key = `${cfg.stiffness}|${cfg.damping}|${cfg.mass}|${cfg.velocity}|${cfg.precision}|${fps}`;
    const hit = cache.get(key);
    if (hit)
        return hit;
    const values = [0];
    let x = 0;
    let v = cfg.velocity;
    const frame = 1000 / fps;
    let t = 0;
    let next = frame;
    while (t < 10000) {
        [x, v] = stepSpring(cfg, x, v, 1, 0.001);
        t += 1;
        if (t >= next) {
            values.push(x);
            next += frame;
            if (Math.abs(1 - x) < cfg.precision && Math.abs(v) < cfg.precision * 10)
                break;
        }
    }
    values[values.length - 1] = 1;
    const out = { values, duration: Math.round(t) };
    if (cache.size > 64)
        cache.clear();
    cache.set(key, out);
    return out;
}
/** `true` when CSS `linear()` easing is supported. */
function supportsLinearEasing() {
    return typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('animation-timing-function', 'linear(0, 1)');
}
/**
 * The spring as `{ easing, duration }` for `el.animate()` / CSS. `easing` is
 * a `linear(…)` function with at most `points` stops (default 48), or a
 * cubic-bezier overshoot where `linear()` is unsupported.
 */
function springEasing(input, points = 48) {
    const { values, duration } = springSamples(input);
    if (!supportsLinearEasing())
        return { easing: EASE_SPRING, duration: Math.min(duration, 1200) };
    return { easing: linearEasing(values, points), duration };
}
/** Build a CSS `linear()` easing from samples (down-sampled to `points`). */
function linearEasing(values, points = 48) {
    const n = values.length;
    const step = Math.max(1, Math.ceil((n - 1) / Math.max(2, points - 1)));
    const out = [];
    for (let i = 0; i < n - 1; i += step)
        out.push(String(Math.round(values[i] * 1000) / 1000));
    out.push('1');
    return `linear(${out.join(', ')})`;
}
/**
 * Animate `el` between keyframes with spring timing (WAAPI). Under reduced
 * motion the final frame is applied immediately. Returns the Animation (or
 * `null` without WAAPI / under reduced motion).
 */
function spring(el, keyframes, input, options = {}) {
    const target = el;
    if (prefersReducedMotion() || typeof target.animate !== 'function') {
        applyFrame(target, keyframes[keyframes.length - 1]);
        return null;
    }
    const { easing, duration } = springEasing(input);
    return target.animate(keyframes, { duration: duration * motionScale(), easing, fill: 'both', ...options });
}
/**
 * An interruptible spring-animated number: call `set()` as often as you like,
 * the motion keeps its velocity (like iOS / Framer springs). Reduced motion
 * jumps straight to the target.
 */
function createSpring(opts = {}) {
    let cfg = resolveSpring(opts.spring);
    let x = opts.value ?? 0;
    let v = 0;
    let to = x;
    let id = 0;
    let last = 0;
    let running = false;
    const stop = () => {
        if (running)
            caf(id);
        running = false;
    };
    const loop = () => {
        const t = now();
        let dt = Math.min(64, Math.max(1, t - last));
        last = t;
        while (dt > 0) {
            const s = Math.min(dt, 4);
            [x, v] = stepSpring(cfg, x, v, to, s / 1000);
            dt -= s;
        }
        const scale = Math.max(1, Math.abs(to) * 0.0005);
        if (Math.abs(to - x) < cfg.precision * scale * 10 && Math.abs(v) < cfg.precision * scale * 100) {
            x = to;
            v = 0;
            running = false;
            opts.onUpdate?.(x, 0);
            opts.onRest?.(x);
            return;
        }
        opts.onUpdate?.(x, v);
        id = raf(loop);
    };
    const api = {
        get value() {
            return x;
        },
        get velocity() {
            return v;
        },
        get target() {
            return to;
        },
        get animating() {
            return running;
        },
        set(target, velocity) {
            to = target;
            if (velocity !== undefined && Number.isFinite(velocity))
                v = velocity;
            if (prefersReducedMotion()) {
                api.jump(target);
                opts.onRest?.(target);
                return;
            }
            if (!running) {
                running = true;
                last = now();
                id = raf(loop);
            }
        },
        jump(value) {
            stop();
            x = to = value;
            v = 0;
            opts.onUpdate?.(x, 0);
        },
        stop() {
            stop();
            v = 0;
            to = x;
        },
        configure(input) {
            cfg = resolveSpring(input);
        },
    };
    return api;
}
/* ------------------------------------------------------------------ */
/* Inertia + snapping                                                  */
/* ------------------------------------------------------------------ */
/**
 * Where a flick at `velocity` (units/s) comes to rest with exponential
 * decay: `value + velocity · timeConstant` (default 0.325 s, iOS-like).
 */
function projectInertia(value, velocity, timeConstant = 0.325) {
    return value + velocity * timeConstant;
}
/** Snap to a grid (`number`) or the nearest of a list of points. */
function snapTo(value, to) {
    if (Array.isArray(to)) {
        if (!to.length)
            return value;
        return to.reduce((best, p) => (Math.abs(p - value) < Math.abs(best - value) ? p : best), to[0]);
    }
    if (typeof to === 'number' && to > 0)
        return Math.round(value / to) * to;
    return value;
}
/** iOS-style rubber-band resistance: how far content moves when pulled `distance` past an edge. */
function rubberBand(distance, dimension, constant = 0.55) {
    if (dimension <= 0)
        return 0;
    const sign = distance < 0 ? -1 : 1;
    const d = Math.abs(distance);
    return sign * (1 - 1 / ((d * constant) / dimension + 1)) * dimension;
}

var css$B = "";

const SPRING_EFFECTS = ['bounce-in', 'pop', 'drop', 'jelly', 'rubber-band'];
/** Entrance effects start hidden; attention effects (jelly, rubber-band) play on visible content. */
const ENTRANCE = /*#__PURE__*/ new Set(['bounce-in', 'pop', 'drop']);
/** Keyframes of a spring effect (entrances use spring timing, attention effects fixed frames). */
function springEffectKeyframes(effect, reduced = false) {
    if (reduced)
        return ENTRANCE.has(effect) ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 1 }];
    switch (effect) {
        case 'pop':
            return [{ opacity: 0, transform: 'scale(0.5)' }, { opacity: 1, transform: 'scale(1)' }];
        case 'drop':
            return [{ opacity: 0, transform: 'translate3d(0, -120%, 0)' }, { opacity: 1, transform: 'translate3d(0, 0, 0)' }];
        case 'jelly':
            return [
                { transform: 'scale3d(1, 1, 1)' },
                { transform: 'scale3d(1.25, 0.75, 1)', offset: 0.3 },
                { transform: 'scale3d(0.75, 1.25, 1)', offset: 0.4 },
                { transform: 'scale3d(1.15, 0.85, 1)', offset: 0.5 },
                { transform: 'scale3d(0.95, 1.05, 1)', offset: 0.65 },
                { transform: 'scale3d(1.05, 0.95, 1)', offset: 0.75 },
                { transform: 'scale3d(1, 1, 1)' },
            ];
        case 'rubber-band':
            return [
                { transform: 'scale3d(1, 1, 1)' },
                { transform: 'scale3d(1.3, 0.7, 1)', offset: 0.3 },
                { transform: 'scale3d(0.8, 1.2, 1)', offset: 0.45 },
                { transform: 'scale3d(1.1, 0.9, 1)', offset: 0.6 },
                { transform: 'scale3d(0.97, 1.03, 1)', offset: 0.8 },
                { transform: 'scale3d(1, 1, 1)' },
            ];
        default:
            return [{ opacity: 0, transform: 'scale(0.3)' }, { opacity: 1, transform: 'scale(1)' }];
    }
}
const DEFAULT_PRESET = { 'bounce-in': 'bouncy', pop: 'wobbly', drop: 'bouncy' };
function defineSpring(tag = 'usa-spring') {
    return defineElement(tag, (Base) => class UsaSpring extends Base {
        constructor() {
            super(...arguments);
            this._anim = null;
        }
        static get observedAttributes() {
            return ['effect', 'trigger', 'repeat', 'stiffness', 'damping', 'mass', 'preset', 'duration', 'delay'];
        }
        get effect() {
            return this.str('effect', 'bounce-in');
        }
        set effect(v) {
            this.setAttribute('effect', v);
        }
        config() {
            if (this.hasAttribute('stiffness') || this.hasAttribute('damping') || this.hasAttribute('mass'))
                return { stiffness: this.num('stiffness', 170), damping: this.num('damping', 26), mass: this.num('mass', 1) };
            return this.str('preset', DEFAULT_PRESET[this.effect] || 'wobbly');
        }
        mount() {
            const trigger = this.str('trigger', 'view');
            const entrance = ENTRANCE.has(this.effect);
            if (trigger === 'view') {
                if (entrance)
                    this.setAttribute('data-state', 'hidden');
                this.inView((visible) => {
                    if (visible)
                        this.play();
                    else if (this.flag('repeat') && entrance)
                        this.reset();
                }, { threshold: 0.15 });
            }
            else {
                if (trigger === 'hover')
                    this.listen(this, 'pointerenter', () => this.play());
                if (trigger === 'click') {
                    this.listen(this, 'click', () => this.play());
                    this.listen(this, 'keydown', (e) => (e.key === 'Enter' || e.key === ' ') && !e.repeat && this.play());
                }
            }
        }
        unmount() {
            this._anim?.cancel();
            this._anim = null;
        }
        reset() {
            this._anim?.cancel();
            this._anim = null;
            if (ENTRANCE.has(this.effect))
                this.setAttribute('data-state', 'hidden');
        }
        async play() {
            const effect = this.effect;
            const reduced = this.reduced;
            this._anim?.cancel();
            this.setAttribute('data-state', 'playing');
            const frames = springEffectKeyframes(effect, reduced);
            const timing = ENTRANCE.has(effect) && !reduced
                ? springEasing(this.config())
                : { duration: reduced ? 250 : this.num('duration', 900), easing: 'ease-out' };
            const a = this.motion(this, frames, { ...timing, delay: this.num('delay', 0), fill: 'backwards' });
            this._anim = a;
            if (a) {
                try {
                    await a.finished;
                }
                catch {
                    return;
                }
                if (this._anim !== a)
                    return;
            }
            this._anim = null;
            this.setAttribute('data-state', 'done');
            this.emit('complete', { effect });
        }
    }, { id: 'spring', text: css$B });
}

var css$A = "";

const parseSnap = (s) => {
    if (!s.trim())
        return null;
    const parts = s.split(',').map((p) => Number(p.trim())).filter((n) => Number.isFinite(n));
    if (!parts.length)
        return null;
    return s.includes(',') ? parts : parts[0];
};
function defineDraggable(tag = 'usa-draggable') {
    return defineElement(tag, (Base) => class UsaDraggable extends Base {
        constructor() {
            super(...arguments);
            this._x = 0;
            this._y = 0;
            this._drag = null;
        }
        static get observedAttributes() {
            return ['axis', 'disabled', 'preset', 'bounds', 'spring-back', 'inertia', 'snap', 'step'];
        }
        get x() {
            return this._x;
        }
        get y() {
            return this._y;
        }
        get dragging() {
            return !!this._drag;
        }
        render() {
            this.style.transform = `translate3d(${this._x}px, ${this._y}px, 0)`;
            this.style.setProperty('--usa-drag-x', `${this._x}px`);
            this.style.setProperty('--usa-drag-y', `${this._y}px`);
        }
        axis() {
            return this.str('axis', 'both');
        }
        /** Bounds relative to the origin, from the parent box. */
        limits() {
            if (this.str('bounds') !== 'parent' || !this.parentElement)
                return null;
            const p = this.parentElement.getBoundingClientRect();
            const r = this.getBoundingClientRect();
            const ox = r.left - this._x;
            const oy = r.top - this._y;
            return { minX: p.left - ox, maxX: p.right - ox - r.width, minY: p.top - oy, maxY: p.bottom - oy - r.height };
        }
        mount() {
            let settled = 0;
            const rest = () => {
                if (++settled >= 2) {
                    settled = 0;
                    this.removeAttribute('data-moving');
                    this.emit('settle', { x: this._x, y: this._y });
                }
            };
            const spring = this.str('preset', 'wobbly');
            this._sx = createSpring({ value: this._x, spring, onUpdate: (v) => ((this._x = v), this.render()), onRest: rest });
            this._sy = createSpring({ value: this._y, spring, onUpdate: (v) => ((this._y = v), this.render()), onRest: rest });
            if (!this.hasAttribute('tabindex'))
                this.tabIndex = 0;
            this.setAttribute('aria-roledescription', 'draggable');
            this.listen(this, 'pointerdown', (e) => this.start(e));
            this.listen(this, 'pointermove', (e) => this.move(e));
            this.listen(this, 'pointerup', (e) => this.end(e));
            this.listen(this, 'pointercancel', (e) => this.end(e));
            this.listen(this, 'keydown', (e) => this.key(e));
            this.render();
        }
        unmount() {
            this._sx?.stop();
            this._sy?.stop();
            this._drag = null;
        }
        start(e) {
            if (this.flag('disabled') || (e.pointerType === 'mouse' && e.button !== 0))
                return;
            this._sx.stop();
            this._sy.stop();
            this._drag = { id: e.pointerId, px: e.clientX, py: e.clientY, ox: this._x, oy: this._y, samples: [[e.clientX, e.clientY, typeof e.timeStamp === 'number' ? e.timeStamp : Date.now()]] };
            try {
                this.setPointerCapture?.(e.pointerId);
            }
            catch {
                /* synthetic events */
            }
            this.setAttribute('data-dragging', '');
            this.emit('drag-start', { x: this._x, y: this._y });
        }
        move(e) {
            const d = this._drag;
            if (!d || e.pointerId !== d.id)
                return;
            const axis = this.axis();
            let x = axis === 'y' ? d.ox : d.ox + e.clientX - d.px;
            let y = axis === 'x' ? d.oy : d.oy + e.clientY - d.py;
            const b = this.limits();
            if (b) {
                const band = (v, lo, hi, dim) => (v < lo ? lo + rubberBand(v - lo, dim) : v > hi ? hi + rubberBand(v - hi, dim) : v);
                x = band(x, b.minX, b.maxX, 200);
                y = band(y, b.minY, b.maxY, 200);
            }
            this._x = x;
            this._y = y;
            d.samples.push([e.clientX, e.clientY, typeof e.timeStamp === 'number' ? e.timeStamp : Date.now()]);
            if (d.samples.length > 6)
                d.samples.shift();
            this.render();
            this.emit('drag', { x, y });
        }
        velocity() {
            const s = this._drag?.samples || [];
            if (s.length < 2)
                return [0, 0];
            const a = s[0];
            const b = s[s.length - 1];
            const dt = (b[2] - a[2]) / 1000;
            if (dt <= 0 || dt > 0.3)
                return [0, 0];
            return [(b[0] - a[0]) / dt, (b[1] - a[1]) / dt];
        }
        end(e) {
            const d = this._drag;
            if (!d || e.pointerId !== d.id)
                return;
            let [vx, vy] = this.velocity();
            const axis = this.axis();
            if (axis === 'y')
                vx = 0;
            if (axis === 'x')
                vy = 0;
            this._drag = null;
            this.removeAttribute('data-dragging');
            let tx = this._x;
            let ty = this._y;
            if (this.flag('spring-back')) {
                tx = 0;
                ty = 0;
            }
            else {
                if (this.flag('inertia') && !this.reduced) {
                    tx = projectInertia(tx, vx);
                    ty = projectInertia(ty, vy);
                }
                [tx, ty] = this.constrain(tx, ty);
            }
            this.emit('drag-end', { x: tx, y: ty, vx, vy });
            this.go(tx, ty, vx, vy);
        }
        constrain(x, y) {
            const snap = parseSnap(this.str('snap'));
            let tx = snapTo(x, snap);
            let ty = snapTo(y, snap);
            const b = this.limits();
            if (b) {
                tx = clamp(tx, b.minX, Math.max(b.minX, b.maxX));
                ty = clamp(ty, b.minY, Math.max(b.minY, b.maxY));
            }
            const axis = this.axis();
            return [axis === 'y' ? 0 : tx, axis === 'x' ? 0 : ty];
        }
        go(x, y, vx = 0, vy = 0) {
            this.setAttribute('data-moving', '');
            this._sx.set(x, vx);
            this._sy.set(y, vy);
        }
        key(e) {
            if (this.flag('disabled'))
                return;
            const step = this.num('step', 16);
            const snap = parseSnap(this.str('snap'));
            const s = typeof snap === 'number' ? snap : step;
            const map = { ArrowLeft: [-s, 0], ArrowRight: [s, 0], ArrowUp: [0, -s], ArrowDown: [0, s] };
            if (e.key === 'Home' || e.key === 'Escape') {
                e.preventDefault();
                this.reset();
                return;
            }
            const m = map[e.key];
            if (!m)
                return;
            e.preventDefault();
            const [tx, ty] = this.flag('spring-back') ? [this._sx.target + m[0], this._sy.target + m[1]] : this.constrain(this._sx.target + m[0], this._sy.target + m[1]);
            this.go(tx, ty);
        }
        moveTo(x, y, animate = true) {
            if (!animate) {
                this._sx.jump(x);
                this._sy.jump(y);
                return;
            }
            this.go(x, y);
        }
        reset() {
            this.go(0, 0);
        }
    }, { id: 'draggable', text: css$A });
}

var css$z = "";

function defineOverscroll(tag = 'usa-overscroll') {
    return defineElement(tag, (Base) => class UsaOverscroll extends Base {
        constructor() {
            super(...arguments);
            this._off = 0;
        }
        static get observedAttributes() {
            return ['axis', 'disabled', 'max', 'preset'];
        }
        get offset() {
            return this._off;
        }
        set(v) {
            this._off = v;
            this.style.setProperty('--usa-overscroll', `${v}px`);
            this.toggleAttribute('data-stretched', Math.abs(v) > 0.5);
        }
        edge(delta) {
            const x = this.str('axis', 'y') === 'x';
            const pos = x ? this.scrollLeft : this.scrollTop;
            const max = (x ? this.scrollWidth - this.clientWidth : this.scrollHeight - this.clientHeight) - 1;
            return (delta < 0 && pos <= 0) || (delta > 0 && pos >= max);
        }
        stretch(raw) {
            const max = this.num('max', 120);
            this.set(Math.max(-max, Math.min(max, rubberBand(raw, max * 2.5))));
        }
        mount() {
            this._spring = createSpring({ spring: this.str('preset', 'default'), onUpdate: (v) => this.set(v) });
            const x = this.str('axis', 'y') === 'x';
            const off = () => this.flag('disabled') || this.reduced;
            // Wheel / trackpad: accumulate past the edge, spring back when it stops.
            let pull = 0;
            let timer;
            this.listen(this, 'wheel', (e) => {
                const d = x ? e.deltaX || e.deltaY : e.deltaY;
                if (off() || !d || !this.edge(d))
                    return;
                this._spring.stop();
                pull -= d;
                this.stretch(pull);
                clearTimeout(timer);
                timer = setTimeout(() => {
                    pull = 0;
                    this._spring.jump(this._off);
                    this._spring.set(0);
                }, 140);
            }, { passive: true });
            this.onCleanup(() => clearTimeout(timer));
            // Touch: rubber-band while the finger pulls past the edge.
            let start = 0;
            let active = false;
            this.listen(this, 'touchstart', (e) => {
                if (off())
                    return;
                const t = e.touches[0];
                start = x ? t.clientX : t.clientY;
                active = false;
                this._spring.stop();
            }, { passive: true });
            this.listen(this, 'touchmove', (e) => {
                if (off())
                    return;
                const t = e.touches[0];
                const dist = (x ? t.clientX : t.clientY) - start;
                if (!active && dist !== 0 && this.edge(-dist))
                    active = true;
                if (!active)
                    return;
                if (e.cancelable)
                    e.preventDefault();
                this.stretch(dist);
            }, { passive: false });
            const release = () => {
                if (!active)
                    return;
                active = false;
                this._spring.jump(this._off);
                this._spring.set(0);
            };
            this.listen(this, 'touchend', release);
            this.listen(this, 'touchcancel', release);
        }
        unmount() {
            this._spring?.stop();
            this.set(0);
        }
    }, { id: 'overscroll', text: css$z });
}

/**
 * motionary/components/physics — spring & bounce physics (v2.3).
 * `<usa-spring>` (bounce-in, pop, drop, jelly, rubber-band), `<usa-draggable>`
 * (spring-back, inertia, snap) and `<usa-overscroll>` (elastic edges), plus
 * the spring core: `spring()`, `springEasing()`, `createSpring()`,
 * `SPRING_PRESETS`, `projectInertia()`, `snapTo()`, `rubberBand()`.
 */
/** Register every component of this category under its default tag. */
function definePhysicsComponents() {
    defineSpring();
    defineDraggable();
    defineOverscroll();
}

var css$y = "";

const CARD_EFFECTS = ['flip', 'holo', 'glass', 'border-glow', 'conic-border', 'lift', 'spotlight', 'sheen', 'parallax-layers', 'expand'];
/** Effects that follow the pointer (they share one rAF-throttled tracker). */
const TRACKING = /*#__PURE__*/ new Set(['holo', 'border-glow', 'spotlight', 'parallax-layers', 'lift']);
function defineCard(tag = 'usa-card') {
    // contract-exempt: attr-unobserved(flipped, expanded) — state reflected by the element itself (set the property instead); observing it would re-mount on every change
    return defineElement(tag, (Base) => class UsaCard extends Base {
        constructor() {
            super(...arguments);
            this._frame = 0;
            this._spacer = null;
            this._backdrop = null;
            this._busy = false;
        }
        static get observedAttributes() {
            return ['effect', 'trigger', 'disabled', 'color', 'depth'];
        }
        get effects() {
            return this.str('effect', 'lift').split(/[\s,]+/).filter(Boolean);
        }
        has(e) {
            return this.effects.includes(e);
        }
        get flipped() {
            return this.flag('flipped');
        }
        set flipped(v) {
            this.setFlag('flipped', v);
        }
        get expanded() {
            return this.flag('expanded');
        }
        mount() {
            if (this.flag('disabled'))
                return;
            const color = this.str('color');
            if (color)
                this.style.setProperty('--usa-card-glow', color);
            if (this.has('sheen') && !this.querySelector(':scope > .usa-card-sheen'))
                this.append(deco('usa-card-sheen'));
            if (this.has('holo') && !this.querySelector(':scope > .usa-card-holo'))
                this.append(deco('usa-card-holo'));
            if (this.has('flip')) {
                const click = this.str('trigger', 'hover') === 'click';
                if (click) {
                    if (!this.hasAttribute('tabindex'))
                        this.tabIndex = 0;
                    this.setAttribute('role', this.getAttribute('role') || 'button');
                    this.setAttribute('aria-pressed', String(this.flipped));
                    this.listen(this, 'click', (e) => !interactive(e.target, this) && this.flip());
                    this.listen(this, 'keydown', (e) => {
                        if ((e.key === 'Enter' || e.key === ' ') && e.target === this) {
                            e.preventDefault();
                            this.flip();
                        }
                    });
                }
                this.setBackHidden();
            }
            if (this.has('expand')) {
                if (!this.hasAttribute('tabindex'))
                    this.tabIndex = 0;
                this.setAttribute('aria-expanded', String(this.expanded));
                this.listen(this, 'click', (e) => {
                    const t = e.target;
                    if (t.closest?.('[data-close]')) {
                        e.stopPropagation();
                        this.collapse();
                    }
                    else if (!this.expanded && !interactive(t, this))
                        this.expand();
                });
                this.listen(this, 'keydown', (e) => {
                    if (e.key === 'Escape' && this.expanded)
                        this.collapse();
                    else if ((e.key === 'Enter' || e.key === ' ') && e.target === this && !this.expanded) {
                        e.preventDefault();
                        this.expand();
                    }
                });
            }
            if (!this.effects.some((e) => TRACKING.has(e)) || this.reduced)
                return;
            let rect = null;
            let px = 0.5;
            let py = 0.5;
            const apply = () => {
                this._frame = 0;
                const nx = clamp(px * 2 - 1, -1, 1);
                const ny = clamp(py * 2 - 1, -1, 1);
                this.style.setProperty('--usa-card-x', `${(px * 100).toFixed(1)}%`);
                this.style.setProperty('--usa-card-y', `${(py * 100).toFixed(1)}%`);
                this.style.setProperty('--usa-card-nx', nx.toFixed(3));
                this.style.setProperty('--usa-card-ny', ny.toFixed(3));
                if (this.has('parallax-layers')) {
                    const depth = this.num('depth', 16);
                    this.querySelectorAll('[data-depth]').forEach((l) => {
                        const d = Number(l.dataset.depth) || 0.5;
                        l.style.transform = `translate3d(${(nx * depth * d).toFixed(1)}px, ${(ny * depth * d).toFixed(1)}px, 0)`;
                    });
                }
            };
            this.listen(this, 'pointerenter', () => {
                rect = this.getBoundingClientRect();
                this.setAttribute('data-hover', '');
            });
            this.listen(this, 'pointermove', (e) => {
                if (this.expanded)
                    return;
                rect = rect || this.getBoundingClientRect();
                px = (e.clientX - rect.left) / (rect.width || 1);
                py = (e.clientY - rect.top) / (rect.height || 1);
                if (!this._frame)
                    this._frame = raf(apply);
            });
            this.listen(this, 'pointerleave', () => {
                rect = null;
                px = py = 0.5;
                this.removeAttribute('data-hover');
                if (!this._frame)
                    this._frame = raf(apply);
            });
        }
        unmount() {
            caf(this._frame);
            this._frame = 0;
            if (this.expanded)
                this.finishCollapse();
        }
        setBackHidden() {
            const front = this.querySelector(':scope > [data-front]');
            const back = this.querySelector(':scope > [data-back]');
            front?.setAttribute('aria-hidden', String(this.flipped));
            back?.setAttribute('aria-hidden', String(!this.flipped));
        }
        flip(force) {
            const next = force === undefined ? !this.flipped : force;
            if (next === this.flipped)
                return;
            this.flipped = next;
            if (this.hasAttribute('aria-pressed'))
                this.setAttribute('aria-pressed', String(next));
            this.setBackHidden();
            this.emit('flip', { flipped: next });
        }
        async expand() {
            if (this.expanded || this._busy)
                return;
            this._busy = true;
            const first = this.getBoundingClientRect();
            const spacer = document.createElement('div');
            spacer.className = 'usa-card-spacer';
            spacer.style.cssText = `width:${first.width}px;height:${first.height}px`;
            spacer.setAttribute('aria-hidden', 'true');
            this.before(spacer);
            this._spacer = spacer;
            const backdrop = document.createElement('div');
            backdrop.className = 'usa-card-backdrop';
            backdrop.addEventListener('click', () => this.collapse());
            this.before(backdrop);
            this._backdrop = backdrop;
            this.setFlag('expanded', true);
            this.setAttribute('aria-expanded', 'true');
            this.emit('expand');
            const last = this.getBoundingClientRect();
            await this.flipFrom(first, last);
            this.motion(backdrop, [{ opacity: 0 }, { opacity: 1 }], { duration: 250, easing: 'ease-out' });
            this.focus({ preventScroll: true });
            this._busy = false;
        }
        async collapse() {
            if (!this.expanded || this._busy)
                return;
            this._busy = true;
            const first = this.getBoundingClientRect();
            const b = this._backdrop;
            if (b)
                this.motion(b, [{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: 'ease-in', fill: 'forwards' });
            this.finishCollapse();
            this.emit('collapse');
            const last = this.getBoundingClientRect();
            await this.flipFrom(first, last);
            this._busy = false;
        }
        finishCollapse() {
            this.setFlag('expanded', false);
            this.setAttribute('aria-expanded', 'false');
            this._spacer?.remove();
            this._backdrop?.remove();
            this._spacer = this._backdrop = null;
        }
        async flipFrom(first, last) {
            if (this.reduced) {
                const a = this.motion(this, [{ opacity: 0.4 }, { opacity: 1 }], { duration: 200 });
                await a?.finished.catch(() => undefined);
                return;
            }
            const sx = first.width / (last.width || 1);
            const sy = first.height / (last.height || 1);
            const dx = first.left - last.left;
            const dy = first.top - last.top;
            const { easing, duration } = springEasing('stiff');
            const a = this.motion(this, [{ transformOrigin: '0 0', transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` }, { transformOrigin: '0 0', transform: 'none' }], { duration: Math.min(duration, 900), easing: easing || EASE_OUT });
            await a?.finished.catch(() => undefined);
        }
    }, { id: 'card', text: css$y });
}
function deco(cls) {
    const s = document.createElement('span');
    s.className = cls;
    s.setAttribute('aria-hidden', 'true');
    return s;
}
/** Clicks on links, buttons and form fields inside the card keep their own behaviour. */
function interactive(t, host) {
    const el = t?.closest?.('a, button, input, select, textarea, label, [contenteditable]');
    return !!el && el !== host && host.contains(el);
}

var css$x = "";

function defineCardStack(tag = 'usa-card-stack') {
    return defineElement(tag, (Base) => class UsaCardStack extends Base {
        constructor() {
            super(...arguments);
            this._drag = null;
            this._busy = false;
        }
        static get observedAttributes() {
            return ['visible', 'offset', 'disabled', 'threshold', 'loop'];
        }
        get top() {
            return this.cards()[0] || null;
        }
        cards() {
            return Array.from(this.children).filter((c) => !c.hasAttribute('data-gone'));
        }
        layout(dragX = 0) {
            const visible = this.num('visible', 3);
            const off = this.num('offset', 10);
            const reduced = this.reduced;
            this.cards().forEach((c, i) => {
                c.style.zIndex = String(100 - i);
                c.toggleAttribute('data-top', i === 0);
                c.setAttribute('aria-hidden', String(i !== 0));
                if (i === 0) {
                    const rot = reduced ? 0 : dragX / 18;
                    c.style.transform = `translate3d(${dragX}px, 0, 0) rotate(${rot.toFixed(2)}deg)`;
                    c.style.opacity = '1';
                }
                else {
                    const k = Math.min(i, visible);
                    const pull = Math.min(1, Math.abs(dragX) / this.num('threshold', 90));
                    const kk = Math.max(0, k - pull);
                    c.style.transform = `translate3d(0, ${(kk * off).toFixed(1)}px, 0) scale(${(1 - kk * 0.05).toFixed(3)})`;
                    c.style.opacity = i > visible ? '0' : '1';
                }
            });
        }
        mount() {
            if (!this.hasAttribute('tabindex'))
                this.tabIndex = 0;
            if (!this.hasAttribute('role'))
                this.setAttribute('role', 'group');
            this.setAttribute('aria-roledescription', 'card stack');
            this._x = createSpring({ spring: 'wobbly', onUpdate: (v) => this.layout(v) });
            this.layout();
            this.listen(this, 'pointerdown', (e) => {
                if (this.flag('disabled') || this._busy || !this.top || !this.top.contains(e.target))
                    return;
                this._x.stop();
                this._drag = { id: e.pointerId, x0: e.clientX - this._x.value, t0: e.timeStamp };
                try {
                    this.setPointerCapture?.(e.pointerId);
                }
                catch {
                    /* synthetic */
                }
                this.setAttribute('data-dragging', '');
            });
            this.listen(this, 'pointermove', (e) => {
                if (!this._drag || e.pointerId !== this._drag.id)
                    return;
                this._x.jump(e.clientX - this._drag.x0);
            });
            const up = (e) => {
                if (!this._drag || e.pointerId !== this._drag.id)
                    return;
                this._drag = null;
                this.removeAttribute('data-dragging');
                const x = this._x.value;
                if (Math.abs(x) >= this.num('threshold', 90))
                    this.swipe(x > 0 ? 'right' : 'left');
                else
                    this._x.set(0);
            };
            this.listen(this, 'pointerup', up);
            this.listen(this, 'pointercancel', up);
            this.listen(this, 'keydown', (e) => {
                if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                    e.preventDefault();
                    this.swipe(e.key === 'ArrowLeft' ? 'left' : 'right');
                }
            });
            const mo = typeof MutationObserver !== 'undefined' ? new MutationObserver(() => this.layout(this._x.value)) : null;
            mo?.observe(this, { childList: true });
            this.onCleanup(() => mo?.disconnect());
        }
        unmount() {
            this._x?.stop();
        }
        async swipe(direction) {
            const card = this.top;
            if (!card || this._busy || this.flag('disabled'))
                return;
            this._busy = true;
            this._x.stop();
            const from = this._x.value;
            const to = (direction === 'left' ? -1 : 1) * Math.max(320, (this.getBoundingClientRect().width || 300) * 1.4);
            card.setAttribute('data-gone', '');
            this._x.jump(0);
            this.layout(0);
            const a = this.reduced
                ? null
                : this.motion(card, [{ transform: `translate3d(${from}px,0,0) rotate(${from / 18}deg)`, opacity: 1 }, { transform: `translate3d(${to}px,0,0) rotate(${to / 14}deg)`, opacity: 0 }], {
                    duration: 380,
                    easing: 'cubic-bezier(0.3, 0.7, 0.4, 1)',
                    fill: 'forwards',
                });
            await a?.finished.catch(() => undefined);
            a?.cancel();
            card.removeAttribute('data-gone');
            if (this.flag('loop'))
                this.append(card);
            else
                card.remove();
            this.layout(0);
            this._busy = false;
            this.emit('swipe', { direction, card });
            if (!this.top)
                this.emit('empty');
        }
    }, { id: 'card-stack', text: css$x });
}

var css$w = "";

function defineStickyStack(tag = 'usa-sticky-stack') {
    return defineElement(tag, (Base) => class UsaStickyStack extends Base {
        constructor() {
            super(...arguments);
            this._frame = 0;
        }
        static get observedAttributes() {
            return ['top', 'gap', 'scale'];
        }
        mount() {
            const top = this.num('top', 80);
            const gap = this.num('gap', 16);
            const cards = Array.from(this.children);
            cards.forEach((c, i) => {
                c.style.top = `${top + i * gap}px`;
                c.style.zIndex = String(i + 1);
            });
            if (this.reduced)
                return;
            const schedule = () => {
                if (!this._frame)
                    this._frame = raf(() => this.update());
            };
            let active = false;
            this.inView((v) => {
                if (v && !active) {
                    active = true;
                    window.addEventListener('scroll', schedule, { passive: true });
                    window.addEventListener('resize', schedule, { passive: true });
                    schedule();
                }
                else if (!v && active) {
                    active = false;
                    window.removeEventListener('scroll', schedule);
                    window.removeEventListener('resize', schedule);
                }
            });
            this.onCleanup(() => {
                window.removeEventListener('scroll', schedule);
                window.removeEventListener('resize', schedule);
            });
        }
        unmount() {
            caf(this._frame);
            this._frame = 0;
        }
        update() {
            this._frame = 0;
            const cards = Array.from(this.children);
            const rects = cards.map((c) => c.getBoundingClientRect());
            const shrink = this.num('scale', 0.06);
            cards.forEach((c, i) => {
                let covered = 0;
                for (let j = i + 1; j < cards.length; j++) {
                    const h = rects[i].height || 1;
                    covered += clamp((rects[i].bottom - rects[j].top) / h, 0, 1);
                }
                const s = 1 - Math.min(3, covered) * shrink;
                c.style.transform = covered > 0.001 ? `scale(${s.toFixed(4)})` : '';
                c.style.filter = covered > 0.001 ? `brightness(${(1 - Math.min(0.35, covered * 0.12)).toFixed(3)})` : '';
            });
        }
    }, { id: 'sticky-stack', text: css$w });
}

var css$v = "";

function defineCarousel3d(tag = 'usa-carousel-3d') {
    return defineElement(tag, (Base) => class UsaCarousel3d extends Base {
        constructor() {
            super(...arguments);
            this._i = 0;
        }
        static get observedAttributes() {
            return ['radius', 'perspective', 'autoplay', 'index'];
        }
        get index() {
            return this._i;
        }
        set index(v) {
            this.goTo(v);
        }
        items() {
            return Array.from(this.children);
        }
        render(angle) {
            const items = this.items();
            const n = items.length || 1;
            const step = 360 / n;
            const w = items[0]?.offsetWidth || 200;
            const r = this.num('radius', Math.round(w / 2 / Math.tan(Math.PI / n)) + 24);
            const reduced = this.reduced;
            items.forEach((it, i) => {
                const norm = ((((i * step - angle) % 360) + 540) % 360) - 180;
                it.style.transform = reduced ? '' : `rotateY(${norm.toFixed(2)}deg) translateZ(${r}px)`;
                it.style.opacity = reduced ? (i === this._i ? '1' : '0') : String(Math.max(0.25, 1 - Math.abs(norm) / 200));
            });
        }
        mount() {
            this.style.setProperty('--usa-c3d-perspective', `${this.num('perspective', 1200)}px`);
            if (!this.hasAttribute('tabindex'))
                this.tabIndex = 0;
            this.setAttribute('role', 'region');
            this.setAttribute('aria-roledescription', 'carousel');
            this._i = Math.max(0, Math.min(this.items().length - 1, this.num('index', 0)));
            const step = () => 360 / (this.items().length || 1);
            this._angle = createSpring({ value: this._i * step(), spring: 'gentle', onUpdate: (v) => this.render(v) });
            this.render(this._angle.value);
            this.mark();
            this.listen(this, 'keydown', (e) => {
                if (e.key === 'ArrowRight')
                    this.next();
                else if (e.key === 'ArrowLeft')
                    this.prev();
                else
                    return;
                e.preventDefault();
            });
            let x0 = null;
            this.listen(this, 'pointerdown', (e) => (x0 = e.clientX));
            this.listen(this, 'pointerup', (e) => {
                if (x0 === null)
                    return;
                const dx = e.clientX - x0;
                x0 = null;
                if (Math.abs(dx) > 40)
                    dx < 0 ? this.next() : this.prev();
            });
            this.listen(this, 'click', (e) => {
                const it = this.items().find((c) => c.contains(e.target));
                if (it) {
                    const i = this.items().indexOf(it);
                    if (i !== this._i)
                        this.goTo(i);
                }
            });
            const every = this.num('autoplay', 0);
            if (every > 0 && !this.reduced) {
                let paused = false;
                const pause = () => (paused = true);
                const resume = () => (paused = false);
                this.listen(this, 'pointerenter', pause);
                this.listen(this, 'pointerleave', resume);
                this.listen(this, 'focusin', pause);
                this.listen(this, 'focusout', resume);
                const t = setInterval(() => !paused && !document.hidden && this.next(), every);
                this.onCleanup(() => clearInterval(t));
            }
        }
        unmount() {
            this._angle?.stop();
        }
        mark() {
            this.items().forEach((it, i) => {
                if (i === this._i)
                    it.setAttribute('aria-current', 'true');
                else
                    it.removeAttribute('aria-current');
            });
        }
        goTo(i) {
            const n = this.items().length;
            if (!n || !this._angle)
                return;
            const step = 360 / n;
            // shortest rotation from the current target
            const cur = this._angle.target;
            const curIdx = Math.round(cur / step);
            let delta = (((i - curIdx) % n) + n) % n;
            if (delta > n / 2)
                delta -= n;
            this._i = ((i % n) + n) % n;
            this._angle.set((curIdx + delta) * step);
            if (this.reduced)
                this.render(this._angle.value);
            this.mark();
            this.emit('change', { index: this._i });
        }
        next() {
            this.goTo(this._i + 1);
        }
        prev() {
            this.goTo(this._i - 1);
        }
    }, { id: 'carousel-3d', text: css$v });
}

/**
 * motionary/components/cards — card effects (v2.4).
 * `<usa-card effect="flip | holo | glass | border-glow | conic-border | lift |
 * spotlight | sheen | parallax-layers | expand">` (combinable),
 * `<usa-card-stack>` (swipeable deck), `<usa-sticky-stack>` (stacking on
 * scroll) and `<usa-carousel-3d>`.
 */
/** Register every component of this category under its default tag. */
function defineCardComponents() {
    defineCard();
    defineCardStack();
    defineStickyStack();
    defineCarousel3d();
}

/**
 * Click-effect helpers (v2.5): `burst()`, `confetti()`, `shake()`, `haptic()`.
 * Particles live in one fixed, pointer-transparent layer and are removed when
 * their animation ends. Under reduced motion particles are skipped and
 * `shake()` only flashes an outline.
 */
let layer = null;
function fxLayer() {
    if (layer && layer.isConnected)
        return layer;
    layer = document.createElement('div');
    layer.className = 'usa-fx-layer';
    layer.setAttribute('aria-hidden', 'true');
    layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483000;overflow:hidden;contain:strict';
    document.body.appendChild(layer);
    return layer;
}
const PALETTE = ['#7c5cff', '#22d3ee', '#f472b6', '#facc15', '#34d399', '#fb923c'];
const GLYPH = { star: '★', heart: '♥' };
function particle(x, y, size, color, shape) {
    const p = document.createElement('span');
    const glyph = GLYPH[shape] || (shape !== 'circle' && shape !== 'square' ? shape : '');
    p.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px;margin:${-size / 2}px 0 0 ${-size / 2}px;will-change:transform,opacity;` +
        (glyph ? `font-size:${size * 2}px;line-height:${size}px;text-align:center;color:${color}` : `background:${color};border-radius:${shape === 'square' ? '2px' : '50%'}`);
    if (glyph)
        p.textContent = glyph;
    fxLayer().appendChild(p);
    return p;
}
const done = (a, el) => {
    if (a)
        a.onfinish = () => el.remove();
    else
        el.remove();
};
/** Particles radiating from client point (x, y). Returns the number spawned. */
function burst(x, y, options = {}) {
    if (typeof document === 'undefined' || prefersReducedMotion())
        return 0;
    const { count = 12, colors = PALETTE, distance = 48, size = 6, shape = 'circle', duration = 600 } = options;
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
        const d = distance * (0.7 + Math.random() * 0.5);
        const p = particle(x, y, size, colors[i % colors.length], shape);
        const a = typeof p.animate === 'function'
            ? p.animate([
                { transform: 'translate(0,0) scale(1)', opacity: 1 },
                { transform: `translate(${Math.cos(angle) * d}px, ${Math.sin(angle) * d}px) scale(0.2)`, opacity: 0 },
            ], { duration: duration * (0.8 + Math.random() * 0.4), easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' })
            : null;
        done(a, p);
    }
    return count;
}
/** A confetti cannon (paper pieces with gravity, drift and spin). */
function confetti(options = {}) {
    if (typeof document === 'undefined' || prefersReducedMotion())
        return 0;
    const W = window.innerWidth || 800;
    const H = window.innerHeight || 600;
    const { x = W / 2, y = H * 0.66, count = 80, spread = 70, velocity = 1, colors = PALETTE, duration = 1600 } = options;
    for (let i = 0; i < count; i++) {
        const angle = ((-90 + (Math.random() - 0.5) * spread) * Math.PI) / 180;
        const speed = (260 + Math.random() * 320) * velocity;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        const p = particle(x, y, 6 + Math.random() * 5, colors[i % colors.length], Math.random() > 0.5 ? 'square' : 'circle');
        p.style.height = `${4 + Math.random() * 3}px`;
        const frames = [];
        const steps = 8;
        const T = duration / 1000;
        const spin = (Math.random() - 0.5) * 1440;
        for (let s = 0; s <= steps; s++) {
            const t = (s / steps) * T;
            const g = 900;
            frames.push({
                transform: `translate(${(vx * t * 0.8).toFixed(1)}px, ${(vy * t + 0.5 * g * t * t).toFixed(1)}px) rotate(${((spin * s) / steps).toFixed(0)}deg) rotateX(${s * 120}deg)`,
                opacity: s === steps ? 0 : 1,
            });
        }
        const a = typeof p.animate === 'function' ? p.animate(frames, { duration: duration * (0.85 + Math.random() * 0.3), easing: 'linear', fill: 'forwards' }) : null;
        done(a, p);
    }
    return count;
}
/** Horizontal error shake (`intensity` px, default 8). Reduced motion: a red outline flash. */
function shake(el, intensity = 8, duration = 480) {
    const t = el;
    if (typeof t.animate !== 'function')
        return null;
    if (prefersReducedMotion())
        return t.animate([{ outline: '2px solid #e5484d' }, { outline: '2px solid transparent' }], { duration: 600 });
    const k = intensity;
    return t.animate([0, -k, k, -k * 0.75, k * 0.75, -k * 0.4, k * 0.4, 0].map((v) => ({ transform: `translateX(${v}px)` })), { duration, easing: 'ease-in-out' });
}
/** `navigator.vibrate()` where supported (Android Chrome, some WebViews). Returns whether it ran. */
function haptic(pattern = 10) {
    try {
        return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function' ? navigator.vibrate(pattern) : false;
    }
    catch {
        return false;
    }
}

var css$u = "";

const CLICK_EFFECTS = ['ripple', 'burst', 'confetti', 'squish', 'press-spring', 'shake'];
function defineClick(tag = 'usa-click') {
    return defineElement(tag, (Base) => class UsaClick extends Base {
        constructor() {
            super(...arguments);
            this._press = null;
        }
        static get observedAttributes() {
            return ['effect', 'disabled', 'trigger', 'color', 'count', 'shape', 'haptic'];
        }
        get effects() {
            return this.str('effect', 'ripple').split(/[\s,]+/).filter(Boolean);
        }
        mount() {
            this.listen(this, 'pointerdown', (e) => {
                if (this.flag('disabled') || (e.pointerType === 'mouse' && e.button !== 0))
                    return;
                this.down();
                if (this.effects.includes('ripple'))
                    this.ripple(e.clientX, e.clientY);
            });
            const up = () => this.up();
            this.listen(this, 'pointerup', up);
            this.listen(this, 'pointerleave', up);
            this.listen(this, 'pointercancel', up);
            this.listen(this, 'click', (e) => {
                if (this.flag('disabled'))
                    return;
                const kb = e.detail === 0;
                const r = this.getBoundingClientRect();
                const x = kb ? r.left + r.width / 2 : e.clientX;
                const y = kb ? r.top + r.height / 2 : e.clientY;
                if (kb && this.effects.includes('ripple'))
                    this.ripple(x, y);
                this.play(x, y);
                if (this.effects.includes('shake') && this.str('trigger') === 'click')
                    this.shake();
            });
            this.listen(this, 'keydown', (e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !e.repeat)
                    this.down();
            });
            this.listen(this, 'keyup', up);
            if (this.effects.includes('shake'))
                this.listen(this, 'invalid', () => this.shake(), { capture: true });
        }
        /** Particles + haptics at client (x, y) (default: centre). */
        play(x, y) {
            if (x === undefined || y === undefined) {
                const r = this.getBoundingClientRect();
                x = r.left + r.width / 2;
                y = r.top + r.height / 2;
            }
            const fx = this.effects;
            const colors = this.str('color') ? this.str('color').split(',') : undefined;
            if (fx.includes('burst'))
                burst(x, y, { count: this.num('count', 12), shape: this.str('shape', 'circle'), colors });
            if (fx.includes('confetti'))
                confetti({ x, y, count: this.num('count', 60), colors, spread: 90, velocity: 0.8 });
            if (this.hasAttribute('haptic'))
                haptic(this.num('haptic', 10));
            this.emit('click-effect', { x, y, effects: fx });
        }
        shake() {
            shake(this);
            if (this.hasAttribute('haptic'))
                haptic([30, 40, 30]);
        }
        ripple(x, y) {
            if (this.reduced)
                return;
            const r = this.getBoundingClientRect();
            const cx = x - r.left;
            const cy = y - r.top;
            const radius = Math.hypot(Math.max(cx, r.width - cx), Math.max(cy, r.height - cy));
            const wave = document.createElement('span');
            wave.className = 'usa-click-wave';
            wave.setAttribute('aria-hidden', 'true');
            wave.style.cssText = `width:${radius * 2}px;height:${radius * 2}px;left:${cx - radius}px;top:${cy - radius}px;--usa-wave:${this.str('color', 'currentColor').split(',')[0]}`;
            this.append(wave);
            const a = this.motion(wave, [{ transform: 'scale(0)', opacity: 0.35 }, { transform: 'scale(1)', opacity: 0.25, offset: 0.6 }, { transform: 'scale(1.05)', opacity: 0 }], {
                duration: 650,
                easing: EASE_OUT,
                fill: 'forwards',
            });
            if (a)
                a.onfinish = () => wave.remove();
            else
                wave.remove();
        }
        down() {
            if (this.hasAttribute('data-pressed'))
                return;
            const fx = this.effects;
            if (!fx.includes('squish') && !fx.includes('press-spring'))
                return;
            this.setAttribute('data-pressed', '');
            this._press?.cancel();
            const to = this.reduced ? { opacity: 0.75 } : fx.includes('squish') ? { transform: 'scale(1.08, 0.86)' } : { transform: 'scale(0.94)' };
            const from = this.reduced ? { opacity: 1 } : { transform: 'none' };
            this._press = this.motion(this, [from, to], {
                duration: 110,
                easing: 'ease-out',
                fill: 'forwards',
            });
        }
        up() {
            if (!this.hasAttribute('data-pressed'))
                return;
            this.removeAttribute('data-pressed');
            const fx = this.effects;
            this._press?.cancel();
            if (this.reduced) {
                this._press = this.motion(this, [{ opacity: 0.75 }, { opacity: 1 }], { duration: 150 });
                return;
            }
            const from = fx.includes('squish') ? 'scale(1.08, 0.86)' : 'scale(0.94)';
            const frames = fx.includes('squish')
                ? [{ transform: from }, { transform: 'scale(0.92, 1.1)', offset: 0.3 }, { transform: 'scale(1.03, 0.97)', offset: 0.6 }, { transform: 'none' }]
                : [{ transform: from }, { transform: 'none' }];
            this._press = this.motion(this, frames, fx.includes('squish') ? { duration: 520, easing: 'ease-out' } : springEasing('bouncy'));
        }
    }, { id: 'click', text: css$u });
}

var css$t = "";

const BUTTON_DEFORMS = ['squash', 'wobble', 'gooey', 'dent'];
let gooInjected = false;
function injectGoo() {
    if (gooInjected || typeof document === 'undefined')
        return;
    gooInjected = true;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.style.position = 'absolute';
    svg.innerHTML = '<filter id="usa-goo"><feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b"/><feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" result="g"/><feComposite in="SourceGraphic" in2="g" operator="atop"/></filter>';
    document.body.appendChild(svg);
}
function defineButton(tag = 'usa-button') {
    return defineElement(tag, (Base) => class UsaButton extends Base {
        constructor() {
            super(...arguments);
            this._press = null;
            this._status = null;
            this._shapeBefore = null;
        }
        static get observedAttributes() {
            return ['deform', 'state', 'shape', 'disabled', 'morph', 'haptic', 'reset'];
        }
        get target() {
            return this.querySelector(':scope > button, :scope > a, :scope > [role="button"]') || this;
        }
        deforms() {
            return this.str('deform').split(/[\s,]+/).filter(Boolean);
        }
        get shape() {
            return this.str('shape', 'pill') || 'pill';
        }
        set shape(v) {
            this.morphTo(v);
        }
        get state() {
            return this.str('state', 'idle') || 'idle';
        }
        set state(v) {
            this.setAttribute('state', v);
        }
        mount() {
            const t = this.target;
            if (t === this) {
                this.setAttribute('role', 'button');
                if (!this.hasAttribute('tabindex'))
                    this.tabIndex = 0;
            }
            t.classList.add('usa-button-face');
            if (this.str('morph') === 'submit' && !t.querySelector('.usa-button-status')) {
                const s = document.createElement('span');
                s.className = 'usa-button-status';
                s.setAttribute('aria-hidden', 'true');
                s.innerHTML =
                    '<svg class="usa-button-spin" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" pathLength="100"/></svg>' +
                        '<svg class="usa-button-ok" viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7" pathLength="1"/></svg>' +
                        '<svg class="usa-button-err" viewBox="0 0 24 24"><path d="M7 7l10 10M17 7L7 17" pathLength="1"/></svg>';
                t.append(s);
                const live = document.createElement('span');
                live.className = 'usa-sr';
                live.setAttribute('role', 'status');
                this.append(live);
                this._status = live;
            }
            if (this.deforms().includes('gooey'))
                injectGoo();
            this.applyState();
            this.listen(t, 'pointerdown', (e) => {
                if (this.isOff() || (e.pointerType === 'mouse' && e.button !== 0))
                    return;
                this.down(e.clientX, e.clientY);
            });
            for (const ev of ['pointerup', 'pointerleave', 'pointercancel'])
                this.listen(t, ev, () => this.up());
            this.listen(t, 'keydown', (e) => (e.key === 'Enter' || e.key === ' ') && !e.repeat && this.down());
            this.listen(t, 'keyup', () => this.up());
            this.listen(t, 'click', (e) => {
                if (this.isOff()) {
                    if (this.state === 'loading')
                        e.preventDefault();
                    return;
                }
                if (this.deforms().includes('wobble'))
                    this.wobble();
                if (this.hasAttribute('haptic'))
                    haptic(this.num('haptic', 10));
                if (this.str('morph') === 'submit' && this.state === 'idle')
                    this.submit();
            });
            if (t === this)
                this.listen(this, 'keydown', (e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) {
                        e.preventDefault();
                        this.click();
                    }
                });
        }
        unmount() {
            clearTimeout(this._timer);
            this._press?.cancel();
        }
        changed(name) {
            if (name === 'state')
                this.applyState();
            else if (name === 'shape')
                this.target.setAttribute('data-shape', this.shape);
            else {
                super.changed(name);
            }
        }
        isOff() {
            return this.flag('disabled') || this.state === 'loading';
        }
        /* ------------------------------------------------ press deformations */
        down(x, y) {
            if (this.reduced || this.hasAttribute('data-pressed'))
                return;
            const d = this.deforms();
            if (!d.length)
                return;
            this.setAttribute('data-pressed', '');
            const t = this.target;
            const r = t.getBoundingClientRect();
            const px = x === undefined ? 0.5 : clamp((x - r.left) / (r.width || 1), 0, 1);
            const py = y === undefined ? 0.5 : clamp((y - r.top) / (r.height || 1), 0, 1);
            t.style.setProperty('--usa-dent-x', `${(px * 100).toFixed(1)}%`);
            t.style.setProperty('--usa-dent-y', `${(py * 100).toFixed(1)}%`);
            const parts = [];
            if (d.includes('dent'))
                parts.push(`perspective(600px) rotateX(${((0.5 - py) * -14).toFixed(2)}deg) rotateY(${((px - 0.5) * 14).toFixed(2)}deg) scale(0.97)`);
            if (d.includes('squash'))
                parts.push('scale(1.12, 0.84)');
            if (d.includes('gooey')) {
                parts.push('scale(0.96)');
                this.goo(px, py);
            }
            if (!parts.length)
                return;
            this._press?.cancel();
            this._press = this.motion(t, [{ transform: 'none' }, { transform: parts.join(' ') }], { duration: 110, easing: 'ease-out', fill: 'forwards' });
        }
        up() {
            if (!this.hasAttribute('data-pressed'))
                return;
            this.removeAttribute('data-pressed');
            const t = this.target;
            const a = this._press;
            const from = a?.effect?.getKeyframes?.().slice(-1)[0]?.transform;
            a?.cancel();
            if (!from)
                return;
            this._press = this.motion(t, [{ transform: from }, { transform: 'none' }], { ...springEasing(this.deforms().includes('squash') ? 'bouncy' : 'wobbly') });
        }
        wobble() {
            if (this.reduced)
                return;
            const t = this.target;
            const r = getComputedStyle(t).borderRadius || '12px';
            this.motion(t, [
                { borderRadius: r },
                { borderRadius: '42% 58% 50% 50% / 60% 45% 55% 40%', offset: 0.2 },
                { borderRadius: '58% 42% 45% 55% / 40% 60% 40% 60%', offset: 0.45 },
                { borderRadius: '48% 52% 52% 48% / 52% 48% 52% 48%', offset: 0.7 },
                { borderRadius: r },
            ], { duration: 700, easing: 'ease-out' });
        }
        goo(px, py) {
            const t = this.target;
            const layer = document.createElement('span');
            layer.className = 'usa-button-goo';
            layer.setAttribute('aria-hidden', 'true');
            layer.style.setProperty('--usa-goo-bg', getComputedStyle(t).backgroundColor || 'currentColor');
            const drops = [];
            for (let i = 0; i < 4; i++) {
                const d = document.createElement('i');
                d.style.left = `${(px * 100).toFixed(1)}%`;
                d.style.top = `${(py * 100).toFixed(1)}%`;
                layer.append(d);
                drops.push(d);
            }
            this.prepend(layer);
            let left = drops.length;
            drops.forEach((d, i) => {
                const ang = (i / drops.length) * Math.PI * 2 + 0.6;
                const dist = 26 + (i % 2) * 12;
                const a = this.motion(d, [
                    { transform: 'translate(-50%, -50%) scale(0.4)' },
                    { transform: `translate(calc(-50% + ${(Math.cos(ang) * dist).toFixed(1)}px), calc(-50% + ${(Math.sin(ang) * dist).toFixed(1)}px)) scale(1)`, offset: 0.45 },
                    { transform: 'translate(-50%, -50%) scale(0.2)' },
                ], { duration: 700, easing: 'cubic-bezier(0.34, 1.3, 0.64, 1)', fill: 'forwards' });
                const end = () => --left === 0 && layer.remove();
                if (a)
                    a.onfinish = end;
                else
                    end();
            });
        }
        /* ------------------------------------------------ shape morph */
        async morphTo(shape) {
            const t = this.target;
            const before = t.getBoundingClientRect();
            this.setAttribute('shape', shape);
            t.setAttribute('data-shape', shape);
            if (this.reduced)
                return;
            const after = t.getBoundingClientRect();
            if (!before.width || !after.width || Math.abs(before.width - after.width) < 0.5)
                return;
            const a = this.motion(t, [{ width: `${before.width}px` }, { width: `${after.width}px` }], springEasing('stiff'));
            await a?.finished.catch(() => undefined);
        }
        /* ------------------------------------------------ submit morph */
        submit() {
            let settled = false;
            const done = (ok = true) => {
                if (settled)
                    return;
                settled = true;
                this.state = ok ? 'success' : 'error';
            };
            this.state = 'loading';
            this.emit('submit', { done });
        }
        applyState() {
            if (this.str('morph') !== 'submit')
                return;
            const t = this.target;
            const s = this.state;
            clearTimeout(this._timer);
            t.setAttribute('data-state', s);
            if (s === 'loading') {
                if (this._shapeBefore === null)
                    this._shapeBefore = this.shape;
                t.setAttribute('aria-busy', 'true');
                this.morphTo('circle');
            }
            else {
                t.removeAttribute('aria-busy');
            }
            if (s === 'error') {
                shake(t);
                if (this.hasAttribute('haptic'))
                    haptic([30, 40, 30]);
            }
            if (s === 'success' && !this.reduced) {
                const ok = t.querySelector('.usa-button-ok');
                if (ok)
                    this.motion(ok, [{ transform: 'scale(0.4)' }, { transform: 'scale(1)' }], springEasing('bouncy'));
            }
            if (this._status)
                this._status.textContent = s === 'loading' ? 'Loading…' : s === 'success' ? 'Done' : s === 'error' ? 'Failed' : '';
            if (s === 'success' || s === 'error') {
                this._timer = setTimeout(() => {
                    this.state = 'idle';
                }, this.num('reset', 1800));
            }
            if (s === 'idle' && this._shapeBefore !== null) {
                const back = this._shapeBefore;
                this._shapeBefore = null;
                this.morphTo(back);
            }
            this.emit('state', { state: s });
        }
    }, { id: 'button', text: css$t });
}

var css$s = "";

const C = [[12, 12], [12, 12], [12, 12], [12, 12]];
/**
 * Morphable icons: every icon is three quads (four points each) on a 24×24
 * grid, so any icon can morph into any other by interpolating points.
 */
const MORPH_ICONS = {
    play: [[[7, 5], [12.5, 8.25], [12.5, 15.75], [7, 19]], [[12.5, 8.25], [19, 12], [19, 12], [12.5, 15.75]], C],
    pause: [[[6, 5], [10, 5], [10, 19], [6, 19]], [[14, 5], [18, 5], [18, 19], [14, 19]], C],
    menu: [[[4, 6], [20, 6], [20, 8], [4, 8]], [[4, 11], [20, 11], [20, 13], [4, 13]], [[4, 16], [20, 16], [20, 18], [4, 18]]],
    close: [[[5.2, 6.6], [6.6, 5.2], [18.8, 17.4], [17.4, 18.8]], C, [[17.4, 5.2], [18.8, 6.6], [6.6, 18.8], [5.2, 17.4]]],
    plus: [[[11, 4], [13, 4], [13, 20], [11, 20]], [[4, 11], [20, 11], [20, 13], [4, 13]], C],
    minus: [[[4, 11], [20, 11], [20, 13], [4, 13]], [[4, 11], [20, 11], [20, 13], [4, 13]], C],
    check: [[[4.3, 12.7], [5.7, 11.3], [10.4, 16], [9, 17.4]], [[9, 17.4], [7.6, 16], [18.3, 5.3], [19.7, 6.7]], C],
    'arrow-right': [[[4, 11], [17, 11], [17, 13], [4, 13]], [[12.6, 6.4], [14, 5], [21, 12], [19.6, 13.4]], [[19.6, 10.6], [21, 12], [14, 19], [12.6, 17.6]]],
};
/** SVG path data for an icon, or for the interpolation `t` (0–1) between two. */
function morphPath(from, to = from, t = 0) {
    const a = MORPH_ICONS[from] || MORPH_ICONS.menu;
    const b = MORPH_ICONS[to] || a;
    return a
        .map((q, i) => {
        const pts = q.map((p, j) => {
            const r = b[i][j];
            return `${(p[0] + (r[0] - p[0]) * t).toFixed(2)} ${(p[1] + (r[1] - p[1]) * t).toFixed(2)}`;
        });
        return `M${pts.join('L')}Z`;
    })
        .join('');
}
function defineIconMorph(tag = 'usa-icon-morph') {
    return defineElement(tag, (Base) => class UsaIconMorph extends Base {
        constructor() {
            super(...arguments);
            this._i = 0;
            this._from = 'play';
            this._to = 'play';
        }
        static get observedAttributes() {
            return ['icons', 'size', 'toggle', 'index', 'preset', 'labels'];
        }
        list() {
            return this.str('icons', 'play,pause').split(',').map((s) => s.trim()).filter((s) => MORPH_ICONS[s]);
        }
        get index() {
            return this._i;
        }
        set index(v) {
            this.show(v);
        }
        get icon() {
            return this.list()[this._i] || 'play';
        }
        draw(t) {
            this.querySelector('path')?.setAttribute('d', morphPath(this._from, this._to, t));
        }
        mount() {
            const size = this.num('size', 24);
            this.innerHTML = `<svg viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true" focusable="false"><path/></svg>`;
            this._i = Math.max(0, Math.min(this.list().length - 1, this.num('index', 0)));
            this._from = this._to = this.icon;
            this._t = createSpring({ value: 1, spring: this.str('preset', 'wobbly'), onUpdate: (v) => this.draw(v) });
            this.draw(1);
            if (this.flag('toggle')) {
                this.setAttribute('role', 'button');
                if (!this.hasAttribute('tabindex'))
                    this.tabIndex = 0;
                this.listen(this, 'click', () => this.next());
                this.listen(this, 'keydown', (e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) {
                        e.preventDefault();
                        this.next();
                    }
                });
            }
            this.label();
        }
        unmount() {
            this._t?.stop();
        }
        label() {
            const labels = this.str('labels').split(',').map((s) => s.trim());
            const l = labels[this._i];
            if (l)
                this.setAttribute('aria-label', l);
            if (!this.flag('toggle') && !l)
                this.setAttribute('aria-hidden', 'true');
        }
        show(icon) {
            const list = this.list();
            const i = typeof icon === 'number' ? ((icon % list.length) + list.length) % list.length : list.indexOf(icon);
            if (i < 0 || !this._t)
                return;
            const name = list[i];
            // morph from wherever we are now (interruptible)
            const cur = this._t.value;
            this._from = cur >= 0.5 ? this._to : this._from;
            this._to = name;
            this._i = i;
            this._t.jump(0);
            this._t.set(1);
            this.label();
            this.emit('change', { index: i, icon: name });
        }
        next() {
            this.show(this._i + 1);
        }
    }, { id: 'icon-morph', text: css$s });
}

var css$r = "";

const HEART = 'M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.2 5.3 3.2 1.7-2 3.2-3.2 5.3-3.2 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z';
function defineLike(tag = 'usa-like') {
    return defineElement(tag, (Base) => class UsaLike extends Base {
        static get observedAttributes() {
            return ['liked', 'count', 'label', 'disabled', 'size', 'color', 'haptic'];
        }
        get liked() {
            return this.flag('liked');
        }
        set liked(v) {
            this.setFlag('liked', v);
        }
        get count() {
            return this.hasAttribute('count') ? this.num('count', 0) : null;
        }
        set count(v) {
            if (v === null)
                this.removeAttribute('count');
            else
                this.setAttribute('count', String(v));
        }
        mount() {
            if (!this.querySelector(':scope > .usa-like-heart')) {
                const size = this.num('size', 24);
                this.insertAdjacentHTML('afterbegin', `<svg class="usa-like-heart" viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true"><path d="${HEART}"/></svg><span class="usa-like-count" aria-hidden="true"></span>`);
            }
            if (this.str('color'))
                this.style.setProperty('--usa-like-color', this.str('color'));
            this.setAttribute('role', 'button');
            if (!this.hasAttribute('tabindex'))
                this.tabIndex = 0;
            this.sync();
            this.listen(this, 'click', () => this.toggle());
            this.listen(this, 'keydown', (e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) {
                    e.preventDefault();
                    this.toggle();
                }
            });
        }
        changed() {
            this.sync();
        }
        sync() {
            const c = this.count;
            const label = this.str('label', 'Like');
            this.setAttribute('aria-pressed', String(this.liked));
            this.setAttribute('aria-label', c === null ? label : `${label} (${c})`);
            this.toggleAttribute('aria-disabled', this.flag('disabled'));
            const out = this.querySelector('.usa-like-count');
            if (out)
                out.textContent = c === null ? '' : new Intl.NumberFormat().format(c);
        }
        toggle(force) {
            if (this.flag('disabled'))
                return;
            const next = force === undefined ? !this.liked : force;
            if (next === this.liked)
                return;
            this.liked = next;
            if (this.count !== null)
                this.count = Math.max(0, this.count + (next ? 1 : -1));
            this.sync();
            const heart = this.querySelector('.usa-like-heart');
            if (next && heart && !this.reduced) {
                this.motion(heart, [{ transform: 'scale(0.4)' }, { transform: 'scale(1)' }], springEasing('bouncy'));
                const r = heart.getBoundingClientRect();
                burst(r.left + r.width / 2, r.top + r.height / 2, { count: 10, distance: 28, size: 5, colors: [getComputedStyle(this).getPropertyValue('--usa-like-color').trim() || '#f43f5e', '#fb923c', '#facc15'] });
            }
            if (this.hasAttribute('haptic'))
                haptic(this.num('haptic', 12));
            this.dispatchEvent(new Event('change', { bubbles: true }));
            this.emit('change', { liked: next, count: this.count });
        }
    }, { id: 'like', text: css$r });
}

var css$q = "";

function defineHold(tag = 'usa-hold') {
    return defineElement(tag, (Base) => class UsaHold extends Base {
        constructor() {
            super(...arguments);
            this._p = 0;
            this._frame = 0;
            this._holding = false;
        }
        static get observedAttributes() {
            return ['duration', 'disabled', 'color', 'label'];
        }
        get progress() {
            return this._p;
        }
        set(p) {
            this._p = p;
            this.style.setProperty('--usa-hold', p.toFixed(4));
            const c = this.querySelector('.usa-hold-ring circle:last-child');
            if (c)
                c.style.strokeDashoffset = String(100 - p * 100);
        }
        mount() {
            if (!this.querySelector(':scope > .usa-hold-ring')) {
                this.insertAdjacentHTML('beforeend', '<svg class="usa-hold-ring" viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="15.9" pathLength="100"/><circle cx="18" cy="18" r="15.9" pathLength="100"/></svg>');
            }
            if (this.str('color'))
                this.style.setProperty('--usa-hold-color', this.str('color'));
            this.setAttribute('role', 'button');
            if (!this.hasAttribute('tabindex'))
                this.tabIndex = 0;
            if (this.str('label'))
                this.setAttribute('aria-label', this.str('label'));
            this.setAttribute('aria-description', 'Press and hold to confirm');
            this.set(0);
            this.listen(this, 'pointerdown', (e) => (e.pointerType !== 'mouse' || e.button === 0) && this.start());
            for (const t of ['pointerup', 'pointerleave', 'pointercancel'])
                this.listen(this, t, () => this.stop());
            this.listen(this, 'keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (!e.repeat)
                        this.start();
                }
            });
            this.listen(this, 'keyup', (e) => (e.key === 'Enter' || e.key === ' ') && this.stop());
            this.listen(this, 'contextmenu', (e) => this._holding && e.preventDefault());
        }
        unmount() {
            caf(this._frame);
            this._holding = false;
        }
        start() {
            if (this.flag('disabled') || this._holding)
                return;
            this._holding = true;
            this.setAttribute('data-holding', '');
            const dur = Math.max(100, this.num('duration', 1200));
            let last = now();
            const tick = () => {
                const t = now();
                const p = Math.min(1, this._p + (t - last) / dur);
                last = t;
                this.set(p);
                this.emit('progress', { progress: p });
                if (p >= 1) {
                    this._holding = false;
                    this.removeAttribute('data-holding');
                    this.setAttribute('data-done', '');
                    if (this.hasAttribute('haptic'))
                        haptic(20);
                    this.emit('confirm');
                    setTimeout(() => {
                        this.removeAttribute('data-done');
                        this.rewind();
                    }, 700);
                    return;
                }
                // contract-exempt: reduced-motion — the fill follows the press and is the feedback itself
                this._frame = raf(tick);
            };
            this._frame = raf(tick);
        }
        stop() {
            if (!this._holding)
                return;
            this._holding = false;
            caf(this._frame);
            this.removeAttribute('data-holding');
            if (this._p < 1) {
                this.emit('cancel', { progress: this._p });
                this.rewind();
            }
        }
        rewind() {
            let last = now();
            const back = () => {
                if (this._holding)
                    return;
                const t = now();
                const p = Math.max(0, this._p - (t - last) / 250);
                last = t;
                this.set(p);
                if (p > 0)
                    this._frame = raf(back);
            };
            this._frame = raf(back);
        }
        cancel() {
            this.stop();
        }
    }, { id: 'hold', text: css$q });
}

var css$p = "";

function defineDoubleTap(tag = 'usa-double-tap') {
    return defineElement(tag, (Base) => class UsaDoubleTap extends Base {
        static get observedAttributes() {
            return ['disabled', 'delay', 'icon', 'color'];
        }
        mount() {
            let last = 0;
            let lx = 0;
            let ly = 0;
            this.listen(this, 'pointerup', (e) => {
                if (this.flag('disabled'))
                    return;
                const t = e.timeStamp || Date.now();
                if (t - last < this.num('delay', 300) && Math.hypot(e.clientX - lx, e.clientY - ly) < 40) {
                    last = 0;
                    this.pop(e.clientX, e.clientY);
                }
                else {
                    last = t;
                    lx = e.clientX;
                    ly = e.clientY;
                }
            });
            this.listen(this, 'dblclick', (e) => e.preventDefault());
            this.listen(this, 'keydown', (e) => e.key.toLowerCase() === 'l' && !e.repeat && this.pop());
        }
        pop(x, y) {
            const r = this.getBoundingClientRect();
            if (x === undefined || y === undefined) {
                x = r.left + r.width / 2;
                y = r.top + r.height / 2;
            }
            const icon = document.createElement('span');
            icon.className = 'usa-double-tap-icon';
            icon.setAttribute('aria-hidden', 'true');
            icon.textContent = this.str('icon', '♥');
            icon.style.left = `${x - r.left}px`;
            icon.style.top = `${y - r.top}px`;
            if (this.str('color'))
                icon.style.color = this.str('color');
            this.append(icon);
            const frames = this.reduced
                ? [{ opacity: 0 }, { opacity: 1, offset: 0.3 }, { opacity: 0 }]
                : [
                    { opacity: 0, transform: 'translate(-50%, -50%) scale(0.2) rotate(-15deg)' },
                    { opacity: 1, transform: 'translate(-50%, -50%) scale(1.15) rotate(5deg)', offset: 0.3 },
                    { opacity: 1, transform: 'translate(-50%, -50%) scale(1) rotate(0deg)', offset: 0.6 },
                    { opacity: 0, transform: 'translate(-50%, -110%) scale(0.9)' },
                ];
            const a = this.motion(icon, frames, { duration: 900, easing: 'ease-out', fill: 'forwards' });
            if (a)
                a.onfinish = () => icon.remove();
            else
                icon.remove();
            burst(x, y, { count: 8, distance: 40, size: 5, colors: [this.str('color', '#f43f5e'), '#fb923c', '#facc15'] });
            if (this.hasAttribute('haptic'))
                haptic(15);
            this.emit('double-tap', { x: x - r.left, y: y - r.top });
        }
    }, { id: 'double-tap', text: css$p });
}

var css$o = "";

function defineCheckbox(tag = 'usa-checkbox') {
    return defineElement(tag, (Base) => {
        class UsaCheckbox extends Base {
            static get observedAttributes() {
                return ['checked', 'indeterminate', 'disabled', 'label', 'value'];
            }
            constructor() {
                super();
                this._internals = null;
                try {
                    this._internals = this.attachInternals?.() ?? null;
                }
                catch {
                    this._internals = null;
                }
            }
            get checked() {
                return this.flag('checked');
            }
            set checked(v) {
                this.setFlag('checked', v);
            }
            get indeterminate() {
                return this.flag('indeterminate');
            }
            set indeterminate(v) {
                this.setFlag('indeterminate', v);
            }
            mount() {
                if (!this.querySelector(':scope > .usa-checkbox-box')) {
                    this.insertAdjacentHTML('afterbegin', '<span class="usa-checkbox-box" aria-hidden="true"><svg viewBox="0 0 24 24"><path class="usa-checkbox-check" d="M5 12.5l4.2 4.2L19 7" pathLength="1"/><path class="usa-checkbox-dash" d="M6 12h12" pathLength="1"/></svg></span>');
                }
                this.setAttribute('role', 'checkbox');
                if (!this.hasAttribute('tabindex'))
                    this.tabIndex = 0;
                this.sync();
                this.listen(this, 'click', () => this.toggle());
                this.listen(this, 'keydown', (e) => {
                    if (e.key === ' ' && !e.repeat) {
                        e.preventDefault();
                        this.toggle();
                    }
                });
            }
            changed() {
                this.sync();
            }
            sync() {
                this.setAttribute('aria-checked', this.indeterminate ? 'mixed' : String(this.checked));
                if (this.str('label'))
                    this.setAttribute('aria-label', this.str('label'));
                this.toggleAttribute('aria-disabled', this.flag('disabled'));
                this._internals?.setFormValue?.(this.checked ? this.str('value', 'on') : null);
            }
            toggle(force) {
                if (this.flag('disabled'))
                    return;
                const next = force === undefined ? !this.checked || this.indeterminate : force;
                this.indeterminate = false;
                this.checked = next;
                this.sync();
                const box = this.querySelector('.usa-checkbox-box');
                if (box && !this.reduced)
                    this.motion(box, [{ transform: 'scale(0.75)' }, { transform: 'scale(1)' }], springEasing('bouncy'));
                this.dispatchEvent(new Event('change', { bubbles: true }));
                this.emit('change', { checked: next });
            }
        }
        UsaCheckbox.formAssociated = true;
        return UsaCheckbox;
    }, { id: 'checkbox', text: css$o });
}

/**
 * motionary/components/click — click & tap effects (v2.5).
 * `<usa-click>` (ripple, burst, confetti, squish, press-spring, shake),
 * `<usa-button>` (button click deformation: squash, wobble, gooey, dent;
 * shape morph; submit → loading → success), `<usa-icon-morph>`,
 * `<usa-like>`, `<usa-hold>`, `<usa-double-tap>`, `<usa-checkbox>`, plus
 * `haptic()`. 6.0: `burst()`, `confetti()` and `shake()` were removed — play
 * the registered effects instead: `playEffect(el, 'burst' | 'confetti' | 'shake')`.
 */
/** Register every component of this category under its default tag. */
function defineClickComponents() {
    defineClick();
    defineButton();
    defineIconMorph();
    defineLike();
    defineHold();
    defineDoubleTap();
    defineCheckbox();
}

/** Position a fixed `floating` element next to `anchor`, flipping when it would leave the viewport. */
function place(floating, anchor, placement = 'top', gap = 8) {
    const a = anchor.getBoundingClientRect();
    const f = floating.getBoundingClientRect();
    const W = window.innerWidth || 1024;
    const H = window.innerHeight || 768;
    const fits = {
        top: a.top - f.height - gap >= 0,
        bottom: a.bottom + f.height + gap <= H,
        left: a.left - f.width - gap >= 0,
        right: a.right + f.width + gap <= W,
    };
    const opposite = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
    const p = fits[placement] || !fits[opposite[placement]] ? placement : opposite[placement];
    let x = 0;
    let y = 0;
    if (p === 'top' || p === 'bottom') {
        x = Math.min(Math.max(4, a.left + a.width / 2 - f.width / 2), W - f.width - 4);
        y = p === 'top' ? a.top - f.height - gap : a.bottom + gap;
    }
    else {
        y = Math.min(Math.max(4, a.top + a.height / 2 - f.height / 2), H - f.height - 4);
        x = p === 'left' ? a.left - f.width - gap : a.right + gap;
    }
    floating.style.left = `${Math.round(x)}px`;
    floating.style.top = `${Math.round(y)}px`;
    floating.setAttribute('data-placement', p);
    return p;
}
let uid = 0;
const nextId = (prefix) => `${prefix}-${++uid}`;

var css$n = "";

function defineTabs(tag = 'usa-tabs') {
    // contract-exempt: attr-unobserved(selected) — state reflected by the element itself (set the property instead); observing it would re-mount on every change
    adoptVariants();
    return defineElement(tag, (Base) => class UsaTabs extends Base {
        constructor() {
            super(...arguments);
            this._i = 0;
            this._bar = null;
        }
        static get observedAttributes() {
            return ['indicator'];
        }
        get selected() {
            return this._i;
        }
        set selected(v) {
            this.select(v);
        }
        tabs() {
            return Array.from(this.querySelectorAll('[data-tab]')).filter((t) => t.closest(this.localName) === this);
        }
        panels() {
            return Array.from(this.querySelectorAll('[data-panel]')).filter((t) => t.closest(this.localName) === this);
        }
        mount() {
            const tabs = this.tabs();
            const panels = this.panels();
            const list = tabs[0]?.parentElement;
            if (!list)
                return;
            list.setAttribute('role', 'tablist');
            list.classList.add('usa-tabs-list');
            if (!list.querySelector(':scope > .usa-tabs-indicator')) {
                this._bar = document.createElement('span');
                this._bar.className = 'usa-tabs-indicator';
                this._bar.setAttribute('aria-hidden', 'true');
                list.append(this._bar);
            }
            else
                this._bar = list.querySelector(':scope > .usa-tabs-indicator');
            tabs.forEach((t, i) => {
                t.id || (t.id = nextId('usa-tab'));
                t.setAttribute('role', 'tab');
                const p = panels[i];
                if (p) {
                    p.id || (p.id = nextId('usa-panel'));
                    p.setAttribute('role', 'tabpanel');
                    p.setAttribute('aria-labelledby', t.id);
                    t.setAttribute('aria-controls', p.id);
                    if (!p.hasAttribute('tabindex'))
                        p.tabIndex = 0;
                }
                this.listen(t, 'click', () => this.select(i));
            });
            this.listen(list, 'keydown', (e) => {
                const n = tabs.length;
                const map = { ArrowRight: this._i + 1, ArrowDown: this._i + 1, ArrowLeft: this._i - 1, ArrowUp: this._i - 1, Home: 0, End: n - 1 };
                if (!(e.key in map))
                    return;
                e.preventDefault();
                this.select((map[e.key] + n) % n, true);
            });
            const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => this.moveBar(false)) : null;
            ro?.observe(list);
            this.onCleanup(() => ro?.disconnect());
            this.select(Math.max(0, Math.min(tabs.length - 1, this.num('selected', 0))), false, true);
        }
        moveBar(animate) {
            const t = this.tabs()[this._i];
            const bar = this._bar;
            if (!t || !bar)
                return;
            const from = bar.style.transform;
            const fromW = bar.style.width;
            bar.style.width = `${t.offsetWidth}px`;
            bar.style.transform = `translateX(${t.offsetLeft}px)`;
            if (animate && from && !this.reduced)
                this.motion(bar, [{ transform: from, width: fromW }, { transform: bar.style.transform, width: bar.style.width }], springEasing('stiff'));
        }
        select(i, focus = false, initial = false) {
            const tabs = this.tabs();
            const panels = this.panels();
            if (!tabs[i])
                return;
            const prev = this._i;
            this._i = i;
            this.setAttribute('selected', String(i));
            tabs.forEach((t, j) => {
                t.setAttribute('aria-selected', String(j === i));
                t.tabIndex = j === i ? 0 : -1;
            });
            panels.forEach((p, j) => (p.hidden = j !== i));
            if (focus)
                tabs[i].focus();
            this.moveBar(!initial);
            if (initial || prev === i)
                return;
            const p = panels[i];
            if (p && !this.reduced)
                this.motion(p, [{ opacity: 0, transform: `translateX(${i > prev ? 16 : -16}px)` }, { opacity: 1, transform: 'none' }], { duration: 280, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
            this.emit('change', { index: i });
        }
    }, { id: 'tabs', text: css$n });
}

var css$m = "";

/** Shared machinery of `<usa-drawer>` and `<usa-bottom-sheet>`: backdrop, focus, Esc, drag-to-dismiss. */
function makePanel(Base, kind) {
    return class UsaPanel extends Base {
        constructor() {
            super(...arguments);
            this._backdrop = null;
            this._return = null;
            this._drag = null;
        }
        static get observedAttributes() {
            return ['open', 'side'];
        }
        get open() {
            return this.flag('open');
        }
        set open(v) {
            this.setFlag('open', v);
        }
        /** Main axis size of the panel (px). */
        size() {
            const r = this.getBoundingClientRect();
            return (kind === 'sheet' || this.vertical() ? r.height : r.width) || (kind === 'sheet' ? window.innerHeight * 0.9 : 320);
        }
        vertical() {
            return kind === 'sheet' || this.str('side') === 'top' || this.str('side') === 'bottom';
        }
        /** +1 when hiding moves the panel in the positive axis direction. */
        dir() {
            const side = kind === 'sheet' ? 'bottom' : this.str('side', 'left');
            return side === 'left' || side === 'top' ? -1 : 1;
        }
        /** Offsets (px from fully open) the panel may rest at; the largest closes it. */
        stops() {
            return [0];
        }
        render(v) {
            const axis = this.vertical() ? 'Y' : 'X';
            this.style.transform = `translate${axis}(${(v * this.dir()).toFixed(1)}px)`;
            if (this._backdrop)
                this._backdrop.style.opacity = String(clamp(1 - v / (this.size() || 1), 0, 1));
        }
        mount() {
            this.setAttribute('role', 'dialog');
            if (this.str('label'))
                this.setAttribute('aria-label', this.str('label'));
            if (!this.hasAttribute('tabindex'))
                this.tabIndex = -1;
            this.classList.add('usa-surface');
            this._pos = createSpring({ value: this.size() * 2, spring: 'stiff', onUpdate: (v) => this.render(v), onRest: (v) => v >= this.size() - 1 && !this.open && this.afterClose() });
            if (this.open)
                this.show(false);
            else {
                this.hidden = true;
                this._pos.jump(this.size() * 1.2);
            }
            this.listen(document, 'keydown', (e) => e.key === 'Escape' && this.open && this.close());
            // 13.1.0: aria-modal means modal — Tab / Shift+Tab wrap inside the open panel instead of reaching the page behind it
            this.listen(this, 'keydown', (e) => {
                if (e.key !== 'Tab' || !this.open)
                    return;
                const h = this;
                const f = Array.from(h.querySelectorAll(FOCUSABLE)).filter((x) => x.getClientRects().length);
                const a = f[0] || h, z = f[f.length - 1] || h, c = document.activeElement;
                if (e.shiftKey ? c === a || c === h : c === z) {
                    e.preventDefault();
                    (e.shiftKey ? z : a).focus();
                }
            });
            this.listen(this, 'click', (e) => e.target.closest?.('[data-close]') && this.close());
            this.listen(this, 'pointerdown', (e) => this.dragStart(e));
            this.listen(this, 'pointermove', (e) => this.dragMove(e));
            this.listen(this, 'pointerup', (e) => this.dragEnd(e));
            this.listen(this, 'pointercancel', (e) => this.dragEnd(e));
        }
        unmount() {
            this._pos?.stop();
            this._backdrop?.remove();
            this._backdrop = null;
        }
        changed(name) {
            if (name !== 'open')
                return super.changed(name);
            if (this.open && this.hidden)
                this.show(true);
            else if (!this.open && !this.hidden)
                this.hide();
        }
        show(animate = true) {
            this._return = document.activeElement;
            this.hidden = false;
            this.setAttribute('aria-modal', 'true');
            if (!this._backdrop) {
                this._backdrop = document.createElement('div');
                this._backdrop.className = 'usa-panel-backdrop';
                this._backdrop.addEventListener('click', () => this.close());
                this.before(this._backdrop);
            }
            const target = this.stops()[this.initialStop()];
            if (!animate)
                this._pos.jump(target);
            else {
                this._pos.jump(this.size());
                this._pos.set(target);
            }
            this.setFlag('open', true);
            this.focus({ preventScroll: true });
            this.emit('open');
        }
        initialStop() {
            return 0;
        }
        hide() {
            this._pos.set(this.size() * 1.05);
            // 13.1.0: focus leaves the dismissed panel now, not when the slide-out spring comes to rest
            if (this.contains(document.activeElement) && this._return instanceof HTMLElement)
                this._return.focus({ preventScroll: true });
            this.emit('close');
        }
        afterClose() {
            this.hidden = true;
            this._backdrop?.remove();
            this._backdrop = null;
            if (this.contains(document.activeElement) && this._return instanceof HTMLElement)
                this._return.focus({ preventScroll: true });
        }
        close() {
            this.setFlag('open', false);
        }
        dragStart(e) {
            const handle = kind === 'sheet' ? e.target.closest?.('[data-handle], .usa-sheet-handle') || (this.scrollTop <= 0 ? this : null) : this;
            if (!handle || e.target.closest?.('input, textarea, select, button, a, [data-no-drag]'))
                return;
            const p = this.vertical() ? e.clientY : e.clientX;
            this._pos.stop();
            this._drag = { id: e.pointerId, start: p, origin: this._pos.value, t: e.timeStamp, last: p, lt: e.timeStamp };
        }
        dragMove(e) {
            const d = this._drag;
            if (!d || e.pointerId !== d.id)
                return;
            const p = this.vertical() ? e.clientY : e.clientX;
            let v = d.origin + (p - d.start) * this.dir();
            if (v < 0)
                v = rubberBand(v, 200);
            d.lt = d.t;
            d.t = e.timeStamp;
            d.last = p;
            this._pos.jump(v);
        }
        dragEnd(e) {
            const d = this._drag;
            if (!d || e.pointerId !== d.id)
                return;
            this._drag = null;
            const moved = this._pos.value - d.origin;
            const dt = Math.max(16, d.t - d.lt) / 1000;
            const vel = Math.abs(moved) > 4 ? (moved / Math.max(dt, (e.timeStamp - (d.lt || 0)) / 1000 || 0.1)) * 0.2 : 0;
            const projected = projectInertia(this._pos.value, clamp(vel, -3e3, 3000));
            const stops = [...this.stops(), this.size()];
            const to = snapTo(projected, stops);
            if (to >= this.size() - 1)
                this.close();
            else
                this._pos.set(to);
            this.emit('snap', { offset: to });
        }
    };
}
function defineDrawer(tag = 'usa-drawer') {
    adoptVariants();
    return defineElement(tag, (Base) => makePanel(Base, 'drawer'), { id: 'sheet', text: css$m });
}
function defineBottomSheet(tag = 'usa-bottom-sheet') {
    adoptVariants();
    return defineElement(tag, (Base) => {
        const Panel = makePanel(Base, 'sheet');
        return class UsaBottomSheet extends Panel {
            static get observedAttributes() {
                return ['open', 'snap', 'start'];
            }
            mount() {
                if (!this.querySelector(':scope > .usa-sheet-handle')) {
                    const h = document.createElement('div');
                    h.className = 'usa-sheet-handle';
                    h.setAttribute('aria-hidden', 'true');
                    this.prepend(h);
                }
                super.mount();
            }
            size() {
                return (window.innerHeight || 800) * Math.max(...this.fractions());
            }
            fractions() {
                const f = this.str('snap', '0.5,0.92').split(',').map(Number).filter((n) => n > 0 && n <= 1);
                return f.length ? f : [0.5, 0.92];
            }
            stops() {
                const full = this.size();
                const H = window.innerHeight || 800;
                return this.fractions().map((f) => Math.max(0, full - f * H)).sort((a, b) => a - b);
            }
            initialStop() {
                const f = this.fractions();
                const pick = f[clamp(this.num('start', 0), 0, f.length - 1)];
                const target = Math.max(0, this.size() - pick * (window.innerHeight || 800));
                const s = this.stops();
                return Math.max(0, s.indexOf(target));
            }
            render(v) {
                this.style.height = `${this.size()}px`;
                super.render(v);
            }
        };
    }, { id: 'sheet', text: css$m });
}

var css$l = "";

function definePullRefresh(tag = 'usa-pull-refresh') {
    adoptVariants();
    return defineElement(tag, (Base) => class UsaPullRefresh extends Base {
        constructor() {
            super(...arguments);
            this._busy = false;
            this._ind = null;
            this._live = null;
        }
        static get observedAttributes() {
            return ['threshold', 'disabled', 'label'];
        }
        get refreshing() {
            return this._busy;
        }
        draw(v) {
            const th = this.num('threshold', 70);
            this.style.setProperty('--usa-pull', `${v.toFixed(1)}px`);
            this.style.setProperty('--usa-pull-p', Math.min(1, v / th).toFixed(3));
            this.toggleAttribute('data-armed', v >= th && !this._busy);
        }
        mount() {
            if (!this.querySelector(':scope > .usa-pull-indicator')) {
                this._ind = document.createElement('div');
                this._ind.className = 'usa-pull-indicator';
                this._ind.setAttribute('aria-hidden', 'true');
                this._ind.innerHTML = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" pathLength="100"/></svg>';
                this.prepend(this._ind);
                this._live = document.createElement('span');
                this._live.className = 'usa-sr';
                this._live.setAttribute('role', 'status');
                this.append(this._live);
            }
            this._y = createSpring({ spring: 'stiff', onUpdate: (v) => this.draw(v) });
            let start = null;
            let id = -1;
            // contract-exempt: keyboard-click-only — touch gesture; the keyboard / button path is refresh()
            this.listen(this, 'pointerdown', (e) => {
                if (this.flag('disabled') || this._busy || this.scrollTop > 0)
                    return;
                start = e.clientY;
                id = e.pointerId;
            });
            this.listen(this, 'pointermove', (e) => {
                if (start === null || e.pointerId !== id)
                    return;
                const d = e.clientY - start;
                if (d <= 0)
                    return;
                this._y.jump(this.reduced ? 0 : rubberBand(d, 220));
                if (this.reduced && d > this.num('threshold', 70))
                    this.setAttribute('data-armed', '');
            });
            const end = (e) => {
                if (start === null || e.pointerId !== id)
                    return;
                const d = e.clientY - start;
                start = null;
                const armed = this.hasAttribute('data-armed') || (!this.reduced && this._y.value >= this.num('threshold', 70)) || (this.reduced && d > this.num('threshold', 70));
                if (armed)
                    this.refresh();
                else
                    this._y.set(0);
            };
            this.listen(this, 'pointerup', end);
            this.listen(this, 'pointercancel', end);
        }
        unmount() {
            this._y?.stop();
        }
        refresh() {
            if (this._busy)
                return Promise.resolve();
            this._busy = true;
            this.removeAttribute('data-armed');
            this.setAttribute('data-refreshing', '');
            this.setAttribute('aria-busy', 'true');
            if (this._live)
                this._live.textContent = this.str('label', 'Refreshing');
            this._y.set(this.reduced ? 0 : this.num('threshold', 70) * 0.8);
            return new Promise((resolve) => {
                let finished = false;
                const done = () => {
                    if (finished)
                        return;
                    finished = true;
                    this._busy = false;
                    this.removeAttribute('data-refreshing');
                    this.removeAttribute('aria-busy');
                    if (this._live)
                        this._live.textContent = '';
                    this._y.set(0);
                    resolve();
                };
                const ev = new CustomEvent('usa:refresh', { detail: { done }, bubbles: true, composed: true, cancelable: true });
                this.dispatchEvent(ev);
                const fn = this.onrefresh;
                if (typeof fn === 'function')
                    Promise.resolve(fn(ev)).then(done, done);
            });
        }
    }, { id: 'pull-refresh', text: css$l });
}

var css$k = "";

function defineFab(tag = 'usa-fab') {
    // contract-exempt: attr-unobserved(open) — state reflected by the element itself (set the property instead); observing it would re-mount on every change
    adoptVariants();
    return defineElement(tag, (Base) => class UsaFab extends Base {
        static get observedAttributes() {
            return ['direction', 'gap'];
        }
        get open() {
            return this.flag('open');
        }
        set open(v) {
            this.toggle(v);
        }
        parts() {
            const kids = Array.from(this.children);
            return [kids[0] || null, kids.slice(1)];
        }
        offset(i, n) {
            const g = this.num('gap', 56) * (i + 1);
            switch (this.str('direction', 'up')) {
                case 'down':
                    return [0, g];
                case 'left':
                    return [-g, 0];
                case 'right':
                    return [g, 0];
                case 'radial': {
                    const a = Math.PI + (n > 1 ? (i / (n - 1)) * (Math.PI / 2) : Math.PI / 4);
                    const r = this.num('gap', 56) * 1.6;
                    return [Math.cos(a) * r, Math.sin(a) * r];
                }
                default:
                    return [0, -g];
            }
        }
        mount() {
            const [main, actions] = this.parts();
            if (!main)
                return;
            main.classList.add('usa-fab-main');
            main.setAttribute('aria-haspopup', 'true');
            actions.forEach((a) => a.classList.add('usa-fab-action'));
            this.apply(false);
            this.listen(main, 'click', () => this.toggle());
            this.listen(document, 'keydown', (e) => {
                if (e.key === 'Escape' && this.open) {
                    this.toggle(false);
                    main.focus();
                }
            });
            this.listen(document, 'pointerdown', (e) => this.open && !this.contains(e.target) && this.toggle(false));
            this.listen(this, 'click', (e) => {
                const a = e.target.closest?.('.usa-fab-action');
                if (a && this.contains(a))
                    this.toggle(false);
            });
        }
        apply(animate) {
            const [main, actions] = this.parts();
            if (!main)
                return;
            const open = this.open;
            main.setAttribute('aria-expanded', String(open));
            actions.forEach((a, i) => {
                const [x, y] = this.offset(i, actions.length);
                a.toggleAttribute('inert', !open);
                a.setAttribute('aria-hidden', String(!open));
                const to = open ? `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(1)` : 'translate(0, 0) scale(0.4)';
                const from = a.style.transform || 'translate(0, 0) scale(0.4)';
                a.style.transform = this.reduced ? (open ? `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)` : 'translate(0, 0)') : to;
                a.style.opacity = open ? '1' : '0';
                if (animate && !this.reduced) {
                    const t = springEasing(open ? 'wobbly' : 'stiff');
                    this.motion(a, [{ transform: from, opacity: open ? 0 : 1 }, { transform: to, opacity: open ? 1 : 0 }], { ...t, delay: (open ? i : actions.length - 1 - i) * 35 });
                }
            });
        }
        toggle(force) {
            const next = force === undefined ? !this.open : force;
            if (next === this.open)
                return;
            this.setFlag('open', next);
            this.apply(true);
            this.emit('toggle', { open: next });
        }
    }, { id: 'fab', text: css$k });
}

var css$j = "";

function defineNavbar(tag = 'usa-navbar') {
    adoptVariants();
    return defineElement(tag, (Base) => class UsaNavbar extends Base {
        constructor() {
            super(...arguments);
            this._frame = 0;
            this._last = 0;
        }
        static get observedAttributes() {
            return ['target', 'threshold'];
        }
        get hiddenByScroll() {
            return this.hasAttribute('data-hidden');
        }
        mount() {
            const sel = this.str('target');
            const scroller = queryAttr(sel) || window;
            const pos = () => (scroller === window ? window.scrollY || document.documentElement.scrollTop : scroller.scrollTop);
            this._last = pos();
            const update = () => {
                this._frame = 0;
                const y = pos();
                const dy = y - this._last;
                this._last = y;
                this.toggleAttribute('data-scrolled', y > 4);
                if (y <= this.num('threshold', 64) || dy < -2)
                    this.show();
                else if (dy > 2 && !this.contains(document.activeElement))
                    this.hide();
            };
            const on = () => {
                // contract-exempt: reduced-motion — rAF only throttles the scroll-synced hide / show check
                if (!this._frame)
                    this._frame = raf(update);
            };
            this.listen(scroller, 'scroll', on, { passive: true });
            this.listen(this, 'focusin', () => this.show());
            update();
        }
        unmount() {
            caf(this._frame);
            this._frame = 0;
        }
        hide() {
            if (this.hiddenByScroll)
                return;
            this.setAttribute('data-hidden', '');
            this.emit('hide');
        }
        show() {
            if (!this.hiddenByScroll)
                return;
            this.removeAttribute('data-hidden');
            this.emit('show');
        }
    }, { id: 'navbar', text: css$j });
}

var css$i = "";

function defineSlider(tag = 'usa-slider') {
    adoptVariants();
    return defineElement(tag, (Base) => {
        class UsaSlider extends Base {
            static get observedAttributes() {
                return ['min', 'max', 'disabled', 'label', 'step', 'value'];
            }
            constructor() {
                super();
                this._internals = null;
                this._v = 0;
                this._id = -1;
                try {
                    this._internals = this.attachInternals?.() ?? null;
                }
                catch {
                    this._internals = null;
                }
            }
            range() {
                const min = this.num('min', 0);
                const max = Math.max(min + 1e-9, this.num('max', 100));
                return [min, max, Math.max(1e-9, this.num('step', 1))];
            }
            get value() {
                return this._v;
            }
            set value(v) {
                this.setValue(v, false);
            }
            fraction(v = this._v) {
                const [min, max] = this.range();
                return (v - min) / (max - min);
            }
            setValue(v, user, animate = true) {
                const [min, max, step] = this.range();
                const q = clamp(Math.round((v - min) / step) * step + min, min, max);
                const val = Number(q.toFixed(10));
                const changed = val !== this._v;
                this._v = val;
                this.setAttribute('aria-valuenow', String(val));
                this.setAttribute('aria-valuetext', String(val));
                this._internals?.setFormValue?.(String(val));
                const bubble = this.querySelector('.usa-slider-bubble');
                if (bubble)
                    bubble.textContent = String(val);
                if (animate)
                    this._pos?.set(this.fraction());
                else
                    this._pos?.jump(this.fraction());
                if (changed && user) {
                    this.dispatchEvent(new Event('input', { bubbles: true }));
                    this.emit('input', { value: val });
                }
            }
            mount() {
                if (!this.querySelector(':scope > .usa-slider-track')) {
                    this.innerHTML = '<span class="usa-slider-track"><span class="usa-slider-fill"></span></span><span class="usa-slider-thumb"><span class="usa-slider-bubble"></span></span>';
                }
                this.setAttribute('role', 'slider');
                if (!this.hasAttribute('tabindex'))
                    this.tabIndex = 0;
                const [min, max] = this.range();
                this.setAttribute('aria-valuemin', String(min));
                this.setAttribute('aria-valuemax', String(max));
                if (this.str('label'))
                    this.setAttribute('aria-label', this.str('label'));
                this.toggleAttribute('aria-disabled', this.flag('disabled'));
                this._pos = createSpring({ spring: 'stiff', onUpdate: (f) => this.style.setProperty('--usa-slider', clamp(f, 0, 1).toFixed(4)) });
                this.setValue(this.num('value', min), false, false);
                const fromPointer = (e) => {
                    const r = this.getBoundingClientRect();
                    return min + clamp((e.clientX - r.left) / (r.width || 1), 0, 1) * (max - min);
                };
                this.listen(this, 'pointerdown', (e) => {
                    if (this.flag('disabled'))
                        return;
                    this._id = e.pointerId;
                    try {
                        this.setPointerCapture?.(e.pointerId);
                    }
                    catch {
                        /* synthetic */
                    }
                    this.setAttribute('data-dragging', '');
                    this.setValue(fromPointer(e), true);
                });
                this.listen(this, 'pointermove', (e) => e.pointerId === this._id && this.setValue(fromPointer(e), true));
                const end = (e) => {
                    if (e.pointerId !== this._id)
                        return;
                    this._id = -1;
                    this.removeAttribute('data-dragging');
                    this.commit();
                };
                this.listen(this, 'pointerup', end);
                this.listen(this, 'pointercancel', end);
                this.listen(this, 'keydown', (e) => {
                    if (this.flag('disabled'))
                        return;
                    const [mn, mx, st] = this.range();
                    const map = { ArrowRight: this._v + st, ArrowUp: this._v + st, ArrowLeft: this._v - st, ArrowDown: this._v - st, PageUp: this._v + st * 10, PageDown: this._v - st * 10, Home: mn, End: mx };
                    if (!(e.key in map))
                        return;
                    e.preventDefault();
                    this.setValue(map[e.key], true);
                    this.commit();
                });
            }
            unmount() {
                this._pos?.stop();
            }
            commit() {
                this.dispatchEvent(new Event('change', { bubbles: true }));
                this.emit('change', { value: this._v });
            }
        }
        UsaSlider.formAssociated = true;
        return UsaSlider;
    }, { id: 'slider', text: css$i });
}

var css$h = "";

function definePopover(tag = 'usa-popover') {
    // contract-exempt: attr-unobserved(open) — state reflected by the element itself (set the property instead); observing it would re-mount on every change
    adoptVariants();
    return defineElement(tag, (Base) => class UsaPopover extends Base {
        static get observedAttributes() {
            return ['placement'];
        }
        get open() {
            return this.flag('open');
        }
        set open(v) {
            this.toggle(v);
        }
        parts() {
            return [this.firstElementChild, this.querySelector(':scope > [data-popover]')];
        }
        mount() {
            const [trigger, panel] = this.parts();
            if (!trigger || !panel || trigger === panel)
                return;
            panel.id || (panel.id = nextId('usa-pop'));
            panel.classList.add('usa-surface', 'usa-popover-panel');
            if (!panel.hasAttribute('role'))
                panel.setAttribute('role', 'dialog');
            panel.tabIndex = -1;
            trigger.setAttribute('aria-controls', panel.id);
            trigger.setAttribute('aria-haspopup', 'dialog');
            this.render(false);
            this.listen(trigger, 'click', () => this.toggle());
            this.listen(document, 'keydown', (e) => {
                if (e.key === 'Escape' && this.open) {
                    this.toggle(false);
                    trigger.focus();
                }
            });
            this.listen(document, 'pointerdown', (e) => this.open && !this.contains(e.target) && this.toggle(false));
            this.listen(window, 'resize', () => this.open && place(panel, trigger, this.str('placement', 'bottom')));
        }
        render(animate) {
            const [trigger, panel] = this.parts();
            if (!trigger || !panel)
                return;
            trigger.setAttribute('aria-expanded', String(this.open));
            panel.hidden = !this.open;
            if (!this.open)
                return;
            const p = place(panel, trigger, this.str('placement', 'bottom'));
            if (!animate)
                return;
            const origin = { top: '50% 100%', bottom: '50% 0', left: '100% 50%', right: '0 50%' }[p];
            panel.style.transformOrigin = origin;
            this.motion(panel, this.reduced ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 0, transform: 'scale(0.9)' }, { opacity: 1, transform: 'none' }], this.reduced ? { duration: 120 } : springEasing('wobbly'));
            panel.focus({ preventScroll: true });
        }
        toggle(force) {
            const next = force === undefined ? !this.open : force;
            if (next === this.open)
                return;
            this.setFlag('open', next);
            this.render(true);
            this.emit(next ? 'open' : 'close');
        }
    }, { id: 'popover', text: css$h });
}

var css$g = "";

function defineBadge(tag = 'usa-badge') {
    adoptVariants();
    return defineElement(tag, (Base) => class UsaBadge extends Base {
        constructor() {
            super(...arguments);
            this._el = null;
        }
        static get observedAttributes() {
            return ['value', 'max', 'dot', 'label', 'show-zero'];
        }
        get value() {
            return this.str('value');
        }
        set value(v) {
            this.setAttribute('value', String(v));
        }
        mount() {
            if (!this._el || !this._el.isConnected) {
                this._el = document.createElement('span');
                this._el.className = 'usa-badge-count';
                this.append(this._el);
            }
            this.sync(false);
        }
        changed(name) {
            this.sync(name === 'value');
        }
        sync(bump) {
            const el = this._el;
            if (!el)
                return;
            const raw = this.value;
            const n = Number(raw);
            const max = this.num('max', 99);
            const text = this.flag('dot') ? '' : raw !== '' && Number.isFinite(n) && n > max ? `${max}+` : raw;
            const empty = !this.flag('dot') && (raw === '' || (raw === '0' && !this.flag('show-zero')));
            el.textContent = text;
            el.hidden = empty;
            this.toggleAttribute('data-dot', this.flag('dot'));
            const label = this.str('label', raw ? `${raw} new` : 'New');
            el.setAttribute('aria-label', label.replace('{n}', raw));
            el.setAttribute('role', 'status');
            if (bump && !empty && !this.reduced)
                this.motion(el, [{ transform: 'scale(0.4)' }, { transform: 'scale(1)' }], springEasing('bouncy'));
        }
    }, { id: 'badge', text: css$g });
}

var css$f = "";

function defineAvatarStack(tag = 'usa-avatar-stack') {
    adoptVariants();
    return defineElement(tag, (Base) => class UsaAvatarStack extends Base {
        static get observedAttributes() {
            return ['max', 'size', 'overlap', 'label'];
        }
        mount() {
            this.querySelector(':scope > .usa-avatar-more')?.remove();
            const kids = Array.from(this.children);
            const max = Math.max(1, this.num('max', 5));
            this.style.setProperty('--usa-avatar-size', `${this.num('size', 36)}px`);
            this.style.setProperty('--usa-avatar-overlap', String(this.num('overlap', 0.35)));
            this.setAttribute('role', 'group');
            this.setAttribute('aria-label', this.str('label', `${kids.length} people`));
            kids.forEach((k, i) => {
                k.classList.add('usa-avatar');
                k.hidden = i >= max;
                k.style.setProperty('--i', String(i));
                k.style.zIndex = String(kids.length - i);
            });
            if (kids.length > max) {
                const more = document.createElement('span');
                more.className = 'usa-avatar usa-avatar-more';
                more.textContent = `+${kids.length - max}`;
                more.style.setProperty('--i', String(max));
                more.setAttribute('aria-label', `and ${kids.length - max} more`);
                this.append(more);
            }
        }
    }, { id: 'avatar-stack', text: css$f });
}

/**
 * motionary/components/ui — animated UI components + style variants (v2.6).
 * `<usa-tabs>`, `<usa-drawer>`, `<usa-bottom-sheet>`, `<usa-pull-refresh>`,
 * `<usa-fab>`, `<usa-navbar>`, `<usa-slider>`,
 * `<usa-popover>`, `<usa-badge>`, `<usa-avatar-stack>`,
 * and `variant="minimal | neon | glass | brutalist | fluent | material"`
 * design tokens (`setVariant()`, `VARIANTS`).
 */
/** Register every component of this category under its default tag. */
function defineUiComponents() {
    defineTabs();
    defineDrawer();
    defineBottomSheet();
    definePullRefresh();
    defineFab();
    defineNavbar();
    defineSlider();
    definePopover();
    defineBadge();
    defineAvatarStack();
}

var css$e = "";

const CURSOR_MODES = ['dot', 'magnetic', 'glow'];
function defineCursor(tag = 'usa-cursor') {
    return defineElement(tag, (Base) => class UsaCursor extends Base {
        constructor() {
            super(...arguments);
            this._frame = 0;
        }
        static get observedAttributes() {
            return ['mode', 'size', 'color', 'hide-native', 'targets'];
        }
        get active() {
            return this.hasAttribute('data-active');
        }
        mount() {
            this.setAttribute('aria-hidden', 'true');
            const fine = typeof matchMedia !== 'function' || matchMedia('(pointer: fine)').matches || matchMedia('(hover: hover)').matches;
            if (this.reduced || !fine) {
                // Decorative only: never leave (focusable) content inside aria-hidden (4.4 audit).
                this.replaceChildren();
                return;
            }
            const m = this.str('mode', 'dot');
            const mode = CURSOR_MODES.includes(m) ? m : 'dot';
            const n = 1;
            this.innerHTML = Array.from({ length: n }, (_, i) => `<span class="usa-cursor-${mode === 'glow' ? 'glow' : 'ring'}" style="--i:${i}"></span>`).join('') + (mode === 'glow' ? '' : '<span class="usa-cursor-dot"></span>');
            if (this.str('color'))
                this.style.setProperty('--usa-cursor-color', this.str('color'));
            this.style.setProperty('--usa-cursor-size', `${this.num('size', 28)}px`);
            if (this.flag('hide-native'))
                document.documentElement.classList.add('usa-cursor-none');
            this.onCleanup(() => document.documentElement.classList.remove('usa-cursor-none'));
            const parts = Array.from(this.querySelectorAll('.usa-cursor-ring, .usa-cursor-glow'));
            const dot = this.querySelector('.usa-cursor-dot');
            const pts = parts.map(() => ({ x: -100, y: -100 }));
            let mx = -100;
            let my = -100;
            let snap = null;
            const sel = this.str('targets', 'a, button, [role="button"], [data-cursor], input, select, textarea, label');
            const loop = () => {
                this._frame = 0;
                let tx = mx;
                let ty = my;
                pts.forEach((p, i) => {
                    const k = mode === 'glow' ? 0.12 : 0.22;
                    const goalX = snap && i === 0 ? snap.left + snap.width / 2 : tx;
                    const goalY = snap && i === 0 ? snap.top + snap.height / 2 : ty;
                    p.x += (goalX - p.x) * k;
                    p.y += (goalY - p.y) * k;
                    parts[i].style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0)`;
                    tx = p.x;
                    ty = p.y;
                });
                if (snap && parts[0]) {
                    parts[0].style.width = `${snap.width + 12}px`;
                    parts[0].style.height = `${snap.height + 12}px`;
                }
                else if (parts[0]) {
                    parts[0].style.width = parts[0].style.height = '';
                }
                if (dot)
                    dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
                const moving = pts.some((p, i) => Math.abs(p.x - (i === 0 && snap ? snap.left + snap.width / 2 : mx)) > 0.3);
                if (moving)
                    this._frame = raf(loop);
            };
            const kick = () => {
                if (!this._frame)
                    this._frame = raf(loop);
            };
            this.listen(document, 'pointermove', (e) => {
                if (e.pointerType === 'touch')
                    return;
                mx = e.clientX;
                my = e.clientY;
                this.setAttribute('data-active', '');
                if (mode === 'magnetic') {
                    const t = e.target?.closest?.(sel);
                    snap = t ? t.getBoundingClientRect() : null;
                    this.toggleAttribute('data-snapped', !!t);
                }
                else {
                    this.toggleAttribute('data-hover', !!e.target?.closest?.(sel));
                }
                kick();
            }, { passive: true });
            this.listen(document, 'pointerdown', () => this.setAttribute('data-down', ''));
            this.listen(document, 'pointerup', () => this.removeAttribute('data-down'));
            this.listen(document.documentElement, 'pointerleave', () => this.removeAttribute('data-active'));
        }
        unmount() {
            caf(this._frame);
            this._frame = 0;
            this.removeAttribute('data-active');
        }
    }, { id: 'cursor', text: css$e });
}

function smoothScroll(options = {}) {
    if (typeof window === 'undefined' || prefersReducedMotion())
        return () => undefined;
    const el = options.target || null;
    const lerp = Math.min(1, Math.max(0.02, options.lerp ?? 0.12));
    const mult = options.wheelMultiplier ?? 1;
    const get = () => (el ? el.scrollTop : window.scrollY);
    const max = () => (el ? el.scrollHeight - el.clientHeight : document.documentElement.scrollHeight - window.innerHeight);
    const set = (y) => (el ? (el.scrollTop = y) : window.scrollTo(0, y));
    let target = get();
    let current = target;
    let id = 0;
    const loop = () => {
        current += (target - current) * lerp;
        if (Math.abs(target - current) < 0.5)
            current = target;
        set(current);
        id = current === target ? 0 : raf(loop);
    };
    const onWheel = (e) => {
        if (e.ctrlKey || e.defaultPrevented)
            return;
        if (!id)
            target = current = get();
        e.preventDefault();
        const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * (window.innerHeight || 800) : e.deltaY;
        target = Math.max(0, Math.min(max(), target + dy * mult));
        if (!id)
            id = raf(loop);
    };
    const onScroll = () => {
        if (!id)
            target = current = get();
    };
    const host = el || window;
    host.addEventListener('wheel', onWheel, { passive: false });
    host.addEventListener('scroll', onScroll, { passive: true });
    return () => {
        host.removeEventListener('wheel', onWheel);
        host.removeEventListener('scroll', onScroll);
        if (id)
            caf(id);
        id = 0;
    };
}
/**
 * Scroll to a y position, element or selector with spring timing (or
 * instantly under reduced motion). Resolves when done.
 */
function scrollToTarget(to, options = {}) {
    if (typeof window === 'undefined')
        return Promise.resolve();
    const el = options.target || null;
    const start = el ? el.scrollTop : window.scrollY;
    let y = typeof to === 'number' ? to : 0;
    if (typeof to !== 'number') {
        const node = typeof to === 'string' ? document.querySelector(to) : to;
        if (!node)
            return Promise.resolve();
        const top = node.getBoundingClientRect().top;
        y = start + top - (el ? el.getBoundingClientRect().top : 0);
    }
    y = Math.max(0, y - (options.offset ?? 0));
    const set = (v) => (el ? (el.scrollTop = v) : window.scrollTo(0, v));
    if (prefersReducedMotion()) {
        set(y);
        return Promise.resolve();
    }
    const { values, duration } = springSamples(options.preset || 'slow');
    const t0 = now();
    return new Promise((resolve) => {
        const step = () => {
            const p = Math.min(1, (now() - t0) / Math.max(1, duration));
            const v = values[Math.min(values.length - 1, Math.round(p * (values.length - 1)))];
            set(start + (y - start) * v);
            if (p < 1)
                raf(step);
            else
                resolve();
        };
        raf(step);
    });
}

var css$d = "";

function defineFullpage(tag = 'usa-fullpage') {
    return defineElement(tag, (Base) => class UsaFullpage extends Base {
        constructor() {
            super(...arguments);
            this._i = 0;
        }
        static get observedAttributes() {
            return ['dots', 'axis'];
        }
        get index() {
            return this._i;
        }
        sections() {
            return Array.from(this.children).filter((c) => !c.classList.contains('usa-fullpage-dots'));
        }
        mount() {
            if (!this.hasAttribute('tabindex'))
                this.tabIndex = 0;
            const secs = this.sections();
            secs.forEach((s, i) => {
                s.classList.add('usa-fullpage-section');
                s.setAttribute('data-index', String(i));
            });
            let nav = null;
            if (this.flag('dots')) {
                nav = document.createElement('nav');
                nav.className = 'usa-fullpage-dots';
                nav.setAttribute('aria-label', 'Sections');
                secs.forEach((s, i) => {
                    const b = document.createElement('button');
                    b.type = 'button';
                    b.setAttribute('aria-label', s.getAttribute('aria-label') || s.querySelector('h1,h2,h3')?.textContent?.trim() || `Section ${i + 1}`);
                    b.addEventListener('click', () => this.go(i));
                    nav.append(b);
                });
                this.append(nav);
                this.onCleanup(() => nav?.remove());
            }
            this.mark(0);
            if (typeof IntersectionObserver !== 'undefined') {
                const io = new IntersectionObserver((entries) => {
                    for (const e of entries)
                        if (e.isIntersecting && e.intersectionRatio >= 0.6)
                            this.mark(Number(e.target.dataset.index));
                }, { root: this, threshold: [0.6] });
                secs.forEach((s) => io.observe(s));
                this.onCleanup(() => io.disconnect());
            }
            this.listen(this, 'keydown', (e) => {
                const n = this.sections().length;
                const map = { PageDown: this._i + 1, ArrowDown: this._i + 1, ' ': this._i + 1, PageUp: this._i - 1, ArrowUp: this._i - 1, Home: 0, End: n - 1 };
                if (this.str('axis') === 'x')
                    Object.assign(map, { ArrowRight: this._i + 1, ArrowLeft: this._i - 1 });
                if (!(e.key in map) || e.target.closest?.('input, textarea, select'))
                    return;
                e.preventDefault();
                this.go(map[e.key]);
            });
        }
        mark(i) {
            if (i === this._i && this.hasAttribute('data-ready'))
                return;
            this.setAttribute('data-ready', '');
            this._i = i;
            this.sections().forEach((s, j) => s.toggleAttribute('data-current', j === i));
            this.querySelectorAll('.usa-fullpage-dots button').forEach((b, j) => (j === i ? b.setAttribute('aria-current', 'true') : b.removeAttribute('aria-current')));
            this.emit('section', { index: i });
        }
        go(i) {
            const secs = this.sections();
            const t = secs[Math.max(0, Math.min(secs.length - 1, i))];
            if (!t)
                return;
            if (this.str('axis') === 'x')
                this.scrollTo({ left: t.offsetLeft, behavior: this.reduced ? 'auto' : 'smooth' });
            else
                scrollToTarget(t.offsetTop, { target: this, preset: 'stiff' });
            this.mark(secs.indexOf(t));
        }
        next() {
            this.go(this._i + 1);
        }
        prev() {
            this.go(this._i - 1);
        }
    }, { id: 'fullpage', text: css$d });
}

var css$c = "";

function defineLoadingBar(tag = 'usa-loading-bar') {
    return defineElement(tag, (Base) => class UsaLoadingBar extends Base {
        constructor() {
            super(...arguments);
            this._p = 0;
        }
        static get observedAttributes() {
            return ['label', 'color', 'height'];
        }
        get progress() {
            return this._p;
        }
        mount() {
            if (!this.querySelector('.usa-loading-bar-fill'))
                this.innerHTML = '<span class="usa-loading-bar-fill"></span>';
            this.setAttribute('role', 'progressbar');
            this.setAttribute('aria-label', this.str('label', 'Loading'));
            this.setAttribute('aria-valuemin', '0');
            this.setAttribute('aria-valuemax', '100');
            if (this.str('color'))
                this.style.setProperty('--usa-loading-color', this.str('color'));
            this.style.setProperty('--usa-loading-h', `${this.num('height', 3)}px`);
            this.paint();
        }
        unmount() {
            clearInterval(this._t);
            clearTimeout(this._h);
        }
        paint() {
            this.style.setProperty('--usa-loading', this._p.toFixed(4));
            this.setAttribute('aria-valuenow', String(Math.round(this._p * 100)));
        }
        start() {
            clearTimeout(this._h);
            clearInterval(this._t);
            this.setAttribute('data-active', '');
            this.setAttribute('aria-busy', 'true');
            this._p = Math.max(this._p, 0.08);
            this.paint();
            this._t = setInterval(() => {
                this._p += (0.9 - this._p) * (this.reduced ? 0.5 : 0.08);
                this.paint();
            }, 200);
        }
        set(p) {
            this.setAttribute('data-active', '');
            this._p = Math.max(0, Math.min(1, p));
            this.paint();
        }
        done() {
            clearInterval(this._t);
            this._p = 1;
            this.paint();
            this.removeAttribute('aria-busy');
            this._h = setTimeout(() => {
                this.removeAttribute('data-active');
                this._h = setTimeout(() => {
                    this._p = 0;
                    this.paint();
                }, 300);
            }, 250);
        }
    }, { id: 'loading-bar', text: css$c });
}
function bar() {
    if (typeof document === 'undefined')
        return null;
    let el = document.querySelector('usa-loading-bar');
    if (!el) {
        defineLoadingBar();
        el = document.createElement('usa-loading-bar');
        document.body.appendChild(el);
    }
    return typeof el.start === 'function' ? el : null;
}
/** Drive the page's `<usa-loading-bar>` (created on first use). */
const loadingBar = {
    start: () => bar()?.start(),
    set: (p) => bar()?.set(p),
    done: () => bar()?.done(),
    /** Run `task` with the bar shown; resolves with its result. */
    async track(task) {
        bar()?.start();
        try {
            return await (typeof task === 'function' ? task() : task);
        }
        finally {
            bar()?.done();
        }
    },
};

var css$b = "";

function defineBackToTop(tag = 'usa-back-to-top') {
    return defineElement(tag, (Base) => class UsaBackToTop extends Base {
        constructor() {
            super(...arguments);
            this._frame = 0;
        }
        static get observedAttributes() {
            return ['label', 'offset', 'focus-target'];
        }
        get visible() {
            return this.hasAttribute('data-visible');
        }
        mount() {
            if (!this.querySelector('button')) {
                this.innerHTML = `<button type="button" aria-label="${this.str('label', 'Back to top')}"><svg viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="16" pathLength="100"/><path d="M12 20l6-6 6 6"/></svg></button>`;
            }
            const btn = this.querySelector('button');
            const update = () => {
                this._frame = 0;
                const y = window.scrollY || document.documentElement.scrollTop || 0;
                const max = Math.max(1, (document.documentElement.scrollHeight || 0) - (window.innerHeight || 0));
                this.toggleAttribute('data-visible', y > this.num('offset', 300));
                this.style.setProperty('--usa-btt', Math.min(1, y / max).toFixed(4));
            };
            this.listen(window, 'scroll', () => {
                // contract-exempt: reduced-motion — rAF only throttles the scroll-synced visibility check, no decorative motion
                if (!this._frame)
                    this._frame = raf(update);
            }, { passive: true });
            this.listen(btn, 'click', async () => {
                await scrollToTarget(0, { preset: 'slow' });
                const f = queryAttr(this.str('focus-target', '#main')) || document.body;
                if (!f.hasAttribute('tabindex') && f !== document.body)
                    f.tabIndex = -1;
                f.focus?.({ preventScroll: true });
            });
            update();
        }
        unmount() {
            caf(this._frame);
            this._frame = 0;
        }
    }, { id: 'back-to-top', text: css$b });
}

var css$a = "";

const AMBIENT_EFFECTS = ['particles', 'snow', 'stars', 'noise', 'gradient'];
function defineAmbient(tag = 'usa-ambient') {
    return defineElement(tag, (Base) => class UsaAmbient extends Base {
        constructor() {
            super(...arguments);
            this._frame = 0;
        }
        static get observedAttributes() {
            return ['effect', 'density', 'color', 'opacity', 'speed'];
        }
        mount() {
            this.setAttribute('aria-hidden', 'true');
            const effect = this.str('effect', 'particles');
            this.style.setProperty('--usa-ambient-opacity', String(this.num('opacity', 0.6)));
            this.replaceChildren();
            if (effect === 'noise')
                return;
            if (effect === 'gradient') {
                const upd = () => {
                    this._frame = 0;
                    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
                    this.style.setProperty('--usa-ambient-p', ((window.scrollY || 0) / max).toFixed(4));
                };
                if (!this.reduced)
                    this.listen(window, 'scroll', () => !this._frame && (this._frame = raf(upd)), { passive: true });
                upd();
                return;
            }
            const canvas = document.createElement('canvas');
            this.append(canvas);
            const ctx = canvas.getContext?.('2d');
            if (!ctx)
                return;
            const dpr = Math.min(2, window.devicePixelRatio || 1);
            let W = 0;
            let H = 0;
            const color = this.str('color', effect === 'snow' ? '#ffffff' : effect === 'stars' ? '#ffffff' : '#a78bfa');
            const speed = this.num('speed', 1);
            const resize = () => {
                W = window.innerWidth || 800;
                H = window.innerHeight || 600;
                canvas.width = W * dpr;
                canvas.height = H * dpr;
                canvas.style.width = `${W}px`;
                canvas.style.height = `${H}px`;
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            };
            resize();
            const base = effect === 'stars' ? 140 : effect === 'snow' ? 90 : 60;
            const n = Math.round(base * Math.max(0.2, Math.min(3, this.num('density', 1))) * Math.min(1.5, (W * H) / (1280 * 800)));
            const dots = Array.from({ length: n }, () => ({
                x: Math.random() * W,
                y: Math.random() * H,
                r: effect === 'stars' ? Math.random() * 1.3 + 0.2 : effect === 'snow' ? Math.random() * 2.6 + 0.8 : Math.random() * 2 + 0.6,
                vx: (Math.random() - 0.5) * 0.25,
                vy: effect === 'snow' ? Math.random() * 0.8 + 0.4 : (Math.random() - 0.5) * 0.25,
                t: Math.random() * Math.PI * 2,
            }));
            ctx.fillStyle = color;
            const draw = (move) => {
                ctx.clearRect(0, 0, W, H);
                for (const d of dots) {
                    if (move) {
                        d.t += 0.02 * speed;
                        d.x += (d.vx + (effect === 'snow' ? Math.sin(d.t) * 0.3 : 0)) * speed;
                        d.y += d.vy * speed;
                        if (d.y > H + 5)
                            d.y = -5;
                        if (d.y < -5)
                            d.y = H + 5;
                        if (d.x > W + 5)
                            d.x = -5;
                        if (d.x < -5)
                            d.x = W + 5;
                    }
                    ctx.globalAlpha = effect === 'stars' ? 0.35 + 0.65 * Math.abs(Math.sin(d.t)) : 0.85;
                    ctx.beginPath();
                    ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
                    ctx.fill();
                }
            };
            this.listen(window, 'resize', () => {
                resize();
                ctx.fillStyle = color;
                draw(false);
            });
            if (this.reduced) {
                draw(false);
                return;
            }
            const loop = () => {
                if (!document.hidden)
                    draw(true);
                this._frame = raf(loop);
            };
            this._frame = raf(loop);
        }
        unmount() {
            caf(this._frame);
            this._frame = 0;
        }
    }, { id: 'ambient', text: css$a });
}

var css$9 = "";

function defineSplash(tag = 'usa-splash') {
    return defineElement(tag, (Base) => class UsaSplash extends Base {
        constructor() {
            super(...arguments);
            this._t0 = 0;
            this._gone = false;
        }
        static get observedAttributes() {
            return ['label', 'manual', 'min', 'exit'];
        }
        mount() {
            this._t0 = Date.now();
            this.setAttribute('role', 'status');
            this.setAttribute('aria-label', this.str('label', 'Loading'));
            document.body?.setAttribute('aria-busy', 'true');
            if (this.flag('manual'))
                return;
            if (document.readyState === 'complete')
                this.done();
            else
                this.listen(window, 'load', () => this.done(), { once: true });
        }
        async done() {
            if (this._gone)
                return;
            this._gone = true;
            const wait = Math.max(0, this.num('min', 600) - (Date.now() - this._t0));
            if (wait)
                await new Promise((r) => setTimeout(r, wait));
            const exit = this.reduced ? 'fade' : this.str('exit', 'fade');
            const frames = {
                fade: [{ opacity: 1 }, { opacity: 0 }],
                scale: [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(1.15)' }],
                'slide-up': [{ transform: 'translateY(0)' }, { transform: 'translateY(-100%)' }],
                circle: [{ clipPath: 'circle(150% at 50% 50%)' }, { clipPath: 'circle(0% at 50% 50%)' }],
            };
            const a = this.motion(this, frames[exit] || frames.fade, { duration: this.reduced ? 200 : 550, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', fill: 'forwards' });
            await a?.finished.catch(() => undefined);
            document.body?.removeAttribute('aria-busy');
            this.hidden = true;
            this.emit('done');
        }
    }, { id: 'splash', text: css$9 });
}

var css$8 = "";

function defineAutoSkeleton(tag = 'usa-auto-skeleton') {
    return defineElement(tag, (Base) => class UsaAutoSkeleton extends Base {
        static get observedAttributes() {
            return ['loading'];
        }
        get loading() {
            return this.flag('loading');
        }
        set loading(v) {
            this.setFlag('loading', v);
        }
        mount() {
            this.sync(false);
        }
        changed() {
            this.sync(true);
        }
        sync(animate) {
            if (this.loading)
                this.setAttribute('aria-busy', 'true');
            else {
                this.removeAttribute('aria-busy');
                if (animate && !this.reduced)
                    this.motion(this, [{ opacity: 0.4 }, { opacity: 1 }], { duration: 300, easing: 'ease-out' });
            }
        }
    }, { id: 'auto-skeleton', text: css$8 });
}

var css$7 = "";

const INTENSITIES = ['low', 'normal', 'high'];
const LEVELS = ['off', 'low', 'normal', 'high'];
const KEY$1 = 'usa:motion';
/**
 * Set the global motion intensity for every `<usa-*>` component:
 * `'low'`, `'normal'` (default), `'high'`. Sets `--usa-motion` and
 * `data-usa-motion` on `<html>`; with `persist` the choice is remembered
 * (localStorage) and restored by `restoreMotionIntensity()`.
 * 5.0: `'off'` was removed — use `setMotionSensitivity('minimal')`.
 */
function setMotionIntensity(level, persist = false) {
    if (!INTENSITIES.includes(level))
        return;
    configureComponents({ motionIntensity: level });
    store(level, persist);
}
function store(level, persist) {
    if (persist) {
        try {
            localStorage.setItem(KEY$1, level);
        }
        catch {
            /* private mode */
        }
    }
    if (typeof document !== 'undefined')
        document.dispatchEvent(new CustomEvent('usa:motion', { detail: { level } }));
}
/** Apply a switch level: `'off'` = motion sensitivity `minimal`, otherwise full motion at that intensity. */
function setMotionLevel(level, persist = false) {
    if (!LEVELS.includes(level))
        return;
    if (level === 'off')
        configureComponents({ motionSensitivity: 'minimal' });
    else
        configureComponents({ motionIntensity: level, ...(getMotionSensitivity() === 'minimal' ? { motionSensitivity: 'full' } : {}) });
    store(level, persist);
}
/** The current switch level. */
function getMotionLevel() {
    return getMotionSensitivity() === 'minimal' || getMotionSensitivity() === 'static' ? 'off' : getMotionIntensity();
}
/** Re-apply a persisted level (call early on page load). Returns the active intensity. */
function restoreMotionIntensity() {
    try {
        const v = localStorage.getItem(KEY$1);
        if (v && LEVELS.includes(v))
            setMotionLevel(v);
    }
    catch {
        /* ignore */
    }
    return getMotionIntensity();
}
function defineMotionSwitch(tag = 'usa-motion-switch') {
    return defineElement(tag, (Base) => class UsaMotionSwitch extends Base {
        static get observedAttributes() {
            return ['labels', 'label'];
        }
        get value() {
            return getMotionLevel();
        }
        set value(v) {
            setMotionLevel(v, true);
            this.sync();
        }
        mount() {
            restoreMotionIntensity();
            const labels = this.str('labels', 'Off,Low,Normal,High').split(',');
            this.setAttribute('role', 'radiogroup');
            this.setAttribute('aria-label', this.str('label', 'Motion'));
            this.innerHTML = LEVELS.map((l, i) => `<button type="button" role="radio" data-level="${l}">${labels[i] || l}</button><span hidden></span>`.replace('<span hidden></span>', '')).join('') + '<span class="usa-motion-thumb" aria-hidden="true"></span>';
            this.listen(this, 'click', (e) => {
                const b = e.target.closest?.('[data-level]');
                if (b)
                    this.pick(b.dataset.level);
            });
            this.listen(this, 'keydown', (e) => {
                const i = LEVELS.indexOf(this.value);
                const n = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? i + 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? i - 1 : null;
                if (n === null)
                    return;
                e.preventDefault();
                this.pick(LEVELS[(n + LEVELS.length) % LEVELS.length]);
                this.querySelector('[aria-checked="true"]')?.focus();
            });
            this.listen(document, 'usa:motion', () => this.sync());
            this.sync();
        }
        pick(l) {
            this.value = l;
            this.emit('change', { level: l });
        }
        sync() {
            const v = this.value;
            const i = LEVELS.indexOf(v);
            this.style.setProperty('--usa-motion-i', String(i));
            this.querySelectorAll('[data-level]').forEach((b) => {
                const on = b.dataset.level === v;
                b.setAttribute('aria-checked', String(on));
                b.tabIndex = on ? 0 : -1;
            });
        }
    }, { id: 'motion-switch', text: css$7 });
}

var css$6 = "";

/**
 * Page & app-wide transitions (v2.7), built on the View Transitions API
 * (Chromium: Chrome, Edge, Electron, WebView2) with graceful fallbacks.
 *
 * - `pageTransition(update, { effect })` — SPA route changes: `fade`,
 *   `slide` (`slide-left` / `slide-right` / `slide-up`), `circle` (reveal
 *   from `x`, `y`), `blinds`, `pixel` (stepped dissolve), `zoom`.
 * - `enableMpaTransitions(effect)` — the same effects for multi-page sites
 *   (`@view-transition { navigation: auto }`); call it on every page.
 * - `themeTransition(apply, { x, y })` — a circle-reveal theme switch.
 *
 * Without View Transitions (Firefox, older Safari) or under reduced motion
 * the update runs immediately (`fade` falls back to a short cross-fade of
 * `fallback` when given).
 */
const PAGE_EFFECTS = ['fade', 'slide', 'slide-left', 'slide-right', 'slide-up', 'circle', 'blinds', 'pixel', 'zoom'];
let lastPointer = null;
function trackPointer() {
    if (typeof document === 'undefined' || trackPointer.done)
        return;
    trackPointer.done = true;
    document.addEventListener('pointerdown', (e) => (lastPointer = [e.clientX, e.clientY]), { capture: true, passive: true });
}
/** `true` when `document.startViewTransition` exists. */
const supportsViewTransitions = () => typeof document !== 'undefined' && typeof document.startViewTransition === 'function';
function setVars(o) {
    const d = document.documentElement;
    const W = window.innerWidth || 1024;
    const H = window.innerHeight || 768;
    const [x, y] = o.x !== undefined && o.y !== undefined ? [o.x, o.y] : lastPointer || [W / 2, H / 2];
    const r = Math.hypot(Math.max(x, W - x), Math.max(y, H - y));
    d.style.setProperty('--usa-pt-x', `${x}px`);
    d.style.setProperty('--usa-pt-y', `${y}px`);
    d.style.setProperty('--usa-pt-r', `${Math.ceil(r)}px`);
    d.style.setProperty('--usa-pt-duration', `${o.duration ?? 600}ms`);
}
/** Run `update` (sync or async) as an animated page transition. Resolves when it is done. */
async function pageTransition(update, options = {}) {
    if (typeof document === 'undefined') {
        await update();
        return;
    }
    adoptStyles('page-transitions', css$6);
    trackPointer();
    const effect = options.effect || 'fade';
    if (prefersReducedMotion() || !supportsViewTransitions()) {
        await update();
        const f = options.fallback;
        if (f && typeof f.animate === 'function' && !prefersReducedMotion())
            await f.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200 }).finished.catch(() => undefined);
        return;
    }
    const d = document.documentElement;
    setVars(options);
    d.setAttribute('data-usa-pt', effect);
    try {
        const vt = document.startViewTransition(() => update());
        await vt.finished;
    }
    finally {
        d.removeAttribute('data-usa-pt');
    }
}
/** Opt a multi-page site into cross-document view transitions with `effect`. */
function enableMpaTransitions(effect = 'fade', duration = 450) {
    if (typeof document === 'undefined')
        return;
    adoptStyles('page-transitions', css$6);
    adoptStyles('mpa-transitions', prefersReducedMotion() ? '' : '@view-transition{navigation:auto}');
    const d = document.documentElement;
    d.setAttribute('data-usa-pt', effect);
    setVars({ duration });
}
/**
 * Switch theme with a circle reveal from (`x`, `y`) (default: last pointer).
 * `apply` flips your theme (e.g. toggles a class / `data-theme`).
 */
function themeTransition(apply, options = {}) {
    return pageTransition(apply, { ...options, effect: 'circle', duration: options.duration ?? 650 });
}

/**
 * motionary/components/page — page & app-wide effects (v2.7).
 * Page transitions (`pageTransition()`, `enableMpaTransitions()`,
 * `themeTransition()`), `<usa-cursor>`, `smoothScroll()` / `scrollToTarget()`,
 * `<usa-fullpage>`, `<usa-loading-bar>` + `loadingBar`, `<usa-back-to-top>`,
 * `<usa-ambient>`, `<usa-splash>`, `<usa-auto-skeleton>` and the global motion
 * intensity (`setMotionIntensity()`, `<usa-motion-switch>`).
 */
/** Register every component of this category under its default tag. */
function definePageComponents() {
    defineCursor();
    defineFullpage();
    defineLoadingBar();
    defineBackToTop();
    defineAmbient();
    defineSplash();
    defineAutoSkeleton();
    defineMotionSwitch();
}

var css$5 = "";

function defineTimeline(tag = 'usa-timeline') {
    return defineElement(tag, (Base) => class UsaTimeline extends Base {
        constructor() {
            super(...arguments);
            this._tl = null;
        }
        static get observedAttributes() {
            return ['scrub', 'trigger', 'overlap', 'duration', 'stagger', 'smooth', 'repeat'];
        }
        get timeline() {
            return this._tl;
        }
        play() {
            return this._tl ? this._tl.play(0).then(() => void this.emit('complete')) : Promise.resolve();
        }
        reverse() {
            return this._tl ? this._tl.reverse() : Promise.resolve();
        }
        seek(to) {
            this._tl?.seek(to);
        }
        mount() {
            const overlap = this.num('overlap', 0);
            const tl = (this._tl = timeline({ defaults: { duration: this.num('duration', 600), stagger: this.num('stagger', 0) } }));
            this.querySelectorAll('[data-tl]').forEach((el, i) => {
                if (el.dataset.label)
                    tl.label(el.dataset.label);
                const name = el.dataset.tl || 'fade';
                tl.to(el, TIMELINE_PRESETS[name] ? name : 'fade', {
                    at: el.dataset.at ?? (i && overlap ? `-=${overlap}` : undefined),
                    duration: el.dataset.duration ? Number(el.dataset.duration) : undefined,
                });
            });
            this.onCleanup(() => tl.cancel());
            if (this.reduced) {
                tl.seek(tl.duration);
                return;
            }
            if (this.flag('scrub')) {
                // 4.1: native ScrollTimeline / ViewTimeline when available; `smooth`
                // (0–0.95) or `scrub="js"` opt into the JS engine, `scrub="scroll"`
                // follows this element's own scroll position.
                const v = this.str('scrub');
                const stop = tl.scrub(this, { smooth: this.num('smooth', 0), engine: 'auto', source: v === 'scroll' ? 'scroll' : 'view' });
                this.toggleAttribute('data-native', stop.native);
                this.onCleanup(stop);
                return;
            }
            const trigger = this.str('trigger', 'view');
            if (trigger === 'click') {
                // 4.0.1: show the finished composition until the first click
                // (it used to sit invisible at t=0); Enter / Space replay it too.
                tl.seek(tl.duration);
                this.listen(this, 'click', () => void this.play());
                this.listen(this, 'keydown', (e) => {
                    if (e.target === this && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        void this.play();
                    }
                });
                if (!this.hasAttribute('tabindex'))
                    this.tabIndex = 0;
                return;
            }
            tl.seek(0);
            if (trigger === 'view') {
                let played = false;
                this.inView((v) => {
                    if (v && (!played || this.flag('repeat'))) {
                        played = true;
                        void this.play();
                    }
                    else if (!v && this.flag('repeat'))
                        tl.seek(0);
                }, { threshold: 0.2 });
            }
        }
        unmount() {
            this._tl = null;
        }
    }, { id: 'timeline', text: css$5 });
}

/**
 * motionary/components/timeline — choreography (v3.1).
 * `timeline()` chains, overlaps, labels, seeks, reverses and scroll-scrubs
 * WAAPI animations on one playhead; `<usa-timeline>` builds one from
 * `data-tl` children.
 */
/** Register every component of this category under its default tag. */
function defineTimelineComponents() {
    defineTimeline();
}

/** The swipe a pointer release represents, or `null` (pure). */
function swipeDirection(dx, dy, vx, vy, o = {}) {
    const dist = o.distance ?? 40;
    const vel = o.velocity ?? 300;
    const horiz = o.axis === 'x' || (o.axis !== 'y' && Math.abs(dx) >= Math.abs(dy));
    const d = horiz ? dx : dy;
    const v = horiz ? vx : vy;
    if (Math.abs(d) < dist && Math.abs(v) < vel * 2)
        return null;
    if (Math.abs(v) < vel && Math.abs(d) < dist * 3)
        return null;
    const direction = horiz ? (d > 0 ? 'right' : 'left') : d > 0 ? 'down' : 'up';
    return { direction, velocity: Math.abs(v), dx, dy };
}
/** Scale between two pointer distances, clamped to [min, max] (pure). */
function pinchScale(startDistance, distance, base = 1, min = 0.5, max = 4) {
    if (!startDistance)
        return base;
    return clamp(base * (distance / startDistance), min, max);
}
const pid = (e) => (typeof e.pointerId === 'number' ? e.pointerId : 1);
/**
 * One recognizer for pan, swipe, pinch (two pointers or Ctrl + wheel),
 * long-press, tap and double-tap, with velocities ready to hand to a spring
 * (`createSpring().set(target, velocity)`). Works with mouse, touch and pen
 * through Pointer Events. Returns a cleanup function.
 *
 * @example
 * const x = createSpring({ onUpdate: (v) => (card.style.translate = `${v}px`) });
 * gesture(card, {
 *   onPan: ({ dx, last, vx }) => (last ? x.set(0, vx) : x.jump(dx)),
 *   onSwipe: ({ direction }) => dismiss(direction),
 * }, { axis: 'x' });
 */
function gesture(el, h, o = {}) {
    const pts = new Map();
    let start = { x: 0, y: 0 };
    let last = { x: 0, y: 0, t: 0 };
    let vx = 0;
    let vy = 0;
    let panning = false;
    let pinch = null;
    let pinchScaleNow = 1;
    let press;
    let pressed = false;
    let lastTap = -1e9;
    const th = o.threshold ?? 4;
    const dist = () => {
        const [a, b] = [...pts.values()];
        return Math.hypot(a.x - b.x, a.y - b.y);
    };
    const mid = () => {
        const [a, b] = [...pts.values()];
        return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    };
    const t = (e) => (e.timeStamp || Date.now());
    const down = (e) => {
        pts.set(pid(e), { x: e.clientX, y: e.clientY });
        try {
            el.setPointerCapture?.(pid(e));
        }
        catch { /* jsdom / synthetic */ }
        if (pts.size === 2 && h.onPinch) {
            clearTimeout(press);
            if (panning)
                h.onPan?.({ dx: last.x - start.x, dy: last.y - start.y, vx: 0, vy: 0, first: false, last: true, event: e });
            panning = false;
            pinch = { d0: dist(), first: true };
            return;
        }
        if (pts.size > 1)
            return;
        start = { x: e.clientX, y: e.clientY };
        last = { ...start, t: t(e) };
        vx = vy = 0;
        pressed = false;
        if (h.onLongPress)
            press = setTimeout(() => { pressed = true; h.onLongPress?.({ x: start.x, y: start.y }); }, o.longPress ?? 500);
    };
    const move = (e) => {
        if (!pts.has(pid(e)))
            return;
        pts.set(pid(e), { x: e.clientX, y: e.clientY });
        if (pinch && pts.size >= 2) {
            const m = mid();
            pinchScaleNow = pinchScale(pinch.d0, dist(), 1, 0.05, 20);
            h.onPinch?.({ scale: pinchScaleNow, x: m.x, y: m.y, first: pinch.first, last: false });
            pinch.first = false;
            return;
        }
        const dx = e.clientX - start.x;
        const dy = e.clientY - start.y;
        const dt = Math.max(1, t(e) - last.t) / 1000;
        vx = (e.clientX - last.x) / dt;
        vy = (e.clientY - last.y) / dt;
        last = { x: e.clientX, y: e.clientY, t: t(e) };
        if (!panning) {
            const off = o.axis === 'x' ? Math.abs(dx) : o.axis === 'y' ? Math.abs(dy) : Math.hypot(dx, dy);
            if (off < th)
                return;
            clearTimeout(press);
            if (o.axis && Math.abs(o.axis === 'x' ? dy : dx) > off) {
                pts.delete(pid(e));
                return;
            } // wrong axis: let the page scroll
            panning = true;
            h.onPan?.({ dx: o.axis === 'y' ? 0 : dx, dy: o.axis === 'x' ? 0 : dy, vx, vy, first: true, last: false, event: e });
            return;
        }
        if (e.cancelable)
            e.preventDefault();
        h.onPan?.({ dx: o.axis === 'y' ? 0 : dx, dy: o.axis === 'x' ? 0 : dy, vx, vy, first: false, last: false, event: e });
    };
    const up = (e) => {
        if (!pts.has(pid(e)))
            return;
        pts.delete(pid(e));
        clearTimeout(press);
        if (pinch) {
            if (pts.size < 2) {
                h.onPinch?.({ scale: pinchScaleNow, ...start, first: false, last: true });
                pinch = null;
                pts.clear();
            }
            return;
        }
        const dx = e.clientX - start.x;
        const dy = e.clientY - start.y;
        if (panning) {
            panning = false;
            if (t(e) - last.t > 80)
                vx = vy = 0; // paused before release
            h.onPan?.({ dx: o.axis === 'y' ? 0 : dx, dy: o.axis === 'x' ? 0 : dy, vx, vy, first: false, last: true, event: e });
            const s = swipeDirection(dx, dy, vx, vy, { distance: o.swipeDistance, velocity: o.swipeVelocity, axis: o.axis });
            if (s)
                h.onSwipe?.(s);
            return;
        }
        if (pressed || e.type === 'pointercancel')
            return;
        const p = { x: e.clientX, y: e.clientY };
        const n = t(e);
        if (h.onDoubleTap && n - lastTap < 300) {
            lastTap = -1e9;
            h.onDoubleTap(p);
            return;
        }
        lastTap = n;
        h.onTap?.(p);
    };
    const wheel = (e) => {
        if (!h.onPinch || o.wheelPinch === false || !e.ctrlKey)
            return;
        e.preventDefault();
        const s = Math.exp(-e.deltaY / 100);
        h.onPinch({ scale: s, x: e.clientX, y: e.clientY, first: true, last: true });
    };
    const opts = { passive: false };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move, opts);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('wheel', wheel, opts);
    if (o.axis && !el.style.touchAction)
        el.style.touchAction = o.axis === 'x' ? 'pan-y' : 'pan-x';
    else if (!o.axis && !el.style.touchAction && (h.onPan || h.onPinch))
        el.style.touchAction = 'none';
    return () => {
        clearTimeout(press);
        el.removeEventListener('pointerdown', down);
        el.removeEventListener('pointermove', move, opts);
        el.removeEventListener('pointerup', up);
        el.removeEventListener('pointercancel', up);
        el.removeEventListener('wheel', wheel, opts);
    };
}

var css$4 = "";

function defineSwipeable(tag = 'usa-swipeable') {
    return defineElement(tag, (Base) => class UsaSwipeable extends Base {
        constructor() {
            super(...arguments);
            this._off = 0;
        }
        static get observedAttributes() {
            return ['axis', 'disabled', 'distance', 'dismiss', 'preset'];
        }
        get offset() {
            return this._off;
        }
        put(v) {
            this._off = v;
            this.style.setProperty('--usa-swipe', `${v}px`);
            this.style.setProperty('--usa-swipe-p', String(Math.min(1, Math.abs(v) / this.num('distance', 120))));
        }
        swipe(direction) {
            if (!this.emit('swipe', { direction }))
                return this.reset();
            const sign = direction === 'left' || direction === 'up' ? -1 : 1;
            const far = sign * ((this.str('axis', 'x') === 'y' ? this.offsetHeight : this.offsetWidth) + 80 || 600);
            const done = () => {
                this.emit('dismiss', { direction });
                if (this.flag('dismiss'))
                    this.remove();
            };
            if (this.reduced) {
                this.put(0);
                return done();
            }
            this.setAttribute('data-gone', '');
            this._s = createSpring({ spring: 'stiff', value: this._off, onUpdate: (v) => this.put(v), onRest: done });
            this._s.set(far, sign * 1500);
        }
        reset() {
            this.removeAttribute('data-gone');
            if (this.reduced)
                return this.put(0);
            this._s.set(0);
        }
        mount() {
            this._s = createSpring({ spring: this.str('preset', 'default'), onUpdate: (v) => this.put(v) });
            if (!this.hasAttribute('tabindex'))
                this.tabIndex = 0;
            const y = this.str('axis', 'x') === 'y';
            const max = () => this.num('distance', 120);
            this.onCleanup(gesture(this, {
                onPan: ({ dx, dy, vx, vy, last }) => {
                    if (this.flag('disabled'))
                        return;
                    const d = y ? dy : dx;
                    if (!last) {
                        this._s.stop();
                        if (!this.reduced)
                            this.put(Math.abs(d) > max() ? Math.sign(d) * (max() + (Math.abs(d) - max()) * 0.35) : d);
                        return;
                    }
                    if (Math.abs(d) > max())
                        this.swipe(y ? (d > 0 ? 'down' : 'up') : d > 0 ? 'right' : 'left');
                    else if (!this.hasAttribute('data-gone')) {
                        if (this.reduced)
                            this.put(0);
                        else
                            this._s.set(0, y ? vy : vx);
                    }
                },
                onSwipe: ({ direction }) => {
                    if (this.flag('disabled') || this.hasAttribute('data-gone'))
                        return;
                    if (y === (direction === 'up' || direction === 'down'))
                        this.swipe(direction);
                },
            }, { axis: y ? 'y' : 'x' }));
            this.listen(this, 'keydown', (e) => {
                if (this.flag('disabled'))
                    return;
                const map = y ? { ArrowUp: 'up', ArrowDown: 'down' } : { ArrowLeft: 'left', ArrowRight: 'right' };
                if (e.key === 'Delete' || e.key === 'Backspace')
                    this.swipe(y ? 'up' : 'left');
                else if (map[e.key])
                    this.swipe(map[e.key]);
                else
                    return;
                e.preventDefault();
            });
        }
        unmount() {
            this._s?.stop();
        }
    }, { id: 'gesture', text: css$4 });
}

function definePinchZoom(tag = 'usa-pinch-zoom') {
    return defineElement(tag, (Base) => class UsaPinchZoom extends Base {
        constructor() {
            super(...arguments);
            this._v = { k: 1, x: 0, y: 0 };
        }
        static get observedAttributes() {
            return ['min', 'max', 'preset', 'double-tap'];
        }
        get scale() {
            return this._v.k;
        }
        paint() {
            const { k, x, y } = this._v;
            this.style.setProperty('--usa-zoom', String(k));
            this.style.setProperty('--usa-zoom-x', `${x}px`);
            this.style.setProperty('--usa-zoom-y', `${y}px`);
            this.toggleAttribute('data-zoomed', k > 1.01);
        }
        bound(k, x, y) {
            const w = (this.clientWidth * (k - 1)) / 2;
            const h = (this.clientHeight * (k - 1)) / 2;
            return { x: clamp(x, -w, w), y: clamp(y, -h, h) };
        }
        zoomTo(scale) {
            const k = clamp(scale, this.num('min', 1), this.num('max', 4));
            const b = this.bound(k, this._v.x, this._v.y);
            if (this.reduced) {
                this._v = { k, ...b };
                this.paint();
            }
            else {
                this._k.set(k);
                this._x.set(b.x);
                this._y.set(b.y);
            }
            this.emit('zoom', { scale: k });
        }
        mount() {
            const preset = this.str('preset', 'gentle');
            this._k = createSpring({ spring: preset, value: this._v.k, onUpdate: (v) => ((this._v.k = v), this.paint()) });
            this._x = createSpring({ spring: preset, value: this._v.x, onUpdate: (v) => ((this._v.x = v), this.paint()) });
            this._y = createSpring({ spring: preset, value: this._v.y, onUpdate: (v) => ((this._v.y = v), this.paint()) });
            if (!this.hasAttribute('tabindex'))
                this.tabIndex = 0;
            let base = 1;
            let ox = 0;
            let oy = 0;
            this.onCleanup(gesture(this, {
                onPinch: ({ scale, first, last }) => {
                    if (first)
                        base = this._v.k;
                    const k = clamp(base * scale, this.num('min', 1) * 0.7, this.num('max', 4) * 1.3);
                    if (last)
                        return this.zoomTo(k);
                    this._k.jump(k);
                },
                onPan: ({ dx, dy, vx, vy, first, last }) => {
                    if (this._v.k <= 1.01)
                        return;
                    if (first)
                        ((ox = this._v.x), (oy = this._v.y));
                    if (!last) {
                        this._x.jump(ox + dx);
                        this._y.jump(oy + dy);
                        return;
                    }
                    const b = this.bound(this._v.k, ox + dx + vx * 0.15, oy + dy + vy * 0.15);
                    this._x.set(b.x, vx);
                    this._y.set(b.y, vy);
                },
                onDoubleTap: () => this.zoomTo(this._v.k > 1.01 ? 1 : this.num('double-tap', 2)),
            }));
            this.listen(this, 'keydown', (e) => {
                if (e.key === '+' || e.key === '=')
                    this.zoomTo(this._v.k * 1.25);
                else if (e.key === '-')
                    this.zoomTo(this._v.k / 1.25);
                else if (e.key === '0')
                    this.zoomTo(1);
                else
                    return;
                e.preventDefault();
            });
            this.paint();
        }
        unmount() {
            [this._k, this._x, this._y].forEach((s) => s?.stop());
        }
    }, { id: 'gesture', text: css$4 });
}

/**
 * motionary/components/gesture — unified gestures (v3.2).
 * `gesture()` recognises pan, swipe, pinch, long-press, tap and double-tap
 * with release velocities for springs; `<usa-swipeable>` (swipe-to-dismiss)
 * and `<usa-pinch-zoom>` are built on it.
 */
/** Register every component of this category under its default tag. */
function defineGestureComponents() {
    defineSwipeable();
    definePinchZoom();
}

/**
 * 11.8 (component contract · keyboard): a host that acts on click becomes keyboard-reachable — `tabindex="0"` and
 * `role="button"` unless the page set them or a focusable control is inside, and Enter / Space on the host → `click()`.
 * Both attributes are removed again on disconnect.
 */
function keyClick(el) {
    if (el.querySelector('a[href],button,input,select,textarea,summary,[tabindex]'))
        return;
    for (const [n, v] of [['tabindex', '0'], ['role', 'button']]) {
        if (el.hasAttribute(n))
            continue;
        el.setAttribute(n, v);
        el.onCleanup(() => el.removeAttribute(n));
    }
    el.listen(el, 'keydown', (e) => {
        if (e.target !== el || (e.key !== 'Enter' && e.key !== ' '))
            return;
        e.preventDefault();
        el.click();
    });
}

const NUM = /-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi;
/** `true` when two path strings share the same commands (so their numbers can be interpolated). */
function pathsCompatible(a, b) {
    return a.replace(NUM, '#').replace(/[\s,]+/g, ' ').trim() === b.replace(NUM, '#').replace(/[\s,]+/g, ' ').trim();
}
/**
 * Path data between `a` and `b` at `t` (0–1). Paths with the same command
 * structure morph number-by-number; others switch at the midpoint.
 */
function interpolatePath(a, b, t) {
    if (t <= 0)
        return a;
    if (t >= 1)
        return b;
    if (!pathsCompatible(a, b))
        return t < 0.5 ? a : b;
    const nb = b.match(NUM) || [];
    let i = 0;
    return a.replace(NUM, (n) => {
        const v = Number(n) + (Number(nb[i++]) - Number(n)) * t;
        return String(Math.round(v * 1000) / 1000);
    });
}
const ease = (t) => 1 - Math.pow(1 - t, 3);
/** Animate a `<path>`'s `d` to `to`. Resolves when done; instant under reduced motion. */
function morphTo(path, to, o = {}) {
    const from = path.getAttribute('d') || to;
    const dur = (o.duration ?? 500) * motionScale();
    const prev = path.__usaMorph;
    if (prev)
        caf(prev);
    if (prefersReducedMotion() || dur <= 0 || from === to) {
        path.setAttribute('d', to);
        return Promise.resolve();
    }
    const fn = o.easing || ease;
    const t0 = now();
    return new Promise((resolve) => {
        const step = () => {
            const t = clamp((now() - t0) / dur, 0, 1);
            path.setAttribute('d', interpolatePath(from, to, fn(t)));
            if (t < 1)
                path.__usaMorph = raf(step);
            else {
                path.__usaMorph = 0;
                resolve();
            }
        };
        path.__usaMorph = raf(step);
    });
}
const DRAWABLE = 'path, line, polyline, polygon, circle, ellipse, rect';
/**
 * Prepare every stroke in `root` for line drawing (normalised `pathLength=1`,
 * so no `getTotalLength()` is needed) and return a function that sets
 * progress 0–1, optionally staggered between shapes.
 */
function drawLines(root, o = {}) {
    const shapes = Array.from(root.querySelectorAll(DRAWABLE));
    shapes.forEach((s) => {
        s.setAttribute('pathLength', '1');
        s.style.strokeDasharray = '1 1';
    });
    const st = clamp(o.stagger ?? 0, 0, 0.9);
    return (p) => {
        const n = shapes.length;
        shapes.forEach((s, i) => {
            const start = n > 1 ? (i / (n - 1)) * st : 0;
            const local = clamp((p - start) / (1 - st || 1), 0, 1);
            s.style.strokeDashoffset = String(1 - local);
        });
    };
}

var css$3 = "";

function defineDraw(tag = 'usa-draw') {
    return defineElement(tag, (Base) => class UsaDraw extends Base {
        constructor() {
            super(...arguments);
            this._set = () => { };
            this._p = 0;
            this._id = 0;
        }
        static get observedAttributes() {
            return ['duration', 'stagger', 'trigger', 'repeat'];
        }
        get progress() {
            return this._p;
        }
        set progress(p) {
            this._p = clamp(p, 0, 1);
            this._set(this._p);
            this.toggleAttribute('data-drawn', this._p >= 1);
        }
        play() {
            caf(this._id);
            if (this.reduced) {
                this.progress = 1;
                return void this.emit('complete');
            }
            const dur = this.num('duration', 1600) * motionScale();
            const t0 = now();
            this.progress = 0;
            const step = () => {
                this.progress = (now() - t0) / dur;
                if (this._p < 1)
                    this._id = raf(step);
                else
                    this.emit('complete');
            };
            this._id = raf(step);
        }
        mount() {
            this._set = drawLines(this, { stagger: this.num('stagger', 0.2) });
            const trigger = this.str('trigger', 'view');
            if (this.reduced) {
                this.progress = 1;
                return;
            }
            this.progress = 0;
            if (trigger === 'scrub') {
                const update = () => {
                    const r = this.getBoundingClientRect();
                    const vh = window.innerHeight || 1;
                    this.progress = (vh - r.top) / (vh * 0.6 + r.height * 0.4 || 1);
                };
                this.listen(window, 'scroll', update, { passive: true });
                update();
            }
            else if (trigger === 'hover')
                this.listen(this, 'pointerenter', () => this.play());
            else if (trigger === 'click') {
                this.listen(this, 'click', () => this.play());
                keyClick(this);
            }
            else {
                let done = false;
                this.inView((v) => {
                    if (v && (!done || this.flag('repeat'))) {
                        done = true;
                        this.play();
                    }
                    else if (!v && this.flag('repeat'))
                        this.progress = 0;
                }, { threshold: 0.3 });
            }
            this.onCleanup(() => caf(this._id));
        }
    }, { id: 'svg', text: css$3 });
}

function defineMorph(tag = 'usa-morph') {
    return defineElement(tag, (Base) => class UsaMorph extends Base {
        constructor() {
            super(...arguments);
            this._i = 0;
            this._path = null;
        }
        static get observedAttributes() {
            return ['paths', 'trigger', 'duration', 'interval'];
        }
        get index() {
            return this._i;
        }
        list() {
            return this.str('paths').split('|').map((s) => s.trim()).filter(Boolean);
        }
        next() {
            const l = this.list();
            if (!this._path || l.length < 2)
                return Promise.resolve();
            this._i = (this._i + 1) % l.length;
            this.emit('change', { index: this._i });
            return morphTo(this._path, l[this._i], { duration: this.num('duration', 600) });
        }
        mount() {
            let path = this.querySelector('path');
            if (!path) {
                this.innerHTML = '<svg viewBox="0 0 100 100" aria-hidden="true"><path></path></svg>';
                path = this.querySelector('path');
            }
            this._path = path;
            const l = this.list();
            if (l[0])
                this._path.setAttribute('d', l[this._i % l.length]);
            const t = this.str('trigger', 'click');
            if (t === 'hover') {
                this.listen(this, 'pointerenter', () => void this.next());
                this.listen(this, 'pointerleave', () => void this.next());
            }
            else if (t === 'auto' || t === 'view') {
                let timer;
                this.inView((v) => {
                    clearInterval(timer);
                    if (!v || this.reduced)
                        return;
                    if (t === 'view')
                        return void this.next();
                    timer = setInterval(() => void this.next(), this.num('interval', 2000));
                });
                this.onCleanup(() => clearInterval(timer));
            }
            else {
                if (!this.hasAttribute('tabindex'))
                    this.tabIndex = 0;
                if (!this.hasAttribute('role'))
                    this.setAttribute('role', 'button');
                this.listen(this, 'click', () => void this.next());
                this.listen(this, 'keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        void this.next();
                    }
                });
            }
        }
    }, { id: 'svg', text: css$3 });
}

/** Clip-path start / end frames for each reveal shape. */
const MASK_SHAPES = {
    circle: ['circle(0% at 50% 50%)', 'circle(75% at 50% 50%)'],
    diamond: ['polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)', 'polygon(50% -50%, 150% 50%, 50% 150%, -50% 50%)'],
    wipe: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'],
    'wipe-up': ['inset(100% 0 0 0)', 'inset(0% 0 0 0)'],
    iris: ['inset(50% 50% 50% 50% round 50%)', 'inset(0% 0% 0% 0% round 0%)'],
    star: [
        'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%)',
        'polygon(50% -60%, 80% 20%, 160% 30%, 95% 85%, 115% 170%, 50% 125%, -15% 170%, 5% 85%, -60% 30%, 20% 20%)',
    ],
};
function defineMaskReveal(tag = 'usa-mask-reveal') {
    return defineElement(tag, (Base) => class UsaMaskReveal extends Base {
        static get observedAttributes() {
            return ['shape', 'at', 'duration', 'delay', 'trigger', 'repeat'];
        }
        frames() {
            const s = MASK_SHAPES[this.str('shape', 'circle')] || MASK_SHAPES.circle;
            const at = this.str('at');
            return at && s[0].startsWith('circle') ? [s[0].replace('50% 50%', at), s[1].replace('50% 50%', at)] : s;
        }
        reveal() {
            const [a, b] = this.frames();
            this.setAttribute('data-state', 'revealing');
            // fill 'both' keeps the closed mask applied during `delay`
            const anim = this.motion(this, [{ clipPath: a }, { clipPath: b }], { duration: this.num('duration', 900), delay: this.num('delay', 0), easing: EASE_OUT, fill: 'both' });
            this.style.opacity = '';
            const done = () => {
                this.setAttribute('data-state', 'visible');
                this.emit('complete');
            };
            if (!anim)
                return Promise.resolve(done());
            return anim.finished.then(done, () => { });
        }
        mount() {
            if (this.reduced) {
                this.setAttribute('data-state', 'visible');
                return;
            }
            // 4.0.1: hide with opacity, not the closed clip-path — Chromium's
            // IntersectionObserver honours the target's own clip-path, so a fully
            // clipped element never reports as intersecting and never revealed.
            const hide = () => {
                this.getAnimations?.().forEach((x) => x.cancel());
                this.style.opacity = '0';
                this.setAttribute('data-state', 'hidden');
            };
            hide();
            this.onCleanup(() => ((this.style.opacity = ''), (this.style.clipPath = '')));
            const t = this.str('trigger', 'view');
            if (t === 'hover')
                this.listen(this, 'pointerenter', () => void this.reveal());
            else if (t === 'click') {
                this.listen(this, 'click', () => void this.reveal());
                keyClick(this);
            }
            else {
                let done = false;
                this.inView((v) => {
                    if (v && (!done || this.flag('repeat'))) {
                        done = true;
                        void this.reveal();
                    }
                    else if (!v && this.flag('repeat'))
                        hide();
                }, { threshold: 0.25 });
            }
        }
    }, { id: 'svg', text: css$3 });
}

/** Built-in animated icons (24×24 strokes) and the motion each one plays. */
const ANIM_ICONS = {
    bell: { d: 'M6 16V11a6 6 0 0 1 12 0v5l2 2H4l2-2M10 20a2 2 0 0 0 4 0', duration: 800, origin: '50% 10%', frames: [{ rotate: '0deg' }, { rotate: '18deg' }, { rotate: '-14deg' }, { rotate: '9deg' }, { rotate: '-5deg' }, { rotate: '0deg' }] },
    heart: { d: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z', duration: 600, frames: [{ scale: 1 }, { scale: 1.3 }, { scale: 0.92 }, { scale: 1.12 }, { scale: 1 }] },
    check: { d: 'M4 12.5l5 5L20 6.5', duration: 600, frames: [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }] },
    arrow: { d: 'M4 12h15M13 6l6 6-6 6', duration: 600, frames: [{ translate: '0 0' }, { translate: '5px 0' }, { translate: '0 0' }] },
    star: { d: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z', duration: 700, frames: [{ rotate: '0deg', scale: 1 }, { rotate: '72deg', scale: 1.2 }, { rotate: '144deg', scale: 1 }] },
    gear: { d: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1', duration: 900, frames: [{ rotate: '0deg' }, { rotate: '180deg' }] },
    search: { d: 'M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM15.5 15.5L20 20', duration: 700, frames: [{ rotate: '0deg' }, { rotate: '-15deg' }, { rotate: '10deg' }, { rotate: '0deg' }] },
    download: { d: 'M12 4v11M7 10l5 5 5-5M5 20h14', duration: 700, frames: [{ translate: '0 0' }, { translate: '0 3px' }, { translate: '0 0' }] },
};
function defineAnimIcon(tag = 'usa-anim-icon') {
    return defineElement(tag, (Base) => class UsaAnimIcon extends Base {
        static get observedAttributes() {
            return ['name', 'size', 'label', 'trigger'];
        }
        icon() {
            return ANIM_ICONS[this.str('name', 'heart')] || ANIM_ICONS.heart;
        }
        play() {
            if (this.reduced)
                return;
            const svg = this.querySelector('svg');
            const i = this.icon();
            const target = i.frames[0].strokeDashoffset !== undefined ? this.querySelector('path') : svg;
            if (target)
                this.motion(target, i.frames, { duration: i.duration, easing: 'ease-in-out', iterations: this.str('trigger') === 'loop' ? Infinity : 1 });
        }
        mount() {
            const i = this.icon();
            const size = this.num('size', 24);
            const label = this.str('label');
            this.innerHTML = `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform-origin:${i.origin || '50% 50%'}"${label ? ` role="img" aria-label="${label.replace(/"/g, '&quot;')}"` : ' aria-hidden="true"'}><path d="${i.d}"${i.frames[0].strokeDashoffset !== undefined ? ' pathLength="1" stroke-dasharray="1"' : ''}></path></svg>`;
            const t = this.str('trigger', 'hover');
            if (t === 'click') {
                this.listen(this, 'click', () => this.play());
                keyClick(this);
            }
            else if (t === 'view' || t === 'loop')
                this.inView((v) => v && this.play(), { threshold: 0.5 });
            else {
                this.listen(this, 'pointerenter', () => this.play());
                this.listen(this, 'focusin', () => this.play());
            }
        }
    }, { id: 'svg', text: css$3 });
}

/**
 * motionary/components/svg — SVG animation (v3.3).
 * `<usa-draw>` (line drawing), `<usa-morph>` (path morph), `<usa-mask-reveal>`
 * (mask / clip-path reveals) and `<usa-anim-icon>` (animated icons), plus
 * `interpolatePath()`, `morphTo()`, `drawLines()`.
 */
/** Register every component of this category under its default tag. */
function defineSvgComponents() {
    defineDraw();
    defineMorph();
    defineMaskReveal();
    defineAnimIcon();
}

/** Minimal WebGL runner: one full-canvas quad, one fragment shader, optional image texture. */
const VERTEX = 'attribute vec2 p;varying vec2 v_uv;void main(){v_uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
const HEAD = 'precision mediump float;varying vec2 v_uv;uniform float u_time;uniform vec2 u_resolution;uniform vec2 u_mouse;uniform float u_hover;uniform sampler2D u_tex;uniform vec4 u_ripples[4];\n';
/** Built-in fragment shaders (bodies; uniforms `u_time`, `u_resolution`, `u_mouse` 0–1, `u_hover` 0–1, `u_tex`, `u_ripples[4]` = x, y, age, strength). */
const SHADERS = {
    gradient: 'void main(){vec2 u=v_uv;float t=u_time*.15;vec3 a=vec3(.39,.4,.95),b=vec3(.93,.29,.6),c=vec3(.13,.83,.93);float k=.5+.5*sin(u.x*3.+t*2.)*cos(u.y*2.-t);vec3 col=mix(mix(a,b,u.x+.2*sin(t)),c,k*.6);gl_FragColor=vec4(col,1.);}',
    plasma: 'void main(){vec2 u=v_uv*4.;float t=u_time*.6;float v=sin(u.x+t)+sin(u.y+t*.7)+sin(u.x+u.y+t*.5)+sin(length(u-2.+vec2(sin(t),cos(t)))*2.);vec3 col=.5+.5*cos(v+vec3(0.,2.,4.));gl_FragColor=vec4(col,1.);}',
    waves: 'void main(){vec2 u=v_uv;float t=u_time*.4;float w=0.;for(int i=0;i<4;i++){float f=float(i)+1.;w+=sin(u.x*6.*f+t*f)*.08/f;}float l=smoothstep(.0,.02,abs(u.y-.5-w));vec3 col=mix(vec3(.2,.5,1.),vec3(.04,.06,.15),l)+vec3(.1,.0,.2)*u.y;gl_FragColor=vec4(col,1.);}',
    aurora: 'void main(){vec2 u=v_uv;float t=u_time*.2;float b=0.;for(int i=0;i<3;i++){float f=float(i);b+=.4/abs((u.y-.6+.15*sin(u.x*3.+t+f*1.7))*(8.+f*4.));}vec3 col=vec3(.02,.03,.08)+b*mix(vec3(.1,.9,.6),vec3(.6,.3,1.),u.x)*.35;gl_FragColor=vec4(col,1.);}',
    distort: 'void main(){vec2 u=v_uv;vec2 d=u-u_mouse;float r=length(d);float k=u_hover*.08*exp(-r*r*18.);u-=normalize(d+1e-4)*k;float s=u_hover*.006;vec3 col=vec3(texture2D(u_tex,u+vec2(s,0.)).r,texture2D(u_tex,u).g,texture2D(u_tex,u-vec2(s,0.)).b);gl_FragColor=vec4(col,1.);}',
    // 4.8 particle presets (procedural, one quad: no buffers, no per-particle JS)
    snow: 'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}void main(){vec2 u=v_uv;u.x*=u_resolution.x/max(u_resolution.y,1.);vec3 col=mix(vec3(.05,.08,.16),vec3(.12,.16,.3),v_uv.y);for(int l=0;l<3;l++){float s=8.+float(l)*7.;vec2 q=u*s;q.y+=u_time*(.6+float(l)*.35);q.x+=sin(q.y*.7+float(l))*.3;vec2 id=floor(q);vec2 f=fract(q)-.5;float r=h(id);if(r>.6){vec2 o=vec2(h(id+3.)-.5,h(id+7.)-.5)*.6;float d=length(f-o);col+=smoothstep(.09-float(l)*.02,0.,d)*(.5+.5*r);}}gl_FragColor=vec4(col,1.);}',
    fireflies: 'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}void main(){vec2 u=v_uv;u.x*=u_resolution.x/max(u_resolution.y,1.);vec3 col=vec3(.02,.04,.03);for(int l=0;l<2;l++){vec2 q=u*(5.+float(l)*4.);vec2 id=floor(q);vec2 f=fract(q)-.5;float r=h(id+float(l)*13.);vec2 o=.35*vec2(sin(u_time*(.4+r)+r*6.28),cos(u_time*(.3+r)+r*12.));float d=length(f-o);float tw=.5+.5*sin(u_time*3.*r+r*20.);col+=vec3(1.,.85,.3)*smoothstep(.12,0.,d)*tw*step(.45,r);}gl_FragColor=vec4(col,1.);}',
    stars: 'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}void main(){vec2 c=v_uv-.5;c.x*=u_resolution.x/max(u_resolution.y,1.);vec3 col=vec3(.01,.01,.04);for(int l=0;l<4;l++){float z=fract(float(l)*.25+u_time*.05);float sc=mix(20.,.5,z);vec2 q=c*sc+float(l)*7.;vec2 id=floor(q);vec2 f=fract(q)-.5;float r=h(id);float d=length(f-(vec2(h(id+1.),h(id+2.))-.5)*.7);col+=vec3(.8,.9,1.)*smoothstep(.06,0.,d)*step(.8,r)*smoothstep(0.,.5,z)*smoothstep(1.,.8,z)*2.;}gl_FragColor=vec4(col,1.);}',
    bokeh: 'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}void main(){vec2 u=v_uv;u.x*=u_resolution.x/max(u_resolution.y,1.);vec3 col=mix(vec3(.08,.03,.12),vec3(.02,.05,.12),v_uv.y);for(int l=0;l<3;l++){vec2 q=u*(2.5+float(l)*1.5);q.y-=u_time*.05*(1.+float(l));vec2 id=floor(q);vec2 f=fract(q)-.5;float r=h(id+float(l)*5.);float d=length(f-(vec2(h(id+4.),h(id+9.))-.5)*.5);vec3 tint=.5+.5*cos(r*6.28+vec3(0.,2.,4.));col+=tint*smoothstep(.3,.26,d)*.18*step(.35,r);}gl_FragColor=vec4(col,1.);}',
    rain: 'float h(float n){return fract(sin(n)*43758.5453);}void main(){vec2 u=v_uv;vec3 col=mix(vec3(.04,.06,.1),vec3(.1,.13,.2),u.y);float n=floor(u.x*120.);float sp=.8+h(n)*1.2;float y=fract(u.y+u_time*sp+h(n+1.));float drop=smoothstep(.0,.08,y)*smoothstep(.16,.08,y)*step(.7,h(n+2.));col+=vec3(.5,.6,.8)*drop*.6;gl_FragColor=vec4(col,1.);}',
    liquid: 'void main(){vec2 u=v_uv;vec2 o=vec2(0.);for(int i=0;i<4;i++){vec4 r=u_ripples[i];if(r.w>0.){float d=distance(u,r.xy);float w=sin(d*60.-r.z*12.)*exp(-d*6.)*exp(-r.z*1.6)*r.w*.02;o+=normalize(u-r.xy+1e-4)*w;}}o+=vec2(sin(u.y*10.+u_time),cos(u.x*10.+u_time))*.002*u_hover;gl_FragColor=texture2D(u_tex,u+o);}',
};
/** Full fragment source for a preset or custom body (adds the shared header). */
function fragmentSource(body) {
    const src = SHADERS[body] || body;
    return /precision\s+\w+\s+float/.test(src) ? src : HEAD + src;
}
/** `true` when the browser can create a WebGL context (cached). */
let support;
function supportsWebGL() {
    if (support !== undefined)
        return support;
    try {
        const c = typeof document !== 'undefined' ? document.createElement('canvas') : null;
        support = !!(c && (c.getContext('webgl')));
    }
    catch {
        support = false;
    }
    return support;
}
/** Compile `frag` on a full-canvas quad, or `null` when WebGL / compilation is unavailable. */
function glQuad(canvas, frag) {
    let gl = null;
    try {
        gl = (canvas.getContext('webgl', { premultipliedAlpha: false, antialias: false }));
    }
    catch {
        gl = null;
    }
    if (!gl)
        return null;
    const g = gl;
    const sh = (type, src) => {
        const s = g.createShader(type);
        g.shaderSource(s, src);
        g.compileShader(s);
        return g.getShaderParameter(s, g.COMPILE_STATUS) ? s : null;
    };
    const vs = sh(g.VERTEX_SHADER, VERTEX);
    const fs = sh(g.FRAGMENT_SHADER, fragmentSource(frag));
    if (!vs || !fs)
        return null;
    const prog = g.createProgram();
    g.attachShader(prog, vs);
    g.attachShader(prog, fs);
    g.linkProgram(prog);
    if (!g.getProgramParameter(prog, g.LINK_STATUS))
        return null;
    g.useProgram(prog);
    const buf = g.createBuffer();
    g.bindBuffer(g.ARRAY_BUFFER, buf);
    g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), g.STATIC_DRAW);
    const loc = g.getAttribLocation(prog, 'p');
    g.enableVertexAttribArray(loc);
    g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0);
    const U = (n) => g.getUniformLocation(prog, n);
    const uT = U('u_time'), uR = U('u_resolution'), uM = U('u_mouse'), uH = U('u_hover'), uRp = U('u_ripples');
    let tex = null;
    const extraLoc = {};
    const quad = {
        resize(scale = 1) {
            const dpr = Math.min(2, (typeof devicePixelRatio === 'number' && devicePixelRatio) || 1) * Math.min(1, Math.max(0.25, scale));
            const w = Math.max(1, Math.round((canvas.clientWidth || 300) * dpr));
            const h = Math.max(1, Math.round((canvas.clientHeight || 150) * dpr));
            if (canvas.width !== w || canvas.height !== h)
                ((canvas.width = w), (canvas.height = h));
            g.viewport(0, 0, w, h);
        },
        texture(img) {
            tex = tex || g.createTexture();
            g.bindTexture(g.TEXTURE_2D, tex);
            g.pixelStorei(g.UNPACK_FLIP_Y_WEBGL, true);
            g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE);
            g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
            g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR);
            g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, g.RGBA, g.UNSIGNED_BYTE, img);
        },
        render(u) {
            g.uniform1f(uT, u.time ?? 0);
            g.uniform2f(uR, canvas.width, canvas.height);
            g.uniform2f(uM, ...(u.mouse ?? [0.5, 0.5]));
            g.uniform1f(uH, u.hover ?? 0);
            if (uRp)
                g.uniform4fv(uRp, new Float32Array((u.ripples ?? []).concat(Array(16).fill(0)).slice(0, 16)));
            if (u.extra)
                for (const [k, v] of Object.entries(u.extra))
                    g.uniform1f((extraLoc[k] ?? (extraLoc[k] = U(k))), v);
            g.drawArrays(g.TRIANGLES, 0, 6);
        },
        dispose() {
            g.deleteProgram(prog);
            g.deleteBuffer(buf);
            if (tex)
                g.deleteTexture(tex);
            g.getExtension('WEBGL_lose_context')?.loseContext();
        },
    };
    quad.resize();
    return quad;
}

/**
 * 4.8 — WebGL preset library on `glQuad()`: particle presets (`snow`,
 * `fireflies`, `stars`, `bokeh`, `rain` — usable as `<usa-shader preset>`),
 * chainable post-processing passes for images (`<usa-post-fx>`), one CSS
 * fallback per preset, and an adaptive quality governor (fps + battery).
 */
const PARTICLE_PRESETS = ['snow', 'fireflies', 'stars', 'bokeh', 'rain'];
/** Post-processing passes: `vec3 fx(vec3 c, vec2 uv)` bodies, applied in order. `u_intensity` 0–1. */
const POST_EFFECTS = {
    vignette: 'c*=mix(1.,smoothstep(.85,.25,length(uv-.5)),u_intensity);',
    grain: 'c+=(fract(sin(dot(uv*u_resolution+u_time,vec2(12.9898,78.233)))*43758.5453)-.5)*.18*u_intensity;',
    chromatic: 'float s=.008*u_intensity;c=vec3(texture2D(u_tex,uv+vec2(s,0.)).r,c.g,texture2D(u_tex,uv-vec2(s,0.)).b);',
    scanlines: 'c*=1.-.25*u_intensity*step(.5,fract(uv.y*u_resolution.y*.5));',
    crt: 'vec2 d=uv-.5;float r=dot(d,d);c*=1.-.6*u_intensity*r;c*=.92+.08*sin(uv.y*u_resolution.y*3.14159);c.r*=1.+.05*u_intensity;',
    bloom: 'vec3 b=vec3(0.);for(int i=0;i<8;i++){float a=float(i)*.785;b+=max(texture2D(u_tex,uv+vec2(cos(a),sin(a))*.012).rgb-.6,0.);}c+=b*.35*u_intensity;',
    pixelate: 'float px=mix(1.,48.,u_intensity);vec2 g=floor(uv*u_resolution/px)*px/u_resolution;c=texture2D(u_tex,g+.5*px/u_resolution).rgb;',
    duotone: 'float l=dot(c,vec3(.299,.587,.114));c=mix(c,mix(vec3(.12,.05,.35),vec3(1.,.55,.4),l),u_intensity);',
    glitch: 'float k=step(.97,fract(sin(floor(uv.y*24.)+floor(u_time*6.))*4375.5));c=mix(c,texture2D(u_tex,uv+vec2(k*.04*u_intensity,0.)).rgb,k);',
};
/** One fragment shader running the passes in order over `u_tex` (pixel-sampling passes read the source). */
function postFxShader(effects) {
    const list = effects.filter((e) => POST_EFFECTS[e]);
    const body = list.map((e) => `{${POST_EFFECTS[e]}}`).join('');
    return `uniform float u_intensity;void main(){vec2 uv=v_uv;vec3 c=texture2D(u_tex,uv).rgb;${body}gl_FragColor=vec4(clamp(c,0.,1.),1.);}`;
}
/** The unified CSS fallback (no WebGL / reduced data): a still background or image filter per preset. */
const GL_FALLBACKS = {
    gradient: 'linear-gradient(120deg,#6366f1,#ec4899 50%,#22d3ee)',
    plasma: 'conic-gradient(from 90deg,#f43f5e,#a855f7,#06b6d4,#f43f5e)',
    waves: 'linear-gradient(#0a0f26,#1e3a8a)',
    aurora: 'radial-gradient(120% 60% at 30% 40%,#10b98155,transparent),radial-gradient(100% 50% at 70% 50%,#8b5cf655,transparent),#05070f',
    snow: 'radial-gradient(2px 2px at 20% 30%,#fff,transparent),radial-gradient(2px 2px at 70% 60%,#fff,transparent),radial-gradient(1.5px 1.5px at 40% 80%,#fff,transparent),linear-gradient(#0d1428,#1f2a4d)',
    fireflies: 'radial-gradient(3px 3px at 25% 40%,#fde68a,transparent),radial-gradient(3px 3px at 65% 70%,#fde68a,transparent),#05090a',
    stars: 'radial-gradient(1px 1px at 10% 20%,#fff,transparent),radial-gradient(1px 1px at 80% 30%,#fff,transparent),radial-gradient(1.5px 1.5px at 50% 70%,#cfe0ff,transparent),#02020a',
    bokeh: 'radial-gradient(40px 40px at 30% 40%,#f472b633,transparent),radial-gradient(60px 60px at 70% 60%,#60a5fa33,transparent),#140820',
    rain: 'repeating-linear-gradient(100deg,#ffffff10 0 1px,transparent 1px 14px),linear-gradient(#0a0f1a,#1a2133)',
    // post-fx fallbacks are CSS filters on the <img>
    'post:duotone': 'grayscale(1) sepia(.6) hue-rotate(220deg) saturate(2)',
    'post:vignette': 'brightness(.95) contrast(1.05)',
    'post:crt': 'contrast(1.15) saturate(1.2)',
    'post:bloom': 'brightness(1.08) saturate(1.15)',
};
/** CSS fallback for a shader preset / post effect list. */
function glFallbackCss(preset, post = false) {
    if (post)
        return preset.split(/\s+/).map((e) => GL_FALLBACKS[`post:${e}`]).filter(Boolean).join(' ');
    return GL_FALLBACKS[preset] || GL_FALLBACKS.gradient;
}
/**
 * Adaptive quality for GL loops: measures fps, steps the resolution scale
 * down (1 → 0.5 → 0.35) after two slow seconds and back up after five good
 * ones, and caps the frame rate in battery-saver mode. Pure — feed it times.
 */
function glGovernor(options = {}) {
    const { minFps = 40, saverFps = 30 } = options;
    const STEPS = [1, 0.5, 0.35];
    let step = 0;
    let frames = 0;
    let winStart = -1;
    let last = -Infinity;
    let slow = 0;
    let good = 0;
    let fps = 60;
    const g = {
        saver: false,
        get scale() {
            return Math.min(STEPS[step], g.saver ? 0.6 : 1);
        },
        get fps() {
            return fps;
        },
        tick(t) {
            if (winStart < 0)
                winStart = t;
            if (g.saver && t - last < 1000 / saverFps - 1)
                return false;
            last = t;
            frames++;
            if (t - winStart >= 1000) {
                fps = Math.round((frames * 1000) / (t - winStart));
                frames = 0;
                winStart = t;
                const before = g.scale;
                if (fps < minFps && !g.saver) {
                    good = 0;
                    if (++slow >= 2 && step < STEPS.length - 1)
                        ((step++), (slow = 0));
                }
                else {
                    slow = 0;
                    if (++good >= 5 && step > 0)
                        ((step--), (good = 0));
                }
                if (g.scale !== before)
                    g.onScale?.(g.scale);
            }
            return true;
        },
    };
    return g;
}
/** Watch the Battery Status API (where available) and Save-Data; calls `cb(true)` in saver conditions. Returns a stop function. */
function watchPowerSaver(cb) {
    let stopped = false;
    const nav = (typeof navigator !== 'undefined' ? navigator : {});
    const saveData = !!nav.connection?.saveData;
    if (saveData)
        cb(true);
    if (typeof nav.getBattery !== 'function')
        return () => undefined;
    let battery = null;
    const update = () => !stopped && cb(saveData || (!!battery && !battery.charging && battery.level <= 0.2));
    nav.getBattery().then((b) => {
        battery = b;
        update();
        b.addEventListener?.('levelchange', update);
        b.addEventListener?.('chargingchange', update);
    }, () => undefined);
    return () => {
        stopped = true;
        battery?.removeEventListener?.('levelchange', update);
        battery?.removeEventListener?.('chargingchange', update);
    };
}

var css$2 = "";

function make(kind) {
    return (Base) => class extends Base {
        constructor() {
            super(...arguments);
            this._q = null;
            this._c = null;
            this._id = 0;
            this._mouse = [0.5, 0.5];
            this._hover = 0;
            this._hoverTo = 0;
            this._ripples = [];
            this._scale = 1;
        }
        static get observedAttributes() {
            return kind === 'shader' ? ['preset', 'speed', 'quality'] : kind === 'post' ? ['effects', 'intensity', 'quality'] : ['src'];
        }
        get active() {
            return !!this._q;
        }
        fallback(reason) {
            this.setAttribute('data-fallback', reason);
            // 4.8 unified fallback: a still CSS rendering of the preset / effects
            if (reason !== 'off') {
                if (kind === 'shader')
                    this.style.setProperty('--usa-gl-fallback', glFallbackCss(this.str('preset', 'gradient')));
                if (kind === 'post')
                    this.style.setProperty('--usa-gl-filter', glFallbackCss(this.str('effects', 'vignette grain'), true) || 'none');
            }
            this._c?.remove();
            this._c = null;
            this._q?.dispose();
            this._q = null;
        }
        frame() {
            const q = this._q;
            if (!q)
                return;
            this._hover += (this._hoverTo - this._hover) * 0.12;
            const t = now();
            this._ripples = this._ripples.filter((r) => t - r.t < 2500);
            q.render({
                time: (t / 1000) * this.num('speed', 1),
                mouse: this._mouse,
                hover: this._hover,
                ripples: this._ripples.flatMap((r) => [r.x, r.y, (t - r.t) / 1000, this.num('strength', 1)]),
                extra: kind === 'post' ? { u_intensity: clamp(this.num('intensity', 0.6), 0, 1) } : undefined,
            });
        }
        mount() {
            this.removeAttribute('data-fallback');
            const custom = this.querySelector('script[type="x-shader/x-fragment"]');
            const frag = kind === 'shader' ? custom?.textContent || this.str('preset', 'gradient') : kind === 'post' ? postFxShader(this.str('effects', 'vignette grain').split(/[\s,]+/)) : kind;
            const img = kind === 'shader' ? null : this.querySelector('img');
            if (kind !== 'shader' && !img)
                return this.fallback('no-image');
            const c = (this._c = document.createElement('canvas'));
            c.setAttribute('aria-hidden', 'true');
            c.className = 'usa-gl';
            this.prepend(c);
            const q = (this._q = glQuad(c, frag));
            if (!q)
                return this.fallback('webgl');
            this.onCleanup(() => this.fallback('off'));
            const start = () => {
                if (!img)
                    return true;
                try {
                    q.texture(img);
                    return true;
                }
                catch {
                    this.fallback('image');
                    return false;
                }
            };
            const draw = () => {
                q.resize(this._scale);
                this.frame();
            };
            // 13.1.0: an image that already failed (re-connect after a 404) fires no more events — fall back now
            if (img && img.complete && !img.naturalWidth && img.currentSrc)
                return this.fallback('image');
            if (img && !(img.complete && img.naturalWidth)) {
                if (!img.crossOrigin && /^https?:/.test(img.src) && !img.src.startsWith(location.origin))
                    img.crossOrigin = 'anonymous';
                this.listen(img, 'load', () => start() && draw());
                this.listen(img, 'error', () => this.fallback('image'));
            }
            else if (!start())
                return;
            this.setAttribute('data-active', '');
            this.onCleanup(() => this.removeAttribute('data-active'));
            draw();
            if (kind === 'distort' || kind === 'liquid') {
                const pos = (e) => {
                    const r = this.getBoundingClientRect();
                    this._mouse = [clamp((e.clientX - r.left) / (r.width || 1), 0, 1), clamp(1 - (e.clientY - r.top) / (r.height || 1), 0, 1)];
                };
                this.listen(this, 'pointermove', pos);
                this.listen(this, 'pointerenter', (e) => (pos(e), (this._hoverTo = 1)));
                this.listen(this, 'pointerleave', () => (this._hoverTo = 0));
                if (kind === 'liquid')
                    this.listen(this, 'pointerdown', (e) => {
                        pos(e);
                        this._ripples = [...this._ripples.slice(-3), { x: this._mouse[0], y: this._mouse[1], t: now() }];
                    });
            }
            // 4.0.1: also follow the element's own size (grid reflow, card expand…)
            if (typeof ResizeObserver !== 'undefined') {
                const ro = new ResizeObserver(() => {
                    q.resize(this._scale);
                    if (!this._id)
                        this.frame();
                });
                ro.observe(this);
                this.onCleanup(() => ro.disconnect());
            }
            if (this.reduced)
                return; // one static frame, no loop
            // 4.8 adaptive quality: fps-driven resolution steps + battery saver frame cap
            const gov = glGovernor();
            const auto = this.str('quality', 'auto') !== 'high';
            gov.onScale = (sc) => {
                this._scale = sc;
                this.setAttribute('data-quality', String(sc));
                q.resize(sc);
            };
            if (auto)
                this.onCleanup(watchPowerSaver((saver) => ((gov.saver = saver), gov.onScale?.(gov.scale))));
            let visible = false;
            const loop = () => {
                if (!auto || gov.tick(now()))
                    this.frame();
                this._id = raf(loop);
            };
            const sync = () => {
                caf(this._id);
                this._id = 0;
                if (visible && !document.hidden)
                    this._id = raf(loop);
            };
            this.inView((v) => ((visible = v), sync()));
            this.listen(document, 'visibilitychange', sync);
            this.listen(window, 'resize', () => q.resize(this._scale), { passive: true });
            this.onCleanup(() => caf(this._id));
        }
    };
}
/**
 * `<usa-shader>` — GPU shader background behind its content. `preset`
 * (`gradient` · `plasma` · `waves` · `aurora`) or your own fragment shader in
 * `<script type="x-shader/x-fragment">` (uniforms `u_time`, `u_resolution`,
 * `u_mouse`, `v_uv`); `speed`. Without WebGL: the element's CSS background.
 */
function defineShader(tag = 'usa-shader') {
    return defineElement(tag, make('shader'), { id: 'webgl', text: css$2 });
}
/**
 * `<usa-distort>` — hover distortion + RGB split on the `<img>` inside,
 * following the pointer. Without WebGL / CORS: a gentle CSS zoom.
 */
function defineDistort(tag = 'usa-distort') {
    return defineElement(tag, make('distort'), { id: 'webgl', text: css$2 });
}
/**
 * `<usa-liquid>` — liquid image: clicks / taps send ripples through the
 * `<img>` inside, hover adds a gentle wobble; `strength`. Fallback: plain image.
 */
function defineLiquid(tag = 'usa-liquid') {
    return defineElement(tag, make('liquid'), { id: 'webgl', text: css$2 });
}
/**
 * `<usa-post-fx effects="vignette grain crt" intensity="0.6">` — GPU
 * post-processing over the `<img>` inside (4.8): `vignette` · `grain` ·
 * `chromatic` · `scanlines` · `crt` · `bloom` · `pixelate` · `duotone` ·
 * `glitch`, chained in order. `quality="high"` disables adaptive quality.
 * Fallback: the image with an approximate CSS filter.
 */
function definePostFx(tag = 'usa-post-fx') {
    return defineElement(tag, make('post'), { id: 'webgl', text: css$2 });
}

/**
 * motionary/components/webgl — lightweight canvas / WebGL (v3.4).
 * `<usa-shader>` (shader backgrounds), `<usa-distort>` (hover image
 * distortion), `<usa-liquid>` (ripple images) on a tiny single-quad runner
 * (`glQuad()`), with graceful fallbacks when WebGL is unavailable.
 */
/** Register every component of this category under its default tag. */
function defineWebglComponents() {
    defineShader();
    defineDistort();
    defineLiquid();
    definePostFx();
}

var css$1 = "";

const FACES = ['front', 'right', 'back', 'left', 'top', 'bottom'];
/** Rotation (deg) that brings each face to the front. */
const ROT = { front: [0, 0], right: [0, -90], back: [0, -180], left: [0, 90], top: [-90, 0], bottom: [90, 0] };
function defineCube(tag = 'usa-cube') {
    return defineElement(tag, (Base) => class UsaCube extends Base {
        constructor() {
            super(...arguments);
            this._i = 0;
            this._base = [0, 0];
        }
        static get observedAttributes() {
            return ['size', 'autoplay', 'perspective'];
        }
        get index() {
            return this._i;
        }
        faces() {
            return Array.from(this.children).filter((c) => c instanceof HTMLElement && !c.hasAttribute('slot')).slice(0, 6);
        }
        paint() {
            this.style.setProperty('--usa-cube-rx', `${this._rx.value}deg`);
            this.style.setProperty('--usa-cube-ry', `${this._ry.value}deg`);
        }
        show(face) {
            const n = this.faces().length || 1;
            const i = typeof face === 'number' ? ((face % n) + n) % n : Math.max(0, FACES.indexOf(face));
            this._i = i;
            const [rx, ry] = ROT[FACES[i]];
            // take the shortest way round on Y
            const cur = this._ry.target;
            const ty = ry + Math.round((cur - ry) / 360) * 360;
            this._base = [rx, ty];
            if (this.reduced) {
                this._rx.jump(rx);
                this._ry.jump(ty);
            }
            else {
                this._rx.set(rx);
                this._ry.set(ty);
            }
            this.faces().forEach((f, j) => f.setAttribute('aria-hidden', String(j !== i)));
            this.emit('change', { index: i, face: FACES[i] });
        }
        next() {
            this.show(this._i + 1);
        }
        prev() {
            this.show(this._i - 1);
        }
        mount() {
            this.style.setProperty('--usa-cube-size', `${this.num('size', 200)}px`);
            this.style.setProperty('--usa-cube-perspective', `${this.num('perspective', 900)}px`);
            this.faces().forEach((f, j) => f.setAttribute('data-face', FACES[j]));
            if (!this.hasAttribute('tabindex'))
                this.tabIndex = 0;
            if (!this.hasAttribute('role'))
                this.setAttribute('role', 'region');
            if (!this.hasAttribute('aria-roledescription'))
                this.setAttribute('aria-roledescription', 'cube');
            this._rx = createSpring({ spring: 'gentle', onUpdate: () => this.paint() });
            this._ry = createSpring({ spring: 'gentle', onUpdate: () => this.paint() });
            this.show(this._i);
            this.paint();
            this.onCleanup(gesture(this, {
                onPan: ({ dx, dy, last }) => {
                    if (this.reduced)
                        return;
                    if (!last) {
                        this._ry.jump(this._base[1] + dx * 0.5);
                        this._rx.jump(this._base[0] - dy * 0.5);
                        return;
                    }
                    if (Math.abs(dx) > 40 && Math.abs(dx) >= Math.abs(dy))
                        return dx < 0 ? this.next() : this.prev();
                    if (Math.abs(dy) > 40 && this.faces().length > 4)
                        return this.show(dy < 0 ? 'bottom' : 'top');
                    this.show(this._i);
                },
            }));
            this.listen(this, 'keydown', (e) => {
                const k = { ArrowRight: () => this.next(), ArrowLeft: () => this.prev(), ArrowUp: () => this.show('bottom'), ArrowDown: () => this.show('top'), Home: () => this.show(0) };
                if (!k[e.key] || ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && this.faces().length < 6))
                    return;
                e.preventDefault();
                k[e.key]();
            });
            const ms = this.num('autoplay', 0);
            if (ms > 0 && !this.reduced) {
                let paused = false;
                const id = setInterval(() => !paused && this.show((this._i + 1) % Math.min(4, this.faces().length || 1)), ms);
                this.listen(this, 'pointerenter', () => (paused = true));
                this.listen(this, 'pointerleave', () => (paused = false));
                this.listen(this, 'focusin', () => (paused = true));
                this.listen(this, 'focusout', () => (paused = false));
                this.onCleanup(() => clearInterval(id));
            }
        }
        unmount() {
            this._rx?.stop();
            this._ry?.stop();
        }
    }, { id: 'depth', text: css$1 });
}

/** Map a DeviceOrientation reading (beta/gamma degrees) to -1…1 tilt around a resting pose (pure). */
function orientationToTilt(beta, gamma, range = 30, rest = 45) {
    return {
        x: clamp((gamma ?? 0) / range, -1, 1),
        y: clamp(((beta ?? rest) - rest) / range, -1, 1),
    };
}
/** `true` when DeviceOrientation events exist. */
const supportsOrientation = () => typeof window !== 'undefined' && 'DeviceOrientationEvent' in window;
/**
 * Ask for motion-sensor permission where required (iOS 13+; must run inside
 * a user gesture). Resolves `true` when tilt events can be used.
 */
async function requestOrientationPermission() {
    if (!supportsOrientation())
        return false;
    const D = window.DeviceOrientationEvent;
    if (typeof D.requestPermission !== 'function')
        return true;
    try {
        return (await D.requestPermission()) === 'granted';
    }
    catch {
        return false;
    }
}
/**
 * Listen to device tilt (smoothed); falls back to nothing on desktops.
 * Returns a stop function.
 */
function deviceTilt(cb, o = {}) {
    if (!supportsOrientation())
        return () => { };
    let cur = { x: 0, y: 0 };
    const k = 1 - clamp(o.smooth ?? 0.2, 0, 0.95);
    const on = (e) => {
        const t = orientationToTilt(e.beta, e.gamma, o.range ?? 30);
        cur = { x: cur.x + (t.x - cur.x) * k, y: cur.y + (t.y - cur.y) * k };
        cb(cur);
    };
    window.addEventListener('deviceorientation', on);
    return () => window.removeEventListener('deviceorientation', on);
}

function defineDepth(tag = 'usa-depth') {
    return defineElement(tag, (Base) => class UsaDepth extends Base {
        constructor() {
            super(...arguments);
            this._t = { x: 0, y: 0 };
            this._id = 0;
        }
        static get observedAttributes() {
            return ['source', 'strength', 'rotate'];
        }
        get tilt() {
            return { ...this._t };
        }
        requestPermission() {
            return requestOrientationPermission().then((ok) => {
                if (ok) {
                    this.changed('source');
                }
                return ok;
            });
        }
        apply() {
            this._id = 0;
            const s = this.num('strength', 40);
            const r = this.num('rotate', 0);
            const { x, y } = this._t;
            this.style.setProperty('--usa-depth-x', x.toFixed(4));
            this.style.setProperty('--usa-depth-y', y.toFixed(4));
            if (r)
                this.style.setProperty('--usa-depth-rot', `rotateX(${(-y * r).toFixed(2)}deg) rotateY(${(x * r).toFixed(2)}deg)`);
            this.querySelectorAll('[data-depth]').forEach((el) => {
                const d = clamp(Number(el.dataset.depth) || 0, -1, 1);
                el.style.transform = `translate3d(${(x * d * s).toFixed(2)}px, ${(y * d * s).toFixed(2)}px, 0) scale(${(1 + d * 0.04).toFixed(4)})`;
            });
        }
        set(x, y) {
            this._t = { x: clamp(x, -1, 1), y: clamp(y, -1, 1) };
            if (!this._id)
                this._id = raf(() => this.apply());
        }
        mount() {
            if (this.reduced)
                return;
            const src = this.str('source', 'pointer').split(/\s+/);
            if (src.includes('pointer')) {
                this.listen(this, 'pointermove', (e) => {
                    const r = this.getBoundingClientRect();
                    this.set(((e.clientX - r.left) / (r.width || 1)) * 2 - 1, ((e.clientY - r.top) / (r.height || 1)) * 2 - 1);
                });
                this.listen(this, 'pointerleave', () => this.set(0, 0));
            }
            if (src.includes('orientation') && supportsOrientation())
                this.onCleanup(deviceTilt((t) => this.set(t.x, t.y)));
            if (src.includes('scroll')) {
                const on = () => {
                    const r = this.getBoundingClientRect();
                    const vh = window.innerHeight || 1;
                    this.set(this._t.x, clamp(((r.top + r.height / 2) / vh) * 2 - 1, -1, 1));
                };
                this.listen(window, 'scroll', on, { passive: true });
                on();
            }
            this.onCleanup(() => {
                caf(this._id);
                this._id = 0;
            });
        }
        unmount() {
            this._t = { x: 0, y: 0 };
            this.querySelectorAll('[data-depth]').forEach((el) => (el.style.transform = ''));
        }
    }, { id: 'depth', text: css$1 });
}

/**
 * motionary/components/depth — 3D (v3.5).
 * `<usa-cube>` (CSS 3D cube), `<usa-depth>` (layered depth parallax driven by
 * pointer, device orientation or scroll) and `deviceTilt()`. The 3D ring
 * carousel is `<usa-carousel-3d>` in `components/cards`.
 */
/** Register every component of this category under its default tag. */
function defineDepthComponents() {
    defineCube();
    defineDepth();
}

/** FLIP keyframes from a previous box to the current one (pure). */
function flipFrames(from, to, scale = true) {
    const dx = from.left - to.left;
    const dy = from.top - to.top;
    const sx = scale && to.width ? from.width / to.width : 1;
    const sy = scale && to.height ? from.height / to.height : 1;
    return [
        { transformOrigin: '0 0', transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` },
        { transformOrigin: '0 0', transform: 'none' },
    ];
}
/**
 * Auto-animate a container: children that are added fade / scale in, removed
 * ones fade out in place, and moved ones (re-sort, filter, reflow, resize)
 * glide to their new spot — no extra code at the call site. Returns
 * `{ disable, enable, stop }`. Reduced motion: changes apply instantly.
 *
 * @example
 * const ctl = autoAnimate(document.querySelector('ul'));
 * list.append(item); // animates
 */
function autoAnimate(parent, o = {}) {
    let on = true;
    const boxes = new WeakMap();
    const rel = (el) => {
        const r = el.getBoundingClientRect();
        const p = parent.getBoundingClientRect();
        return { left: r.left - p.left, top: r.top - p.top, width: r.width, height: r.height };
    };
    const snap = () => Array.from(parent.children).forEach((c) => boxes.set(c, rel(c)));
    const dur = () => (o.duration ?? 300) * motionScale();
    const timing = () => ({ duration: dur(), easing: o.easing ?? EASE_OUT });
    const animate = (el, frames, t = timing()) => (typeof el.animate === 'function' ? el.animate(frames, t) : null);
    const mo = typeof MutationObserver === 'function'
        ? new MutationObserver((records) => {
            if (!on || prefersReducedMotion() || dur() <= 0)
                return snap();
            const added = new Set();
            for (const r of records) {
                r.addedNodes.forEach((n) => n instanceof Element && n.parentElement === parent && added.add(n));
                r.removedNodes.forEach((n) => {
                    if (!(n instanceof HTMLElement) || n.isConnected)
                        return;
                    const b = boxes.get(n);
                    if (!b)
                        return;
                    // put a ghost back at its old place and fade it out
                    n.style.position = 'absolute';
                    n.style.left = `${b.left}px`;
                    n.style.top = `${b.top}px`;
                    n.style.width = `${b.width}px`;
                    n.style.height = `${b.height}px`;
                    n.style.margin = '0';
                    n.style.pointerEvents = 'none';
                    if (getComputedStyle(parent).position === 'static')
                        parent.style.position = 'relative';
                    parent.appendChild(n);
                    n.__usaGhost = true;
                    const a = animate(n, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(0.96)' }]);
                    const drop = () => {
                        n.remove();
                        for (const k of ['position', 'left', 'top', 'width', 'height', 'margin', 'pointerEvents'])
                            n.style[k] = '';
                    };
                    if (a)
                        a.finished.then(drop, drop);
                    else
                        drop();
                });
            }
            Array.from(parent.children).forEach((c) => {
                if (c.__usaGhost)
                    return;
                if (added.has(c))
                    return void animate(c, [{ opacity: 0, transform: 'scale(0.96)' }, { opacity: 1, transform: 'none' }]);
                const prev = boxes.get(c);
                if (!prev)
                    return;
                const now = rel(c);
                if (Math.abs(prev.left - now.left) + Math.abs(prev.top - now.top) + Math.abs(prev.width - now.width) + Math.abs(prev.height - now.height) < 1)
                    return;
                animate(c, flipFrames(prev, now, o.scale !== false));
            });
            snap();
        })
        : null;
    mo?.observe(parent, { childList: true });
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => snap()) : null;
    ro?.observe(parent);
    snap();
    // capture boxes right before any change in the same task (events, timers)
    const capture = () => snap();
    parent.addEventListener('pointerdown', capture, true);
    return {
        enable: () => ((on = true), snap()),
        disable: () => (on = false),
        stop: () => {
            mo?.disconnect();
            ro?.disconnect();
            parent.removeEventListener('pointerdown', capture, true);
        },
    };
}
/** Masonry placement: shortest-column-first positions for item heights (pure). */
function masonryLayout(heights, columns, columnWidth, gap) {
    const cols = Array(Math.max(1, columns)).fill(0);
    const out = heights.map((h) => {
        const c = cols.indexOf(Math.min(...cols));
        const pos = { x: c * (columnWidth + gap), y: cols[c] };
        cols[c] += h + gap;
        return pos;
    });
    out.height = Math.max(0, Math.max(...cols) - gap);
    return out;
}
/**
 * Shared-element transition between two states of the page: every element
 * with `data-shared="id"` before `update()` flies to the element with the
 * same id afterwards (size and position), the rest cross-fades. Uses the
 * View Transitions API when present (with `view-transition-name` per id),
 * otherwise a FLIP fallback. Reduced motion: just runs `update()`.
 */
async function sharedTransition(update, root = document, o = {}) {
    if (prefersReducedMotion() || typeof document === 'undefined')
        return void (await update());
    const collect = () => new Map(Array.from(root.querySelectorAll('[data-shared]')).map((el) => [el.dataset.shared, el]));
    const doc = document;
    if (typeof doc.startViewTransition === 'function') {
        const named = (m) => m.forEach((el, id) => (el.style.viewTransitionName = `usa-${id.replace(/[^\w-]/g, '_')}`));
        const clear = (m) => m.forEach((el) => (el.style.viewTransitionName = ''));
        const before = collect();
        named(before);
        let after = new Map();
        const vt = doc.startViewTransition(async () => {
            clear(before);
            await update();
            after = collect();
            named(after);
        });
        await vt.finished.catch(() => undefined);
        clear(after);
        return;
    }
    const before = new Map(Array.from(collect()).map(([id, el]) => [id, el.getBoundingClientRect()]));
    await update();
    const anims = [];
    collect().forEach((el, id) => {
        const a = before.get(id);
        if (!a || typeof el.animate !== 'function')
            return;
        const b = el.getBoundingClientRect();
        if (!b.width || !b.height)
            return;
        anims.push(el.animate(flipFrames(a, b), { duration: (o.duration ?? 450) * motionScale(), easing: o.easing ?? EASE_OUT }).finished.catch(() => undefined));
    });
    await Promise.all(anims);
}

var css = "";

function defineAutoAnimate(tag = 'usa-auto-animate') {
    return defineElement(tag, (Base) => class UsaAutoAnimate extends Base {
        constructor() {
            super(...arguments);
            this._c = null;
        }
        static get observedAttributes() {
            return ['duration', 'no-scale'];
        }
        enable() {
            this._c?.enable();
        }
        disable() {
            this._c?.disable();
        }
        mount() {
            const c = (this._c = autoAnimate(this, { duration: this.num('duration', 300), scale: !this.flag('no-scale') }));
            this.onCleanup(() => c.stop());
        }
    }, { id: 'layout', text: css });
}
function defineMasonry(tag = 'usa-masonry') {
    return defineElement(tag, (Base) => class UsaMasonry extends Base {
        static get observedAttributes() {
            return ['columns', 'min', 'gap'];
        }
        changed() {
            this.layout();
        }
        layout() {
            const items = Array.from(this.children).filter((c) => !c.__usaGhost);
            const w = this.clientWidth;
            if (!w)
                return;
            const gap = this.num('gap', 16);
            const cols = this.num('columns', 0) || Math.max(1, Math.floor((w + gap) / (this.num('min', 220) + gap)));
            const cw = (w - gap * (cols - 1)) / cols;
            items.forEach((el) => (el.style.width = `${cw}px`));
            const pos = masonryLayout(items.map((el) => el.offsetHeight), cols, cw, gap);
            items.forEach((el, i) => (el.style.transform = `translate(${pos[i].x}px, ${pos[i].y}px)`));
            this.style.height = `${pos.height}px`;
            this.style.setProperty('--usa-masonry-cols', String(cols));
        }
        mount() {
            this.setAttribute('data-js', '');
            this.onCleanup(() => this.removeAttribute('data-js'));
            let id = 0;
            const queue = () => {
                if (id)
                    return;
                // contract-exempt: reduced-motion — rAF batches layout, no motion
                id = requestAnimationFrame(() => {
                    id = 0;
                    this.layout();
                });
            };
            if (typeof ResizeObserver === 'function') {
                const ro = new ResizeObserver(queue);
                ro.observe(this);
                Array.from(this.children).forEach((c) => ro.observe(c));
                const mo = new MutationObserver((recs) => {
                    recs.forEach((r) => r.addedNodes.forEach((n) => n instanceof Element && ro.observe(n)));
                    queue();
                });
                mo.observe(this, { childList: true });
                this.onCleanup(() => (ro.disconnect(), mo.disconnect()));
            }
            this.listen(this, 'load', queue, { capture: true });
            this.layout();
        }
        unmount() {
            this.style.height = '';
            Array.from(this.children).forEach((c) => (c.style.transform = '', c.style.width = ''));
        }
    }, { id: 'layout', text: css });
}

/**
 * motionary/components/layout — layout animation (v3.6).
 * `autoAnimate()` / `<usa-auto-animate>` (list & grid reflow),
 * `<usa-masonry>`, and `sharedTransition()` for shared-element transitions
 * (View Transitions API with a FLIP fallback).
 */
/** Register every component of this category under its default tag. */
function defineLayoutComponents() {
    defineAutoAnimate();
    defineMasonry();
}

const anim = (el, frames, o) => {
    if (typeof el.animate !== 'function')
        return null;
    const k = motionScale();
    return el.animate(frames, { ...o, duration: (o.duration ?? 400) * k, delay: (o.delay ?? 0) * k });
};
const on = (el, type, fn) => {
    el.addEventListener(type, fn);
    return () => el.removeEventListener(type, fn);
};
const io = (el, cb) => {
    if (typeof IntersectionObserver === 'undefined')
        return void cb();
    const o = new IntersectionObserver((es) => es.some((e) => e.isIntersecting) && (o.disconnect(), cb()), { threshold: 0.15 });
    o.observe(el);
    return () => o.disconnect();
};
/** Count `el`'s number up from 0 when it enters the view (keeps prefix / suffix / decimals). */
function countUp(el, duration = 1200) {
    const text = el.textContent || '';
    const m = /(-?[\d,]*\.?\d+)/.exec(text);
    if (!m || prefersReducedMotion())
        return () => { };
    const target = Number(m[1].replace(/,/g, ''));
    const dec = (m[1].split('.')[1] || '').length;
    const fmt = (v) => text.replace(m[1], v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }));
    el.setAttribute('aria-label', text.trim());
    el.textContent = fmt(0);
    let stop = false;
    const off = io(el, () => {
        const t0 = now();
        const d = duration * motionScale() || 1;
        const step = () => {
            if (stop)
                return;
            const p = clamp((now() - t0) / d, 0, 1);
            el.textContent = fmt(target * (1 - Math.pow(1 - p, 3)));
            if (p < 1)
                raf(step);
        };
        raf(step);
    });
    return () => {
        stop = true;
        off();
        el.textContent = text;
    };
}
/**
 * Fly a copy of `from` (e.g. a product image) into `to` (the cart icon) along
 * an arc, then bump the target. Resolves when it lands. Instant under
 * reduced motion (only the bump's state change, no flight).
 */
async function flyToCart(from, to, o = {}) {
    if (prefersReducedMotion() || typeof document === 'undefined')
        return;
    const a = from.getBoundingClientRect();
    const b = to.getBoundingClientRect();
    const ghost = from.cloneNode(true);
    ghost.setAttribute('aria-hidden', 'true');
    Object.assign(ghost.style, { position: 'fixed', left: `${a.left}px`, top: `${a.top}px`, width: `${a.width}px`, height: `${a.height}px`, margin: '0', zIndex: '2147483000', pointerEvents: 'none' });
    document.body.appendChild(ghost);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2);
    const dy = b.top + b.height / 2 - (a.top + a.height / 2);
    const f = anim(ghost, [
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 80}px) scale(0.6)`, opacity: 0.9, offset: 0.5 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.15)`, opacity: 0.4 },
    ], { duration: o.duration ?? 700, easing: 'cubic-bezier(0.5, 0, 0.5, 1)' });
    await f?.finished.catch(() => undefined);
    ghost.remove();
    anim(to, [{ transform: 'scale(1)' }, { transform: 'scale(1.3)' }, { transform: 'scale(1)' }], { duration: 380, easing: EASE_SPRING });
}
const PRIMITIVES = {
    reveal: (el, c) => {
        if (c.reduced)
            return;
        el.style.opacity = '0';
        const off = io(el, () => {
            el.style.opacity = '';
            anim(el, [{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }], { duration: 600, delay: Math.min(c.index, 8) * 70, easing: EASE_OUT, fill: 'backwards' });
        });
        return () => (off(), (el.style.opacity = ''));
    },
    lift: (el, c) => {
        if (c.reduced)
            return;
        const a = on(el, 'pointerenter', () => anim(el, [{ transform: 'none' }, { transform: 'translateY(-6px) scale(1.02)' }], { duration: 220, easing: EASE_OUT, fill: 'forwards' }));
        const b = on(el, 'pointerleave', () => anim(el, [{ transform: 'translateY(-6px) scale(1.02)' }, { transform: 'none' }], { duration: 260, easing: EASE_OUT, fill: 'forwards' }));
        return () => (a(), b());
    },
    press: (el, c) => (c.reduced ? undefined : on(el, 'pointerdown', () => anim(el, [{ transform: 'scale(1)' }, { transform: 'scale(0.94)' }, { transform: 'scale(1)' }], { duration: 260, easing: EASE_SPRING }))),
    'count-up': (el) => countUp(el),
    pulse: (el, c) => {
        if (c.reduced)
            return;
        const a = anim(el, [{ boxShadow: '0 0 0 0 rgba(124, 92, 255, 0.55)' }, { boxShadow: '0 0 0 14px rgba(124, 92, 255, 0)' }], { duration: 1600, iterations: Infinity });
        return () => a?.cancel();
    },
    float: (el, c) => {
        if (c.reduced)
            return;
        const a = anim(el, [{ transform: 'translateY(0)' }, { transform: 'translateY(-8px)' }, { transform: 'translateY(0)' }], { duration: 3000, delay: c.index * 300, iterations: Infinity, easing: 'ease-in-out' });
        return () => a?.cancel();
    },
    shake: (el, c) => (c.reduced ? undefined : on(el, 'click', () => anim(el, [0, -8, 8, -6, 6, -3, 0].map((x) => ({ transform: `translateX(${x}px)` })), { duration: 420 }))),
    bump: (el, c) => (c.reduced ? undefined : on(el, 'usa:bump', () => anim(el, [{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }], { duration: 360, easing: EASE_SPRING }))),
    'fly-to-cart': (el, c) => on(el, 'click', () => {
        const cart = c.root.querySelector('[data-role="cart"]') || document.querySelector('[data-role="cart"]');
        const item = el.closest('[data-role="product"]')?.querySelector('img, [data-role="thumb"]') || el;
        if (cart)
            void flyToCart(item, cart).then(() => cart.dispatchEvent(new CustomEvent('usa:added', { bubbles: true, composed: true })));
    }),
};
/** The five effect packs: `data-role` → primitives. */
const PACKS = {
    ecommerce: { product: ['reveal', 'lift'], 'add-to-cart': ['press', 'fly-to-cart'], cart: ['bump'], price: ['count-up'], badge: ['pulse'] },
    portfolio: { project: ['reveal', 'lift'], heading: ['reveal'], stat: ['count-up'], contact: ['press', 'pulse'] },
    dashboard: { card: ['reveal'], stat: ['count-up'], alert: ['pulse'], action: ['press'] },
    game: { button: ['press'], score: ['count-up', 'bump'], item: ['float'], hit: ['shake'], reward: ['pulse'] },
    landing: { hero: ['reveal'], feature: ['reveal', 'lift'], cta: ['press', 'pulse'], logo: ['float'], stat: ['count-up'] },
};
/**
 * Apply an effect pack to `root`: every descendant with a `data-role` the
 * pack knows gets its effects (staggered by index). Returns an undo function.
 * Reduced motion: only non-motion behaviour (e.g. the cart event) remains.
 *
 * @example
 * applyPack('ecommerce', document.querySelector('main'));
 * // <article data-role="product">… <button data-role="add-to-cart"> … <a data-role="cart">
 */
function applyPack(name, root = document) {
    const pack = PACKS[name];
    if (!pack || typeof document === 'undefined')
        return () => { };
    const r = root.documentElement ? root.body : root;
    const reduced = prefersReducedMotion();
    const cleanups = [];
    for (const [role, fx] of Object.entries(pack)) {
        r.querySelectorAll(`[data-role="${role}"]`).forEach((el, index) => {
            for (const f of fx) {
                const c = PRIMITIVES[f]?.(el, { root: r, index, reduced });
                if (c)
                    cleanups.push(c);
            }
        });
    }
    return () => cleanups.splice(0).forEach((c) => c());
}
/** Primitive names a pack uses (for docs / tooling). */
const PACK_PRIMITIVES = /*#__PURE__*/ Object.keys(PRIMITIVES);

function definePack(tag = 'usa-pack') {
    return defineElement(tag, (Base) => class UsaPack extends Base {
        static get observedAttributes() {
            return ['name'];
        }
        get roles() {
            return Object.keys(PACKS[this.str('name', 'landing')] || {});
        }
        mount() {
            var _a;
            (_a = this.style).display || (_a.display = 'block');
            this.onCleanup(applyPack(this.str('name', 'landing'), this));
        }
    });
}

/**
 * motionary/components/packs — effect packs (v3.9).
 * Ready-made motion for e-commerce, portfolio, dashboard, game UI and
 * landing pages: mark elements with `data-role` and apply a pack with
 * `<usa-pack name="…">` or `applyPack(name, root)`. Includes `flyToCart()`
 * and `countUp()`.
 */
/** Register every component of this category under its default tag. */
function definePacksComponents() {
    definePack();
}

/**
 * 5.0 — unified plugin-style effect registration. Every effect (built-in or
 * yours) is a plain object registered once and played the same way:
 * `playEffect(el, name)`, `bindEffect(el, name, { trigger })` or
 * `<usa-fx effect="name" trigger="click">`. Effects get a context that
 * already applies reduced motion, motion sensitivity, intensity and the
 * animation budget.
 */
const EFFECT_KINDS = ['enter', 'exit', 'attention', 'click', 'hover', 'card', 'loop', 'page', 'background', 'text', 'cursor', 'scroll'];
const EFFECT_TRIGGERS = ['click', 'hover', 'enter', 'load', 'loop', 'manual'];
// 6.2: one table per page (Symbol.for), shared by every bundle that registers effects —
// e.g. dist/components.umd.js and dist/widgets.umd.js on the same page.
const REG_KEY = /*#__PURE__*/ Symbol.for('use-scroll-animate.effects');
// 11.1: created on first use, so importing this module writes nothing to globalThis.
const fxTable = () => { var _a; return ((_a = globalThis)[REG_KEY] || (_a[REG_KEY] = new Map())); };
/** Register an effect (throws on a duplicate name unless `override`). Returns an unregister function. */
function registerEffect(def, opts = {}) {
    if (!/^[a-z][a-z0-9-]*$/.test(def.name))
        throw new Error(`[motionary] invalid effect name "${def.name}"`);
    if (!EFFECT_KINDS.includes(def.kind))
        throw new Error(`[motionary] unknown effect kind "${def.kind}"`);
    if (fxTable().has(def.name) && !opts.override)
        throw new Error(`[motionary] effect "${def.name}" is already registered`);
    fxTable().set(def.name, def);
    return () => {
        if (fxTable().get(def.name) === def)
            fxTable().delete(def.name);
    };
}
/** Register several effects at once (already-registered names are skipped). */
function registerEffects(defs) {
    for (const d of defs)
        if (!fxTable().has(d.name))
            registerEffect(d);
}
const getEffect = (name) => fxTable().get(name);
const hasEffect = (name) => fxTable().has(name);
/** Registered effects (optionally of one kind), sorted by name. */
function listEffects(kind) {
    return Array.from(fxTable().values())
        .filter((d) => !kind || d.kind === kind)
        .sort((a, b) => a.name.localeCompare(b.name));
}
const SKIP_BY_DEFAULT = ['loop', 'background', 'cursor'];
function context(event) {
    const cleanups = [];
    return {
        reduced: prefersReducedMotion(),
        sensitivity: getMotionSensitivity(),
        event,
        animate: animateWithMotion,
        onCleanup: (fn) => cleanups.push(fn),
        cleanups,
    };
}
/**
 * Play a registered effect once on `el`. Resolves when it finishes (or
 * immediately for fire-and-forget effects). Unknown names reject.
 */
async function playEffect(el, name, options = {}, event) {
    const def = fxTable().get(name);
    if (!def)
        throw new Error(`[motionary] unknown effect "${name}" — registered: ${Array.from(fxTable().keys()).join(', ')}`);
    const ctx = context(event);
    if (ctx.reduced && (def.reduced ?? (SKIP_BY_DEFAULT.includes(def.kind) ? 'skip' : 'run')) === 'skip')
        return;
    const out = def.run(el, { ...(def.defaults || {}), ...options }, ctx);
    if (out && typeof out.finished?.then === 'function')
        await out.finished.catch(() => undefined);
    else if (out && typeof out.then === 'function')
        await out;
}
/**
 * Bind an effect to a trigger on `el`: `click`, `hover` (pointerenter / focus),
 * `enter` (scrolls into view; `once` by default), `load` (now), `loop`
 * (starts now, cleanup stops it) or `manual` (nothing). Returns an unbind.
 */
function bindEffect(el, name, options = {}) {
    const { trigger = 'click', once, ...opts } = options;
    const def = fxTable().get(name);
    if (!def)
        throw new Error(`[motionary] unknown effect "${name}"`);
    const offs = [];
    let current = null;
    const fire = (e) => {
        const ctx = context(e);
        if (ctx.reduced && (def.reduced ?? (SKIP_BY_DEFAULT.includes(def.kind) ? 'skip' : 'run')) === 'skip')
            return;
        // A persistent effect (returns a cleanup) replaces its previous run instead of stacking.
        current?.();
        current = null;
        const out = def.run(el, { ...(def.defaults || {}), ...opts }, ctx);
        const stops = [...ctx.cleanups, ...(typeof out === 'function' ? [out] : [])];
        if (stops.length)
            current = () => stops.splice(0).forEach((f) => f());
    };
    offs.push(() => {
        current?.();
        current = null;
    });
    const on = (type, opt) => {
        el.addEventListener(type, fire, opt);
        offs.push(() => el.removeEventListener(type, fire, opt));
    };
    if (trigger === 'click')
        on('click', { once: !!once });
    else if (trigger === 'hover')
        (on('pointerenter'), on('focusin'));
    else if (trigger === 'load' || trigger === 'loop')
        fire();
    else if (trigger === 'enter' && typeof IntersectionObserver !== 'undefined') {
        const io = new IntersectionObserver((entries) => {
            for (const en of entries)
                if (en.isIntersecting) {
                    fire();
                    if (once !== false)
                        io.disconnect();
                }
        }, { threshold: 0.15 });
        io.observe(el);
        offs.push(() => io.disconnect());
    }
    return () => offs.splice(0).reverse().forEach((f) => f());
}

function defineFx(tag = 'usa-fx') {
    return defineElement(tag, (Base) => class UsaFx extends Base {
        static get observedAttributes() {
            return ['effect', 'trigger', 'options', 'self', 'once'];
        }
        get target() {
            return this.flag('self') ? this : (this.firstElementChild || this);
        }
        opts() {
            try {
                return JSON.parse(this.str('options', '{}')) || {};
            }
            catch {
                return {};
            }
        }
        play() {
            return playEffect(this.target, this.str('effect', 'pop'), this.opts()).catch(() => undefined);
        }
        mount() {
            if (!this.style.display)
                this.style.display = 'inline-block';
            const name = this.str('effect', 'pop');
            const t = this.str('trigger', 'click');
            try {
                this.onCleanup(bindEffect(this.target, name, { ...this.opts(), trigger: EFFECT_TRIGGERS.includes(t) ? t : 'click', once: this.flag('once') }));
                this.removeAttribute('data-unknown');
            }
            catch {
                this.setAttribute('data-unknown', name); // not registered (yet)
            }
        }
    });
}

/**
 * 5.0 built-in effects, all registered through `registerEffect()`:
 * every timeline preset as an `enter` effect, attention seekers, and the
 * click effects (burst, confetti, shake, ripple).
 */
const enter = /*#__PURE__*/ Object.entries(TIMELINE_PRESETS).map(([name, frames]) => ({
    name,
    kind: 'enter',
    description: `Entrance: ${name} (same keyframes as the timeline preset).`,
    defaults: { duration: 600, delay: 0, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    run: (el, o, ctx) => ctx.animate(el, ctx.reduced ? [{ opacity: 0 }, { opacity: 1 }] : frames, { duration: o.duration, delay: o.delay, easing: o.easing, fill: 'backwards' }),
}));
const A = (name, description, frames, duration = 700, easing = 'ease-in-out') => ({
    name,
    kind: 'attention',
    description,
    defaults: { duration, iterations: 1 },
    run: (el, o, ctx) => (ctx.reduced ? ctx.animate(el, [{ opacity: 1 }, { opacity: 0.6 }, { opacity: 1 }], { duration: 400 }) : ctx.animate(el, frames, { duration: o.duration, easing, iterations: o.iterations })),
});
const attention = [
    A('pulse', 'Gentle scale pulse.', [{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1)' }], 600),
    A('pop', 'Quick overshoot pop.', [{ transform: 'scale(1)' }, { transform: 'scale(1.18)', offset: 0.4 }, { transform: 'scale(0.96)', offset: 0.7 }, { transform: 'scale(1)' }], 450, 'cubic-bezier(0.34, 1.56, 0.64, 1)'),
    A('jelly', 'Rubbery squash-and-stretch.', [{ transform: 'scale(1,1)' }, { transform: 'scale(1.25,0.75)', offset: 0.3 }, { transform: 'scale(0.75,1.25)', offset: 0.4 }, { transform: 'scale(1.15,0.85)', offset: 0.5 }, { transform: 'scale(0.95,1.05)', offset: 0.65 }, { transform: 'scale(1.05,0.95)', offset: 0.75 }, { transform: 'scale(1,1)' }], 900),
    A('wiggle', 'Playful rotate wiggle.', [{ transform: 'rotate(0)' }, { transform: 'rotate(-8deg)', offset: 0.2 }, { transform: 'rotate(7deg)', offset: 0.4 }, { transform: 'rotate(-5deg)', offset: 0.6 }, { transform: 'rotate(3deg)', offset: 0.8 }, { transform: 'rotate(0)' }], 650),
    A('heartbeat', 'Double-beat heart pulse.', [{ transform: 'scale(1)' }, { transform: 'scale(1.2)', offset: 0.14 }, { transform: 'scale(1)', offset: 0.28 }, { transform: 'scale(1.2)', offset: 0.42 }, { transform: 'scale(1)', offset: 0.7 }], 1100),
    A('bounce', 'Hop up and settle with a squash.', [{ transform: 'translateY(0) scale(1,1)' }, { transform: 'translateY(-22px) scale(0.95,1.05)', offset: 0.35 }, { transform: 'translateY(0) scale(1.08,0.92)', offset: 0.6 }, { transform: 'translateY(-6px) scale(1,1)', offset: 0.8 }, { transform: 'translateY(0) scale(1,1)' }], 800),
    A('flash', 'Two soft flashes (well under 3 per second).', [{ opacity: 1 }, { opacity: 0.25, offset: 0.25 }, { opacity: 1, offset: 0.5 }, { opacity: 0.25, offset: 0.75 }, { opacity: 1 }], 1400),
    A('tada', 'Scale + shake celebration.', [{ transform: 'scale(1) rotate(0)' }, { transform: 'scale(0.9) rotate(-3deg)', offset: 0.1 }, { transform: 'scale(1.1) rotate(3deg)', offset: 0.3 }, { transform: 'scale(1.1) rotate(-3deg)', offset: 0.5 }, { transform: 'scale(1.1) rotate(3deg)', offset: 0.7 }, { transform: 'scale(1) rotate(0)' }], 1000),
];
const click = [
    {
        name: 'burst',
        kind: 'click',
        description: 'Particle burst from the click point (or `x` / `y`, or the element center).',
        defaults: { count: 12 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return;
            const r = el.getBoundingClientRect();
            const e = ctx.event;
            burst(o.x ?? e?.clientX ?? r.left + r.width / 2, o.y ?? e?.clientY ?? r.top + r.height / 2, o);
        },
    },
    {
        name: 'confetti',
        kind: 'click',
        description: 'Confetti cannon from the element.',
        defaults: { count: 80 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return;
            const r = el.getBoundingClientRect();
            confetti({ x: r.left + r.width / 2, y: r.top + r.height / 2, ...o });
        },
    },
    {
        name: 'shake',
        kind: 'attention',
        description: 'Horizontal "no" shake (errors, wrong password).',
        defaults: { intensity: 8, duration: 480 },
        run: (el, o, ctx) => (ctx.reduced ? ctx.animate(el, [{ opacity: 1 }, { opacity: 0.5 }, { opacity: 1 }], { duration: 300 }) : shake(el, o.intensity, o.duration)),
    },
    {
        name: 'ripple',
        kind: 'click',
        description: 'Material-style ink ripple from the pointer.',
        defaults: { color: 'currentColor', duration: 600 },
        run: (el, o, ctx) => {
            var _a;
            if (ctx.reduced)
                return;
            const r = el.getBoundingClientRect();
            const e = ctx.event;
            const d = Math.hypot(r.width, r.height) * 2;
            const dot = document.createElement('span');
            dot.setAttribute('aria-hidden', 'true');
            Object.assign(dot.style, { position: 'absolute', left: `${(e?.clientX ?? r.left + r.width / 2) - r.left - d / 2}px`, top: `${(e?.clientY ?? r.top + r.height / 2) - r.top - d / 2}px`, width: `${d}px`, height: `${d}px`, borderRadius: '50%', background: o.color, opacity: '0.25', pointerEvents: 'none' });
            if (getComputedStyle(el).position === 'static')
                el.style.position = 'relative';
            (_a = el.style).overflow || (_a.overflow = 'hidden');
            el.appendChild(dot);
            const a = ctx.animate(dot, [{ transform: 'scale(0)', opacity: 0.3 }, { transform: 'scale(1)', opacity: 0 }], { duration: o.duration, easing: 'ease-out' });
            const done = () => dot.remove();
            if (a)
                a.finished.then(done, done);
            else
                done();
            return a;
        },
    },
];
/** Every built-in 5.0 effect definition. */
const BUILTIN_EFFECTS = [...enter, ...attention, ...click];

/**
 * motionary/components/fx — unified plugin-style effects (5.0).
 * `registerEffect({ name, kind, run })`, `playEffect(el, name)`,
 * `bindEffect(el, name, { trigger })`, `<usa-fx effect trigger>`. Built-ins:
 * every timeline preset (`enter`), `pulse` · `pop` · `jelly` · `wiggle` ·
 * `heartbeat` · `bounce` · `flash` · `tada` · `shake` (attention),
 * `burst` · `confetti` · `ripple` (click). More packs: `motionary/components/effects`.
 */
/** Register the built-in effects (idempotent; `defineFxComponents()` calls it). */
function registerBuiltinEffects() {
    registerEffects(BUILTIN_EFFECTS);
}
/** Register every component of this category under its default tag (+ the built-in effects). */
function defineFxComponents() {
    registerBuiltinEffects();
    defineFx();
}

/**
 * 4.9 — the 5.0 modern-browser baseline. `baselineReport()` lists which
 * required / progressive features this browser has; `warnBaseline()` logs
 * once in development when a required one is missing.
 */
/** Required in 5.0: Custom Elements, WAAPI, IntersectionObserver, ResizeObserver, adoptedStyleSheets. Progressive: View Transitions, scroll-driven animations, WebGL. */
function baselineReport() {
    const w = (typeof window !== 'undefined' ? window : {});
    const d = (typeof document !== 'undefined' ? document : {});
    const css = (q) => typeof w.CSS?.supports === 'function' && w.CSS.supports(q);
    return [
        { id: 'custom-elements', required: true, supported: !!w.customElements },
        { id: 'web-animations', required: true, supported: typeof w.Element?.prototype?.animate === 'function' },
        { id: 'intersection-observer', required: true, supported: typeof w.IntersectionObserver === 'function' },
        { id: 'resize-observer', required: true, supported: typeof w.ResizeObserver === 'function' },
        { id: 'adopted-stylesheets', required: true, supported: 'adoptedStyleSheets' in d },
        { id: 'view-transitions', required: false, supported: typeof d.startViewTransition === 'function' },
        { id: 'scroll-driven-animations', required: false, supported: css('animation-timeline: view()') },
        { id: 'webgl', required: false, supported: !!(d.createElement && (() => { try {
                return d.createElement('canvas').getContext('webgl');
            }
            catch {
                return null;
            } })()) },
    ];
}
/** Log (once) which required 5.0 features are missing here. Returns the missing ids. */
function warnBaseline() {
    const missing = baselineReport().filter((f) => f.required && !f.supported).map((f) => f.id);
    if (missing.length)
        deprecate('baseline', `this browser lacks ${missing.join(', ')}; motionary 5.0 requires them (modern-browser baseline, see docs/upgrading-5.md).`);
    return missing;
}

/**
 * motionary/components/a11y — accessibility toolkit (4.4).
 *
 * - Motion-sensitivity levels: `setMotionSensitivity('full' | 'gentle' | 'minimal' | 'static')`.
 * - Static alternatives: what every component shows when motion is off, and
 *   `staticAlternative(root)` to freeze any subtree at its final state.
 * - `aria-live` conventions: one shared polite and one assertive region,
 *   `announce(message, { politeness })`.
 * - `auditMotionA11y(root)`: the rules the automated regression tests run
 *   over every `<usa-*>` element — usable in your own tests too.
 *
 * ```ts
 * import { setMotionSensitivity, announce, auditMotionA11y } from 'motionary/components/a11y';
 * setMotionSensitivity('gentle', true);           // no spins / zooms / parallax, remembered
 * announce('3 items added to cart');               // polite live region
 * expect(auditMotionA11y(document.body).errors).toEqual([]);
 * ```
 */
const KEY = 'usa:sensitivity';
/** What each level allows, for docs and settings UIs. */
const MOTION_SENSITIVITY = {
    full: { en: 'All motion', zh: '全部动效', allows: ['fade', 'translate', 'scale', 'rotate', 'parallax', 'loop', 'flash'] },
    gentle: { en: 'Gentle — no spins, zooms or parallax', zh: '温和 —— 无旋转、缩放与视差', allows: ['fade', 'translate', 'loop'] },
    minimal: { en: 'Minimal — fades only', zh: '最少 —— 仅淡入淡出', allows: ['fade'] },
    static: { en: 'Static — no animation', zh: '静态 —— 无动画', allows: [] },
};
/** CSS applied at the `static` / `minimal` / `gentle` levels (also stops your own CSS animations under `static`). */
const SENSITIVITY_CSS = 'html[data-usa-sensitivity="static"] *,html[data-usa-sensitivity="static"] *::before,html[data-usa-sensitivity="static"] *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}' +
    'html[data-usa-sensitivity="minimal"] *,html[data-usa-sensitivity="minimal"] *::before,html[data-usa-sensitivity="minimal"] *::after{animation-duration:1ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important}' +
    'html[data-usa-sensitivity="gentle"]{--usa-parallax:0;--usa-tilt:0}';
/**
 * Set the motion-sensitivity level for every `<usa-*>` component and the page:
 * sets `data-usa-sensitivity` on `<html>`, adapts component keyframes, and
 * with `persist` remembers the choice (`restoreMotionSensitivity()`).
 * Dispatches `usa:sensitivity` on `document`.
 */
function setMotionSensitivity(level, persist = false) {
    if (!MOTION_SENSITIVITY_LEVELS.includes(level))
        return;
    configureComponents({ motionSensitivity: level });
    adoptStyles('a11y-sensitivity', SENSITIVITY_CSS);
    if (persist) {
        try {
            localStorage.setItem(KEY, level);
        }
        catch {
            /* private mode */
        }
    }
    if (level === 'static' && typeof document !== 'undefined')
        staticAlternative(document.documentElement);
    if (typeof document !== 'undefined')
        document.dispatchEvent(new CustomEvent('usa:sensitivity', { detail: { level } }));
}
/** Re-apply a persisted level (call early on page load). Returns the active level. */
function restoreMotionSensitivity() {
    try {
        const v = localStorage.getItem(KEY);
        if (v && MOTION_SENSITIVITY_LEVELS.includes(v))
            setMotionSensitivity(v);
    }
    catch {
        /* ignore */
    }
    return getMotionSensitivity();
}
/** `true` when the current level allows a kind of motion (`'rotate'`, `'parallax'`, `'loop'`…). */
function motionAllowed(kind, level = getMotionSensitivity()) {
    return MOTION_SENSITIVITY[level].allows.includes(kind);
}
/** The static alternative of each category: what its elements show without motion. */
const STATIC_ALTERNATIVES = {
    reveal: 'Content visible in place; progress bars show the current value.',
    text: 'Full final text (screen readers always get a plain copy).',
    interaction: 'Normal hover / focus styles; no tilt, magnet or ripple.',
    feedback: 'Spinners become a static busy indicator; progress shows its value; toasts appear without sliding.',
    background: 'A still frame of the background (gradient / pattern); particles and marquees stop.',
    transitions: 'Dialogs, accordions and views switch instantly.',
    physics: 'Values jump to their target; drag still works, without inertia.',
    cards: 'Cards are shown flat and fully readable; stacks become lists.',
    click: 'Clicks work and states are announced; no bursts, confetti or deformation.',
    ui: 'Tabs, drawers, sheets and popovers open instantly with focus management intact.',
    page: 'Page transitions are instant; cursors and ambient layers are hidden.',
    timeline: 'Every step is shown at its final state.',
    gesture: 'Buttons / keys provide the same actions as swipes and pinches.',
    svg: 'Drawings and icons are shown complete.',
    webgl: 'A static poster image or CSS gradient instead of the shader.',
    depth: 'Flat, front-facing layout.',
    layout: 'Items reflow instantly.',
    packs: 'Roles are styled but not animated.',
    fx: 'Effects are skipped or reduced to a short fade; the content is unchanged.',
};
/**
 * Freeze a subtree at its static alternative: finishes running animations
 * (`finish()`, so content lands on its final state), marks the root with
 * `data-usa-static` and returns an undo that removes the mark.
 */
function staticAlternative(root) {
    const getAll = root.getAnimations;
    if (typeof getAll === 'function') {
        for (const a of getAll.call(root, { subtree: true })) {
            try {
                const it = a.effect?.getComputedTiming().iterations;
                if (it === Infinity)
                    a.cancel();
                else
                    a.finish();
            }
            catch {
                /* finished already */
            }
        }
    }
    root.setAttribute('data-usa-static', '');
    return () => root.removeAttribute('data-usa-static');
}
/** The ids of the shared live regions. */
const LIVE_REGION_IDS = { polite: 'usa-live-polite', assertive: 'usa-live-assertive' };
/** The shared live region (created once, visually hidden, `role="status"` / `role="alert"`). */
function liveRegion(politeness = 'polite') {
    if (typeof document === 'undefined' || !document.body)
        return null;
    const id = LIVE_REGION_IDS[politeness];
    let el = document.getElementById(id);
    if (!el) {
        el = document.createElement('div');
        el.id = id;
        el.className = 'usa-sr';
        el.setAttribute('role', politeness === 'assertive' ? 'alert' : 'status');
        el.setAttribute('aria-live', politeness);
        el.setAttribute('aria-atomic', 'true');
        document.body.appendChild(el);
    }
    return el;
}
let lastMsg = '';
let lastAt = 0;
/**
 * Announce a message through the shared live region. Conventions: `polite`
 * for results of the user's own actions (added, saved, copied), `assertive`
 * only for errors that block them. Identical messages within `dedupe` ms
 * (default 500) are dropped; the region is cleared first so repeats are read.
 */
function announce(message, options = {}) {
    const { politeness = 'polite', dedupe = 500 } = options;
    const t = Date.now();
    if (!message || (message === lastMsg && t - lastAt < dedupe))
        return false;
    lastMsg = message;
    lastAt = t;
    const el = liveRegion(politeness);
    if (!el)
        return false;
    el.textContent = '';
    el.textContent = message;
    return true;
}
const NAMED_ROLES = ['button', 'switch', 'checkbox', 'slider', 'tab', 'progressbar', 'radiogroup', 'dialog'];
function accessibleName(el) {
    const label = el.getAttribute('aria-label');
    if (label)
        return label;
    const by = el.getAttribute('aria-labelledby');
    if (by)
        return by.split(/\s+/).map((id) => el.ownerDocument.getElementById(id)?.textContent || '').join(' ').trim();
    return (el.textContent || el.getAttribute('title') || '').trim();
}
/**
 * Check a subtree against the library's motion-a11y rules:
 * - `aria-hidden-focusable` (error): focusable content inside `aria-hidden`.
 * - `role-name` (error): a widget role without an accessible name.
 * - `range-value` (error): a slider / determinate progressbar without `aria-valuenow`.
 * - `img-alt` (error): an `<img>` without `alt`.
 * - `assertive-live` (warning): `aria-live="assertive"` outside `role="alert"`.
 * - `infinite-no-control` (warning, WCAG 2.2.2): an endless animation on a
 *   page with no way to pause motion (`<usa-motion-switch>` or `[data-usa-pause]`).
 */
function auditMotionA11y(root) {
    const issues = [];
    const add = (rule, level, element, message) => issues.push({ rule, level, element, message });
    const scope = root;
    scope.querySelectorAll('[aria-hidden="true"]').forEach((h) => {
        const f = (h.matches(FOCUSABLE) ? [h] : Array.from(h.querySelectorAll(FOCUSABLE))).filter((x) => !x.closest('[inert]'));
        f.forEach((x) => add('aria-hidden-focusable', 'error', x, `focusable <${x.tagName.toLowerCase()}> inside aria-hidden`));
    });
    scope.querySelectorAll('[role]').forEach((el) => {
        const role = el.getAttribute('role');
        if (NAMED_ROLES.includes(role) && !accessibleName(el))
            add('role-name', 'error', el, `role="${role}" has no accessible name`);
        if (role === 'slider' && !el.hasAttribute('aria-valuenow'))
            add('range-value', 'error', el, 'slider without aria-valuenow');
    });
    scope.querySelectorAll('img:not([alt])').forEach((el) => add('img-alt', 'error', el, '<img> without alt'));
    scope.querySelectorAll('[aria-live="assertive"]').forEach((el) => {
        if (el.getAttribute('role') !== 'alert')
            add('assertive-live', 'warning', el, 'assertive live region outside role="alert"');
    });
    const doc = root.ownerDocument || root;
    const anims = typeof root.getAnimations === 'function' ? root.getAnimations({ subtree: true }) : [];
    const control = doc && (doc.querySelector('usa-motion-switch, [data-usa-pause]') || doc.documentElement.hasAttribute('data-usa-sensitivity'));
    if (!control)
        anims.forEach((a) => {
            try {
                if (a.effect?.getComputedTiming().iterations === Infinity) {
                    const t = a.effect.target;
                    if (t)
                        add('infinite-no-control', 'warning', t, 'endless animation and no motion control on the page');
                }
            }
            catch {
                /* ignore */
            }
        });
    return { errors: issues.filter((i) => i.level === 'error'), warnings: issues.filter((i) => i.level === 'warning') };
}
/** Every `<usa-*>` tag, for sweeping audits. */
const ALL_TAGS = Object.values(COMPONENT_CATEGORIES).flat();

/**
 * motionary/components/bridge — native shell bridges (4.7).
 *
 * Keeps the web UI in sync with the host app's system settings when it runs
 * inside **WinUI 3 / WPF (WebView2)**, **.NET MAUI** (WebView / HybridWebView)
 * or **Flutter** (webview_flutter / flutter_inappwebview): the native side
 * sends "reduce motion", light / dark / high-contrast theme and accent color;
 * the page applies them to every `<usa-*>` component.
 *
 * Protocol (JSON, both directions):
 * - native → web `{ "type": "usa:settings", "reducedMotion": true, "theme": "dark", "accent": "#0078d4", "sensitivity": "gentle" }`
 * - web → native `{ "type": "usa:ready", "version": 1 }` on connect, `{ "type": "usa:request-settings" }`
 *
 * Hosts that can only run script call `window.usaNative.apply({...})`.
 * Samples: examples/native/{winui3,maui,flutter}.
 */
const BRIDGE_PROTOCOL_VERSION = 1;
const win = () => (typeof window === 'undefined' ? null : window);
/** Which native shell (if any) hosts this page. */
function detectNativeHost(channel = 'UsaBridge') {
    const w = win();
    if (!w)
        return 'browser';
    if (w.chrome?.webview?.postMessage)
        return 'webview2';
    if (w.HybridWebView?.SendRawMessage || w.HybridWebView?.SendRawMessageToDotNet || /\bMAUI\b/i.test(w.navigator?.userAgent || ''))
        return 'maui';
    if (w.flutter_inappwebview?.callHandler || w[channel]?.postMessage)
        return 'flutter';
    if (w.__TAURI__ || w.__TAURI_INTERNALS__)
        return 'tauri';
    if (w.process?.versions?.electron || /Electron\//.test(w.navigator?.userAgent || ''))
        return 'electron';
    return 'browser';
}
/** Send a JSON message to the native host (no-op in a plain browser). Returns whether it was sent. */
function postToNative(message, channel = 'UsaBridge') {
    const w = win();
    if (!w)
        return false;
    const json = JSON.stringify(message);
    try {
        if (w.chrome?.webview?.postMessage)
            return w.chrome.webview.postMessage(message), true;
        if (w.HybridWebView?.SendRawMessage)
            return w.HybridWebView.SendRawMessage(json), true;
        if (w.HybridWebView?.SendRawMessageToDotNet)
            return w.HybridWebView.SendRawMessageToDotNet(json), true;
        if (w.flutter_inappwebview?.callHandler)
            return w.flutter_inappwebview.callHandler(channel, json), true;
        if (w[channel]?.postMessage)
            return w[channel].postMessage(json), true;
    }
    catch {
        /* host went away */
    }
    return false;
}
const THEMES = ['light', 'dark', 'high-contrast'];
const COLOR = /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\)|hsla?\([\d\s.,%deg]+\))$/i;
/** Validate an incoming message (string or object); unknown fields are dropped. */
function parseNativeSettings(data) {
    let d = data;
    if (typeof d === 'string') {
        try {
            d = JSON.parse(d);
        }
        catch {
            return null;
        }
    }
    if (!d || typeof d !== 'object' || d.type !== 'usa:settings')
        return null;
    const out = {};
    if (typeof d.reducedMotion === 'boolean')
        out.reducedMotion = d.reducedMotion;
    if (THEMES.includes(d.theme))
        out.theme = d.theme;
    if (typeof d.accent === 'string' && COLOR.test(d.accent.trim()))
        out.accent = d.accent.trim();
    if (MOTION_SENSITIVITY_LEVELS.includes(d.sensitivity))
        out.sensitivity = d.sensitivity;
    return out;
}
/**
 * Apply native settings: reduce motion → `configureComponents({ reducedMotion: 'reduce' })`
 * (`false` → follow the media query again); theme → `data-theme`, `data-usa-contrast`
 * and `color-scheme`; accent → `--usa-accent`; sensitivity → `motionSensitivity`.
 */
function applyNativeSettings(s, root) {
    if (s.reducedMotion !== undefined)
        configureComponents({ reducedMotion: s.reducedMotion ? 'reduce' : 'user' });
    if (s.sensitivity)
        configureComponents({ motionSensitivity: s.sensitivity });
    const el = root || (typeof document !== 'undefined' ? document.documentElement : null);
    if (!el)
        return;
    if (s.theme) {
        el.setAttribute('data-theme', s.theme === 'high-contrast' ? 'dark' : s.theme);
        el.toggleAttribute('data-usa-contrast', s.theme === 'high-contrast');
        el.style.colorScheme = s.theme === 'light' ? 'light' : 'dark';
    }
    if (s.accent)
        el.style.setProperty('--usa-accent', s.accent);
    if (typeof document !== 'undefined')
        document.dispatchEvent(new CustomEvent('usa:native-settings', { detail: s }));
}
/**
 * Connect to the native shell: listens for `usa:settings` messages
 * (WebView2 `chrome.webview` messages, `window.postMessage`, or
 * `window.usaNative.apply()`), applies them, then announces `usa:ready` and
 * asks for the current settings. Returns `{ host, disconnect }`.
 */
function connectNativeShell(options = {}) {
    const w = win();
    const channel = options.channel || 'UsaBridge';
    const host = detectNativeHost(channel);
    if (!w)
        return { host, disconnect: () => undefined };
    const handle = (data) => {
        const s = parseNativeSettings(data);
        if (!s)
            return;
        applyNativeSettings(s, options.root);
        options.onSettings?.(s, host);
    };
    const onMessage = (e) => handle(e.data);
    w.chrome?.webview?.addEventListener?.('message', onMessage);
    w.addEventListener?.('message', onMessage);
    const prev = w.usaNative;
    w.usaNative = { apply: (s) => handle({ ...s, type: 'usa:settings' }), version: BRIDGE_PROTOCOL_VERSION, host };
    postToNative({ type: 'usa:ready', version: BRIDGE_PROTOCOL_VERSION }, channel);
    postToNative({ type: 'usa:request-settings' }, channel);
    return {
        host,
        disconnect: () => {
            w.chrome?.webview?.removeEventListener?.('message', onMessage);
            w.removeEventListener?.('message', onMessage);
            w.usaNative = prev;
        },
    };
}

/**
 * motionary/components
 *
 * Framework-agnostic, dependency-free animated UI components built on
 * Custom Elements + CSS + the Web Animations API. They run in any browser
 * and in Windows desktop apps that render with a web view: Electron, Tauri
 * (WebView2), WinUI 3 / WPF / WinForms with WebView2, and installed PWAs.
 *
 * ```js
 * import { defineComponents } from 'motionary/components';
 * defineComponents(); // registers every <usa-*> element
 * // or only what you use (tree-shakable):
 * import { defineTypewriter } from 'motionary/components/text';
 * ```
 *
 * Importing has no side effects and is SSR-safe; nothing is registered
 * until a `define*()` function runs in a browser.
 *
 * @license MIT
 */
const BY_CATEGORY = {
    reveal: defineRevealComponents,
    text: defineTextComponents,
    interaction: defineInteractionComponents,
    feedback: defineFeedbackComponents,
    background: defineBackgroundComponents,
    transitions: defineTransitionComponents,
    physics: definePhysicsComponents,
    cards: defineCardComponents,
    click: defineClickComponents,
    ui: defineUiComponents,
    page: definePageComponents,
    timeline: defineTimelineComponents,
    gesture: defineGestureComponents,
    svg: defineSvgComponents,
    webgl: defineWebglComponents,
    depth: defineDepthComponents,
    layout: defineLayoutComponents,
    packs: definePacksComponents,
    fx: defineFxComponents,
};
/**
 * Register every `<usa-*>` component (or only the given categories).
 * Safe to call more than once and on the server (no-op without DOM).
 */
function defineComponents(categories) {
    if (canDefine())
        adoptVariants();
    (categories || Object.keys(BY_CATEGORY)).forEach((c) => BY_CATEGORY[c]?.());
}

/**
 * motionary/components/lite — every component and helper **without
 * inlined CSS** (4.5): each category's stylesheet (`dist/components/<cat>.css`)
 * is loaded on demand the first time one of its elements connects.
 * Same API as `motionary/components`; ~15 KB gzip smaller.
 *
 * ```ts
 * import { defineComponents } from 'motionary/components/lite';
 * defineComponents();            // CSS for <usa-card> loads when the first card mounts
 * ```
 * Override where the CSS comes from with `onDemandStyles(base)`.
 */
/** The dist/ folder this module was loaded from. */
const STYLE_BASE = new URL('../', import.meta.url).href;
onDemandStyles(STYLE_BASE);

export { ALL_TAGS, AMBIENT_EFFECTS, ANIM_ICONS, BRIDGE_PROTOCOL_VERSION, BUILTIN_EFFECTS, BUTTON_DEFORMS, CARD_EFFECTS, CLICK_EFFECTS, COMPONENT_CATEGORIES, CURSOR_MODES, EFFECT_KINDS, EFFECT_TRIGGERS, GL_FALLBACKS, JOINING_SCRIPT, LIVE_REGION_IDS, MASK_SHAPES, MORPH_ICONS, MOTION_SCALE, MOTION_SENSITIVITY, MOTION_SENSITIVITY_LEVELS, MOTION_TOKENS, PACKS, PACK_PRIMITIVES, PAGE_EFFECTS, PARTICLE_PRESETS, POST_EFFECTS, REVEAL_EFFECTS, SENSITIVITY_CSS, SHADERS, SPINNER_VARIANTS, SPRING_EFFECTS, SPRING_PRESETS, STATIC_ALTERNATIVES, STYLE_BASE, TIMELINE_PRESETS, VARIANTS, activeAnimations, adaptKeyframes, adoptVariants, animateWithMotion, animationBudget, announce, applyMotionTokens, applyNativeSettings, applyPack, auditMotionA11y, autoAnimate, autoDegrade, baselineReport, bindEffect, categoryOf, configureComponents, connectNativeShell, countUp, createSpring, defineAccordion, defineAcrylic, defineAmbient, defineAnimIcon, defineAurora, defineAutoAnimate, defineAutoSkeleton, defineAvatarStack, defineBackToTop, defineBackgroundComponents, defineBadge, defineBlobs, defineBottomSheet, defineButton, defineCard, defineCardComponents, defineCardStack, defineCarousel3d, defineCheck, defineCheckbox, defineClick, defineClickComponents, defineComponents, defineCounter, defineCube, defineCursor, defineDepth, defineDepthComponents, defineDialog, defineDistort, defineDotNetwork, defineDoubleTap, defineDraggable, defineDraw, defineDrawer, defineFab, defineFeedbackComponents, defineFullpage, defineFx, defineFxComponents, defineGestureComponents, defineGlitch, defineGradientText, defineGrain, defineGridGlow, defineHandwriting, defineHold, defineIconMorph, defineInteractionComponents, defineLayoutComponents, defineLike, defineLiquid, defineLoadingBar, defineMagnetic, defineMarquee, defineMaskReveal, defineMasonry, defineMorph, defineMotionSwitch, defineNavbar, defineOverscroll, definePack, definePacksComponents, definePageComponents, defineParticles, definePhysicsComponents, definePinchZoom, definePopover, definePostFx, definePress, defineProgress, definePullRefresh, defineReveal, defineRevealComponents, defineRipple, defineScramble, defineScrollHighlight, defineScrollProgress, defineScrolly, defineShader, defineShimmerText, defineSkeleton, defineSlider, defineSpinner, defineSplash, defineSplitText, defineSpotlight, defineSpring, defineStagger, defineStickyStack, defineSvgComponents, defineSwipeable, defineTabs, defineTextComponents, defineTextRotate, defineTilt, defineTimeline, defineTimelineComponents, defineToaster, defineTransitionComponents, defineTypewriter, defineUiComponents, defineViewSwitch, defineWaterRipple, defineWaveText, defineWebglComponents, detectNativeHost, deviceTilt, drawLines, easeOutExpo, enableMpaTransitions, exportDesignTokens, flip, flipFrames, fluentPreset, flyToCart, fragmentSource, gesture, getEffect, getMotionIntensity, getMotionLevel, getMotionSensitivity, getMotionTokens, glFallbackCss, glGovernor, glQuad, graphemes, haptic, hasEffect, importDesignTokens, importMotionTokens, interpolatePath, linearEasing, listEffects, liveRegion, loadCategoryStyles, loadedStyles, loadingBar, masonryLayout, mergeMotionTokens, morphPath, morphTo, motionAllowed, motionScale, motionToken, motionTokensToCss, motionTokensToJSON, motionTokensToVars, motionVar, onDemandStyles, onFrame, orientationToTilt, pageTransition, parseDuration, parseEasing, parseNativeSettings, pathsCompatible, pinchScale, playEffect, postFxShader, postToNative, prefersReducedMotion, projectInertia, readScrollProgress, registerBuiltinEffects, registerEffect, registerEffects, requestOrientationPermission, resolveDurationToken, resolveEasingToken, resolvePosition, resolveSpring, resolveTokenAliases, restoreMotionIntensity, restoreMotionSensitivity, revealKeyframes, rubberBand, schedulerStats, scrambleFrame, scrollToTarget, setAnimationBudget, setMotionIntensity, setMotionLevel, setMotionSensitivity, setVariant, sharedTransition, smoothScroll, snapTo, splitOrder, splitText, splitTimeline, words as splitWords, spring, springEasing, springEffectKeyframes, springSamples, staticAlternative, stepSpring, supportsLinearEasing, supportsNativeScrub, supportsOrientation, supportsViewTransitions, supportsWebGL, swipeDirection, themeTransition, timeline, toast, validateDesignTokens, viewTransition, warnBaseline, watchPowerSaver, withoutDeprecations };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v13.2.0/dist/components/lite.js.map