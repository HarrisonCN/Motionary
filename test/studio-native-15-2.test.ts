// 15.2.0 — cross-platform export 2.0 (`motionary/studio/native` = `motionary/components/studio-native`).
// Scene v2 (or timeline v1 / a Studio project's doc) → CSS / WXSS / ArkTS / Jetpack Compose / SwiftUI, each with a per-property
// loss report. Golden-file tests (test/golden/native-15-2/*); native syntax is checked with a bracket / string tokenizer
// (no Kotlin / Swift / ArkTS compiler in CI). Tests first: this file must fail before src/components/studio/native.ts exists.
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { STUDIO_NATIVE_VERSION, NATIVE_TARGETS, exportNative, nativeSupport } from '../src/components/studio/native';

const SCENE = {
  format: 'motionary-scene', version: 2, name: 'Card intro', duration: 600,
  layers: [
    { id: 'title', type: 'track', target: '#title', keyframes: [
      { id: 't0', time: 0, props: { opacity: 0, transform: 'translateY(20px) scale(0.9)' }, easing: 'cubic-bezier(0.2, 0, 0, 1)' },
      { id: 't1', time: 400, props: { opacity: 1, transform: 'translateY(0px) scale(1)' } },
    ] },
    { id: 'card', type: 'track', target: '.card', keyframes: [
      { id: 'c0', time: 100, props: { 'background-color': '#ffffff', filter: 'blur(4px)', 'clip-path': 'inset(0 0 100% 0)' }, easing: 'ease-out' },
      { id: 'c1', time: 600, props: { 'background-color': '#0f172a', filter: 'blur(0px)', 'clip-path': 'inset(0 0 0% 0)' } },
    ] },
    { id: 'hidden', type: 'track', target: '.x', muted: true, keyframes: [{ id: 'h0', time: 0, props: { opacity: 0 } }, { id: 'h1', time: 100, props: { opacity: 1 } }] },
  ],
} as const;

const EXT: Record<string, string> = { css: 'css', wxss: 'wxss', arkts: 'ets', compose: 'kt', swiftui: 'swift' };
const golden = (t: string) => `test/golden/native-15-2/card-intro.${EXT[t]}`;

/** Balanced (), [], {} outside string literals and comments; strings terminated. Enough to catch broken generators. */
function balanced(code: string, lineComment = '//') {
  const stack: string[] = []; const pair: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
  for (let i = 0; i < code.length; i++) {
    const c = code[i];
    if (code.startsWith(lineComment, i)) { i = code.indexOf('\n', i); if (i < 0) break; continue; }
    if (code.startsWith('/*', i)) { const j = code.indexOf('*/', i + 2); if (j < 0) return 'unterminated comment'; i = j + 1; continue; }
    if (c === '"' || c === "'" || c === '`') { const j = code.indexOf(c, i + 1); if (j < 0 || code.slice(i, j).includes('\n')) return `unterminated string at ${i}`; i = j; continue; }
    if ('([{'.includes(c)) stack.push(c);
    else if (')]}'.includes(c)) { if (stack.pop() !== pair[c]) return `unbalanced ${c} at ${i}`; }
  }
  return stack.length ? `unclosed ${stack.join('')}` : 'ok';
}

