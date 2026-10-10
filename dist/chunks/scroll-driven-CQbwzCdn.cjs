'use strict';

/**
 * 10.4 (scroll-driven 3.0): shared helpers for components that prefer the
 * browser's native scroll-driven animations (`animation-timeline: scroll()` /
 * `view()`) and fall back to a small JS scroll loop where they are missing.
 */
let uid = 0;
/** A unique CSS dashed ident ('--usa-sd-3'). */
const timelineName = (p = 'usa-sd') => `--${p}-${++uid}`;
/** Native scroll / view timelines are available (`engine="auto"`). */
function nativeScrollTimelines(kind = 'scroll') {
    return typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('animation-timeline', kind === 'view' ? 'view()' : 'scroll()');
}
/** The engine to use for `engine="auto | native | js"`. */
function pickEngine(attr, kind = 'scroll') {
    if (attr === 'js')
        return 'js';
    if (attr === 'native')
        return nativeScrollTimelines(kind) ? 'native' : 'js';
    return nativeScrollTimelines(kind) ? 'native' : 'js';
}
/** Lowest common ancestor of two elements (for `timeline-scope`). */
function commonAncestor(a, b) {
    for (let n = a; n; n = n.parentElement)
        if (n.contains(b))
            return n;
    return document.documentElement;
}
/** Scroll progress (0–1) of a scroller (window when `el` is the document scroller). */
function scrollProgress(el, horizontal = false) {
    const isDoc = el === document.scrollingElement || el === document.documentElement || el === document.body;
    const s = isDoc ? (document.scrollingElement || document.documentElement) : el;
    const max = horizontal ? s.scrollWidth - s.clientWidth : s.scrollHeight - s.clientHeight;
    const pos = horizontal ? s.scrollLeft : s.scrollTop;
    return max > 0 ? Math.min(1, Math.max(0, pos / max)) : 0;
}
/** View progress (0–1) of an element crossing the viewport (0 = top edge enters at the bottom, 1 = bottom edge leaves at the top). */
function viewProgress(el) {
    const r = el.getBoundingClientRect();
    const vh = (typeof innerHeight === 'number' && innerHeight) || document.documentElement.clientHeight || 1;
    return Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height || 1)));
}

exports.commonAncestor = commonAncestor;
exports.pickEngine = pickEngine;
exports.scrollProgress = scrollProgress;
exports.timelineName = timelineName;
exports.viewProgress = viewProgress;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.2.0/dist/chunks/scroll-driven-CQbwzCdn.cjs.map