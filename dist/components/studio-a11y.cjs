'use strict';

/**
 * 15.3: accessible & responsive motion — `motionary/studio/a11y` (= `motionary/components/studio-a11y`).
 *
 * Motion sensitivity tiers (`full` / `gentle` / `reduced`) and breakpoint variants for Scene v2 documents, as pure
 * data transforms: `resolveVariant(doc, { width, sensitivity })` returns a plain Scene v2 document, so the Studio
 * preview, the 14.7 standalone export and the 15.2 native exporters all play exactly the same motion for a context.
 *
 * Variants live in `meta["motionary:variants"]`:
 * `[{ id, media: { minWidth?, maxWidth? }, layers: { [layerId]: { muted?, distanceScale?, timeScale? } } }]`
 * (`minWidth` inclusive, `maxWidth` exclusive, first match wins). Pure, no DOM except `motionSensitivity()`.
 */
const STUDIO_A11Y_VERSION = 1;
const MOTION_SENSITIVITIES = ['full', 'gentle', 'reduced'];
const VARIANTS_META_KEY = 'motionary:variants';
const VARIANT_META_KEY = 'motionary:variant';
const STANDARD = 'cubic-bezier(0.2, 0, 0, 1)';
const CAP = { full: Infinity, gentle: 600, reduced: 150 };
const TRAVEL = { full: 1, gentle: 0.5, reduced: 0 };
const clone = (x) => JSON.parse(JSON.stringify(x));
const r3 = (n) => { const r = Math.round(n * 1000) / 1000; return Object.is(r, -0) ? 0 : r; };
const isObj = (x) => !!x && typeof x === 'object' && !Array.isArray(x);
function overshoots(e) {
    const m = typeof e === 'string' && /^cubic-bezier\(([^)]*)\)$/.exec(e.trim());
    if (!m)
        return false;
    const n = m[1].split(',').map(Number);
    return n.length === 4 && (n[1] < 0 || n[1] > 1 || n[3] < 0 || n[3] > 1);
}
/** Scale the travel in a CSS transform: lengths and angles × k, scale halfway (k) to 1 (`translateOnly`: just the translations). Unknown functions are kept. */
function scaleTransform(t, k, translateOnly = false) {
    if (k === 1)
        return t;
    return String(t).replace(/([a-zA-Z0-9]+)\(([^)]*)\)/g, (all, fn, args) => {
        const parts = args.split(',').map((s) => s.trim());
        const num = (a, f) => { const m = /^(-?[\d.]+)([a-z%]*)$/i.exec(a); return m ? `${r3(f(parseFloat(m[1])))}${m[2]}` : a; };
        if (translateOnly && !/^translate/.test(fn))
            return all;
        if (/^translate(X|Y|Z|3d)?$/.test(fn) || /^rotate(X|Y|Z)?$/.test(fn) || /^skew(X|Y)?$/.test(fn))
            return `${fn}(${parts.map((a) => num(a, (n) => n * k)).join(', ')})`;
        if (/^scale(X|Y|Z|3d)?$/.test(fn))
            return `${fn}(${parts.map((a) => num(a, (n) => 1 + (n - 1) * k)).join(', ')})`;
        return all;
    });
}
function scaleTimes(layers, f) {
    if (f === 1)
        return;
    for (const l of layers)
        for (const kf of l.keyframes || [])
            kf.time = r3(kf.time * f);
}
const docEnd = (d) => (typeof d.duration === 'number' ? d.duration : Math.max(0, ...d.layers.flatMap((l) => (l.keyframes || []).map((k) => k.time))));
/** The document as seen at a sensitivity level. `full` returns an equal copy. */
function applySensitivity(doc, level = 'full') {
    if (!MOTION_SENSITIVITIES.includes(level))
        throw new Error(`[motionary] unknown motion sensitivity "${level}" — use full, gentle or reduced`);
    const d = clone(doc);
    if (level === 'full')
        return d;
    const k = TRAVEL[level];
    for (const l of d.layers || [])
        for (const kf of l.keyframes || []) {
            if (kf.props && typeof kf.props.transform === 'string')
                kf.props.transform = scaleTransform(kf.props.transform, k);
            if (overshoots(kf.easing))
                kf.easing = STANDARD;
        }
    const end = docEnd(d);
    if (end > CAP[level]) {
        const f = CAP[level] / end;
        scaleTimes(d.layers || [], f);
        d.duration = CAP[level];
    }
    return d;
}
/** The variants a document declares (copies; invalid entries skipped — see validateVariants). */
function variantsOf(doc) {
    const v = isObj(doc) && isObj(doc.meta) ? doc.meta[VARIANTS_META_KEY] : undefined;
    return Array.isArray(v) ? v.filter((x) => isObj(x) && typeof x.id === 'string' && isObj(x.media)).map(clone) : [];
}
/** `[]` or the problems with `meta["motionary:variants"]`. */
function validateVariants(doc) {
    const out = [], v = isObj(doc) && isObj(doc.meta) ? doc.meta[VARIANTS_META_KEY] : undefined;
    if (v === undefined)
        return out;
    if (!Array.isArray(v))
        return ['meta["motionary:variants"]: expected an array'];
    const ids = new Set((doc.layers || []).map((l) => l.id)), seen = new Set();
    v.forEach((x, i) => {
        const at = `variants[${i}]`;
        if (!isObj(x)) {
            out.push(`${at}: expected an object`);
            return;
        }
        if (typeof x.id !== 'string' || !x.id)
            out.push(`${at}.id: required`);
        else if (seen.has(x.id))
            out.push(`${at}.id: duplicate "${x.id}"`);
        else
            seen.add(x.id);
        const m = x.media;
        if (!isObj(m))
            out.push(`${at}.media: expected { minWidth?, maxWidth? }`);
        else {
            for (const k of ['minWidth', 'maxWidth'])
                if (m[k] !== undefined && !(typeof m[k] === 'number' && m[k] >= 0))
                    out.push(`${at}.media.${k}: expected a number ≥ 0`);
            if (typeof m.minWidth === 'number' && typeof m.maxWidth === 'number' && m.minWidth >= m.maxWidth)
                out.push(`${at}.media: minWidth ${m.minWidth} must be below maxWidth ${m.maxWidth}`);
        }
        if (x.layers !== undefined) {
            if (!isObj(x.layers))
                out.push(`${at}.layers: expected an object`);
            else
                for (const [id, o] of Object.entries(x.layers)) {
                    if (!ids.has(id))
                        out.push(`${at}.layers: unknown layer "${id}"`);
                    if (!isObj(o)) {
                        out.push(`${at}.layers.${id}: expected an object`);
                        continue;
                    }
                    if (o.muted !== undefined && typeof o.muted !== 'boolean')
                        out.push(`${at}.layers.${id}.muted: expected a boolean`);
                    for (const k of ['distanceScale', 'timeScale'])
                        if (o[k] !== undefined && !(typeof o[k] === 'number' && o[k] >= 0 && o[k] <= 4))
                            out.push(`${at}.layers.${id}.${k}: expected a number 0–4`);
                }
        }
    });
    return out;
}
const matches = (m, w) => (m.minWidth === undefined || w >= m.minWidth) && (m.maxWidth === undefined || w < m.maxWidth);
/** The plain Scene v2 document for a context: the first matching variant, then the sensitivity. */
function resolveVariant(doc, ctx = {}) {
    let d = clone(doc);
    const v = ctx.width === undefined ? undefined : variantsOf(doc).find((x) => matches(x.media, ctx.width));
    if (v) {
        for (const [id, o] of Object.entries(v.layers || {})) {
            const l = (d.layers || []).find((x) => x.id === id);
            if (!l)
                continue;
            if (o.muted)
                l.muted = true;
            if (typeof o.distanceScale === 'number')
                for (const kf of l.keyframes || [])
                    if (kf.props && typeof kf.props.transform === 'string')
                        kf.props.transform = scaleTransform(kf.props.transform, o.distanceScale, true);
            if (typeof o.timeScale === 'number')
                for (const kf of l.keyframes || [])
                    kf.time = r3(kf.time * o.timeScale);
        }
        d.meta = { ...(d.meta || {}), [VARIANT_META_KEY]: v.id };
    }
    if (ctx.sensitivity && ctx.sensitivity !== 'full')
        d = applySensitivity(d, ctx.sensitivity);
    return d;
}
/** The viewer's level: `reduced` when the OS asks for it, else `<html data-usa-motion-mode~="gentle">`, else `full`. */
function motionSensitivity(root = globalThis.document?.documentElement) {
    if (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)')?.matches)
        return 'reduced';
    const m = (root?.getAttribute?.('data-usa-motion-mode') || '').split(/\s+/);
    return m.includes('reduced') ? 'reduced' : m.includes('gentle') ? 'gentle' : 'full';
}

exports.MOTION_SENSITIVITIES = MOTION_SENSITIVITIES;
exports.STUDIO_A11Y_VERSION = STUDIO_A11Y_VERSION;
exports.VARIANTS_META_KEY = VARIANTS_META_KEY;
exports.VARIANT_META_KEY = VARIANT_META_KEY;
exports.applySensitivity = applySensitivity;
exports.motionSensitivity = motionSensitivity;
exports.resolveVariant = resolveVariant;
exports.scaleTransform = scaleTransform;
exports.validateVariants = validateVariants;
exports.variantsOf = variantsOf;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v15.9.0/dist/components/studio-a11y.cjs.map