describe('15.2 studio/native — targets and report', () => {
  it('exports the version and the five targets', () => {
    expect(STUDIO_NATIVE_VERSION).toBe(1);
    expect(NATIVE_TARGETS).toEqual(['css', 'wxss', 'arkts', 'compose', 'swiftui']);
  });

  for (const target of ['css', 'wxss', 'arkts', 'compose', 'swiftui']) {
    it(`${target}: matches its golden file, is syntactically balanced, deterministic`, () => {
      const a = exportNative(SCENE, { target });
      const b = exportNative(JSON.parse(JSON.stringify(SCENE)), { target });
      expect(a.code).toBe(b.code);
      expect(a.file).toBe(`card-intro.${EXT[target]}`);
      expect(balanced(a.code)).toBe('ok');
      expect(existsSync(golden(target))).toBe(true);
      expect(a.code).toBe(readFileSync(golden(target), 'utf8'));
    });

    it(`${target}: every input property is either supported or lost, exactly once per layer; muted layers are left out`, () => {
      const { report } = exportNative(SCENE, { target });
      expect(report.target).toBe(target);
      const key = (x: { layer: string; prop: string }) => `${x.layer}:${x.prop}`;
      const all = [...report.supported.map(key), ...report.lost.map(key)].sort();
      expect(all).toEqual(['card:background-color', 'card:clip-path', 'card:filter', 'title:opacity', 'title:transform'].sort());
      expect(all.some((k) => k.startsWith('hidden:'))).toBe(false);
      for (const l of report.lost) expect(l.reason).toMatch(/\S/);
    });
  }

  it('the support table: opacity / translate / scale / rotate / colors / cubic-bezier on every target; clip-path only on css + wxss', () => {
    for (const t of NATIVE_TARGETS) {
      for (const p of ['opacity', 'translate', 'scale', 'rotate', 'color', 'background-color', 'cubic-bezier']) expect(nativeSupport(t, p)).toBe(true);
      expect(nativeSupport(t, 'clip-path')).toBe(t === 'css' || t === 'wxss');
    }
    expect(exportNative(SCENE, { target: 'compose' }).report.lost.map((l) => l.prop).sort()).toEqual(['clip-path', 'filter']);
    expect(exportNative(SCENE, { target: 'css' }).report.lost).toEqual([]);
  });

  it('css: keyframe percentages from times, per-segment timing function, prefers-reduced-motion block', () => {
    const { code } = exportNative(SCENE, { target: 'css' });
    expect(code).toMatch(/@keyframes usa-card-intro-title \{/);
    expect(code).toMatch(/0% \{[^}]*opacity: 0;[^}]*animation-timing-function: cubic-bezier\(0\.2, 0, 0, 1\);/);
    expect(code).toMatch(/66\.667% \{[^}]*opacity: 1;/); // 400 / 600 ms
    expect(code).toMatch(/@media \(prefers-reduced-motion: reduce\)/);
  });

  it('compose: keyframes {} with durationMillis and CubicBezierEasing; graphicsLayer for alpha / translation / scale', () => {
    const { code } = exportNative(SCENE, { target: 'compose' });
    expect(code).toContain('durationMillis = 600');
    expect(code).toContain('CubicBezierEasing(0.2f, 0f, 0f, 1f)');
    expect(code).toMatch(/graphicsLayer\s*\{/);
    expect(code).toMatch(/alpha = /);
    expect(code).toMatch(/translationY = /);
  });

  it('swiftui: keyframeAnimator with CubicKeyframe / LinearKeyframe; opacity, offset, scaleEffect; reduce-motion jumps to the end', () => {
    const { code } = exportNative(SCENE, { target: 'swiftui' });
    expect(code).toContain('import SwiftUI');
    expect(code).toMatch(/keyframeAnimator\(/);
    expect(code).toMatch(/\.opacity\(/);
    expect(code).toMatch(/\.offset\(y: /);
    expect(code).toMatch(/\.scaleEffect\(/);
    expect(code).toContain('accessibilityReduceMotion');
  });

  it('unknown target throws a clear error; opening a timeline v1 document works the same as its scene', () => {
    expect(() => exportNative(SCENE, { target: 'flutter' as any })).toThrow(/unknown export target "flutter"/);
    const tl = { format: 'motionary-timeline', version: 1, name: 'Card intro', duration: 600, layers: SCENE.layers };
    expect(exportNative(tl, { target: 'compose' }).code).toBe(exportNative(SCENE, { target: 'compose' }).code);
  });
});

describe('15.2 package entry', () => {
  it('motionary/studio/native and motionary/components/studio-native are exported with a size line', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    expect(pkg.exports['./studio/native'].import.default).toBe('./dist/components/studio-native.js');
    expect(pkg.exports['./components/studio-native'].require.default).toBe('./dist/components/studio-native.cjs');
    expect(readFileSync('size-budget.json', 'utf8')).toMatch(/components\/studio-native/);
  });
});

describe('15.2 export report lists AI changes (15.1 provenance, deferred from 15.1)', () => {
  it('report.ai = the provenance records that touch an exported layer; empty without provenance', () => {
    const meta = { 'motionary:provenance': [
      { id: 'p1', generator: 'motionary/studio/ai', model: 'm1', requestId: 'req-1', at: '2026-10-14T10:00:00.000Z', layers: ['title'] },
      { id: 'p2', generator: 'motionary/studio/ai', at: '2026-10-14T10:01:00.000Z', layers: ['hidden'] },
      { id: 'p3', generator: 'user', at: '2026-10-14T10:02:00.000Z', layers: ['card'] },
    ] };
    const { report, code } = exportNative({ ...SCENE, meta }, { target: 'swiftui' });
    expect(report.ai).toEqual([
      { id: 'p1', generator: 'motionary/studio/ai', model: 'm1', requestId: 'req-1', at: '2026-10-14T10:00:00.000Z', layers: ['title'] },
      { id: 'p3', generator: 'user', at: '2026-10-14T10:02:00.000Z', layers: ['card'] },
    ]);
    expect(code).toBe(exportNative(SCENE, { target: 'swiftui' }).code); // the report, not the code, carries provenance
    expect(exportNative(SCENE, { target: 'css' }).report.ai).toEqual([]);
  });
});
