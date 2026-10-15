/**
 * 16.1: Symbols — one definition, many instances, on Scene v3 without a format change: a symbol is a
 * `components[id]` entry and an instance is a `type: "component"` layer (16.0 format). Every function here is pure:
 * it never mutates its input and returns a new document (apply it through the Studio / timeline history as one
 * undo step). `symbolsToCss` exports each symbol layer's `@keyframes` once, however many instances use it.
 * Opt-in entry `motionary/scene/symbols` (= `motionary/components/scene-symbols`); not in lite.
 */
import { flattenSceneV3 } from './v3-read';

export interface SymbolOverride { target?: string; muted?: boolean; props?: Record<string, number | string> }
export interface SymbolProblem { path: string; message: string }
export interface SymbolUsage { instances: string[]; overrides: number }
export interface SymbolsCssReport { symbols: number; instances: number; keyframeBlocks: number; rules: number; lost: SymbolProblem[] }

type Doc = any;
type Layer = any;

const isObj = (v: unknown): v is Record<string, any> => !!v && typeof v === 'object' && !Array.isArray(v);
const clone = <T>(v: T): T => (v === undefined ? v : JSON.parse(JSON.stringify(v)));
const bad = (m: string): Error => new Error(`[motionary] symbols: ${m}`);
const comps = (d: Doc): Record<string, any> => (isObj(d.components) ? d.components : {});
const hasSym = (d: Doc, id: string) => Object.prototype.hasOwnProperty.call(comps(d), id);
const need = (d: Doc, id: string) => { if (!hasSym(d, id)) throw bad(`unknown symbol "${id}"`); return comps(d)[id]; };

/** Every layer list of the document (top level, compositions, symbol definitions), depth first. */
function lists(d: Doc): Layer[][] {
  const out: Layer[][] = [];
  const walk = (ls: unknown) => { if (!Array.isArray(ls)) return; out.push(ls); for (const l of ls) if (l && l.type === 'comp') walk(l.layers); };
  walk(d.layers);
  for (const k of Object.keys(comps(d))) walk(comps(d)[k]?.layers);
  return out;
}
/** Instance layers in the scene itself (top level and compositions), in document order. */
function sceneInstances(d: Doc): Layer[] {
  const out: Layer[] = [];
  const walk = (ls: unknown) => { if (Array.isArray(ls)) for (const l of ls) { if (l?.type === 'component') out.push(l); else if (l?.type === 'comp') walk(l.layers); } };
  walk(d.layers);
  return out;
}
const findInstance = (d: Doc, id: string): Layer => {
  const l = sceneInstances(d).find((x) => x.id === id);
  if (!l) throw bad(`no instance "${id}"`);
  return l;
};
/** Layer ids of the scene itself (top level and compositions; symbol definitions have their own id scope). */
function sceneIds(d: Doc): Set<string> {
  const s = new Set<string>();
  const walk = (ls: unknown) => { if (Array.isArray(ls)) for (const l of ls) { s.add(l?.id); if (l?.type === 'comp') walk(l.layers); } };
  walk(d.layers);
  return s;
}
/** Layer ids a symbol defines (through its compositions, not into other symbols). */
function symbolLayerIds(def: any): Set<string> {
  const s = new Set<string>();
  const walk = (ls: unknown) => { if (Array.isArray(ls)) for (const l of ls) { s.add(l?.id); if (l?.type === 'comp') walk(l.layers); } };
  walk(def?.layers);
  return s;
}
/** Symbols reachable from a layer list (direct and through other symbols). */
function reach(d: Doc, ls: Layer[], seen = new Set<string>()): Set<string> {
  const walk = (xs: unknown) => {
    if (!Array.isArray(xs)) return;
    for (const l of xs) {
      if (l?.type === 'comp') walk(l.layers);
      else if (l?.type === 'component' && !seen.has(l.ref)) { seen.add(l.ref); if (hasSym(d, l.ref)) walk(comps(d)[l.ref].layers); }
    }
  };
  walk(ls);
  return seen;
}

export interface CreateSymbolOptions {
  /** The symbol id (key in `components`). */
  id: string;
  name?: string;
  /** The instance left in place (default: the symbol id). */
  instanceId?: string;
  /** The instance target; layer targets under it become relative (`#card .face` → `.face`, `#card` → `:scope`). */
  target?: string;
}

/**
 * Turn layers into a symbol and leave one instance where they were. One group selected → the group becomes the
 * instance and its descendants the symbol; otherwise the selected layers (with their group descendants) move in.
 * Keyframe times become content time (the earliest keyframe is 0; the instance `start` keeps the timing).
 */
