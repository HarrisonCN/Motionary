/**
 * 14.0: the playable part of a scene v2 (or `motionary-timeline` v1) document as
 * `<usa-player>` tracks — shared by `<usa-player>` / `createPlayer()` (native v2 loading)
 * and Motion Engine v2's `playScene()`. Small on purpose (no validator): token references
 * resolve against the scene's own tokens, then the active motion tokens; `random(a, b)`
 * values resolve with the scene seed; muted layers (and non-solo layers while any is solo)
 * are skipped, groups pass their mute / solo down. Keyframe times are absolute.
 */
import type { AnimationJSON, AnimationTrack } from '../effects/player';
import { getMotionTokens } from '../tokens/index';
import { resolveRandom } from '../timeline/editor/format';
import { flatSceneV3ToV2 } from './v3-read';

/** @internal `{group.name}` token reference. */
export const REF = /^\{(duration|easing|spring)\.([\w-]+)\}$/;

const fail3 = (): never => { throw new Error('[motionary] scene: this Scene v3 document has nested compositions / component layers — read it with sceneV3ToV2() from motionary/scene/v3 first'); };
/** Scene v3 (flat) / v2 / timeline v1 → playable animation JSON v1. Throws on a document it cannot read. */
export function sceneToAnimation(d: any): Required<Pick<AnimationJSON, 'tracks' | 'duration' | 'loop' | 'name'>> {
  if (d.format === 'motionary-scene' && d.version === 3) d = flatSceneV3ToV2(d) || fail3(); // 16.0: flat Scene v3 plays natively
  if (d.version !== (d.format === 'motionary-scene' ? 2 : d.format === 'motionary-timeline' ? 1 : NaN) || !Array.isArray(d.layers))
    throw new Error(`[motionary] scene: cannot read ${d.format} v${d.version} with "layers" ${typeof d.layers} (validateSceneV2 from motionary/scene explains; a newer version needs a newer motionary)`);
  const tok = getMotionTokens() as any;
  const r = (v: any) => {
    const m = typeof v === 'string' && REF.exec(v);
    if (!m) return v;
    const x = d.tokens?.[m[1]]?.[m[2]] ?? tok[m[1]]?.[m[2]];
    return x === undefined ? v : typeof x === 'object' ? `${x.stiffness} ${x.damping} ${x.mass}` : x;
  };
  const by = new Map<string, any>(d.layers.map((l: any) => [l?.id, l]));
  const chain = (l: any) => {
    const c: any[] = [];
    for (let x = l; x && c.length <= d.layers.length; x = by.get(x.parent)) c.push(x);
    return c;
  };
  const solo = d.layers.some((l: any) => l?.solo);
  const seed = d.seed ?? 1;
  const tracks: AnimationTrack[] = [];
  for (const l of d.layers) {
    if (!l || l.type !== 'track') continue;
    const c = chain(l);
    if (c.some((x) => x.muted) || (solo && !c.some((x) => x.solo))) continue;
    const t: AnimationTrack = { target: l.target || ':scope', start: Number(l.start) || 0 };
    if (l.name) t.label = l.name;
    const easing = r(l.easing);
    if (l.effect) {
      t.effect = l.effect;
      t.options = l.options;
    } else if (l.preset) {
      t.preset = l.preset;
      t.duration = Number(r(l.duration)) || 600;
      if (easing) t.easing = easing;
    } else {
      const ks = [...(l.keyframes || [])].sort((a: any, b: any) => a.time - b.time);
      if (!ks.length) continue;
      const start = l.start ?? ks[0].time;
      const dur = l.duration ?? Math.max(1, ks[ks.length - 1].time - start);
      t.start = start;
      t.duration = dur;
      t.easing = easing || 'linear';
      t.keyframes = ks.map((k: any) => {
        const f: any = {};
        for (const p of Object.keys(k.props || {})) f[p] = resolveRandom(r(k.props[p]), seed, `${l.id}/${k.id}/${p}`);
        f.offset = Math.round(((k.time - start) / dur) * 1e6) / 1e6;
        const e = r(k.easing);
        if (e && e !== 'linear') f.easing = e;
        if (k.composite && k.composite !== 'replace') f.composite = k.composite;
        return f;
      });
      if (t.keyframes!.length === 1) t.keyframes!.push({ ...t.keyframes![0], offset: 1 });
    }
    tracks.push(t);
  }
  const end = tracks.reduce((m, t) => Math.max(m, (t.start || 0) + (t.duration || 0)), 0);
  return { tracks, duration: Math.max(end, Number(d.duration) || 0), loop: !!d.loop, name: String(d.name || 'scene') };
}
