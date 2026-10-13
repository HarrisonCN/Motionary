import { l as loadMotionDoc, t as timelineDocToScene } from './scene-D5SKvFBd.js';
import { f as TIMELINE_DOC_LIMITS, T as TimelineDocError, v as validateTimelineDoc, b as timelineDocDuration } from './format-CHcmOPqK.js';
import { s as sampleTimelineDoc } from './preview-C9tONksA.js';
import { c as cubicBezier } from './ease-XN8_0sXu.js';

/**
 * 14.4 Motion Studio: easing curves for the curve editor — cubic-bezier control points, presets and spring
 * parameters. Pure (no DOM). The timeline model stores an easing string per keyframe (`cubic-bezier(…)` / a named
 * ease), so a spring is fitted to the closest cubic-bezier; the spring parameters themselves are kept in the Studio
 * project file (`studio.springs`) so the editor can reopen them.
 */
/** Curve editor presets (the CSS keywords plus a few common shapes). */
const CURVE_PRESETS = {
    linear: [0, 0, 1, 1],
    ease: [0.25, 0.1, 0.25, 1],
    'ease-in': [0.42, 0, 1, 1],
    'ease-out': [0, 0, 0.58, 1],
    'ease-in-out': [0.42, 0, 0.58, 1],
    smooth: [0.22, 1, 0.36, 1],
    snappy: [0.2, 0, 0, 1],
    anticipate: [0.36, 0, 0.66, -0.56],
    overshoot: [0.34, 1.56, 0.64, 1],
};
const r3 = (n) => Math.round(n * 1000) / 1000 + 0;
const NUM = '\\s*(-?(?:\\d+\\.?\\d*|\\.\\d+))\\s*';
const CB = /*#__PURE__*/ new RegExp(`^cubic-bezier\\(${NUM},${NUM},${NUM},${NUM}\\)$`);
/** The control points of an easing: a preset / CSS keyword or `cubic-bezier(…)` (`undefined` = linear). `null` for anything else (`steps()`, named eases like `bounce-out`). */
function parseBezier(easing) {
    const s = (easing ?? 'linear').trim();
    const p = CURVE_PRESETS[s];
    if (p)
        return [...p];
    const m = CB.exec(s);
    return m ? [+m[1], +m[2], +m[3], +m[4]] : null;
}
/** The easing string for control points: `linear`, else `cubic-bezier(x1, y1, x2, y2)` (x clamped to 0…1, 3 decimals). */
function bezierEasing(b) {
    const c = (v, x) => r3(x ? Math.min(1, Math.max(0, v)) : Math.min(5, Math.max(-5, v)));
    const v = [c(b[0], true), c(b[1], false), c(b[2], true), c(b[3], false)];
    return v.join() === '0,0,1,1' ? 'linear' : `cubic-bezier(${v.join(', ')})`;
}
const pos = (v, d) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : d);
/** Spring parameters with defaults (stiffness 170, damping 26, mass 1) for anything missing or invalid. */
const springParams = (s = {}) => ({
    stiffness: pos(s.stiffness, 170),
    damping: typeof s.damping === 'number' && Number.isFinite(s.damping) && s.damping >= 0 ? s.damping : 26,
    mass: pos(s.mass, 1),
});
const fitCache = /*#__PURE__*/ new Map();
/**
 * The cubic-bezier closest to a spring (unit step, from rest), and the time the spring takes to settle (ms). A cubic
 * curve can overshoot once, so an underdamped spring keeps its first overshoot and loses later wobbles.
 * Deterministic: a fixed-step simulation and a fixed search grid.
 */
function springBezier(input) {
    const { stiffness: k, damping: c, mass: m } = springParams(input);
    const key = `${k}|${c}|${m}`;
    const hit = fitCache.get(key);
    if (hit)
        return hit;
    // simulate at 1 ms until settled (max 10 s)
    const xs = [0];
    let x = 0, v = 0, t = 0;
    while (t < 10000) {
        v += ((-k * (x - 1) - c * v) / m) * 0.001;
        x += v * 0.001;
        xs.push(x);
        t++;
        if (Math.abs(1 - x) < 0.001 && Math.abs(v) < 0.01)
            break;
    }
    const N = 24;
    const target = Array.from({ length: N + 1 }, (_, i) => xs[Math.round((i / N) * t)]);
    target[N] = 1;
    const over = xs.some((v) => v > 1.001); // a spring that never overshoots gets a curve that never does
    let best = [0, 0, 1, 1], err = Infinity;
    for (const x1 of [0.1, 0.2, 0.3, 0.4])
        for (const x2 of [0.2, 0.4, 0.6, 0.8]) {
            for (let a = 0; a <= 30; a++)
                for (let b = 0; b <= 24; b++) {
                    const y1 = a / 10, y2 = 0.6 + b * 0.05;
                    if (!over && (y1 > 1 || y2 > 1.0001))
                        continue;
                    const f = cubicBezier(x1, y1, x2, y2);
                    let e = 0;
                    for (let i = 1; i < N && e < err; i++)
                        e += (f(i / N) - target[i]) ** 2;
                    if (e < err) {
                        err = e;
                        best = [x1, y1, x2, r3(y2)];
                    }
                }
        }
    const out = { easing: bezierEasing(best), bezier: best, duration: t };
    if (fitCache.size > 64)
        fitCache.clear();
    fitCache.set(key, out);
    return out;
}

