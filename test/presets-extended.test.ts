import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { installMocks, animations, fireAll } from './setup';
import { PRESETS as CORE_TABLE, registerPresets, reversePreset, resolvePreset } from '../src/presets';
import { EXTENDED_PRESETS, EXTENDED_PRESET_CATEGORIES } from '../src/extended-presets-data';
// @ts-ignore - untyped .js
import { ITEMS, CATEGORIES, findItem } from '../showcase/catalog.js';
// @ts-ignore - untyped .js
import { EXTENDED_ITEMS, PRESET_CATEGORIES } from '../showcase/catalog-extended.js';
// @ts-ignore - untyped .js
import { generate, defaultState, presetDistance, usesExtended } from '../showcase/codegen.js';

const root = resolve(__dirname, '..');
const read = (f: string) => readFileSync(resolve(root, f), 'utf8');
const CORE_NAMES = Object.keys(CORE_TABLE).filter((n) => !(n in EXTENDED_PRESETS));
const EXT_NAMES = Object.keys(EXTENDED_PRESETS);
const ALL: Record<string, any> = { ...Object.fromEntries(CORE_NAMES.map((n) => [n, (CORE_TABLE as any)[n]])), ...EXTENDED_PRESETS };

/** GPU-friendly properties only (plus a constant transform-origin and per-keyframe easing). */
const ALLOWED = new Set(['opacity', 'transform', 'filter', 'clipPath', 'transformOrigin']);
const fnNames = (v: unknown) => String(v).match(/[a-zA-Z0-9-]+(?=\()/g) || [];

describe('6.1 extended presets — keyframes', () => {
  it('ships 181 extended presets (≥ 120) on top of the 33 core ones, with unique names', () => {
    expect(CORE_NAMES).toHaveLength(33);
    expect(EXT_NAMES.length).toBeGreaterThanOrEqual(120);
    expect(EXT_NAMES).toHaveLength(181);
    expect(EXT_NAMES.filter((n) => CORE_NAMES.includes(n))).toEqual([]);
    EXT_NAMES.forEach((n) => expect(n).toMatch(/^[a-z][a-z0-9-]*$/));
  });

  it.each(Object.keys(ALL))('%s has valid, interpolable keyframes', (name) => {
    const p = ALL[name];
    const fromKeys = Object.keys(p.from).filter((k) => k !== 'easing').sort();
    expect(fromKeys, 'from/to animate the same properties').toEqual(Object.keys(p.to).sort());
    fromKeys.forEach((k) => {
      expect(ALLOWED.has(k), `${k} is GPU-friendly`).toBe(true);
      expect(String(p.from[k]).length && String(p.to[k]).length).toBeTruthy();
    });
    if ('transformOrigin' in p.from) expect(p.from.transformOrigin).toBe(p.to.transformOrigin);
    if ('easing' in p.from) expect(p.from.easing).toMatch(/^steps\(\d+, end\)$/);
    // Same function list from → frames → to: a straight interpolation, never a matrix fallback
    for (const prop of ['transform', 'filter']) {
      if (!(prop in p.to)) continue;
      const want = fnNames(p.to[prop]);
      expect(fnNames(p.from[prop]), `${prop} from`).toEqual(want);
      (p.frames || []).forEach((f: any) => prop in f && expect(fnNames(f[prop]), `${prop} @${f.offset}`).toEqual(want));
    }
    if ('clipPath' in p.to) {
      const shape = (v: string) => [String(v).split('(')[0], String(v).split(',').length];
      expect(shape(p.from.clipPath)).toEqual(shape(p.to.clipPath));
      (p.frames || []).forEach((f: any) => f.clipPath && expect(shape(f.clipPath)).toEqual(shape(p.to.clipPath)));
    }
    let last = 0;
    (p.frames || []).forEach((f: any) => {
      expect(f.offset).toBeGreaterThan(last);
      expect(f.offset).toBeLessThan(1);
      last = f.offset;
      Object.keys(f).filter((k) => k !== 'offset').forEach((k) => expect(k in p.to, `${name} frame key ${k}`).toBe(true));
    });
  });

  it('keeps the ExtendedPreset type union and the category map in sync with the data', () => {
    const types = read('src/types.ts');
    const union = /export type ExtendedPreset =([\s\S]*?);/.exec(types)![1].match(/'([^']+)'/g)!.map((s) => s.slice(1, -1));
    expect(union).toEqual(EXT_NAMES);
    const listed = Object.values(EXTENDED_PRESET_CATEGORIES).flat();
    expect(listed.slice().sort()).toEqual(EXT_NAMES.slice().sort());
  });
});

