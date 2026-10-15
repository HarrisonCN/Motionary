import { d as docError, T as TIMELINE_DOC_FORMAT, p as parseTimelineDoc, t as timelineDocFromAnimation, b as byTime, n as normalizeTimelineDoc, c as cloneJson } from './format-BSTz6pm_.js';
import { MOTION_TOKENS } from '../components/tokens.js';

/**
 * 14.0: the Timeline editor reads and writes Scene Format v2 (`motionary-scene` v2), the official
 * motion document. The editor model stays the `motionary-timeline` v1 shape (a subset of scene v2):
 * `timelineDocToScene` writes it as scene v2 losslessly, `timelineDocFromScene` opens a scene
 * (token references resolved; what v1 cannot hold is listed in `lost`), and `loadMotionDoc` opens
 * any motion document (scene v2, timeline v1, `<usa-player>` animation JSON v1).
 * `motionary/scene`'s `sceneV2FromTimeline` / `sceneV2ToTimeline` use this same mapping.
 */
const TOP = ['name', 'duration', 'seed'];
const REF = /^\{(duration|easing|spring)\.([\w-]+)\}$/;
/** The editor document as scene v2 (lossless: `timelineDocFromScene(timelineDocToScene(d)).doc` equals the canonical `d`). */
function timelineDocToScene(doc) {
    const d = normalizeTimelineDoc(doc);
    const out = { format: 'motionary-scene', version: 2 };
    for (const k of TOP)
        if (d[k] !== undefined)
            out[k] = d[k];
    out.layers = cloneJson(d.layers);
    out.source = { format: TIMELINE_DOC_FORMAT, version: 1 };
    if (d.meta !== undefined)
        out.meta = cloneJson(d.meta);
    return out;
}
/**
 * Open a scene v2 document in the editor. Token references resolve (scene tokens, then the
 * built-in scale); preset / effect / component layers, `loop`, `tokens`, keyframe `composite`
 * and track `start` / `duration` / `easing` have no v1 equivalent and are listed in `lost`.
 */
function timelineDocFromScene(scene) {
    // 16.0: flat Scene v3 reads like v2 (variants go to meta); nested v3 (comp / component layers) needs sceneV3ToV2() from motionary/scene/v3
    const v = scene;
    if (v.version > 2 && v.layers.some((l) => l.type !== 'track' && l.type !== 'group'))
        throw docError('layers', 'nested v3: use sceneV3ToV2()');
    const r = (v) => {
        const m = typeof v === 'string' && REF.exec(v);
        const x = m ? (scene.tokens?.[m[1]]?.[m[2]] ?? MOTION_TOKENS[m[1]][m[2]]) : undefined;
        return x === undefined ? v : typeof x === 'object' ? `${x.stiffness} ${x.damping} ${x.mass}` : x;
    };
    const lost = [];
    const fromTimeline = scene.source?.format === TIMELINE_DOC_FORMAT;
    if (scene.loop)
        lost.push({ path: 'loop', message: 'timeline v1 has no loop' });
    if (scene.tokens)
        lost.push({ path: 'tokens', message: 'tokens resolved' });
    const layers = scene.layers.map((l, i) => {
        const n = { ...l }; // normalizeTimelineDoc below keeps only the v1 fields
        if (l.type === 'track') {
            for (const f of ['preset', 'effect', 'component'])
                if (l[f] !== undefined)
                    lost.push({ path: `layers[${i}].${f}`, message: `timeline v1 has no ${f}` });
            if (!fromTimeline)
                for (const f of ['start', 'duration', 'easing'])
                    if (l[f] !== undefined && l.keyframes)
                        lost.push({ path: `layers[${i}].${f}`, message: 'kept as keyframe times / easings' });
            const le = r(l.easing);
            n.keyframes = byTime(l.keyframes || []).map((k) => {
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
    // name / duration / seed / meta (cloned) are picked by normalizeTimelineDoc
    const out = { ...scene, layers };
    if (v.variants)
        out.meta = { ...v.meta, 'motionary:variants': v.variants };
    return { doc: normalizeTimelineDoc(out), lost };
}
/** Open any motion document (object or JSON text; flat Scene v3 — no comps / components — since 16.0) as an editor document; throws `TimelineDocError` on anything else. */
function loadMotionDoc(input) {
    let d = input;
    if (typeof input === 'string') {
        try {
            d = JSON.parse(input);
        }
        catch (e) {
            throw docError('', `invalid JSON (${e.message})`);
        }
    }
    if (d?.format === 'motionary-scene' && (d.version === 2 || d.version === 3) && Array.isArray(d.layers))
        return timelineDocFromScene(d);
    if (d?.format === TIMELINE_DOC_FORMAT)
        return { doc: parseTimelineDoc(d), lost: [] };
    if (d && Array.isArray(d.tracks)) {
        const { doc, skipped } = timelineDocFromAnimation(d);
        return { doc, lost: skipped.map((i) => ({ path: `tracks[${i}]`, message: 'no keyframes' })) };
    }
    throw docError('format', 'not a scene, timeline v1 or animation JSON v1');
}

export { timelineDocFromScene as a, loadMotionDoc as l, timelineDocToScene as t };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v16.1.0/dist/chunks/scene-C7-PUIZK.js.map