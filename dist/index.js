import { b as resolveTargets, h as hasDOM, s as supportsObserver, g as getScrollProgress, d as prefersReducedMotion, c as createScrollAnimate } from './chunks/core-D7cVumUu.js';
export { e as supportsScrollTimeline } from './chunks/core-D7cVumUu.js';
export { s as staggerChildren } from './chunks/stagger-DtMKo2SK.js';
export { T as TIMELINE_PRESETS, r as resolvePosition, s as supportsNativeScrub, t as timeline } from './chunks/core-DyJu5r5a.js';
export { E as EASING_MAP, P as PRESETS, c as registerPresets, a as resolveEasing, r as resolvePreset, b as reversePreset } from './chunks/presets-BYBVJVeP.js';
import './chunks/base-D5MHqeDd.js';
import './components/tokens.js';

/**
 * motionary - parallax() helper
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
    const els = resolveTargets(target);
    if (!els.length || !hasDOM() || !supportsObserver())
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
        const p = getScrollProgress(el, root);
        style.setProperty(name, String(+p.toFixed(4)));
        if (respectReducedMotion && prefersReducedMotion()) {
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
 * motionary
 *
 * A lightweight, dependency-free scroll animation library for modern web
 * applications. Built with TypeScript, powered by IntersectionObserver and
 * the Web Animations API (or the native scroll-driven timeline). Safe to
 * import during SSR. Framework integrations live in the subpath entries:
 * `motionary/react`, `/vue`, `/svelte`, `/solid`, `/element`.
 *
 * @license MIT
 * @see https://github.com/HarrisonCN/Motionary
 */
/**
 * Default singleton instance of ScrollAnimate.
 * Ready to use out of the box with sensible defaults.
 *
 * @example
 * ```js
 * import ScrollAnimate from 'motionary';
 *
 * // Auto-initialize all elements with data-sa attribute
 * ScrollAnimate.init();
 *
 * // Or manually observe elements
 * ScrollAnimate.observe('.my-element', { animation: 'fade-in-up' });
 * ```
 */
const ScrollAnimate = /* @__PURE__ */ createScrollAnimate();

export { createScrollAnimate, ScrollAnimate as default, getScrollProgress, parallax };
//# sourceMappingURL=index.js.map
