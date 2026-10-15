import { p as parseEase } from './ease-XN8_0sXu.js';
import { T as TIMELINE_PRESETS } from './core-CC1UXXEC.js';

/**
 * 13.6: the versioned timeline document `motionary-timeline` v1 — layers (tracks
 * and groups, with lock / mute / solo), keyframes with per-segment easing, a
 * random seed and free-form `meta`. Pure (no DOM): validate, parse (throws on
 * malformed input, never evaluates it), serialize (canonical, lossless) and
 * convert from / to `<usa-player>` animation JSON.
 */
const TIMELINE_DOC_FORMAT = 'motionary-timeline';
const TIMELINE_DOC_VERSION = 1;
/** Hard limits a document must stay within (parse rejects anything larger). */
const TIMELINE_DOC_LIMITS = { layers: 1000, keyframes: 100000, props: 64, idLength: 128, stringLength: 2048, time: 1e7, depth: 32, textBytes: 5e6 };
class TimelineDocError extends Error {
    constructor(problems) {
        super(`[motionary] timeline document: ${problems.slice(0, 3).map((p) => `${p.path || '(root)'}: ${p.message}`).join('; ')}${problems.length > 3 ? ` (+${problems.length - 3} more)` : ''}`);
        this.name = 'TimelineDocError';
        this.problems = problems;
    }
}
/** @internal One-problem `TimelineDocError`. */
const docError = (path, message) => new TimelineDocError([{ path, message }]);
/** @internal Round to 1e-4 (no -0); shared by the editor modules. */
const round = (n) => {
    const r = Math.round(n * 1e4) / 1e4;
    return r === 0 ? 0 : r;
};
/** @internal Keyframes sorted by time, stable for equal times. */
const byTime = (ks) => ks.map((k, i) => [k, i]).sort((a, b) => a[0].time - b[0].time || a[1] - b[1]).map(([k]) => k);
const L = TIMELINE_DOC_LIMITS;
const FORBIDDEN = /*#__PURE__*/ new Set(['__proto__', 'constructor', 'prototype']);
const isObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
const DOC_KEYS = /*#__PURE__*/ new Set(['format', 'version', 'name', 'duration', 'seed', 'layers', 'meta']);
const LAYER_KEYS = /*#__PURE__*/ new Set(['id', 'type', 'name', 'parent', 'locked', 'muted', 'solo', 'target', 'keyframes']);
const KF_KEYS = /*#__PURE__*/ new Set(['id', 'time', 'props', 'easing']);
const RANDOM = /random\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)/g;
/** Whether `easing` is one the preview can evaluate (named ease, `cubic-bezier()`, `steps()`). */
function isValidEasing(easing) {
    if (typeof easing !== 'string' || easing.length > 200)
        return false;
    try {
        parseEase(easing);
        return true;
    }
    catch {
        return false;
    }
}
function checkJson(v, path, depth, out) {
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
    if (Array.isArray(v)) {
        v.forEach((x, i) => checkJson(x, `${path}[${i}]`, depth + 1, out));
        return;
    }
    if (isObj(v)) {
        for (const k of Object.keys(v)) {
            if (FORBIDDEN.has(k))
                out.push({ path: `${path}.${k}`, message: 'forbidden key' });
            else
                checkJson(v[k], `${path}.${k}`, depth + 1, out);
        }
        return;
    }
    out.push({ path, message: `not JSON (${typeof v})` });
}
const str = (v, max = L.stringLength) => typeof v === 'string' && v.length <= max;
/** Every problem with `doc` (an object, e.g. fresh from `JSON.parse`). Never throws; `[]` = valid. */
function validateTimelineDoc(doc) {
    const out = [];
    const P = (path, message) => out.push({ path, message });
    if (!isObj(doc))
        return [{ path: '', message: 'expected an object' }];
    if (doc.format !== TIMELINE_DOC_FORMAT)
        P('format', `expected "${TIMELINE_DOC_FORMAT}"`);
    if (typeof doc.version === 'number' && doc.version > TIMELINE_DOC_VERSION)
        P('version', `version ${doc.version} needs a newer motionary`);
    else if (doc.version !== TIMELINE_DOC_VERSION)
        P('version', `expected ${TIMELINE_DOC_VERSION}`);
    for (const k of Object.keys(doc))
        if (!DOC_KEYS.has(k))
            P(k, 'unknown key');
    if (doc.name !== undefined && !str(doc.name))
        P('name', 'expected a string');
    if (doc.duration !== undefined && !(typeof doc.duration === 'number' && Number.isFinite(doc.duration) && doc.duration >= 0 && doc.duration <= L.time))
        P('duration', `expected a number of ms in 0–${L.time}`);
    if (doc.seed !== undefined && !(Number.isInteger(doc.seed) && doc.seed >= 0 && doc.seed <= 0xffffffff))
        P('seed', 'expected an unsigned 32-bit integer');
    if (doc.meta !== undefined)
        checkJson(doc.meta, 'meta', 1, out);
    if (!Array.isArray(doc.layers)) {
        P('layers', 'expected an array');
        return out;
    }
    if (doc.layers.length > L.layers) {
        P('layers', `more than ${L.layers} layers`);
        return out;
    }
    const ids = new Map();
    const kfIds = new Set();
    let kfCount = 0;
    doc.layers.forEach((l, i) => {
        const at = `layers[${i}]`;
        if (!isObj(l)) {
            P(at, 'expected an object');
            return;
        }
        for (const k of Object.keys(l))
            if (!LAYER_KEYS.has(k))
                P(`${at}.${k}`, 'unknown key');
        if (!str(l.id, L.idLength) || !l.id)
            P(`${at}.id`, `expected a non-empty string (≤ ${L.idLength})`);
        else if (FORBIDDEN.has(l.id))
            P(`${at}.id`, 'forbidden id');
        else if (ids.has(l.id))
            P(`${at}.id`, `duplicate layer id "${l.id}"`);
        else
            ids.set(l.id, l);
        if (l.type !== 'track' && l.type !== 'group')
            P(`${at}.type`, 'expected "track" or "group"');
        if (l.name !== undefined && !str(l.name))
            P(`${at}.name`, 'expected a string');
        for (const f of ['locked', 'muted', 'solo'])
            if (l[f] !== undefined && typeof l[f] !== 'boolean')
                P(`${at}.${f}`, 'expected a boolean');
        if (l.parent !== undefined && !str(l.parent, L.idLength))
            P(`${at}.parent`, 'expected a layer id');
        if (l.type === 'group') {
            if (l.target !== undefined)
                P(`${at}.target`, 'groups have no target');
            if (l.keyframes !== undefined)
                P(`${at}.keyframes`, 'groups have no keyframes');
            return;
        }
        if (l.target !== undefined && (!str(l.target, 512) || !l.target))
            P(`${at}.target`, 'expected a selector string');
        if (l.keyframes === undefined)
            return;
        if (!Array.isArray(l.keyframes)) {
            P(`${at}.keyframes`, 'expected an array');
            return;
        }
        kfCount += l.keyframes.length;
        l.keyframes.forEach((k, j) => {
            const kp = `${at}.keyframes[${j}]`;
            if (!isObj(k)) {
                P(kp, 'expected an object');
                return;
            }
            for (const key of Object.keys(k))
                if (!KF_KEYS.has(key))
                    P(`${kp}.${key}`, 'unknown key');
            if (!str(k.id, L.idLength) || !k.id)
                P(`${kp}.id`, 'expected a non-empty string');
            else if (kfIds.has(k.id))
                P(`${kp}.id`, `duplicate keyframe id "${k.id}"`);
            else
                kfIds.add(k.id);
            if (!(typeof k.time === 'number' && Number.isFinite(k.time) && k.time >= 0 && k.time <= L.time))
                P(`${kp}.time`, `expected a number of ms in 0–${L.time}`);
            if (k.easing !== undefined && !isValidEasing(k.easing))
                P(`${kp}.easing`, `unknown easing ${JSON.stringify(String(k.easing).slice(0, 60))}`);
            if (!isObj(k.props)) {
                P(`${kp}.props`, 'expected an object');
                return;
            }
            const keys = Object.keys(k.props);
            if (keys.length > L.props)
                P(`${kp}.props`, `more than ${L.props} properties`);
            for (const name of keys) {
                const v = k.props[name];
                if (FORBIDDEN.has(name) || !/^(--[\w-]+|[a-zA-Z][\w-]*)$/.test(name))
                    P(`${kp}.props.${name}`, 'invalid property name');
                else if (!(typeof v === 'number' ? Number.isFinite(v) : str(v)))
                    P(`${kp}.props.${name}`, 'expected a finite number or a string');
            }
        });
    });
    if (kfCount > L.keyframes)
        P('layers', `more than ${L.keyframes} keyframes`);
    doc.layers.forEach((l, i) => {
        if (!isObj(l) || l.parent === undefined || typeof l.parent !== 'string')
            return;
        const p = ids.get(l.parent);
        if (!p)
            P(`layers[${i}].parent`, `no layer "${l.parent}"`);
        else if (p.type !== 'group')
            P(`layers[${i}].parent`, `"${l.parent}" is not a group`);
        else {
            const seen = new Set([l.id]);
            for (let g = p; g; g = g.parent !== undefined ? ids.get(g.parent) : undefined) {
                if (seen.has(g.id)) {
                    P(`layers[${i}].parent`, 'group cycle');
                    break;
                }
                seen.add(g.id);
            }
        }
    });
    return out;
}
const sortKeys = (o) => {
    const r = {};
    for (const k of Object.keys(o).sort())
        r[k] = o[k];
    return r;
};
/** @internal */
const cloneJson = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
/** The canonical form of a valid document: fixed key order, keyframes sorted by time (stable), prop names sorted, defaults omitted. */
function normalizeTimelineDoc(doc) {
    const out = { format: TIMELINE_DOC_FORMAT, version: 1 };
    if (doc.name !== undefined)
        out.name = doc.name;
    if (doc.duration !== undefined)
        out.duration = doc.duration;
    if (doc.seed !== undefined)
        out.seed = doc.seed;
    out.layers = doc.layers.map((l) => {
        const n = { id: l.id, type: l.type };
        if (l.name !== undefined)
            n.name = l.name;
        if (l.parent !== undefined)
            n.parent = l.parent;
        if (l.locked)
            n.locked = true;
        if (l.muted)
            n.muted = true;
        if (l.solo)
            n.solo = true;
        if (l.type === 'track') {
            if (l.target !== undefined)
                n.target = l.target;
            n.keyframes = byTime(l.keyframes || []).map((k) => {
                const kf = { id: k.id, time: k.time, props: sortKeys({ ...k.props }) };
                if (k.easing !== undefined && k.easing !== 'linear')
                    kf.easing = k.easing;
                return kf;
            });
        }
        return n;
    });
    if (doc.meta !== undefined)
        out.meta = cloneJson(doc.meta);
    return out;
}
/**
 * Parse a document (JSON text or object): checks size and shape, throws a
 * `TimelineDocError` listing every problem, returns the canonical form.
 */
