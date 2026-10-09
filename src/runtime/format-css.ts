/**
 * `motionary/runtime/format-css` (10.1) — import CSS `@keyframes` and Web
 * Animations API keyframes into the runtime timeline.
 *
 * - `parseKeyframes(cssText)` — every `@keyframes` block of a stylesheet
 *   (incl. `-webkit-`), percentages / `from` / `to` / lists (`0%, 100%`),
 *   per-frame `animation-timing-function`, `!important` ignored as in CSS.
 * - `fromCssRule(rule)` — a live `CSSKeyframesRule`.
 * - `fromWaapi(keyframes)` — array form (`[{ opacity: 0 }, { opacity: 1, offset: .8 }]`)
 *   and property-indexed form (`{ opacity: [0, 1], easing: 'ease-out' }`), with
 *   offsets distributed like the WAAPI.
 * - `playKeyframes(target, frames, { duration, … })` — a runtime `Timeline`.
 *
 * Unsupported (documented in docs/runtime/format-css.md): `composite: add / accumulate`,
 * `@property` typed interpolation, 3D / matrix transforms (switch discretely).
 */
import { RUNTIME_VERSION, type RuntimeModule } from './registry';
import { camelProp, distributeOffsets, framesToTimeline, type Frame, type KeyframesPlayOptions } from './keyframes';
import type { Target } from './tween';

export type { Frame, KeyframesPlayOptions } from './keyframes';

export interface KeyframesDef {
  name: string;
  frames: Frame[];
}

/** Strip comments. */
const clean = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');

function block(css: string, open: number): [string, number] {
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}' && --depth === 0) return [css.slice(open + 1, i), i + 1];
  }
  throw new Error('[motionary] format-css: unbalanced braces in @keyframes');
}

function decls(body: string): { props: Record<string, string>; easing?: string } {
  const props: Record<string, string> = {};
  let easing: string | undefined;
  // split on ';' outside parentheses
  let depth = 0, cur = '';
  const parts: string[] = [];
  for (const ch of body) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ';' && !depth) { parts.push(cur); cur = ''; } else cur += ch;
  }
  parts.push(cur);
  for (const p of parts) {
    const i = p.indexOf(':');
    if (i < 0) continue;
    const k = p.slice(0, i).trim();
    const v = p.slice(i + 1).replace(/!important/i, '').trim();
    if (!k || !v) continue;
    if (k === 'animation-timing-function' || k === '-webkit-animation-timing-function') easing = v;
    else props[camelProp(k)] = v;
  }
  return { props, easing };
}

const offsetOf = (sel: string): number => {
  const s = sel.trim().toLowerCase();
  if (s === 'from') return 0;
  if (s === 'to') return 1;
  const n = parseFloat(s);
  if (!s.endsWith('%') || !Number.isFinite(n)) throw new Error(`[motionary] format-css: bad keyframe selector "${sel}"`);
  return n / 100;
};

/** Parse the body of one `@keyframes` block. */
export function parseKeyframesBody(body: string): Frame[] {
  const frames: Frame[] = [];
  let i = 0;
  while (i < body.length) {
    const open = body.indexOf('{', i);
    if (open < 0) break;
    const sel = body.slice(i, open);
    const [inner, end] = block(body, open);
    const d = decls(inner);
    for (const part of sel.split(',')) if (part.trim()) frames.push({ offset: offsetOf(part), props: { ...d.props }, ...(d.easing ? { easing: d.easing } : {}) });
    i = end;
  }
  // merge duplicate offsets (later declarations win, as in CSS)
  const by = new Map<number, Frame>();
  for (const f of frames.sort((a, b) => a.offset - b.offset)) {
    const prev = by.get(f.offset);
    by.set(f.offset, prev ? { offset: f.offset, props: { ...prev.props, ...f.props }, easing: f.easing ?? prev.easing } : f);
  }
  return Array.from(by.values());
}

/** Every `@keyframes` block in a stylesheet's text. */
export function parseKeyframes(cssText: string): KeyframesDef[] {
  const css = clean(cssText);
  const out: KeyframesDef[] = [];
  const re = /@(?:-webkit-|-moz-)?keyframes\s+(["']?)([\w-]+)\1\s*\{/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) {
    const [body, end] = block(css, m.index + m[0].length - 1);
    out.push({ name: m[2], frames: parseKeyframesBody(body) });
    re.lastIndex = end;
  }
  return out;
}

/** A live `CSSKeyframesRule` (e.g. from `document.styleSheets`). */
export function fromCssRule(rule: { name: string; cssText: string }): KeyframesDef {
  const css = rule.cssText;
  const open = css.indexOf('{');
  return { name: rule.name, frames: parseKeyframesBody(block(css, open)[0]) };
}

type WaapiFrame = Record<string, unknown> & { offset?: number | null; easing?: string };

/** WAAPI keyframes (array or property-indexed form) → frames. */
export function fromWaapi(kf: WaapiFrame[] | Record<string, unknown>): Frame[] {
  let list: WaapiFrame[];
  if (Array.isArray(kf)) list = kf;
  else {
    const n = Math.max(...Object.entries(kf).filter(([k]) => k !== 'easing' && k !== 'offset' && k !== 'composite').map(([, v]) => (Array.isArray(v) ? v.length : 1)));
    list = Array.from({ length: n }, (_, i) => {
      const f: WaapiFrame = {};
      for (const [k, v] of Object.entries(kf)) {
        if (k === 'composite') continue;
        const arr = Array.isArray(v) ? v : [v];
        if (k === 'offset') { if (arr[i] !== undefined) f.offset = arr[i] as number; continue; }
        if (k === 'easing') { const e = arr[Math.min(i, arr.length - 1)]; if (e !== undefined) f.easing = e as string; continue; }
        if (arr.length === 1 && n > 1) { if (i === n - 1) f[k] = arr[0]; continue; }
        if (arr[i] !== undefined) f[k] = arr[i];
      }
      return f;
    });
  }
  return distributeOffsets(list).map((f) => {
    const props: Record<string, string | number> = {};
    for (const [k, v] of Object.entries(f)) if (k !== 'offset' && k !== 'easing' && k !== 'composite' && (typeof v === 'string' || typeof v === 'number')) props[camelProp(k === 'cssFloat' ? 'float' : k)] = v;
    return { offset: f.offset, props, ...(f.easing ? { easing: f.easing } : {}) };
  });
}

/** Frames in WAAPI array form (for `element.animate()`). */
export function toWaapi(frames: Frame[]): Keyframe[] {
  return frames.map((f) => ({ ...f.props, offset: f.offset, ...(f.easing ? { easing: f.easing } : {}) })) as Keyframe[];
}

/** Play frames (or a `KeyframesDef`) on a target. Returns the runtime timeline (playing unless `paused: true`). */
export function playKeyframes(target: Target, frames: Frame[] | KeyframesDef, o: KeyframesPlayOptions = {}) {
  return framesToTimeline(target, Array.isArray(frames) ? frames : frames.frames, { ...o, paused: o.paused ?? false });
}

export interface FormatCssApi {
  parseKeyframes: typeof parseKeyframes;
  fromCssRule: typeof fromCssRule;
  fromWaapi: typeof fromWaapi;
  toWaapi: typeof toWaapi;
  playKeyframes: typeof playKeyframes;
}

/** The module object for `use(formatCss)`. */
export const formatCss: RuntimeModule<FormatCssApi> = { id: 'format-css', version: RUNTIME_VERSION, tier: 'basic', requires: ['core'], api: { parseKeyframes, fromCssRule, fromWaapi, toWaapi, playKeyframes } };
