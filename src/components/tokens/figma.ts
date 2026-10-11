/**
 * Motion Tokens 2.0 (14.1) — Figma Variables adapter. Pure data in the shapes of the Figma Variables REST API:
 * `motionTokensToFigma()` builds a `POST /v1/files/:file_key/variables` body; `motionTokensFromFigma()` reads a
 * `GET /v1/files/:file_key/variables/local` response (or such a POST body). No network calls: send the body with
 * your own token, or use `npx motionary tokens export-figma / import-figma`.
 *
 * Variables are named `motion/<group>/<name>` (the 12.3 Figma plugin's names): durations and distances FLOAT,
 * easings STRING, springs three FLOATs (`motion/spring/<name>/stiffness|damping|mass`), semantic tokens
 * `motion/<enter|exit|emphasis|transition>/<name>/<duration|delay|easing|distance>` as aliases of the primitives.
 * Token-set modes become collection modes (`reduced` ↔ "Reduced motion").
 */
import { MOTION_TOKENS_2, SEMANTIC_KINDS, REDUCED_MOTION_MODE, defineMotionTokens, withMode, kebab, tokenRefPath } from './set';
import type { MotionTokenSet, MotionTokenInput, SemanticKind } from './set';

export type FigmaResolvedType = 'FLOAT' | 'STRING' | 'BOOLEAN' | 'COLOR';
export interface FigmaAlias { type: 'VARIABLE_ALIAS'; id: string }
export type FigmaValue = number | string | boolean | FigmaAlias | Record<string, number>;
/** The body of `POST /v1/files/:file_key/variables`. */
export interface FigmaVariablesBody {
  variableCollections: { action: 'CREATE' | 'UPDATE' | 'DELETE'; id: string; name?: string; initialModeId?: string; hiddenFromPublishing?: boolean }[];
  variableModes: { action: 'CREATE' | 'UPDATE' | 'DELETE'; id: string; name?: string; variableCollectionId: string }[];
  variables: { action: 'CREATE' | 'UPDATE' | 'DELETE'; id: string; name?: string; variableCollectionId?: string; resolvedType?: FigmaResolvedType; description?: string; scopes?: string[]; codeSyntax?: { WEB?: string; ANDROID?: string; iOS?: string } }[];
  variableModeValues: { variableId: string; modeId: string; value: FigmaValue }[];
}
export interface FigmaExportOptions {
  /** Collection name (default "Motion"). */
  collection?: string;
  /** Modes to add next to Default (default: `reduced` + the set's modes). */
  modes?: string[];
  /** Variable name prefix (default "motion"). */
  prefix?: string;
  /** CSS custom property prefix for `codeSyntax.WEB` (default `--usa`). */
  cssPrefix?: string;
}

const isObj = (v: unknown): v is Record<string, any> => !!v && typeof v === 'object' && !Array.isArray(v);
const FIELDS = ['duration', 'delay', 'easing', 'distance'] as const;
const SPRING = ['stiffness', 'damping', 'mass'] as const;
const modeLabel = (m: string) => (m === REDUCED_MOTION_MODE ? 'Reduced motion' : m.replace(/(^|-)(\w)/g, (_, s, c) => (s ? ' ' : '') + c.toUpperCase()));
const modeKey = (name: string) => (/reduc/i.test(name) ? REDUCED_MOTION_MODE : kebab(name.trim()).replace(/[^a-z0-9_-]/g, ''));

