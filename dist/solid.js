import { createRenderEffect, onMount, onCleanup } from 'solid-js';
import { c as createScrollAnimate } from './chunks/core-Dj6iomdc.js';
import { s as staggerChildren } from './chunks/stagger-B9sKPwQB.js';
import './chunks/presets-BYBVJVeP.js';

/**
 * motionary - Solid integration
 *
 * ```tsx
 * import { scrollAnimate, scrollStagger, useScrollAnimate } from 'motionary/solid';
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
const CALLBACKS = ['onStart', 'onComplete', 'onEnter', 'onLeave', 'onProgress'];
/** Callbacks always call the latest options' version. */
function liveCallbacks(opts, latest) {
    const out = { ...opts };
    CALLBACKS.forEach((name) => {
        if (typeof opts[name] === 'function')
            out[name] = (...args) => latest()[name]?.(...args);
    });
    return out;
}
/**
 * Directive: `<div use:scrollAnimate={{ animation: 'fade-in' }} />`.
 * 4.0.1: the accessor is tracked — when signals it reads change, callbacks
 * update right away and the other options are re-applied if the element has
 * not animated yet (no manual `refresh()` needed).
 */
function scrollAnimate(el, accessor) {
    let latest = {};
    let mounted = false;
    let sa = null;
    const apply = () => {
        const { instance, ...opts } = latest;
        const record = sa?.getObservedElements().find((r) => r.element === el);
        if (sa && record?.animated)
            return; // finished: callbacks stay live
        sa?.unobserve(el);
        sa = getInstance(instance);
        sa.observe(el, liveCallbacks(opts, () => latest));
    };
    createRenderEffect(() => {
        latest = read(accessor);
        if (mounted)
            apply();
    });
    // Wait until the element is in the document (directives/refs run before insertion).
    onMount(() => {
        mounted = true;
        apply();
    });
    onCleanup(() => sa?.unobserve(el));
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
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.4.0/dist/solid.js.map