export function createSymbol(doc: Doc, layerIds: string[], o: CreateSymbolOptions): Doc {
  const d = clone(doc);
  if (!o?.id || typeof o.id !== 'string') throw bad('a symbol id is required');
  if (hasSym(d, o.id)) throw bad(`symbol "${o.id}" exists`);
  if (!Array.isArray(layerIds) || !layerIds.length) throw bad('select at least one layer');
  const top: Layer[] = d.layers;
  for (const id of layerIds) if (!top.some((l) => l.id === id)) throw bad(`no layer "${id}"`);
  const sel = new Set(layerIds);
  for (let grew = true; grew;) { grew = false; for (const l of top) if (l.parent !== undefined && sel.has(l.parent) && !sel.has(l.id)) { sel.add(l.id); grew = true; } }
  const asGroup = layerIds.length === 1 && top.find((l) => l.id === layerIds[0]).type === 'group' ? top.find((l) => l.id === layerIds[0]) : undefined;
  const iid = o.instanceId ?? o.id;
  if (top.some((l) => l.id === iid && !sel.has(l.id))) throw bad(`layer id "${iid}" is taken`);
  const moved = top.filter((l) => sel.has(l.id) && l !== asGroup);
  let start = Infinity;
  for (const l of moved) for (const k of l.keyframes || []) start = Math.min(start, k.time + (l.start || 0));
  if (!Number.isFinite(start)) start = 0;
  const outside = new Set(moved.filter((l) => l.parent === undefined || !sel.has(l.parent) || l.parent === asGroup?.id).map((l) => l.id));
  const layers = moved.map((l) => {
    const n = { ...l };
    if (outside.has(l.id)) delete n.parent;
    if (n.type === 'track') {
      if (n.start !== undefined) n.start = Math.max(0, n.start - start);
      else if (n.keyframes) n.keyframes = n.keyframes.map((k: any) => ({ ...k, time: k.time - start }));
      if (o.target !== undefined && typeof n.target === 'string') {
        if (n.target === o.target) n.target = ':scope';
        else if (n.target.startsWith(o.target + ' ')) n.target = n.target.slice(o.target.length + 1);
      }
    }
    return n;
  });
  const inst: Layer = { id: iid, type: 'component' };
  const name = asGroup?.name;
  if (name !== undefined) inst.name = name;
  const parents = new Set(top.filter((l) => layerIds.includes(l.id)).map((l) => l.parent));
  const p = asGroup ? asGroup.parent : parents.size === 1 ? [...parents][0] : undefined;
  if (p !== undefined && !sel.has(p)) inst.parent = p;
  inst.ref = o.id;
  if (o.target !== undefined) inst.target = o.target;
  if (start) inst.start = start;
  const at = top.findIndex((l) => sel.has(l.id));
  d.layers = top.filter((l) => !sel.has(l.id));
  d.layers.splice(top.slice(0, at).filter((l) => !sel.has(l.id)).length, 0, inst);
  const def: any = {};
  if (o.name !== undefined) def.name = o.name;
  def.layers = layers;
  d.components = { ...comps(d), [o.id]: def };
  return d;
}

export interface AddInstanceOptions { id: string; target?: string; start?: number; parent?: string; overrides?: Record<string, SymbolOverride> }
/** Add an instance of a symbol at the end of the top-level layer list. */
export function addInstance(doc: Doc, symbolId: string, o: AddInstanceOptions): Doc {
  need(doc, symbolId);
  if (!o?.id || sceneIds(doc).has(o.id)) throw bad(`layer id "${o?.id}" is taken or empty`);
  const d = clone(doc);
  const inst: Layer = { id: o.id, type: 'component' };
  if (o.parent !== undefined) inst.parent = o.parent;
  inst.ref = symbolId;
  if (o.target !== undefined) inst.target = o.target;
  if (o.start) inst.start = o.start;
  d.layers.push(inst);
  for (const [k, v] of Object.entries(o.overrides || {})) setOv(d, o.id, k, v);
  return d;
}