/**
 * 14.4 Motion Studio: save / load. A Studio project is `{ format: 'motionary-studio', version: 1, scene, studio }`:
 * `scene` is the document as Scene Format v2 (`timelineDocToScene`, lossless), `studio` is editor state (time, zoom,
 * fps, collapsed groups, spring parameters). `parseStudioProject` also opens a bare Scene v2 document, a
 * `motionary-timeline` v1 document or `<usa-player>` animation JSON, checks size and shape (never evaluates input) and
 * drops editor state that does not match the document. `sampleFrames` is the reference for "same animation":
 * every frame at a fixed frame rate, a pure function of the document.
 */
const STUDIO_PROJECT_FORMAT = 'motionary-studio';
const STUDIO_PROJECT_VERSION = 1;
const r4 = (n) => Math.round(n * 1e4) / 1e4 + 0;
const isObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
const fail = (path, message) => new TimelineDocError([{ path, message }]);
/** `ms` snapped to the nearest frame at `fps` (4 decimals, like the editor model). */
const frameTime = (ms, fps = 60) => r4((Math.round((ms * fps) / 1000) * 1000) / fps);
/** Every frame of the document at `fps` from `from` to `to` (default 0 … duration): the reference for "same animation". */
function sampleFrames(doc, o = {}) {
    const fps = o.fps ?? 60, end = o.to ?? timelineDocDuration(doc), out = [];
    for (let n = Math.round(((o.from ?? 0) * fps) / 1000), t = 0; (t = frameTime((n * 1000) / fps, fps)) <= end + 1e-9 && out.length < 1e5; n++)
        out.push(sampleTimelineDoc(doc, t));
    return out;
}
/** Editor state checked against the document: unknown ids, bad numbers and stale springs are dropped. */
function cleanUiState(doc, s) {
    const ui = {};
    if (!isObj(s))
        return ui;
    const num = (v, lo, hi, d) => (typeof v === 'number' && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d);
    if (s.time !== undefined)
        ui.time = num(s.time, 0, TIMELINE_DOC_LIMITS.time, 0);
    if (s.zoom !== undefined)
        ui.zoom = num(s.zoom, 1, 10000, 100);
    if (s.fps !== undefined)
        ui.fps = Number.isInteger(s.fps) && s.fps >= 1 && s.fps <= 240 ? s.fps : 60;
    const groups = new Set(doc.layers.filter((l) => l.type === 'group').map((l) => l.id));
    if (Array.isArray(s.collapsed))
        ui.collapsed = [...new Set(s.collapsed.filter((id) => typeof id === 'string' && groups.has(id)))];
    if (isObj(s.springs)) {
        const easing = new Map(doc.layers.flatMap((l) => (l.keyframes || []).map((k) => [k.id, k.easing ?? 'linear'])));
        const sp = {};
        for (const id of Object.keys(s.springs)) {
            const v = s.springs[id];
            if (!isObj(v) || !['stiffness', 'damping', 'mass'].every((k) => typeof v[k] === 'number' && Number.isFinite(v[k])))
                continue;
            const p = springParams(v);
            if (easing.get(id) === springBezier(p).easing)
                sp[id] = p;
        }
        if (Object.keys(sp).length)
            ui.springs = sp;
    }
    return ui;
}
/** The project as JSON text (stable: the same document and state always give the same text). */
function serializeStudioProject(doc, ui = {}, space = 2) {
    const p = { format: STUDIO_PROJECT_FORMAT, version: 1, scene: timelineDocToScene(doc), studio: cleanUiState(doc, ui) };
    return JSON.stringify(p, null, space) + (space ? '\n' : '');
}
/**
 * Open a Studio project, a Scene v2 document, a timeline v1 document or animation JSON (object or text). Throws a
 * `TimelineDocError` for anything malformed or over the limits; `lost` lists what a scene had that the editor cannot hold.
 */
function parseStudioProject(input) {
    let d = input;
    if (typeof input === 'string') {
        if (input.length > TIMELINE_DOC_LIMITS.textBytes)
            throw fail('', `text longer than ${TIMELINE_DOC_LIMITS.textBytes} characters`);
        try {
            d = JSON.parse(input);
        }
        catch (e) {
            throw fail('', `invalid JSON (${e.message})`);
        }
    }
    if (!isObj(d))
        throw fail('', 'expected an object');
    let ui;
    if (d.format === STUDIO_PROJECT_FORMAT) {
        if (d.version !== STUDIO_PROJECT_VERSION)
            throw fail('version', `expected ${STUDIO_PROJECT_VERSION}`);
        ui = d.studio;
        d = d.scene;
        if (!isObj(d) || d.format !== 'motionary-scene')
            throw fail('scene', 'expected a Scene Format v2 document');
    }
    if (d.format === 'motionary-scene') {
        // shape check before mapping (the mapping trusts its input)
        const ok = Array.isArray(d.layers) && d.layers.length <= TIMELINE_DOC_LIMITS.layers && d.layers.every((l) => isObj(l) && (l.keyframes === undefined || (Array.isArray(l.keyframes) && l.keyframes.every((k) => isObj(k) && isObj(k.props)))));
        if (!ok)
            throw fail('layers', 'malformed scene layers');
    }
    let r;
    try {
        r = loadMotionDoc(d);
    }
    catch (e) {
        throw e instanceof TimelineDocError ? e : fail('', String(e?.message || e));
    }
    const problems = validateTimelineDoc(r.doc);
    if (problems.length)
        throw new TimelineDocError(problems);
    return { doc: r.doc, ui: cleanUiState(r.doc, ui), lost: r.lost };
}

export { CURVE_PRESETS as C, STUDIO_PROJECT_FORMAT as S, parseBezier as a, sampleFrames as b, springParams as c, springBezier as d, bezierEasing as e, frameTime as f, STUDIO_PROJECT_VERSION as g, cleanUiState as h, parseStudioProject as p, serializeStudioProject as s };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v14.7.0/dist/chunks/project-C7WnO3IM.js.map