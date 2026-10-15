import { a as SCENE_V2_LIMITS, m as migrateToSceneV2, n as normalizeSceneV2, v as validateSceneV2 } from '../chunks/v2-AmFfWfpi.js';
import { VARIANTS_META_KEY, validateVariants } from './studio-a11y.js';

/**
 * 15.9: Scene Format v3 — DRAFT (`motionary/scene/v3-preview` = `motionary/components/scene-v3-preview`).
 *
 * The format 16.0 writes (docs/scene-v3.md, scripts/scene-v3.schema.json). Draft: it may change before 16.0.
 * What v3 adds over v2:
 * - nested compositions: `{ type: "comp", layers: [...], start?, duration?, timeRemap?: { offset?, rate? } }` — content
 *   time `t` plays at `start + (t - offset) / rate`;
 * - components as layers: `{ type: "component", ref, target?, start?, overrides?: { [layerId]: { target?, muted?, props? } } }`
 *   instantiating `components[ref].layers` (the basis for 16.1 symbols);
 * - breakpoint variants as a first-class `variants` array (15.3 kept them in `meta["motionary:variants"]`).
 *
 * In 15.9 everything here is a preview: `migrateToSceneV3` never writes and never mutates its input (the CLI's
 * `migrate --to 16` only reports), and `sceneV3ToV2` reads v3 back for 15.x, naming everything v2 cannot express.
 * Pure (no DOM), never throws on bad input.
 */
const SCENE_V3_FORMAT = 'motionary-scene';
const SCENE_V3_VERSION = 3;
/** 15.9: draft. 16.0 makes it the write format. */
const SCENE_V3_STATUS = 'draft';
const SCENE_V3_LIMITS = { ...SCENE_V2_LIMITS, compDepth: 8, components: 256, rate: 16, depth: 64 };
const dep = (id, what, fix) => ({ id, removedIn: '16.0', what, fix, doc: `docs/deprecations-v16.md#${id}` });
/** Everything 16.0 changes or removes. `doctor --v16` finds each, `migrate --to 16` handles what is mechanical. */
const DEPRECATIONS_V16 = [
    dep('scene-v2-write', 'Studio, the CLI and MCP write Scene v3 from 16.0; v2 documents are still read (migrated on open)', 'consumers that need v2 call studio.exportScene({ version: 2 }) / sceneV3ToV2(); convert files with npx motionary migrate --to 16'),
    dep('variants-meta', 'breakpoint variants move from meta["motionary:variants"] to the top-level "variants" array of Scene v3', 'npx motionary migrate --to 16 moves them; code reading meta["motionary:variants"] uses variantsOf() from motionary/studio/a11y'),
    dep('mcp-snippet-scene', 'motionary-mcp 3.0: validate_snippet takes code only; scenes go to validate_scene (added in 2.5)', 'call validate_scene { scene, ops?, version?, browser? } instead of validate_snippet { scene }'),
    dep('mcp-scene-text', 'motionary-mcp 3.0: scene arguments are JSON objects only (JSON text is refused)', 'pass the parsed object: { scene: JSON.parse(text) }'),
    dep('mcp-check-compat', 'motionary-mcp 3.0 removes check_compat (1.0; superseded by check_compatibility in 13.7)', 'call check_compatibility { tags, version }'),
];
const L = SCENE_V3_LIMITS;
const FORBIDDEN = /*#__PURE__*/ new Set(['__proto__', 'constructor', 'prototype']);
const DOC_KEYS = /*#__PURE__*/ new Set(['format', 'version', 'name', 'duration', 'loop', 'seed', 'tokens', 'layers', 'components', 'variants', 'source', 'meta']);
const COMP_KEYS = /*#__PURE__*/ new Set(['id', 'type', 'name', 'parent', 'locked', 'muted', 'solo', 'start', 'duration', 'timeRemap', 'layers']);
const INST_KEYS = /*#__PURE__*/ new Set(['id', 'type', 'name', 'parent', 'locked', 'muted', 'solo', 'ref', 'target', 'start', 'overrides']);
const isObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
const num = (v, min = 0, max = L.time) => typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max;
const str = (v, max = L.stringLength) => typeof v === 'string' && v.length <= max;
const clone = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
const round = (n) => { const r = Math.round(n * 1e6) / 1e6; return r === 0 ? 0 : r; };
const sortKeys = (o) => { const r = {}; for (const k of Object.keys(o).sort())
    r[k] = o[k]; return r; };
