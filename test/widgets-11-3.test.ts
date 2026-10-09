// 11.3: performance metrics in CI (docs/perf-ci.md, scripts/perf-ci.mjs, perf/).
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { percentile, frameStats, overBudget } from '../scripts/perf-ci.mjs';

const read = (f: string) => readFileSync(f, 'utf8');
const pkg = JSON.parse(read('package.json'));

describe('11.3: perf metrics are wired into CI', () => {
  it('npm run perf runs in CI on Node 22, after the build', () => {
    expect(pkg.scripts.perf).toBe('node scripts/perf-ci.mjs');
    const ci = read('.github/workflows/ci.yml');
    expect(ci).toMatch(/run: npm run perf/);
    expect(ci.indexOf('npm run perf')).toBeGreaterThan(ci.indexOf('npm run build'));
    expect(Object.keys(pkg.dependencies || {})).toEqual([]);
    expect(Object.keys(pkg.devDependencies)).not.toContain('puppeteer');
    expect(Object.keys(pkg.devDependencies)).not.toContain('playwright');
  });
  it('the fixtures exist and load only the built files', () => {
    for (const f of ['first-screen', 'gpu', 'frames']) {
      expect(existsSync(`perf/${f}.html`), f).toBe(true);
      expect(read(`perf/${f}.html`)).toMatch(/\.\.\/dist\//);
    }
    expect(read('perf/first-screen.html')).toMatch(/components\/lazy\.js/);
    expect(read('perf/gpu.html')).toMatch(/usa-gl-scene/);
    expect(read('perf/frames.html')).toMatch(/tween\(/);
  });
  it('budgets are fixed for all four areas', () => {
    const b = JSON.parse(read('perf/budgets.json'));
    expect(b['first-screen']).toMatchObject({ transferKB: 56, scriptMs: 150, errors: 0 });
    expect(b.gpu).toMatchObject({ contexts: 1, leakedTextures: 0, leakedBuffers: 0, errors: 0 });
    expect(b.frames).toMatchObject({ scriptMsPerFrame: 8, droppedPct: 75, p95OverBaselineMs: 100, errors: 0 });
  });
  it('perf/ is not part of the npm package', () => {
    expect(pkg.files).not.toContain('perf');
  });
});

describe('11.3: metric helpers', () => {
  it('percentile (nearest rank)', () => {
    expect(percentile([], 95)).toBe(0);
    expect(percentile([5], 95)).toBe(5);
    expect(percentile([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 50)).toBe(5);
    expect(percentile([10, 1, 9, 2, 8, 3, 7, 4, 6, 5], 95)).toBe(10);
    expect(percentile(Array.from({ length: 100 }, (_, i) => i + 1), 95)).toBe(95);
  });
  it('frameStats counts frames over 1.5 × the idle interval as dropped', () => {
    const s = frameStats([16.7, 16.7, 33.3, 16.7, 50], 16.7);
    expect(s.frames).toBe(5);
    expect(s.droppedRatio).toBeCloseTo(2 / 5);
    expect(s.longest).toBe(50);
    expect(frameStats([33.3, 33.4, 33.3], 33.3).droppedRatio).toBe(0); // a 30 fps headless baseline is not "dropping"
    expect(frameStats([]).frames).toBe(0);
  });
  it('overBudget lists only metrics above their limit', () => {
    expect(overBudget({ a: 1, b: 5, c: 0 }, { a: 2, b: 4, c: 0, missing: 1 })).toEqual(['b = 5 > 4']);
  });
});

describe('11.3: docs', () => {
  it('docs/perf-ci.md, README, ROADMAP', () => {
    const d = read('docs/perf-ci.md');
    expect(read('docs/performance.md')).toMatch(/perf-ci\.md/);
    for (const k of ['first-screen', 'transferKB', 'leakedTextures', 'scriptMsPerFrame', 'CHROME_PATH']) expect(d).toContain(k);
    expect(read('README.md')).toMatch(/docs\/perf-ci\.md/);
    expect(read('docs/ROADMAP.md')).toMatch(/✅ \*\*v11\.3 — /);
  });
});
