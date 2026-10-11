/**
 * 13.6: editing operations on a `motionary-timeline` document. Every operation
 * is pure: it returns a new document (unchanged layers are shared, so history
 * snapshots stay cheap) and never edits a locked layer.
 */
import {
  isLayerLocked, isValidEasing, TimelineDocError,
  type TimelineDoc, type TimelineKeyframe, type TimelineLayer, type TimelineValue,
} from './format';

const bad = (path: string, message: string) => new TimelineDocError([{ path, message }]);
const round = (n: number) => {
  const r = Math.round(n * 1e4) / 1e4;
  return r === 0 ? 0 : r;
};
const byTime = (ks: TimelineKeyframe[]) => ks.map((k, i) => [k, i] as const).sort((a, b) => a[0].time - b[0].time || a[1] - b[1]).map(([k]) => k);

/** A fresh id `prefix<n>` unused by any layer or keyframe of `doc`. */
export function uniqueId(doc: TimelineDoc, prefix = 'id', taken: Set<string> = new Set()): string {
  const used = new Set(taken);
  for (const l of doc.layers) {
    used.add(l.id);
    for (const k of l.keyframes || []) used.add(k.id);
  }
  let n = 1;
  while (used.has(`${prefix}${n}`)) n++;
  return `${prefix}${n}`;
}

/** Ids of a layer and every layer below it in its groups. */
export function layerSubtree(doc: TimelineDoc, id: string): string[] {
  const out = [id];
  for (let i = 0; i < out.length; i++) for (const l of doc.layers) if (l.parent === out[i] && !out.includes(l.id)) out.push(l.id);
  return out;
}

// --- layers -------------------------------------------------------------------

export interface AddLayerOptions {
  /** Insert before the layer at this index of `doc.layers` (default: the end, or the end of the parent group). */
  index?: number;
}
/** Add a track or group layer (`id` defaults to a fresh one). */
export function addLayer(doc: TimelineDoc, layer: Partial<TimelineLayer> & { type?: 'track' | 'group' }, o: AddLayerOptions = {}): TimelineDoc {
  const id = layer.id ?? uniqueId(doc, layer.type === 'group' ? 'g' : 'l');
  if (doc.layers.some((l) => l.id === id)) throw bad('id', `duplicate layer id "${id}"`);
  const n: TimelineLayer = { ...layer, id, type: layer.type ?? 'track' };
  if (n.type === 'track' && !n.keyframes) n.keyframes = [];
  if (n.parent !== undefined && doc.layers.find((l) => l.id === n.parent)?.type !== 'group') throw bad('parent', `no group "${n.parent}"`);
  if (n.parent !== undefined && isLayerLocked(doc, n.parent)) return doc;
  const layers = doc.layers.slice();
  let at = o.index ?? layers.length;
  if (o.index === undefined && n.parent !== undefined) {
    const sub = layerSubtree(doc, n.parent);
    at = Math.max(...sub.map((s) => layers.findIndex((l) => l.id === s))) + 1;
  }
  layers.splice(Math.max(0, Math.min(at, layers.length)), 0, n);
  return { ...doc, layers };
}

/** Remove layers (a group takes its children with it). Locked layers stay. */
export function removeLayers(doc: TimelineDoc, ids: string[]): TimelineDoc {
  const drop = new Set<string>();
  for (const id of ids) if (!isLayerLocked(doc, id)) for (const s of layerSubtree(doc, id)) if (!isLayerLocked(doc, s)) drop.add(s);
  if (!drop.size) return doc;
  return { ...doc, layers: doc.layers.filter((l) => !drop.has(l.id)) };
}

