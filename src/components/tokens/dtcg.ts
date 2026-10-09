/**
 * Motion design tokens 2.0 (10.6): the W3C Design Tokens Community Group
 * format (DTCG, stable 2025.10) — import with alias resolution and
 * validation, export in the stable or the earlier draft shape.
 *
 * - `resolveTokenAliases(json)` — replaces `{group.token}` references
 *   (whole values and inside composite values), detects cycles and
 *   unknown references;
 * - `validateDesignTokens(json)` — problems (unknown `$type`, malformed
 *   durations / cubic béziers, broken aliases) without throwing;
 * - `importDesignTokens(json)` — resolve + import into `MotionTokens`
 *   (durations, easings, `transition` composites, springs from
 *   `$extensions["org.motionary"]`);
 * - `exportDesignTokens(tokens, { format })` — `2025.10` writes durations
 *   as `{ value, unit: "ms" }`, `draft` as `"150ms"`; springs travel in
 *   `$extensions["org.motionary"].spring` (springs are not a DTCG type).
 */
import { importMotionTokens, getMotionTokens, MOTION_TOKENS, type MotionTokens } from './index';

const REF = /^\{([^{}]+)\}$/;
const isTok = (o: any) => o && typeof o === 'object' && '$value' in o;

function lookup(root: any, path: string): any {
  let n = root;
  for (const k of path.split('.')) n = n?.[k];
  return n;
}

/** Inherit `$type` from parent groups (DTCG) and resolve `{a.b}` aliases. Throws on cycles / missing targets. */
export function resolveTokenAliases<T = any>(json: T): T {
  const root = JSON.parse(JSON.stringify(json));
  const resolving = new Set<string>();
  const val = (v: any, at: string): any => {
    if (typeof v === 'string') {
      const m = REF.exec(v.trim());
      if (!m) return v;
      const target = lookup(root, m[1]);
      if (!isTok(target)) throw new Error(`[motionary] tokens: ${at} references {${m[1]}}, which is not a token`);
      if (resolving.has(m[1])) throw new Error(`[motionary] tokens: alias cycle through {${m[1]}}`);
      resolving.add(m[1]);
      const out = val(target.$value, m[1]);
      resolving.delete(m[1]);
      if (!target.$type && target.__type) target.$type = target.__type;
      return out;
    }
    if (Array.isArray(v)) return v.map((x, i) => val(x, `${at}[${i}]`));
    if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, val(x, `${at}.${k}`)]));
    return v;
  };
  const walk = (node: any, path: string[], inherited?: string) => {
    if (!node || typeof node !== 'object') return;
    const type = node.$type || inherited;
    if (isTok(node)) {
      if (!node.$type && type) node.$type = type;
      if (typeof node.$value === 'string' && REF.exec(node.$value.trim()) && !node.$type) {
        const t = lookup(root, REF.exec(node.$value.trim())![1]);
        if (t?.$type) node.$type = t.$type;
      }
      return;
    }
    for (const [k, v] of Object.entries(node)) if (!k.startsWith('$')) walk(v, [...path, k], type);
  };
  walk(root, []);
  const resolveAll = (node: any, path: string[]) => {
    if (!node || typeof node !== 'object') return;
    if (isTok(node)) {
      node.$value = val(node.$value, path.join('.'));
      return;
    }
    for (const [k, v] of Object.entries(node)) if (!k.startsWith('$')) resolveAll(v, [...path, k]);
  };
  resolveAll(root, []);
  return root;
}

const TYPES = ['color', 'dimension', 'fontFamily', 'fontWeight', 'duration', 'cubicBezier', 'number', 'strokeStyle', 'border', 'transition', 'shadow', 'gradient', 'typography', 'string'];

