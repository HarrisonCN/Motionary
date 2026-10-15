/**
 * Motion Tokens 2.0 (14.1) — the token set: durations, easing curves, springs, spatial distances and motion
 * semantics (enter / exit / emphasis / transition), with modes (built-in `reduced`, default `compact`, custom).
 * Semantic tokens reference primitives with the DTCG alias syntax (`"{duration.normal}"`), the same syntax
 * Motion Engine v2 and Scene Format v2 accept since 13.9 / 14.0.
 */
import { MOTION_TOKENS, applyMotionTokens, parseDuration, parseEasing } from './index';
import type { SpringToken } from './index';
import { resolveTokenAliases, validateDesignTokens } from './dtcg';

export type { SpringToken };
export { validateDesignTokens };

/** Token-set generation (14.1 = 2). */
export const MOTION_TOKENS_VERSION = 2;
export const SEMANTIC_KINDS = ['enter', 'exit', 'emphasis', 'transition'] as const;
export type SemanticKind = (typeof SEMANTIC_KINDS)[number];
/** The built-in reduced-motion mode (derived from any set; explicit overrides apply on top). */
export const REDUCED_MOTION_MODE = 'reduced';
/** 15.3: the built-in gentle mode — half the travel, durations ≤ 300 ms, no overshoot (opt-in: no OS setting maps to it). */
export const GENTLE_MOTION_MODE = 'gentle';

/** A semantic motion: literals or references to primitives (`"{duration.fast}"`, `"{distance.md}"`, `"{spring.snappy}"`). */
export interface SemanticToken {
  /** ms or `"{duration.x}"`. */
  duration: number | string;
  /** CSS easing or `"{easing.x}"` (default: `easing.standard`). */
  easing?: string;
  /** ms or `"{duration.x}"` (default 0). */
  delay?: number | string;
  /** px or `"{distance.x}"` (default 0). */
  distance?: number | string;
  /** `"{spring.x}"` or `{ stiffness, damping, mass }`. */
  spring?: string | SpringToken;
}
export interface MotionTokenOverrides {
  duration?: Record<string, number>;
  easing?: Record<string, string>;
  spring?: Record<string, Partial<SpringToken>>;
  distance?: Record<string, number>;
  semantic?: { [K in SemanticKind]?: Record<string, Partial<SemanticToken>> };
}
export interface MotionTokenSet {
  /** ms */
  duration: Record<string, number>;
  /** CSS easing strings */
  easing: Record<string, string>;
  spring: Record<string, SpringToken>;
  /** Spatial distances in px (how far things travel). */
  distance: Record<string, number>;
  semantic: Record<SemanticKind, Record<string, SemanticToken>>;
  /** Named overrides: `compact`, custom modes; `reduced` is built in. */
  modes?: Record<string, MotionTokenOverrides>;
}
export interface ResolvedMotion {
  duration: number;
  delay: number;
  easing: string;
  distance: number;
  spring?: SpringToken;
}
export type MotionTokenInput = MotionTokenOverrides & { modes?: Record<string, MotionTokenOverrides> };

const PRIM = ['duration', 'easing', 'spring', 'distance'] as const;
type Prim = (typeof PRIM)[number];
const NAME = /^[A-Za-z0-9_-]+$/;
const REF = /^\{([^{}]+)\}$/;
const isObj = (v: unknown): v is Record<string, any> => !!v && typeof v === 'object' && !Array.isArray(v);
const own = (o: any, k: string) => isObj(o) && Object.prototype.hasOwnProperty.call(o, k);
const keys = Object.keys;
/** `"{a.b}"` → `"a.b"` (or undefined). */
export const tokenRefPath = (v: unknown): string | undefined => (typeof v === 'string' ? REF.exec(v.trim())?.[1] : undefined);
export const kebab = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/[\s_.]+/g, '-').toLowerCase();

/** The default token set: the 4.2 scale + distances + semantics + a `compact` mode. */
export const MOTION_TOKENS_2: MotionTokenSet = {
  duration: { ...MOTION_TOKENS.duration },
  easing: { ...MOTION_TOKENS.easing },
  spring: /*#__PURE__*/ Object.fromEntries(Object.entries(MOTION_TOKENS.spring).map(([k, v]) => [k, { ...v }])),
  distance: { none: 0, xs: 4, sm: 8, md: 16, lg: 32, xl: 64 },
  semantic: {
    enter: { default: { duration: '{duration.normal}', easing: '{easing.decelerate}', distance: '{distance.md}' } },
    exit: { default: { duration: '{duration.fast}', easing: '{easing.accelerate}', distance: '{distance.sm}' } },
    emphasis: { default: { duration: '{duration.normal}', easing: '{easing.emphasized}', distance: '{distance.xs}', spring: '{spring.bouncy}' } },
    transition: { default: { duration: '{duration.normal}', easing: '{easing.standard}' } },
  },
  modes: {
    compact: { duration: { fast: 120, normal: 240, slow: 480, slower: 720, slowest: 1120 }, distance: { xs: 2, sm: 4, md: 8, lg: 16, xl: 32 } },
  },
};

