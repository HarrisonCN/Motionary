'use strict';

var solidJs = require('solid-js');
var core = require('./chunks/core-C1cEwjJj.cjs');
var stagger = require('./chunks/stagger-DtKKS6GP.cjs');

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
const getInstance = (own) => own || shared || (shared = core.createScrollAnimate());
function read(accessor) {
    const v = accessor?.();
    return (v && v !== true ? v : {});
}
function observe(el, options) {
    const { instance, ...opts } = options;
    const sa = getInstance(instance);
    // Wait until the element is in the document (directives/refs run before insertion).
    solidJs.onMount(() => sa.observe(el, opts));
    solidJs.onCleanup(() => sa.unobserve(el));
}
/** Directive: `<div use:scrollAnimate={{ animation: 'fade-in' }} />` */
function scrollAnimate(el, accessor) {
    observe(el, read(accessor));
}
/** Directive: `<ul use:scrollStagger={{ stagger: 60, observeChildren: true }} />` */
function scrollStagger(el, accessor) {
    const { instance, ...opts } = read(accessor);
    let stop;
    solidJs.onMount(() => {
        stop = stagger.staggerChildren(el, opts, getInstance(instance));
    });
    solidJs.onCleanup(() => stop?.());
}
/** Primitive returning a `ref` callback: `<div ref={useScrollAnimate({ animation: 'fade-in-up' })} />` */
function useScrollAnimate(options = {}) {
    let el;
    const { instance, ...opts } = options;
    const sa = getInstance(instance);
    solidJs.onMount(() => el && sa.observe(el, opts));
    solidJs.onCleanup(() => el && sa.unobserve(el));
    return (node) => {
        el = node;
    };
}

exports.scrollAnimate = scrollAnimate;
exports.scrollStagger = scrollStagger;
exports.useScrollAnimate = useScrollAnimate;
//# sourceMappingURL=solid.cjs.map
