/**
 * 15.3: accessible & responsive motion — `motionary/studio/a11y` (= `motionary/components/studio-a11y`).
 *
 * Motion sensitivity tiers (`full` / `gentle` / `reduced`) and breakpoint variants for Scene v2 documents, as pure
 * data transforms: `resolveVariant(doc, { width, sensitivity })` returns a plain Scene v2 document, so the Studio
 * preview, the 14.7 standalone export and the 15.2 native exporters all play exactly the same motion for a context.
 *
 * Variants live in `meta["motionary:variants"]`:
 * `[{ id, media: { minWidth?, maxWidth? }, layers: { [layerId]: { muted?, distanceScale?, timeScale? } } }]`
 * (`minWidth` inclusive, `maxWidth` exclusive, first match wins). Pure, no DOM except `motionSensitivity()`.
 */
export const STUDIO_A11Y_VERSION = 1;
export const MOTION_SENSITIVITIES = ['full', 'gentle', 'reduced'] as const;
export type MotionSensitivity = (typeof MOTION_SENSITIVITIES)[number];
export const VARIANTS_META_KEY = 'motionary:variants';
export const VARIANT_META_KEY = 'motionary:variant';
export interface VariantLayer { muted?: boolean; distanceScale?: number; timeScale?: number }
export interface MotionVariant { id: string; media: { minWidth?: number; maxWidth?: number }; layers?: Record<string, VariantLayer> }
export interface VariantContext { width?: number; sensitivity?: MotionSensitivity }

const STANDARD = 'cubic-bezier(0.2, 0, 0, 1)';
const CAP: Record<MotionSensitivity, number> = { full: Infinity, gentle: 600, reduced: 150 };
const TRAVEL: Record<MotionSensitivity, number> = { full: 1, gentle: 0.5, reduced: 0 };
const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x));
const r3 = (n: number) => { const r = Math.round(n * 1000) / 1000; return Object.is(r, -0) ? 0 : r; };
const isObj = (x: unknown): x is Record<string, any> => !!x && typeof x === 'object' && !Array.isArray(x);

function overshoots(e: unknown): boolean {
  const m = typeof e === 'string' && /^cubic-bezier\(([^)]*)\)$/.exec(e.trim());
  if (!m) return false;
  const n = m[1].split(',').map(Number);
  return n.length === 4 && (n[1] < 0 || n[1] > 1 || n[3] < 0 || n[3] > 1);
}

/** Scale the travel in a CSS transform: lengths and angles × k, scale halfway (k) to 1 (`translateOnly`: just the translations). Unknown functions are kept. */
export function scaleTransform(t: string, k: number, translateOnly = false): string {
  if (k === 1) return t;
  return String(t).replace(/([a-zA-Z0-9]+)\(([^)]*)\)/g, (all, fn: string, args: string) => {
    const parts = args.split(',').map((s) => s.trim());
    const num = (a: string, f: (n: number) => number) => { const m = /^(-?[\d.]+)([a-z%]*)$/i.exec(a); return m ? `${r3(f(parseFloat(m[1])))}${m[2]}` : a; };
    if (translateOnly && !/^translate/.test(fn)) return all;
    if (/^translate(X|Y|Z|3d)?$/.test(fn) || /^rotate(X|Y|Z)?$/.test(fn) || /^skew(X|Y)?$/.test(fn)) return `${fn}(${parts.map((a) => num(a, (n) => n * k)).join(', ')})`;
    if (/^scale(X|Y|Z|3d)?$/.test(fn)) return `${fn}(${parts.map((a) => num(a, (n) => 1 + (n - 1) * k)).join(', ')})`;
    return all;
  });
}

function scaleTimes(layers: any[], f: number) {
  if (f === 1) return;
  for (const l of layers) for (const kf of l.keyframes || []) kf.time = r3(kf.time * f);
}
const docEnd = (d: any) => (typeof d.duration === 'number' ? d.duration : Math.max(0, ...d.layers.flatMap((l: any) => (l.keyframes || []).map((k: any) => k.time))));

/** The document as seen at a sensitivity level. `full` returns an equal copy. */
export function applySensitivity<T>(doc: T, level: MotionSensitivity = 'full'): T {
  if (!(MOTION_SENSITIVITIES as readonly string[]).includes(level)) throw new Error(`[motionary] unknown motion sensitivity "${level}" — use full, gentle or reduced`);
  const d: any = clone(doc);
  if (level === 'full') return d;
  const k = TRAVEL[level];
  for (const l of d.layers || []) for (const kf of l.keyframes || []) {
    if (kf.props && typeof kf.props.transform === 'string') kf.props.transform = scaleTransform(kf.props.transform, k);
    if (overshoots(kf.easing)) kf.easing = STANDARD;
  }
  const end = docEnd(d);
  if (end > CAP[level]) { const f = CAP[level] / end; scaleTimes(d.layers || [], f); d.duration = CAP[level]; }
  return d;
}

