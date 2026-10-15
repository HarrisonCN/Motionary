'use strict';

var format = require('./format-DrRrPbjl.cjs');
var components_tokens = require('../components/tokens.cjs');

/**
 * 14.0: the Timeline editor reads and writes Scene Format v2 (`motionary-scene` v2), the official
 * motion document. The editor model stays the `motionary-timeline` v1 shape (a subset of scene v2):
 * `timelineDocToScene` writes it as scene v2 losslessly, `timelineDocFromScene` opens a scene
 * (token references resolved; what v1 cannot hold is listed in `lost`), and `loadMotionDoc` opens
 * any motion document (scene v2, timeline v1, `<usa-player>` animation JSON v1).
 * `motionary/scene`'s `sceneV2FromTimeline` / `sceneV2ToTimeline` use this same mapping.
 */
const REF = /^\{(duration|easing|spring)\.([\w-]+)\}$/;
/** The editor document as scene v2 (lossless: `timelineDocFromScene(timelineDocToScene(d)).doc` equals the canonical `d`). */
function timelineDocToScene(doc) {
    const d = format.normalizeTimelineDoc(doc);
    const out = { format: 'motionary-scene', version: 2 };
    for (const k of ['name', 'duration', 'seed'])
        if (d[k] !== undefined)
            out[k] = d[k];
    out.layers = d.layers.map((l) => ({ ...l, ...(l.keyframes && { keyframes: l.keyframes.map((k) => ({ ...k, props: { ...k.props } })) }) }));
    out.source = { format: format.TIMELINE_DOC_FORMAT, version: 1 };
    if (d.meta !== undefined)
        out.meta = format.cloneJson(d.meta);
    return out;
}
/**
 * Open a scene v2 document in the editor. Token references resolve (scene tokens, then the
 * built-in scale); preset / effect / component layers, `loop`, `tokens`, keyframe `composite`
 * and track `start` / `duration` / `easing` have no v1 equivalent and are listed in `lost`.
 */
function timelineDocFromScene(scene) {
    const r = (v) => {
        const m = typeof v === 'string' && REF.exec(v);
        const x = m ? (scene.tokens?.[m[1]]?.[m[2]] ?? components_tokens.MOTION_TOKENS[m[1]][m[2]]) : undefined;
        return x === undefined ? v : typeof x === 'object' ? `${x.stiffness} ${x.damping} ${x.mass}` : x;
    };
    const lost = [];
    const fromTimeline = scene.source?.format === format.TIMELINE_DOC_FORMAT;
    if (scene.loop)
        lost.push({ path: 'loop', message: 'timeline v1 has no loop' });
    if (scene.tokens)
        lost.push({ path: 'tokens', message: 'tokens resolved' });
    const layers = scene.layers.map((l, i) => {
        const n = { id: l.id, type: l.type };
        for (const f of ['name', 'parent'])
            if (l[f] !== undefined)
                n[f] = l[f];
        for (const f of ['locked', 'muted', 'solo'])
            if (l[f])
                n[f] = true;
        if (l.type === 'track') {
            if (l.target !== undefined)
                n.target = l.target;
            for (const f of ['preset', 'effect', 'component'])
                if (l[f] !== undefined)
                    lost.push({ path: `layers[${i}].${f}`, message: `timeline v1 has no ${f}` });
            if (!fromTimeline)
                for (const f of ['start', 'duration', 'easing'])
                    if (l[f] !== undefined && l.keyframes)
                        lost.push({ path: `layers[${i}].${f}`, message: 'kept as keyframe times / easings' });
            const le = r(l.easing);
            n.keyframes = [...(l.keyframes || [])].sort((a, b) => a.time - b.time).map((k) => {
                const props = {};
                for (const p of Object.keys(k.props))
                    props[p] = r(k.props[p]);
                const kf = { id: k.id, time: k.time, props };
                const e = r(k.easing) ?? (le && le !== 'linear' ? le : undefined);
                if (e !== undefined)
                    kf.easing = e;
                if (k.composite && k.composite !== 'replace')
                    lost.push({ path: `layers[${i}].keyframes.${k.id}.composite`, message: 'timeline v1 has no composite' });
                return kf;
            });
        }
        return n;
    });
    const out = { format: format.TIMELINE_DOC_FORMAT, version: 1, layers };
    for (const k of ['name', 'duration', 'seed'])
        if (scene[k] !== undefined)
            out[k] = scene[k];
    if (scene.meta !== undefined)
        out.meta = format.cloneJson(scene.meta);
    return { doc: format.normalizeTimelineDoc(out), lost };
}
/** Open any motion document (object or JSON text) as an editor document; throws `TimelineDocError` on anything else. */
function loadMotionDoc(input) {
    let d = input;
    if (typeof input === 'string') {
        try {
            d = JSON.parse(input);
        }
        catch (e) {
            throw new format.TimelineDocError([{ path: '', message: `invalid JSON (${e.message})` }]);
        }
    }
    if (d?.format === 'motionary-scene' && d.version === 2 && Array.isArray(d.layers))
        return timelineDocFromScene(d);
    if (d?.format === format.TIMELINE_DOC_FORMAT)
        return { doc: format.parseTimelineDoc(d), lost: [] };
    if (d && Array.isArray(d.tracks)) {
        const { doc, skipped } = format.timelineDocFromAnimation(d);
        return { doc, lost: skipped.map((i) => ({ path: `tracks[${i}]`, message: 'no keyframes' })) };
    }
    throw new format.TimelineDocError([{ path: 'format', message: 'not scene v2, timeline v1 or animation JSON v1' }]);
}

exports.loadMotionDoc = loadMotionDoc;
exports.timelineDocFromScene = timelineDocFromScene;
exports.timelineDocToScene = timelineDocToScene;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v15.2.0/dist/chunks/scene-C4h75wjo.cjs.map