function jsonProblems(v, path, depth, out, seen) {
    if (out.length > 50)
        return;
    if (depth > L.depth) {
        out.push({ path, message: `nested deeper than ${L.depth}` });
        return;
    }
    if (v === null || typeof v === 'boolean' || typeof v === 'string')
        return;
    if (typeof v === 'number') {
        if (!Number.isFinite(v))
            out.push({ path, message: 'not a finite number' });
        return;
    }
    if (typeof v !== 'object') {
        out.push({ path, message: `not JSON (${typeof v})` });
        return;
    }
    if (seen.has(v)) {
        out.push({ path, message: 'circular reference' });
        return;
    }
    seen.add(v);
    if (Array.isArray(v))
        v.forEach((x, i) => jsonProblems(x, `${path}[${i}]`, depth + 1, out, seen));
    else
        for (const k of Object.keys(v)) {
            if (FORBIDDEN.has(k))
                out.push({ path: `${path}.${k}`, message: 'forbidden key' });
            else
                jsonProblems(v[k], path ? `${path}.${k}` : k, depth + 1, out, seen);
        }
    seen.delete(v);
}
/** Every layer id in a layer tree (comps included, component instances not expanded). */
function treeIds(layers, out = []) {
    if (Array.isArray(layers))
        for (const l of layers)
            if (isObj(l)) {
                if (typeof l.id === 'string')
                    out.push(l.id);
                if (l.type === 'comp')
                    treeIds(l.layers, out);
            }
    return out;
}
function treeRefs(layers, out = new Set()) {
    if (Array.isArray(layers))
        for (const l of layers)
            if (isObj(l)) {
                if (l.type === 'component' && typeof l.ref === 'string')
                    out.add(l.ref);
                if (l.type === 'comp')
                    treeRefs(l.layers, out);
            }
    return out;
}
/**
 * Every problem with a Scene v3 document (object or JSON text). Never throws; `[]` means valid.
 * Track and group layers follow the v2 rules at every nesting level.
 */
