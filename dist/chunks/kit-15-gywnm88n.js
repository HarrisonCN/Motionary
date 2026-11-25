/**
 * 17.15 helpers shared by the toolkit widgets (radial-menu, time-picker, color-swatches, calendar-strip,
 * comparison-table, radial-bars, bar-race, slope-chart, …). Pure functions with no DOM access, so they are easy to
 * test. Original implementations; see docs/toolkit-17-15.md.
 */
/**
 * Where `n` items sit on a circle of `radius` px, starting at `start` degrees (0 = east, -90 = north) and spread over
 * `spread` degrees. A full circle (360) spaces them evenly without doubling the first spot; a part circle puts the
 * first and last item on its two ends. Offsets are from the centre, rounded to 0.1 px.
 */
function radialSpots(n, radius = 84, start = -90, spread = 360) {
    const count = Math.max(0, Math.floor(Number.isFinite(n) ? n : 0));
    const r = Number.isFinite(radius) ? radius : 84;
    const s = Number.isFinite(start) ? start : -90;
    const sp = Math.max(0, Math.min(360, Number.isFinite(spread) ? spread : 360));
    const full = sp >= 360;
    const step = count <= 1 ? 0 : sp / (full ? count : count - 1);
    const round = (v) => Math.round(v * 10) / 10 || 0;
    return Array.from({ length: count }, (_, i) => {
        const angle = s + step * i;
        const rad = (angle * Math.PI) / 180;
        return { x: round(Math.cos(rad) * r), y: round(Math.sin(rad) * r), angle };
    });
}
/** "HH:MM" (24-hour) as hours and minutes, or null when it is not a real time. */
function timeParts(text) {
    const m = /^(\d{1,2}):(\d{2})$/.exec(String(text ?? '').trim());
    if (!m)
        return null;
    const h = +m[1];
    const mm = +m[2];
    return h < 24 && mm < 60 ? { h, m: mm } : null;
}
/** Minutes since midnight back to "HH:MM", wrapping round the day either way. */
function formatTime(minutes) {
    const t = ((Math.round(Number.isFinite(minutes) ? minutes : 0) % 1440) + 1440) % 1440;
    return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
}
/**
 * Step a time by `delta` steps of `step` minutes in one `unit`: hours move by whole hours, minutes snap to the step
 * grid first (so 10:07 with a 5-minute step goes up to 10:10 and down to 10:05) and wrap within the hour.
 */
function stepTime(text, unit, delta, step = 5) {
    const p = timeParts(text) ?? { h: 0, m: 0 };
    const st = Math.max(1, Math.min(60, Math.round(step) || 1));
    if (unit === 'h')
        return formatTime(((p.h + delta) % 24 + 24) % 24 * 60 + p.m);
    let m = p.m;
    if (delta > 0)
        m = Math.floor(m / st) * st + st * delta;
    else if (delta < 0)
        m = Math.ceil(m / st) * st + st * delta;
    m = ((m % 60) + 60) % 60;
    return formatTime(p.h * 60 + m);
}
/** A 24-hour hour as a 12-hour clock: hour 1–12 and whether it is after noon. */
const hour12 = (h) => ({ hour: ((h + 11) % 12) + 1, pm: h >= 12 });
/** Relative luminance of a `#rgb` / `#rrggbb` color (0 dark … 1 light), or NaN for anything else. */
function luminance(hex) {
    let s = String(hex ?? '').trim().replace(/^#/, '');
    if (/^[0-9a-f]{3}$/i.test(s))
        s = s.split('').map((c) => c + c).join('');
    if (!/^[0-9a-f]{6}$/i.test(s))
        return NaN;
    const ch = [0, 2, 4].map((i) => {
        const c = parseInt(s.slice(i, i + 2), 16) / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}
/** The ink (black or white) that reads best on a hex color; anything that is not hex gets white. */
function inkOn(hex) {
    const l = luminance(hex);
    if (!Number.isFinite(l))
        return '#ffffff';
    return (l + 0.05) / 0.05 >= 1.05 / (l + 0.05) ? '#000000' : '#ffffff';
}
/** A "YYYY-MM-DD" day as a UTC day number (days since 1970-01-01), or NaN. */
function parseDay(text) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(text ?? '').trim());
    if (!m)
        return NaN;
    const t = Date.UTC(+m[1], +m[2] - 1, +m[3]);
    const d = new Date(t);
    return d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3] ? Math.round(t / 864e5) : NaN;
}
/** A UTC day number back to "YYYY-MM-DD". */
function dayText(day) {
    return new Date(Math.round(day) * 864e5).toISOString().slice(0, 10);
}
/** The day that starts the week holding `day`, with weeks starting on `weekStart` (0 Sunday … 6 Saturday; 1 by default). */
function weekStartOf(day, weekStart = 1) {
    const dow = (((Math.round(day) + 4) % 7) + 7) % 7; // 1970-01-01 was a Thursday
    const ws = ((Math.round(weekStart) % 7) + 7) % 7;
    return Math.round(day) - ((dow - ws + 7) % 7);
}
/** Whether a table row's cells (after the first, which names the row) are not all the same, ignoring case and spaces. */
function rowDiffers(cells) {
    const vals = cells.slice(1).map((c) => String(c ?? '').trim().toLowerCase().replace(/\s+/g, ' '));
    return vals.length > 1 && vals.some((v) => v !== vals[0]);
}
/** A comparison cell that is really a yes or a no: "yes", "✓", "true", "是" … → 'yes'; "no", "✗", "—" … → 'no'; else ''. */
function cellMark(text) {
    const t = String(text ?? '').trim().toLowerCase();
    if (/^(yes|y|true|✓|✔|✔️|☑|是|有|支持|included)$/.test(t))
        return 'yes';
    if (/^(no|n|false|✗|✘|×|x|-|—|–|否|无|不支持)$/.test(t))
        return 'no';
    return '';
}
/**
 * Stroke-dash numbers for an arc that covers `fraction` of a `sweep`-degree track on a circle of radius `r`:
 * the visible length, the track length and the full circumference.
 */
