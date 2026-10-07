'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
 * use-scroll-animate - Animation Presets
 * Defines keyframes for all built-in animation presets
 */
const PRESETS = {
    'fade-in': {
        from: { opacity: 0 },
        to: { opacity: 1 },
    },
    'fade-in-up': {
        from: { opacity: 0, transform: 'translateY(40px)' },
        to: { opacity: 1, transform: 'translateY(0px)' },
    },
    'fade-in-down': {
        from: { opacity: 0, transform: 'translateY(-40px)' },
        to: { opacity: 1, transform: 'translateY(0px)' },
    },
    'fade-in-left': {
        from: { opacity: 0, transform: 'translateX(-40px)' },
        to: { opacity: 1, transform: 'translateX(0px)' },
    },
    'fade-in-right': {
        from: { opacity: 0, transform: 'translateX(40px)' },
        to: { opacity: 1, transform: 'translateX(0px)' },
    },
    'zoom-in': {
        from: { opacity: 0, transform: 'scale(0.8)' },
        to: { opacity: 1, transform: 'scale(1)' },
    },
    'zoom-out': {
        from: { opacity: 0, transform: 'scale(1.2)' },
        to: { opacity: 1, transform: 'scale(1)' },
    },
    'flip-x': {
        from: { opacity: 0, transform: 'rotateX(-90deg)' },
        to: { opacity: 1, transform: 'rotateX(0deg)' },
    },
    'flip-y': {
        from: { opacity: 0, transform: 'rotateY(-90deg)' },
        to: { opacity: 1, transform: 'rotateY(0deg)' },
    },
    'slide-up': {
        from: { transform: 'translateY(100%)' },
        to: { transform: 'translateY(0px)' },
    },
    'slide-down': {
        from: { transform: 'translateY(-100%)' },
        to: { transform: 'translateY(0px)' },
    },
    'slide-left': {
        from: { transform: 'translateX(-100%)' },
        to: { transform: 'translateX(0px)' },
    },
    'slide-right': {
        from: { transform: 'translateX(100%)' },
        to: { transform: 'translateX(0px)' },
    },
    'bounce': {
        from: { opacity: 0, transform: 'translateY(-60px)' },
        to: { opacity: 1, transform: 'translateY(0px)' },
    },
    'rotate-in': {
        from: { opacity: 0, transform: 'rotate(-180deg) scale(0.5)' },
        to: { opacity: 1, transform: 'rotate(0deg) scale(1)' },
    },
    'blur-in': {
        from: { opacity: 0, filter: 'blur(12px)' },
        to: { opacity: 1, filter: 'blur(0px)' },
    },
    'skew-in': {
        from: { opacity: 0, transform: 'skewX(20deg) translateX(30px)' },
        to: { opacity: 1, transform: 'skewX(0deg) translateX(0px)' },
    },
    'scale-x': {
        from: { transform: 'scaleX(0)' },
        to: { transform: 'scaleX(1)' },
    },
    'scale-y': {
        from: { transform: 'scaleY(0)' },
        to: { transform: 'scaleY(1)' },
    },
    'shimmer': {
        from: { opacity: 0.5, filter: 'brightness(1)' },
        to: { opacity: 1, filter: 'brightness(1.5)' },
    },
    'pulse': {
        from: { transform: 'scale(1)' },
        to: { transform: 'scale(1.05)' },
    },
    'swing': {
        from: { transform: 'rotate(-10deg)' },
        to: { transform: 'rotate(10deg)' },
    },
    'scale-up': {
        from: { opacity: 0, transform: 'scale(0.5)' },
        to: { opacity: 1, transform: 'scale(1)' },
    },
    'blur-in-up': {
        from: { opacity: 0, filter: 'blur(12px)', transform: 'translateY(40px)' },
        to: { opacity: 1, filter: 'blur(0px)', transform: 'translateY(0px)' },
    },
    'flip-up': {
        from: { opacity: 0, transform: 'perspective(800px) rotateX(60deg)' },
        to: { opacity: 1, transform: 'perspective(800px) rotateX(0deg)' },
    },
    'flip-down': {
        from: { opacity: 0, transform: 'perspective(800px) rotateX(-60deg)' },
        to: { opacity: 1, transform: 'perspective(800px) rotateX(0deg)' },
    },
    'rotate-left': {
        from: { opacity: 0, transform: 'rotate(-15deg) translateX(-40px)' },
        to: { opacity: 1, transform: 'rotate(0deg) translateX(0px)' },
    },
    'rotate-right': {
        from: { opacity: 0, transform: 'rotate(15deg) translateX(40px)' },
        to: { opacity: 1, transform: 'rotate(0deg) translateX(0px)' },
    },
    // clip-path reveals: content is uncovered without moving or fading
    'clip-up': {
        from: { clipPath: 'inset(100% 0% 0% 0%)' },
        to: { clipPath: 'inset(0% 0% 0% 0%)' },
    },
    'clip-down': {
        from: { clipPath: 'inset(0% 0% 100% 0%)' },
        to: { clipPath: 'inset(0% 0% 0% 0%)' },
    },
    'clip-left': {
        from: { clipPath: 'inset(0% 0% 0% 100%)' },
        to: { clipPath: 'inset(0% 0% 0% 0%)' },
    },
    'clip-right': {
        from: { clipPath: 'inset(0% 100% 0% 0%)' },
        to: { clipPath: 'inset(0% 0% 0% 0%)' },
    },
    'clip-circle': {
        from: { clipPath: 'circle(0% at 50% 50%)' },
        to: { clipPath: 'circle(75% at 50% 50%)' },
    },
};
function resolvePreset(animation) {
    var _a;
    if (typeof animation === 'string') {
        return (_a = PRESETS[animation.trim()]) !== null && _a !== void 0 ? _a : PRESETS['fade-in-up'];
    }
    if (Array.isArray(animation)) {
        const combined = { from: {}, to: {} };
        animation.forEach(name => {
            const preset = PRESETS[name.trim()];
            if (preset) {
                Object.entries(preset.from).forEach(([key, val]) => {
                    if (key === 'transform' && combined.from[key]) {
                        combined.from[key] = `${combined.from[key]} ${val}`;
                    }
                    else {
                        combined.from[key] = val;
                    }
                });
                Object.entries(preset.to).forEach(([key, val]) => {
                    if (key === 'transform' && combined.to[key]) {
                        combined.to[key] = `${combined.to[key]} ${val}`;
                    }
                    else {
                        combined.to[key] = val;
                    }
                });
            }
        });
        return combined;
    }
    return animation;
}
/** Easing to CSS cubic-bezier mapping */
const EASING_MAP = {
    linear: 'linear',
    ease: 'ease',
    'ease-in': 'ease-in',
    'ease-out': 'ease-out',
    'ease-in-out': 'ease-in-out',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    'soft-spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    'heavy-bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};