const cloneSem = (s: any) => Object.fromEntries(keys(s || {}).map((k) => [k, Object.fromEntries(keys(s[k] || {}).map((n) => [n, { ...s[k][n] }]))]));
function cloneOv(o: any): any {
  const out: any = {};
  for (const g of ['duration', 'easing', 'distance']) if (o[g]) out[g] = { ...o[g] };
  if (o.spring) out.spring = Object.fromEntries(keys(o.spring).map((k) => [k, { ...o.spring[k] }]));
  if (o.semantic) out.semantic = cloneSem(o.semantic);
  return out;
}
function cloneSet(s: MotionTokenSet): MotionTokenSet {
  const out = cloneOv(s) as MotionTokenSet;
  out.duration ||= {}; out.easing ||= {}; out.spring ||= {}; out.distance ||= {};
  out.semantic = cloneSem(s.semantic) as any;
  for (const k of SEMANTIC_KINDS) out.semantic[k] ||= {};
  if (s.modes) out.modes = Object.fromEntries(keys(s.modes).map((m) => [m, cloneOv(s.modes![m])]));
  return out;
}
function mergeOv(t: any, p: any): void {
  if (!isObj(p)) return;
  for (const g of ['duration', 'easing', 'distance']) if (isObj(p[g])) Object.assign((t[g] ||= {}), p[g]);
  if (isObj(p.spring)) for (const k of keys(p.spring)) (t.spring ||= {})[k] = { ...(t.spring[k] || { stiffness: 170, damping: 26, mass: 1 }), ...p.spring[k] };
  if (isObj(p.semantic)) for (const k of keys(p.semantic)) for (const n of keys(p.semantic[k] || {})) ((t.semantic ||= {})[k] ||= {})[n] = { ...(t.semantic[k][n] || {}), ...p.semantic[k][n] };
}

/** Merge a partial set (and modes) over `base` (default: the built-in set). Never mutates either. */
export function defineMotionTokens(partial: MotionTokenInput = {}, base: MotionTokenSet = MOTION_TOKENS_2): MotionTokenSet {
  const out = cloneSet(base);
  mergeOv(out, partial);
  if (isObj(partial.modes)) for (const m of keys(partial.modes)) mergeOv(((out.modes ||= {})[m] ||= {}), partial.modes[m]);
  return out;
}

const bez = (e: string) => {
  const m = /^cubic-bezier\(([^)]*)\)$/.exec(e.trim());
  const n = m ? m[1].split(',').map(Number) : [];
  return n.length === 4 && n.every(isFinite) ? n : undefined;
};
const up = (x: number) => Math.ceil(x * 100) / 100;

/** The reduced-motion overrides derived from a set: no travel, durations ≤ 150 ms, no overshooting curves, critically damped springs. */
export function reducedMotionOverrides(set: MotionTokenSet): MotionTokenOverrides {
  const cap = (v: number) => (v > 150 ? 150 : v);
  const o: MotionTokenOverrides = { duration: {}, easing: {}, spring: {}, distance: {}, semantic: {} };
  for (const k of keys(set.duration)) o.duration![k] = cap(set.duration[k]);
  for (const k of keys(set.distance)) o.distance![k] = 0;
  for (const k of keys(set.easing)) {
    const b = bez(set.easing[k]);
    if (b && (b[1] < 0 || b[1] > 1 || b[3] < 0 || b[3] > 1)) o.easing![k] = 'cubic-bezier(0.2, 0, 0, 1)';
  }
  for (const k of keys(set.spring)) {
    const s = set.spring[k];
    o.spring![k] = { damping: Math.max(s.damping, up(2 * Math.sqrt(s.stiffness * s.mass))) };
  }
  for (const kind of keys(set.semantic) as SemanticKind[])
    for (const n of keys(set.semantic[kind] || {})) {
      const e = set.semantic[kind][n], p: Partial<SemanticToken> = {};
      if (typeof e.distance === 'number' && e.distance) p.distance = 0;
      if (typeof e.duration === 'number' && e.duration > 150) p.duration = 150;
      if (keys(p).length) (o.semantic![kind] ||= {})[n] = p;
    }
  return o;
}