function setOv(d: Doc, instanceId: string, layerId: string, ov: SymbolOverride): void {
  const inst = findInstance(d, instanceId);
  if (!symbolLayerIds(need(d, inst.ref)).has(layerId)) throw bad(`symbol "${inst.ref}" has no layer "${layerId}"`);
  const cur = isObj(inst.overrides) ? inst.overrides : {};
  const prev = isObj(cur[layerId]) ? cur[layerId] : {};
  const next: SymbolOverride = { ...prev, ...clone(ov) };
  if (ov.props || prev.props) next.props = { ...(prev.props || {}), ...(clone(ov.props) || {}) };
  inst.overrides = { ...cur, [layerId]: next };
}
/** Override one symbol layer for one instance (`target`, `muted`, `props` set on every keyframe); merges with an existing override. */
export function setOverride(doc: Doc, instanceId: string, layerId: string, ov: SymbolOverride): Doc {
  const d = clone(doc);
  setOv(d, instanceId, layerId, ov);
  return d;
}
/** Remove one override (or every override of the instance when `layerId` is omitted). */
export function clearOverride(doc: Doc, instanceId: string, layerId?: string): Doc {
  const d = clone(doc);
  const inst = findInstance(d, instanceId);
  if (layerId !== undefined && isObj(inst.overrides)) delete inst.overrides[layerId];
  if (layerId === undefined || !Object.keys(inst.overrides || {}).length) delete inst.overrides;
  return d;
}

/** Edit a symbol's master layers once; every instance follows (overrides are kept). Refuses a symbol that would contain itself. */
export function updateSymbol(doc: Doc, symbolId: string, edit: (layers: Layer[]) => Layer[]): Doc {
  const def = need(doc, symbolId);
  const layers = edit(clone(def.layers || []));
  if (!Array.isArray(layers)) throw bad('edit must return layers');
  const d = clone(doc);
  d.components = { ...comps(d), [symbolId]: { ...def, layers: clone(layers) } };
  if (reach(d, layers).has(symbolId)) throw bad(`symbol "${symbolId}" would contain itself (cycle)`);
  return d;
}

/** Rename a symbol and every reference to it. */
export function renameSymbol(doc: Doc, from: string, to: string): Doc {
  need(doc, from);
  if (!to || hasSym(doc, to)) throw bad(`symbol "${to}" exists or is empty`);
  const d = clone(doc);
  const c: Record<string, any> = {};
  for (const k of Object.keys(comps(d))) c[k === from ? to : k] = comps(d)[k];
  d.components = c;
  for (const ls of lists(d)) for (const l of ls) if (l?.type === 'component' && l.ref === from) l.ref = to;
  return d;
}

/** Replace one instance by plain layers (a group named after the instance + its expanded layers, as `sceneV3ToV2` reads them). */
export function detachInstance(doc: Doc, instanceId: string): { doc: Doc; lost: SymbolProblem[] } {
  const top: Layer[] = doc.layers;
  const i = top.findIndex((l) => l.id === instanceId && l.type === 'component');
  if (i < 0) throw bad(`no top-level instance "${instanceId}"`);
  need(doc, top[i].ref);
  const f = flattenSceneV3({ components: doc.components, layers: [top[i]] });
  const d = clone(doc);
  d.layers.splice(i, 1, ...f.doc.layers);
  return { doc: d, lost: f.lost.filter((p) => !/expanded/.test(p.message)) };
}

/** Which instances use each symbol, and how many overrides they carry. */
export function symbolUsage(doc: Doc): Record<string, SymbolUsage> {
  const out: Record<string, SymbolUsage> = {};
  for (const k of Object.keys(comps(doc))) out[k] = { instances: [], overrides: 0 };
  for (const l of sceneInstances(doc)) if (out[l.ref]) { out[l.ref].instances.push(l.id); out[l.ref].overrides += Object.keys(isObj(l.overrides) ? l.overrides : {}).length; }
  return out;
}

/** Symbol-level problems `validateSceneV3` does not judge as errors: missing refs, stray override keys, cycles, unused symbols. */
export function validateSymbols(doc: Doc): SymbolProblem[] {
  const p: SymbolProblem[] = [];
  const walk = (ls: unknown, at: string) => {
    if (!Array.isArray(ls)) return;
    ls.forEach((l: any, i: number) => {
      const lp = `${at}[${i}]`;
      if (l?.type === 'comp') walk(l.layers, `${lp}.layers`);
      if (l?.type !== 'component') return;
      if (!hasSym(doc, l.ref)) { p.push({ path: `${lp}.ref`, message: `unknown symbol "${l.ref}"` }); return; }
      const own = symbolLayerIds(comps(doc)[l.ref]);
      for (const k of Object.keys(isObj(l.overrides) ? l.overrides : {})) if (!own.has(k)) p.push({ path: `${lp}.overrides.${k}`, message: `symbol "${l.ref}" has no layer "${k}"` });
    });
  };
  walk(doc.layers, 'layers');
  const used = reach(doc, doc.layers || []);
  for (const k of Object.keys(comps(doc))) {
    walk(comps(doc)[k]?.layers, `components.${k}.layers`);
    if (reach(doc, comps(doc)[k]?.layers || []).has(k)) p.push({ path: `components.${k}`, message: 'contains itself (cycle)' });
    if (!used.has(k)) p.push({ path: `components.${k}`, message: 'unused (no instance)' });
  }
  return p;
}