function resolveEasing(easing) {
    var _a;
    if (typeof easing === 'string') {
        return (_a = EASING_MAP[easing]) !== null && _a !== void 0 ? _a : easing;
    }
    if (Array.isArray(easing)) {
        return `cubic-bezier(${easing.join(', ')})`;
    }
    if (typeof easing === 'function') {
        // Functions cannot be expressed as a CSS easing string; the core samples
        // them into a `linear()` easing (or keyframes on older browsers).
        return 'linear';
    }
    return 'ease';
}

/**
 * use-scroll-animate - Core Implementation
 * Uses IntersectionObserver + Web Animations API for zero-dependency,
 * high-performance scroll-triggered animations.
 */
const DEFAULT_CONFIG = {
    defaultAnimation: 'fade-in-up',
    defaultDuration: 600,
    defaultDelay: 0,
    defaultEasing: 'ease',
    defaultThreshold: 0.1,
    defaultRootMargin: '0px',
    defaultRepeat: false,
    defaultOnce: true,
    defaultOffset: 0,
    hiddenClass: 'sa-hidden',
    visibleClass: 'sa-visible',
    useClassNames: false,
    disabled: false,
    root: null,
    autoUnregister: true,
};
const noop = () => undefined;
/* ------------------------------------------------------------------ */
/* Environment helpers (all SSR-safe: never touch globals at import)   */
/* ------------------------------------------------------------------ */
const hasDOM = () => typeof window !== 'undefined' && typeof document !== 'undefined';
/** @internal */
const supportsObserver = () => hasDOM() && typeof IntersectionObserver !== 'undefined';
let reducedMotionQuery;
/** @internal Whether the user asked the OS/browser to reduce motion. */
function prefersReducedMotion() {
    if (!hasDOM())
        return false;
    if (reducedMotionQuery === undefined) {
        reducedMotionQuery =
            typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    }
    return !!reducedMotionQuery && reducedMotionQuery.matches;
}
/* ------------------------------------------------------------------ */
/* Option parsing                                                      */
/* ------------------------------------------------------------------ */
function num(value) {
    if (value === undefined || value.trim() === '')
        return undefined;
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : undefined;
}
/** Numeric strings ("100") become numbers (px); strings with units stay as-is. */
function lengthValue(value) {
    if (value === undefined || value.trim() === '')
        return undefined;
    const v = value.trim();
    return /^-?(\d+\.?\d*|\.\d+)$/.test(v) ? parseFloat(v) : v;
}
const DEFAULT_PROGRESS_VAR = '--sa-progress';
/** `''` (bare attribute) -> default name; `sa-progress` -> `--sa-progress`. */
function normalizeVar(name) {
    const v = name.trim();
    if (!v)
        return DEFAULT_PROGRESS_VAR;
    return v.startsWith('--') ? v : `--${v}`;
}
function parseDataAttributes(el, config) {
    var _a;
    const dataset = el.dataset || {};
    const opts = {};
    if (dataset.saAnimation) {
        const anim = dataset.saAnimation;
        opts.animation = (anim.includes(',') ? anim.split(',').map((s) => s.trim()) : anim.trim());
    }
    opts.duration = num(dataset.saDuration);
    opts.delay = num(dataset.saDelay);
    if (dataset.saEasing) {
        const e = dataset.saEasing.trim();
        if (e.startsWith('[')) {
            try {
                opts.easing = JSON.parse(e);
            }
            catch (_b) {
                // Malformed JSON: fall back to the default easing instead of throwing
            }
        }
        else {
            opts.easing = e;
        }
    }
    if (dataset.saThreshold) {
        const t = dataset.saThreshold;
        opts.threshold = t.includes(',')
            ? t.split(',').map(parseFloat).filter(Number.isFinite)
            : num(t);
    }
    if (dataset.saRootMargin)
        opts.rootMargin = dataset.saRootMargin;
    if (dataset.saRepeat !== undefined)
        opts.repeat = dataset.saRepeat !== 'false';
    if (dataset.saOnce !== undefined)
        opts.once = dataset.saOnce !== 'false';
    opts.offset = num(dataset.saOffset);
    opts.stagger = num(dataset.saStagger);
    if (dataset.saProgressVar !== undefined)
        opts.progressVar = normalizeVar(dataset.saProgressVar);
    if (dataset.saProgress)
        opts.progressMode = dataset.saProgress.trim() === 'scroll' ? 'scroll' : 'ratio';
    if (dataset.saParallaxX || dataset.saParallaxY || dataset.saParallaxRotate || dataset.saParallaxScale) {
        opts.parallax = {
            x: lengthValue(dataset.saParallaxX),
            y: lengthValue(dataset.saParallaxY),
            rotate: num(dataset.saParallaxRotate),
            scale: num(dataset.saParallaxScale),
            speed: (_a = num(dataset.saParallaxSpeed)) !== null && _a !== void 0 ? _a : 1,
        };
    }
    return mergeOptions(opts, config);
}
function mergeOptions(opts, config) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
    const repeat = (_a = opts.repeat) !== null && _a !== void 0 ? _a : config.defaultRepeat;
    const threshold = (_b = opts.threshold) !== null && _b !== void 0 ? _b : config.defaultThreshold;
    return {
        animation: (_c = opts.animation) !== null && _c !== void 0 ? _c : config.defaultAnimation,
        duration: (_d = opts.duration) !== null && _d !== void 0 ? _d : config.defaultDuration,
        delay: (_e = opts.delay) !== null && _e !== void 0 ? _e : config.defaultDelay,
        easing: (_f = opts.easing) !== null && _f !== void 0 ? _f : config.defaultEasing,
        threshold: Array.isArray(threshold) && threshold.length === 0 ? config.defaultThreshold : threshold,
        rootMargin: (_g = opts.rootMargin) !== null && _g !== void 0 ? _g : config.defaultRootMargin,
        repeat,
        once: (_h = opts.once) !== null && _h !== void 0 ? _h : (repeat ? false : config.defaultOnce),
        offset: (_j = opts.offset) !== null && _j !== void 0 ? _j : config.defaultOffset,
        stagger: (_k = opts.stagger) !== null && _k !== void 0 ? _k : 0,
        parallax: (_l = opts.parallax) !== null && _l !== void 0 ? _l : {},
        onStart: (_m = opts.onStart) !== null && _m !== void 0 ? _m : noop,
        onComplete: (_o = opts.onComplete) !== null && _o !== void 0 ? _o : noop,
        onEnter: (_p = opts.onEnter) !== null && _p !== void 0 ? _p : noop,
        onLeave: (_q = opts.onLeave) !== null && _q !== void 0 ? _q : noop,
        onProgress: (_r = opts.onProgress) !== null && _r !== void 0 ? _r : noop,
        progressMode: (_s = opts.progressMode) !== null && _s !== void 0 ? _s : 'ratio',
        progressVar: opts.progressVar ? normalizeVar(opts.progressVar) : '',
    };
}
function resolveTargets(target) {
    if (!target || !hasDOM())
        return [];
    if (typeof target === 'string')
        return Array.from(document.querySelectorAll(target));
    if (target instanceof Element)
        return [target];
    if (Array.isArray(target) || target instanceof NodeList) {
        return Array.from(target).filter((el) => el instanceof Element);
    }
    return [];
}
/**
 * Apply `offset` to the bottom edge of a rootMargin, preserving the other
 * three sides. `offset: 100` means "trigger 100px later" (bottom -100px).
 * @internal
 */
