/**
 * use-scroll-animate/components/tokens — motion design tokens (4.2).
 *
 * One source of truth for durations, easings and springs: as CSS custom
 * properties (`--usa-duration-fast`, `--usa-easing-emphasized`,
 * `--usa-spring-bouncy-stiffness`…), as W3C Design Tokens JSON, and importable
 * from Figma Tokens (Tokens Studio) or Style Dictionary exports.
 *
 * ```ts
 * import { applyMotionTokens, importMotionTokens, motionToken } from 'use-scroll-animate/components/tokens';
 * applyMotionTokens(importMotionTokens(await (await fetch('/tokens.json')).json()));
 * el.animate(frames, { duration: motionToken('duration', 'slow'), easing: motionToken('easing', 'emphasized') });
 * ```
 */

export interface SpringToken {
  stiffness: number;
  damping: number;
  mass: number;
}

export interface MotionTokens {
  /** Durations in ms. */
  duration: Record<string, number>;
  /** CSS easing strings. */
  easing: Record<string, string>;
  /** Spring physics parameters. */
  spring: Record<string, SpringToken>;
}

/** The default motion scale (Material / Fluent-inspired). */
export const MOTION_TOKENS: MotionTokens = {
  duration: { instant: 0, fast: 150, normal: 300, slow: 600, slower: 900, slowest: 1400 },
  easing: {
    linear: 'linear',
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    emphasized: 'cubic-bezier(0.22, 1, 0.36, 1)',
    decelerate: 'cubic-bezier(0, 0, 0, 1)',
    accelerate: 'cubic-bezier(0.3, 0, 1, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  spring: {
    gentle: { stiffness: 120, damping: 14, mass: 1 },
    snappy: { stiffness: 300, damping: 30, mass: 1 },
    bouncy: { stiffness: 260, damping: 12, mass: 1 },
    wobbly: { stiffness: 180, damping: 8, mass: 1 },
    stiff: { stiffness: 500, damping: 40, mass: 1 },
  },
};

export type MotionTokenGroup = keyof MotionTokens;
export type DeepPartialTokens = { [K in keyof MotionTokens]?: Partial<MotionTokens[K]> };

let active: MotionTokens = clone(MOTION_TOKENS);

function clone(t: MotionTokens): MotionTokens {
  return { duration: { ...t.duration }, easing: { ...t.easing }, spring: Object.fromEntries(Object.entries(t.spring).map(([k, v]) => [k, { ...v }])) };
}

/** Merge partial tokens over a base (defaults: the built-in scale). */
export function mergeMotionTokens(partial: DeepPartialTokens, base: MotionTokens = MOTION_TOKENS): MotionTokens {
  const out = clone(base);
  Object.assign(out.duration, partial.duration || {});
  Object.assign(out.easing, partial.easing || {});
  for (const [k, v] of Object.entries(partial.spring || {})) out.spring[k] = { ...(out.spring[k] || { stiffness: 170, damping: 26, mass: 1 }), ...v };
  return out;
}

const kebab = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/[\s_.]+/g, '-').toLowerCase();

/** The custom-property map: `{ '--usa-duration-fast': '150ms', … }`. */
export function motionTokensToVars(tokens: MotionTokens = active, prefix = '--usa'): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [k, v] of Object.entries(tokens.duration)) vars[`${prefix}-duration-${kebab(k)}`] = `${v}ms`;
  for (const [k, v] of Object.entries(tokens.easing)) vars[`${prefix}-easing-${kebab(k)}`] = v;
  for (const [k, v] of Object.entries(tokens.spring)) {
    vars[`${prefix}-spring-${kebab(k)}-stiffness`] = String(v.stiffness);
    vars[`${prefix}-spring-${kebab(k)}-damping`] = String(v.damping);
    vars[`${prefix}-spring-${kebab(k)}-mass`] = String(v.mass);
  }
  return vars;
}

