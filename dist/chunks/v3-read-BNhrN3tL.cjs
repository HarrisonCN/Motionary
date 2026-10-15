'use strict';

/**
 * 16.0: the Scene v3 → v2 reader shared by the Studio, the CLI and motionary-mcp (`flattenSceneV3`), plus the
 * byte-cheap helpers the player and the timeline editor use for flat v3 (`flatSceneV3ToV2`, `sceneV2ToFlatV3`).
 * No imports: it must stay cheap for every entry that opens scenes.
 */
const isObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
const num = (v, min = 0, max = 1e7) => typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max;
const clone = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
const round = (n) => { const r = Math.round(n * 1e6) / 1e6; return r === 0 ? 0 : r; };
const VK = 'motionary:variants';
/** A flat Scene v3 document (no comps / component layers / components) as Scene v2 (variants back to meta); `undefined` otherwise. */
function flatSceneV3ToV2(d) {
    if (!isObj(d) || d.version !== 3 || !Array.isArray(d.layers) || (isObj(d.components) && Object.keys(d.components).length) || d.layers.some((l) => l && (l.type === 'comp' || l.type === 'component')))
        return undefined;
    const { variants, components, ...out } = d;
    out.version = 2;
    if (variants !== undefined)
        out.meta = { ...(isObj(d.meta) ? d.meta : {}), [VK]: variants };
    return out;
}
/** Scene v2 → flat Scene v3 (16.0 write format): version 3, variants out of meta (an empty meta is dropped). */
function sceneV2ToFlatV3(d) {
    const out = { ...d, version: 3 };
    if (isObj(d.meta) && Array.isArray(d.meta[VK])) {
        const { [VK]: v, ...meta } = d.meta;
        out.variants = v;
        if (Object.keys(meta).length)
            out.meta = meta;
        else
            delete out.meta;
    }
    return out;
}
/**
 * Read any v3 document as Scene v2 (not normalized). Compositions become groups with their start / time remap
 * baked into keyframe times; component instances are expanded (`<instance>/<layer>` ids, targets scoped under the
 * instance target, overrides applied); variants go back to meta. Every such step is listed in `lost`.
 */
function flattenSceneV3(doc) {
    const lost = [];
    const layers = [];
    const comps = isObj(doc.components) ? doc.components : {};
    const emit = (src, at, ctx) => {
        src.forEach((l, i) => {
            const lp = `${at}[${i}]`;
            const id = ctx.prefix + l.id;
            const parent = l.parent !== undefined ? ctx.prefix + l.parent : ctx.parent;
            const flags = {};
            if (l.name !== undefined)
                flags.name = l.name;
            if (parent !== undefined)
                flags.parent = parent;
            for (const f of ['locked', 'muted', 'solo'])
                if (l[f])
                    flags[f] = true;
            if (l.type === 'group') {
                layers.push({ ...clone(l), id, ...flags });
                return;
            }
            if (l.type === 'track') {
                const n = { ...clone(l), id, ...flags };
                const ov = ctx.overrides && ctx.overrides[l.id];
                if (ctx.target !== undefined && n.target !== undefined)
                    n.target = n.target === ':scope' ? ctx.target : `${ctx.target} ${n.target}`;
                if (ov) {
                    if (ov.target !== undefined)
                        n.target = ov.target;
                    if (ov.muted !== undefined) {
                        if (ov.muted)
                            n.muted = true;
                        else
                            delete n.muted;
                    }
                }
                if (n.start !== undefined)
                    n.start = round(Math.max(0, ctx.map(n.start)));
                if (n.duration !== undefined && ctx.rate !== 1)
                    n.duration = round(n.duration / ctx.rate);
                if (Array.isArray(n.keyframes))
                    for (const k of n.keyframes) {
                        if (ctx.prefix)
                            k.id = ctx.prefix + k.id;
                        const t = ctx.map(k.time);
                        if (t < 0)
                            lost.push({ path: `${lp}.keyframes`, message: `keyframe "${k.id}" maps before 0 ms — clamped to 0` });
                        k.time = round(Math.max(0, t));
                        if (ov && ov.props)
                            Object.assign(k.props, clone(ov.props));
                    }
                layers.push(n);
                return;
            }
            if (ctx.depth > 12) {
                lost.push({ path: lp, message: 'nested too deep — dropped' });
                return;
            }
            if (l.type === 'comp') {
                layers.push({ id, type: 'group', ...flags });
                const start = num(l.start) ? l.start : 0, r = l.timeRemap || {}, off = num(r.offset) ? r.offset : 0, rate = num(r.rate, 0, 16) && r.rate > 0 ? r.rate : 1;
                const outer = ctx.map;
                lost.push({ path: lp, message: `composition "${l.id}" → group${start || off || rate !== 1 ? ` (start${off || rate !== 1 ? ' and time remap' : ''} baked into keyframe times)` : ''}${l.duration !== undefined ? '; its duration clip is not applied' : ''} — the composition boundary is not kept in v2` });
                emit(l.layers || [], `${lp}.layers`, { ...ctx, parent: id, map: (t) => outer(start + (t - off) / rate), rate: ctx.rate * rate, depth: ctx.depth + 1 });
                return;
            }
            if (l.type === 'component') {
                const def = Object.prototype.hasOwnProperty.call(comps, l.ref) ? comps[l.ref] : undefined;
                if (!def) {
                    lost.push({ path: lp, message: `component instance "${l.id}": unknown component "${l.ref}" — dropped` });
                    return;
                }
                layers.push({ id, type: 'group', ...flags });
                lost.push({ path: lp, message: `component instance "${l.id}" of "${l.ref}" expanded — the link to the definition is not kept in v2` });
                const start = num(l.start) ? l.start : 0, outer = ctx.map;
                const target = l.target !== undefined ? (ctx.target !== undefined ? `${ctx.target} ${l.target}` : l.target) : ctx.target;
                emit(def.layers || [], `${lp}(${l.ref})`, { parent: id, map: (t) => outer(start + t), rate: ctx.rate, prefix: `${id}/`, target, overrides: l.overrides, depth: ctx.depth + 1 });
                return;
            }
            lost.push({ path: lp, message: `unknown layer type "${l.type}" — dropped` });
        });
    };
    emit(Array.isArray(doc.layers) ? doc.layers : [], 'layers', { map: (t) => t, rate: 1, prefix: '', depth: 0 });
    const out = { format: 'motionary-scene', version: 2, layers };
    for (const k of ['name', 'duration', 'loop', 'seed', 'tokens', 'source'])
        if (doc[k] !== undefined)
            out[k] = clone(doc[k]);
    if (doc.meta !== undefined)
        out.meta = clone(doc.meta);
    if (doc.variants !== undefined) {
        if (out.meta === undefined || isObj(out.meta))
            out.meta = { ...(out.meta || {}), [VK]: clone(doc.variants) };
        else
            lost.push({ path: 'variants', message: 'meta is not an object — variants cannot be stored in v2' });
    }
    return { doc: out, lost };
}

exports.flatSceneV3ToV2 = flatSceneV3ToV2;
exports.flattenSceneV3 = flattenSceneV3;
exports.sceneV2ToFlatV3 = sceneV2ToFlatV3;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v16.0.0/dist/chunks/v3-read-BNhrN3tL.cjs.map