'use strict';

/**
 * Motion design tokens 2.0 (10.6): the W3C Design Tokens Community Group
 * format (DTCG, stable 2025.10) — import with alias resolution and
 * validation, export in the stable or the earlier draft shape.
 *
 * - `resolveTokenAliases(json)` — replaces `{group.token}` references
 *   (whole values and inside composite values), detects cycles and
 *   unknown references;
 * - `validateDesignTokens(json)` — problems (unknown `$type`, malformed
 *   durations / cubic béziers, broken aliases) without throwing;
 * - `importDesignTokens(json)` — resolve + import into `MotionTokens`
 *   (durations, easings, `transition` composites, springs from
 *   `$extensions["org.motionary"]`);
 * - `exportDesignTokens(tokens, { format })` — `2025.10` writes durations
 *   as `{ value, unit: "ms" }`, `draft` as `"150ms"`; springs travel in
 *   `$extensions["org.motionary"].spring` (springs are not a DTCG type).
 */
const REF = /^\{([^{}]+)\}$/;
const isTok = (o) => o && typeof o === 'object' && '$value' in o;
function lookup(root, path) {
    let n = root;
    for (const k of path.split('.'))
        n = n?.[k];
    return n;
}
/** Inherit `$type` from parent groups (DTCG) and resolve `{a.b}` aliases. Throws on cycles / missing targets. */
function resolveTokenAliases(json) {
    const root = JSON.parse(JSON.stringify(json));
    const resolving = new Set();
    const val = (v, at) => {
        if (typeof v === 'string') {
            const m = REF.exec(v.trim());
            if (!m)
                return v;
            const target = lookup(root, m[1]);
            if (!isTok(target))
                throw new Error(`[motionary] tokens: ${at} references {${m[1]}}, which is not a token`);
            if (resolving.has(m[1]))
                throw new Error(`[motionary] tokens: alias cycle through {${m[1]}}`);
            resolving.add(m[1]);
            const out = val(target.$value, m[1]);
            resolving.delete(m[1]);
            if (!target.$type && target.__type)
                target.$type = target.__type;
            return out;
        }
        if (Array.isArray(v))
            return v.map((x, i) => val(x, `${at}[${i}]`));
        if (v && typeof v === 'object')
            return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, val(x, `${at}.${k}`)]));
        return v;
    };
    const walk = (node, path, inherited) => {
        if (!node || typeof node !== 'object')
            return;
        const type = node.$type || inherited;
        if (isTok(node)) {
            if (!node.$type && type)
                node.$type = type;
            if (typeof node.$value === 'string' && REF.exec(node.$value.trim()) && !node.$type) {
                const t = lookup(root, REF.exec(node.$value.trim())[1]);
                if (t?.$type)
                    node.$type = t.$type;
            }
            return;
        }
        for (const [k, v] of Object.entries(node))
            if (!k.startsWith('$'))
                walk(v, [...path, k], type);
    };
    walk(root, []);
    const resolveAll = (node, path) => {
        if (!node || typeof node !== 'object')
            return;
        if (isTok(node)) {
            node.$value = val(node.$value, path.join('.'));
            return;
        }
        for (const [k, v] of Object.entries(node))
            if (!k.startsWith('$'))
                resolveAll(v, [...path, k]);
    };
    resolveAll(root, []);
    return root;
}
const TYPES = ['color', 'dimension', 'fontFamily', 'fontWeight', 'duration', 'cubicBezier', 'number', 'strokeStyle', 'border', 'transition', 'shadow', 'gradient', 'typography', 'string'];
/** Problems in a DTCG file (empty array = valid for motion purposes). */
function validateDesignTokens(json) {
    const out = [];
    let resolved;
    try {
        resolved = resolveTokenAliases(json);
    }
    catch (e) {
        return [String(e.message).replace('[motionary] tokens: ', '')];
    }
    const dur = (v) => (typeof v === 'object' && v && typeof v.value === 'number' && (v.unit === 'ms' || v.unit === 's')) || /^\d*\.?\d+(ms|s)$/.test(String(v));
    const walk = (node, path) => {
        if (!node || typeof node !== 'object')
            return;
        if (isTok(node)) {
            const p = path.join('.'), t = node.$type, v = node.$value;
            if (!t)
                out.push(`${p}: no $type (on the token or a parent group)`);
            else if (!TYPES.includes(t))
                out.push(`${p}: unknown $type "${t}"`);
            else if (t === 'duration' && !dur(v))
                out.push(`${p}: duration must be { value, unit: "ms" | "s" } (or "150ms" in the draft format)`);
            else if (t === 'cubicBezier' && !(Array.isArray(v) && v.length === 4 && v.every((n) => typeof n === 'number') && v[0] >= 0 && v[0] <= 1 && v[2] >= 0 && v[2] <= 1))
                out.push(`${p}: cubicBezier must be [x1, y1, x2, y2] with x in 0–1`);
            else if (t === 'transition' && !(v && dur(v.duration) && dur(v.delay ?? '0ms') && v.timingFunction))
                out.push(`${p}: transition needs duration, delay and timingFunction`);
            return;
        }
        for (const [k, v] of Object.entries(node))
            if (!k.startsWith('$'))
                walk(v, [...path, k]);
    };
    walk(resolved, []);
    return out;
}
/** Resolve aliases, then import (merged over `base`). Springs come from `$extensions["org.motionary"].spring`. */
function importDesignTokens(json, base = MOTION_TOKENS) {
    const r = resolveTokenAliases(json);
    const springs = {};
    const walk = (node, path) => {
        if (!node || typeof node !== 'object')
            return;
        const ext = node.$extensions?.['org.motionary'];
        if (ext?.spring)
            springs[path[path.length - 1]] = ext.spring;
        if (isTok(node))
            return;
        for (const [k, v] of Object.entries(node))
            if (!k.startsWith('$'))
                walk(v, [...path, k]);
    };
    walk(r, []);
    const t = importMotionTokens(r, base);
    for (const [k, s] of Object.entries(springs))
        t.spring[k] = { stiffness: +s.stiffness || 170, damping: +s.damping || 26, mass: +s.mass || 1 };
    return t;
}
/** Export motion tokens as a DTCG document. */
function exportDesignTokens(tokens = getMotionTokens(), o = {}) {
    const stable = (o.format || '2025.10') === '2025.10';
    const g = o.group || 'motion';
    const d = (ms) => (stable ? { value: ms, unit: 'ms' } : `${ms}ms`);
    const bez = (e) => {
        const m = /^cubic-bezier\(([^)]+)\)$/.exec(e.trim());
        if (m)
            return m[1].split(',').map(Number);
        return { linear: [0, 0, 1, 1], ease: [0.25, 0.1, 0.25, 1], 'ease-in': [0.42, 0, 1, 1], 'ease-out': [0, 0, 0.58, 1], 'ease-in-out': [0.42, 0, 0.58, 1] }[e.trim()] || null;
    };
    const doc = { $schema: 'https://www.designtokens.org/schemas/2025.10/format.json', [g]: { $description: 'Motion tokens exported by Motionary', duration: { $type: 'duration' }, easing: { $type: 'cubicBezier' } } };
    for (const [k, v] of Object.entries(tokens.duration))
        doc[g].duration[k] = { $value: d(v) };
    for (const [k, v] of Object.entries(tokens.easing)) {
        const b = bez(v);
        if (b)
            doc[g].easing[k] = { $value: b };
    }
    if (Object.keys(tokens.spring).length) {
        doc[g].spring = { $description: 'Spring parameters (not a DTCG type; carried in $extensions)' };
        for (const [k, v] of Object.entries(tokens.spring))
            doc[g].spring[k] = { $extensions: { 'org.motionary': { spring: { ...v } } } };
    }
    if (o.transitions?.length) {
        doc[g].transition = { $type: 'transition' };
        for (const [name, dur, ease] of o.transitions)
            doc[g].transition[name] = { $value: { duration: `{${g}.duration.${dur}}`, delay: d(0), timingFunction: `{${g}.easing.${ease}}` } };
    }
    return doc;
}

