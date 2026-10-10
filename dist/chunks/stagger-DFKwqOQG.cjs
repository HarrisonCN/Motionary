'use strict';

var core = require('./core-BjcOCpJt.cjs');

/**
 * motionary - Staggered children
 * Reveal a container's children one after another when the container scrolls
 * into view, optionally also animating children that are added later.
 */
let fallback = null;
/**
 * Animate the children of `container` with a stagger once it enters the
 * viewport. Returns a cleanup function. SSR-safe (no-op without a DOM).
 *
 * @example
 * const stop = staggerChildren(document.querySelector('ul'), { stagger: 60, observeChildren: true });
 */
function staggerChildren(container, options = {}, instance) {
    if (!container || !core.hasDOM() || !core.supportsObserver())
        return () => undefined; // leave content visible
    const sa = instance || fallback || (fallback = core.createScrollAnimate());
    const { stagger = 80, delay = 0, threshold = 0.1, rootMargin = '0px', observeChildren = false, ...rest } = options;
    let items = Array.from(container.children);
    let revealed = false;
    const late = [];
    items.forEach((child) => core.prepareElement(child));
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
                        core.prepareElement(node);
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
        mo?.disconnect();
        // Stopped before the container was revealed: never leave the children hidden.
        if (!revealed) {
            revealed = true;
            items.forEach((child) => core.stopAnimation(child));
            items = [];
        }
        late.forEach((el) => sa.unobserve(el));
        late.length = 0;
    };
}

exports.staggerChildren = staggerChildren;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v13.1.0/dist/chunks/stagger-DFKwqOQG.cjs.map