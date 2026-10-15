'use strict';

var components_tokens = require('./tokens.cjs');

/**
 * Motion Tokens 2.0 (14.1) — the token set: durations, easing curves, springs, spatial distances and motion
 * semantics (enter / exit / emphasis / transition), with modes (built-in `reduced`, default `compact`, custom).
 * Semantic tokens reference primitives with the DTCG alias syntax (`"{duration.normal}"`), the same syntax
 * Motion Engine v2 and Scene Format v2 accept since 13.9 / 14.0.
 */
/** Token-set generation (14.1 = 2). */
const MOTION_TOKENS_VERSION = 2;
const SEMANTIC_KINDS = ['enter', 'exit', 'emphasis', 'transition'];
/** The built-in reduced-motion mode (derived from any set; explicit overrides apply on top). */
const REDUCED_MOTION_MODE = 'reduced';
/** 15.3: the built-in gentle mode — half the travel, durations ≤ 300 ms, no overshoot (opt-in: no OS setting maps to it). */
const GENTLE_MOTION_MODE = 'gentle';
const PRIM = ['duration', 'easing', 'spring', 'distance'];
const NAME = /^[A-Za-z0-9_-]+$/;
const REF = /^\{([^{}]+)\}$/;
const isObj$1 = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
const own = (o, k) => isObj$1(o) && Object.prototype.hasOwnProperty.call(o, k);
const keys = Object.keys;
/** `"{a.b}"` → `"a.b"` (or undefined). */
const tokenRefPath = (v) => (typeof v === 'string' ? REF.exec(v.trim())?.[1] : undefined);
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/[\s_.]+/g, '-').toLowerCase();
/** The default token set: the 4.2 scale + distances + semantics + a `compact` mode. */
const MOTION_TOKENS_2 = {
    duration: { ...components_tokens.MOTION_TOKENS.duration },
    easing: { ...components_tokens.MOTION_TOKENS.easing },
    spring: /*#__PURE__*/ Object.fromEntries(Object.entries(components_tokens.MOTION_TOKENS.spring).map(([k, v]) => [k, { ...v }])),
    distance: { none: 0, xs: 4, sm: 8, md: 16, lg: 32, xl: 64 },
    semantic: {
        enter: { default: { duration: '{duration.normal}', easing: '{easing.decelerate}', distance: '{distance.md}' } },
        exit: { default: { duration: '{duration.fast}', easing: '{easing.accelerate}', distance: '{distance.sm}' } },
        emphasis: { default: { duration: '{duration.normal}', easing: '{easing.emphasized}', distance: '{distance.xs}', spring: '{spring.bouncy}' } },
        transition: { default: { duration: '{duration.normal}', easing: '{easing.standard}' } },
    },
    modes: {
        compact: { duration: { fast: 120, normal: 240, slow: 480, slower: 720, slowest: 1120 }, distance: { xs: 2, sm: 4, md: 8, lg: 16, xl: 32 } },
    },
};
const cloneSem = (s) => Object.fromEntries(keys(s || {}).map((k) => [k, Object.fromEntries(keys(s[k] || {}).map((n) => [n, { ...s[k][n] }]))]));
function cloneOv(o) {
    const out = {};
    for (const g of ['duration', 'easing', 'distance'])
        if (o[g])
            out[g] = { ...o[g] };
    if (o.spring)
        out.spring = Object.fromEntries(keys(o.spring).map((k) => [k, { ...o.spring[k] }]));
    if (o.semantic)
        out.semantic = cloneSem(o.semantic);
    return out;
}
function cloneSet(s) {
    var _a;
    const out = cloneOv(s);
    out.duration || (out.duration = {});
    out.easing || (out.easing = {});
    out.spring || (out.spring = {});
    out.distance || (out.distance = {});
    out.semantic = cloneSem(s.semantic);
    for (const k of SEMANTIC_KINDS)
        (_a = out.semantic)[k] || (_a[k] = {});
    if (s.modes)
        out.modes = Object.fromEntries(keys(s.modes).map((m) => [m, cloneOv(s.modes[m])]));
    return out;
}
function mergeOv(t, p) {
    var _a;
    if (!isObj$1(p))
        return;
    for (const g of ['duration', 'easing', 'distance'])
        if (isObj$1(p[g]))
            Object.assign((t[g] || (t[g] = {})), p[g]);
    if (isObj$1(p.spring))
        for (const k of keys(p.spring))
            (t.spring || (t.spring = {}))[k] = { ...(t.spring[k] || { stiffness: 170, damping: 26, mass: 1 }), ...p.spring[k] };
    if (isObj$1(p.semantic))
        for (const k of keys(p.semantic))
            for (const n of keys(p.semantic[k] || {}))
                ((_a = (t.semantic || (t.semantic = {})))[k] || (_a[k] = {}))[n] = { ...(t.semantic[k][n] || {}), ...p.semantic[k][n] };
}
/** Merge a partial set (and modes) over `base` (default: the built-in set). Never mutates either. */
function defineMotionTokens(partial = {}, base = MOTION_TOKENS_2) {
    var _a;
    const out = cloneSet(base);
    mergeOv(out, partial);
    if (isObj$1(partial.modes))
        for (const m of keys(partial.modes))
            mergeOv(((_a = (out.modes || (out.modes = {})))[m] || (_a[m] = {})), partial.modes[m]);
    return out;
}
const bez = (e) => {
    const m = /^cubic-bezier\(([^)]*)\)$/.exec(e.trim());
    const n = m ? m[1].split(',').map(Number) : [];
    return n.length === 4 && n.every(isFinite) ? n : undefined;
};
const up = (x) => Math.ceil(x * 100) / 100;
/** The reduced-motion overrides derived from a set: no travel, durations ≤ 150 ms, no overshooting curves, critically damped springs. */
function reducedMotionOverrides(set) {
    var _a;
    const cap = (v) => (v > 150 ? 150 : v);
    const o = { duration: {}, easing: {}, spring: {}, distance: {}, semantic: {} };
    for (const k of keys(set.duration))
        o.duration[k] = cap(set.duration[k]);
    for (const k of keys(set.distance))
        o.distance[k] = 0;
    for (const k of keys(set.easing)) {
        const b = bez(set.easing[k]);
        if (b && (b[1] < 0 || b[1] > 1 || b[3] < 0 || b[3] > 1))
            o.easing[k] = 'cubic-bezier(0.2, 0, 0, 1)';
    }
    for (const k of keys(set.spring)) {
        const s = set.spring[k];
        o.spring[k] = { damping: Math.max(s.damping, up(2 * Math.sqrt(s.stiffness * s.mass))) };
    }
    for (const kind of keys(set.semantic))
        for (const n of keys(set.semantic[kind] || {})) {
            const e = set.semantic[kind][n], p = {};
            if (typeof e.distance === 'number' && e.distance)
                p.distance = 0;
            if (typeof e.duration === 'number' && e.duration > 150)
                p.duration = 150;
            if (keys(p).length)
                ((_a = o.semantic)[kind] || (_a[kind] = {}))[n] = p;
        }
    return o;
}
/** 15.3: the gentle-motion overrides derived from a set: travel halved (rounded), durations ≤ 300 ms, no overshooting curves, springs at least 80 % of critical damping. Only changed values are listed. */
function gentleMotionOverrides(set) {
    var _a;
    const o = { duration: {}, easing: {}, spring: {}, distance: {}, semantic: {} };
    for (const k of keys(set.duration))
        if (set.duration[k] > 300)
            o.duration[k] = 300;
    for (const k of keys(set.distance)) {
        const v = Math.round(set.distance[k] * 0.5);
        if (v !== set.distance[k])
            o.distance[k] = v;
    }
    for (const k of keys(set.easing)) {
        const b = bez(set.easing[k]);
        if (b && (b[1] < 0 || b[1] > 1 || b[3] < 0 || b[3] > 1))
            o.easing[k] = 'cubic-bezier(0.2, 0, 0, 1)';
    }
    for (const k of keys(set.spring)) {
        const s = set.spring[k], min = up(0.8 * 2 * Math.sqrt(s.stiffness * s.mass));
        if (s.damping < min)
            o.spring[k] = { damping: min };
    }
    for (const kind of keys(set.semantic))
        for (const n of keys(set.semantic[kind] || {})) {
            const e = set.semantic[kind][n], p = {};
            if (typeof e.distance === 'number' && e.distance)
                p.distance = Math.round(e.distance * 0.5);
            if (typeof e.duration === 'number' && e.duration > 300)
                p.duration = 300;
            if (keys(p).length)
                ((_a = o.semantic)[kind] || (_a[kind] = {}))[n] = p;
        }
    return o;
}
/** The set as seen in `mode` (or several, applied in order); `reduced` and `gentle` (15.3) are always available. The result has no `modes`. */
function withMode(set, mode) {
    const out = cloneSet(set);
    delete out.modes;
    for (const m of mode == null ? [] : Array.isArray(mode) ? mode : [mode]) {
        const explicit = set.modes && own(set.modes, m) ? set.modes[m] : undefined;
        if (m === REDUCED_MOTION_MODE)
            mergeOv(out, reducedMotionOverrides(out));
        else if (m === GENTLE_MOTION_MODE)
            mergeOv(out, gentleMotionOverrides(out));
        else if (!explicit)
            throw new Error(`[motionary] tokens: unknown mode "${m}" (have: ${[REDUCED_MOTION_MODE, GENTLE_MOTION_MODE, ...keys(set.modes || {})].join(', ')})`);
        mergeOv(out, explicit);
    }
    return out;
}
function prim(set, g, n) {
    const v = own(set[g], n) ? set[g][n] : undefined;
    return g === 'spring' && v ? { ...v } : v;
}
const lit = (set, v, g) => {
    const p = tokenRefPath(v);
    if (p) {
        const [grp, n] = p.split('.');
        return grp === g ? prim(set, g, n) : undefined;
    }
    if (g === 'easing')
        return typeof v === 'string' ? v : undefined;
    if (g === 'spring')
        return isObj$1(v) ? { stiffness: +v.stiffness, damping: +v.damping, mass: +(v.mass ?? 1) } : undefined;
    if (g === 'distance')
        return typeof v === 'number' ? v : typeof v === 'string' ? parseFloat(v) : undefined;
    return components_tokens.parseDuration(v);
};
/** One semantic motion, resolved to literals (falls back to the kind's `default`). */
function resolveSemantic(set, kind, name = 'default', mode) {
    const s = mode ? withMode(set, mode) : set;
    const grp = s.semantic[kind] || {};
    const e = grp[name] || grp.default;
    if (!e)
        throw new Error(`[motionary] tokens: no semantic token ${kind}.${name}`);
    const r = {
        duration: lit(s, e.duration, 'duration') ?? 0,
        delay: e.delay == null ? 0 : lit(s, e.delay, 'duration') ?? 0,
        easing: (e.easing == null ? s.easing.standard : lit(s, e.easing, 'easing')) ?? 'ease',
        distance: e.distance == null ? 0 : lit(s, e.distance, 'distance') ?? 0,
    };
    if (e.spring != null) {
        const sp = lit(s, e.spring, 'spring');
        if (sp)
            r.spring = sp;
    }
    return r;
}
/** `"{duration.fast}"`, `"distance.md"`, `"{enter.default}"`, `"{semantic.exit.default}"` → its value (undefined when unknown). */
function resolveMotionToken(set, ref, mode) {
    const s = mode ? withMode(set, mode) : set;
    const parts = (tokenRefPath(ref) ?? ref).split('.');
    if (parts[0] === 'semantic')
        parts.shift();
    const [g, n] = parts;
    if (PRIM.includes(g))
        return prim(s, g, n);
    if (SEMANTIC_KINDS.includes(g) && own(s.semantic[g], n))
        return resolveSemantic(s, g, n);
    return undefined;
}
/** `{ duration, delay, easing }` for `animate()` in motionary/motion. */
function motionOptions(set, kind, name = 'default', mode) {
    const r = resolveSemantic(set, kind, name, mode);
    return { duration: r.duration, delay: r.delay, easing: r.easing };
}
/** Keyframes for a semantic motion: enter / exit fade + travel by its distance, emphasis nudges and returns, transition moves. */
function motionKeyframes(set, kind, name = 'default', o = {}) {
    const d = resolveSemantic(set, kind, name, o.mode).distance * (o.direction || 1);
    const t = (k) => (d * k ? `translate${(o.axis || 'y').toUpperCase()}(${d * k}px)` : 'none');
    if (kind === 'enter')
        return [{ opacity: 0, transform: t(1) }, { opacity: 1, transform: 'none' }];
    if (kind === 'exit')
        return [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: t(1) }];
    if (kind === 'emphasis')
        return [{ transform: 'none' }, { transform: t(-1), offset: 0.4 }, { transform: 'none' }];
    return [{ transform: 'none' }, { transform: t(1) }];
}
const EASE_KW = /^(linear|ease|ease-in|ease-out|ease-in-out|step-start|step-end)$/;
/** Whether `v` is a CSS easing this library understands (keywords, cubic-bezier with x in 0–1, steps(), linear()). */
function isCssEasing(v) {
    if (typeof v !== 'string')
        return false;
    const s = v.trim();
    if (EASE_KW.test(s))
        return true;
    if (/^cubic-bezier\(/.test(s)) {
        const b = bez(s);
        return !!b && b[0] >= 0 && b[0] <= 1 && b[2] >= 0 && b[2] <= 1;
    }
    return /^steps\(\s*\d+\s*(,\s*(jump-start|jump-end|jump-none|jump-both|start|end)\s*)?\)$/.test(s) || /^linear\([^()]+\)$/.test(s);
}
function checkGroups(o, at, P) {
    const num = (v) => typeof v === 'number' && isFinite(v);
    for (const g of PRIM) {
        if (o[g] === undefined)
            continue;
        if (!isObj$1(o[g])) {
            P(`${at}${g}`, 'expected an object');
            continue;
        }
        for (const [n, v] of Object.entries(o[g])) {
            const p = `${at}${g}.${n}`;
            if (!NAME.test(n))
                P(p, 'invalid name (letters, digits, - and _)');
            else if (g === 'duration' && !(num(v) && v >= 0 && v <= 1e7))
                P(p, 'expected a finite number of ms ≥ 0');
            else if (g === 'distance' && !num(v))
                P(p, 'expected a finite number of px');
            else if (g === 'easing' && !isCssEasing(v))
                P(p, `not a CSS easing: ${JSON.stringify(v)}`);
            else if (g === 'spring' && !(isObj$1(v) && (v.stiffness === undefined || (num(v.stiffness) && v.stiffness > 0)) && (v.damping === undefined || (num(v.damping) && v.damping >= 0)) && (v.mass === undefined || (num(v.mass) && v.mass > 0))))
                P(p, 'expected { stiffness > 0, damping ≥ 0, mass > 0 }');
        }
    }
}
/** Problems in a token set (empty = valid). Never throws. */
function validateMotionTokens(set) {
    const out = [];
    const P = (p, m) => void out.push(`${p}: ${m}`);
    if (!isObj$1(set))
        return ['set: expected an object'];
    checkGroups(set, '', P);
    const sem = (s, at, all, partial) => {
        if (!isObj$1(s))
            return void P(at, 'expected an object');
        for (const k of keys(s)) {
            if (!SEMANTIC_KINDS.includes(k)) {
                P(`${at}.${k}`, 'unknown kind (enter | exit | emphasis | transition)');
                continue;
            }
            for (const [n, e] of Object.entries(s[k] || {})) {
                const p = `${at}.${k}.${n}`;
                if (!NAME.test(n)) {
                    P(p, 'invalid name (letters, digits, - and _)');
                    continue;
                }
                if (!isObj$1(e)) {
                    P(p, 'expected an object');
                    continue;
                }
                if (!partial && e.duration === undefined)
                    P(`${p}.duration`, 'required');
                for (const f of keys(e)) {
                    const g = { duration: 'duration', delay: 'duration', easing: 'easing', distance: 'distance', spring: 'spring' }[f];
                    if (!g) {
                        P(`${p}.${f}`, 'unknown field (duration | easing | delay | distance | spring)');
                        continue;
                    }
                    const v = e[f], r = tokenRefPath(v);
                    if (r) {
                        const [rg, rn] = r.split('.');
                        if (rg !== g)
                            P(`${p}.${f}`, `${v} is not a ${g} token`);
                        else if (!own(all[g], rn))
                            P(`${p}.${f}`, `unknown token ${v}`);
                    }
                    else if (typeof v === 'string' && v.trim().startsWith('{'))
                        P(`${p}.${f}`, `malformed token reference ${JSON.stringify(v)}`);
                    else if (lit(all, v, g) === undefined || (g === 'easing' && !isCssEasing(v)) || (g !== 'easing' && g !== 'spring' && !isFinite(lit(all, v, g))))
                        P(`${p}.${f}`, `invalid ${g} value ${JSON.stringify(v)}`);
                }
            }
        }
    };
    sem(set.semantic, 'semantic', set, false);
    if (set.modes !== undefined) {
        if (!isObj$1(set.modes))
            P('modes', 'expected an object');
        else
            for (const [m, o] of Object.entries(set.modes)) {
                if (!NAME.test(m)) {
                    P(`modes.${m}`, 'invalid mode name');
                    continue;
                }
                if (!isObj$1(o)) {
                    P(`modes.${m}`, 'expected an object');
                    continue;
                }
                for (const k of keys(o))
                    if (!PRIM.includes(k) && k !== 'semantic')
                        P(`modes.${m}.${k}`, 'unknown group');
                checkGroups(o, `modes.${m}.`, P);
                let view;
                try {
                    view = withMode(set, m);
                }
                catch { /* reported above */ }
                if (o.semantic && view)
                    sem(o.semantic, `modes.${m}.semantic`, view, true);
            }
    }
    try {
        const r = withMode(set, REDUCED_MOTION_MODE);
        for (const [k, v] of Object.entries(r.distance))
            if (v)
                P('modes.reduced', `distance.${k} is ${v} — reduced motion should not move content`);
    }
    catch { /* invalid set, reported above */ }
    return out;
}
const X = 'org.motionary';
/** Export a token set as a DTCG document (springs, semantic distance / spring and modes travel in `$extensions["org.motionary"]`). */
function motionTokenSetToDTCG(set, o = {}) {
    const stable = (o.format || '2025.10') === '2025.10', G = o.group || 'motion';
    const ms = (v) => (stable ? { value: v, unit: 'ms' } : `${v}ms`);
    const px = (v) => (stable ? { value: v, unit: 'px' } : `${v}px`);
    const ref = (v) => `{${G}.${tokenRefPath(v)}}`;
    const g = { $description: 'Motion tokens (Motionary Motion Tokens 2.0)', duration: { $type: 'duration' }, easing: { $type: 'cubicBezier' }, distance: { $type: 'dimension' }, spring: { $description: 'Spring parameters (not a DTCG type; in $extensions)' } };
    for (const [k, v] of Object.entries(set.duration))
        g.duration[k] = { $value: ms(v) };
    for (const [k, v] of Object.entries(set.distance))
        g.distance[k] = { $value: px(v) };
    const easeTok = (css) => {
        const b = bez(css) || { linear: [0, 0, 1, 1], ease: [0.25, 0.1, 0.25, 1], 'ease-in': [0.42, 0, 1, 1], 'ease-out': [0, 0, 0.58, 1], 'ease-in-out': [0.42, 0, 0.58, 1] }[css.trim()];
        return b ? { $value: b, ...(components_tokens.parseEasing(b) !== css ? { $extensions: { [X]: { css } } } : {}) } : undefined;
    };
    for (const [k, v] of Object.entries(set.easing))
        g.easing[k] = easeTok(v) || { $type: 'string', $value: v };
    for (const [k, v] of Object.entries(set.spring))
        g.spring[k] = { $extensions: { [X]: { spring: { ...v } } } };
    for (const kind of SEMANTIC_KINDS) {
        const grp = set.semantic[kind] || {};
        if (!keys(grp).length)
            continue;
        g[kind] = { $type: 'transition' };
        for (const [n, e] of Object.entries(grp)) {
            const val = (v, f, p) => (tokenRefPath(v) ? ref(v) : f(lit(set, v, p) ?? 0));
            const x = {};
            let tf;
            if (e.easing == null)
                (tf = `{${G}.easing.standard}`), (x.noEasing = true);
            else if (tokenRefPath(e.easing))
                tf = ref(e.easing);
            else {
                const t = easeTok(e.easing);
                tf = t ? t.$value : [0, 0, 1, 1];
                if (!t || t.$extensions)
                    x.easing = e.easing;
            }
            if (e.distance != null)
                x.distance = val(e.distance, px, 'distance');
            if (e.spring != null)
                x.spring = tokenRefPath(e.spring) ? ref(e.spring) : { ...e.spring };
            if (e.delay != null)
                x.delay = true;
            const tok = { $value: { duration: val(e.duration, ms, 'duration'), delay: e.delay == null ? ms(0) : val(e.delay, ms, 'duration'), timingFunction: tf } };
            if (keys(x).length)
                tok.$extensions = { [X]: x };
            g[kind][n] = tok;
        }
    }
    const doc = { $schema: 'https://www.designtokens.org/schemas/2025.10/format.json', [G]: g, $extensions: { [X]: { version: MOTION_TOKENS_VERSION } } };
    if (o.modes !== false && set.modes && keys(set.modes).length)
        doc.$extensions[X].modes = JSON.parse(JSON.stringify(set.modes));
    return doc;
}
const PRIM_GROUPS = { duration: 'duration', durations: 'duration', easing: 'easing', easings: 'easing', distance: 'distance', distances: 'distance', spring: 'spring', springs: 'spring' };
const isTok = (n) => isObj$1(n) && '$value' in n;
function dim(v) {
    if (typeof v === 'number')
        return v;
    const m = isObj$1(v) ? [0, v.value, v.unit] : /^\s*(-?\d*\.?\d+)\s*(px|rem|em)?\s*$/.exec(String(v ?? ''));
    if (!m || typeof +m[1] !== 'number' || !isFinite(+m[1]))
        return undefined;
    return m[2] === 'rem' || m[2] === 'em' ? +m[1] * 16 : +m[1];
}
const round = (v) => (v === undefined ? v : Math.round(v * 1000) / 1000);
/** Find the motion group: the first object (breadth-first) holding a duration / easing / distance / spring / semantic group. */
function findRoot(doc) {
    const q = [[doc, []]];
    while (q.length) {
        const [n, p] = q.shift();
        if (!isObj$1(n) || isTok(n))
            continue;
        if (keys(n).some((k) => (PRIM_GROUPS[k] || SEMANTIC_KINDS.includes(k)) && isObj$1(n[k]) && !isTok(n[k])))
            return p;
        for (const k of keys(n))
            if (!k.startsWith('$'))
                q.push([n[k], [...p, k]]);
    }
    return undefined;
}
/** Import a DTCG document (Motionary 2.0 exports, or any DTCG motion group); merged over `base` (default: the built-in set). Throws on broken aliases. */
function motionTokenSetFromDTCG(doc, base = MOTION_TOKENS_2) {
    var _a, _b;
    const resolved = components_tokens.resolveTokenAliases(doc);
    const rootPath = findRoot(doc) || [];
    const at = (o, p) => p.reduce((n, k) => n?.[k], o);
    const raw = at(doc, rootPath) || {}, res = at(resolved, rootPath) || {};
    const prefix = rootPath.length ? rootPath.join('.') + '.' : '';
    const p = { duration: {}, easing: {}, spring: {}, distance: {}, semantic: {} };
    for (const k of keys(res)) {
        const g = PRIM_GROUPS[k];
        if (!g || !isObj$1(res[k]))
            continue;
        for (const [n, t] of Object.entries(res[k])) {
            if (n.startsWith('$') || !isObj$1(t))
                continue;
            const ext = t.$extensions?.[X] || {};
            if (g === 'spring') {
                const s = ext.spring || (isTok(t) && isObj$1(t.$value) ? t.$value : undefined);
                if (s)
                    p.spring[n] = { stiffness: +s.stiffness || 170, damping: +s.damping || 26, mass: +s.mass || 1 };
            }
            else if (isTok(t)) {
                const v = g === 'duration' ? round(components_tokens.parseDuration(t.$value)) : g === 'distance' ? round(dim(t.$value)) : ext.css || components_tokens.parseEasing(t.$value);
                if (v !== undefined)
                    p[g][n] = v;
            }
        }
    }
    const mapRef = (v, g, resolvedVal, conv) => {
        const r = tokenRefPath(v);
        if (r && r.startsWith(prefix)) {
            const rest = r.slice(prefix.length), [rg, rn] = rest.split('.');
            if (PRIM_GROUPS[rg] === g && own(p[g], rn))
                return `{${g}.${rn}}`;
        }
        return conv(resolvedVal);
    };
    for (const kind of SEMANTIC_KINDS) {
        const rg = raw[kind], sg = res[kind];
        if (!isObj$1(rg))
            continue;
        for (const n of keys(rg)) {
            const rt = rg[n], st = sg?.[n];
            if (n.startsWith('$') || !isTok(rt) || !isObj$1(st?.$value))
                continue;
            const rv = isObj$1(rt.$value) ? rt.$value : {}, sv = st.$value, x = rt.$extensions?.[X] || {}, sx = st.$extensions?.[X] || {};
            const e = { duration: mapRef(rv.duration, 'duration', sv.duration, (v) => round(components_tokens.parseDuration(v))) };
            if (!x.noEasing)
                e.easing = x.easing ?? mapRef(rv.timingFunction, 'easing', sv.timingFunction, components_tokens.parseEasing);
            if (x.delay || round(components_tokens.parseDuration(sv.delay)) || tokenRefPath(rv.delay))
                e.delay = mapRef(rv.delay, 'duration', sv.delay, (v) => round(components_tokens.parseDuration(v)) ?? 0);
            if (x.distance != null)
                e.distance = mapRef(x.distance, 'distance', sx.distance ?? x.distance, (v) => round(dim(v)) ?? 0);
            if (x.spring != null)
                e.spring = mapRef(x.spring, 'spring', x.spring, (v) => (isObj$1(v) ? { ...v } : undefined));
            ((_a = p.semantic)[kind] || (_a[kind] = {}))[n] = e;
        }
    }
    const modes = doc?.$extensions?.[X]?.modes;
    if (isObj$1(modes))
        p.modes = JSON.parse(JSON.stringify(modes));
    const out = cloneSet(base);
    mergeOv(out, p);
    // semantic entries from the document replace the base entry (no field leaks from the default)
    for (const k of keys(p.semantic || {}))
        for (const n of keys(p.semantic[k]))
            out.semantic[k][n] = { ...p.semantic[k][n] };
    if (p.modes)
        for (const m of keys(p.modes))
            mergeOv(((_b = (out.modes || (out.modes = {})))[m] || (_b[m] = {})), p.modes[m]);
    return out;
}
/** The custom-property map: primitives (`--usa-duration-fast: 150ms`, `--usa-distance-md: 16px`…) and semantic vars referencing them. */
function motionTokenSetVars(set, o = {}) {
    const s = o.mode ? withMode(set, o.mode) : set, P = o.prefix || '--usa', v = {};
    for (const [k, x] of Object.entries(s.duration))
        v[`${P}-duration-${kebab(k)}`] = `${x}ms`;
    for (const [k, x] of Object.entries(s.easing))
        v[`${P}-easing-${kebab(k)}`] = x;
    for (const [k, x] of Object.entries(s.spring))
        for (const f of ['stiffness', 'damping', 'mass'])
            v[`${P}-spring-${kebab(k)}-${f}`] = String(x[f]);
    for (const [k, x] of Object.entries(s.distance))
        v[`${P}-distance-${kebab(k)}`] = `${x}px`;
    const ref = (x, g, unit, dflt) => {
        const r = tokenRefPath(x);
        if (r) {
            const [, n] = r.split('.');
            return `var(${P}-${g}-${kebab(n)})`;
        }
        if (x == null)
            return dflt;
        const l = lit(s, x, g);
        return l === undefined ? dflt : `${l}${unit}`;
    };
    for (const kind of SEMANTIC_KINDS)
        for (const [n, e] of Object.entries(s.semantic[kind] || {})) {
            const b = `${P}-motion-${kind}-${kebab(n)}`;
            v[`${b}-duration`] = ref(e.duration, 'duration', 'ms', '0ms');
            v[`${b}-delay`] = ref(e.delay, 'duration', 'ms', '0ms');
            v[`${b}-easing`] = e.easing == null ? `var(${P}-easing-standard)` : ref(e.easing, 'easing', '', 'ease');
            v[`${b}-distance`] = ref(e.distance, 'distance', 'px', '0px');
        }
    return v;
}
/**
 * A stylesheet: the set on `selector`, then each mode as the variables that change — `reduced` under
 * `@media (prefers-reduced-motion: reduce)` and every mode under `selector[data-usa-motion-mode~="<mode>"]`
 * (an explicit data attribute wins over the OS preference).
 */
function motionTokenSetToCss(set, o = {}) {
    const sel = o.selector || ':root';
    const base = motionTokenSetVars(set, o);
    const block = (s, v, ind = '') => `${ind}${s} {\n${Object.entries(v).map(([k, x]) => `${ind}  ${k}: ${x};`).join('\n')}\n${ind}}\n`;
    let css = block(sel, base);
    if (o.modes === false)
        return css;
    const diff = (m) => Object.fromEntries(Object.entries(motionTokenSetVars(set, { ...o, mode: m })).filter(([k, x]) => base[k] !== x));
    const names = [...new Set([REDUCED_MOTION_MODE, GENTLE_MOTION_MODE, ...keys(set.modes || {})])];
    for (const m of names) {
        const d = diff(m);
        if (!keys(d).length)
            continue;
        if (m === REDUCED_MOTION_MODE)
            css += `@media (prefers-reduced-motion: reduce) {\n${block(sel, d, '  ')}}\n`;
        css += block(`${sel}[data-usa-motion-mode~="${m}"]`, d);
    }
    return css;
}
// --- runtime: Motion Engine v2 / Scene Format v2 ----------------------------------------
/** Whether the user asked for reduced motion (`prefers-reduced-motion: reduce`). */
function prefersReducedMotion() {
    return typeof matchMedia === 'function' && !!matchMedia('(prefers-reduced-motion: reduce)')?.matches;
}
/**
 * Make `set` the active motion scale: writes every custom property on `root` (default `<html>`) and makes
 * `{duration.*}` / `{easing.*}` / `{spring.*}` references in motionary/motion, motionary/motion/scene and the
 * token-aware components resolve to it. `mode: 'auto'` follows `prefers-reduced-motion` (and its changes).
 * Returns an undo function.
 */
function applyMotionTokenSet(set, o = {}) {
    const el = o.root || (typeof document !== 'undefined' ? document.documentElement : undefined);
    const auto = o.mode === 'auto';
    let undoPrim = () => { }, old = {};
    const restore = () => {
        undoPrim();
        if (el)
            for (const [k, v] of Object.entries(old))
                v ? el.style.setProperty(k, v) : el.style.removeProperty(k);
        old = {};
    };
    const apply = () => {
        restore();
        const mode = auto ? (prefersReducedMotion() ? REDUCED_MOTION_MODE : undefined) : o.mode;
        const s = withMode(set, mode);
        undoPrim = components_tokens.applyMotionTokens({ duration: s.duration, easing: s.easing, spring: s.spring }, el, o.prefix);
        if (el)
            for (const [k, v] of Object.entries(motionTokenSetVars(s, { prefix: o.prefix })))
                if (!/-(duration|easing|spring)-/.test(k.slice((o.prefix || '--usa').length)) || k.includes('-motion-'))
                    (old[k] = el.style.getPropertyValue(k)), el.style.setProperty(k, v);
    };
    apply();
    const mq = auto && typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : undefined;
    mq?.addEventListener?.('change', apply);
    return () => {
        mq?.removeEventListener?.('change', apply);
        restore();
    };
}
/** Scene-local tokens (`doc.tokens`) for Scene Format v2 from a set (in `mode`). */
function toSceneTokens(set, mode) {
    const s = withMode(set, mode);
    return { duration: s.duration, easing: s.easing, spring: s.spring };
}
/** A copy of a scene v2 document whose `tokens` carry the set (the document's own tokens win). */
function withSceneTokens(doc, set, mode) {
    const t = toSceneTokens(set, mode), d = isObj$1(doc.tokens) ? doc.tokens : {};
    return { ...doc, tokens: { duration: { ...t.duration, ...d.duration }, easing: { ...t.easing, ...d.easing }, spring: { ...t.spring, ...d.spring } } };
}

/**
 * Motion Tokens 2.0 (14.1) — Figma Variables adapter. Pure data in the shapes of the Figma Variables REST API:
 * `motionTokensToFigma()` builds a `POST /v1/files/:file_key/variables` body; `motionTokensFromFigma()` reads a
 * `GET /v1/files/:file_key/variables/local` response (or such a POST body). No network calls: send the body with
 * your own token, or use `npx motionary tokens export-figma / import-figma`.
 *
 * Variables are named `motion/<group>/<name>` (the 12.3 Figma plugin's names): durations and distances FLOAT,
 * easings STRING, springs three FLOATs (`motion/spring/<name>/stiffness|damping|mass`), semantic tokens
 * `motion/<enter|exit|emphasis|transition>/<name>/<duration|delay|easing|distance>` as aliases of the primitives.
 * Token-set modes become collection modes (`reduced` ↔ "Reduced motion").
 */
const isObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
const FIELDS = ['duration', 'delay', 'easing', 'distance'];
const SPRING = ['stiffness', 'damping', 'mass'];
const modeLabel = (m) => (m === REDUCED_MOTION_MODE ? 'Reduced motion' : m.replace(/(^|-)(\w)/g, (_, s, c) => (s ? ' ' : '') + c.toUpperCase()));
const modeKey = (name) => (/reduc/i.test(name) ? REDUCED_MOTION_MODE : kebab(name.trim()).replace(/[^a-z0-9_-]/g, ''));
/** A token set as a Figma Variables `POST` body (one collection, Default + one mode per token-set mode). */
function motionTokensToFigma(set = MOTION_TOKENS_2, o = {}) {
    const P = o.prefix || 'motion', C = o.cssPrefix || '--usa', col = `${P}-collection`;
    const modes = o.modes || [...new Set([REDUCED_MOTION_MODE, ...Object.keys(set.modes || {})])];
    const mid = (m) => `${P}-mode-${m || 'default'}`;
    const body = {
        variableCollections: [{ action: 'CREATE', id: col, name: o.collection || 'Motion', initialModeId: mid() }],
        variableModes: [{ action: 'UPDATE', id: mid(), name: 'Default', variableCollectionId: col }, ...modes.map((m) => ({ action: 'CREATE', id: mid(m), name: modeLabel(m), variableCollectionId: col }))],
        variables: [],
        variableModeValues: [],
    };
    const views = [[mid(), withMode(set)], ...modes.map((m) => [mid(m), withMode(set, m)])];
    const vid = (name) => `var:${name}`;
    const declared = new Set();
    const declare = (name, type, css, description) => {
        if (declared.has(name))
            return;
        declared.add(name);
        body.variables.push({ action: 'CREATE', id: vid(name), name, variableCollectionId: col, resolvedType: type, ...(description ? { description } : {}), scopes: ['ALL_SCOPES'], codeSyntax: { WEB: `var(${C}-${css})` } });
    };
    const put = (name, modeId, value) => body.variableModeValues.push({ variableId: vid(name), modeId, value });
    const prims = [['duration', 'FLOAT', 'ms'], ['easing', 'STRING', 'CSS easing'], ['distance', 'FLOAT', 'px']];
    // primitives: names from every view (a mode can add tokens)
    for (const [modeId, s] of views) {
        for (const [g, type, d] of prims)
            for (const [k, v] of Object.entries(s[g])) {
                const name = `${P}/${g}/${k}`;
                declare(name, type, `${g}-${kebab(k)}`, d);
                put(name, modeId, v);
            }
        for (const [k, v] of Object.entries(s.spring))
            for (const f of SPRING) {
                const name = `${P}/spring/${k}/${f}`;
                declare(name, 'FLOAT', `spring-${kebab(k)}-${f}`, `spring ${f}`);
                put(name, modeId, v[f]);
            }
    }
    // semantic tokens: aliases where they reference a primitive, literals otherwise
    for (const [modeId, s] of views)
        for (const kind of SEMANTIC_KINDS)
            for (const [n, e] of Object.entries(s.semantic[kind] || {})) {
                const base = `${P}/${kind}/${n}`, css = `motion-${kind}-${kebab(n)}`;
                for (const f of FIELDS) {
                    const v = e[f];
                    if (v == null)
                        continue;
                    const r = tokenRefPath(v), name = `${base}/${f}`;
                    declare(name, f === 'easing' ? 'STRING' : 'FLOAT', `${css}-${f}`, f === 'easing' ? 'CSS easing' : f === 'distance' ? 'px' : 'ms');
                    if (r)
                        put(name, modeId, { type: 'VARIABLE_ALIAS', id: vid(`${P}/${r.replace('.', '/')}`) });
                    else
                        put(name, modeId, f === 'easing' ? String(v) : typeof v === 'number' ? v : parseFloat(String(v)) || 0);
                }
                if (e.spring != null) {
                    const r = tokenRefPath(e.spring);
                    for (const f of SPRING) {
                        const name = `${base}/spring/${f}`;
                        declare(name, 'FLOAT', `${css}-spring-${f}`, `spring ${f}`);
                        put(name, modeId, r ? { type: 'VARIABLE_ALIAS', id: vid(`${P}/spring/${r.split('.')[1]}/${f}`) } : e.spring[f]);
                    }
                }
            }
    return body;
}
/** Normalize a GET /variables/local response or a POST body into collections + variables. */
function normalize(json) {
    const cols = {};
    const vars = [];
    if (isObj(json?.meta?.variables)) {
        for (const c of Object.values(json.meta.variableCollections || {}))
            cols[c.id] = { name: c.name, def: c.defaultModeId, modes: (c.modes || []).map((m) => ({ id: m.modeId, name: m.name })) };
        for (const v of Object.values(json.meta.variables))
            vars.push({ id: v.id, name: v.name, type: v.resolvedType, col: v.variableCollectionId, values: { ...(v.valuesByMode || {}) } });
    }
    else if (Array.isArray(json?.variables)) {
        for (const c of json.variableCollections || [])
            if (c.action !== 'DELETE')
                cols[c.id] = { name: c.name, def: c.initialModeId, modes: [] };
        for (const m of json.variableModes || [])
            if (m.action !== 'DELETE' && cols[m.variableCollectionId])
                cols[m.variableCollectionId].modes.push({ id: m.id, name: m.name });
        for (const c of Object.values(cols))
            if (!c.modes.some((m) => m.id === c.def))
                c.modes.unshift({ id: c.def, name: 'Default' });
        const byId = {};
        for (const v of json.variables)
            if (v.action !== 'DELETE')
                vars.push((byId[v.id] = { id: v.id, name: v.name, type: v.resolvedType, col: v.variableCollectionId, values: {} }));
        for (const x of json.variableModeValues || [])
            if (byId[x.variableId])
                byId[x.variableId].values[x.modeId] = x.value;
    }
    else
        throw new Error('[motionary] tokens: not a Figma Variables response (meta.variables) or POST body (variables[])');
    return { cols, vars };
}
/**
 * Read a Figma Variables `GET /v1/files/:key/variables/local` response (or a `POST` body) into a token set,
 * merged over `base`. The collection's default mode is the set; other modes become token-set modes holding only
 * what differs ("Reduced motion" / "Reduce motion" → `reduced`, "Dense UI" → `dense-ui`).
 */
function motionTokensFromFigma(json, o = {}) {
    var _a, _b, _c, _d;
    const P = (o.prefix || 'motion') + '/';
    const { cols, vars } = normalize(json);
    const mine = vars.filter((v) => typeof v.name === 'string' && v.name.startsWith(P) && (v.type === 'FLOAT' || v.type === 'STRING'));
    const colId = Object.keys(cols).find((id) => (o.collection ? cols[id].name === o.collection : mine.some((v) => v.col === id))) || mine[0]?.col;
    const col = colId ? cols[colId] : undefined;
    const list = mine.filter((v) => v.col === colId);
    const byId = {};
    for (const v of vars)
        byId[v.id] = v;
    const val = (v, mode) => (mode in v.values ? v.values[mode] : v.values[col?.def ?? '']);
    // a value in a mode, aliases followed to a literal
    const literal = (v, mode, depth = 0) => {
        const x = val(v, mode);
        if (isObj(x) && x.type === 'VARIABLE_ALIAS')
            return depth < 16 && byId[x.id] ? literal(byId[x.id], mode, depth + 1) : undefined;
        return x;
    };
    const split = (v) => v.name.slice(P.length).split('/');
    const read = (mode) => {
        var _a, _b, _c;
        const t = { duration: {}, easing: {}, distance: {}, spring: {}, semantic: {} };
        const sem = {};
        for (const v of list) {
            const parts = split(v), [g, n, f, sf] = parts;
            if ((g === 'duration' || g === 'distance') && parts.length === 2) {
                const x = literal(v, mode);
                if (typeof x === 'number')
                    t[g][n] = x;
            }
            else if (g === 'easing' && parts.length === 2) {
                const x = literal(v, mode);
                if (typeof x === 'string')
                    t.easing[n] = x;
            }
            else if (g === 'spring' && parts.length === 3 && SPRING.includes(f)) {
                const x = literal(v, mode);
                if (typeof x === 'number')
                    ((_a = t.spring)[n] || (_a[n] = {}))[f] = x;
            }
            else if (SEMANTIC_KINDS.includes(g) && n) {
                const e = ((_b = (sem[g] || (sem[g] = {})))[n] || (_b[n] = {}));
                const raw = val(v, mode), target = isObj(raw) && raw.type === 'VARIABLE_ALIAS' ? byId[raw.id] : undefined;
                const tp = target && target.name.startsWith(P) ? split(target) : undefined;
                if (FIELDS.includes(f) && parts.length === 3) {
                    const want = f === 'delay' ? 'duration' : f;
                    e[f] = tp && tp.length === 2 && tp[0] === want ? `{${want}.${tp[1]}}` : literal(v, mode);
                }
                else if (f === 'spring' && SPRING.includes(sf)) {
                    (e.$spring || (e.$spring = {}))[sf] = tp && tp.length === 3 && tp[0] === 'spring' && tp[2] === sf ? `ref:${tp[1]}` : literal(v, mode);
                }
            }
        }
        for (const [k, grp] of Object.entries(sem))
            for (const [n, e] of Object.entries(grp)) {
                if (e.$spring) {
                    const refs = SPRING.map((f) => e.$spring[f]);
                    e.spring = refs.every((r) => typeof r === 'string' && r === refs[0] && r.startsWith('ref:')) ? `{spring.${refs[0].slice(4)}}` : { stiffness: +refs[0], damping: +refs[1], mass: +refs[2] };
                    delete e.$spring;
                }
                for (const f of Object.keys(e))
                    if (e[f] === undefined)
                        delete e[f];
                ((_c = t.semantic)[k] || (_c[k] = {}))[n] = e;
            }
        return t;
    };
    const def = col?.def ?? '';
    const base = read(def);
    const modes = {};
    for (const m of col?.modes || []) {
        if (m.id === def)
            continue;
        const t = read(m.id), d = {};
        for (const g of ['duration', 'easing', 'distance'])
            for (const [k, v] of Object.entries(t[g]))
                if (base[g][k] !== v)
                    ((d[g] || (d[g] = {}))[k] = v);
        for (const [k, v] of Object.entries(t.spring))
            for (const f of SPRING)
                if (base.spring[k]?.[f] !== v[f])
                    (((_a = (d.spring || (d.spring = {})))[k] || (_a[k] = {}))[f] = v[f]);
        for (const [kind, grp] of Object.entries(t.semantic))
            for (const [n, e] of Object.entries(grp))
                for (const [f, v] of Object.entries(e))
                    if (JSON.stringify(base.semantic[kind]?.[n]?.[f]) !== JSON.stringify(v))
                        (((_c = ((_b = (d.semantic || (d.semantic = {})))[kind] || (_b[kind] = {})))[n] || (_c[n] = {}))[f] = v);
        if (Object.keys(d).length)
            modes[modeKey(m.name)] = d;
    }
    const out = defineMotionTokens({ ...base, semantic: {}, modes }, o.base || MOTION_TOKENS_2);
    for (const k of Object.keys(base.semantic))
        for (const n of Object.keys(base.semantic[k]))
            ((_d = out.semantic)[k] || (_d[k] = {}))[n] = base.semantic[k][n];
    return out;
}

exports.validateDesignTokens = components_tokens.validateDesignTokens;
exports.GENTLE_MOTION_MODE = GENTLE_MOTION_MODE;
exports.MOTION_TOKENS_2 = MOTION_TOKENS_2;
exports.MOTION_TOKENS_VERSION = MOTION_TOKENS_VERSION;
exports.REDUCED_MOTION_MODE = REDUCED_MOTION_MODE;
exports.SEMANTIC_KINDS = SEMANTIC_KINDS;
exports.applyMotionTokenSet = applyMotionTokenSet;
exports.defineMotionTokens = defineMotionTokens;
exports.gentleMotionOverrides = gentleMotionOverrides;
exports.isCssEasing = isCssEasing;
exports.kebab = kebab;
exports.motionKeyframes = motionKeyframes;
exports.motionOptions = motionOptions;
exports.motionTokenSetFromDTCG = motionTokenSetFromDTCG;
exports.motionTokenSetToCss = motionTokenSetToCss;
exports.motionTokenSetToDTCG = motionTokenSetToDTCG;
exports.motionTokenSetVars = motionTokenSetVars;
exports.motionTokensFromFigma = motionTokensFromFigma;
exports.motionTokensToFigma = motionTokensToFigma;
exports.prefersReducedMotion = prefersReducedMotion;
exports.reducedMotionOverrides = reducedMotionOverrides;
exports.resolveMotionToken = resolveMotionToken;
exports.resolveSemantic = resolveSemantic;
exports.toSceneTokens = toSceneTokens;
exports.tokenRefPath = tokenRefPath;
exports.validateMotionTokens = validateMotionTokens;
exports.withMode = withMode;
exports.withSceneTokens = withSceneTokens;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v16.0.0/dist/components/motion-tokens.cjs.map