function validateSceneV3(input) {
    let doc = input;
    if (typeof input === 'string') {
        if (input.length > L.textBytes)
            return [{ path: '', message: `text longer than ${L.textBytes} characters` }];
        try {
            doc = JSON.parse(input);
        }
        catch (e) {
            return [{ path: '', message: `invalid JSON (${e.message})` }];
        }
    }
    if (!isObj(doc))
        return [{ path: '', message: 'expected an object' }];
    const out = [];
    const P = (path, message) => { out.push({ path, message }); };
    try {
        jsonProblems(doc, '', 0, out, new Set());
        if (out.length)
            return out;
        const d = doc;
        if (d.format !== SCENE_V3_FORMAT)
            P('format', `expected "${SCENE_V3_FORMAT}"`);
        if (typeof d.version === 'number' && d.version > SCENE_V3_VERSION)
            P('version', `version ${d.version} needs a newer motionary`);
        else if (d.version !== SCENE_V3_VERSION)
            P('version', `expected ${SCENE_V3_VERSION}${d.version === 2 ? ' (a v2 document: migrateToSceneV3 / npx motionary migrate --to 16)' : ''}`);
        for (const k of Object.keys(d))
            if (!DOC_KEYS.has(k))
                P(k, 'unknown key');
        // document-level fields follow the v2 rules
        const head = { format: 'motionary-scene', version: 2, layers: [] };
        for (const k of ['name', 'duration', 'loop', 'seed', 'tokens', 'source', 'meta'])
            if (d[k] !== undefined)
                head[k] = d[k];
        out.push(...validateSceneV2(head));
        if (!Array.isArray(d.layers)) {
            P('layers', 'expected an array');
            return out;
        }
        const tokens = isObj(d.tokens) ? d.tokens : undefined;
        const comps = isObj(d.components) ? d.components : {};
        let count = 0;
        const walk = (layers, at, depth, ids) => {
            // track / group layers of one level are checked together by the v2 validator (sibling group parents)
            const tg = [], idx = [];
            const sibling = new Map();
            for (const l of layers)
                if (isObj(l) && typeof l.id === 'string')
                    sibling.set(l.id, l);
            layers.forEach((l, i) => {
                const lp = `${at}[${i}]`;
                if (++count > L.layers) {
                    if (count === L.layers + 1)
                        P(at, `more than ${L.layers} layers`);
                    return;
                }
                if (!isObj(l)) {
                    P(lp, 'expected an object');
                    return;
                }
                if (typeof l.id === 'string' && l.id) {
                    if (ids.has(l.id))
                        P(`${lp}.id`, `duplicate layer id "${l.id}"`);
                    else
                        ids.set(l.id, l);
                }
                if (l.parent !== undefined) {
                    const p = sibling.get(l.parent);
                    if (!p)
                        P(`${lp}.parent`, `no layer "${l.parent}" at this level`);
                    else if (p.type !== 'group')
                        P(`${lp}.parent`, `"${l.parent}" is not a group`);
                }
                if (l.type === 'track' || l.type === 'group') {
                    tg.push(l);
                    idx.push(i);
                    return;
                }
                const base = (keys) => {
                    for (const k of Object.keys(l))
                        if (!keys.has(k))
                            P(`${lp}.${k}`, 'unknown key');
                    if (!str(l.id, L.idLength) || !l.id)
                        P(`${lp}.id`, `expected a non-empty string (≤ ${L.idLength})`);
                    if (l.name !== undefined && !str(l.name))
                        P(`${lp}.name`, 'expected a string');
                    for (const f of ['locked', 'muted', 'solo'])
                        if (l[f] !== undefined && typeof l[f] !== 'boolean')
                            P(`${lp}.${f}`, 'expected a boolean');
                    if (l.start !== undefined && !num(l.start))
                        P(`${lp}.start`, `expected a number of ms in 0–${L.time}`);
                };
                if (l.type === 'comp') {
                    base(COMP_KEYS);
                    if (l.duration !== undefined && !num(l.duration))
                        P(`${lp}.duration`, `expected a number of ms in 0–${L.time}`);
                    if (l.timeRemap !== undefined) {
                        const r = l.timeRemap;
                        if (!isObj(r) || Object.keys(r).some((k) => k !== 'offset' && k !== 'rate'))
                            P(`${lp}.timeRemap`, 'expected { offset?, rate? }');
                        else {
                            if (r.offset !== undefined && !num(r.offset))
                                P(`${lp}.timeRemap.offset`, `expected a number of ms in 0–${L.time}`);
                            if (r.rate !== undefined && !(num(r.rate, 0, L.rate) && r.rate > 0))
                                P(`${lp}.timeRemap.rate`, `expected a number in (0, ${L.rate}]`);
                        }
                    }
                    if (!Array.isArray(l.layers)) {
                        P(`${lp}.layers`, 'expected an array');
                        return;
                    }
                    if (depth + 1 > L.compDepth) {
                        P(`${lp}.layers`, `compositions nested deeper than ${L.compDepth}`);
                        return;
                    }
                    walk(l.layers, `${lp}.layers`, depth + 1, ids);
                    return;
                }
                if (l.type === 'component') {
                    base(INST_KEYS);
                    if (l.target !== undefined && (!str(l.target, 512) || !l.target))
                        P(`${lp}.target`, 'expected a selector string');
                    const def = typeof l.ref === 'string' && Object.prototype.hasOwnProperty.call(comps, l.ref) ? comps[l.ref] : undefined;
                    if (!str(l.ref, L.idLength) || !l.ref)
                        P(`${lp}.ref`, 'expected a component id');
                    else if (!def)
                        P(`${lp}.ref`, `unknown component "${l.ref}"`);
                    if (l.overrides !== undefined) {
                        if (!isObj(l.overrides)) {
                            P(`${lp}.overrides`, 'expected an object');
                            return;
                        }
                        const known = new Set(def ? treeIds(def.layers) : []);
                        for (const [id, o] of Object.entries(l.overrides)) {
                            const op = `${lp}.overrides.${id}`;
                            if (def && !known.has(id))
                                P(op, `no layer "${id}" in component "${l.ref}"`);
                            if (!isObj(o)) {
                                P(op, 'expected { target?, muted?, props? }');
                                continue;
                            }
                            for (const k of Object.keys(o))
                                if (!['target', 'muted', 'props'].includes(k))
                                    P(`${op}.${k}`, 'unknown key');
                            if (o.target !== undefined && (!str(o.target, 512) || !o.target))
                                P(`${op}.target`, 'expected a selector string');
                            if (o.muted !== undefined && typeof o.muted !== 'boolean')
                                P(`${op}.muted`, 'expected a boolean');
                            if (o.props !== undefined && !(isObj(o.props) && Object.values(o.props).every((v) => (typeof v === 'number' && Number.isFinite(v)) || str(v))))
                                P(`${op}.props`, 'expected { name: number | string }');
                        }
                    }
                    return;
                }
                P(`${lp}.type`, 'expected "track", "group", "comp" or "component"');
            });
            if (tg.length) {
                const probe = { format: 'motionary-scene', version: 2, layers: tg.map((l) => { if (l.parent === undefined || sibling.get(l.parent)?.type === 'group')
                        return l; const { parent, ...rest } = l; return rest; }) };
                if (tokens)
                    probe.tokens = tokens;
                for (const p of validateSceneV2(probe)) {
                    if (/^tokens/.test(p.path))
                        continue; // reported once at the top
                    if (/duplicate layer id/.test(p.message))
                        continue; // reported across the whole tree above
                    P(p.path.replace(/^layers\[(\d+)\]/, (_, n) => `${at}[${idx[+n]}]`), p.message);
                }
            }
        };
        walk(d.layers, 'layers', 0, new Map());
        if (d.components !== undefined) {
            if (!isObj(d.components))
                P('components', 'expected an object');
            else {
                const keys = Object.keys(comps);
                if (keys.length > L.components)
                    P('components', `more than ${L.components} components`);
                for (const k of keys) {
                    const c = comps[k], cp = `components.${k}`;
                    if (!/^[A-Za-z0-9_.-]{1,128}$/.test(k))
                        P(cp, 'invalid component id');
                    if (!isObj(c) || !Array.isArray(c.layers)) {
                        P(cp, 'expected { name?, layers: [] }');
                        continue;
                    }
                    for (const f of Object.keys(c))
                        if (f !== 'name' && f !== 'layers')
                            P(`${cp}.${f}`, 'unknown key');
                    if (c.name !== undefined && !str(c.name))
                        P(`${cp}.name`, 'expected a string');
                    walk(c.layers, `${cp}.layers`, 0, new Map());
                }
                // cycles: a component that (through nested comps / instances) instantiates itself
                const state = new Map();
                const visit = (k, trail) => {
                    if (state.get(k) === 2)
                        return;
                    if (state.get(k) === 1) {
                        P(`components.${k}`, `component cycle (${[...trail, k].join(' → ')})`);
                        return;
                    }
                    state.set(k, 1);
                    for (const r of treeRefs(comps[k] && comps[k].layers))
                        if (Object.prototype.hasOwnProperty.call(comps, r))
                            visit(r, [...trail, k]);
                    state.set(k, 2);
                };
                for (const k of keys)
                    visit(k, []);
            }
        }
        if (d.variants !== undefined) {
            if (!Array.isArray(d.variants))
                P('variants', 'expected an array');
            else
                for (const m of validateVariants({ layers: treeIds(d.layers).map((id) => ({ id })), meta: { [VARIANTS_META_KEY]: d.variants } })) {
                    const i = m.indexOf(': ');
                    P(i > 0 ? m.slice(0, i) : 'variants', i > 0 ? m.slice(i + 2) : m);
                }
        }
    }
    catch (e) {
        P('', `could not validate (${e?.message || e})`);
    }
    return out;
}
/** Whether `input` is a valid Scene v3 document. */
const isSceneV3 = (input) => validateSceneV3(input).length === 0;
function normLayer(l) {
    if (l.type === 'track' || l.type === 'group')
        return normalizeSceneV2({ layers: [l] }).layers[0];
    const n = { id: l.id, type: l.type };
    if (l.name !== undefined)
        n.name = l.name;
    if (l.parent !== undefined)
        n.parent = l.parent;
    for (const f of ['locked', 'muted', 'solo'])
        if (l[f])
            n[f] = true;
    if (l.type === 'comp') {
        if (l.start !== undefined)
            n.start = l.start;
        if (l.duration !== undefined)
            n.duration = l.duration;
        if (l.timeRemap !== undefined)
            n.timeRemap = sortKeys(clone(l.timeRemap));
        n.layers = (l.layers || []).map(normLayer);
    }
    else {
        if (l.target !== undefined)
            n.target = l.target;
        if (l.start !== undefined)
            n.start = l.start;
        n.ref = l.ref;
        if (l.overrides !== undefined) {
            const o = {};
            for (const k of Object.keys(l.overrides).sort()) {
                const v = sortKeys(clone(l.overrides[k]));
                if (v.props)
                    v.props = sortKeys(v.props);
                o[k] = v;
            }
            n.overrides = o;
        }
    }
    return n;
}
/** Canonical form of a valid v3 document: fixed key order, v2 canonical track / group layers at every level. */
function normalizeSceneV3(doc) {
    const head = normalizeSceneV2({ ...doc, layers: [] });
    const out = { format: SCENE_V3_FORMAT, version: 3 };
    for (const k of ['name', 'duration', 'loop', 'seed', 'tokens'])
        if (head[k] !== undefined)
            out[k] = head[k];
    out.layers = doc.layers.map(normLayer);
    if (doc.components !== undefined) {
        const c = {};
        for (const k of Object.keys(doc.components).sort()) {
            const d = doc.components[k];
            c[k] = d.name !== undefined ? { name: d.name, layers: d.layers.map(normLayer) } : { layers: d.layers.map(normLayer) };
        }
        out.components = c;
    }
    if (doc.variants !== undefined)
        out.variants = clone(doc.variants);
    if (head.source !== undefined)
        out.source = head.source;
    if (head.meta !== undefined)
        out.meta = head.meta;
    return out;
}
/** Canonical JSON text of a v3 document. */
const serializeSceneV3 = (doc, space = 2) => JSON.stringify(normalizeSceneV3(doc), null, space) + (space ? '\n' : '');
const countKf = (layers) => layers.reduce((n, l) => n + (Array.isArray(l.keyframes) ? l.keyframes.length : 0) + (l.type === 'comp' ? countKf(l.layers || []) : 0), 0);
/**
 * Preview the move of a motion document (Scene v2, or any 13.x format `migrateToSceneV2` reads) to Scene v3.
 * Never throws and never mutates `input`; `report.lossless` / `report.lost` say whether everything carried over.
 */
