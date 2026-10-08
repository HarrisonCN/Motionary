'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('./chunks/core-qpECfEkb.cjs');
var stagger = require('./chunks/stagger-CLc3j58T.cjs');
var core$1 = require('./chunks/core-CLu8ZrC-.cjs');
require('./chunks/base-CXx7jZ-o.cjs');

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
exports.TIMELINE_PRESETS = core$1.TIMELINE_PRESETS;
exports.resolvePosition = core$1.resolvePosition;
exports.supportsNativeScrub = core$1.supportsNativeScrub;
exports.timeline = core$1.timeline;
exports.default = ScrollAnimate;
exports.parallax = parallax;
//# sourceMappingURL=index.cjs.map
