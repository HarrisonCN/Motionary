'use strict';

var spring = require('./spring-DoapHVAk.cjs');

/**
 * 17.18 helpers shared by the damped parts (spring-collapse, read-more, spring-sheet, spring-pager, elastic-scroll,
 * spring-stack). Pure functions with no DOM access, so they are easy to test. The motion itself comes from the 17.16
 * spring core (`createSpringGroup`) and the 17.18 `springExpand()`. Original implementations; see
 * docs/damped-motion-17-18.md.
 */
const fin = (n, d) => (typeof n === 'number' && Number.isFinite(n) ? n : d);
/**
 * Snap points of a sheet from text such as "0.4, 0.9" or "40%, 90%": fractions of the frame's height, kept in
 * (0, 1], sorted, duplicates dropped. Falls back to `[0.5, 1]` when nothing usable is given.
 */
function parseSnaps(text) {
    const out = String(text ?? '')
        .split(/[,\s]+/)
        .map((t) => (t.endsWith('%') ? parseFloat(t) / 100 : parseFloat(t)))
        .filter((n) => Number.isFinite(n) && n > 0)
        .map((n) => Math.round(Math.min(1, n) * 1000) / 1000);
    const uniq = [...new Set(out)].sort((a, b) => a - b);
    return uniq.length ? uniq : [0.5, 1];
}
/**
 * Where a released sheet comes to rest: the snap (index into `snaps`) nearest to where its momentum would carry it,
 * or -1 to close. `shown` is the visible fraction (0–1) and `velocity` how fast it grows, in fractions per second.
 * A sheet may only close when `closable` and the projection falls below half of the lowest snap.
 */
function sheetRest(shown, velocity, snaps, closable = true) {
    if (!snaps.length)
        return -1;
    const at = spring.projectInertia(fin(shown, 0), fin(velocity, 0), 0.2);
    if (closable && at < snaps[0] / 2)
        return -1;
    let best = 0;
    snaps.forEach((s, i) => {
        if (Math.abs(s - at) < Math.abs(snaps[best] - at))
            best = i;
    });
    return best;
}
/**
 * The page a pager settles on after a drag: the page under its projected position, but never more than one page
 * from where the drag began (`from`), so a hard flick turns one page, as on a phone. `offset` is the track's
 * position in px (0 = first page, growing to the right), `velocity` in px/s.
 */
function pageAfter(offset, velocity, width, count, from) {
    const n = Math.max(1, Math.floor(fin(count, 1)));
    if (!(width > 0))
        return Math.min(n - 1, Math.max(0, Math.round(fin(from, 0))));
    const projected = spring.projectInertia(fin(offset, 0), fin(velocity, 0), 0.18) / width;
    const start = Math.min(n - 1, Math.max(0, Math.round(fin(from, 0))));
    const near = Math.round(projected);
    return Math.min(n - 1, Math.max(0, Math.min(start + 1, Math.max(start - 1, near))));
}
/**
 * A position inside `[min, max]`, or past an end with rubber-band resistance (the further, the stiffer), as an
 * iOS scroll view does. `dimension` is the size that sets how stiff the band is.
 */
function dampedAt(position, min, max, dimension, constant = 0.55) {
    const p = fin(position, 0);
    if (p < min)
        return min + spring.rubberBand(p - min, dimension, constant);
    if (p > max)
        return max + spring.rubberBand(p - max, dimension, constant);
    return p;
}
/**
 * The layout of card `i` of `n` in a stack: collapsed, cards tuck behind the first (each `peek` px lower and a
 * little smaller); open (`t` = 1), they lie one under another `gap` px apart. `heights` are the cards' heights.
 * Returns the y offset in px and the scale; `t` in between blends the two.
 */
function pilePose(i, heights, t, peek = 10, gap = 10) {
    const k = Math.min(1, Math.max(0, fin(t, 0)));
    let open = 0;
    for (let j = 0; j < i; j++)
        open += fin(heights[j], 0) + gap;
    const depth = Math.min(i, 3);
    const closedY = depth * peek;
    const closedScale = 1 - depth * 0.05;
    const closedOpacity = i > 3 ? 0 : 1 - depth * 0.18;
    const mix = (a, b) => a + (b - a) * k;
    return {
        y: Math.round(mix(closedY, open) * 10) / 10,
        scale: Math.round(mix(closedScale, 1) * 1000) / 1000,
        opacity: Math.round(mix(closedOpacity, 1) * 100) / 100,
    };
}
/** Height of `lines` lines of text with the given line height in px (at least one line). */
const linesHeight = (lines, lineHeight) => Math.max(1, Math.floor(fin(lines, 3))) * Math.max(1, fin(lineHeight, 20));

exports.dampedAt = dampedAt;
exports.linesHeight = linesHeight;
exports.pageAfter = pageAfter;
exports.parseSnaps = parseSnaps;
exports.pilePose = pilePose;
exports.sheetRest = sheetRest;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/chunks/damped-kit-18-CM0mPVmn.cjs.map