/** A token set as a Figma Variables `POST` body (one collection, Default + one mode per token-set mode). */
export function motionTokensToFigma(set: MotionTokenSet = MOTION_TOKENS_2, o: FigmaExportOptions = {}): FigmaVariablesBody {
  const P = o.prefix || 'motion', C = o.cssPrefix || '--usa', col = `${P}-collection`;
  const modes = o.modes || [...new Set([REDUCED_MOTION_MODE, ...Object.keys(set.modes || {})])];
  const mid = (m?: string) => `${P}-mode-${m || 'default'}`;
  const body: FigmaVariablesBody = {
    variableCollections: [{ action: 'CREATE', id: col, name: o.collection || 'Motion', initialModeId: mid() }],
    variableModes: [{ action: 'UPDATE', id: mid(), name: 'Default', variableCollectionId: col }, ...modes.map((m) => ({ action: 'CREATE' as const, id: mid(m), name: modeLabel(m), variableCollectionId: col }))],
    variables: [],
    variableModeValues: [],
  };
  const views: [string, MotionTokenSet][] = [[mid(), withMode(set)], ...modes.map((m) => [mid(m), withMode(set, m)] as [string, MotionTokenSet])];
  const vid = (name: string) => `var:${name}`;
  const declared = new Set<string>();
  const declare = (name: string, type: FigmaResolvedType, css: string, description?: string) => {
    if (declared.has(name)) return;
    declared.add(name);
    body.variables.push({ action: 'CREATE', id: vid(name), name, variableCollectionId: col, resolvedType: type, ...(description ? { description } : {}), scopes: ['ALL_SCOPES'], codeSyntax: { WEB: `var(${C}-${css})` } });
  };
  const put = (name: string, modeId: string, value: FigmaValue) => body.variableModeValues.push({ variableId: vid(name), modeId, value });
  const prims: [keyof MotionTokenSet & string, FigmaResolvedType, string][] = [['duration', 'FLOAT', 'ms'], ['easing', 'STRING', 'CSS easing'], ['distance', 'FLOAT', 'px']];
  // primitives: names from every view (a mode can add tokens)
  for (const [modeId, s] of views) {
    for (const [g, type, d] of prims)
      for (const [k, v] of Object.entries(s[g] as Record<string, any>)) {
        const name = `${P}/${g}/${k}`;
        declare(name, type, `${g}-${kebab(k)}`, d);
        put(name, modeId, v);
      }
    for (const [k, v] of Object.entries(s.spring))
      for (const f of SPRING) {
        const name = `${P}/spring/${k}/${f}`;
        declare(name, 'FLOAT', `spring-${kebab(k)}-${f}`, `spring ${f}`);
        put(name, modeId, v[f]);
      }
  }
  // semantic tokens: aliases where they reference a primitive, literals otherwise
  for (const [modeId, s] of views)
    for (const kind of SEMANTIC_KINDS)
      for (const [n, e] of Object.entries(s.semantic[kind] || {})) {
        const base = `${P}/${kind}/${n}`, css = `motion-${kind}-${kebab(n)}`;
        for (const f of FIELDS) {
          const v = (e as any)[f];
          if (v == null) continue;
          const r = tokenRefPath(v), name = `${base}/${f}`;
          declare(name, f === 'easing' ? 'STRING' : 'FLOAT', `${css}-${f}`, f === 'easing' ? 'CSS easing' : f === 'distance' ? 'px' : 'ms');
          if (r) put(name, modeId, { type: 'VARIABLE_ALIAS', id: vid(`${P}/${r.replace('.', '/')}`) });
          else put(name, modeId, f === 'easing' ? String(v) : typeof v === 'number' ? v : parseFloat(String(v)) || 0);
        }
        if (e.spring != null) {
          const r = tokenRefPath(e.spring);
          for (const f of SPRING) {
            const name = `${base}/spring/${f}`;
            declare(name, 'FLOAT', `${css}-spring-${f}`, `spring ${f}`);
            put(name, modeId, r ? { type: 'VARIABLE_ALIAS', id: vid(`${P}/spring/${r.split('.')[1]}/${f}`) } : (e.spring as any)[f]);
          }
        }
      }
  return body;
}

interface NVar { id: string; name: string; type: string; col: string; values: Record<string, any> }

/** Normalize a GET /variables/local response or a POST body into collections + variables. */
function normalize(json: any): { cols: Record<string, { name: string; modes: { id: string; name: string }[]; def: string }>; vars: NVar[] } {
  const cols: Record<string, { name: string; modes: { id: string; name: string }[]; def: string }> = {};
  const vars: NVar[] = [];
  if (isObj(json?.meta?.variables)) {
    for (const c of Object.values<any>(json.meta.variableCollections || {})) cols[c.id] = { name: c.name, def: c.defaultModeId, modes: (c.modes || []).map((m: any) => ({ id: m.modeId, name: m.name })) };
    for (const v of Object.values<any>(json.meta.variables)) vars.push({ id: v.id, name: v.name, type: v.resolvedType, col: v.variableCollectionId, values: { ...(v.valuesByMode || {}) } });
  } else if (Array.isArray(json?.variables)) {
    for (const c of json.variableCollections || []) if (c.action !== 'DELETE') cols[c.id] = { name: c.name, def: c.initialModeId, modes: [] };
    for (const m of json.variableModes || []) if (m.action !== 'DELETE' && cols[m.variableCollectionId]) cols[m.variableCollectionId].modes.push({ id: m.id, name: m.name });
    for (const c of Object.values(cols)) if (!c.modes.some((m) => m.id === c.def)) c.modes.unshift({ id: c.def, name: 'Default' });
    const byId: Record<string, NVar> = {};
    for (const v of json.variables) if (v.action !== 'DELETE') vars.push((byId[v.id] = { id: v.id, name: v.name, type: v.resolvedType, col: v.variableCollectionId, values: {} }));
    for (const x of json.variableModeValues || []) if (byId[x.variableId]) byId[x.variableId].values[x.modeId] = x.value;
  } else throw new Error('[motionary] tokens: not a Figma Variables response (meta.variables) or POST body (variables[])');
  return { cols, vars };
}

/**
 * Read a Figma Variables `GET /v1/files/:key/variables/local` response (or a `POST` body) into a token set,
 * merged over `base`. The collection's default mode is the set; other modes become token-set modes holding only
 * what differs ("Reduced motion" / "Reduce motion" → `reduced`, "Dense UI" → `dense-ui`).
 */
