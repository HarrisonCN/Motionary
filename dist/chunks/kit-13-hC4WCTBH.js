/**
 * 17.13 helpers shared by the studio widgets (tour, wheel-picker, mention-input, diff-viewer, the charts, split-flap, …).
 * Pure functions with no DOM access, so they are easy to test. Original implementations; see docs/studio-17-13.md.
 */
/** Clamp `n` to [min, max]; a non-finite `n` becomes `min`. */
const clampTo = (n, min, max) => (Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min);
/**
 * Where a tour card of size `card` goes next to the `target` rectangle inside a `view` of the given size: below the
 * target when it fits, otherwise above, otherwise whichever side has more room. The card is kept `margin` px inside
 * the view horizontally and centred on the target where possible.
 */
function tourPlace(target, card, view, gap = 12, margin = 8) {
    const below = view.height - (target.top + target.height) - gap;
    const above = target.top - gap;
    const side = below >= card.height || below >= above ? 'below' : 'above';
    const top = side === 'below' ? target.top + target.height + gap : target.top - gap - card.height;
    const centred = target.left + target.width / 2 - card.width / 2;
    const left = clampTo(centred, margin, Math.max(margin, view.width - card.width - margin));
    return { top: Math.round(top), left: Math.round(left), side };
}
/** The wheel row under the centre line for a scroll offset: rounded, clamped to the `n` rows. */
function wheelIndex(scrollTop, rowHeight, n) {
    if (n <= 0 || !(rowHeight > 0))
        return 0;
    return clampTo(Math.round(scrollTop / rowHeight), 0, n - 1);
}
/** How far a wheel row leans back, in degrees, when it is `offset` rows from the centre (±80° at most). */
const wheelTilt = (offset) => clampTo(offset * 20, -80, 80);
/**
 * The mention being typed just before `caret`: the `trigger` character at the start of the text or after a space,
 * followed by up to 30 non-space characters. Returns its start index and the query, or `null`.
 */
function mentionQuery(text, caret, trigger = '@') {
    const t = String(text ?? '').slice(0, Math.max(0, caret));
    const at = t.lastIndexOf(trigger);
    if (at < 0)
        return null;
    if (at > 0 && !/\s/.test(t[at - 1]))
        return null;
    const query = t.slice(at + trigger.length);
    if (/\s/.test(query) || query.length > 30)
        return null;
    return { start: at, query };
}
/** Names that start with the query first, then names that contain it; case-insensitive; at most `max`. */
function matchNames(names, query, max = 6) {
    const q = String(query ?? '').toLowerCase();
    const starts = [];
    const has = [];
    for (const n of names) {
        const l = n.toLowerCase();
        if (l.startsWith(q))
            starts.push(n);
        else if (q && l.includes(q))
            has.push(n);
    }
    return [...starts, ...has].slice(0, max);
}
/**
 * A line diff of `before` → `after` from their longest common subsequence. Removed lines come before the lines that
 * replace them. `a` / `b` are 1-based line numbers in the old / new text. Inputs over 2000 lines each are cut there.
 */