/**
 * motionary/components/tokens — motion design tokens (4.2).
 *
 * One source of truth for durations, easings and springs: as CSS custom
 * properties (`--usa-duration-fast`, `--usa-easing-emphasized`,
 * `--usa-spring-bouncy-stiffness`…), as W3C Design Tokens JSON, and importable
 * from Figma Tokens (Tokens Studio) or Style Dictionary exports.
 *
 * ```ts
 * import { applyMotionTokens, importMotionTokens, motionToken } from 'motionary/components/tokens';
 * applyMotionTokens(importMotionTokens(await (await fetch('/tokens.json')).json()));
 * el.animate(frames, { duration: motionToken('duration', 'slow'), easing: motionToken('easing', 'emphasized') });
 * ```
 */
/** The default motion scale (Material / Fluent-inspired). */
const MOTION_TOKENS = {
    duration: { instant: 0, fast: 150, normal: 300, slow: 600, slower: 900, slowest: 1400 },
    easing: {
        linear: 'linear',
        standard: 'cubic-bezier(0.2, 0, 0, 1)',
        emphasized: 'cubic-bezier(0.22, 1, 0.36, 1)',
        decelerate: 'cubic-bezier(0, 0, 0, 1)',
        accelerate: 'cubic-bezier(0.3, 0, 1, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
    spring: {
        gentle: { stiffness: 120, damping: 14, mass: 1 },
        snappy: { stiffness: 300, damping: 30, mass: 1 },
        bouncy: { stiffness: 260, damping: 12, mass: 1 },
        wobbly: { stiffness: 180, damping: 8, mass: 1 },
        stiff: { stiffness: 500, damping: 40, mass: 1 },
    },
};
let active = /*#__PURE__*/ clone(MOTION_TOKENS);
function clone(t) {
    return { duration: { ...t.duration }, easing: { ...t.easing }, spring: Object.fromEntries(Object.entries(t.spring).map(([k, v]) => [k, { ...v }])) };
}
/** Merge partial tokens over a base (defaults: the built-in scale). */
function mergeMotionTokens(partial, base = MOTION_TOKENS) {
    const out = clone(base);
    Object.assign(out.duration, partial.duration || {});
    Object.assign(out.easing, partial.easing || {});
    for (const [k, v] of Object.entries(partial.spring || {}))
        out.spring[k] = { ...(out.spring[k] || { stiffness: 170, damping: 26, mass: 1 }), ...v };
    return out;
}
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/[\s_.]+/g, '-').toLowerCase();
/** The custom-property map: `{ '--usa-duration-fast': '150ms', … }`. */
function motionTokensToVars(tokens = active, prefix = '--usa') {
    const vars = {};
    for (const [k, v] of Object.entries(tokens.duration))
        vars[`${prefix}-duration-${kebab(k)}`] = `${v}ms`;
    for (const [k, v] of Object.entries(tokens.easing))
        vars[`${prefix}-easing-${kebab(k)}`] = v;
    for (const [k, v] of Object.entries(tokens.spring)) {
        vars[`${prefix}-spring-${kebab(k)}-stiffness`] = String(v.stiffness);
        vars[`${prefix}-spring-${kebab(k)}-damping`] = String(v.damping);
        vars[`${prefix}-spring-${kebab(k)}-mass`] = String(v.mass);
    }
    return vars;
}
/** A stylesheet string: `:root { --usa-duration-fast: 150ms; … }`. */
function motionTokensToCss(tokens = active, selector = ':root', prefix = '--usa') {
    const body = Object.entries(motionTokensToVars(tokens, prefix)).map(([k, v]) => `  ${k}: ${v};`).join('\n');
    return `${selector} {\n${body}\n}\n`;
}
/** W3C Design Tokens (DTCG) JSON: `{ motion: { duration: { fast: { $type: 'duration', $value: '150ms' } } } }`. */
function motionTokensToJSON(tokens = active) {
    const grp = (o, f) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, f(v)]));
    return {
        motion: {
            duration: grp(tokens.duration, (v) => ({ $type: 'duration', $value: `${v}ms` })),
            easing: grp(tokens.easing, (v) => {
                const m = /^cubic-bezier\(([^)]+)\)$/.exec(v);
                return m ? { $type: 'cubicBezier', $value: m[1].split(',').map(Number) } : { $type: 'string', $value: v };
            }),
            spring: grp(tokens.spring, (v) => ({ $type: 'spring', $value: { ...v } })),
        },
    };
}
/** Parse `150ms`, `0.15s`, `150` → ms. */
function parseDuration(v) {
    if (typeof v === 'number' && isFinite(v))
        return v;
    if (typeof v === 'object' && v && 'value' in v && 'unit' in v)
        return parseDuration(`${v.value}${v.unit}`);
    const m = /^\s*(-?\d*\.?\d+)\s*(ms|s)?\s*$/.exec(String(v ?? ''));
    if (!m)
        return undefined;
    return m[2] === 's' ? Number(m[1]) * 1000 : Number(m[1]);
}
/** Parse `[x1,y1,x2,y2]`, `'cubic-bezier(…)'`, `'0.2, 0, 0, 1'` or a keyword → CSS easing. */
function parseEasing(v) {
    if (Array.isArray(v) && v.length === 4 && v.every((n) => typeof n === 'number'))
        return `cubic-bezier(${v.join(', ')})`;
    if (typeof v !== 'string' || !v.trim())
        return undefined;
    const s = v.trim();
    if (/^-?\d*\.?\d+(\s*,\s*-?\d*\.?\d+){3}$/.test(s))
        return `cubic-bezier(${s.split(/\s*,\s*/).join(', ')})`;
    return s;
}
const isLeaf = (o) => o && typeof o === 'object' && ('$value' in o || 'value' in o);
const leafValue = (o) => ('$value' in o ? o.$value : o.value);
const leafType = (o) => String(o.$type ?? o.type ?? '').toLowerCase();
/**
 * Import tokens from W3C DTCG JSON, Figma Tokens / Tokens Studio
 * (`{ value, type }`) or Style Dictionary (`{ value }`, nested) — anything
 * under a `duration` / `easing` / `spring` group (any depth, e.g.
 * `motion.duration.fast` or `global.animation.easing.out`), or typed leaves
 * (`duration`, `cubicBezier`, `transition`, `spring`). Unknown values are
 * skipped; the result is merged over the defaults.
 */