/** 15.3: the gentle-motion overrides derived from a set: travel halved (rounded), durations ≤ 300 ms, no overshooting curves, springs at least 80 % of critical damping. Only changed values are listed. */
export function gentleMotionOverrides(set: MotionTokenSet): MotionTokenOverrides {
  const o: MotionTokenOverrides = { duration: {}, easing: {}, spring: {}, distance: {}, semantic: {} };
  for (const k of keys(set.duration)) if (set.duration[k] > 300) o.duration![k] = 300;
  for (const k of keys(set.distance)) { const v = Math.round(set.distance[k] * 0.5); if (v !== set.distance[k]) o.distance![k] = v; }
  for (const k of keys(set.easing)) {
    const b = bez(set.easing[k]);
    if (b && (b[1] < 0 || b[1] > 1 || b[3] < 0 || b[3] > 1)) o.easing![k] = 'cubic-bezier(0.2, 0, 0, 1)';
  }
  for (const k of keys(set.spring)) {
    const s = set.spring[k], min = up(0.8 * 2 * Math.sqrt(s.stiffness * s.mass));
    if (s.damping < min) o.spring![k] = { damping: min };
  }
  for (const kind of keys(set.semantic) as SemanticKind[])
    for (const n of keys(set.semantic[kind] || {})) {
      const e = set.semantic[kind][n], p: Partial<SemanticToken> = {};
      if (typeof e.distance === 'number' && e.distance) p.distance = Math.round(e.distance * 0.5);
      if (typeof e.duration === 'number' && e.duration > 300) p.duration = 300;
      if (keys(p).length) (o.semantic![kind] ||= {})[n] = p;
    }
  return o;
}

/** The set as seen in `mode` (or several, applied in order); `reduced` and `gentle` (15.3) are always available. The result has no `modes`. */
export function withMode(set: MotionTokenSet, mode?: string | string[]): MotionTokenSet {
  const out = cloneSet(set);
  delete out.modes;
  for (const m of mode == null ? [] : Array.isArray(mode) ? mode : [mode]) {
    const explicit = set.modes && own(set.modes, m) ? set.modes[m] : undefined;
    if (m === REDUCED_MOTION_MODE) mergeOv(out, reducedMotionOverrides(out));
    else if (m === GENTLE_MOTION_MODE) mergeOv(out, gentleMotionOverrides(out));
    else if (!explicit) throw new Error(`[motionary] tokens: unknown mode "${m}" (have: ${[REDUCED_MOTION_MODE, GENTLE_MOTION_MODE, ...keys(set.modes || {})].join(', ')})`);
    mergeOv(out, explicit);
  }
  return out;
}

function prim(set: MotionTokenSet, g: Prim, n: string): any {
  const v = own(set[g], n) ? (set[g] as any)[n] : undefined;
  return g === 'spring' && v ? { ...v } : v;
}
const lit = (set: MotionTokenSet, v: unknown, g: Prim): any => {
  const p = tokenRefPath(v);
  if (p) {
    const [grp, n] = p.split('.');
    return grp === g ? prim(set, g, n) : undefined;
  }
  if (g === 'easing') return typeof v === 'string' ? v : undefined;
  if (g === 'spring') return isObj(v) ? { stiffness: +v.stiffness, damping: +v.damping, mass: +(v.mass ?? 1) } : undefined;
  if (g === 'distance') return typeof v === 'number' ? v : typeof v === 'string' ? parseFloat(v) : undefined;
  return parseDuration(v);
};

/** One semantic motion, resolved to literals (falls back to the kind's `default`). */
export function resolveSemantic(set: MotionTokenSet, kind: SemanticKind, name = 'default', mode?: string | string[]): ResolvedMotion {
  const s = mode ? withMode(set, mode) : set;
  const grp = s.semantic[kind] || {};
  const e = grp[name] || grp.default;
  if (!e) throw new Error(`[motionary] tokens: no semantic token ${kind}.${name}`);
  const r: ResolvedMotion = {
    duration: lit(s, e.duration, 'duration') ?? 0,
    delay: e.delay == null ? 0 : lit(s, e.delay, 'duration') ?? 0,
    easing: (e.easing == null ? s.easing.standard : lit(s, e.easing, 'easing')) ?? 'ease',
    distance: e.distance == null ? 0 : lit(s, e.distance, 'distance') ?? 0,
  };
  if (e.spring != null) {
    const sp = lit(s, e.spring, 'spring');
    if (sp) r.spring = sp;
  }
  return r;
}

/** `"{duration.fast}"`, `"distance.md"`, `"{enter.default}"`, `"{semantic.exit.default}"` → its value (undefined when unknown). */
export function resolveMotionToken(set: MotionTokenSet, ref: string, mode?: string | string[]): number | string | SpringToken | ResolvedMotion | undefined {
  const s = mode ? withMode(set, mode) : set;
  const parts = (tokenRefPath(ref) ?? ref).split('.');
  if (parts[0] === 'semantic') parts.shift();
  const [g, n] = parts;
  if ((PRIM as readonly string[]).includes(g)) return prim(s, g as Prim, n);
  if ((SEMANTIC_KINDS as readonly string[]).includes(g) && own(s.semantic[g as SemanticKind], n)) return resolveSemantic(s, g as SemanticKind, n);
  return undefined;
}