/** A stylesheet string: `:root { --usa-duration-fast: 150ms; … }`. */
export function motionTokensToCss(tokens: MotionTokens = active, selector = ':root', prefix = '--usa'): string {
  const body = Object.entries(motionTokensToVars(tokens, prefix)).map(([k, v]) => `  ${k}: ${v};`).join('\n');
  return `${selector} {\n${body}\n}\n`;
}

/** W3C Design Tokens (DTCG) JSON: `{ motion: { duration: { fast: { $type: 'duration', $value: '150ms' } } } }`. */
export function motionTokensToJSON(tokens: MotionTokens = active): Record<string, unknown> {
  const grp = <T>(o: Record<string, T>, f: (v: T) => unknown) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, f(v)]));
  return {
    motion: {
      duration: grp(tokens.duration, (v) => ({ $type: 'duration', $value: `${v}ms` })),
      easing: grp(tokens.easing, (v) => {
        const m = /^cubic-bezier\(([^)]+)\)$/.exec(v);
        return m ? { $type: 'cubicBezier', $value: m[1].split(',').map(Number) } : { $type: 'string', $value: v };
      }),
      spring: grp(tokens.spring, (v) => ({ $type: 'spring', $value: { ...v } })),
    },
  };
}

/** Parse `150ms`, `0.15s`, `150` → ms. */
export function parseDuration(v: unknown): number | undefined {
  if (typeof v === 'number' && isFinite(v)) return v;
  if (typeof v === 'object' && v && 'value' in (v as any) && 'unit' in (v as any)) return parseDuration(`${(v as any).value}${(v as any).unit}`);
  const m = /^\s*(-?\d*\.?\d+)\s*(ms|s)?\s*$/.exec(String(v ?? ''));
  if (!m) return undefined;
  return m[2] === 's' ? Number(m[1]) * 1000 : Number(m[1]);
}

/** Parse `[x1,y1,x2,y2]`, `'cubic-bezier(…)'`, `'0.2, 0, 0, 1'` or a keyword → CSS easing. */
export function parseEasing(v: unknown): string | undefined {
  if (Array.isArray(v) && v.length === 4 && v.every((n) => typeof n === 'number')) return `cubic-bezier(${v.join(', ')})`;
  if (typeof v !== 'string' || !v.trim()) return undefined;
  const s = v.trim();
  if (/^-?\d*\.?\d+(\s*,\s*-?\d*\.?\d+){3}$/.test(s)) return `cubic-bezier(${s.split(/\s*,\s*/).join(', ')})`;
  return s;
}

const isLeaf = (o: any) => o && typeof o === 'object' && ('$value' in o || 'value' in o);
const leafValue = (o: any) => ('$value' in o ? o.$value : o.value);
const leafType = (o: any) => String(o.$type ?? o.type ?? '').toLowerCase();

/**
 * Import tokens from W3C DTCG JSON, Figma Tokens / Tokens Studio
 * (`{ value, type }`) or Style Dictionary (`{ value }`, nested) — anything
 * under a `duration` / `easing` / `spring` group (any depth, e.g.
 * `motion.duration.fast` or `global.animation.easing.out`), or typed leaves
 * (`duration`, `cubicBezier`, `transition`, `spring`). Unknown values are
 * skipped; the result is merged over the defaults.
 */