/** Change layer fields (`name`, `locked`, `muted`, `solo`, `target`). On a locked layer only `locked`, `muted` and `solo` change (playback state, not content). */
export function updateLayers(doc: TimelineDoc, ids: string[], patch: Partial<Pick<TimelineLayer, 'name' | 'locked' | 'muted' | 'solo' | 'target'>>): TimelineDoc {
  const set = new Set(ids);
  let changed = false;
  const layers = doc.layers.map((l) => {
    if (!set.has(l.id)) return l;
    const p: any = { ...patch };
    if (isLayerLocked(doc, l.id)) { delete p.name; delete p.target; }
    if (l.type === 'group') delete p.target;
    const n: any = { ...l, ...p };
    for (const f of ['locked', 'muted', 'solo']) if (!n[f]) delete n[f];
    if (n.name === undefined) delete n.name;
    if (JSON.stringify(n) === JSON.stringify(l)) return l;
    changed = true;
    return n as TimelineLayer;
  });
  return changed ? { ...doc, layers } : doc;
}

/** Put layers into a new group placed where the first of them was. Returns the document and the group id. */
export function groupLayers(doc: TimelineDoc, ids: string[], group: { id?: string; name?: string } = {}): { doc: TimelineDoc; id: string } {
  const members = doc.layers.filter((l) => ids.includes(l.id) && !isLayerLocked(doc, l.id));
  if (!members.length) return { doc, id: '' };
  const id = group.id ?? uniqueId(doc, 'g');
  if (doc.layers.some((l) => l.id === id)) throw bad('id', `duplicate layer id "${id}"`);
  const parent = members[0].parent;
  const moving = new Set<string>();
  for (const m of members) for (const s of layerSubtree(doc, m.id)) moving.add(s);
  const memberIds = new Set(members.map((m) => m.id));
  // a member nested inside another member stays where it is
  for (const m of members) for (let p = m.parent; p; p = doc.layers.find((l) => l.id === p)?.parent) if (memberIds.has(p)) memberIds.delete(m.id);
  const first = doc.layers.findIndex((l) => moving.has(l.id));
  const block = doc.layers.filter((l) => moving.has(l.id)).map((l) => (memberIds.has(l.id) ? withParent(l, id) : l));
  const g: TimelineLayer = { id, type: 'group' };
  if (group.name) g.name = group.name;
  if (parent !== undefined && !moving.has(parent)) g.parent = parent;
  const rest = doc.layers.filter((l) => !moving.has(l.id));
  const insertAt = doc.layers.slice(0, first).filter((l) => !moving.has(l.id)).length;
  rest.splice(insertAt, 0, g, ...block);
  return { doc: { ...doc, layers: rest }, id };
}
const withParent = (l: TimelineLayer, parent: string | undefined): TimelineLayer => {
  if (l.parent === parent) return l;
  const n = { ...l };
  if (parent === undefined) delete n.parent;
  else n.parent = parent;
  return n;
};

/** Dissolve a group: its children move up to the group's parent. */
export function ungroupLayer(doc: TimelineDoc, groupId: string): TimelineDoc {
  const g = doc.layers.find((l) => l.id === groupId);
  if (!g || g.type !== 'group' || isLayerLocked(doc, groupId)) return doc;
  return { ...doc, layers: doc.layers.filter((l) => l.id !== groupId).map((l) => (l.parent === groupId ? withParent(l, g.parent) : l)) };
}

/**
 * Move a layer (with its children) so it sits at `toIndex` among its siblings
 * (layers with the same parent), or into another group with `{ parent }`.
 */