function diffLines(before, after) {
    const A = String(before ?? '').replace(/\r\n?/g, '\n').split('\n').slice(0, 2000);
    const B = String(after ?? '').replace(/\r\n?/g, '\n').split('\n').slice(0, 2000);
    // trim the shared head and tail, then LCS over what is left
    let head = 0;
    while (head < A.length && head < B.length && A[head] === B[head])
        head++;
    let tail = 0;
    while (tail < A.length - head && tail < B.length - head && A[A.length - 1 - tail] === B[B.length - 1 - tail])
        tail++;
    const a = A.slice(head, A.length - tail);
    const b = B.slice(head, B.length - tail);
    const n = a.length, m = b.length;
    const w = m + 1;
    const L = new Uint16Array((n + 1) * w);
    for (let i = n - 1; i >= 0; i--)
        for (let j = m - 1; j >= 0; j--)
            L[i * w + j] = a[i] === b[j] ? L[(i + 1) * w + j + 1] + 1 : Math.max(L[(i + 1) * w + j], L[i * w + j + 1]);
    const out = [];
    for (let i = 0; i < head; i++)
        out.push({ type: 'same', text: A[i], a: i + 1, b: i + 1 });
    let i = 0, j = 0;
    while (i < n || j < m) {
        if (i < n && j < m && a[i] === b[j]) {
            out.push({ type: 'same', text: a[i], a: head + i + 1, b: head + j + 1 });
            i++;
            j++;
        }
        else if (j >= m || (i < n && L[(i + 1) * w + j] >= L[i * w + j + 1])) {
            out.push({ type: 'del', text: a[i], a: head + i + 1 });
            i++;
        }
        else {
            out.push({ type: 'add', text: b[j], b: head + j + 1 });
            j++;
        }
    }
    for (let k = 0; k < tail; k++)
        out.push({ type: 'same', text: A[A.length - tail + k], a: A.length - tail + k + 1, b: B.length - tail + k + 1 });
    return out;
}
/** The part of `a` and `b` that differs, as [start, endA, endB] after the shared prefix and suffix. */
function changedSpan(a, b) {
    let s = 0;
    while (s < a.length && s < b.length && a[s] === b[s])
        s++;
    let ea = a.length, eb = b.length;
    while (ea > s && eb > s && a[ea - 1] === b[eb - 1]) {
        ea--;
        eb--;
    }
    return [s, ea, eb];
}
/** Round tick values covering [min, max], about `count` of them (1, 2, 2.5 or 5 × a power of ten apart). */
function niceTicks(min, max, count = 5) {
    if (!Number.isFinite(min) || !Number.isFinite(max))
        return [0];
    if (min === max) {
        min = min > 0 ? 0 : min - 1;
        max = max > 0 ? max : max + 1;
    }
    if (min > max)
        [min, max] = [max, min];
    const raw = (max - min) / Math.max(1, count);
    const p = Math.pow(10, Math.floor(Math.log10(raw)));
    const step = [1, 2, 2.5, 5, 10].map((k) => k * p).find((s) => s >= raw) ?? 10 * p;
    const lo = Math.floor(min / step) * step;
    const hi = Math.ceil(max / step) * step;
    const out = [];
    for (let v = lo; v <= hi + step / 2 && out.length < 50; v += step)
        out.push(Number(v.toFixed(10)));
    return out;
}
/**
 * An SVG path through `values` spread over `width` × `height` (y up), scaled to [min, max]. With `smooth` the line is a
 * monotone cubic curve (no overshoot between points); otherwise straight segments. Non-finite values are skipped.
 */
function linePath(values, width, height, min, max, smooth = true) {
    const n = values.length;
    if (!n)
        return '';
    const span = max - min || 1;
    const pts = values.map((v, i) => [n === 1 ? width / 2 : (i * width) / (n - 1), height - ((v - min) / span) * height]);
    const f = (x) => Math.round(x * 100) / 100;
    if (!smooth || n < 3)
        return pts.map(([x, y], i) => `${i ? 'L' : 'M'}${f(x)},${f(y)}`).join('');
    // monotone cubic (Fritsch–Carlson) tangents
    const d = pts.slice(1).map((p, i) => (p[1] - pts[i][1]) / (p[0] - pts[i][0] || 1));
    const m = pts.map((_, i) => (i === 0 ? d[0] : i === n - 1 ? d[n - 2] : d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2));
    let s = `M${f(pts[0][0])},${f(pts[0][1])}`;
    for (let i = 0; i < n - 1; i++) {
        const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
        const h = (x1 - x0) / 3;
        s += `C${f(x0 + h)},${f(y0 + m[i] * h)} ${f(x1 - h)},${f(y1 - m[i + 1] * h)} ${f(x1)},${f(y1)}`;
    }
    return s;
}
/** Each funnel stage's width as a share of the first, and its conversion from the previous stage and from the first. */
function funnelRows(values) {
    const v = values.map((x) => (Number.isFinite(x) && x > 0 ? x : 0));
    const first = v[0] || 0;
    return v.map((x, i) => ({
        share: first ? Math.min(1, x / first) : 0,
        step: i === 0 ? 1 : v[i - 1] ? x / v[i - 1] : 0,
        overall: first ? x / first : 0,
    }));
}
/**
 * Squarified treemap: rectangles for `values` (largest first is best) filling `width` × `height`, in input order.
 * Zero or negative values get an empty rectangle.
 */