function applyOffset(rootMargin, offset) {
    var _a, _b, _c;
    if (!offset)
        return rootMargin;
    const parts = (rootMargin || '0px').trim().split(/\s+/);
    const top = parts[0];
    const right = (_a = parts[1]) !== null && _a !== void 0 ? _a : top;
    const bottom = (_b = parts[2]) !== null && _b !== void 0 ? _b : top;
    const left = (_c = parts[3]) !== null && _c !== void 0 ? _c : right;
    const m = /^(-?\d*\.?\d+)(px)?$/.exec(bottom);
    const base = m ? parseFloat(m[1]) : 0; // non-px bottoms (e.g. %) cannot be combined; offset wins
    return `${top} ${right} ${base - offset}px ${left}`;
}
function hasParallax(p) {
    return !!p && Object.keys(p).some((k) => p[k] !== undefined);
}
function needsProgress(opts) {
    return hasParallax(opts.parallax) || opts.onProgress !== noop || !!opts.progressVar;
}
/**
 * True scroll progress of `el` through the viewport (or `root`): 0 when its top
 * edge reaches the bottom of the viewport, 1 when its bottom edge passes the top.
 * Works for elements taller than the viewport. Returns 0 without a DOM.
 */
function getScrollProgress(el, root) {
    if (!hasDOM())
        return 0;
    const rect = el.getBoundingClientRect();
    let top = 0;
    let height = window.innerHeight || document.documentElement.clientHeight || 0;
    if (root) {
        const r = root.getBoundingClientRect();
        top = r.top;
        height = r.height;
    }
    const total = height + rect.height;
    if (total <= 0)
        return 0;
    const p = (top + height - rect.top) / total;
    return p < 0 ? 0 : p > 1 ? 1 : p;
}
/* ------------------------------------------------------------------ */
/* Animation                                                           */
/* ------------------------------------------------------------------ */
/** The animation currently running on an element, so it can be cancelled/replaced. */
const running = new WeakMap();
const timers = new WeakMap();
function cancelRunning(el) {
    const anim = running.get(el);
    if (anim) {
        running.delete(el);
        anim.onfinish = null;
        anim.cancel();
    }
    const timer = timers.get(el);
    if (timer !== undefined) {
        clearTimeout(timer);
        timers.delete(el);
    }
}
function setStyles(el, styles) {
    const style = el.style;
    if (!style)
        return;
    Object.keys(styles).forEach((prop) => {
        style[prop] = String(styles[prop]);
    });
}
const NUM_UNIT = /(-?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)([a-z%]*)/gi;
/**
 * Interpolate two CSS values at `t`. Numbers interpolate directly; strings
 * interpolate when they share the same structure (e.g. `translateY(40px)` ->
 * `translateY(0px)`, or `scale(0.8)` -> `scale(1)`). Otherwise snaps at 0.5.
 * @internal
 */
