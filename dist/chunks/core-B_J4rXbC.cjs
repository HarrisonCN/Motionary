'use strict';

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
    if (typeof animation === 'string') {
        return PRESETS[animation.trim()] ?? PRESETS['fade-in-up'];
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
    if (typeof easing === 'string') {
        return EASING_MAP[easing] ?? easing;
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
    defaultEngine: 'auto',
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
let scrollTimelineSupported;
/**
 * Whether the browser can run presets on a native scroll-driven timeline:
 * `CSS.supports('animation-timeline: view()')` plus the `ViewTimeline`
 * constructor used to attach it from JavaScript. Cached. SSR-safe.
 */
function supportsScrollTimeline() {
    if (scrollTimelineSupported === undefined) {
        scrollTimelineSupported =
            hasDOM() &&
                typeof CSS !== 'undefined' &&
                typeof CSS.supports === 'function' &&
                CSS.supports('animation-timeline: view()') &&
                typeof globalThis.ViewTimeline === 'function';
    }
    return scrollTimelineSupported;
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
const DEFAULT_VIEW_RANGE = ['entry 0%', 'entry 100%'];
/** `''` (bare attribute) -> default name; `sa-progress` -> `--sa-progress`. */
function normalizeVar(name) {
    const v = name.trim();
    if (!v)
        return DEFAULT_PROGRESS_VAR;
    return v.startsWith('--') ? v : `--${v}`;
}
/**
 * @internal Read options from string attributes. `get(name)` returns the raw
 * value of the attribute `name` (kebab-case, e.g. `root-margin`), `''` for a
 * bare attribute and `undefined` when absent. Shared by `data-sa-*` and the
 * `<scroll-animate>` element.
 */
function readOptions(get) {
    const opts = {};
    const anim = get('animation');
    if (anim) {
        opts.animation = (anim.includes(',') ? anim.split(',').map((s) => s.trim()) : anim.trim());
    }
    opts.duration = num(get('duration'));
    opts.delay = num(get('delay'));
    const easing = get('easing');
    if (easing) {
        const e = easing.trim();
        if (e.startsWith('[')) {
            try {
                opts.easing = JSON.parse(e);
            }
            catch {
                // Malformed JSON: fall back to the default easing instead of throwing
            }
        }
        else {
            opts.easing = e;
        }
    }
    const t = get('threshold');
    if (t) {
        opts.threshold = t.includes(',') ? t.split(',').map(parseFloat).filter(Number.isFinite) : num(t);
    }
    const rootMargin = get('root-margin');
    if (rootMargin)
        opts.rootMargin = rootMargin;
    const repeat = get('repeat');
    if (repeat !== undefined)
        opts.repeat = repeat !== 'false';
    const once = get('once');
    if (once !== undefined)
        opts.once = once !== 'false';
    opts.offset = num(get('offset'));
    opts.stagger = num(get('stagger'));
    const progressVar = get('progress-var');
    if (progressVar !== undefined)
        opts.progressVar = normalizeVar(progressVar);
    const engine = get('engine')?.trim();
    if (engine === 'auto' || engine === 'js' || engine === 'css')
        opts.engine = engine;
    const range = get('view-range');
    if (range) {
        const [start, end] = range.split(',').map((s) => s.trim());
        if (start && end)
            opts.viewRange = [start, end];
    }
    const exit = get('exit');
    if (exit !== undefined) {
        const e = exit.trim();
        opts.exit = e === '' || e === 'true' ? true : e === 'false' ? false : (e.includes(',') ? e.split(',').map((s) => s.trim()) : e);
    }
    const progress = get('progress');
    if (progress)
        opts.progressMode = progress.trim() === 'scroll' ? 'scroll' : 'ratio';
    const px = get('parallax-x');
    const py = get('parallax-y');
    const pr = get('parallax-rotate');
    const ps = get('parallax-scale');
    if (px || py || pr || ps) {
        opts.parallax = {
            x: lengthValue(px),
            y: lengthValue(py),
            rotate: num(pr),
            scale: num(ps),
            speed: num(get('parallax-speed')) ?? 1,
        };
    }
    // Drop keys that were not set, so they don't override defaults when spread.
    Object.keys(opts).forEach((k) => opts[k] === undefined && delete opts[k]);
    return opts;
}
function parseDataAttributes(el, config) {
    return mergeOptions(readOptions((name) => {
        const v = el.getAttribute(`data-sa-${name}`);
        return v === null ? undefined : v;
    }), config);
}
function mergeOptions(opts, config) {
    let engine = opts.engine ?? config.defaultEngine;
    // 'auto' keeps time-based semantics when the element asks for them explicitly.
    if (engine === 'auto' && (opts.duration !== undefined || opts.delay !== undefined || opts.offset !== undefined || (opts.stagger ?? 0) > 0)) {
        engine = 'js';
    }
    const exit = opts.exit ?? false;
    const repeat = opts.repeat ?? (exit ? true : config.defaultRepeat);
    const threshold = opts.threshold ?? config.defaultThreshold;
    return {
        animation: opts.animation ?? config.defaultAnimation,
        duration: opts.duration ?? config.defaultDuration,
        delay: opts.delay ?? config.defaultDelay,
        easing: opts.easing ?? config.defaultEasing,
        threshold: Array.isArray(threshold) && threshold.length === 0 ? config.defaultThreshold : threshold,
        rootMargin: opts.rootMargin ?? config.defaultRootMargin,
        repeat,
        once: opts.once ?? (repeat ? false : config.defaultOnce),
        offset: opts.offset ?? config.defaultOffset,
        stagger: opts.stagger ?? 0,
        parallax: opts.parallax ?? {},
        onStart: opts.onStart ?? noop,
        onComplete: opts.onComplete ?? noop,
        onEnter: opts.onEnter ?? noop,
        onLeave: opts.onLeave ?? noop,
        onProgress: opts.onProgress ?? noop,
        progressMode: opts.progressMode ?? 'ratio',
        progressVar: opts.progressVar ? normalizeVar(opts.progressVar) : '',
        engine,
        viewRange: opts.viewRange ?? DEFAULT_VIEW_RANGE,
        exit,
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
    if (!offset)
        return rootMargin;
    const parts = (rootMargin || '0px').trim().split(/\s+/);
    const top = parts[0];
    const right = parts[1] ?? top;
    const bottom = parts[2] ?? top;
    const left = parts[3] ?? right;
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
/** Native engine: the scroll-linked exit animation, next to the entrance in `running`. */
const exits = new WeakMap();
const timers = new WeakMap();
function cancelRunning(el) {
    const exitAnim = exits.get(el);
    if (exitAnim) {
        exits.delete(el);
        exitAnim.cancel();
    }
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
function runAnimation(el, opts, config, staggerIndex = 0, pending) {
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
        pending?.add(el);
        timers.set(el, setTimeout(() => {
            timers.delete(el);
            pending?.delete(el);
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
    catch {
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
            catch {
                setStyles(el, preset.to);
            }
            anim.cancel();
        }
        onComplete(el);
    };
}
/**
 * Native engine: attach the preset to a `ViewTimeline` of the element, so the
 * browser drives it from scroll position. Returns `null` when that fails
 * (caller falls back to the JS engine).
 */
function startNative(el, opts, onFrozen) {
    if (typeof el.animate !== 'function')
        return null;
    const preset = resolvePreset(opts.animation);
    const built = buildAnimation(preset, opts.easing);
    let anim;
    try {
        const timeline = new globalThis.ViewTimeline({ subject: el, axis: 'block' });
        const timing = {
            fill: 'both',
            easing: built.easing,
            timeline,
            rangeStart: opts.viewRange[0],
            rangeEnd: opts.viewRange[1],
        };
        try {
            anim = el.animate(built.keyframes, timing);
        }
        catch {
            anim = el.animate(built.keyframes, { ...timing, easing: 'linear' });
        }
    }
    catch {
        return null;
    }
    running.set(el, anim);
    if (opts.exit) {
        // Reverse keyframes over the `exit` range; `fill: 'forwards'` so it has
        // no effect before the element starts leaving.
        const leave = resolvePreset(opts.exit === true ? opts.animation : opts.exit);
        const out = buildAnimation({ from: leave.to, to: leave.from }, opts.easing);
        try {
            const timeline = new globalThis.ViewTimeline({ subject: el, axis: 'block' });
            const timing = { fill: 'forwards', easing: out.easing, timeline, rangeStart: 'exit 0%', rangeEnd: 'exit 100%' };
            exits.set(el, el.animate(out.keyframes, timing));
        }
        catch {
            // Exit is cosmetic: ignore if unsupported.
        }
    }
    const keep = opts.repeat || !opts.once;
    anim.onfinish = () => {
        // `once`: freeze the end state, so scrolling back up does not reverse it.
        if (!keep && running.get(el) === anim) {
            running.delete(el);
            try {
                anim.commitStyles();
            }
            catch {
                setStyles(el, preset.to);
            }
            anim.cancel();
            onFrozen?.();
        }
        opts.onComplete(el);
    };
    return anim;
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
/** Play the exit animation (entrance or `exit` preset, reversed), ending hidden. */
function runExit(el, opts, config) {
    if (config.useClassNames || typeof el.animate !== 'function') {
        hideElement(el, config);
        return;
    }
    cancelRunning(el);
    const preset = resolvePreset(opts.exit === true ? opts.animation : opts.exit);
    const built = buildAnimation({ from: preset.to, to: preset.from }, opts.easing);
    const timing = { duration: opts.duration, easing: built.easing, fill: 'forwards' };
    let anim;
    try {
        anim = el.animate(built.keyframes, timing);
    }
    catch {
        anim = el.animate(built.keyframes, { ...timing, easing: 'ease' });
    }
    // Kept (filling) until the next entrance cancels it.
    running.set(el, anim);
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
    // Elements with a pending class-name completion timer started by this instance.
    const pending = new Set();
    // Elements whose entrance runs on a native scroll-driven timeline.
    const natives = new Set();
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
        const record = registry.get(el);
        if (!record)
            return;
        record.observer.unobserve(el);
        record.progressObserver?.unobserve(el);
        registry.delete(el);
        untrack(el);
        if (record.engine === 'css') {
            // A scroll-linked animation would keep following the scroll: stop it and
            // show the element (unless it finished and is just being released).
            if (restore) {
                natives.delete(el);
                reveal(el, config);
            }
            else if (el.isConnected === false) {
                // Left the DOM: drop it too, or the instance keeps it alive (and
                // destroy() touches it) for its whole lifetime.
                natives.delete(el);
            }
            return;
        }
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
            const el = entry.target;
            const record = registry.get(el);
            if (!record)
                return;
            const opts = record.options;
            if (el.isConnected === false) {
                teardown(el, false);
                return;
            }
            if (record.engine === 'css') {
                // The browser drives the animation; only lifecycle bookkeeping here.
                if (entry.isIntersecting) {
                    opts.onEnter(el);
                    if (!record.animated) {
                        record.animated = true;
                        opts.onStart(el);
                    }
                    if (opts.once && !opts.repeat) {
                        record.observer.unobserve(el);
                        if (config.autoUnregister && !record.progressObserver) {
                            finished.add(el);
                            teardown(el, false);
                        }
                    }
                }
                else {
                    opts.onLeave(el);
                    if (opts.repeat)
                        record.animated = false;
                }
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
                    staggerIndex = staggerCounts.get(parent) ?? 0;
                    staggerCounts.set(parent, staggerIndex + 1);
                }
                runAnimation(el, opts, config, staggerIndex, pending);
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
                    if (!motionDisabled(config)) {
                        if (opts.exit)
                            runExit(el, opts, config);
                        else
                            hideElement(el, config);
                    }
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
        record.observer = getObserver(record.options);
        if (observeMain)
            record.observer.observe(el);
        record.progressObserver = needsProgress(record.options) ? getProgressObserver(record.options) : undefined;
        record.progressObserver?.observe(el);
    }
    function wantsNative(opts) {
        return opts.engine !== 'js' && !config.useClassNames && !motionDisabled(config) && supportsScrollTimeline();
    }
    function observeElement(el, opts) {
        if (registry.has(el) || finished.has(el))
            return;
        if (!supportsObserver()) {
            // No IntersectionObserver (very old browser): never leave content hidden.
            reveal(el, config);
            return;
        }
        const record = { element: el, options: opts, animated: false, engine: 'js' };
        if (wantsNative(opts)) {
            cancelRunning(el);
            if (startNative(el, opts, () => natives.delete(el))) {
                record.engine = 'css';
                natives.add(el);
            }
        }
        if (record.engine === 'js' && !motionDisabled(config))
            hideElement(el, config);
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
            const scope = rootElement ?? (hasDOM() ? document : null);
            if (!scope)
                return;
            pruneDetached();
            scope.querySelectorAll('[data-sa]').forEach(observeDataElement);
        },
        watch(rootElement) {
            const scope = rootElement ?? (hasDOM() ? document : null);
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
            // Class-name mode: drop completion timers so onComplete never fires after destroy().
            pending.forEach((el) => {
                const timer = timers.get(el);
                if (timer !== undefined) {
                    clearTimeout(timer);
                    timers.delete(el);
                }
            });
            pending.clear();
            registry.forEach((record, el) => {
                if (!record.animated && record.engine !== 'css')
                    reveal(el, config);
            });
            // Native scroll-linked animations still running: stop them, show content.
            natives.forEach((el) => {
                if (running.has(el))
                    reveal(el, config);
            });
            natives.clear();
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
            resolveTargets(target).forEach((el) => runAnimation(el, opts, config, 0, pending));
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

exports.EASING_MAP = EASING_MAP;
exports.PRESETS = PRESETS;
exports.createScrollAnimate = createScrollAnimate;
exports.getScrollProgress = getScrollProgress;
exports.hasDOM = hasDOM;
exports.prefersReducedMotion = prefersReducedMotion;
exports.prepareElement = prepareElement;
exports.readOptions = readOptions;
exports.resolveEasing = resolveEasing;
exports.resolvePreset = resolvePreset;
exports.resolveTargets = resolveTargets;
exports.stopAnimation = stopAnimation;
exports.supportsObserver = supportsObserver;
exports.supportsScrollTimeline = supportsScrollTimeline;
//# sourceMappingURL=core-B_J4rXbC.cjs.map
