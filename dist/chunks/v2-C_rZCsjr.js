import { v as validateTimelineDoc, i as isValidEasing } from './format-BSTz6pm_.js';
import { t as timelineDocToScene, a as timelineDocFromScene } from './scene-C7-PUIZK.js';
import { MOTION_TOKENS } from '../components/tokens.js';

/**
 * Scene Format v2 — `motionary-scene` version 2, the official motion document
 * since 14.0 (`motionary/scene`; drafted in 13.9). It unifies the three shapes motion data has in 13.x:
 *
 * - the Timeline editor document (`motionary-timeline` v1, 13.6) — layers, groups,
 *   lock / mute / solo, keyframes with per-segment easing, seed, meta;
 * - `<usa-player>` animation JSON (`use-scroll-animate/animation` v1, and the
 *   older `use-scroll-animate/playground` state) — keyframe, preset and effect tracks;
 * - component motion props and motion tokens — a layer can bind a `usa-*` element's
 *   motion props, and any value may reference a token as `"{duration.fast}"`
 *   (W3C Design Tokens alias syntax, as `importDesignTokens` already reads).
 *
 * 14.0: `<usa-player>` plays it natively and the Timeline editor reads / writes it;
 * `sceneV2ToTimeline` / `sceneV2ToAnimation` convert back for 13.x consumers.
 * Pure (no DOM), never throws on bad input (`validateSceneV2`, `migrateToSceneV2`
 * report problems instead), never evaluates anything.
 */
const SCENE_V2_FORMAT = 'motionary-scene';
const SCENE_V2_VERSION = 2;
/** 14.0: the official motion document (was 'draft' in 13.9). */
const SCENE_V2_STATUS = 'stable';
const SCENE_V2_LIMITS = { layers: 1000, keyframes: 100000, props: 64, idLength: 128, stringLength: 2048, time: 1e7, depth: 32, textBytes: 5e6 };
const L = SCENE_V2_LIMITS;
const FORBIDDEN = /*#__PURE__*/ new Set(['__proto__', 'constructor', 'prototype']);
const DOC_KEYS = /*#__PURE__*/ new Set(['format', 'version', 'name', 'duration', 'loop', 'seed', 'tokens', 'layers', 'source', 'meta']);
const LAYER_KEYS = /*#__PURE__*/ new Set(['id', 'type', 'name', 'parent', 'locked', 'muted', 'solo', 'target', 'start', 'duration', 'easing', 'keyframes', 'preset', 'effect', 'options', 'component']);
const KF_KEYS = /*#__PURE__*/ new Set(['id', 'time', 'props', 'easing', 'composite']);
const TOKEN_GROUPS = ['duration', 'easing', 'spring'];
const TOKEN_REF = /^\{(duration|easing|spring)\.([A-Za-z0-9_-]+)\}$/;
const PROP_NAME = /^(--[\w-]+|[a-zA-Z][\w-]*)$/;
const TAG = /^[a-z][a-z0-9]*-[a-z0-9-]*$/;
const isObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
const str = (v, max = L.stringLength) => typeof v === 'string' && v.length <= max;
const num = (v, min = 0, max = L.time) => typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max;
const round = (n) => {
    const r = Math.round(n * 1e6) / 1e6;
    return r === 0 ? 0 : r;
};
const clone = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
/** Whether `v` is a token reference (`"{duration.fast}"`). */
const isTokenRef = (v) => typeof v === 'string' && TOKEN_REF.test(v);
function checkJson(v, path, depth, out, seen) {
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
        v.forEach((x, i) => checkJson(x, `${path}[${i}]`, depth + 1, out, seen));
    else
        for (const k of Object.keys(v)) {
            if (FORBIDDEN.has(k))
                out.push({ path: `${path}.${k}`, message: 'forbidden key' });
            else
                checkJson(v[k], `${path}.${k}`, depth + 1, out, seen);
        }
    seen.delete(v);
}
function checkValue(v, at, P, tokens) {
    if (typeof v === 'number') {
        if (!Number.isFinite(v))
            P(at, 'expected a finite number');
        return;
    }
    if (!str(v)) {
        P(at, 'expected a finite number or a string');
        return;
    }
    const m = TOKEN_REF.exec(v);
    if (m && !hasToken(tokens, m[1], m[2]))
        P(at, `unknown token ${v}`);
    else if (!m && v.startsWith('{') && v.endsWith('}'))
        P(at, `malformed token reference ${JSON.stringify(v.slice(0, 60))} (expected "{duration|easing|spring.name}")`);
}
const hasToken = (tokens, g, n) => Object.prototype.hasOwnProperty.call((tokens && tokens[g]) || {}, n) || Object.prototype.hasOwnProperty.call(MOTION_TOKENS[g], n);
/**
 * Every problem with a scene v2 document (an object or JSON text). Never throws —
 * not on wrong types, circular objects, or invalid JSON; `[]` means valid.
 */