function interpolateValue(from, to, t) {
    if (typeof from === 'number' && typeof to === 'number')
        return from + (to - from) * t;
    const a = String(from);
    const b = String(to);
    const ta = [];
    const tb = [];
    const skA = a.replace(NUM_UNIT, (_, n, u) => (ta.push([parseFloat(n), u]), '#'));
    const skB = b.replace(NUM_UNIT, (_, n, u) => (tb.push([parseFloat(n), u]), '#'));
    if (skA !== skB || ta.length !== tb.length)
        return t < 0.5 ? from : to;
    let i = 0;
    let ok = true;
    const out = skA.replace(/#/g, () => {
        const [na, ua] = ta[i];
        const [nb, ub] = tb[i++];
        if (ua !== ub && na !== 0 && nb !== 0 && ua && ub)
            ok = false;
        const unit = ua || ub;
        return `${+(na + (nb - na) * t).toFixed(4)}${unit}`;
    });
    return ok ? out : t < 0.5 ? from : to;
}
const EASING_SAMPLES = 30;
let linearSupported;
function supportsLinearEasing() {
    if (linearSupported === undefined) {
        linearSupported =
            typeof CSS !== 'undefined' &&
                typeof CSS.supports === 'function' &&
                CSS.supports('animation-timing-function', 'linear(0, 1)');
    }
    return linearSupported;
}
function sampleEasing(fn) {
    const values = [];
    for (let i = 0; i <= EASING_SAMPLES; i++) {
        const v = fn(i / EASING_SAMPLES);
        values.push(Number.isFinite(v) ? +v.toFixed(4) : i / EASING_SAMPLES);
    }
    return values;
}
function buildAnimation(preset, easing) {
    if (typeof easing !== 'function') {
        return { keyframes: [preset.from, preset.to], easing: resolveEasing(easing) };
    }
    const samples = sampleEasing(easing);
    // Modern browsers: an exact, property-agnostic `linear()` easing curve.
    if (supportsLinearEasing()) {
        return { keyframes: [preset.from, preset.to], easing: `linear(${samples.join(', ')})` };
    }
    // Fallback: approximate the curve with interpolated keyframes.
    const props = Object.keys(preset.from).filter((p) => p in preset.to);
    const keyframes = samples.map((eased, i) => {
        const frame = { offset: i / EASING_SAMPLES };
        props.forEach((prop) => {
            frame[prop] = interpolateValue(preset.from[prop], preset.to[prop], eased);
        });
        return frame;
    });
    return { keyframes, easing: 'linear' };
}
/** Make an element visible without animating (reduced motion / disabled / no WAAPI). */
function reveal(el, config) {
    cancelRunning(el);
    if (config.useClassNames) {
        el.classList.remove(config.hiddenClass);
        el.classList.add(config.visibleClass);
    }
    else {
        const style = el.style;
        if (style)
            style.opacity = '';
    }
}
/** @internal Cancel a running/pending animation and make the element visible. */
function stopAnimation(el, config = {}) {
    reveal(el, { ...DEFAULT_CONFIG, ...config });
}
/** @internal Whether animations should be skipped entirely. */
function motionDisabled(config) {
    return !!config.disabled || prefersReducedMotion();
}
function runAnimation(el, opts, config, staggerIndex = 0) {
    const { duration, delay, stagger, onStart, onComplete } = opts;
    const totalDelay = Math.max(0, delay + staggerIndex * stagger);
    cancelRunning(el);
    if (motionDisabled(config)) {
        reveal(el, config);
        onStart(el);
        onComplete(el);
        return;
    }
    if (config.useClassNames) {
        if (totalDelay > 0)
            el.style.animationDelay = `${totalDelay}ms`;
        el.classList.remove(config.hiddenClass);
        el.classList.add(config.visibleClass);
        onStart(el);
        timers.set(el, setTimeout(() => {
            timers.delete(el);
            onComplete(el);
        }, duration + totalDelay));
        return;
    }
    const preset = resolvePreset(opts.animation);
    // Presets that don't animate opacity (slide-*, clip-*, scale-x, ...) would
    // otherwise stay at the `opacity: 0` applied while waiting to enter.
    if (!('opacity' in preset.to)) {
        const style = el.style;
        if (style && style.opacity === '0')
            style.opacity = '';
    }
    if (typeof el.animate !== 'function') {
        setStyles(el, preset.to);
        onStart(el);
        onComplete(el);
        return;
    }
    const built = buildAnimation(preset, opts.easing);
    const timing = { duration, delay: totalDelay, easing: built.easing, fill: 'both' };
    let anim;
    try {
        anim = el.animate(built.keyframes, timing);
    }
    catch (_a) {
        // Invalid user easing string (WAAPI throws a TypeError): fall back to 'ease'
        anim = el.animate(built.keyframes, { ...timing, easing: 'ease' });
    }
    running.set(el, anim);
    onStart(el);
    anim.onfinish = () => {
        if (running.get(el) === anim) {
            running.delete(el);
            // Persist the end state inline and drop the filling animation. This frees
            // the Animation object and lets later inline styles (parallax, user code)
            // take effect instead of being masked by `fill: forwards`.
            try {
                anim.commitStyles();
            }
            catch (_a) {
                setStyles(el, preset.to);
            }
            anim.cancel();
        }
        onComplete(el);
    };
}
function applyParallax(el, progress, parallax) {
    const { x = 0, y = 0, rotate = 0, scale = 1, speed = 1 } = parallax;
    const p = (progress - 0.5) * 2 * speed;
    const axis = (v) => (typeof v === 'number' ? `${v * p}px` : `calc(${v} * ${p})`);
    let transform = '';
    if (x)
        transform += ` translateX(${axis(x)})`;
    if (y)
        transform += ` translateY(${axis(y)})`;
    if (rotate)
        transform += ` rotate(${rotate * p}deg)`;
    if (scale !== 1)
        transform += ` scale(${1 + (scale - 1) * p})`;
    el.style.transform = transform.trim();
}
function hideElement(el, config) {
    cancelRunning(el);
    if (config.useClassNames) {
        el.classList.add(config.hiddenClass);
        el.classList.remove(config.visibleClass);
    }
    else {
        const style = el.style;
        if (style)
            style.opacity = '0';
    }
}
/** @internal Hide an element before its entrance animation, unless motion is off. */
function prepareElement(el, config = {}) {
    const full = { ...DEFAULT_CONFIG, ...config };
    if (!motionDisabled(full))
        hideElement(el, full);
}
let progressThresholds;
function getProgressThresholds() {
    if (!progressThresholds) {
        progressThresholds = [];
        for (let i = 0; i <= 100; i++)
            progressThresholds.push(i / 100);
    }
    return progressThresholds;
}
const PASSIVE = { passive: true };
/* ------------------------------------------------------------------ */
/* Instance                                                            */
/* ------------------------------------------------------------------ */
function createScrollAnimate(userConfig = {}) {
    let config = { ...DEFAULT_CONFIG, ...userConfig };
    const registry = new Map();
    // `once` elements that finished and were dropped from the registry (autoUnregister).
    let finished = new WeakSet();
    // Elements in `progressMode: 'scroll'` that are currently inside the viewport.
    const scrolling = new Set();
    let frame = 0;
    let listening = null;
    // Active watch() MutationObservers, disconnected by destroy().
    const watchers = new Set();
    // Observers are shared between elements with the same root/threshold/rootMargin,
    // instead of one (or two) IntersectionObservers per element.
    const pools = new Map();
    function pooled(root, key, create) {
        let pool = pools.get(root);
        if (!pool)
            pools.set(root, (pool = new Map()));
        let io = pool.get(key);
        if (!io)
            pool.set(key, (io = create()));
        return io;
    }
    function teardown(el, restore) {
        var _a;
        const record = registry.get(el);
        if (!record)
            return;
        record.observer.unobserve(el);
        (_a = record.progressObserver) === null || _a === void 0 ? void 0 : _a.unobserve(el);
        registry.delete(el);
        untrack(el);
        // An element that never animated would otherwise stay invisible forever.
        if (restore && !record.animated)
            reveal(el, config);
    }
    function pruneDetached() {
        registry.forEach((record, el) => {
            if (el.isConnected === false)
                teardown(el, false);
        });
    }
    function emitProgress(el, record, progress) {
        const opts = record.options;
        opts.onProgress(el, progress);
        if (opts.progressVar) {
            const style = el.style;
            if (style)
                style.setProperty(opts.progressVar, String(+progress.toFixed(4)));
        }
        if (hasParallax(opts.parallax) && !motionDisabled(config))
            applyParallax(el, progress, opts.parallax);
    }
    function update() {
        frame = 0;
        scrolling.forEach((el) => {
            const record = registry.get(el);
            if (record)
                emitProgress(el, record, getScrollProgress(el, config.root));
        });
    }
    // rAF-throttled; IntersectionObserver-capable browsers all have rAF.
    const schedule = () => frame || (frame = requestAnimationFrame(update));
    function listen(on) {
        if (on === !!listening)
            return;
        const method = on ? 'addEventListener' : 'removeEventListener';
        const target = listening || config.root || window;
        target[method]('scroll', schedule, PASSIVE);
        window[method]('resize', schedule, PASSIVE);
        listening = on ? target : null;
        if (!on && frame) {
            cancelAnimationFrame(frame);
            frame = 0;
        }
    }
    function untrack(el) {
        if (scrolling.delete(el) && !scrolling.size)
            listen(false);
    }
    function onScrollIntersect(entries) {
        entries.forEach((entry) => {
            const el = entry.target;
            const record = registry.get(el);
            if (!record)
                return;
            if (entry.isIntersecting) {
                scrolling.add(el);
                listen(true);
            }
            else {
                untrack(el);
            }
            // Emit right away so the edges (0 / 1) are reported even on fast scrolls.
            emitProgress(el, record, getScrollProgress(el, config.root));
        });
    }
    function onIntersect(entries) {
        const staggerCounts = new Map();
        entries.forEach((entry) => {
            var _a;
            const el = entry.target;
            const record = registry.get(el);
            if (!record)
                return;
            const opts = record.options;
            if (el.isConnected === false) {
                teardown(el, false);
                return;
            }
            if (entry.isIntersecting) {
                opts.onEnter(el);
                if (record.animated && !opts.repeat)
                    return;
                // Stagger relative to siblings revealed in the same batch, so elements
                // scrolled into view later don't inherit an ever-growing delay.
                let staggerIndex = 0;
                if (opts.stagger > 0) {
                    const parent = el.parentElement;
                    staggerIndex = (_a = staggerCounts.get(parent)) !== null && _a !== void 0 ? _a : 0;
                    staggerCounts.set(parent, staggerIndex + 1);
                }
                runAnimation(el, opts, config, staggerIndex);
                record.animated = true;
                if (opts.once && !opts.repeat) {
                    // Keep the progress observer: parallax/onProgress must keep working.
                    record.observer.unobserve(el);
                    if (config.autoUnregister && !record.progressObserver) {
                        // Nothing left to watch: free the record (the running animation
                        // keeps its own reference until it finishes).
                        finished.add(el);
                        teardown(el, false);
                    }
                }
            }
            else {
                opts.onLeave(el);
                if (opts.repeat && record.animated) {
                    if (!motionDisabled(config))
                        hideElement(el, config);
                    record.animated = false;
                }
            }
        });
    }
    function onProgress(entries) {
        entries.forEach((entry) => {
            const record = registry.get(entry.target);
            if (!record)
                return;
            emitProgress(entry.target, record, entry.intersectionRatio);
        });
    }
    function getObserver(opts) {
        const rootMargin = applyOffset(opts.rootMargin, opts.offset);
        const threshold = opts.threshold;
        const root = config.root;
        return pooled(root, `m|${rootMargin}|${String(threshold)}`, () => new IntersectionObserver(onIntersect, { threshold, rootMargin, root: root }));
    }
    function getProgressObserver(opts) {
        const root = config.root;
        if (opts.progressMode === 'scroll') {
            // Only used to know when to start/stop measuring; progress itself comes
            // from a single shared, rAF-throttled passive scroll listener.
            return pooled(root, `s|${opts.rootMargin}`, () => new IntersectionObserver(onScrollIntersect, { threshold: 0, rootMargin: opts.rootMargin, root: root }));
        }
        return pooled(root, `p|${opts.rootMargin}`, () => new IntersectionObserver(onProgress, {
            threshold: getProgressThresholds(),
            rootMargin: opts.rootMargin,
            root: root,
        }));
    }
    function attach(el, record, observeMain) {
        var _a;
        record.observer = getObserver(record.options);
        if (observeMain)
            record.observer.observe(el);
        record.progressObserver = needsProgress(record.options) ? getProgressObserver(record.options) : undefined;
        (_a = record.progressObserver) === null || _a === void 0 ? void 0 : _a.observe(el);
    }
    function observeElement(el, opts) {
        if (registry.has(el) || finished.has(el))
            return;
        if (!supportsObserver()) {
            // No IntersectionObserver (very old browser): never leave content hidden.
            reveal(el, config);
            return;
        }
        if (!motionDisabled(config))
            hideElement(el, config);
        const record = { element: el, options: opts, animated: false };
        registry.set(el, record);
        attach(el, record, true);
    }
    function observeDataElement(el) {
        if (!registry.has(el))
            observeElement(el, parseDataAttributes(el, config));
    }
    const instance = {
        observe(target, options = {}) {
            pruneDetached();
            const opts = mergeOptions(options, config);
            resolveTargets(target).forEach((el) => observeElement(el, opts));
        },
        unobserve(target) {
            resolveTargets(target).forEach((el) => {
                finished.delete(el);
                teardown(el, true);
            });
        },
        init(rootElement) {
            const scope = rootElement !== null && rootElement !== void 0 ? rootElement : (hasDOM() ? document : null);
            if (!scope)
                return;
            pruneDetached();
            scope.querySelectorAll('[data-sa]').forEach(observeDataElement);
        },
        watch(rootElement) {
            const scope = rootElement !== null && rootElement !== void 0 ? rootElement : (hasDOM() ? document : null);
            if (!scope || typeof MutationObserver === 'undefined')
                return noop;
            instance.init(scope);
            const observeTree = (node) => {
                if (node.hasAttribute('data-sa'))
                    observeDataElement(node);
                node.querySelectorAll('[data-sa]').forEach(observeDataElement);
            };
            const mo = new MutationObserver((records) => {
                let removed = false;
                records.forEach((record) => {
                    if (record.type === 'attributes') {
                        const target = record.target;
                        if (target.isConnected !== false)
                            observeTree(target);
                        return;
                    }
                    record.addedNodes.forEach((node) => {
                        if (node instanceof Element && node.isConnected !== false)
                            observeTree(node);
                    });
                    if (record.removedNodes.length)
                        removed = true;
                });
                // Free elements that left the DOM (they can't animate any more).
                if (removed)
                    pruneDetached();
            });
            mo.observe(scope, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-sa'] });
            watchers.add(mo);
            return () => {
                mo.disconnect();
                watchers.delete(mo);
            };
        },
        destroy() {
            watchers.forEach((mo) => mo.disconnect());
            watchers.clear();
            registry.forEach((record, el) => {
                if (!record.animated)
                    reveal(el, config);
            });
            pools.forEach((pool) => pool.forEach((io) => io.disconnect()));
            pools.clear();
            registry.clear();
            scrolling.clear();
            listen(false);
            finished = new WeakSet();
        },
        refresh() {
            // Rebuild observers (e.g. after configure({ root })) without re-hiding or
            // replaying elements that have already animated.
            pools.forEach((pool) => pool.forEach((io) => io.disconnect()));
            pools.clear();
            scrolling.clear();
            listen(false);
            pruneDetached();
            if (!supportsObserver())
                return;
            registry.forEach((record, el) => {
                const done = record.animated && record.options.once && !record.options.repeat;
                attach(el, record, !done);
            });
        },
        animate(target, options = {}) {
            const opts = mergeOptions(options, config);
            resolveTargets(target).forEach((el) => runAnimation(el, opts, config, 0));
        },
        getObservedElements() {
            return Array.from(registry.values());
        },
        configure(newConfig) {
            config = { ...config, ...newConfig };
        },
    };
    return instance;
}

/**
 * use-scroll-animate - Staggered children
 * Reveal a container's children one after another when the container scrolls
 * into view, optionally also animating children that are added later.
 */
let fallback$1 = null;
/**
 * Animate the children of `container` with a stagger once it enters the
 * viewport. Returns a cleanup function. SSR-safe (no-op without a DOM).
 *
 * @example
 * const stop = staggerChildren(document.querySelector('ul'), { stagger: 60, observeChildren: true });
 */
function staggerChildren(container, options = {}, instance) {
    if (!container || !hasDOM() || !supportsObserver())
        return () => undefined; // leave content visible
    const sa = instance || fallback$1 || (fallback$1 = createScrollAnimate());
    const { stagger = 80, delay = 0, threshold = 0.1, rootMargin = '0px', observeChildren = false, ...rest } = options;
    let items = Array.from(container.children);
    let revealed = false;
    const late = [];
    items.forEach((child) => prepareElement(child));
    const io = new IntersectionObserver((entries) => {
        if (revealed || !entries.some((entry) => entry.isIntersecting))
            return;
        revealed = true;
        io.disconnect();
        items.forEach((child, i) => {
            if (child.parentNode === container)
                sa.animate(child, { ...rest, delay: delay + i * stagger });
        });
        items = [];
    }, { threshold, rootMargin });
    io.observe(container);
    let mo;
    if (observeChildren && typeof MutationObserver !== 'undefined') {
        mo = new MutationObserver((records) => {
            records.forEach((record) => {
                record.addedNodes.forEach((node) => {
                    if (!(node instanceof Element) || node.parentNode !== container)
                        return;
                    if (!revealed) {
                        prepareElement(node);
                        items.push(node);
                    }
                    else {
                        // The core engine staggers siblings relative to the batch that
                        // enters the viewport together.
                        late.push(node);
                        sa.observe(node, { ...rest, delay, stagger, threshold, rootMargin });
                    }
                });
                record.removedNodes.forEach((node) => {
                    if (!(node instanceof Element))
                        return;
                    items = items.filter((el) => el !== node);
                    const i = late.indexOf(node);
                    if (i >= 0) {
                        late.splice(i, 1);
                        sa.unobserve(node);
                    }
                });
            });
        });
        mo.observe(container, { childList: true });
    }
    return () => {
        io.disconnect();
        mo === null || mo === void 0 ? void 0 : mo.disconnect();
        // Stopped before the container was revealed: never leave the children hidden.
        if (!revealed) {
            revealed = true;
            items.forEach((child) => stopAnimation(child));
            items = [];
        }
        late.forEach((el) => sa.unobserve(el));
        late.length = 0;
    };
}

/**
 * use-scroll-animate - Sequence / timeline helper
 * Chain animations on several targets, one after another (or overlapping).
 */
let fallback = null;
function plan(steps, defaults) {
    const out = [];
    let cursor = 0;
    steps.forEach((step) => {
        var _a, _b;
        const { target, gap = 0, at, ...stepOpts } = step;
        const opts = { ...defaults, ...stepOpts };
        const duration = (_a = opts.duration) !== null && _a !== void 0 ? _a : 600;
        const start = Math.max(0, at !== null && at !== void 0 ? at : cursor + gap) + ((_b = opts.delay) !== null && _b !== void 0 ? _b : 0);
        let end = Math.max(cursor, start);
        resolveTargets(target).forEach((el, i) => {
            var _a;
            const delay = start + i * ((_a = opts.stagger) !== null && _a !== void 0 ? _a : 0);
            out.push({ el, opts: { ...opts, duration, delay, stagger: 0 }, end: delay + duration });
            end = Math.max(end, delay + duration);
        });
        cursor = end;
    });
    return out;
}
/**
 * Build a timeline of animations.
 *
 * @example
 * sequence([
 *   { target: '.title', animation: 'fade-in-up' },
 *   { target: '.subtitle', animation: 'blur-in', gap: -300 },   // overlap by 300ms
 *   { target: '.card', animation: 'scale-up', stagger: 80 },
 * ], { trigger: '.hero' });
 */
function sequence(steps, options = {}) {
    var _a, _b;
    const { trigger, instance, ...defaults } = options;
    const sa = () => instance || fallback || (fallback = createScrollAnimate());
    let io;
    let active = [];
    let settle;
    // Targets hidden while waiting for `trigger`; revealed if cancelled before it fires.
    let prepared = [];
    const controller = {
        play() {
            controller.cancel();
            if (!hasDOM())
                return Promise.resolve();
            active = plan(steps, defaults);
            return new Promise((resolve) => {
                let left = active.length;
                settle = () => {
                    settle = undefined;
                    resolve();
                };
                if (!left)
                    return settle();
                const run = active;
                run.forEach(({ el, opts }) => {
                    const done = opts.onComplete;
                    sa().animate(el, {
                        ...opts,
                        onComplete: (node) => {
                            done === null || done === void 0 ? void 0 : done(node);
                            if (run === active && --left === 0)
                                settle === null || settle === void 0 ? void 0 : settle();
                        },
                    });
                });
            });
        },
        cancel() {
            io === null || io === void 0 ? void 0 : io.disconnect();
            io = undefined;
            prepared.forEach((el) => stopAnimation(el));
            prepared = [];
            active.forEach(({ el }) => stopAnimation(el));
            active = [];
            settle === null || settle === void 0 ? void 0 : settle();
        },
        duration() {
            return plan(steps, defaults).reduce((max, p) => Math.max(max, p.end), 0);
        },
    };
    if (trigger && hasDOM() && supportsObserver()) {
        const el = resolveTargets(trigger)[0];
        if (el) {
            prepared = plan(steps, defaults).map(({ el: target }) => target);
            prepared.forEach((target) => prepareElement(target));
            io = new IntersectionObserver((entries) => {
                if (!entries.some((e) => e.isIntersecting))
                    return;
                io === null || io === void 0 ? void 0 : io.disconnect();
                io = undefined;
                prepared = []; // play() takes over from here
                controller.play();
            }, { threshold: (_a = defaults.threshold) !== null && _a !== void 0 ? _a : 0.1, rootMargin: (_b = defaults.rootMargin) !== null && _b !== void 0 ? _b : '0px' });
            io.observe(el);
        }
    }
    return controller;
}

/**
 * use-scroll-animate - React Integration
 * Provides useScrollAnimate and useScrollStagger hooks for React applications.
 * `useScrollStagger({ observeChildren: true })` also animates children added later.
 *
 * Both hooks are thin wrappers around the core engine, so they share its
 * behaviour: `once`, `offset`, custom easing functions, parallax,
 * `prefers-reduced-motion` support, and proper cleanup on unmount.
 */
const CALLBACKS = ['onStart', 'onComplete', 'onEnter', 'onLeave', 'onProgress'];
/**
 * Wrap the callbacks that exist at mount so they always call the latest
 * version from the most recent render (avoids stale closures without
 * re-creating observers on every render).
 * @internal
 */
function withLatestCallbacks(latest) {
    const initial = latest.current || {};
    const opts = { ...initial };
    CALLBACKS.forEach((name) => {
        if (typeof initial[name] === 'function') {
            opts[name] = (...args) => { var _a, _b; return (_b = (_a = latest.current) === null || _a === void 0 ? void 0 : _a[name]) === null || _b === void 0 ? void 0 : _b.call(_a, ...args); };
        }
    });
    return opts;
}
function createReactHooks(React) {
    // Created lazily on the client so importing on the server is side-effect free.
    let instance = null;
    const getInstance = () => instance || (instance = createScrollAnimate());
    function useScrollAnimate(options = {}) {
        const ref = React.useRef(null);
        const optionsRef = React.useRef(options);
        optionsRef.current = options;
        React.useEffect(() => {
            const el = ref.current;
            if (!el)
                return;
            const sa = getInstance();
            sa.observe(el, withLatestCallbacks(optionsRef));
            return () => sa.unobserve(el);
        }, []);
        return ref;
    }
    function useScrollStagger(options = {}) {
        const ref = React.useRef(null);
        const optionsRef = React.useRef(options);
        optionsRef.current = options;
        React.useEffect(() => {
            const container = ref.current;
            if (!container)
                return;
            return staggerChildren(container, withLatestCallbacks(optionsRef), getInstance());
        }, []);
        return ref;
    }
    return { useScrollAnimate, useScrollStagger };
}

/**
 * use-scroll-animate - Vue 3 Integration
 * Provides useScrollAnimate and useScrollStagger composables for Vue 3 applications.
 *
 * A thin wrapper around the core engine, so it shares its behaviour: `once`,
 * `offset`, custom easing functions, parallax, `prefers-reduced-motion`
 * support, and cleanup on unmount.
 */
/** Support refs on components (`$el`) as well as plain elements. */
function unwrap(value) {
    if (value && typeof Element !== 'undefined' && !(value instanceof Element) && value.$el instanceof Element) {
        return value.$el;
    }
    return value || null;
}
function createVueComposables(Vue) {
    // Created lazily on the client so importing on the server is side-effect free.
    let instance = null;
    const getInstance = () => instance || (instance = createScrollAnimate());
    function useScrollAnimate(options = {}) {
        const animateRef = Vue.ref(null);
        let el = null;
        Vue.onMounted(() => {
            const target = unwrap(animateRef.value);
            if (!target)
                return;
            el = target;
            getInstance().observe(el, options);
        });
        Vue.onUnmounted(() => {
            if (el)
                getInstance().unobserve(el);
            el = null;
        });
        return { animateRef };
    }
    /** Stagger the children of `staggerRef`; `observeChildren: true` also animates children added later. */
    function useScrollStagger(options = {}) {
        const staggerRef = Vue.ref(null);
        let stop;
        Vue.onMounted(() => {
            const target = unwrap(staggerRef.value);
            if (target)
                stop = staggerChildren(target, options, getInstance());
        });
        Vue.onUnmounted(() => {
            stop === null || stop === void 0 ? void 0 : stop();
            stop = undefined;
        });
        return { staggerRef };
    }
    return { useScrollAnimate, useScrollStagger };
}

/**
 * use-scroll-animate
 *
 * A lightweight, dependency-free scroll animation library for modern web
 * applications. Built with TypeScript, powered by IntersectionObserver and
 * the Web Animations API. Safe to import during SSR.
 *
 * @license MIT
 * @see https://github.com/HarrisonCN/use-scroll-animate
 */
/**
 * Default singleton instance of ScrollAnimate.
 * Ready to use out of the box with sensible defaults.
 *
 * @example
 * ```js
 * import ScrollAnimate from 'use-scroll-animate';
 *
 * // Auto-initialize all elements with data-sa attribute
 * ScrollAnimate.init();
 *
 * // Or manually observe elements
 * ScrollAnimate.observe('.my-element', { animation: 'fade-in-up' });
 * ```
 */
const ScrollAnimate = createScrollAnimate();

exports.EASING_MAP = EASING_MAP;
exports.PRESETS = PRESETS;
exports.createReactHooks = createReactHooks;
exports.createScrollAnimate = createScrollAnimate;
exports.createVueComposables = createVueComposables;
exports.default = ScrollAnimate;
exports.getScrollProgress = getScrollProgress;
exports.resolveEasing = resolveEasing;
exports.resolvePreset = resolvePreset;
exports.sequence = sequence;
exports.staggerChildren = staggerChildren;
//# sourceMappingURL=index.js.map