export function moveLayer(doc: TimelineDoc, id: string, toIndex: number, o: { parent?: string | null } = {}): TimelineDoc {
  const layer = doc.layers.find((l) => l.id === id);
  if (!layer || isLayerLocked(doc, id)) return doc;
  const sub = new Set(layerSubtree(doc, id));
  const parent = o.parent === undefined ? layer.parent : o.parent === null ? undefined : o.parent;
  if (parent !== undefined) {
    const p = doc.layers.find((l) => l.id === parent);
    if (!p || p.type !== 'group' || sub.has(parent)) throw bad('parent', `cannot move "${id}" into "${parent}"`);
    if (isLayerLocked(doc, parent)) return doc;
  }
  const block = doc.layers.filter((l) => sub.has(l.id)).map((l) => (l.id === id ? withParent(l, parent) : l));
  const rest = doc.layers.filter((l) => !sub.has(l.id));
  const siblings = rest.filter((l) => l.parent === parent);
  const i = Math.max(0, Math.min(Math.round(toIndex), siblings.length));
  let at: number;
  if (i < siblings.length) at = rest.indexOf(siblings[i]);
  else if (siblings.length) {
    const last = layerSubtree({ ...doc, layers: rest }, siblings[siblings.length - 1].id);
    at = Math.max(...last.map((s) => rest.findIndex((l) => l.id === s))) + 1;
  } else at = parent === undefined ? rest.length : rest.findIndex((l) => l.id === parent) + 1;
  rest.splice(at, 0, ...block);
  const same = rest.every((l, k) => l === doc.layers[k]);
  return same ? doc : { ...doc, layers: rest };
}

// --- keyframes ----------------------------------------------------------------

/** Where each keyframe id lives (`[layer index, keyframe index]`). */
const locate = (doc: TimelineDoc) => {
  const m = new Map<string, TimelineLayer>();
  for (const l of doc.layers) for (const k of l.keyframes || []) m.set(k.id, l);
  return m;
};

/** Map selected, editable keyframes; layers whose keyframes did not change are shared. */
function mapKeyframes(doc: TimelineDoc, ids: string[], fn: (k: TimelineKeyframe) => TimelineKeyframe | null): TimelineDoc {
  const sel = new Set(ids);
  let changed = false;
  const layers = doc.layers.map((l) => {
    if (!l.keyframes?.some((k) => sel.has(k.id)) || isLayerLocked(doc, l.id)) return l;
    const ks: TimelineKeyframe[] = [];
    for (const k of l.keyframes) {
      const n = sel.has(k.id) ? fn(k) : k;
      if (n !== k) changed = true;
      if (n) ks.push(n);
    }
    return { ...l, keyframes: byTime(ks) };
  });
  return changed ? { ...doc, layers } : doc;
}
/** Selected keyframe ids that can be edited (exist, layer not locked). */
export function editableKeyframes(doc: TimelineDoc, ids: string[]): string[] {
  const where = locate(doc);
  return ids.filter((id) => where.has(id) && !isLayerLocked(doc, where.get(id)!.id));
}

/** Add a keyframe to a track (`id` defaults to a fresh one). */
export function addKeyframe(doc: TimelineDoc, layerId: string, kf: Omit<TimelineKeyframe, 'id'> & { id?: string }): TimelineDoc {
  const l = doc.layers.find((x) => x.id === layerId);
  if (!l || l.type !== 'track') throw bad('layer', `no track "${layerId}"`);
  if (isLayerLocked(doc, layerId)) return doc;
  const id = kf.id ?? uniqueId(doc, 'k');
  if (locate(doc).has(id)) throw bad('id', `duplicate keyframe id "${id}"`);
  if (kf.easing !== undefined && !isValidEasing(kf.easing)) throw bad('easing', `unknown easing "${kf.easing}"`);
  const n: TimelineKeyframe = { id, time: Math.max(0, round(kf.time)), props: { ...kf.props } };
  if (kf.easing !== undefined) n.easing = kf.easing;
  return { ...doc, layers: doc.layers.map((x) => (x === l ? { ...l, keyframes: byTime([...(l.keyframes || []), n]) } : x)) };
}

/** Change one keyframe's props (merged; `null` removes a prop). */
export function setKeyframeProps(doc: TimelineDoc, id: string, props: Record<string, TimelineValue | null>): TimelineDoc {
  return mapKeyframes(doc, [id], (k) => {
    const p: Record<string, TimelineValue> = { ...k.props };
    for (const [name, v] of Object.entries(props)) if (v === null) delete p[name]; else p[name] = v;
    return { ...k, props: p };
  });
}

/** Delete keyframes. */
export const removeKeyframes = (doc: TimelineDoc, ids: string[]): TimelineDoc => mapKeyframes(doc, ids, () => null);

