// motionary cross-platform export (12.1) — pure functions, no Node or DOM APIs, so the CLI (`npx motionary export`)
// and the cross-platform previewer (showcase/xplat.html) share one implementation.
//
//   toCss(presets, tokens, opts)    plain CSS: custom properties + @keyframes + .usa-<preset> classes
//   toWxss(presets, tokens, opts)   WeChat / Alipay / Douyin mini programs (WXSS / ACSS / TTSS): same CSS subset, rpx-safe
//   toArkTs(presets, tokens, opts)  HarmonyOS ArkTS module: duration / curve constants + from/to frames for animateTo()
//
// presets: { name: { from: {opacity, transform, filter, clipPath}, to: {...} } }  (motionary PRESETS shape)
// tokens:  docs/motion.tokens.json (W3C design-token format) — durations and cubic-bezier easings
// Reduced motion is part of every target: CSS/WXSS emit `@media (prefers-reduced-motion: reduce)` plus a `.usa-reduce-motion`
// class for an in-app setting; ArkTS takes a `reduceMotion` flag (usaAnimate(…, reduceMotion) jumps to the end state).

export const XPLAT_VERSION = '12.1';
export const TARGETS = ['css', 'wxss', 'arkts'];

/** Flatten motion.tokens.json → { durations: {name: ms}, easings: {name: 'cubic-bezier(…)'|'linear'} }. */
export function readTokens(tokens) {
  const m = (tokens && tokens.motion) || {};
  const durations = {}, easings = {};
  for (const [k, v] of Object.entries(m.duration || {})) durations[k] = parseFloat(String(v.$value)) || 0;
  for (const [k, v] of Object.entries(m.easing || {})) easings[k] = Array.isArray(v.$value) ? `cubic-bezier(${v.$value.join(', ')})` : String(v.$value);
  return { durations, easings };
}

const TF = /([a-zA-Z0-9]+)\(([^)]*)\)/g;
/** 'translateY(40px) scale(0.8)' → [{fn:'translateY', args:['40px']}, …] */
export function parseTransform(t) {
  const out = [];
  if (!t) return out;
  for (const m of String(t).matchAll(TF)) out.push({ fn: m[1], args: m[2].split(',').map((s) => s.trim()).filter(Boolean) });
  return out;
}

const num = (s) => parseFloat(s);
const unit = (s) => String(s).replace(/^-?[0-9.]+/, '');
const kebab = (k) => k.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());
const safeName = (n) => String(n).replace(/[^a-zA-Z0-9-]/g, '-');

/** One frame → ArkTS attribute values. Unsupported parts are reported, never silently dropped. */
export function arkFrame(f) {
  const o = {}, unsupported = [];
  if (f.opacity != null) o.opacity = Number(f.opacity);
  for (const { fn, args } of parseTransform(f.transform)) {
    const a = args[0];
    const len = (s) => (unit(s) === '%' ? `'${s}'` : num(s));
    if (fn === 'translateX') o.tx = len(a);
    else if (fn === 'translateY') o.ty = len(a);
    else if (fn === 'translate') { o.tx = len(a); if (args[1]) o.ty = len(args[1]); }
    else if (fn === 'scale') { o.sx = num(a); o.sy = args[1] != null ? num(args[1]) : num(a); }
    else if (fn === 'scaleX') o.sx = num(a);
    else if (fn === 'scaleY') o.sy = num(a);
    else if (fn === 'rotate' || fn === 'rotateZ') o.rz = num(a);
    else if (fn === 'rotateX') o.rx = num(a);
    else if (fn === 'rotateY') o.ry = num(a);
    else unsupported.push(fn); // skew*, perspective, matrix*: no direct ArkUI attribute
  }
  for (const { fn, args } of parseTransform(f.filter)) {
    if (fn === 'blur') o.blur = num(args[0]);
    else if (fn === 'brightness') o.brightness = num(args[0]);
    else unsupported.push(fn);
  }
  if (f.clipPath) unsupported.push('clip-path');
  return { frame: o, unsupported };
}

/** ArkUI curve expression for a CSS easing string. */
export function arkCurve(e) {
  const s = String(e || 'ease').trim();
  const named = { linear: 'Curve.Linear', ease: 'Curve.Ease', 'ease-in': 'Curve.EaseIn', 'ease-out': 'Curve.EaseOut', 'ease-in-out': 'Curve.EaseInOut' };
  if (named[s]) return named[s];
  const m = s.match(/^cubic-bezier\(([^)]*)\)$/);
  if (m) return `curves.cubicBezierCurve(${m[1].split(',').map((x) => num(x)).join(', ')})`;
  return 'Curve.Ease';
}

function pick(presets, names) {
  const all = Object.keys(presets || {});
  const list = names && names.length ? names : all;
  const missing = list.filter((n) => !presets[n]);
  if (missing.length) throw new Error(`[motionary] unknown preset(s): ${missing.join(', ')}`);
  return list;
}

function cssFrame(f, { rpx = false } = {}) {
  return Object.entries(f)
    .map(([k, v]) => `${kebab(k)}: ${rpx ? String(v).replace(/(-?[0-9.]+)px/g, (_, n) => `${+n * 2}rpx`) : v};`)
    .join(' ');
}

