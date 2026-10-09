import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineWidgets } from '../src/components/widgets';
import { COMPONENT_ITEMS } from '../showcase/catalog-components.js';
import { COMPONENTS, componentSnippets } from '../showcase/components-catalog.js';
import { PREREQS, prereqFor } from '../showcase/catalog/prereqs.js';
import { readFileSync } from 'node:fs';
import * as rt from '../src/runtime';
import { registry } from '../src/runtime/registry';
import * as V from '../src/runtime/vector';
import { provideRiveRuntime, RIVE_PEER } from '../src/components/widgets/rive';
import { resolveTokenAliases, validateDesignTokens, importDesignTokens, exportDesignTokens } from '../src/components/tokens';
import { MOTION_TOKENS } from '../src/components/tokens/index';

beforeEach(() => {
  installComponentMocks();
  document.body.innerHTML = '';
  registry().modules.clear();
  defineWidgets();
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  configureComponents({ reducedMotion: 'user' });
});

const fx = (f: string) => readFileSync(`test/fixtures/formats/${f}`);
const sample = () => JSON.parse(fx('sample-vector.json').toString());
const flush = () => new Promise((r) => setTimeout(r, 0));

describe('10.6 runtime/vector (pure parts)', () => {
  it('interpolates keyframed properties (bezier, hold) and transforms', () => {
    const a = sample();
    const box = a.layers.find((l: any) => l.nm === 'box');
    expect(V.propValue(box.ks.p, 0)).toEqual([20, 20]);
    expect(V.propValue(box.ks.p, 15)[0]).toBeCloseTo(50, 0);
    expect(V.propValue(box.ks.p, 45)).toEqual([80, 20]);
    expect(V.propValue({ a: 1, k: [{ t: 0, s: [1], h: 1 }, { t: 10, s: [5] }] }, 9)).toEqual([1]);
    const { m, o } = V.transformAt(box.ks, 30);
    expect(o).toBe(1);
    expect([m[4], m[5]]).toEqual([80, 20]);
  });
  it('inspectLottie lists the features the renderer skips; the sample uses none', () => {
    expect(V.inspectLottie(sample())).toEqual({ layers: expect.any(Number), unsupported: [] });
    const a = sample();
    // 10.8: text layers and the expression subset are supported — only text animators and other expressions are listed
    a.layers.push({ ty: 5, ind: 99, ip: 0, op: 60, ks: { p: { a: 0, k: [0, 0], x: "effect('Slider')(1)" } }, ef: [{}], t: { d: { k: [] }, a: [{}] } } as any);
    const r = V.inspectLottie(a);
    expect(r.unsupported).toEqual(expect.arrayContaining(['text animators (range selectors)', 'effects', 'expressions outside the supported subset']));
  });
  it('trims contours (0–50 % keeps half the length)', () => {
    // contour = moveTo x,y then cubic segments (c1x c1y c2x c2y x y); a 10 × 10 square as straight cubics, 40 long
    const seg = (x0: number, y0: number, x: number, y: number) => [x0, y0, x, y, x, y];
    const sq = [{ pts: [0, 0, ...seg(0, 0, 10, 0), ...seg(10, 0, 10, 10), ...seg(10, 10, 0, 10), ...seg(0, 10, 0, 0)], closed: false }] as any;
    const len = (cs: any[]) => cs.reduce((t, c) => { let l = 0, x = c.pts[0], y = c.pts[1]; for (let k = 2; k < c.pts.length; k += 6) { l += Math.hypot(c.pts[k + 4] - x, c.pts[k + 5] - y); x = c.pts[k + 4]; y = c.pts[k + 5]; } return t + l; }, 0);
    expect(len(V.trimContours(sq, 0, 100, 0, 1))).toBeCloseTo(40, 3);
    expect(len(V.trimContours(sq, 0, 50, 0, 1))).toBeCloseTo(20, 0);
    expect(V.trimContours(sq, 30, 30, 0, 1)).toEqual([]);
  });
  it('unpacks the dotLottie sample (stored + deflate entries, manifest, two animations, image)', async () => {
    const zip = fx('sample-vector.lottie');
    const names = V.unzipEntries(new Uint8Array(zip)).map((e) => e.name).sort();
    expect(names).toEqual(['animations/bounce.json', 'animations/sample.json', 'images/dot.png', 'manifest.json']);
    const d = await V.parseDotLottie(new Uint8Array(zip));
    expect(Object.keys(d.animations).sort()).toEqual(['bounce', 'sample']);
    expect(d.animations.sample.layers.length).toBe(sample().layers.length);
    expect(Object.keys(d.images)).toContain('dot.png');
  });
  it('the module needs the core and registers with use(vector)', () => {
    expect(V.vector.id).toBe('vector');
    expect(V.vector.requires).toEqual(['core']);
    rt.use(V.vector);
    expect(rt.hasModule('vector')).toBe(true);
  });
});