/** Move keyframes by `dt` ms, keeping their spacing (the move stops at 0). */
export function shiftKeyframes(doc: TimelineDoc, ids: string[], dt: number): TimelineDoc {
  const ok = editableKeyframes(doc, ids);
  if (!ok.length || !dt) return doc;
  const where = locate(doc);
  const min = Math.min(...ok.map((id) => where.get(id)!.keyframes!.find((k) => k.id === id)!.time));
  const d = Math.max(dt, -min);
  return d ? mapKeyframes(doc, ok, (k) => ({ ...k, time: round(k.time + d) })) : doc;
}

/** Scale keyframe times by `factor` (> 0) around `pivot` (default: the earliest selected keyframe). */
export function scaleKeyframes(doc: TimelineDoc, ids: string[], factor: number, pivot?: number): TimelineDoc {
  if (!(factor > 0) || !Number.isFinite(factor)) throw bad('factor', 'expected a positive number');
  const ok = editableKeyframes(doc, ids);
  if (!ok.length || factor === 1) return doc;
  const where = locate(doc);
  const p = pivot ?? Math.min(...ok.map((id) => where.get(id)!.keyframes!.find((k) => k.id === id)!.time));
  return mapKeyframes(doc, ok, (k) => ({ ...k, time: Math.max(0, round(p + (k.time - p) * factor)) }));
}

/** Set the easing of every selected keyframe (`'linear'` clears it). */
export function setKeyframeEasing(doc: TimelineDoc, ids: string[], easing: string): TimelineDoc {
  if (!isValidEasing(easing)) throw bad('easing', `unknown easing "${easing}"`);
  return mapKeyframes(doc, ids, (k) => {
    if ((k.easing ?? 'linear') === easing) return k;
    const n = { ...k };
    if (easing === 'linear') delete n.easing;
    else n.easing = easing;
    return n;
  });
}

export interface KeyframeClip {
  format: 'motionary-timeline-clip';
  version: 1;
  /** Keyframes with times relative to the earliest one, grouped by source layer. */
  items: { layer: string; time: number; props: Record<string, TimelineValue>; easing?: string }[];
}

/** Copy keyframes (relative times) for `pasteKeyframes`. */
export function copyKeyframes(doc: TimelineDoc, ids: string[]): KeyframeClip {
  const sel = new Set(ids);
  const found: { layer: string; k: TimelineKeyframe }[] = [];
  for (const l of doc.layers) for (const k of l.keyframes || []) if (sel.has(k.id)) found.push({ layer: l.id, k });
  const t0 = found.length ? Math.min(...found.map((f) => f.k.time)) : 0;
  return {
    format: 'motionary-timeline-clip',
    version: 1,
    items: found.map(({ layer, k }) => ({ layer, time: round(k.time - t0), props: { ...k.props }, ...(k.easing ? { easing: k.easing } : {}) })),
  };
}

/**
 * Paste a clip at `at` ms: onto its source layers, or all onto `layer`.
 * Returns the document and the new keyframe ids (fresh, deterministic).
 */
export function pasteKeyframes(doc: TimelineDoc, clip: KeyframeClip, o: { at: number; layer?: string }): { doc: TimelineDoc; ids: string[] } {
  if (!clip || clip.format !== 'motionary-timeline-clip' || !Array.isArray(clip.items)) throw bad('clip', 'not a keyframe clip');
  const taken = new Set<string>();
  const ids: string[] = [];
  let out = doc;
  for (const it of clip.items) {
    const target = o.layer ?? it.layer;
    const l = out.layers.find((x) => x.id === target);
    if (!l || l.type !== 'track' || isLayerLocked(out, target)) continue;
    const id = uniqueId(out, 'k', taken);
    taken.add(id);
    out = addKeyframe(out, target, { id, time: Math.max(0, o.at + it.time), props: it.props, ...(it.easing ? { easing: it.easing } : {}) });
    ids.push(id);
  }
  return { doc: out, ids };
}
