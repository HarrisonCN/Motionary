import { getMotionTokens } from '../components/tokens.js';
import { r as resolveRandom } from './format-CI6Vx9Ui.js';
import { f as flatSceneV3ToV2 } from './v3-read-BqgIjLQP.js';

/** @internal `{group.name}` token reference. */
const REF = /^\{(duration|easing|spring)\.([\w-]+)\}$/;
const fail3 = () => { throw new Error('[motionary] scene: this Scene v3 document has nested compositions / component layers — read it with sceneV3ToV2() from motionary/scene/v3 first'); };
/** Scene v3 (flat) / v2 / timeline v1 → playable animation JSON v1. Throws on a document it cannot read. */
function sceneToAnimation(d) {
    if (d.format === 'motionary-scene' && d.version === 3)
        d = flatSceneV3ToV2(d) || fail3(); // 16.0: flat Scene v3 plays natively
    if (d.version !== (d.format === 'motionary-scene' ? 2 : d.format === 'motionary-timeline' ? 1 : NaN) || !Array.isArray(d.layers))
        throw new Error(`[motionary] scene: cannot read ${d.format} v${d.version} with "layers" ${typeof d.layers} (validateSceneV2 from motionary/scene explains; a newer version needs a newer motionary)`);
    const tok = getMotionTokens();
    const r = (v) => {
        const m = typeof v === 'string' && REF.exec(v);
        if (!m)
            return v;
        const x = d.tokens?.[m[1]]?.[m[2]] ?? tok[m[1]]?.[m[2]];
        return x === undefined ? v : typeof x === 'object' ? `${x.stiffness} ${x.damping} ${x.mass}` : x;
    };
    const by = new Map(d.layers.map((l) => [l?.id, l]));
    const chain = (l) => {
        const c = [];
        for (let x = l; x && c.length <= d.layers.length; x = by.get(x.parent))
            c.push(x);
        return c;
    };
    const solo = d.layers.some((l) => l?.solo);
    const seed = d.seed ?? 1;
    const tracks = [];
    for (const l of d.layers) {
        if (!l || l.type !== 'track')
            continue;
        const c = chain(l);
        if (c.some((x) => x.muted) || (solo && !c.some((x) => x.solo)))
            continue;
        const t = { target: l.target || ':scope', start: Number(l.start) || 0 };
        if (l.name)
            t.label = l.name;
        const easing = r(l.easing);
        if (l.effect) {
            t.effect = l.effect;
            t.options = l.options;
        }
        else if (l.preset) {
            t.preset = l.preset;
            t.duration = Number(r(l.duration)) || 600;
            if (easing)
                t.easing = easing;
        }
        else {
            const ks = [...(l.keyframes || [])].sort((a, b) => a.time - b.time);
            if (!ks.length)
                continue;
            const start = l.start ?? ks[0].time;
            const dur = l.duration ?? Math.max(1, ks[ks.length - 1].time - start);
            t.start = start;
            t.duration = dur;
            t.easing = easing || 'linear';
            t.keyframes = ks.map((k) => {
                const f = {};
                for (const p of Object.keys(k.props || {}))
                    f[p] = resolveRandom(r(k.props[p]), seed, `${l.id}/${k.id}/${p}`);
                f.offset = Math.round(((k.time - start) / dur) * 1e6) / 1e6;
                const e = r(k.easing);
                if (e && e !== 'linear')
                    f.easing = e;
                if (k.composite && k.composite !== 'replace')
                    f.composite = k.composite;
                return f;
            });
            if (t.keyframes.length === 1)
                t.keyframes.push({ ...t.keyframes[0], offset: 1 });
        }
        tracks.push(t);
    }
    const end = tracks.reduce((m, t) => Math.max(m, (t.start || 0) + (t.duration || 0)), 0);
    return { tracks, duration: Math.max(end, Number(d.duration) || 0), loop: !!d.loop, name: String(d.name || 'scene') };
}

export { sceneToAnimation as s };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.0.0/dist/chunks/play-U4-l22wu.js.map