describe('10.6 widgets', () => {
  it('<usa-lottie-player> without motionary/runtime/vector shows the clear notice', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    document.body.innerHTML = '<usa-lottie-player src="x.json"></usa-lottie-player>';
    await flush();
    const p = document.querySelector('usa-lottie-player .usa-rt-missing')!;
    expect(p.textContent).toMatch(/motionary\/runtime\/vector/);
    expect(p.textContent).toMatch(/npm i motionary/);
    expect(err).toHaveBeenCalled();
  });
  it('<usa-rive> without the official runtime: clear message (install + provideRiveRuntime + CDN) and usa:runtime-missing', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    const el = document.createElement('usa-rive');
    el.setAttribute('src', 'icon.riv');
    const seen: any[] = [];
    el.addEventListener('usa:runtime-missing', (e: any) => seen.push(e.detail));
    document.body.appendChild(el);
    await new Promise((r) => setTimeout(r, 30));
    const msg = el.querySelector('.usa-rt-missing')!.textContent!;
    expect(msg).toContain('npm i @rive-app/canvas');
    expect(msg).toContain("provideRiveRuntime(() => import('@rive-app/canvas'))");
    expect(msg).toMatch(/unpkg\.com\/@rive-app\/canvas@2\.\d+\.\d+\/rive\.js/);
    expect(seen[0].module).toBe(RIVE_PEER);
    expect(err).toHaveBeenCalled();
  });
  it('<usa-rive> with provideRiveRuntime(loader): lazy (loader runs on mount), passes src / state machine / autoplay; reduced motion → no autoplay', async () => {
    const made: any[] = [];
    class Rive { constructor(o: any) { made.push(o); setTimeout(() => o.onLoad?.(), 0); } play() {} pause() {} cleanup() {} resizeDrawingSurfaceToCanvas() {} stateMachineInputs() { return [{ name: 'hover', value: false }]; } }
    const loader = vi.fn(async () => ({ default: { Rive, Layout: class { constructor(public o: any) {} }, Fit: { Contain: 'contain', Cover: 'cover' } } }));
    provideRiveRuntime(loader);
    expect(loader).not.toHaveBeenCalled();
    document.body.innerHTML = '<usa-rive src="icon.riv" state-machine="SM" autoplay fit="cover"></usa-rive>';
    const el = document.querySelector('usa-rive') as any;
    const loaded = new Promise((r) => el.addEventListener('usa:load', r));
    await loaded;
    expect(loader).toHaveBeenCalledTimes(1);
    expect(made[0].src).toMatch(/icon\.riv$/);
    expect(made[0].stateMachines).toBe('SM');
    expect(made[0].autoplay).toBe(true);
    expect(made[0].layout.o.fit).toBe('cover');
    expect(el.input('hover').name).toBe('hover');
    configureComponents({ reducedMotion: 'reduce' });
    document.body.innerHTML = '<usa-rive src="icon.riv" autoplay></usa-rive>';
    await new Promise((r) => setTimeout(r, 10));
    expect(made[1].autoplay).toBe(false);
    provideRiveRuntime(null as any);
  });
  it('<usa-token-editor> edits, exports DTCG 2025.10 / draft and imports with aliases', () => {
    document.body.innerHTML = '<usa-token-editor label="Tokens"></usa-token-editor>';
    const el = document.querySelector('usa-token-editor') as any;
    expect(el.querySelectorAll('.usa-te-row').length).toBeGreaterThan(3);
    const json = el.exportJSON();
    const first = Object.keys(MOTION_TOKENS.duration)[0];
    expect(json.motion.duration[first].$value).toEqual({ value: MOTION_TOKENS.duration[first], unit: 'ms' });
    const problems = el.importJSON({ motion: { duration: { $type: 'duration', [first]: { $value: { value: 999, unit: 'ms' } }, alias: { $value: `{motion.duration.${first}}` } } } });
    expect(problems).toEqual([]);
    expect(el.tokens.duration[first]).toBe(999);
  });
});