describe('6.1 extended presets — runtime', () => {
  it('importing presets/extended registers every name in the shared table (also seen by a fresh core copy)', async () => {
    vi.resetModules();
    const ext = await import('../src/extended-presets');
    vi.resetModules();
    const core = await import('../src/presets');
    EXT_NAMES.forEach((n) => expect((core.PRESETS as any)[n]).toBe((ext.EXTENDED_PRESETS as any)[n]));
    expect(Object.keys(core.PRESETS).length).toBeGreaterThanOrEqual(214);
    expect((globalThis as any)[Symbol.for('use-scroll-animate.presets')]).toBe(core.PRESETS);
  });

  it('the UMD build source registers into the same table without the core', async () => {
    vi.resetModules();
    const g = globalThis as any;
    const key = Symbol.for('use-scroll-animate.presets');
    const before = g[key];
    delete g[key];
    await import('../src/extended-presets-umd');
    expect(Object.keys(g[key])).toEqual(EXT_NAMES);
    vi.resetModules();
    const core = await import('../src/presets');
    expect(core.PRESETS['fade-in']).toBeTruthy();
    expect((core.PRESETS as any)['clip-diamond']).toBeTruthy();
    if (before) Object.assign(g[key], before);
  });

  it('registerPresets() adds custom presets usable by name; reversePreset() mirrors frames', () => {
    registerPresets({ 'my-pop': { from: { opacity: 0 }, to: { opacity: 1 }, frames: [{ offset: 0.3, opacity: 0.8 }] } });
    expect(resolvePreset('my-pop' as any).frames).toEqual([{ offset: 0.3, opacity: 0.8 }]);
    const r = reversePreset(EXTENDED_PRESETS['drop-in']);
    expect(r.from).toBe(EXTENDED_PRESETS['drop-in'].to);
    expect(r.frames!.map((f) => +f.offset.toFixed(2))).toEqual([0.08, 0.18, 0.3, 0.45, 0.6]);
  });

  it('plays from → frames → to through the core (observe), and skips motion under reduced motion', async () => {
    vi.resetModules();
    installMocks();
    await import('../src/extended-presets');
    const { createScrollAnimate } = await import('../src/index');
    const node = document.createElement('div');
    document.body.append(node);
    createScrollAnimate().observe(node, { animation: 'bounce-in-up' as any });
    fireAll([node], true);
    const kf = animations[animations.length - 1].keyframes;
    expect(kf).toHaveLength(2 + EXTENDED_PRESETS['bounce-in-up'].frames!.length);
    expect(kf[0]).toEqual({ opacity: 0, transform: 'translateY(120px)' });
    expect(kf[kf.length - 1]).toEqual({ opacity: 1, transform: 'translateY(0px)' });

    vi.resetModules();
    installMocks({ reducedMotion: true });
    await import('../src/extended-presets');
    const lib = await import('../src/index');
    const count = animations.length;
    const quiet = document.createElement('div');
    document.body.append(quiet);
    lib.createScrollAnimate().observe(quiet, { animation: 'glitch-in' as any });
    fireAll([quiet], true);
    expect(animations.length).toBe(count);
    expect(quiet.style.opacity).toBe('');
  });

  it('<usa-reveal effect> accepts any registered preset name', async () => {
    await import('../src/extended-presets');
    const { revealKeyframes } = await import('../src/components/reveal/effects');
    expect(revealKeyframes('jello-in')).toHaveLength(2 + EXTENDED_PRESETS['jello-in'].frames!.length);
    expect(revealKeyframes('clip-diamond')[0]).toEqual(EXTENDED_PRESETS['clip-diamond'].from);
    expect(revealKeyframes('fade-up', 20)[0]).toEqual({ opacity: 0, transform: 'translate3d(0,20px,0)' }); // own effects win
  });
});