function importMotionTokens(json, base = MOTION_TOKENS) {
    const partial = { duration: {}, easing: {}, spring: {} };
    const walk = (node, path) => {
        if (!node || typeof node !== 'object')
            return;
        if (isLeaf(node)) {
            const name = path[path.length - 1];
            const type = leafType(node);
            const group = path.slice(0, -1).map((p) => p.toLowerCase());
            const val = leafValue(node);
            const inGroup = (g) => group.some((p) => g.includes(p));
            if (type === 'duration' || (!type && inGroup(['duration', 'durations'])) || (type !== 'cubicbezier' && inGroup(['duration', 'durations']))) {
                const ms = parseDuration(val);
                if (ms !== undefined)
                    partial.duration[name] = ms;
            }
            else if (type === 'cubicbezier' || type === 'easing' || inGroup(['easing', 'easings', 'ease'])) {
                const e = parseEasing(val);
                if (e)
                    partial.easing[name] = e;
            }
            else if (type === 'spring' || inGroup(['spring', 'springs'])) {
                if (val && typeof val === 'object')
                    partial.spring[name] = { stiffness: Number(val.stiffness ?? 170), damping: Number(val.damping ?? 26), mass: Number(val.mass ?? 1) };
            }
            else if (type === 'transition' && val && typeof val === 'object') {
                const ms = parseDuration(val.duration);
                if (ms !== undefined)
                    partial.duration[name] = ms;
                const e = parseEasing(val.timingFunction);
                if (e)
                    partial.easing[name] = e;
            }
            return;
        }
        for (const [k, v] of Object.entries(node))
            if (!k.startsWith('$'))
                walk(v, [...path, k]);
    };
    walk(json, []);
    return mergeMotionTokens(partial, base);
}
/** The tokens currently applied (via `applyMotionTokens`), or the defaults. */
function getMotionTokens() {
    return clone(active);
}
/**
 * Write tokens as CSS custom properties on `root` (default `<html>`) and make
 * them the active set for `motionToken()`. Returns an undo function.
 */
