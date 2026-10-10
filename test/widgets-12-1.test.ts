// 12.1: cross-platform 3.0 — motionary export (CSS / WXSS / ArkTS), examples, previewer.
import { describe, it, expect, vi } from 'vitest';
import { readFileSync, mkdtempSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { PRESETS } from '../src/presets';
import { parseTransform, arkFrame, arkCurve, readTokens, toCss, toWxss, toArkTs, exportMotion, TARGETS } from '../bin/xplat.mjs';
import { main } from '../bin/motionary.mjs';

const read = (f: string) => readFileSync(f, 'utf8');
const tokens = JSON.parse(read('docs/motion.tokens.json'));
const CORE = Object.keys(PRESETS);

describe('12.1 exporter: pure mapping', () => {
  it('reads tokens and parses transforms', () => {
    const t = readTokens(tokens);
    expect(t.durations.normal).toBe(300);
    expect(t.easings.standard).toBe('cubic-bezier(0.2, 0, 0, 1)');
    expect(parseTransform('translateY(40px) scale(0.8)')).toEqual([{ fn: 'translateY', args: ['40px'] }, { fn: 'scale', args: ['0.8'] }]);
  });
  it('maps frames to ArkUI attributes and reports what it cannot map', () => {
    expect(arkFrame({ opacity: 0, transform: 'translateY(40px)' })).toEqual({ frame: { opacity: 0, ty: 40 }, unsupported: [] });
    expect(arkFrame({ transform: 'translateX(100%)' }).frame).toEqual({ tx: "'100%'" });
    expect(arkFrame({ transform: 'rotate(-180deg) scale(0.5)' }).frame).toEqual({ rz: -180, sx: 0.5, sy: 0.5 });
    expect(arkFrame({ filter: 'blur(12px)' }).frame).toEqual({ blur: 12 });
    expect(arkFrame({ transform: 'skewX(20deg) translateX(30px)' })).toEqual({ frame: { tx: 30 }, unsupported: ['skewX'] });
    expect(arkFrame({ clipPath: 'inset(100% 0% 0% 0%)' }).unsupported).toEqual(['clip-path']);
    expect(arkCurve('cubic-bezier(0.2, 0, 0, 1)')).toBe('curves.cubicBezierCurve(0.2, 0, 0, 1)');
    expect(arkCurve('ease-in-out')).toBe('Curve.EaseInOut');
  });
  it('every core preset exports to all three targets', () => {
    expect(TARGETS).toEqual(['css', 'wxss', 'arkts']);
    const css = toCss(PRESETS, tokens), wxss = toWxss(PRESETS, tokens), ark = toArkTs(PRESETS, tokens);
    for (const n of CORE) {
      expect(css).toContain(`@keyframes usa-${n} `);
      expect(wxss).toContain(`.usa-${n} { animation: usa-${n} `);
      expect(ark).toContain(`'${n}': { from: `);
    }
    expect(css).toContain(':root {');
    expect(wxss).toContain('page {');
    expect(wxss).not.toContain(':root');
    expect(ark).toContain("import { curves } from '@kit.ArkUI';");
    expect(ark).toContain('// Not mapped:');
    expect(ark).toContain('skew-in: skewX not mapped');
    expect(ark).toContain('clip-up: clip-path not mapped');
  });
  it('reduced motion in every target', () => {
    for (const s of [toCss(PRESETS, tokens, { presets: ['fade-in-up'] }), toWxss(PRESETS, tokens, { presets: ['fade-in-up'] })]) {
      expect(s).toContain('@media (prefers-reduced-motion: reduce) { .usa-fade-in-up { animation-duration: 1ms;');
      expect(s).toContain('.usa-reduce-motion .usa-fade-in-up');
    }
    expect(toArkTs(PRESETS, tokens, { presets: ['fade-in-up'] })).toContain('if (opts.reduceMotion) { apply(p.to); return; }');
  });
  it('rpx conversion, duration / easing choice, unknown names', () => {
    const w = toWxss(PRESETS, tokens, { presets: ['fade-in-up'], rpx: true, duration: 'slow', easing: 'emphasized' });
    expect(w).toContain('translateY(80rpx)');
    expect(w).toContain('var(--usa-duration-slow, 600ms) var(--usa-easing-emphasized, cubic-bezier(0.22, 1, 0.36, 1))');
    expect(() => exportMotion('flash', PRESETS, tokens)).toThrow(/unknown export target/);
    expect(() => exportMotion('css', PRESETS, tokens, { presets: ['nope'] })).toThrow(/unknown preset/);
  });
});

describe('12.1 CLI: npx motionary export', () => {
  it('writes --out and returns 0; bad target returns 2', () => {
    const out = join(mkdtempSync(join(tmpdir(), 'mx-')), 'm.ets');
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      expect(main(['export', '--target', 'arkts', '--presets', 'zoom-in', '--out', out], { presets: PRESETS })).toBe(0);
      expect(read(out)).toContain("'zoom-in': { from: { opacity: 0, sx: 0.8, sy: 0.8 }");
      expect(main(['export', '--target', 'flash'], { presets: PRESETS })).toBe(2);
      expect(main(['help'])).toBe(0);
      expect(log.mock.calls.flat().join('\n')).toContain('export --target css|wxss|arkts');
    } finally {
      log.mockRestore();
      err.mockRestore();
    }
  });
});

describe('12.1 examples, previewer, docs', () => {
  it('committed example files equal a fresh export', () => {
    expect(read('examples/miniapp/motionary.wxss')).toBe(exportMotion('wxss', PRESETS, tokens, { presets: ['fade-in-up', 'zoom-in', 'slide-up'], rpx: true }));
    expect(read('examples/harmony-arkts/entry/src/main/ets/motion/Motionary.ets')).toBe(exportMotion('arkts', PRESETS, tokens, { presets: ['fade-in-up', 'zoom-in', 'rotate-in'] }));
    expect(read('examples/miniapp/app.wxss')).toContain('@import "motionary.wxss";');
    expect(read('examples/miniapp/pages/index/index.wxml')).toContain("usa-reduce-motion");
    expect(read('examples/harmony-arkts/entry/src/main/ets/pages/Index.ets')).toContain('usaAnimate(USA_PRESETS[name]');
  });
  it('previewer shares the exporter; pages publish what it loads', () => {
    const h = read('showcase/xplat.html');
    expect(h).toContain("from '../bin/xplat.mjs'");
    expect(h).toContain("fetch('../docs/motion.tokens.json')");
    expect(h).toContain('prefers-reduced-motion');
    expect(read('.github/workflows/pages.yml')).toContain('cp bin/xplat.mjs _site/bin/');
  });
  it('docs', () => {
    const d = read('docs/cross-platform.md');
    for (const s of ['--target wxss', '--target arkts', 'Not mapped', '.usa-reduce-motion', 'xplat.html']) expect(d).toContain(s);
    expect(read('README.md')).toContain('docs/cross-platform.md');
    expect(read('docs/hybrid-apps.md')).toContain('cross-platform.md');
    expect(existsSync('examples/miniapp/README.md') && existsSync('examples/harmony-arkts/README.md')).toBe(true);
  });
});