function migrateToSceneV3(input, o = {}) {
    const report = { from: 'unknown', lossless: false, changes: [], lost: [], warnings: [], stats: { layers: 0, keyframes: 0, variants: 0 } };
    const done = (ok, problems, doc) => {
        if (doc) {
            report.stats = { layers: treeIds(doc.layers).length, keyframes: countKf(doc.layers), variants: (doc.variants || []).length };
        }
        report.lossless = ok && report.lost.length === 0;
        return doc ? { ok, dryRun: true, doc, problems, report } : { ok, dryRun: true, problems, report };
    };
    try {
        let data = input;
        if (typeof input === 'string') {
            if (input.length > L.textBytes)
                return done(false, [{ path: '', message: `text longer than ${L.textBytes} characters` }]);
            try {
                data = JSON.parse(input);
            }
            catch (e) {
                return done(false, [{ path: '', message: `invalid JSON (${e.message})` }]);
            }
        }
        if (isObj(data) && data.format === SCENE_V3_FORMAT && data.version === SCENE_V3_VERSION) {
            report.from = 'motionary-scene@3';
            const p = validateSceneV3(data);
            if (p.length)
                return done(false, p);
            report.changes.push('already scene v3 — normalized only');
            return done(true, [], normalizeSceneV3(data));
        }
        const r = migrateToSceneV2(data, { tokenize: o.tokenize, tokens: o.tokens });
        report.from = r.report.from;
        report.lost.push(...r.report.lost);
        report.warnings.push(...r.report.warnings);
        if (!r.ok || !r.doc)
            return done(false, r.problems);
        if (r.report.from !== 'motionary-scene@2')
            report.changes.push(...r.report.changes);
        const v2 = clone(r.doc);
        const doc = { ...v2, version: 3 };
        report.changes.push('version 2 → 3 (format motionary-scene; layers, groups, tokens, seed, loop and component bindings carried over unchanged)');
        if (isObj(v2.meta) && Object.prototype.hasOwnProperty.call(v2.meta, VARIANTS_META_KEY)) {
            const meta = v2.meta, v = meta[VARIANTS_META_KEY];
            if (Array.isArray(v)) {
                doc.variants = v;
                const { [VARIANTS_META_KEY]: _, ...rest } = meta;
                if (Object.keys(rest).length)
                    doc.meta = rest;
                else
                    delete doc.meta;
                report.changes.push(`${v.length} breakpoint variant(s) moved from meta["${VARIANTS_META_KEY}"] to "variants"`);
            }
            else
                report.lost.push({ path: `meta["${VARIANTS_META_KEY}"]`, message: 'not an array — left in meta; Scene v3 reads variants only from "variants"' });
        }
        const out = normalizeSceneV3(doc);
        const p = validateSceneV3(out);
        return p.length ? done(false, p, out) : done(true, [], out);
    }
    catch (e) {
        return done(false, [{ path: '', message: `could not migrate (${e?.message || e})` }]);
    }
}
/**
 * Read a v3 document as Scene v2 (for 15.x consumers). Compositions become groups with their start / time remap
 * baked into keyframe times; component instances are expanded (`<instance>/<layer>` ids, targets scoped under the
 * instance target, overrides applied); variants go back to meta. Every such step is listed in `lost`.
 */
function sceneV3ToV2(doc) {
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
            if (ctx.depth > L.compDepth + 4) {
                lost.push({ path: lp, message: 'nested too deep — dropped' });
                return;
            }
            if (l.type === 'comp') {
                layers.push({ id, type: 'group', ...flags });
                const start = num(l.start) ? l.start : 0, r = l.timeRemap || {}, off = num(r.offset) ? r.offset : 0, rate = num(r.rate, 0, L.rate) && r.rate > 0 ? r.rate : 1;
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
            out.meta = { ...(out.meta || {}), [VARIANTS_META_KEY]: clone(doc.variants) };
        else
            lost.push({ path: 'variants', message: 'meta is not an object — variants cannot be stored in v2' });
    }
    return { doc: normalizeSceneV2(out), lost };
}

export { DEPRECATIONS_V16, SCENE_V3_FORMAT, SCENE_V3_LIMITS, SCENE_V3_STATUS, SCENE_V3_VERSION, isSceneV3, migrateToSceneV3, normalizeSceneV3, sceneV3ToV2, serializeSceneV3, validateSceneV3 };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v15.9.0/dist/components/scene-v3-preview.js.map