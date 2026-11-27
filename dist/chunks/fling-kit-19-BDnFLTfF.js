import { p as projectInertia } from './spring-Bu3AwUgu.js';

/**
 * 17.19 helpers shared by the fling parts (spring-pip, spring-island, spring-peek, spring-scrollbar, slide-confirm,
 * spring-chain, fling-marquee). Pure functions with no DOM access, so they are easy to test. The motion itself comes
 * from the 17.16 spring core (`createSpringGroup`) and the shared frame scheduler. Original implementations; see
 * docs/fling-parts-17-19.md.
 */
const fin = (n, d) => (typeof n === 'number' && Number.isFinite(n) ? n : d);
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
const r1 = (n) => Math.round(n * 10) / 10;
const PIP_CORNERS = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
/** A corner name from text such as "top left", "tl" or "bottom-right" (default bottom-right). */
function parseCorner(text) {
    const s = String(text ?? '').trim().toLowerCase().replace(/[\s_]+/g, '-');
    const short = { tl: 'top-left', tr: 'top-right', bl: 'bottom-left', br: 'bottom-right' };
    if (short[s])
        return short[s];
    if (PIP_CORNERS.includes(s))
        return s;
    const top = /top/.test(s), left = /left|start/.test(s);
    if (/top|bottom/.test(s) || /left|right|start|end/.test(s))
        return `${top ? 'top' : 'bottom'}-${left ? 'left' : 'right'}`;
    return 'bottom-right';
}
/** Top-left position (px) of a `w` × `h` window docked to `corner` of a `fw` × `fh` frame, `inset` px from its edges. */
function cornerPoint(corner, w, h, fw, fh, inset = 12) {
    const i = Math.max(0, fin(inset, 12));
    const maxX = Math.max(i, fin(fw, 0) - fin(w, 0) - i);
    const maxY = Math.max(i, fin(fh, 0) - fin(h, 0) - i);
    return { x: corner.endsWith('left') ? i : maxX, y: corner.startsWith('top') ? i : maxY };
}
/**
 * The corner a released window flies to: the one nearest to where its momentum would carry its centre. `x`, `y` are
 * its top-left position, `vx`, `vy` its speed in px/s.
 */
function pipCorner(x, y, vx, vy, w, h, fw, fh) {
    const cx = projectInertia(fin(x, 0) + fin(w, 0) / 2, fin(vx, 0), 0.22);
    const cy = projectInertia(fin(y, 0) + fin(h, 0) / 2, fin(vy, 0), 0.22);
    return `${cy < fin(fh, 0) / 2 ? 'top' : 'bottom'}-${cx < fin(fw, 0) / 2 ? 'left' : 'right'}`;
}
/** The corner an arrow key moves to from `corner` (the same corner when the key points off the frame). */
function cornerStep(corner, key) {
    let [v, h] = corner.split('-');
    if (key === 'ArrowUp')
        v = 'top';
    else if (key === 'ArrowDown')
        v = 'bottom';
    else if (key === 'ArrowLeft')
        h = 'left';
    else if (key === 'ArrowRight')
        h = 'right';
    return `${v}-${h}`;
}
/**
 * The shape of an island morphing between its compact and expanded size: `t` = 0 is compact, 1 expanded (a spring
 * may carry it a little past either end). The corner radius stays a pill while the box is short and eases to
 * `radius` as it grows.
 */