function cssLike(presets, tokens, opts, rpx, header, root) {
  const { durations, easings } = readTokens(tokens);
  const names = pick(presets, opts.presets);
  const dur = opts.duration || 'normal', ease = opts.easing || 'standard';
  const L = [header, root + ' {'];
  for (const [k, v] of Object.entries(durations)) L.push(`  --usa-duration-${k}: ${v}ms;`);
  for (const [k, v] of Object.entries(easings)) L.push(`  --usa-easing-${k}: ${v};`);
  L.push('}', '');
  for (const n of names) {
    const p = presets[n], c = safeName(n);
    L.push(`@keyframes usa-${c} { from { ${cssFrame(p.from, { rpx })} } to { ${cssFrame(p.to, { rpx })} } }`);
    L.push(`.usa-${c} { animation: usa-${c} var(--usa-duration-${dur}, ${durations[dur] ?? 300}ms) var(--usa-easing-${ease}, ${easings[ease] || 'ease'}) both; }`);
  }
  L.push('', '/* reduced motion: OS setting where the renderer exposes it, or add .usa-reduce-motion from your own setting */');
  const sel = names.map((n) => `.usa-${safeName(n)}`).join(', ');
  L.push(`@media (prefers-reduced-motion: reduce) { ${sel} { animation-duration: 1ms; animation-delay: 0s; } }`);
  L.push(names.map((n) => `.usa-reduce-motion .usa-${safeName(n)}, .usa-reduce-motion.usa-${safeName(n)}`).join(',\n') + ' { animation-duration: 1ms; animation-delay: 0s; }');
  return L.join('\n') + '\n';
}

export function toCss(presets, tokens, opts = {}) {
  return cssLike(presets, tokens, opts, false, `/* motionary ${XPLAT_VERSION} — CSS export (npx motionary export --target css) */`, ':root');
}

/** Mini programs: WXSS has no :root, so variables sit on `page`; px stay px unless { rpx: true } (1px → 2rpx at 750 design width). */
export function toWxss(presets, tokens, opts = {}) {
  return cssLike(presets, tokens, opts, !!opts.rpx, `/* motionary ${XPLAT_VERSION} — mini program export (WXSS / ACSS / TTSS). Generated: npx motionary export --target wxss */`, 'page');
}

export function toArkTs(presets, tokens, opts = {}) {
  const { durations, easings } = readTokens(tokens);
  const names = pick(presets, opts.presets);
  const L = [
    `// motionary ${XPLAT_VERSION} — HarmonyOS ArkTS export. Generated: npx motionary export --target arkts`,
    `// Usage: this.frame = USA_PRESETS['fade-in-up'].from; usaAnimate(USA_PRESETS['fade-in-up'], (f) => this.frame = f, { reduceMotion })`,
    `import { curves } from '@kit.ArkUI';`,
    '',
    'export interface UsaFrame { opacity?: number; tx?: number | string; ty?: number | string; sx?: number; sy?: number; rx?: number; ry?: number; rz?: number; blur?: number; brightness?: number }',
    'export interface UsaPreset { from: UsaFrame; to: UsaFrame }',
    'export interface UsaAnimateOptions { duration?: string; curve?: string; reduceMotion?: boolean }',
    '',
    `export const USA_DURATION: Record<string, number> = { ${Object.entries(durations).map(([k, v]) => `'${k}': ${v}`).join(', ')} };`,
    `export const USA_CURVE: Record<string, ICurve> = { ${Object.entries(easings).map(([k, v]) => `'${k}': ${arkCurve(v).replace(/^Curve\.(\w+)$/, 'curves.initCurve(Curve.$1)')}`).join(', ')} };`,
    '',
    'export const USA_PRESETS: Record<string, UsaPreset> = {',
  ];
  const notes = [];
  for (const n of names) {
    const a = arkFrame(presets[n].from), b = arkFrame(presets[n].to);
    const un = [...new Set([...a.unsupported, ...b.unsupported])];
    if (un.length) notes.push(`${n}: ${un.join(', ')} not mapped (no direct ArkUI attribute)`);
    const fr = (o) => '{ ' + Object.entries(o).map(([k, v]) => `${k}: ${v}`).join(', ') + ' }';
    L.push(`  '${n}': { from: ${fr(a.frame)}, to: ${fr(b.frame)} },`);
  }
  L.push('};', '');
  if (notes.length) L.push('// Not mapped:', ...notes.map((s) => '//   ' + s), '');
  L.push(
    '/** Animate a preset with animateTo(); reduceMotion = true jumps straight to the end state (honour your own setting). */',
    'export function usaAnimate(p: UsaPreset, apply: (f: UsaFrame) => void, opts: UsaAnimateOptions = {}): void {',
    '  apply(p.from);',
    "  if (opts.reduceMotion) { apply(p.to); return; }",
    `  animateTo({ duration: USA_DURATION[opts.duration ?? '${opts.duration || 'normal'}'], curve: USA_CURVE[opts.curve ?? '${opts.easing || 'standard'}'] }, () => apply(p.to));`,
    '}',
    '',
  );
  return L.join('\n');
}

/** Dispatch by target name. */
export function exportMotion(target, presets, tokens, opts = {}) {
  if (target === 'css') return toCss(presets, tokens, opts);
  if (target === 'wxss' || target === 'miniapp') return toWxss(presets, tokens, opts);
  if (target === 'arkts' || target === 'harmony') return toArkTs(presets, tokens, opts);
  throw new Error(`[motionary] unknown export target "${target}" — use one of: ${TARGETS.join(', ')}`);
}