export function motionTokensFromFigma(json: unknown, o: { collection?: string; prefix?: string; base?: MotionTokenSet } = {}): MotionTokenSet {
  const P = (o.prefix || 'motion') + '/';
  const { cols, vars } = normalize(json);
  const mine = vars.filter((v) => typeof v.name === 'string' && v.name.startsWith(P) && (v.type === 'FLOAT' || v.type === 'STRING'));
  const colId = Object.keys(cols).find((id) => (o.collection ? cols[id].name === o.collection : mine.some((v) => v.col === id))) || mine[0]?.col;
  const col = colId ? cols[colId] : undefined;
  const list = mine.filter((v) => v.col === colId);
  const byId: Record<string, NVar> = {};
  for (const v of vars) byId[v.id] = v;
  const val = (v: NVar, mode: string) => (mode in v.values ? v.values[mode] : v.values[col?.def ?? '']);
  // a value in a mode, aliases followed to a literal
  const literal = (v: NVar, mode: string, depth = 0): any => {
    const x = val(v, mode);
    if (isObj(x) && x.type === 'VARIABLE_ALIAS') return depth < 16 && byId[x.id] ? literal(byId[x.id], mode, depth + 1) : undefined;
    return x;
  };
  const split = (v: NVar) => v.name.slice(P.length).split('/');
  const read = (mode: string): MotionTokenInput => {
    const t: any = { duration: {}, easing: {}, distance: {}, spring: {}, semantic: {} };
    const sem: Record<string, Record<string, any>> = {};
    for (const v of list) {
      const parts = split(v), [g, n, f, sf] = parts;
      if ((g === 'duration' || g === 'distance') && parts.length === 2) { const x = literal(v, mode); if (typeof x === 'number') t[g][n] = x; }
      else if (g === 'easing' && parts.length === 2) { const x = literal(v, mode); if (typeof x === 'string') t.easing[n] = x; }
      else if (g === 'spring' && parts.length === 3 && (SPRING as readonly string[]).includes(f)) { const x = literal(v, mode); if (typeof x === 'number') (t.spring[n] ||= {})[f] = x; }
      else if ((SEMANTIC_KINDS as readonly string[]).includes(g) && n) {
        const e = ((sem[g] ||= {})[n] ||= {});
        const raw = val(v, mode), target = isObj(raw) && raw.type === 'VARIABLE_ALIAS' ? byId[raw.id] : undefined;
        const tp = target && target.name.startsWith(P) ? split(target) : undefined;
        if ((FIELDS as readonly string[]).includes(f) && parts.length === 3) {
          const want = f === 'delay' ? 'duration' : f;
          e[f] = tp && tp.length === 2 && tp[0] === want ? `{${want}.${tp[1]}}` : literal(v, mode);
        } else if (f === 'spring' && (SPRING as readonly string[]).includes(sf)) {
          (e.$spring ||= {})[sf] = tp && tp.length === 3 && tp[0] === 'spring' && tp[2] === sf ? `ref:${tp[1]}` : literal(v, mode);
        }
      }
    }
    for (const [k, grp] of Object.entries(sem))
      for (const [n, e] of Object.entries(grp)) {
        if (e.$spring) {
          const refs = SPRING.map((f) => e.$spring[f]);
          e.spring = refs.every((r) => typeof r === 'string' && r === refs[0] && r.startsWith('ref:')) ? `{spring.${refs[0].slice(4)}}` : { stiffness: +refs[0], damping: +refs[1], mass: +refs[2] };
          delete e.$spring;
        }
        for (const f of Object.keys(e)) if (e[f] === undefined) delete e[f];
        (t.semantic[k] ||= {})[n] = e;
      }
    return t;
  };
  const def = col?.def ?? '';
  const base = read(def) as any;
  const modes: Record<string, any> = {};
  for (const m of col?.modes || []) {
    if (m.id === def) continue;
    const t = read(m.id) as any, d: any = {};
    for (const g of ['duration', 'easing', 'distance'])
      for (const [k, v] of Object.entries(t[g])) if (base[g][k] !== v) ((d[g] ||= {})[k] = v);
    for (const [k, v] of Object.entries<any>(t.spring)) for (const f of SPRING) if (base.spring[k]?.[f] !== v[f]) (((d.spring ||= {})[k] ||= {})[f] = v[f]);
    for (const [kind, grp] of Object.entries<any>(t.semantic))
      for (const [n, e] of Object.entries<any>(grp))
        for (const [f, v] of Object.entries<any>(e)) if (JSON.stringify(base.semantic[kind]?.[n]?.[f]) !== JSON.stringify(v)) ((((d.semantic ||= {})[kind] ||= {})[n] ||= {})[f] = v);
    if (Object.keys(d).length) modes[modeKey(m.name)] = d;
  }
  const out = defineMotionTokens({ ...base, semantic: {}, modes }, o.base || MOTION_TOKENS_2);
  for (const k of Object.keys(base.semantic) as SemanticKind[]) for (const n of Object.keys(base.semantic[k])) (out.semantic[k] ||= {})[n] = base.semantic[k][n];
  return out;
}
