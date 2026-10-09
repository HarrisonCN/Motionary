import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, mount, anims, tick } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineWidgets, WIDGETS, WORKER_SCENES } from '../src/components/widgets';
import { registerEffectPacks, EFFECT_PACKS, PERF3_FX, registerPerf3Pack } from '../src/components/fx2';
import { getEffect, playEffect } from '../src/components/fx';
import { COMPONENT_ITEMS } from '../showcase/catalog-components.js';
import { COMPONENTS, componentSnippets } from '../showcase/components-catalog.js';
import { COMPONENT_ENTRIES } from '../scripts/categories.mjs';
import { readFileSync } from 'node:fs';
import { PERF3_FX as PF, runInWorker, offscreenRender, fpsMeter } from '../src/components/fx2';

beforeEach(() => {
  installComponentMocks();
  document.body.innerHTML = '';
  defineWidgets();
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  configureComponents({ reducedMotion: 'user' });
});

const ctx = (reduced = false): any => ({ reduced, animate: (el: Element, k: Keyframe[], o: any) => (el as any).animate(k, o), onCleanup() {} });
void ctx; void anims; void tick; void playEffect; void mount;

describe('9.6 release', () => {
  it('ships its widgets', () => {
    expect(Object.keys(WIDGETS['9.6'])).toEqual(["usa-perf-monitor", "usa-worker-canvas"]);
    for (const t of Object.keys(WIDGETS['9.6'])) expect(customElements.get(t)).toBeTruthy();
  });
  it('registers its effect packs (also via registerEffectPacks) as their own entries', () => {
    registerPerf3Pack();
    registerEffectPacks();
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    for (const def of PERF3_FX) expect(getEffect(def.name)).toBe(def);
    expect(EFFECT_PACKS['perf3']).toBe(PERF3_FX);
    expect(COMPONENT_ENTRIES['fx-perf']).toBe('fx2/perf3');
    expect(pkg.exports['./fx/perf'].import.default).toBe('./dist/components/fx-perf.js');
  });
  it('gallery cards with copyable code, Store entries and docs', () => {
    for (const tag of Object.keys(WIDGETS['9.6'])) {
      const card: any = COMPONENTS.find((c: any) => c.tag === tag);
      expect(card, tag).toBeTruthy();
      expect(card.since).toBe('9.6');
      expect(componentSnippets(card).esm).toContain(card.define);
    }
    expect(componentSnippets(COMPONENTS.find((c: any) => c.id === 'fx-gpu-lift')).esm).toContain("from 'motionary/components/fx-perf'");
    for (const id of ["perf-monitor", "worker-canvas", "fx-gpu-lift"]) expect(COMPONENT_ITEMS.some((i: any) => i.gallery === id), id).toBe(true);
    const doc = readFileSync('docs/components.md', 'utf8');
    for (const s of ["<usa-perf-monitor", "<usa-worker-canvas", "motionary/fx/perf"]) expect(doc).toContain(s);
  });
});


describe('9.6 performance 3.0', () => {
  it('runInWorker falls back inline; offscreenRender main / none backends; fpsMeter', async () => {
    expect(await runInWorker((a: number, b: number) => a + b, 2, 3)).toBe(5);
    const c: any = document.createElement('canvas');
    expect(offscreenRender(c, 'function(){}').backend).toBe('none');
    const draw = vi.fn();
    c.getContext = () => ({});
    const r = offscreenRender(c, draw, { paused: true });
    expect(r.backend).toBe('main');
    expect(draw).toHaveBeenCalledTimes(1);
    r.resize(20, 10);
    expect([c.width, c.height]).toEqual([20, 10]);
    r.stop();
    const m = fpsMeter();
    expect(m.fps).toBe(0);
    m.stop();
  });
  it('<usa-perf-monitor>: status region, inline corner, collapse, stats', () => {
    const p = mount<any>('<usa-perf-monitor corner="inline"></usa-perf-monitor>');
    expect(p.getAttribute('role')).toBe('status');
    expect(p.getAttribute('data-corner')).toBe('inline');
    const head = p.querySelector('.usa-pm-head');
    expect(head.getAttribute('aria-expanded')).toBe('true');
    head.click();
    expect(head.getAttribute('aria-expanded')).toBe('false');
    expect(p.hasAttribute('collapsed')).toBe(true);
    expect(Object.keys(p.stats)).toEqual(['fps', 'animations', 'loops', 'longTasks', 'clock']);
    expect(p.querySelector('[data-k=clock]').textContent).toBe('running');
    expect(mount<any>('<usa-perf-monitor corner="nope"></usa-perf-monitor>').getAttribute('data-corner')).toBe('top-right');
  });
  it('<usa-worker-canvas>: img, canvas, backend reported', () => {
    configureComponents({ reducedMotion: 'reduce' });
    const ev = vi.fn();
    document.addEventListener('usa:backend', ev);
    const w = mount<any>('<usa-worker-canvas scene="orbits"></usa-worker-canvas>');
    document.removeEventListener('usa:backend', ev);
    expect(w.getAttribute('role')).toBe('img');
    expect(w.getAttribute('aria-label')).toBe('Animated orbits');
    expect(w.querySelector('canvas')).not.toBeNull();
    expect(['main', 'none', 'worker']).toContain(w.backend);
    expect(w.getAttribute('data-usa-backend')).toBe(w.backend);
    expect(Object.keys(WORKER_SCENES)).toEqual(['particles', 'orbits', 'starfield']);
  });
  it('perf pack: names, kinds, idle reveal, gpu lift compositor-only, reduced', async () => {
    expect(PF.map((e: any) => `${e.name}:${e.kind}`)).toEqual(['idle-reveal:enter', 'gpu-lift:hover']);
    const el = document.createElement('div');
    document.body.append(el);
    const ctx: any = { reduced: false, sensitivity: 'normal', animate: vi.fn(() => null), onCleanup: vi.fn() };
    await PF[0].run(el, { duration: 100, timeout: 10 }, ctx);
    expect(ctx.animate.mock.calls[0][1]).toEqual([{ opacity: 0 }, { opacity: 1 }]);
    await PF[1].run(el, { duration: 100, lift: 4 }, ctx);
    for (const f of ctx.animate.mock.calls[1][1]) expect(Object.keys(f)).toEqual(['transform']);
    const rctx: any = { ...ctx, reduced: true, animate: vi.fn(() => null) };
    for (const fx of PF) await fx.run(el, { ...fx.defaults }, rctx);
    expect(rctx.animate).not.toHaveBeenCalled();
  });
});
