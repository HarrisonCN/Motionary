/**
 * use-scroll-animate/components/tokens — motion design tokens (4.2).
 *
 * One source of truth for durations, easings and springs: as CSS custom
 * properties (`--usa-duration-fast`, `--usa-easing-emphasized`,
 * `--usa-spring-bouncy-stiffness`…), as W3C Design Tokens JSON, and importable
 * from Figma Tokens (Tokens Studio) or Style Dictionary exports.
 *
 * ```ts
 * import { applyMotionTokens, importMotionTokens, motionToken } from 'use-scroll-animate/components/tokens';
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
let active = clone(MOTION_TOKENS);
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

export { MOTION_TOKENS, applyMotionTokens, getMotionTokens, importMotionTokens, mergeMotionTokens, motionToken, motionTokensToCss, motionTokensToJSON, motionTokensToVars, motionVar, parseDuration, parseEasing, resolveDurationToken, resolveEasingToken };
//# sourceMappingURL=tokens.js.map