/** The variants a document declares (copies; invalid entries skipped — see validateVariants). */
export function variantsOf(doc: unknown): MotionVariant[] {
  const v = isObj(doc) && isObj((doc as any).meta) ? (doc as any).meta[VARIANTS_META_KEY] : undefined;
  return Array.isArray(v) ? v.filter((x) => isObj(x) && typeof x.id === 'string' && isObj(x.media)).map(clone) : [];
}

/** `[]` or the problems with `meta["motionary:variants"]`. */
export function validateVariants(doc: unknown): string[] {
  const out: string[] = [], v = isObj(doc) && isObj((doc as any).meta) ? (doc as any).meta[VARIANTS_META_KEY] : undefined;
  if (v === undefined) return out;
  if (!Array.isArray(v)) return ['meta["motionary:variants"]: expected an array'];
  const ids = new Set(((doc as any).layers || []).map((l: any) => l.id)), seen = new Set<string>();
  v.forEach((x: any, i: number) => {
    const at = `variants[${i}]`;
    if (!isObj(x)) { out.push(`${at}: expected an object`); return; }
    if (typeof x.id !== 'string' || !x.id) out.push(`${at}.id: required`); else if (seen.has(x.id)) out.push(`${at}.id: duplicate "${x.id}"`); else seen.add(x.id);
    const m = x.media;
    if (!isObj(m)) out.push(`${at}.media: expected { minWidth?, maxWidth? }`);
    else {
      for (const k of ['minWidth', 'maxWidth']) if (m[k] !== undefined && !(typeof m[k] === 'number' && m[k] >= 0)) out.push(`${at}.media.${k}: expected a number ≥ 0`);
      if (typeof m.minWidth === 'number' && typeof m.maxWidth === 'number' && m.minWidth >= m.maxWidth) out.push(`${at}.media: minWidth ${m.minWidth} must be below maxWidth ${m.maxWidth}`);
    }
    if (x.layers !== undefined) {
      if (!isObj(x.layers)) out.push(`${at}.layers: expected an object`);
      else for (const [id, o] of Object.entries<any>(x.layers)) {
        if (!ids.has(id)) out.push(`${at}.layers: unknown layer "${id}"`);
        if (!isObj(o)) { out.push(`${at}.layers.${id}: expected an object`); continue; }
        if (o.muted !== undefined && typeof o.muted !== 'boolean') out.push(`${at}.layers.${id}.muted: expected a boolean`);
        for (const k of ['distanceScale', 'timeScale']) if (o[k] !== undefined && !(typeof o[k] === 'number' && o[k] >= 0 && o[k] <= 4)) out.push(`${at}.layers.${id}.${k}: expected a number 0–4`);
      }
    }
  });
  return out;
}

const matches = (m: MotionVariant['media'], w: number) => (m.minWidth === undefined || w >= m.minWidth) && (m.maxWidth === undefined || w < m.maxWidth);

/** The plain Scene v2 document for a context: the first matching variant, then the sensitivity. */
export function resolveVariant<T>(doc: T, ctx: VariantContext = {}): T {
  let d: any = clone(doc);
  const v = ctx.width === undefined ? undefined : variantsOf(doc).find((x) => matches(x.media, ctx.width!));
  if (v) {
    for (const [id, o] of Object.entries(v.layers || {})) {
      const l = (d.layers || []).find((x: any) => x.id === id);
      if (!l) continue;
      if (o.muted) l.muted = true;
      if (typeof o.distanceScale === 'number') for (const kf of l.keyframes || []) if (kf.props && typeof kf.props.transform === 'string') kf.props.transform = scaleTransform(kf.props.transform, o.distanceScale, true);
      if (typeof o.timeScale === 'number') for (const kf of l.keyframes || []) kf.time = r3(kf.time * o.timeScale);
    }
    d.meta = { ...(d.meta || {}), [VARIANT_META_KEY]: v.id };
  }
  if (ctx.sensitivity && ctx.sensitivity !== 'full') d = applySensitivity(d, ctx.sensitivity);
  return d;
}

/** The viewer's level: `reduced` when the OS asks for it, else `<html data-usa-motion-mode~="gentle">`, else `full`. */
export function motionSensitivity(root: { getAttribute?(n: string): string | null } | undefined = globalThis.document?.documentElement): MotionSensitivity {
  if (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)')?.matches) return 'reduced';
  const m = (root?.getAttribute?.('data-usa-motion-mode') || '').split(/\s+/);
  return m.includes('reduced') ? 'reduced' : m.includes('gentle') ? 'gentle' : 'full';
}