/** `{ duration, delay, easing }` for `animate()` in motionary/motion. */
export function motionOptions(set: MotionTokenSet, kind: SemanticKind, name = 'default', mode?: string | string[]): { duration: number; delay: number; easing: string } {
  const r = resolveSemantic(set, kind, name, mode);
  return { duration: r.duration, delay: r.delay, easing: r.easing };
}

/** Keyframes for a semantic motion: enter / exit fade + travel by its distance, emphasis nudges and returns, transition moves. */
export function motionKeyframes(set: MotionTokenSet, kind: SemanticKind, name = 'default', o: { axis?: 'x' | 'y'; direction?: 1 | -1; mode?: string | string[] } = {}): Keyframe[] {
  const d = resolveSemantic(set, kind, name, o.mode).distance * (o.direction || 1);
  const t = (k: number) => (d * k ? `translate${(o.axis || 'y').toUpperCase()}(${d * k}px)` : 'none');
  if (kind === 'enter') return [{ opacity: 0, transform: t(1) }, { opacity: 1, transform: 'none' }];
  if (kind === 'exit') return [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: t(1) }];
  if (kind === 'emphasis') return [{ transform: 'none' }, { transform: t(-1), offset: 0.4 }, { transform: 'none' }];
  return [{ transform: 'none' }, { transform: t(1) }];
}