describe('10.6 W3C design tokens (DTCG)', () => {
  it('resolves aliases (incl. inside composites) and detects cycles / unknown references', () => {
    const r: any = resolveTokenAliases({ a: { $type: 'duration', x: { $value: { value: 100, unit: 'ms' } }, y: { $value: '{a.x}' } }, t: { $type: 'transition', z: { $value: { duration: '{a.y}', delay: { value: 0, unit: 'ms' }, timingFunction: [0, 0, 1, 1] } } } });
    expect(r.a.y.$value).toEqual({ value: 100, unit: 'ms' });
    expect(r.t.z.$value.duration).toEqual({ value: 100, unit: 'ms' });
    expect(() => resolveTokenAliases({ a: { $value: '{b}' }, b: { $value: '{a}' } })).toThrow(/cycle|circular/i);
    expect(() => resolveTokenAliases({ a: { $value: '{nope}' } })).toThrow();
  });
  it('validates types and values; round-trips export → import (both formats, springs in $extensions)', () => {
    expect(validateDesignTokens({ m: { $type: 'cubicBezier', e: { $value: [2, 0, 1, 1] } } })[0]).toMatch(/x in 0–1/);
    expect(validateDesignTokens({ m: { $type: 'colour', e: { $value: 1 } } })[0]).toMatch(/unknown \$type/);
    for (const format of ['2025.10', 'draft'] as const) {
      const doc = exportDesignTokens(MOTION_TOKENS, { format, transitions: [['enter', Object.keys(MOTION_TOKENS.duration)[0], Object.keys(MOTION_TOKENS.easing)[0]]] });
      expect(validateDesignTokens(doc)).toEqual([]);
      const back = importDesignTokens(doc);
      // transition composites import as a named duration + easing (the 9.x importMotionTokens rule)
      const [d0, e0] = [Object.keys(MOTION_TOKENS.duration)[0], Object.keys(MOTION_TOKENS.easing)[0]];
      expect(back.duration).toEqual({ ...MOTION_TOKENS.duration, enter: MOTION_TOKENS.duration[d0] });
      // DTCG cubicBezier has no keywords: 'linear' comes back as its exact cubic-bezier(0, 0, 1, 1) equivalent
      const kw = (e: Record<string, string>) => Object.fromEntries(Object.entries(e).map(([k, v]) => [k, v === 'linear' ? 'cubic-bezier(0, 0, 1, 1)' : v]));
      expect(back.easing).toEqual(kw({ ...MOTION_TOKENS.easing, enter: MOTION_TOKENS.easing[e0] }));
      expect(back.spring).toEqual(MOTION_TOKENS.spring);
    }
  });
});

describe('10.6 prerequisites: runtime/vector + the official Rive runtime (optional peer) in all five places', () => {
  it('cards, Store badges, snippets, docs, package.json', () => {
    const lp: any = COMPONENTS.find((c: any) => c.tag === 'usa-lottie-player');
    expect(lp.requires).toEqual(['vector']);
    expect(componentSnippets(lp).esm).toMatch(/use\(vector\);/);
    const rv: any = COMPONENTS.find((c: any) => c.tag === 'usa-rive');
    expect(rv.requires).toEqual(['rive']);
    expect(PREREQS.rive.kind).toBe('peer');
    const p = prereqFor(rv)!;
    expect(p.badge).toBe('Requires: @rive-app/canvas');
    expect(p.install).toBe('npm i @rive-app/canvas');
    expect(p.importAndRegister).toContain("provideRiveRuntime(() => import('@rive-app/canvas'));");
    expect(p.cdn).toContain('https://unpkg.com/@rive-app/canvas@2.44.1/rive.js');
    expect(COMPONENT_ITEMS.find((i: any) => i.gallery === 'rive').requiresBadge).toBe('Requires: @rive-app/canvas');
    const doc = readFileSync('docs/runtime/rive.md', 'utf8');
    expect(doc).toMatch(/Official third-party runtime/);
    expect(doc).toMatch(/## Compatibility/);
    expect(readFileSync('docs/runtime/vector.md', 'utf8')).toMatch(/## Compatibility[\s\S]*✅ yes[\s\S]*✕ no/);
    expect(readFileSync('README.md', 'utf8')).toContain('`<usa-rive>` — Requires: @rive-app/canvas');
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    expect(pkg.peerDependenciesMeta['@rive-app/canvas']).toEqual({ optional: true });
    expect(pkg.dependencies || {}).toEqual({});
    expect(readFileSync('test/fixtures/formats/CREDITS.md', 'utf8')).toMatch(/rive-message-icon\.riv[\s\S]*MIT License/);
  });
});
