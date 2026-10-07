'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('./chunks/core-qpECfEkb.cjs');
var stagger = require('./chunks/stagger-CLc3j58T.cjs');

/**
 * use-scroll-animate - Sequence / timeline helper
 * Chain animations on several targets, one after another (or overlapping).
 */
let fallback = null;
function plan(steps, defaults) {
    const out = [];
    let cursor = 0;
    steps.forEach((step) => {
        const { target, gap = 0, at, ...stepOpts } = step;
        const opts = { ...defaults, ...stepOpts };
        const duration = opts.duration ?? 600;
        const start = Math.max(0, at ?? cursor + gap) + (opts.delay ?? 0);
        let end = Math.max(cursor, start);
        core.resolveTargets(target).forEach((el, i) => {
            const delay = start + i * (opts.stagger ?? 0);
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
    const { trigger, instance, ...defaults } = options;
    const sa = () => instance || fallback || (fallback = core.createScrollAnimate());
    let io;
    let active = [];
    let settle;
    // Targets hidden while waiting for `trigger`; revealed if cancelled before it fires.
    let prepared = [];
    const controller = {
        play() {
            controller.cancel();
            if (!core.hasDOM())
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
                            done?.(node);
                            if (run === active && --left === 0)
                                settle?.();
                        },
                    });
                });
            });
        },
        cancel() {
            io?.disconnect();
            io = undefined;
            prepared.forEach((el) => core.stopAnimation(el));
            prepared = [];
            active.forEach(({ el }) => core.stopAnimation(el));
            active = [];
            settle?.();
        },
        duration() {
            return plan(steps, defaults).reduce((max, p) => Math.max(max, p.end), 0);
        },
    };
    if (trigger && core.hasDOM() && core.supportsObserver()) {
        const el = core.resolveTargets(trigger)[0];
        if (el) {
            prepared = plan(steps, defaults).map(({ el: target }) => target);
            prepared.forEach((target) => core.prepareElement(target));
            io = new IntersectionObserver((entries) => {
                if (!entries.some((e) => e.isIntersecting))
                    return;
                io?.disconnect();
                io = undefined;
                prepared = []; // play() takes over from here
                controller.play();
            }, { threshold: defaults.threshold ?? 0.1, rootMargin: defaults.rootMargin ?? '0px' });
            io.observe(el);
        }
    }
    return controller;
}

/**
 * use-scroll-animate - parallax() helper
 *
 * Moves elements at a different speed than the page while they cross the
 * viewport. Built on the same scroll progress as `progressVar` (0 when the
 * element's top enters at the bottom, 1 when its bottom leaves at the top):
 * the progress is written to a CSS custom property (default `--sa-parallax`)
 * and the offset is applied with the individual `translate` property, so it
 * composes with entrance animations and other `transform`s.
 */
const PASSIVE = { passive: true };
/**
 * Apply a scroll parallax to `target` (selector, Element, NodeList or array).
 * Returns a function that stops it and removes the inline styles it set.
 * SSR-safe (no-op without a DOM / IntersectionObserver).
 *
 * @example
 * const stop = parallax('.hero-bg', { speed: 0.3 });
 * parallax('.badge', { speed: -0.15, axis: 'x' });
 */
function parallax(target, options = {}) {
    const els = core.resolveTargets(target);
    if (!els.length || !core.hasDOM() || !core.supportsObserver())
        return () => undefined;
    const { speed = 0.2, axis = 'y', root = null, respectReducedMotion = true } = options;
    const name = options.progressVar ? (options.progressVar.startsWith('--') ? options.progressVar : `--${options.progressVar}`) : '--sa-parallax';
    const unit = axis === 'x' ? 'vw' : 'vh';
    const visible = new Set();
    let frame = 0;
    let listening = false;
    const scroller = root || window;
    const apply = (el) => {
        const style = el.style;
        if (!style)
            return;
        const p = core.getScrollProgress(el, root);
        style.setProperty(name, String(+p.toFixed(4)));
        if (respectReducedMotion && core.prefersReducedMotion()) {
            style.removeProperty('translate');
            return;
        }
        const offset = `${+((p - 0.5) * speed * 100).toFixed(3)}${unit}`;
        style.setProperty('translate', axis === 'x' ? `${offset} 0px` : `0px ${offset}`);
    };
    const update = () => {
        frame = 0;
        visible.forEach(apply);
    };
    const schedule = () => {
        if (!frame)
            frame = requestAnimationFrame(update);
    };
    const listen = (on) => {
        if (on === listening)
            return;
        listening = on;
        const method = on ? 'addEventListener' : 'removeEventListener';
        scroller[method]('scroll', schedule, PASSIVE);
        window[method]('resize', schedule, PASSIVE);
        if (!on && frame) {
            cancelAnimationFrame(frame);
            frame = 0;
        }
    };
    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting)
                visible.add(entry.target);
            else
                visible.delete(entry.target);
            apply(entry.target); // report the edges even on fast scrolls
        });
        listen(visible.size > 0);
    }, { threshold: 0, root });
    els.forEach((el) => {
        apply(el); // no jump before the first observer callback
        io.observe(el);
    });
    return () => {
        io.disconnect();
        listen(false);
        visible.clear();
        els.forEach((el) => {
            const style = el.style;
            if (!style)
                return;
            style.removeProperty('translate');
            style.removeProperty(name);
        });
    };
}

/**
 * use-scroll-animate
 *
 * A lightweight, dependency-free scroll animation library for modern web
 * applications. Built with TypeScript, powered by IntersectionObserver and
 * the Web Animations API (or the native scroll-driven timeline). Safe to
 * import during SSR. Framework integrations live in the subpath entries:
 * `use-scroll-animate/react`, `/vue`, `/svelte`, `/solid`, `/element`.
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
const ScrollAnimate = /* @__PURE__ */ core.createScrollAnimate();

exports.EASING_MAP = core.EASING_MAP;
exports.PRESETS = core.PRESETS;
exports.createScrollAnimate = core.createScrollAnimate;
exports.getScrollProgress = core.getScrollProgress;
exports.resolveEasing = core.resolveEasing;
exports.resolvePreset = core.resolvePreset;
exports.supportsScrollTimeline = core.supportsScrollTimeline;
exports.staggerChildren = stagger.staggerChildren;
exports.default = ScrollAnimate;
exports.parallax = parallax;
exports.sequence = sequence;
//# sourceMappingURL=index.cjs.map