export function importMotionTokens(json: unknown, base: MotionTokens = MOTION_TOKENS): MotionTokens {
  const partial: Required<DeepPartialTokens> = { duration: {}, easing: {}, spring: {} };
  const walk = (node: any, path: string[]) => {
    if (!node || typeof node !== 'object') return;
    if (isLeaf(node)) {
      const name = path[path.length - 1];
      const type = leafType(node);
      const group = path.slice(0, -1).map((p) => p.toLowerCase());
      const val = leafValue(node);
      const inGroup = (g: string[]) => group.some((p) => g.includes(p));
      if (type === 'duration' || (!type && inGroup(['duration', 'durations'])) || (type !== 'cubicbezier' && inGroup(['duration', 'durations']))) {
        const ms = parseDuration(val);
        if (ms !== undefined) partial.duration[name] = ms;
      } else if (type === 'cubicbezier' || type === 'easing' || inGroup(['easing', 'easings', 'ease'])) {
        const e = parseEasing(val);
        if (e) partial.easing[name] = e;
      } else if (type === 'spring' || inGroup(['spring', 'springs'])) {
        if (val && typeof val === 'object') partial.spring[name] = { stiffness: Number(val.stiffness ?? 170), damping: Number(val.damping ?? 26), mass: Number(val.mass ?? 1) };
      } else if (type === 'transition' && val && typeof val === 'object') {
        const ms = parseDuration(val.duration);
        if (ms !== undefined) partial.duration[name] = ms;
        const e = parseEasing(val.timingFunction);
        if (e) partial.easing[name] = e;
      }
      return;
    }
    for (const [k, v] of Object.entries(node)) if (!k.startsWith('$')) walk(v, [...path, k]);
  };
  walk(json, []);
  return mergeMotionTokens(partial, base);
}

/** The tokens currently applied (via `applyMotionTokens`), or the defaults. */
export function getMotionTokens(): MotionTokens {
  return clone(active);
}

/**
 * Write tokens as CSS custom properties on `root` (default `<html>`) and make
 * them the active set for `motionToken()`. Returns an undo function.
 */
export function applyMotionTokens(tokens: DeepPartialTokens | MotionTokens = MOTION_TOKENS, root?: HTMLElement, prefix = '--usa'): () => void {
  const prev = active;
  active = mergeMotionTokens(tokens as DeepPartialTokens, MOTION_TOKENS);
  const el = root || (typeof document !== 'undefined' ? document.documentElement : null);
  const vars = motionTokensToVars(active, prefix);
  const old: Record<string, string> = {};
  if (el) for (const [k, v] of Object.entries(vars)) ((old[k] = el.style.getPropertyValue(k)), el.style.setProperty(k, v));
  return () => {
    active = prev;
    if (el) for (const [k, v] of Object.entries(old)) v ? el.style.setProperty(k, v) : el.style.removeProperty(k);
  };
}

/** Look up a token: `motionToken('duration', 'fast')` → `150`; `motionToken('easing', 'emphasized')` → CSS easing. */
export function motionToken(group: 'duration', name: string): number;
export function motionToken(group: 'easing', name: string): string;
export function motionToken(group: 'spring', name: string): SpringToken;
export function motionToken(group: MotionTokenGroup, name: string): number | string | SpringToken | undefined {
  const g = active[group] as Record<string, any>;
  return g[name] ?? (MOTION_TOKENS[group] as Record<string, any>)[name];
}

/** `var(--usa-duration-fast, 150ms)` — a CSS reference with the current value as fallback. */
export function motionVar(group: MotionTokenGroup, name: string, prop?: 'stiffness' | 'damping' | 'mass', prefix = '--usa'): string {
  if (group === 'spring') {
    const s = motionToken('spring', name);
    const p = prop || 'stiffness';
    return `var(${prefix}-spring-${kebab(name)}-${p}, ${s ? s[p] : ''})`;
  }
  const v = group === 'duration' ? `${motionToken('duration', name)}ms` : motionToken('easing', name);
  return `var(${prefix}-${group}-${kebab(name)}, ${v})`;
}

/** Resolve a duration that may be a token name (`'fast'`) or ms. */
export function resolveDurationToken(v: number | string | undefined, fallback: number): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') return (active.duration[v] ?? parseDuration(v)) ?? fallback;
  return fallback;
}

/** Resolve an easing that may be a token name (`'emphasized'`) or CSS. */
export function resolveEasingToken(v: string | undefined, fallback: string): string {
  if (!v) return fallback;
  return active.easing[v] ?? v;
}