function validateSceneV2(input) {
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
    const out = [];
    const P = (path, message) => { out.push({ path, message }); };
    try {
        if (!isObj(doc))
            return [{ path: '', message: 'expected an object' }];
        checkJson(doc, '', 0, out, new Set());
        if (out.length)
            return out;
        const d = doc;
        if (d.format !== SCENE_V2_FORMAT)
            P('format', `expected "${SCENE_V2_FORMAT}"`);
        if (typeof d.version === 'number' && d.version > SCENE_V2_VERSION)
            P('version', `version ${d.version} needs a newer motionary`);
        else if (d.version !== SCENE_V2_VERSION)
            P('version', `expected ${SCENE_V2_VERSION}${d.version === 1 ? ' (a v1 document: run `npx motionary migrate`)' : ''}`);
        for (const k of Object.keys(d))
            if (!DOC_KEYS.has(k))
                P(k, 'unknown key');
        if (d.name !== undefined && !str(d.name))
            P('name', 'expected a string');
        if (d.duration !== undefined && !num(d.duration))
            P('duration', `expected a number of ms in 0–${L.time}`);
        if (d.loop !== undefined && typeof d.loop !== 'boolean')
            P('loop', 'expected a boolean');
        if (d.seed !== undefined && !(Number.isInteger(d.seed) && d.seed >= 0 && d.seed <= 0xffffffff))
            P('seed', 'expected an unsigned 32-bit integer');
        if (d.source !== undefined && !(isObj(d.source) && str(d.source.format, 200) && (d.source.version === undefined || Number.isInteger(d.source.version))))
            P('source', 'expected { format: string, version?: integer }');
        if (d.tokens !== undefined) {
            if (!isObj(d.tokens))
                P('tokens', 'expected an object');
            else
                for (const g of Object.keys(d.tokens)) {
                    if (!TOKEN_GROUPS.includes(g)) {
                        P(`tokens.${g}`, 'unknown token group (duration | easing | spring)');
                        continue;
                    }
                    const grp = d.tokens[g];
                    if (!isObj(grp)) {
                        P(`tokens.${g}`, 'expected an object');
                        continue;
                    }
                    for (const [n, v] of Object.entries(grp)) {
                        const at = `tokens.${g}.${n}`;
                        if (!/^[A-Za-z0-9_-]+$/.test(n))
                            P(at, 'invalid token name');
                        else if (g === 'duration' && !num(v))
                            P(at, 'expected ms');
                        else if (g === 'easing' && !isValidEasing(v))
                            P(at, 'expected an easing');
                        else if (g === 'spring' && !(isObj(v) && num(v.stiffness, 0, 1e6) && num(v.damping, 0, 1e6) && num(v.mass, 0, 1e6)))
                            P(at, 'expected { stiffness, damping, mass }');
                    }
                }
        }
        if (!Array.isArray(d.layers)) {
            P('layers', 'expected an array');
            return out;
        }
        if (d.layers.length > L.layers) {
            P('layers', `more than ${L.layers} layers`);
            return out;
        }
        const tokens = isObj(d.tokens) ? d.tokens : undefined;
        const ids = new Map();
        const kfIds = new Set();
        let kfCount = 0;
        d.layers.forEach((l, i) => {
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
                for (const f of ['target', 'start', 'duration', 'easing', 'keyframes', 'preset', 'effect', 'options', 'component'])
                    if (l[f] !== undefined)
                        P(`${at}.${f}`, `groups have no ${f}`);
                return;
            }
            if (l.target !== undefined && (!str(l.target, 512) || !l.target))
                P(`${at}.target`, 'expected a selector string');
            if (l.start !== undefined && !num(l.start))
                P(`${at}.start`, `expected a number of ms in 0–${L.time}`);
            if (l.duration !== undefined && !num(l.duration))
                P(`${at}.duration`, `expected a number of ms in 0–${L.time}`);
            if (l.easing !== undefined && !(isTokenRef(l.easing) ? hasToken(tokens, 'easing', l.easing.slice(8, -1)) : isValidEasing(l.easing)))
                P(`${at}.easing`, `unknown easing ${JSON.stringify(String(l.easing).slice(0, 60))}`);
            const kinds = ['keyframes', 'preset', 'effect'].filter((f) => l[f] !== undefined);
            if (kinds.length > 1)
                P(at, `a track has one of keyframes / preset / effect, not ${kinds.join(' + ')}`);
            if (l.preset !== undefined && (!str(l.preset, 200) || !l.preset))
                P(`${at}.preset`, 'expected a preset name');
            if (l.effect !== undefined && (!str(l.effect, 200) || !l.effect))
                P(`${at}.effect`, 'expected an effect name');
            if (l.options !== undefined && !isObj(l.options))
                P(`${at}.options`, 'expected an object');
            if (l.component !== undefined) {
                const c = l.component;
                if (!isObj(c))
                    P(`${at}.component`, 'expected { tag, props }');
                else {
                    for (const k of Object.keys(c))
                        if (k !== 'tag' && k !== 'props')
                            P(`${at}.component.${k}`, 'unknown key');
                    if (!str(c.tag, 128) || !TAG.test(c.tag))
                        P(`${at}.component.tag`, 'expected a custom element tag');
                    if (!isObj(c.props))
                        P(`${at}.component.props`, 'expected an object');
                    else
                        for (const [n, v] of Object.entries(c.props)) {
                            if (!PROP_NAME.test(n))
                                P(`${at}.component.props.${n}`, 'invalid property name');
                            else
                                checkValue(v, `${at}.component.props.${n}`, P, tokens);
                        }
                }
            }
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
                if (!num(k.time))
                    P(`${kp}.time`, `expected a number of ms in 0–${L.time}`);
                if (k.easing !== undefined && !(isTokenRef(k.easing) ? hasToken(tokens, 'easing', k.easing.slice(8, -1)) : isValidEasing(k.easing)))
                    P(`${kp}.easing`, `unknown easing ${JSON.stringify(String(k.easing).slice(0, 60))}`);
                if (k.composite !== undefined && !['replace', 'add', 'accumulate'].includes(k.composite))
                    P(`${kp}.composite`, 'expected replace | add | accumulate');
                if (!isObj(k.props)) {
                    P(`${kp}.props`, 'expected an object');
                    return;
                }
                const names = Object.keys(k.props);
                if (names.length > L.props)
                    P(`${kp}.props`, `more than ${L.props} properties`);
                for (const n of names) {
                    if (!PROP_NAME.test(n))
                        P(`${kp}.props.${n}`, 'invalid property name');
                    else
                        checkValue(k.props[n], `${kp}.props.${n}`, P, tokens);
                }
            });
        });
        if (kfCount > L.keyframes)
            P('layers', `more than ${L.keyframes} keyframes`);
        d.layers.forEach((l, i) => {
            if (!isObj(l) || typeof l.parent !== 'string')
                return;
            const p = ids.get(l.parent);
            if (!p)
                P(`layers[${i}].parent`, `no layer "${l.parent}"`);
            else if (p.type !== 'group')
                P(`layers[${i}].parent`, `"${l.parent}" is not a group`);
            else {
                const seen = new Set([l.id]);
                for (let g = p; g; g = typeof g.parent === 'string' ? ids.get(g.parent) : undefined) {
                    if (seen.has(g.id)) {
                        P(`layers[${i}].parent`, 'group cycle');
                        break;
                    }
                    seen.add(g.id);
                }
            }
        });
    }
    catch (e) {
        P('', `could not validate (${e?.message || e})`);
    }
    return out;
}
/** Whether `input` is a valid scene v2 document. */
const isSceneV2 = (input) => validateSceneV2(input).length === 0;
/** Which motion document `input` (object or JSON text) looks like. Never throws. */
function detectMotionFormat(input) {
    let d = input;
    if (typeof input === 'string') {
        try {
            d = JSON.parse(input);
        }
        catch {
            return 'unknown';
        }
    }
    if (!isObj(d))
        return 'unknown';
    if (d.format === SCENE_V2_FORMAT)
        return 'motionary-scene@2';
    if (d.format === 'motionary-timeline')
        return 'motionary-timeline@1';
    if (d.format === 'use-scroll-animate/playground')
        return 'playground';
    if ((d.format === 'use-scroll-animate/animation' || d.format === undefined) && Array.isArray(d.tracks))
        return 'animation@1';
    return 'unknown';
}
// --- normalization ------------------------------------------------------------------
const sortKeys = (o) => {
    const r = {};
    for (const k of Object.keys(o).sort())
        r[k] = o[k];
    return r;
};
/** Canonical form of a valid scene: fixed key order, keyframes sorted by time (stable), prop names sorted, defaults omitted. */
function normalizeSceneV2(doc) {
    const out = { format: SCENE_V2_FORMAT, version: 2 };
    if (doc.name !== undefined)
        out.name = doc.name;
    if (doc.duration !== undefined)
        out.duration = doc.duration;
    if (doc.loop)
        out.loop = true;
    if (doc.seed !== undefined)
        out.seed = doc.seed;
    if (doc.tokens !== undefined) {
        const t = {};
        for (const g of TOKEN_GROUPS)
            if (doc.tokens[g] && Object.keys(doc.tokens[g]).length)
                t[g] = sortKeys(clone(doc.tokens[g]));
        if (Object.keys(t).length)
            out.tokens = t;
    }
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
            for (const f of ['target', 'start', 'duration', 'easing', 'preset', 'effect'])
                if (l[f] !== undefined)
                    n[f] = l[f];
            if (l.options !== undefined)
                n.options = clone(l.options);
            if (l.component !== undefined)
                n.component = { tag: l.component.tag, props: sortKeys({ ...l.component.props }) };
            if (l.keyframes !== undefined) {
                n.keyframes = l.keyframes
                    .map((k, i) => [k, i])
                    .sort((a, b) => a[0].time - b[0].time || a[1] - b[1])
                    .map(([k]) => {
                    const kf = { id: k.id, time: k.time, props: sortKeys({ ...k.props }) };
                    if (k.easing !== undefined && k.easing !== 'linear')
                        kf.easing = k.easing;
                    if (k.composite !== undefined && k.composite !== 'replace')
                        kf.composite = k.composite;
                    return kf;
                });
            }
        }
        return n;
    });
    if (doc.source !== undefined)
        out.source = doc.source.version === undefined ? { format: doc.source.format } : { format: doc.source.format, version: doc.source.version };
    if (doc.meta !== undefined)
        out.meta = clone(doc.meta);
    return out;
}
/** Canonical JSON text of a scene. */
const serializeSceneV2 = (doc, space = 2) => JSON.stringify(normalizeSceneV2(doc), null, space) + (space ? '\n' : '');
// --- converters: v1 → v2 ------------------------------------------------------------
/** `motionary-timeline` v1 → scene v2. Lossless: `sceneV2ToTimeline(sceneV2FromTimeline(d))` equals the canonical `d`. */
function sceneV2FromTimeline(doc) {
    return normalizeSceneV2(timelineDocToScene(doc));
}
function decodePlayground(state) {
    try {
        const b64 = state.replace(/-/g, '+').replace(/_/g, '/');
        const bin = typeof atob === 'function' ? atob(b64) : '';
        const json = decodeURIComponent(Array.from(bin, (c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join(''));
        const t = (JSON.parse(json).t || []);
        return t.map(([preset, start, duration, label], i) => ({ target: `:scope > :nth-child(${i + 1})`, preset, start, duration, label }));
    }
    catch {
        return [];
    }
}
/** Animation JSON v1 (`<usa-player>`) → scene v2: one track layer per player track (keyframe, preset and effect tracks all kept). */
function sceneV2FromAnimation(a, sourceFormat = 'use-scroll-animate/animation') {
    const layers = [];
    a.tracks.forEach((t, i) => {
        const id = `t${i + 1}`;
        const l = { id, type: 'track', target: typeof t.target === 'string' && t.target ? t.target : ':scope' };
        if (typeof t.label === 'string')
            l.name = t.label;
        const start = Math.max(0, Number(t.start) || 0);
        l.start = start;
        if (typeof t.effect === 'string') {
            l.effect = t.effect;
            if (isObj(t.options))
                l.options = clone(t.options);
        }
        else {
            const duration = Math.max(1, Number(t.duration) || 600);
            l.duration = duration;
            if (typeof t.easing === 'string')
                l.easing = t.easing;
            if (Array.isArray(t.keyframes)) {
                const n = t.keyframes.length;
                l.keyframes = t.keyframes.map((f, j) => {
                    const props = {};
                    for (const [k, v] of Object.entries(f || {}))
                        if (k !== 'offset' && k !== 'easing' && k !== 'composite' && (typeof v === 'number' || typeof v === 'string') && !FORBIDDEN.has(k))
                            props[k] = v;
                    const off = typeof f?.offset === 'number' ? f.offset : n > 1 ? j / (n - 1) : 0;
                    const kf = { id: `${id}k${j + 1}`, time: round(start + off * duration), props };
                    if (typeof f?.easing === 'string')
                        kf.easing = f.easing;
                    if (f?.composite === 'add' || f?.composite === 'accumulate')
                        kf.composite = f.composite;
                    return kf;
                });
            }
            else if (typeof t.preset === 'string')
                l.preset = t.preset;
        }
        layers.push(l);
    });
    const out = { layers, source: { format: sourceFormat, version: sourceFormat === 'use-scroll-animate/animation' ? 1 : undefined } };
    if (typeof a.name === 'string')
        out.name = a.name;
    if (typeof a.duration === 'number' && a.duration >= 0)
        out.duration = a.duration;
    if (a.loop)
        out.loop = true;
    return normalizeSceneV2(out);
}
// --- converters: v2 → 13.x ------------------------------------------------------------
function tokenTable(doc, tokens) {
    return (g, n) => doc.tokens?.[g]?.[n] ?? tokens[g][n];
}
/** Replace every token reference with its value (scene tokens first, then `tokens`, default the built-in scale). */
function resolveSceneTokens(doc, tokens = MOTION_TOKENS) {
    const look = tokenTable(doc, tokens);
    const r = (v) => {
        const m = typeof v === 'string' ? TOKEN_REF.exec(v) : null;
        if (!m)
            return v;
        const x = look(m[1], m[2]);
        return x === undefined ? v : typeof x === 'object' ? `${x.stiffness} ${x.damping} ${x.mass}` : x;
    };
    const d = normalizeSceneV2(doc);
    for (const l of d.layers) {
        if (typeof l.easing === 'string')
            l.easing = r(l.easing);
        l.keyframes?.forEach((k) => {
            for (const p of Object.keys(k.props))
                k.props[p] = r(k.props[p]);
            if (k.easing)
                k.easing = r(k.easing);
        });
        if (l.component)
            for (const p of Object.keys(l.component.props))
                l.component.props[p] = r(l.component.props[p]);
    }
    return d;
}
/**
 * Scene v2 → `motionary-timeline` v1 (for the 13.x Timeline editor). Token
 * references are resolved; preset / effect / component layers and `loop`,
 * `tokens`, track `start` / `duration` / `easing` have no v1 equivalent and
 * are listed in `lost`.
 */
function sceneV2ToTimeline(doc) {
    return timelineDocFromScene(doc);
}
/**
 * Scene v2 → `<usa-player>` animation JSON v1 (what 13.x plays). Token references
 * are resolved; groups, lock / mute / solo state, ids, seed and components are editor
 * state and listed in `lost`; muted layers (and non-solo layers when any is solo) are left out.
 */
function sceneV2ToAnimation(doc) {
    const d = resolveSceneTokens(doc);
    const lost = [];
    const by = new Map(d.layers.map((l) => [l.id, l]));
    const chain = (l) => { const c = []; for (let x = l; x && c.length <= d.layers.length; x = x.parent !== undefined ? by.get(x.parent) : undefined)
        c.push(x); return c; };
    const anySolo = d.layers.some((l) => l.solo);
    const tracks = [];
    d.layers.forEach((l, i) => {
        if (l.type === 'group') {
            if (l.locked || l.muted || l.solo || l.name)
                lost.push({ path: `layers[${i}]`, message: 'groups are editor state' });
            return;
        }
        const c = chain(l);
        if (c.some((x) => x.muted) || (anySolo && !c.some((x) => x.solo))) {
            lost.push({ path: `layers[${i}]`, message: 'muted / not solo — left out' });
            return;
        }
        if (l.component)
            lost.push({ path: `layers[${i}].component`, message: 'player JSON has no component bindings' });
        const t = { target: l.target || ':scope' };
        if (l.name !== undefined)
            t.label = l.name;
        if (l.effect !== undefined) {
            t.start = l.start ?? 0;
            t.effect = l.effect;
            if (l.options)
                t.options = clone(l.options);
        }
        else if (l.preset !== undefined) {
            t.start = l.start ?? 0;
            t.duration = l.duration ?? 600;
            t.preset = l.preset;
            if (l.easing)
                t.easing = l.easing;
        }
        else {
            const ks = l.keyframes || [];
            if (!ks.length) {
                lost.push({ path: `layers[${i}]`, message: 'empty track — left out' });
                return;
            }
            const start = l.start ?? ks[0].time;
            const duration = l.duration ?? Math.max(1, ks[ks.length - 1].time - start);
            t.start = start;
            t.duration = duration;
            t.keyframes = ks.map((k) => {
                const f = { ...k.props, offset: round((k.time - start) / duration) };
                if (k.easing !== undefined)
                    f.easing = k.easing;
                if (k.composite)
                    f.composite = k.composite;
                return f;
            });
            if (t.keyframes.length === 1)
                t.keyframes.push({ ...t.keyframes[0], offset: 1 });
            if (l.easing)
                t.easing = l.easing;
        }
        tracks.push(t);
    });
    if (d.seed !== undefined)
        lost.push({ path: 'seed', message: 'random() values are not resolved by this converter; use the Timeline editor export' });
    const animation = { format: 'use-scroll-animate/animation', version: 1, tracks };
    if (d.name !== undefined)
        animation.name = d.name;
    if (d.duration !== undefined)
        animation.duration = d.duration;
    if (d.loop)
        animation.loop = true;
    return { animation, lost };
}
// --- component motion props ---------------------------------------------------------
/**
 * A scene layer that binds a component's motion props (`duration`, `delay`,
 * `easing`, …), optionally replacing literal values with matching token references.
 */
function sceneV2ComponentLayer(id, tag, props, o = {}) {
    const p = {};
    for (const [k, v] of Object.entries(props))
        p[k] = o.tokenize ? tokenizeValue(k, v, o.tokens) : v;
    const l = { id, type: 'track', component: { tag, props: p } };
    if (o.target)
        l.target = o.target;
    return l;
}
/** The token reference for a literal duration (ms) / easing that equals a token value, else the literal. */
function tokenizeValue(prop, v, tokens = MOTION_TOKENS) {
    const g = /duration|delay/i.test(prop) && typeof v === 'number' ? 'duration' : /easing|ease/i.test(prop) && typeof v === 'string' ? 'easing' : null;
    if (!g)
        return v;
    const norm = (x) => (typeof x === 'string' ? x.replace(/\s+/g, '') : x);
    for (const [n, tv] of Object.entries(tokens[g]))
        if (norm(tv) === norm(v))
            return `{${g}.${n}}`;
    return v;
}
/**
 * Migrate a 13.x motion document (object or JSON text) — `motionary-timeline` v1,
 * `<usa-player>` animation JSON v1, or the legacy playground state — to scene v2.
 * A scene v2 input is validated and normalized. Never throws: on failure `ok` is
 * false and `problems` says why.
 */
function migrateToSceneV2(input, o = {}) {
    const report = { from: 'unknown', changes: [], lost: [], warnings: [], stats: { layers: 0, keyframes: 0, tokenized: 0 } };
    const fail = (problems) => ({ ok: false, problems, report });
    let data = input;
    if (typeof input === 'string') {
        if (input.length > L.textBytes)
            return fail([{ path: '', message: `text longer than ${L.textBytes} characters` }]);
        try {
            data = JSON.parse(input);
        }
        catch (e) {
            return fail([{ path: '', message: `invalid JSON (${e.message})` }]);
        }
    }
    const from = (report.from = detectMotionFormat(data));
    let doc;
    try {
        if (from === 'motionary-scene@2') {
            const p = validateSceneV2(data);
            if (p.length)
                return fail(p);
            doc = normalizeSceneV2(data);
            report.changes.push('already scene v2 — normalized only');
        }
        else if (from === 'motionary-timeline@1') {
            const p = validateTimelineDoc(data);
            if (p.length)
                return fail(p);
            doc = sceneV2FromTimeline(data);
            report.changes.push('format motionary-timeline v1 → motionary-scene v2 (layers, groups, lock / mute / solo, keyframes, seed and meta carried over unchanged)');
        }
        else if (from === 'animation@1' || from === 'playground') {
            if (data.format === 'use-scroll-animate/animation' && typeof data.version === 'number' && data.version > 1)
                return fail([{ path: 'version', message: `animation version ${data.version} is newer than this migrator` }]);
            const tracks = from === 'playground' ? decodePlayground(String(data.state || '')) : data.tracks;
            if (from === 'playground' && !tracks.length)
                return fail([{ path: 'state', message: 'could not decode the playground state' }]);
            const bad = tracks.map((t, i) => [t, i]).filter(([t]) => !isObj(t) || !(typeof t.effect === 'string' || typeof t.preset === 'string' || Array.isArray(t.keyframes)));
            bad.forEach(([, i]) => report.lost.push({ path: `tracks[${i}]`, message: 'track has no keyframes, preset or effect — the player ignores it' }));
            const anim = { ...data, tracks: tracks.filter((t) => !bad.some(([b]) => b === t)) };
            doc = sceneV2FromAnimation(anim, from === 'playground' ? 'use-scroll-animate/playground' : 'use-scroll-animate/animation');
            if (from === 'playground')
                report.changes.push('legacy playground state decoded (deprecated, removed in 14.0) → one preset layer per track');
            else
                report.changes.push(`format ${data.format ? 'use-scroll-animate/animation v1' : '(none — implicit animation v1)'} → motionary-scene v2 (keyframe offsets → absolute times; track start / duration / easing kept on the layer)`);
            if (!data.format)
                report.warnings.push('the input had no "format" / "version" — animation JSON without them is deprecated (14.0 requires them)');
            for (const k of Object.keys(data))
                if (!['format', 'version', 'name', 'loop', 'duration', 'tracks', 'state'].includes(k))
                    report.lost.push({ path: k, message: 'unknown key dropped' });
        }
        else {
            return fail([{ path: 'format', message: `not a motion document Motionary can migrate (expected motionary-timeline v1, use-scroll-animate/animation v1, use-scroll-animate/playground or motionary-scene v2)` }]);
        }
    }
    catch (e) {
        return fail([{ path: '', message: `could not migrate (${e?.message || e})` }]);
    }
    if (o.tokenize) {
        const tk = o.tokens || MOTION_TOKENS;
        for (const l of doc.layers) {
            if (typeof l.easing === 'string' && !isTokenRef(l.easing)) {
                const v = tokenizeValue('easing', l.easing, tk);
                if (v !== l.easing) {
                    l.easing = v;
                    report.stats.tokenized++;
                }
            }
            l.keyframes?.forEach((k) => { if (k.easing && !isTokenRef(k.easing)) {
                const v = tokenizeValue('easing', k.easing, tk);
                if (v !== k.easing) {
                    k.easing = v;
                    report.stats.tokenized++;
                }
            } });
            if (l.component)
                for (const [p, v] of Object.entries(l.component.props)) {
                    const t = tokenizeValue(p, v, tk);
                    if (t !== v) {
                        l.component.props[p] = t;
                        report.stats.tokenized++;
                    }
                }
        }
        if (report.stats.tokenized)
            report.changes.push(`${report.stats.tokenized} literal easing / duration value(s) replaced with token references`);
    }
    const problems = validateSceneV2(doc);
    report.stats.layers = doc.layers.length;
    report.stats.keyframes = doc.layers.reduce((n, l) => n + (l.keyframes?.length || 0), 0);
    return problems.length ? { ok: false, doc, problems, report } : { ok: true, doc, problems: [], report };
}
/** A structural diff of two JSON values (paths like `layers[0].keyframes[1].time`). */
function diffJson(a, b, path = '') {
    if (a === b)
        return [];
    const out = [];
    if (Array.isArray(a) && Array.isArray(b)) {
        for (let i = 0; i < Math.max(a.length, b.length); i++) {
            const p = `${path}[${i}]`;
            if (i >= a.length)
                out.push({ path: p, op: 'add', to: b[i] });
            else if (i >= b.length)
                out.push({ path: p, op: 'remove', from: a[i] });
            else
                out.push(...diffJson(a[i], b[i], p));
        }
        return out;
    }
    if (isObj(a) && isObj(b)) {
        for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
            const p = path ? `${path}.${k}` : k;
            if (!(k in a))
                out.push({ path: p, op: 'add', to: b[k] });
            else if (!(k in b))
                out.push({ path: p, op: 'remove', from: a[k] });
            else
                out.push(...diffJson(a[k], b[k], p));
        }
        return out;
    }
    return [{ path, op: 'change', from: a, to: b }];
}
/** Human-readable migration report (what `motionary migrate --report` prints). */
function formatMigrationReport(r, file = 'input') {
    const lines = [`${file}: ${r.report.from} → ${r.ok ? `motionary-scene v2 (${SCENE_V2_STATUS})` : 'FAILED'}`];
    if (r.ok)
        lines.push(`  ${r.report.stats.layers} layer(s), ${r.report.stats.keyframes} keyframe(s)${r.report.stats.tokenized ? `, ${r.report.stats.tokenized} tokenized` : ''}`);
    for (const c of r.report.changes)
        lines.push(`  ~ ${c}`);
    for (const w of r.report.warnings)
        lines.push(`  ! ${w}`);
    for (const l of r.report.lost)
        lines.push(`  - lost ${l.path}: ${l.message}`);
    for (const p of r.problems)
        lines.push(`  ✗ ${p.path || '(root)'}: ${p.message}`);
    return lines.join('\n');
}

export { SCENE_V2_FORMAT as S, SCENE_V2_LIMITS as a, SCENE_V2_STATUS as b, SCENE_V2_VERSION as c, detectMotionFormat as d, diffJson as e, formatMigrationReport as f, isTokenRef as g, sceneV2FromAnimation as h, isSceneV2 as i, sceneV2FromTimeline as j, sceneV2ToAnimation as k, sceneV2ToTimeline as l, migrateToSceneV2 as m, normalizeSceneV2 as n, serializeSceneV2 as o, resolveSceneTokens as r, sceneV2ComponentLayer as s, tokenizeValue as t, validateSceneV2 as v };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v16.3.0/dist/chunks/v2-C_rZCsjr.js.map