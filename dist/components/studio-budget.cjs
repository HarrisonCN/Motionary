'use strict';

var components_studioExport = require('./studio-export.cjs');

/**
 * 16.3: performance budget in Studio. While you edit, measure what the export will cost — the bytes of the 14.7
 * standalone export (raw, and gzip where `CompressionStream` exists) and a frame cost from the baked tracks (each
 * property changing in a frame adds its class cost: composite 1, paint 4, layout 10) — check it against your limits,
 * block "publish export" when it is over budget (the publish callback is never called), and show a small live meter.
 * Opt-in entry `motionary/studio/budget` (= `motionary/components/studio-budget`); not in lite or studio.
 */
const PROP_COST = { composite: 1, paint: 4, layout: 10 };
const COMPOSITE = /^(opacity|transform|translate|rotate|scale)$/;
const LAYOUT = /^((min-|max-)?(width|height)|top|left|right|bottom|inset(-.+)?|(margin|padding)(-.+)?|font-size|line-height|(letter|word)-spacing|border(-(top|right|bottom|left))?-width|flex(-basis|-grow|-shrink)?|(row-|column-)?gap|grid-template-(rows|columns))$/;
const kebab = (p) => (p.startsWith('--') ? p : p.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase()));
const r2 = (n) => Math.round(n * 100) / 100;
const utf8 = (v) => (typeof v === 'string' ? new TextEncoder().encode(v) : v);
/** Rendering class of a CSS property (camelCase or kebab-case); unknown and custom properties count as paint. */
function propClass(prop) {
    const p = kebab(prop);
    return COMPOSITE.test(p) ? 'composite' : LAYOUT.test(p) ? 'layout' : 'paint';
}
/** Cost of every frame at `fps` (default 60): the sum of the costs of the properties whose value changes in it. */
function frameCost(input, o = {}) {
    const b = components_studioExport.bakeScene(input, o);
    const dt = 1000 / b.fps, frames = Math.max(1, Math.ceil((b.duration * b.fps) / 1000 - 1e-9));
    const layout = [], paint = [];
    const segs = []; // [from, to, cost] of every changing segment
    for (const t of b.tracks)
        for (const p of Object.keys(t.props)) {
            const pts = t.props[p], cls = propClass(p);
            let moved = false;
            for (let k = 0; k + 1 < pts.length; k++)
                if (JSON.stringify(pts[k][1]) !== JSON.stringify(pts[k + 1][1])) {
                    segs.push([pts[k][0], pts[k + 1][0], PROP_COST[cls]]);
                    moved = true;
                }
            const name = `${t.target} ${p}`;
            if (moved && cls !== 'composite')
                (cls === 'layout' ? layout : paint).push(name);
        }
    let peak = 0, peakAt = 0;
    for (let i = 0; i < frames; i++) {
        const a = i * dt, z = a + dt;
        let c = 0;
        for (const s of segs)
            if (s[0] < z && s[1] > a)
                c += s[2];
        if (c > peak) {
            peak = c;
            peakAt = r2(a);
        }
    }
    return { peak, peakAt, frames, layout: [...new Set(layout)], paint: [...new Set(paint)] };
}
async function gzipSize(bytes) {
    const r = new ReadableStream({ start(c) { c.enqueue(bytes); c.close(); } }).pipeThrough(new CompressionStream('gzip')).getReader();
    let n = 0;
    for (let x = await r.read(); !x.done; x = await r.read())
        n += x.value.byteLength;
    return n;
}
async function run(input, o) {
    const { files } = components_studioExport.exportStandalone(input, o);
    const sizes = {};
    let bytes = 0, gz = typeof CompressionStream === 'function' && typeof ReadableStream === 'function' ? 0 : null;
    for (const k of [...files.keys()].sort()) {
        const u = utf8(files.get(k));
        sizes[k] = u.length;
        bytes += u.length;
        if (gz !== null)
            gz += await gzipSize(u);
    }
    return { files, measure: { bytes, gzipBytes: gz, files: sizes, cost: frameCost(input, o) } };
}
/** Measure the standalone export of a project (same options as `exportStandalone`). Deterministic. */
async function measureExport(input, o = {}) {
    return (await run(input, o)).measure;
}
/** Every metric over its limit (order: kb, gzipKb, frameCost, layout). */
function checkBudget(m, l) {
    const over = [];
    const kb = r2(m.bytes / 1024);
    if (l.kb !== undefined && kb > l.kb)
        over.push({ metric: 'kb', value: kb, limit: l.kb });
    if (l.gzipKb !== undefined && m.gzipBytes !== null && r2(m.gzipBytes / 1024) > l.gzipKb)
        over.push({ metric: 'gzipKb', value: r2(m.gzipBytes / 1024), limit: l.gzipKb });
    if (l.frameCost !== undefined && m.cost.peak > l.frameCost)
        over.push({ metric: 'frameCost', value: m.cost.peak, limit: l.frameCost });
    if (l.layout === false && m.cost.layout.length)
        over.push({ metric: 'layout', value: m.cost.layout.length, limit: 0 });
    return { ok: !over.length, over };
}
/** "Publish export" with a budget: over budget → `{ ok: false, over }` and `publish` is not called. */
async function guardPublish(input, limits, publish, o = {}) {
    const { files, measure } = await run(input, o);
    const c = checkBudget(measure, limits);
    return c.ok ? { ok: true, value: await publish(files, measure), measure } : { ok: false, over: c.over, measure };
}
/** A live meter (`role="status"`, polite): "12.3 KB / 20 KB · gzip 4.1 KB · cost 14 / 30"; `data-over` names the first metric over. */
function createBudgetMeter(el, limits) {
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    return {
        update(m) {
            const c = checkBudget(m, limits);
            const lim = (v, u = '') => (v !== undefined ? ` / ${v}${u}` : '');
            el.textContent = `${r2(m.bytes / 1024)} KB${lim(limits.kb, ' KB')}${m.gzipBytes !== null ? ` · gzip ${r2(m.gzipBytes / 1024)} KB` : ''} · cost ${m.cost.peak}${lim(limits.frameCost)}`;
            c.ok ? el.removeAttribute('data-over') : el.setAttribute('data-over', c.over[0].metric);
            return c;
        },
        destroy() {
            el.textContent = '';
            for (const a of ['role', 'aria-live', 'data-over'])
                el.removeAttribute(a);
        },
    };
}

exports.PROP_COST = PROP_COST;
exports.checkBudget = checkBudget;
exports.createBudgetMeter = createBudgetMeter;
exports.frameCost = frameCost;
exports.guardPublish = guardPublish;
exports.measureExport = measureExport;
exports.propClass = propClass;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.0.0-rc.1/dist/components/studio-budget.cjs.map