function parseTimelineDoc(input) {
    let data = input;
    if (typeof input === 'string') {
        if (input.length > L.textBytes)
            throw docError('', `text longer than ${L.textBytes} characters`);
        try {
            data = JSON.parse(input);
        }
        catch (e) {
            throw docError('', `invalid JSON (${e.message})`);
        }
    }
    const problems = validateTimelineDoc(data);
    if (problems.length)
        throw new TimelineDocError(problems);
    return normalizeTimelineDoc(data);
}
/** Canonical JSON text: `parseTimelineDoc(serializeTimelineDoc(d))` deep-equals `parseTimelineDoc(d)`, and serializing that again gives the same text. */
function serializeTimelineDoc(doc, space = 2) {
    return JSON.stringify(normalizeTimelineDoc(doc), null, space) + (space ? '\n' : '');
}
/** An empty document. */
function createTimelineDoc(init = {}) {
    return normalizeTimelineDoc({ ...init, layers: init.layers || [] });
}
// --- mute / solo / lock -------------------------------------------------------
const chain = (doc, id) => {
    const by = new Map(doc.layers.map((l) => [l.id, l]));
    const out = [];
    for (let l = by.get(id); l && out.length <= doc.layers.length; l = l.parent !== undefined ? by.get(l.parent) : undefined)
        out.push(l);
    return out;
};
/** A layer is locked when it or any group above it is locked. */
const isLayerLocked = (doc, id) => chain(doc, id).some((l) => l.locked);
/** Whether a layer plays: not muted (nor any group above it) and, when any layer is solo, it or a group above it is solo. */
function isLayerActive(doc, id) {
    const c = chain(doc, id);
    if (!c.length || c.some((l) => l.muted))
        return false;
    return !doc.layers.some((l) => l.solo) || c.some((l) => l.solo);
}
/** Total length: `duration` or the last keyframe. */
const timelineDocDuration = (doc) => doc.duration ?? doc.layers.reduce((m, l) => (l.keyframes || []).reduce((n, k) => Math.max(n, k.time), m), 0);
// --- seeded randomness ---------------------------------------------------------
/** mulberry32: a deterministic PRNG, `() => [0, 1)`. */
function createSeededRandom(seed = 1) {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
const hash = (s, seed) => {
    let h = (seed ^ 0x811c9dc5) >>> 0;
    for (let i = 0; i < s.length; i++)
        h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
    return h;
};
/**
 * Replace `random(a, b)` in a value with a number that depends only on the
 * seed and `key` (layer / keyframe / property), never on call order.
 */
function resolveRandom(value, seed, key) {
    if (typeof value !== 'string' || !value.includes('random('))
        return value;
    let i = 0;
    const s = value.replace(RANDOM, (_, a, b) => String(round(+a + (+b - +a) * createSeededRandom(hash(`${key}#${i++}`, seed))())));
    return /^-?\d+(\.\d+)?$/.test(s) ? Number(s) : s;
}
// --- <usa-player> animation JSON ------------------------------------------------
/**
 * Export the playable part as `<usa-player>` animation JSON (format
 * `use-scroll-animate/animation` v1): one track per active track layer,
 * `random()` resolved with the seed. Lossy by design (groups, locks and ids
 * are editor state) — save `serializeTimelineDoc` for a lossless copy.
 */
function timelineDocToAnimation(doc) {
    const d = normalizeTimelineDoc(doc);
    const seed = d.seed ?? 1;
    const tracks = [];
    for (const l of d.layers) {
        if (l.type !== 'track' || !l.keyframes?.length || !isLayerActive(d, l.id))
            continue;
        const ks = l.keyframes;
        const start = ks[0].time;
        const duration = Math.max(1, ks[ks.length - 1].time - start);
        const keyframes = ks.map((k) => {
            const f = {};
            for (const [p, v] of Object.entries(k.props))
                f[p] = resolveRandom(v, seed, `${l.id}/${k.id}/${p}`);
            f.offset = ks.length > 1 ? round((k.time - start) / duration) : 0;
            if (k.easing && k.easing !== 'linear')
                f.easing = k.easing;
            return f;
        });
        if (keyframes.length === 1)
            keyframes.push({ ...keyframes[0], offset: 1 });
        const t = { target: l.target || ':scope', start, duration, keyframes, easing: 'linear' };
        if (l.name)
            t.label = l.name;
        tracks.push(t);
    }
    const out = { format: 'use-scroll-animate/animation', version: 1, name: d.name || 'timeline', tracks };
    if (d.duration !== undefined)
        out.duration = d.duration;
    return out;
}
/**
 * Import `<usa-player>` animation JSON as a timeline document: one track layer
 * per keyframe / preset track (absolute keyframe times). Effect tracks have no
 * keyframes and are reported in `skipped`.
 */
function timelineDocFromAnimation(input) {
    const a = typeof input === 'string' ? JSON.parse(input) : input;
    if (!isObj(a) || !Array.isArray(a.tracks))
        throw docError('tracks', 'expected an animation with "tracks"');
    if (a.format !== undefined && a.format !== 'use-scroll-animate/animation')
        throw docError('format', `unsupported animation format "${String(a.format)}"`);
    const layers = [];
    const skipped = [];
    a.tracks.forEach((t, i) => {
        const frames = Array.isArray(t?.keyframes) ? t.keyframes : typeof t?.preset === 'string' ? TIMELINE_PRESETS[t.preset] : undefined;
        if (!frames?.length) {
            skipped.push(i);
            return;
        }
        const start = Math.max(0, Number(t.start) || 0);
        const duration = Math.max(1, Number(t.duration) || 600);
        const n = frames.length;
        const id = `t${i + 1}`;
        const keyframes = frames.map((f, j) => {
            const props = {};
            for (const [k, v] of Object.entries(f || {}))
                if (k !== 'offset' && k !== 'easing' && k !== 'composite' && (typeof v === 'number' || typeof v === 'string') && !FORBIDDEN.has(k))
                    props[k] = v;
            const off = typeof f?.offset === 'number' ? f.offset : n > 1 ? j / (n - 1) : 0;
            const kf = { id: `${id}k${j + 1}`, time: round(start + off * duration), props };
            const e = typeof f?.easing === 'string' ? f.easing : j < n - 1 && typeof t.easing === 'string' ? t.easing : undefined;
            if (e && isValidEasing(e))
                kf.easing = e;
            return kf;
        });
        const layer = { id, type: 'track', target: typeof t.target === 'string' && t.target ? t.target : ':scope', keyframes };
        if (typeof t.label === 'string')
            layer.name = t.label;
        layers.push(layer);
    });
    const doc = { format: TIMELINE_DOC_FORMAT, version: 1, name: typeof a.name === 'string' ? a.name : undefined, layers };
    if (typeof a.duration === 'number' && a.duration >= 0)
        doc.duration = a.duration;
    return { doc: parseTimelineDoc(doc), skipped };
}

export { TIMELINE_DOC_FORMAT as T, timelineDocDuration as a, byTime as b, cloneJson as c, docError as d, TimelineDocError as e, isLayerLocked as f, round as g, isLayerActive as h, isValidEasing as i, createTimelineDoc as j, TIMELINE_DOC_LIMITS as k, TIMELINE_DOC_VERSION as l, createSeededRandom as m, normalizeTimelineDoc as n, timelineDocToAnimation as o, parseTimelineDoc as p, resolveRandom as r, serializeTimelineDoc as s, timelineDocFromAnimation as t, validateTimelineDoc as v };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v16.2.0/dist/chunks/format-BSTz6pm_.js.map