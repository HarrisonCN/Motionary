import { onMount, onCleanup } from 'solid-js';
import { c as createScrollAnimate } from './chunks/core-FUEi4ncH.js';
import { s as staggerChildren } from './chunks/stagger-DabrnrcE.js';

/**
 * use-scroll-animate - Solid integration
 *
 * ```tsx
 * import { scrollAnimate, scrollStagger, useScrollAnimate } from 'use-scroll-animate/solid';
 * false && scrollAnimate; // keep the directive import (TypeScript)
 *
 * <div use:scrollAnimate={{ animation: 'zoom-in' }}>…</div>
 * <ul use:scrollStagger={{ stagger: 60 }}>…</ul>
 * <div ref={useScrollAnimate({ animation: 'fade-in-up' })}>…</div>
 * ```
 *
 * `solid-js` is an optional peer dependency (only needed for this entry).
 */
let shared = null;
const getInstance = (own) => own || shared || (shared = createScrollAnimate());
function read(accessor) {
    const v = accessor?.();
    return (v && v !== true ? v : {});
}
function observe(el, options) {
    const { instance, ...opts } = options;
    const sa = getInstance(instance);
    // Wait until the element is in the document (directives/refs run before insertion).
    onMount(() => sa.observe(el, opts));
    onCleanup(() => sa.unobserve(el));
}
/** Directive: `<div use:scrollAnimate={{ animation: 'fade-in' }} />` */
function scrollAnimate(el, accessor) {
    observe(el, read(accessor));
}
/** Directive: `<ul use:scrollStagger={{ stagger: 60, observeChildren: true }} />` */
function scrollStagger(el, accessor) {
    const { instance, ...opts } = read(accessor);
    let stop;
    onMount(() => {
        stop = staggerChildren(el, opts, getInstance(instance));
    });
    onCleanup(() => stop?.());
}
/** Primitive returning a `ref` callback: `<div ref={useScrollAnimate({ animation: 'fade-in-up' })} />` */
function useScrollAnimate(options = {}) {
    let el;
    const { instance, ...opts } = options;
    const sa = getInstance(instance);
    onMount(() => el && sa.observe(el, opts));
    onCleanup(() => el && sa.unobserve(el));
    return (node) => {
        el = node;
    };
}

export { scrollAnimate, scrollStagger, useScrollAnimate };
//# sourceMappingURL=solid.js.map
