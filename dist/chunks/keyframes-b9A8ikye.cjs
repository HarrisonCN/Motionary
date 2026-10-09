'use strict';

var tween = require('./tween-CTo0OifR.cjs');
var ease = require('./ease-HwYZnZat.cjs');

/**
 * Normalised keyframes shared by the format loaders: a list of frames with
 * offsets in [0, 1], camelCase props and an optional per-segment easing,
 * played as a runtime `Timeline` (one tween per segment).
 */
const camelProp = (k) => (k.startsWith('--') ? k : k.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase()));
/** Fill in missing offsets (spaced evenly between known ones, first 0 / last 1), as the WAAPI does. */
function distributeOffsets(frames) {
    const out = frames.map((f) => ({ ...f }));
    if (!out.length)
        return out;
    if (out[0].offset == null)
        out[0].offset = out.length === 1 ? 1 : 0;
    if (out[out.length - 1].offset == null)
        out[out.length - 1].offset = 1;
    let i = 0;
    while (i < out.length) {
        if (out[i].offset != null) {
            i++;
            continue;
        }
        const a = i - 1;
        let b = i;
        while (out[b].offset == null)
            b++;
        const from = out[a].offset, to = out[b].offset;
        for (let k = i; k < b; k++)
            out[k].offset = from + ((to - from) * (k - a)) / (b - a);
        i = b;
    }
    return out;
}
/** CSS transform functions → runtime transform shorthands (translate/rotate/scale/skew); null when not representable (matrix, 3D, …). */
function transformToProps(t) {
    if (!t || t === 'none')
        return { x: 0, y: 0, rotate: 0, scale: 1 };
    const out = {};
    const re = /([a-zA-Z][a-zA-Z0-9]*)\(([^)]*)\)/g;
    let m;
    let rest = t;
    while ((m = re.exec(t))) {
        rest = rest.replace(m[0], '');
        const args = m[2].split(/[\s,]+/).filter(Boolean);
        switch (m[1]) {
            case 'translate':
                out.x = args[0];
                out.y = args[1] ?? 0;
                break;
            case 'translateX':
                out.x = args[0];
                break;
            case 'translateY':
                out.y = args[0];
                break;
            case 'translate3d':
                if (parseFloat(args[2] || '0') !== 0)
                    return null;
                out.x = args[0];
                out.y = args[1] ?? 0;
                break;
            case 'scale3d':
                if (parseFloat(args[2] ?? '1') !== 1)
                    return null;
                if (args[1] !== undefined && args[1] !== args[0]) {
                    out.scaleX = +args[0];
                    out.scaleY = +args[1];
                }
                else
                    out.scale = +args[0];
                break;
            case 'rotate':
            case 'rotateZ':
                out.rotate = args[0];
                break;
            case 'scale':
                if (args[1] !== undefined && args[1] !== args[0]) {
                    out.scaleX = +args[0];
                    out.scaleY = +args[1];
                }
                else
                    out.scale = +args[0];
                break;
            case 'scaleX':
                out.scaleX = +args[0];
                break;
            case 'scaleY':
                out.scaleY = +args[0];
                break;
            case 'skewX':
                out.skewX = args[0];
                break;
            case 'skewY':
                out.skewY = args[0];
                break;
            default: return null;
        }
    }
    return rest.trim() ? null : out;
}
/** Expand `transform` into shorthands where possible (kept as a discrete prop otherwise). */
function expandProps(props) {
    const out = {};
    for (const [k, v] of Object.entries(props)) {
        if (k === 'transform' && typeof v === 'string') {
            const t = transformToProps(v);
            if (t) {
                Object.assign(out, t);
                continue;
            }
        }
        out[k] = v;
    }
    return out;
}
const tweenable = (v) => {
    try {
        tween.parseValue(v);
        return true;
    }
    catch {
        return false;
    }
};
/**
 * Play frames on a target as a `Timeline` (paused unless `paused: false`).
 * Props missing from a frame hold their previous value; non-numeric values
 * (e.g. `display`, `matrix(...)`) switch discretely at the segment midpoint.
 */
function framesToTimeline(target, frames, o = {}) {
    const dur = o.duration ?? 1000;
    const fs = [...frames].sort((a, b) => a.offset - b.offset).map((f) => ({ ...f, props: expandProps(f.props) }));
    const tl = new tween.Timeline({ repeat: o.repeat, yoyo: o.yoyo, delay: o.delay, onUpdate: o.onUpdate, onComplete: o.onComplete });
    const keys = Array.from(new Set(fs.flatMap((f) => Object.keys(f.props))));
    // carry values forward / backward so every frame has every key
    const filled = fs.map((f) => ({ ...f, props: { ...f.props } }));
    for (const k of keys) {
        let last;
        for (const f of filled) {
            if (k in f.props)
                last = f.props[k];
            else if (last !== undefined)
                f.props[k] = last;
        }
        let next;
        for (let i = filled.length - 1; i >= 0; i--) {
            if (k in filled[i].props)
                next = filled[i].props[k];
            else if (next !== undefined)
                filled[i].props[k] = next;
        }
    }
    const def = o.ease ?? 'linear';
    if (filled.length === 1)
        filled.unshift({ ...filled[0], offset: 0 });
    for (let i = 0; i < filled.length - 1; i++) {
        const a = filled[i], b = filled[i + 1];
        const segDur = Math.max(0, (b.offset - a.offset) * dur);
        const from = {}, to = {};
        const discrete = [];
        for (const k of keys) {
            if (tweenable(a.props[k]) && tweenable(b.props[k])) {
                from[k] = a.props[k];
                to[k] = b.props[k];
            }
            else
                discrete.push([k, b.props[k]]);
        }
        tl.add(new tween.Tween(target, { from, to, duration: segDur, ease: a.easing ? ease.parseEase(a.easing) : def, paused: true }), a.offset * dur);
        for (const [k, v] of discrete)
            tl.call(() => { if (target.style)
                target.style.setProperty(k.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase()), String(v));
            else
                target[k] = v; }, a.offset * dur + segDur / 2);
    }
    if (o.paused === false)
        tl.play();
    return tl;
}

exports.camelProp = camelProp;
exports.distributeOffsets = distributeOffsets;
exports.framesToTimeline = framesToTimeline;
//# sourceMappingURL=keyframes-b9A8ikye.cjs.map