const EASE_KW = /^(linear|ease|ease-in|ease-out|ease-in-out|step-start|step-end)$/;
/** Whether `v` is a CSS easing this library understands (keywords, cubic-bezier with x in 0–1, steps(), linear()). */
export function isCssEasing(v: unknown): boolean {
  if (typeof v !== 'string') return false;
  const s = v.trim();
  if (EASE_KW.test(s)) return true;
  if (/^cubic-bezier\(/.test(s)) {
    const b = bez(s);
    return !!b && b[0] >= 0 && b[0] <= 1 && b[2] >= 0 && b[2] <= 1;
  }
  return /^steps\(\s*\d+\s*(,\s*(jump-start|jump-end|jump-none|jump-both|start|end)\s*)?\)$/.test(s) || /^linear\([^()]+\)$/.test(s);
}

function checkGroups(o: any, at: string, P: (p: string, m: string) => void): void {
  const num = (v: unknown) => typeof v === 'number' && isFinite(v);
  for (const g of PRIM) {
    if (o[g] === undefined) continue;
    if (!isObj(o[g])) { P(`${at}${g}`, 'expected an object'); continue; }
    for (const [n, v] of Object.entries<any>(o[g])) {
      const p = `${at}${g}.${n}`;
      if (!NAME.test(n)) P(p, 'invalid name (letters, digits, - and _)');
      else if (g === 'duration' && !(num(v) && v >= 0 && v <= 1e7)) P(p, 'expected a finite number of ms ≥ 0');
      else if (g === 'distance' && !num(v)) P(p, 'expected a finite number of px');
      else if (g === 'easing' && !isCssEasing(v)) P(p, `not a CSS easing: ${JSON.stringify(v)}`);
      else if (g === 'spring' && !(isObj(v) && (v.stiffness === undefined || (num(v.stiffness) && v.stiffness > 0)) && (v.damping === undefined || (num(v.damping) && v.damping >= 0)) && (v.mass === undefined || (num(v.mass) && v.mass > 0))))
        P(p, 'expected { stiffness > 0, damping ≥ 0, mass > 0 }');
    }
  }
}

/** Problems in a token set (empty = valid). Never throws. */
export function validateMotionTokens(set: MotionTokenSet): string[] {
  const out: string[] = [];
  const P = (p: string, m: string) => void out.push(`${p}: ${m}`);
  if (!isObj(set)) return ['set: expected an object'];
  checkGroups(set, '', P);
  const sem = (s: any, at: string, all: MotionTokenSet, partial: boolean) => {
    if (!isObj(s)) return void P(at, 'expected an object');
    for (const k of keys(s)) {
      if (!(SEMANTIC_KINDS as readonly string[]).includes(k)) { P(`${at}.${k}`, 'unknown kind (enter | exit | emphasis | transition)'); continue; }
      for (const [n, e] of Object.entries<any>(s[k] || {})) {
        const p = `${at}.${k}.${n}`;
        if (!NAME.test(n)) { P(p, 'invalid name (letters, digits, - and _)'); continue; }
        if (!isObj(e)) { P(p, 'expected an object'); continue; }
        if (!partial && e.duration === undefined) P(`${p}.duration`, 'required');
        for (const f of keys(e)) {
          const g = ({ duration: 'duration', delay: 'duration', easing: 'easing', distance: 'distance', spring: 'spring' } as Record<string, Prim>)[f];
          if (!g) { P(`${p}.${f}`, 'unknown field (duration | easing | delay | distance | spring)'); continue; }
          const v = e[f], r = tokenRefPath(v);
          if (r) {
            const [rg, rn] = r.split('.');
            if (rg !== g) P(`${p}.${f}`, `${v} is not a ${g} token`);
            else if (!own(all[g], rn)) P(`${p}.${f}`, `unknown token ${v}`);
          } else if (typeof v === 'string' && v.trim().startsWith('{')) P(`${p}.${f}`, `malformed token reference ${JSON.stringify(v)}`);
          else if (lit(all, v, g) === undefined || (g === 'easing' && !isCssEasing(v)) || (g !== 'easing' && g !== 'spring' && !isFinite(lit(all, v, g))))
            P(`${p}.${f}`, `invalid ${g} value ${JSON.stringify(v)}`);
        }
      }
    }
  };
  sem(set.semantic, 'semantic', set, false);
  if (set.modes !== undefined) {
    if (!isObj(set.modes)) P('modes', 'expected an object');
    else
      for (const [m, o] of Object.entries<any>(set.modes)) {
        if (!NAME.test(m)) { P(`modes.${m}`, 'invalid mode name'); continue; }
        if (!isObj(o)) { P(`modes.${m}`, 'expected an object'); continue; }
        for (const k of keys(o)) if (!(PRIM as readonly string[]).includes(k) && k !== 'semantic') P(`modes.${m}.${k}`, 'unknown group');
        checkGroups(o, `modes.${m}.`, P);
        let view: MotionTokenSet | undefined;
        try { view = withMode(set, m); } catch { /* reported above */ }
        if (o.semantic && view) sem(o.semantic, `modes.${m}.semantic`, view, true);
      }
  }
  try {
    const r = withMode(set, REDUCED_MOTION_MODE);
    for (const [k, v] of Object.entries(r.distance)) if (v) P('modes.reduced', `distance.${k} is ${v} — reduced motion should not move content`);
  } catch { /* invalid set, reported above */ }
  return out;
}

// --- W3C Design Tokens (DTCG 2025.10) ---------------------------------------------------

export interface DTCGOptions {
  /** '2025.10' (default: `{ value, unit }`) or 'draft' (`"150ms"`, `"16px"`). */
  format?: '2025.10' | 'draft';
  /** Top-level group (default 'motion'). */
  group?: string;
  /** Write modes into `$extensions["org.motionary"].modes` (default true). */
  modes?: boolean;
}
const X = 'org.motionary';

/** Export a token set as a DTCG document (springs, semantic distance / spring and modes travel in `$extensions["org.motionary"]`). */
export function motionTokenSetToDTCG(set: MotionTokenSet, o: DTCGOptions = {}): Record<string, any> {
  const stable = (o.format || '2025.10') === '2025.10', G = o.group || 'motion';
  const ms = (v: number) => (stable ? { value: v, unit: 'ms' } : `${v}ms`);
  const px = (v: number) => (stable ? { value: v, unit: 'px' } : `${v}px`);
  const ref = (v: string) => `{${G}.${tokenRefPath(v)}}`;
  const g: any = { $description: 'Motion tokens (Motionary Motion Tokens 2.0)', duration: { $type: 'duration' }, easing: { $type: 'cubicBezier' }, distance: { $type: 'dimension' }, spring: { $description: 'Spring parameters (not a DTCG type; in $extensions)' } };
  for (const [k, v] of Object.entries(set.duration)) g.duration[k] = { $value: ms(v) };
  for (const [k, v] of Object.entries(set.distance)) g.distance[k] = { $value: px(v) };
  const easeTok = (css: string) => {
    const b = bez(css) || ({ linear: [0, 0, 1, 1], ease: [0.25, 0.1, 0.25, 1], 'ease-in': [0.42, 0, 1, 1], 'ease-out': [0, 0, 0.58, 1], 'ease-in-out': [0.42, 0, 0.58, 1] } as Record<string, number[]>)[css.trim()];
    return b ? { $value: b, ...(parseEasing(b) !== css ? { $extensions: { [X]: { css } } } : {}) } : undefined;
  };
  for (const [k, v] of Object.entries(set.easing)) g.easing[k] = easeTok(v) || { $type: 'string', $value: v };
  for (const [k, v] of Object.entries(set.spring)) g.spring[k] = { $extensions: { [X]: { spring: { ...v } } } };
  for (const kind of SEMANTIC_KINDS) {
    const grp = set.semantic[kind] || {};
    if (!keys(grp).length) continue;
    g[kind] = { $type: 'transition' };
    for (const [n, e] of Object.entries(grp)) {
      const val = (v: any, f: (x: number) => any, p: Prim) => (tokenRefPath(v) ? ref(v) : f(lit(set, v, p) ?? 0));
      const x: any = {};
      let tf: any;
      if (e.easing == null) (tf = `{${G}.easing.standard}`), (x.noEasing = true);
      else if (tokenRefPath(e.easing)) tf = ref(e.easing);
      else {
        const t = easeTok(e.easing);
        tf = t ? t.$value : [0, 0, 1, 1];
        if (!t || t.$extensions) x.easing = e.easing;
      }
      if (e.distance != null) x.distance = val(e.distance, px, 'distance');
      if (e.spring != null) x.spring = tokenRefPath(e.spring) ? ref(e.spring as string) : { ...(e.spring as SpringToken) };
      if (e.delay != null) x.delay = true;
      const tok: any = { $value: { duration: val(e.duration, ms, 'duration'), delay: e.delay == null ? ms(0) : val(e.delay, ms, 'duration'), timingFunction: tf } };
      if (keys(x).length) tok.$extensions = { [X]: x };
      g[kind][n] = tok;
    }
  }
  const doc: any = { $schema: 'https://www.designtokens.org/schemas/2025.10/format.json', [G]: g, $extensions: { [X]: { version: MOTION_TOKENS_VERSION } } };
  if (o.modes !== false && set.modes && keys(set.modes).length) doc.$extensions[X].modes = JSON.parse(JSON.stringify(set.modes));
  return doc;
}

const PRIM_GROUPS: Record<string, Prim> = { duration: 'duration', durations: 'duration', easing: 'easing', easings: 'easing', distance: 'distance', distances: 'distance', spring: 'spring', springs: 'spring' };
const isTok = (n: any) => isObj(n) && '$value' in n;
function dim(v: any): number | undefined {
  if (typeof v === 'number') return v;
  const m = isObj(v) ? [0, v.value, v.unit] : /^\s*(-?\d*\.?\d+)\s*(px|rem|em)?\s*$/.exec(String(v ?? ''));
  if (!m || typeof +m[1] !== 'number' || !isFinite(+m[1])) return undefined;
  return m[2] === 'rem' || m[2] === 'em' ? +m[1] * 16 : +m[1];
}
const round = (v: number | undefined) => (v === undefined ? v : Math.round(v * 1000) / 1000);

/** Find the motion group: the first object (breadth-first) holding a duration / easing / distance / spring / semantic group. */
function findRoot(doc: any): string[] | undefined {
  const q: [any, string[]][] = [[doc, []]];
  while (q.length) {
    const [n, p] = q.shift()!;
    if (!isObj(n) || isTok(n)) continue;
    if (keys(n).some((k) => (PRIM_GROUPS[k] || (SEMANTIC_KINDS as readonly string[]).includes(k)) && isObj(n[k]) && !isTok(n[k]))) return p;
    for (const k of keys(n)) if (!k.startsWith('$')) q.push([n[k], [...p, k]]);
  }
  return undefined;
}

/** Import a DTCG document (Motionary 2.0 exports, or any DTCG motion group); merged over `base` (default: the built-in set). Throws on broken aliases. */
export function motionTokenSetFromDTCG(doc: unknown, base: MotionTokenSet = MOTION_TOKENS_2): MotionTokenSet {
  const resolved: any = resolveTokenAliases(doc);
  const rootPath = findRoot(doc) || [];
  const at = (o: any, p: string[]) => p.reduce((n, k) => n?.[k], o);
  const raw = at(doc, rootPath) || {}, res = at(resolved, rootPath) || {};
  const prefix = rootPath.length ? rootPath.join('.') + '.' : '';
  const p: MotionTokenInput = { duration: {}, easing: {}, spring: {}, distance: {}, semantic: {} };
  for (const k of keys(res)) {
    const g = PRIM_GROUPS[k];
    if (!g || !isObj(res[k])) continue;
    for (const [n, t] of Object.entries<any>(res[k])) {
      if (n.startsWith('$') || !isObj(t)) continue;
      const ext = t.$extensions?.[X] || {};
      if (g === 'spring') {
        const s = ext.spring || (isTok(t) && isObj(t.$value) ? t.$value : undefined);
        if (s) p.spring![n] = { stiffness: +s.stiffness || 170, damping: +s.damping || 26, mass: +s.mass || 1 };
      } else if (isTok(t)) {
        const v = g === 'duration' ? round(parseDuration(t.$value)) : g === 'distance' ? round(dim(t.$value)) : ext.css || parseEasing(t.$value);
        if (v !== undefined) (p as any)[g][n] = v;
      }
    }
  }
  const mapRef = (v: any, g: Prim, resolvedVal: any, conv: (x: any) => any) => {
    const r = tokenRefPath(v);
    if (r && r.startsWith(prefix)) {
      const rest = r.slice(prefix.length), [rg, rn] = rest.split('.');
      if (PRIM_GROUPS[rg] === g && own((p as any)[g], rn)) return `{${g}.${rn}}`;
    }
    return conv(resolvedVal);
  };
  for (const kind of SEMANTIC_KINDS) {
    const rg = raw[kind], sg = res[kind];
    if (!isObj(rg)) continue;
    for (const n of keys(rg)) {
      const rt = rg[n], st = sg?.[n];
      if (n.startsWith('$') || !isTok(rt) || !isObj(st?.$value)) continue;
      const rv = isObj(rt.$value) ? rt.$value : {}, sv = st.$value, x = rt.$extensions?.[X] || {}, sx = st.$extensions?.[X] || {};
      const e: any = { duration: mapRef(rv.duration, 'duration', sv.duration, (v) => round(parseDuration(v))) };
      if (!x.noEasing) e.easing = x.easing ?? mapRef(rv.timingFunction, 'easing', sv.timingFunction, parseEasing);
      if (x.delay || round(parseDuration(sv.delay)) || tokenRefPath(rv.delay)) e.delay = mapRef(rv.delay, 'duration', sv.delay, (v) => round(parseDuration(v)) ?? 0);
      if (x.distance != null) e.distance = mapRef(x.distance, 'distance', sx.distance ?? x.distance, (v) => round(dim(v)) ?? 0);
      if (x.spring != null) e.spring = mapRef(x.spring, 'spring', x.spring, (v) => (isObj(v) ? { ...v } : undefined));
      (p.semantic![kind] ||= {})[n] = e;
    }
  }
  const modes = (doc as any)?.$extensions?.[X]?.modes;
  if (isObj(modes)) p.modes = JSON.parse(JSON.stringify(modes));
  const out = cloneSet(base);
  mergeOv(out, p);
  // semantic entries from the document replace the base entry (no field leaks from the default)
  for (const k of keys(p.semantic || {}) as SemanticKind[]) for (const n of keys(p.semantic![k]!)) out.semantic[k][n] = { ...(p.semantic![k]![n] as SemanticToken) };
  if (p.modes) for (const m of keys(p.modes)) mergeOv(((out.modes ||= {})[m] ||= {}), p.modes[m]);
  return out;
}

// --- CSS custom properties --------------------------------------------------------------

export interface CssOptions {
  /** Custom property prefix (default `--usa`). */
  prefix?: string;
  /** Mode to compute the variables in. */
  mode?: string | string[];
}
/** The custom-property map: primitives (`--usa-duration-fast: 150ms`, `--usa-distance-md: 16px`…) and semantic vars referencing them. */
export function motionTokenSetVars(set: MotionTokenSet, o: CssOptions = {}): Record<string, string> {
  const s = o.mode ? withMode(set, o.mode) : set, P = o.prefix || '--usa', v: Record<string, string> = {};
  for (const [k, x] of Object.entries(s.duration)) v[`${P}-duration-${kebab(k)}`] = `${x}ms`;
  for (const [k, x] of Object.entries(s.easing)) v[`${P}-easing-${kebab(k)}`] = x;
  for (const [k, x] of Object.entries(s.spring)) for (const f of ['stiffness', 'damping', 'mass'] as const) v[`${P}-spring-${kebab(k)}-${f}`] = String(x[f]);
  for (const [k, x] of Object.entries(s.distance)) v[`${P}-distance-${kebab(k)}`] = `${x}px`;
  const ref = (x: any, g: Prim, unit: string, dflt: string) => {
    const r = tokenRefPath(x);
    if (r) { const [, n] = r.split('.'); return `var(${P}-${g}-${kebab(n)})`; }
    if (x == null) return dflt;
    const l = lit(s, x, g);
    return l === undefined ? dflt : `${l}${unit}`;
  };
  for (const kind of SEMANTIC_KINDS)
    for (const [n, e] of Object.entries(s.semantic[kind] || {})) {
      const b = `${P}-motion-${kind}-${kebab(n)}`;
      v[`${b}-duration`] = ref(e.duration, 'duration', 'ms', '0ms');
      v[`${b}-delay`] = ref(e.delay, 'duration', 'ms', '0ms');
      v[`${b}-easing`] = e.easing == null ? `var(${P}-easing-standard)` : ref(e.easing, 'easing', '', 'ease');
      v[`${b}-distance`] = ref(e.distance, 'distance', 'px', '0px');
    }
  return v;
}

/**
 * A stylesheet: the set on `selector`, then each mode as the variables that change — `reduced` under
 * `@media (prefers-reduced-motion: reduce)` and every mode under `selector[data-usa-motion-mode~="<mode>"]`
 * (an explicit data attribute wins over the OS preference).
 */
export function motionTokenSetToCss(set: MotionTokenSet, o: { selector?: string; prefix?: string; modes?: boolean } = {}): string {
  const sel = o.selector || ':root';
  const base = motionTokenSetVars(set, o);
  const block = (s: string, v: Record<string, string>, ind = '') => `${ind}${s} {\n${Object.entries(v).map(([k, x]) => `${ind}  ${k}: ${x};`).join('\n')}\n${ind}}\n`;
  let css = block(sel, base);
  if (o.modes === false) return css;
  const diff = (m: string) => Object.fromEntries(Object.entries(motionTokenSetVars(set, { ...o, mode: m })).filter(([k, x]) => base[k] !== x));
  const names = [...new Set([REDUCED_MOTION_MODE, GENTLE_MOTION_MODE, ...keys(set.modes || {})])];
  for (const m of names) {
    const d = diff(m);
    if (!keys(d).length) continue;
    if (m === REDUCED_MOTION_MODE) css += `@media (prefers-reduced-motion: reduce) {\n${block(sel, d, '  ')}}\n`;
    css += block(`${sel}[data-usa-motion-mode~="${m}"]`, d);
  }
  return css;
}

// --- runtime: Motion Engine v2 / Scene Format v2 ----------------------------------------

/** Whether the user asked for reduced motion (`prefers-reduced-motion: reduce`). */
export function prefersReducedMotion(): boolean {
  return typeof matchMedia === 'function' && !!matchMedia('(prefers-reduced-motion: reduce)')?.matches;
}

/**
 * Make `set` the active motion scale: writes every custom property on `root` (default `<html>`) and makes
 * `{duration.*}` / `{easing.*}` / `{spring.*}` references in motionary/motion, motionary/motion/scene and the
 * token-aware components resolve to it. `mode: 'auto'` follows `prefers-reduced-motion` (and its changes).
 * Returns an undo function.
 */
export function applyMotionTokenSet(set: MotionTokenSet, o: { mode?: string | string[] | 'auto'; root?: HTMLElement; prefix?: string } = {}): () => void {
  const el = o.root || (typeof document !== 'undefined' ? document.documentElement : undefined);
  const auto = o.mode === 'auto';
  let undoPrim: () => void = () => {}, old: Record<string, string> = {};
  const restore = () => {
    undoPrim();
    if (el) for (const [k, v] of Object.entries(old)) v ? el.style.setProperty(k, v) : el.style.removeProperty(k);
    old = {};
  };
  const apply = () => {
    restore();
    const mode = auto ? (prefersReducedMotion() ? REDUCED_MOTION_MODE : undefined) : (o.mode as string | string[] | undefined);
    const s = withMode(set, mode);
    undoPrim = applyMotionTokens({ duration: s.duration, easing: s.easing, spring: s.spring }, el, o.prefix);
    if (el)
      for (const [k, v] of Object.entries(motionTokenSetVars(s, { prefix: o.prefix })))
        if (!/-(duration|easing|spring)-/.test(k.slice((o.prefix || '--usa').length)) || k.includes('-motion-')) (old[k] = el.style.getPropertyValue(k)), el.style.setProperty(k, v);
  };
  apply();
  const mq = auto && typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : undefined;
  mq?.addEventListener?.('change', apply);
  return () => {
    mq?.removeEventListener?.('change', apply);
    restore();
  };
}

/** Scene-local tokens (`doc.tokens`) for Scene Format v2 from a set (in `mode`). */
export function toSceneTokens(set: MotionTokenSet, mode?: string | string[]): { duration: Record<string, number>; easing: Record<string, string>; spring: Record<string, SpringToken> } {
  const s = withMode(set, mode);
  return { duration: s.duration, easing: s.easing, spring: s.spring };
}

/** A copy of a scene v2 document whose `tokens` carry the set (the document's own tokens win). */
export function withSceneTokens<T extends Record<string, any>>(doc: T, set: MotionTokenSet, mode?: string | string[]): T & { tokens: ReturnType<typeof toSceneTokens> } {
  const t = toSceneTokens(set, mode), d: any = isObj(doc.tokens) ? doc.tokens : {};
  return { ...doc, tokens: { duration: { ...t.duration, ...d.duration }, easing: { ...t.easing, ...d.easing }, spring: { ...t.spring, ...d.spring } } };
}