function squarify(values, width, height) {
    const out = values.map(() => ({ x: 0, y: 0, w: 0, h: 0 }));
    const items = values.map((v, i) => ({ i, v: Number.isFinite(v) && v > 0 ? v : 0 })).filter((it) => it.v > 0).sort((p, q) => q.v - p.v);
    const total = items.reduce((s, it) => s + it.v, 0);
    if (!total || !(width > 0) || !(height > 0))
        return out;
    const scale = (width * height) / total;
    let x = 0, y = 0, w = width, h = height;
    const worst = (row, side) => {
        const s = row.reduce((a, b) => a + b, 0);
        const mx = Math.max(...row), mn = Math.min(...row);
        return Math.max((side * side * mx) / (s * s), (s * s) / (side * side * mn));
    };
    let k = 0;
    while (k < items.length) {
        const side = Math.min(w, h);
        const row = [items[k].v * scale];
        let end = k + 1;
        while (end < items.length) {
            const next = [...row, items[end].v * scale];
            if (worst(next, side) > worst(row, side))
                break;
            row.push(items[end].v * scale);
            end++;
        }
        const sum = row.reduce((a, b) => a + b, 0);
        const thick = sum / side;
        let off = 0;
        for (let r = k; r < end; r++) {
            const len = (items[r].v * scale) / thick;
            out[items[r].i] = w >= h ? { x, y: y + off, w: thick, h: len } : { x: x + off, y, w: len, h: thick };
            off += len;
        }
        if (w >= h) {
            x += thick;
            w -= thick;
        }
        else {
            y += thick;
            h -= thick;
        }
        k = end;
    }
    return out.map((r) => ({ x: round2(r.x), y: round2(r.y), w: round2(r.w), h: round2(r.h) }));
}
const round2 = (n) => Math.round(n * 100) / 100;
/** Whole days since 1970-01-01 for a `YYYY-MM-DD` date (UTC), or NaN. */
function dayNumber(text) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(text ?? '').trim());
    if (!m)
        return NaN;
    const t = Date.UTC(+m[1], +m[2] - 1, +m[3]);
    const d = new Date(t);
    return d.getUTCMonth() === +m[2] - 1 ? Math.round(t / 864e5) : NaN;
}
/** A bar's left edge and width as percentages of the [min, max] day range (end day included). */
function ganttSpan(start, end, min, max) {
    const days = max - min + 1;
    if (!(days > 0) || !Number.isFinite(start) || !Number.isFinite(end))
        return { left: 0, width: 0 };
    const s = clampTo(Math.min(start, end), min, max + 1);
    const e = clampTo(Math.max(start, end) + 1, min, max + 1);
    return { left: round2(((s - min) / days) * 100), width: round2(((e - s) / days) * 100) };
}
/**
 * Which category fills each of `cells` waffle cells, by largest remainder so the counts add up exactly.
 * Cells after the categories (when the values sum to less than `total`) get -1.
 */
function waffleCells(values, total = 100, cells = 100) {
    const v = values.map((x) => (Number.isFinite(x) && x > 0 ? x : 0));
    const sum = v.reduce((a, b) => a + b, 0);
    const base = Math.max(total, sum) || 1;
    const exact = v.map((x) => (x / base) * cells);
    const counts = exact.map(Math.floor);
    let left = Math.min(cells, Math.round((sum / base) * cells)) - counts.reduce((a, b) => a + b, 0);
    const order = exact.map((x, i) => [x - Math.floor(x), i]).sort((p, q) => q[0] - p[0]);
    for (let k = 0; left > 0 && k < order.length; k++, left--)
        counts[order[k][1]]++;
    const out = [];
    counts.forEach((c, i) => { for (let k = 0; k < c && out.length < cells; k++)
        out.push(i); });
    while (out.length < cells)
        out.push(-1);
    return out;
}
/** How many flaps a split-flap character turns through to get from `from` to `to` in `charset` (always forward). */
function flapSteps(from, to, charset) {
    const n = charset.length;
    const a = charset.indexOf(from), b = charset.indexOf(to);
    if (from === to)
        return 0;
    if (a < 0 || b < 0 || !n)
        return 1;
    return (b - a + n) % n;
}
/** A stable shuffle of 0…n-1 for `seed` (Fisher–Yates over a small hash; no Math.random). */
function shuffleOrder(n, seed = 1) {
    const out = Array.from({ length: Math.max(0, Math.round(n)) }, (_, i) => i);
    for (let i = out.length - 1; i > 0; i--) {
        const x = Math.sin((i + 1) * 91.3458 + seed * 47.853) * 24634.6345;
        const j = Math.floor((x - Math.floor(x)) * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}
/** Pointer pull on a letter: 1 at the pointer, falling smoothly to 0 at `radius` px away. */
function pressureAt(distance, radius) {
    if (!(radius > 0) || !Number.isFinite(distance))
        return 0;
    const t = clampTo(1 - Math.abs(distance) / radius, 0, 1);
    return t * t * (3 - 2 * t);
}
/** The angle (degrees, 0 = right, clockwise) from (x, y) toward (px, py). */
const angleTo = (x, y, px, py) => Math.round((Math.atan2(py - y, px - x) * 180) / Math.PI * 10) / 10;
/** Width of a signature stroke for a pointer speed (px per ms): faster is thinner, within 0.45×–1.6× of `base`. */
const strokeWidth = (speed, base = 2.5) => clampTo(base * (1.6 - clampTo(speed, 0, 3) * 0.4), base * 0.45, base * 1.6);

export { angleTo as a, clampTo as b, changedSpan as c, dayNumber as d, diffLines as e, flapSteps as f, funnelRows as g, ganttSpan as h, mentionQuery as i, squarify as j, strokeWidth as k, linePath as l, matchNames as m, niceTicks as n, wheelIndex as o, pressureAt as p, wheelTilt as q, shuffleOrder as s, tourPlace as t, waffleCells as w };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/chunks/kit-13-hC4WCTBH.js.map