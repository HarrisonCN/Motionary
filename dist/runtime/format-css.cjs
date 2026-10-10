'use strict';

var registry = require('../chunks/registry-U0scTJZr.cjs');
var keyframes = require('../chunks/keyframes-DA6Ie3XT.cjs');
require('../chunks/tween-DRtewovf.cjs');
require('../chunks/ticker-D58R9_k6.cjs');
require('../chunks/ease-HwYZnZat.cjs');

/**
 * `motionary/runtime/format-css` (10.1) — import CSS `@keyframes` and Web
 * Animations API keyframes into the runtime timeline.
 *
 * - `parseKeyframes(cssText)` — every `@keyframes` block of a stylesheet
 *   (incl. `-webkit-`), percentages / `from` / `to` / lists (`0%, 100%`),
 *   per-frame `animation-timing-function`, `!important` ignored as in CSS.
 * - `fromCssRule(rule)` — a live `CSSKeyframesRule`.
 * - `fromWaapi(keyframes)` — array form (`[{ opacity: 0 }, { opacity: 1, offset: .8 }]`)
 *   and property-indexed form (`{ opacity: [0, 1], easing: 'ease-out' }`), with
 *   offsets distributed like the WAAPI.
 * - `playKeyframes(target, frames, { duration, … })` — a runtime `Timeline`.
 *
 * Unsupported (documented in docs/runtime/format-css.md): `composite: add / accumulate`,
 * `@property` typed interpolation, 3D / matrix transforms (switch discretely).
 */
/** Strip comments. */
const clean = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');
function block(css, open) {
    let depth = 0;
    for (let i = open; i < css.length; i++) {
        if (css[i] === '{')
            depth++;
        else if (css[i] === '}' && --depth === 0)
            return [css.slice(open + 1, i), i + 1];
    }
    throw new Error('[motionary] format-css: unbalanced braces in @keyframes');
}
function decls(body) {
    const props = {};
    let easing;
    // split on ';' outside parentheses
    let depth = 0, cur = '';
    const parts = [];
    for (const ch of body) {
        if (ch === '(')
            depth++;
        if (ch === ')')
            depth--;
        if (ch === ';' && !depth) {
            parts.push(cur);
            cur = '';
        }
        else
            cur += ch;
    }
    parts.push(cur);
    for (const p of parts) {
        const i = p.indexOf(':');
        if (i < 0)
            continue;
        const k = p.slice(0, i).trim();
        const v = p.slice(i + 1).replace(/!important/i, '').trim();
        if (!k || !v)
            continue;
        if (k === 'animation-timing-function' || k === '-webkit-animation-timing-function')
            easing = v;
        else
            props[keyframes.camelProp(k)] = v;
    }
    return { props, easing };
}
const offsetOf = (sel) => {
    const s = sel.trim().toLowerCase();
    if (s === 'from')
        return 0;
    if (s === 'to')
        return 1;
    const n = parseFloat(s);
    if (!s.endsWith('%') || !Number.isFinite(n))
        throw new Error(`[motionary] format-css: bad keyframe selector "${sel}"`);
    return n / 100;
};
/** Parse the body of one `@keyframes` block. */
function parseKeyframesBody(body) {
    const frames = [];
    let i = 0;
    while (i < body.length) {
        const open = body.indexOf('{', i);
        if (open < 0)
            break;
        const sel = body.slice(i, open);
        const [inner, end] = block(body, open);
        const d = decls(inner);
        for (const part of sel.split(','))
            if (part.trim())
                frames.push({ offset: offsetOf(part), props: { ...d.props }, ...(d.easing ? { easing: d.easing } : {}) });
        i = end;
    }
    // merge duplicate offsets (later declarations win, as in CSS)
    const by = new Map();
    for (const f of frames.sort((a, b) => a.offset - b.offset)) {
        const prev = by.get(f.offset);
        by.set(f.offset, prev ? { offset: f.offset, props: { ...prev.props, ...f.props }, easing: f.easing ?? prev.easing } : f);
    }
    return Array.from(by.values());
}
/** Every `@keyframes` block in a stylesheet's text. */
function parseKeyframes(cssText) {
    const css = clean(cssText);
    const out = [];
    const re = /@(?:-webkit-|-moz-)?keyframes\s+(["']?)([\w-]+)\1\s*\{/g;
    let m;
    while ((m = re.exec(css))) {
        const [body, end] = block(css, m.index + m[0].length - 1);
        out.push({ name: m[2], frames: parseKeyframesBody(body) });
        re.lastIndex = end;
    }
    return out;
}
/** A live `CSSKeyframesRule` (e.g. from `document.styleSheets`). */
function fromCssRule(rule) {
    const css = rule.cssText;
    const open = css.indexOf('{');
    return { name: rule.name, frames: parseKeyframesBody(block(css, open)[0]) };
}
/** WAAPI keyframes (array or property-indexed form) → frames. */
function fromWaapi(kf) {
    let list;
    if (Array.isArray(kf))
        list = kf;
    else {
        const n = Math.max(...Object.entries(kf).filter(([k]) => k !== 'easing' && k !== 'offset' && k !== 'composite').map(([, v]) => (Array.isArray(v) ? v.length : 1)));
        list = Array.from({ length: n }, (_, i) => {
            const f = {};
            for (const [k, v] of Object.entries(kf)) {
                if (k === 'composite')
                    continue;
                const arr = Array.isArray(v) ? v : [v];
                if (k === 'offset') {
                    if (arr[i] !== undefined)
                        f.offset = arr[i];
                    continue;
                }
                if (k === 'easing') {
                    const e = arr[Math.min(i, arr.length - 1)];
                    if (e !== undefined)
                        f.easing = e;
                    continue;
                }
                if (arr.length === 1 && n > 1) {
                    if (i === n - 1)
                        f[k] = arr[0];
                    continue;
                }
                if (arr[i] !== undefined)
                    f[k] = arr[i];
            }
            return f;
        });
    }
    return keyframes.distributeOffsets(list).map((f) => {
        const props = {};
        for (const [k, v] of Object.entries(f))
            if (k !== 'offset' && k !== 'easing' && k !== 'composite' && (typeof v === 'string' || typeof v === 'number'))
                props[keyframes.camelProp(k === 'cssFloat' ? 'float' : k)] = v;
        return { offset: f.offset, props, ...(f.easing ? { easing: f.easing } : {}) };
    });
}
/** Frames in WAAPI array form (for `element.animate()`). */
function toWaapi(frames) {
    return frames.map((f) => ({ ...f.props, offset: f.offset, ...(f.easing ? { easing: f.easing } : {}) }));
}
/** Play frames (or a `KeyframesDef`) on a target. Returns the runtime timeline (playing unless `paused: true`). */
function playKeyframes(target, frames, o = {}) {
    return keyframes.framesToTimeline(target, Array.isArray(frames) ? frames : frames.frames, { ...o, paused: o.paused ?? false });
}
/** The module object for `use(formatCss)`. */
const formatCss = { id: 'format-css', version: registry.RUNTIME_VERSION, tier: 'basic', requires: ['core'], api: { parseKeyframes, fromCssRule, fromWaapi, toWaapi, playKeyframes } };

exports.formatCss = formatCss;
exports.fromCssRule = fromCssRule;
exports.fromWaapi = fromWaapi;
exports.parseKeyframes = parseKeyframes;
exports.parseKeyframesBody = parseKeyframesBody;
exports.playKeyframes = playKeyframes;
exports.toWaapi = toWaapi;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.6.0/dist/runtime/format-css.cjs.map