describe('6.1 Animation Store', () => {
  it('lists every preset (≥ 160 items) with a known, filterable category', () => {
    expect(ITEMS.length).toBeGreaterThanOrEqual(160);
    expect(ITEMS.length).toBe(33 + 181 + 13);
    const presetIds = ITEMS.filter((i: any) => i.kind === 'preset').map((i: any) => i.id).sort();
    expect(presetIds).toEqual(Object.keys(ALL).sort());
    expect(EXTENDED_ITEMS.map((i: any) => i.id)).toEqual(EXT_NAMES);
    const cats = CATEGORIES.map((c: any) => c.id);
    expect(cats).toEqual([...PRESET_CATEGORIES.map((c: any) => c.id), 'feature', 'framework']);
    for (const id of ['elastic', 'light', 'depth', 'special', 'stagger', 'scrub']) {
      expect(ITEMS.filter((i: any) => i.category === id).length, id).toBeGreaterThanOrEqual(8);
    }
    // grouped by category in chip order
    const order = ITEMS.filter((i: any) => i.kind === 'preset').map((i: any) => cats.indexOf(i.category));
    expect(order).toEqual(order.slice().sort((a: number, b: number) => a - b));
  });

  it('scroll-linked and stagger-ready items get the right demo recipe and defaults', () => {
    EXTENDED_ITEMS.filter((i: any) => i.category === 'scrub').forEach((i: any) => {
      expect(i.recipe).toBe('scrub');
      expect(i.id.startsWith('scrub-')).toBe(true);
    });
    EXTENDED_ITEMS.filter((i: any) => i.category === 'stagger').forEach((i: any) => expect(i.recipe).toBe('stagger'));
    const st = defaultState(findItem('scrub-spin'));
    expect([st.engine, st.viewStart, st.viewEnd]).toEqual(['css', 'cover 0%', 'cover 100%']);
    const code = generate(findItem('scrub-spin'), st, ALL);
    expect(code.vanilla).toContain("viewRange: ['cover 0%', 'cover 100%']");
    expect(code.cdn).toContain('data-sa-view-range="cover 0%, cover 100%"');
  });

  it('copy code imports the extended entry (or CDN script) only when an extended preset is used', () => {
    const item = findItem('clip-diamond');
    const code = generate(item, defaultState(item), ALL);
    for (const tab of ['vanilla', 'react', 'vue', 'svelte', 'solid', 'element']) expect(code[tab], tab).toContain("import 'motionary/presets/extended';");
    expect(code.cdn).toContain('dist/presets-extended.umd.js');
    expect(code.cdn).toContain('data-sa-animation="clip-diamond"');
    const core = generate(findItem('fade-in'), defaultState(findItem('fade-in')), ALL);
    Object.values(core).forEach((c) => expect(c).not.toContain('presets/extended'));
    expect(usesExtended({ preset: 'fade-in', exit: 'jello-in' })).toBe(true);
    expect(presetDistance(ALL, 'bounce-in-up')).toBeNull(); // keyframed presets keep their own distances
    expect(presetDistance(ALL, 'fade-in-up-lg')).toBe(120);
  });

  it('the store, demo page and docs load / list the extended set', () => {
    expect(read('showcase/app.js')).toContain("import(base + 'presets/extended.js')");
    expect(read('demo/index.html')).toContain('../dist/presets-extended.umd.js');
    const doc = read('docs/presets.md');
    Object.keys(ALL).forEach((n) => expect(doc, n).toContain('`' + n + '`'));
    const pkg = JSON.parse(read('package.json'));
    expect(pkg.exports['./presets/extended'].import.default).toBe('./dist/presets/extended.js');
    expect(pkg.sideEffects).toContain('./dist/presets/extended.js');
    for (const f of ['README.md', 'README_zh.md', 'README_ja.md']) expect(read(f), f).toMatch(/214/);
  });
});