const kebab = (p: string) => (p.startsWith('--') ? p : p.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase()));
const cssId = (s: string) => s.replace(/[^\w-]/g, '_');
const r2 = (n: number) => Math.round(n * 100) / 100;

/**
 * CSS for a Scene v3 document with symbols: one `@keyframes <prefix>-<symbol>-<layer>` per symbol track (emitted
 * once however many instances use it); each instance adds one rule per layer (its selector, duration, delay). An
 * instance with `props` overrides gets its own block (`…--<instance>`); muted layers are skipped; plain top-level
 * tracks export as `<prefix>-<layer>`. Instances inside compositions and symbols inside symbols are listed in `lost`.
 */
export function symbolsToCss(doc: Doc, o: { prefix?: string } = {}): { css: string; report: SymbolsCssReport } {
  const pre = o.prefix || 'mo';
  const blocks: string[] = [], rules: string[] = [], lost: SymbolProblem[] = [];
  const made = new Set<string>();
  const block = (name: string, l: Layer, props?: Record<string, any>) => {
    if (made.has(name)) return;
    made.add(name);
    const ks = [...(l.keyframes || [])].sort((a: any, b: any) => a.time - b.time);
    const t0 = ks[0].time, span = ks[ks.length - 1].time - t0 || 1;
    const lines = ks.map((k: any) => {
      const ps = { ...k.props, ...(props || {}) };
      const decl = Object.keys(ps).map((n) => `${kebab(n)}: ${ps[n]};`);
      if (k.easing && k.easing !== 'linear') decl.push(`animation-timing-function: ${k.easing};`);
      return `  ${r2(((k.time - t0) / span) * 100)}% { ${decl.join(' ')} }`;
    });
    blocks.push(`@keyframes ${name} {\n${lines.join('\n')}\n}`);
  };
  const rule = (sel: string | undefined, name: string, l: Layer, at: number) => {
    if (!sel) return;
    const ks = l.keyframes.map((k: any) => k.time);
    const t0 = Math.min(...ks), dur = Math.max(...ks) - t0;
    rules.push(`${sel} { animation: ${name} ${r2(dur)}ms ${r2(at + t0)}ms both; }`);
  };
  const playable = (l: Layer) => l?.type === 'track' && !l.muted && Array.isArray(l.keyframes) && l.keyframes.length > 0;
  const shifted = (l: Layer) => (l.start ? { ...l, keyframes: l.keyframes.map((k: any) => ({ ...k, time: k.time + l.start })) } : l);
  let instances = 0;
  (doc.layers || []).forEach((l: Layer, i: number) => {
    if (playable(l)) { const s = shifted(l), n = `${pre}-${cssId(l.id)}`; block(n, s); rule(l.target, n, s, 0); return; }
    if (l?.type === 'comp') { lost.push({ path: `layers[${i}]`, message: 'composition not exported (use sceneV3ToV2)' }); return; }
    if (l?.type !== 'component' || !hasSym(doc, l.ref)) return;
    instances++;
    const ov = isObj(l.overrides) ? l.overrides : {};
    for (const s of comps(doc)[l.ref].layers || []) {
      if (s?.type === 'component' || s?.type === 'comp') { lost.push({ path: `components.${l.ref}`, message: `nested "${s.id}" not exported` }); continue; }
      const v = ov[s.id] || {};
      if (!playable(s) || v.muted) continue;
      const t = shifted(s);
      let n = `${pre}-${cssId(l.ref)}-${cssId(s.id)}`;
      if (v.props && Object.keys(v.props).length) { n += `--${cssId(l.id)}`; block(n, t, v.props); } else block(n, t);
      const sel = v.target !== undefined ? v.target : l.target === undefined ? s.target : s.target === undefined || s.target === ':scope' ? l.target : `${l.target} ${s.target}`;
      rule(sel, n, t, l.start || 0);
    }
  });
  const css = [...blocks, ...rules].join('\n') + '\n';
  return { css, report: { symbols: Object.keys(comps(doc)).length, instances, keyframeBlocks: blocks.length, rules: rules.length, lost } };
}