function applyMotionTokens(tokens = MOTION_TOKENS, root, prefix = '--usa') {
    const prev = active;
    active = mergeMotionTokens(tokens, MOTION_TOKENS);
    const el = root || (typeof document !== 'undefined' ? document.documentElement : null);
    const vars = motionTokensToVars(active, prefix);
    const old = {};
    if (el)
        for (const [k, v] of Object.entries(vars))
            ((old[k] = el.style.getPropertyValue(k)), el.style.setProperty(k, v));
    return () => {
        active = prev;
        if (el)
            for (const [k, v] of Object.entries(old))
                v ? el.style.setProperty(k, v) : el.style.removeProperty(k);
    };
}
function motionToken(group, name) {
    const g = active[group];
    return g[name] ?? MOTION_TOKENS[group][name];
}
/** `var(--usa-duration-fast, 150ms)` — a CSS reference with the current value as fallback. */
function motionVar(group, name, prop, prefix = '--usa') {
    if (group === 'spring') {
        const s = motionToken('spring', name);
        const p = prop || 'stiffness';
        return `var(${prefix}-spring-${kebab(name)}-${p}, ${s ? s[p] : ''})`;
    }
    const v = group === 'duration' ? `${motionToken('duration', name)}ms` : motionToken('easing', name);
    return `var(${prefix}-${group}-${kebab(name)}, ${v})`;
}
/** Resolve a duration that may be a token name (`'fast'`) or ms. */
function resolveDurationToken(v, fallback) {
    if (typeof v === 'number')
        return v;
    if (typeof v === 'string')
        return (active.duration[v] ?? parseDuration(v)) ?? fallback;
    return fallback;
}
/** Resolve an easing that may be a token name (`'emphasized'`) or CSS. */
function resolveEasingToken(v, fallback) {
    if (!v)
        return fallback;
    return active.easing[v] ?? v;
}

exports.MOTION_TOKENS = MOTION_TOKENS;
exports.applyMotionTokens = applyMotionTokens;
exports.exportDesignTokens = exportDesignTokens;
exports.getMotionTokens = getMotionTokens;
exports.importDesignTokens = importDesignTokens;
exports.importMotionTokens = importMotionTokens;
exports.mergeMotionTokens = mergeMotionTokens;
exports.motionToken = motionToken;
exports.motionTokensToCss = motionTokensToCss;
exports.motionTokensToJSON = motionTokensToJSON;
exports.motionTokensToVars = motionTokensToVars;
exports.motionVar = motionVar;
exports.parseDuration = parseDuration;
exports.parseEasing = parseEasing;
exports.resolveDurationToken = resolveDurationToken;
exports.resolveEasingToken = resolveEasingToken;
exports.resolveTokenAliases = resolveTokenAliases;
exports.validateDesignTokens = validateDesignTokens;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.5.0/dist/components/tokens.cjs.map