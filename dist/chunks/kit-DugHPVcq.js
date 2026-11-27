import { p as prefersReducedMotion, e as animateWithMotion, n as now, r as raf, b as caf } from './base-SPDwWyB1.js';

/**
 * 17.10 "Kit": small helpers shared by the navigation, data, media and motion-surface widgets
 * (sidebar, scrollspy, pricing, data-table, filter-chips, lightbox, image-trail, path-motion, …).
 * Original implementations; see docs/kit-17-10.md.
 */
/** Element rectangles keyed by element, for a FLIP step. */
function measure(els) {
    const m = new Map();
    for (const el of els)
        m.set(el, el.getBoundingClientRect());
    return m;
}
/**
 * FLIP: after the DOM has changed, animate each element from where it was (`before`) to where it is now.
 * Elements that were not measured before fade and scale in. Returns the started animations.
 */
function flip(before, els, duration = 420) {
    if (prefersReducedMotion())
        return [];
    const out = [];
    for (const el of els) {
        if (el.hidden)
            continue;
        const was = before.get(el);
        const is = el.getBoundingClientRect();
        if (!is.width && !is.height)
            continue;
        const frames = was
            ? [{ transform: `translate(${was.left - is.left}px, ${was.top - is.top}px)` }, { transform: 'none' }]
            : [{ opacity: 0, transform: 'scale(.92)' }, { opacity: 1, transform: 'none' }];
        if (was && Math.abs(was.left - is.left) < 0.5 && Math.abs(was.top - is.top) < 0.5)
            continue;
        const a = animateWithMotion(el, frames, { duration, easing: 'cubic-bezier(.22,1,.36,1)' });
        if (a)
            out.push(a);
    }
    return out;
}
/** Ease-out cubic. */
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
/**
 * Tween a number from `from` to `to` over `ms`, calling `update` each frame (reduced motion: one call with `to`).
 * Returns a cancel function.
 */
function tween(from, to, ms, update, el) {
    if (prefersReducedMotion() || ms <= 0 || from === to) {
        update(to, true);
        return () => { };
    }
    const start = now();
    let id = 0;
    const step = () => {
        const t = Math.min(1, (now() - start) / ms);
        update(from + (to - from) * easeOut(t), t >= 1);
        if (t < 1)
            id = raf(step, el);
    };
    id = raf(step, el);
    return () => caf(id);
}
/** A number formatted with grouping and at most `digits` decimals (locale-aware where available). */
function formatNumber(n, digits = 0, locale) {
    try {
        return new Intl.NumberFormat(locale, { maximumFractionDigits: digits, minimumFractionDigits: 0 }).format(n);
    }
    catch {
        return String(Math.round(n * 10 ** digits) / 10 ** digits);
    }
}
/** The element's direct element children, minus the ones a widget created (class starts with `usa-`). */
function ownChildren(host) {
    return Array.from(host.children).filter((c) => !c.className?.toString().startsWith('usa-'));
}
/** A finite number from a data attribute, or the fallback. */
function dataNum(el, name, fallback) {
    const v = el.getAttribute(`data-${name}`);
    const n = v?.trim() ? Number(v) : NaN;
    return Number.isFinite(n) ? n : fallback;
}
/** Parse a comma-separated list, trimmed, empty items dropped, at most `max` items. */
function list(text, max = 50) {
    return text.split(',').map((s) => s.trim()).filter(Boolean).slice(0, max);
}
/** An image address that is safe to load: http(s), data:image, or a relative / root-relative path; otherwise ''. */
function safeImageUrl(u) {
    const s = String(u ?? '').trim();
    return /^(https?:|data:image\/|\/|\.{1,2}\/|[^:]*$)/i.test(s) ? s : '';
}
/** A CSS color the browser accepts, or ''. Without `CSS.supports` only plain words, hex, rgb/hsl/oklch() pass. */
function cleanColor(value) {
    const v = String(value ?? '').trim();
    if (!v || v.length > 64 || /[;{}<>]|url\(/i.test(v))
        return '';
    if (typeof CSS !== 'undefined' && CSS.supports)
        return CSS.supports('color', v) ? v : '';
    return /^(#[0-9a-f]{3,8}|[a-z]+|(rgb|rgba|hsl|hsla|oklch|oklab|lab|lch)\([^()]*\))$/i.test(v) ? v : '';
}

export { formatNumber as a, cleanColor as c, dataNum as d, easeOut as e, flip as f, list as l, measure as m, ownChildren as o, safeImageUrl as s, tween as t };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/chunks/kit-DugHPVcq.js.map