function arcDash(fraction, r, sweep = 270) {
    const c = 2 * Math.PI * Math.max(0, r);
    const track = (c * Math.max(0, Math.min(360, sweep))) / 360;
    const f = Number.isFinite(fraction) ? Math.max(0, Math.min(1, fraction)) : 0;
    const round = (v) => Math.round(v * 100) / 100;
    return { on: round(track * f), track: round(track), circumference: round(c) };
}
/**
 * The order of names for one frame of a bar race: indexes sorted by value, largest first, ties kept in input order,
 * cut to the `top` places. Each entry carries its place and value.
 */
function raceRanks(values, top = 8) {
    return values
        .map((v, index) => ({ index, value: Number.isFinite(v) ? v : 0 }))
        .sort((a, b) => b.value - a.value || a.index - b.index)
        .slice(0, Math.max(1, Math.floor(top) || 1))
        .map((e, place) => ({ ...e, place }));
}
/** Frames of numbers from text like "1,2,3; 4,5,6": frames split on ";", numbers on commas or spaces (non-numbers → 0). */
function frameValues(text, maxFrames = 60, maxValues = 24) {
    return String(text ?? '')
        .split(';')
        .map((f) => f.trim())
        .filter(Boolean)
        .slice(0, maxFrames)
        .map((f) => f.split(/[\s,]+/).filter(Boolean).slice(0, maxValues).map((s) => (Number.isFinite(Number(s)) ? Number(s) : 0)));
}
/**
 * Push label positions apart so no two are closer than `gap`, keeping them inside [min, max] and their order. Used for
 * the end labels of a slope chart. Returns new positions in the input order.
 */
function spreadLabels(ys, gap = 14, min = 0, max = Infinity) {
    const order = ys.map((y, i) => ({ y: Number.isFinite(y) ? y : min, i })).sort((a, b) => a.y - b.y || a.i - b.i);
    for (let k = 1; k < order.length; k++)
        if (order[k].y < order[k - 1].y + gap)
            order[k].y = order[k - 1].y + gap;
    const over = order.length ? order[order.length - 1].y - max : 0;
    if (over > 0) {
        order[order.length - 1].y = max;
        for (let k = order.length - 2; k >= 0; k--)
            if (order[k].y > order[k + 1].y - gap)
                order[k].y = order[k + 1].y - gap;
    }
    for (const o of order)
        o.y = Math.max(min, o.y);
    const out = new Array(ys.length);
    for (const o of order)
        out[o.i] = Math.round(o.y * 10) / 10;
    return out;
}
/** Signed numbers (negatives kept) from a comma / space separated attribute; non-numbers become 0; at most `max`. */
function signedNumbers(text, max = 100) {
    return String(text ?? '')
        .split(/[\s,]+/)
        .filter(Boolean)
        .slice(0, max)
        .map((s) => (Number.isFinite(Number(s)) ? Number(s) : 0));
}
/** Change from `before` to `after` as a fraction of `before` (0.25 = +25%); 0 when `before` is 0. */
const relativeChange = (before, after) => (before ? (after - before) / Math.abs(before) : 0);

export { arcDash as a, frameValues as b, cellMark as c, dayText as d, radialSpots as e, formatTime as f, relativeChange as g, hour12 as h, inkOn as i, rowDiffers as j, spreadLabels as k, luminance as l, stepTime as m, parseDay as p, raceRanks as r, signedNumbers as s, timeParts as t, weekStartOf as w };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/chunks/kit-15-gywnm88n.js.map