/** Problems in a DTCG file (empty array = valid for motion purposes). */
export function validateDesignTokens(json: unknown): string[] {
  const out: string[] = [];
  let resolved: any;
  try {
    resolved = resolveTokenAliases(json);
  } catch (e) {
    return [String((e as Error).message).replace('[motionary] tokens: ', '')];
  }
  const dur = (v: any) => (typeof v === 'object' && v && typeof v.value === 'number' && (v.unit === 'ms' || v.unit === 's')) || /^\d*\.?\d+(ms|s)$/.test(String(v));
  const walk = (node: any, path: string[]) => {
    if (!node || typeof node !== 'object') return;
    if (isTok(node)) {
      const p = path.join('.'), t = node.$type, v = node.$value;
      if (!t) out.push(`${p}: no $type (on the token or a parent group)`);
      else if (!TYPES.includes(t)) out.push(`${p}: unknown $type "${t}"`);
      else if (t === 'duration' && !dur(v)) out.push(`${p}: duration must be { value, unit: "ms" | "s" } (or "150ms" in the draft format)`);
      else if (t === 'cubicBezier' && !(Array.isArray(v) && v.length === 4 && v.every((n) => typeof n === 'number') && v[0] >= 0 && v[0] <= 1 && v[2] >= 0 && v[2] <= 1)) out.push(`${p}: cubicBezier must be [x1, y1, x2, y2] with x in 0–1`);
      else if (t === 'transition' && !(v && dur(v.duration) && dur(v.delay ?? '0ms') && v.timingFunction)) out.push(`${p}: transition needs duration, delay and timingFunction`);
      return;
    }
    for (const [k, v] of Object.entries(node)) if (!k.startsWith('$')) walk(v, [...path, k]);
  };
  walk(resolved, []);
  return out;
}

/** Resolve aliases, then import (merged over `base`). Springs come from `$extensions["org.motionary"].spring`. */
export function importDesignTokens(json: unknown, base: MotionTokens = MOTION_TOKENS): MotionTokens {
  const r: any = resolveTokenAliases(json);
  const springs: Record<string, any> = {};
  const walk = (node: any, path: string[]) => {
    if (!node || typeof node !== 'object') return;
    const ext = node.$extensions?.['org.motionary'];
    if (ext?.spring) springs[path[path.length - 1]] = ext.spring;
    if (isTok(node)) return;
    for (const [k, v] of Object.entries(node)) if (!k.startsWith('$')) walk(v, [...path, k]);
  };
  walk(r, []);
  const t = importMotionTokens(r, base);
  for (const [k, s] of Object.entries(springs)) t.spring[k] = { stiffness: +s.stiffness || 170, damping: +s.damping || 26, mass: +s.mass || 1 };
  return t;
}

export interface ExportOptions {
  /** '2025.10' (stable: durations as { value, unit }) or 'draft' ("150ms"). Default '2025.10'. */
  format?: '2025.10' | 'draft';
  /** Top-level group name (default 'motion'). */
  group?: string;
  /** Add `transition` composite tokens for these [name, durationToken, easingToken] triples. */
  transitions?: [string, string, string][];
}

/** Export motion tokens as a DTCG document. */
export function exportDesignTokens(tokens: MotionTokens = getMotionTokens(), o: ExportOptions = {}): Record<string, unknown> {
  const stable = (o.format || '2025.10') === '2025.10';
  const g = o.group || 'motion';
  const d = (ms: number) => (stable ? { value: ms, unit: 'ms' } : `${ms}ms`);
  const bez = (e: string) => {
    const m = /^cubic-bezier\(([^)]+)\)$/.exec(e.trim());
    if (m) return m[1].split(',').map(Number);
    return ({ linear: [0, 0, 1, 1], ease: [0.25, 0.1, 0.25, 1], 'ease-in': [0.42, 0, 1, 1], 'ease-out': [0, 0, 0.58, 1], 'ease-in-out': [0.42, 0, 0.58, 1] } as Record<string, number[]>)[e.trim()] || null;
  };
  const doc: any = { $schema: 'https://www.designtokens.org/schemas/2025.10/format.json', [g]: { $description: 'Motion tokens exported by Motionary', duration: { $type: 'duration' }, easing: { $type: 'cubicBezier' } } };
  for (const [k, v] of Object.entries(tokens.duration)) doc[g].duration[k] = { $value: d(v) };
  for (const [k, v] of Object.entries(tokens.easing)) {
    const b = bez(v);
    if (b) doc[g].easing[k] = { $value: b };
  }
  if (Object.keys(tokens.spring).length) {
    doc[g].spring = { $description: 'Spring parameters (not a DTCG type; carried in $extensions)' };
    for (const [k, v] of Object.entries(tokens.spring)) doc[g].spring[k] = { $extensions: { 'org.motionary': { spring: { ...v } } } };
  }
  if (o.transitions?.length) {
    doc[g].transition = { $type: 'transition' };
    for (const [name, dur, ease] of o.transitions) doc[g].transition[name] = { $value: { duration: `{${g}.duration.${dur}}`, delay: d(0), timingFunction: `{${g}.easing.${ease}}` } };
  }
  return doc;
}