function islandShape(t, compact, expanded, radius = 28) {
    const k = fin(t, 0);
    const mix = (a, b) => a + (b - a) * k;
    const width = Math.max(0, mix(fin(compact.w, 0), fin(expanded.w, 0)));
    const height = Math.max(0, mix(fin(compact.h, 0), fin(expanded.h, 0)));
    return { width: r1(width), height: r1(height), radius: r1(Math.min(height / 2, Math.max(fin(radius, 28), fin(compact.h, 0) / 2))) };
}
/** Length and offset (px) of a scrollbar thumb on a `track` px track; at least `min` px long. */
function thumbMetrics(scrollTop, scrollHeight, clientHeight, track, min = 28) {
    const sh = Math.max(0, fin(scrollHeight, 0));
    const ch = Math.max(0, fin(clientHeight, 0));
    const tr = Math.max(0, fin(track, 0));
    if (!(sh > ch) || !tr)
        return { size: tr, offset: 0 };
    const size = Math.min(tr, Math.max(Math.min(min, tr), (ch / sh) * tr));
    const f = clamp(fin(scrollTop, 0) / (sh - ch), 0, 1);
    return { size: r1(size), offset: r1(f * (tr - size)) };
}
/** The scroll position that puts the thumb at `offset` px (the inverse of `thumbMetrics`). */
function scrollForThumb(offset, size, track, scrollHeight, clientHeight) {
    const room = fin(track, 0) - fin(size, 0);
    const range = fin(scrollHeight, 0) - fin(clientHeight, 0);
    if (!(room > 0) || !(range > 0))
        return 0;
    return Math.round(clamp(fin(offset, 0) / room, 0, 1) * range);
}
/** The labelled section a scroll position is in: the last one whose top (px, ascending) is at or above it; -1 before the first. */
function labelAt(tops, scrollTop, lead = 8) {
    const at = fin(scrollTop, 0) + Math.max(0, fin(lead, 8));
    let found = -1;
    tops.forEach((top, i) => {
        if (fin(top, Infinity) <= at)
            found = i;
    });
    return found;
}
/**
 * Whether a slide-to-confirm released at `x` px (of `max`) with speed `v` px/s confirms: when it is past `threshold`
 * of the way, or its momentum would carry it to the end.
 */
function slideOutcome(x, v, max, threshold = 0.8) {
    const m = fin(max, 0);
    if (!(m > 0))
        return false;
    const th = clamp(fin(threshold, 0.8), 0.05, 1);
    const at = fin(x, 0);
    return at >= m * th || projectInertia(at, Math.max(0, fin(v, 0)), 0.16) >= m;
}
/** A smooth SVG path through points (quadratic curves through the midpoints), as a rope drawn through its links. */
function chainPath(points) {
    const p = points.filter((q) => Number.isFinite(q.x) && Number.isFinite(q.y));
    if (!p.length)
        return '';
    if (p.length === 1)
        return `M${r1(p[0].x)} ${r1(p[0].y)}`;
    let d = `M${r1(p[0].x)} ${r1(p[0].y)}`;
    for (let i = 1; i < p.length - 1; i++) {
        const mx = (p[i].x + p[i + 1].x) / 2;
        const my = (p[i].y + p[i + 1].y) / 2;
        d += ` Q${r1(p[i].x)} ${r1(p[i].y)} ${r1(mx)} ${r1(my)}`;
    }
    const last = p[p.length - 1];
    return `${d} L${r1(last.x)} ${r1(last.y)}`;
}
/** Size of link `i` of `n` in a chain whose head is `head` px: each link a little smaller, down to 35%. */
function linkSize(i, n, head) {
    const count = Math.max(1, Math.floor(fin(n, 1)));
    const f = count > 1 ? clamp(fin(i, 0), 0, count - 1) / (count - 1) : 0;
    return r1(Math.max(1, fin(head, 18)) * (1 - 0.65 * f));
}
/** `x` folded into `[0, period)`, for a loop that wraps around. */
function wrapOffset(x, period) {
    const p = fin(period, 0);
    if (!(p > 0))
        return 0;
    const m = fin(x, 0) % p;
    return m < 0 ? m + p : m;
}
/**
 * A speed easing toward `target` over a frame of `dt` ms, with time constant `tau` ms: a fling slows down and an
 * idle marquee picks its cruise speed back up on the same damped curve, whatever the frame rate.
 */
function cruise(v, target, dt, tau = 650) {
    const k = 1 - Math.exp(-Math.max(0, fin(dt, 0)) / Math.max(1, fin(tau, 650)));
    const out = fin(v, 0) + (fin(target, 0) - fin(v, 0)) * k;
    return Math.abs(out - target) < 0.01 ? target : out;
}

export { PIP_CORNERS as P, cornerPoint as a, cornerStep as b, chainPath as c, cruise as d, linkSize as e, pipCorner as f, slideOutcome as g, islandShape as i, labelAt as l, parseCorner as p, scrollForThumb as s, thumbMetrics as t, wrapOffset as w };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/chunks/fling-kit-19-BDnFLTfF.js.map