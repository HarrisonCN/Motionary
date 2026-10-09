import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, mount, anims, tick } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineWidgets, WIDGETS } from '../src/components/widgets';
import { registerAllPlugins, EFFECT_PACKS, PAPER_FX, registerPaperPack } from '../src/components/fx2';
import { getEffect, playEffect } from '../src/components/fx';
import { COMPONENT_ITEMS } from '../showcase/catalog-components.js';
import { COMPONENTS, componentSnippets } from '../showcase/components-catalog.js';
import { COMPONENT_ENTRIES } from '../scripts/categories.mjs';
import { readFileSync } from 'node:fs';
import { PAPER_FX as PA, roughLine, paperRandom } from '../src/components/fx2';

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

describe('8.5 release', () => {
  it('ships its widgets', () => {
    expect(Object.keys(WIDGETS['8.5'])).toEqual(["usa-sticky-wall", "usa-sketch-chart"]);
    for (const t of Object.keys(WIDGETS['8.5'])) expect(customElements.get(t)).toBeTruthy();
  });
  it('registers its effect packs (also via registerAllPlugins) as their own entries', () => {
    registerPaperPack();
    registerAllPlugins();
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    for (const def of PAPER_FX) expect(getEffect(def.name)).toBe(def);
    expect(EFFECT_PACKS['paper']).toBe(PAPER_FX);
    expect(COMPONENT_ENTRIES['fx-paper']).toBe('fx2/paper');
    expect(pkg.exports['./fx/paper'].import.default).toBe('./dist/components/fx-paper.js');
  });
  it('gallery cards with copyable code, Store entries and docs', () => {
    for (const tag of Object.keys(WIDGETS['8.5'])) {
      const card: any = COMPONENTS.find((c: any) => c.tag === tag);
      expect(card, tag).toBeTruthy();
      expect(card.since).toBe('8.5');
      expect(componentSnippets(card).esm).toContain(card.define);
    }
    expect(componentSnippets(COMPONENTS.find((c: any) => c.id === 'fx-paper')).esm).toContain("from 'motionary/components/fx-paper'");
    for (const id of ["sticky-wall", "sketch-chart", "fx-paper", "fx-sketch"]) expect(COMPONENT_ITEMS.some((i: any) => i.gallery === id), id).toBe(true);
    const doc = readFileSync('docs/components.md', 'utf8');
    for (const s of ["<usa-sticky-wall", "<usa-sketch-chart", "motionary/fx/paper"]) expect(doc).toContain(s);
  });
});


describe('8.5 widgets behave', () => {
  it('sticky wall: list, notes coloured + tilted, pick by click and key', () => {
    configureComponents({ reducedMotion: 'reduce' });
    const w = mount<any>('<usa-sticky-wall label="Ideas" seed="4"><p>A</p><p data-color="green">B</p><p>C</p></usa-sticky-wall>');
    expect(w.getAttribute('role')).toBe('list');
    expect(w.getAttribute('aria-label')).toBe('Ideas');
    const ns = w.notes;
    expect(ns.length).toBe(3);
    expect(ns.map((n: any) => n.getAttribute('data-paper'))).toEqual(['yellow', 'green', 'blue']);
    expect(ns.every((n: any) => n.getAttribute('role') === 'listitem' && n.tabIndex === 0)).toBe(true);
    expect(ns[0].style.getPropertyValue('--tilt')).toMatch(/deg$/);
    const ev = vi.fn();
    w.addEventListener('usa:pick', ev);
    ns[2].click();
    expect(ev.mock.calls[0][0].detail.index).toBe(2);
    expect(ns[2].hasAttribute('data-picked')).toBe(true);
    ns[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(ev.mock.calls[1][0].detail.index).toBe(0);
    expect(ns[2].hasAttribute('data-picked')).toBe(false);
    expect(Number(ns[0].style.zIndex)).toBeGreaterThan(Number(ns[2].style.zIndex));
  });
  it('sketch chart: img label, bars vs line, setValues', () => {
    configureComponents({ reducedMotion: 'reduce' });
    const c = mount<any>('<usa-sketch-chart values="3, 7, x, 5" labels="A,B,C" label="Sales"></usa-sketch-chart>');
    expect(c.values).toEqual([3, 7, 5]);
    expect(c.getAttribute('role')).toBe('img');
    expect(c.getAttribute('aria-label')).toBe('Sales: A 3, B 7, C 5');
    expect(c.querySelectorAll('.usa-sk-mark').length).toBe(3);
    expect(c.querySelector('.usa-sk').getAttribute('aria-hidden')).toBe('true');
    expect(c.hasAttribute('data-drawn')).toBe(true);
    const l = mount<any>('<usa-sketch-chart type="line" values="1,2,3"></usa-sketch-chart>');
    expect(l.querySelectorAll('.usa-sk-dot').length).toBe(3);
    expect(l.querySelectorAll('.usa-sk-mark').length).toBe(2);
    l.setValues([4, 5]);
    expect(l.values).toEqual([4, 5]);
    expect(l.querySelectorAll('.usa-sk-dot').length).toBe(2);
  });
  it('paper pack: names, kinds, rough lines deterministic, reduced', async () => {
    expect(PA.map((e: any) => `${e.name}:${e.kind}`)).toEqual(['paper-unfold:enter', 'pencil-sketch:enter', 'watercolor:enter', 'crumple:attention']);
    expect(roughLine(0, 0, 10, 10, 3)).toBe(roughLine(0, 0, 10, 10, 3));
    expect(roughLine(0, 0, 10, 10, 3)).not.toBe(roughLine(0, 0, 10, 10, 4));
    expect(roughLine(0, 0, 10, 10, 3)).toMatch(/^M-?[\d.]+ -?[\d.]+ Q/);
    const r = paperRandom(2);
    const a = r();
    expect(a).toBeGreaterThanOrEqual(0);
    expect(a).toBeLessThan(1);
    const el = document.createElement('div');
    el.innerHTML = '<svg><path d="M0 0L5 5"/><line x1="0" y1="0" x2="1" y2="1"/></svg>';
    document.body.append(el);
    const ctx: any = { reduced: false, sensitivity: 'normal', animate: vi.fn(() => null), onCleanup: vi.fn() };
    await PA[1].run(el, { duration: 100, stagger: 40 }, ctx);
    expect(ctx.animate.mock.calls.map((c: any) => c[2].delay)).toEqual([0, 40]);
    const fctx: any = { ...ctx, animate: vi.fn(() => null) };
    await PA[0].run(el, { duration: 100, folds: 3 }, fctx);
    expect(fctx.animate.mock.calls[0][1].length).toBe(5);
    const rctx: any = { ...ctx, reduced: true, animate: vi.fn(() => null) };
    await PA[3].run(el, { duration: 100 }, rctx);
    await PA[1].run(el, { duration: 100 }, rctx);
    expect(rctx.animate).not.toHaveBeenCalled();
    await PA[2].run(el, { duration: 100 }, rctx);
    expect(rctx.animate.mock.calls[0][1]).toEqual([{ opacity: 0 }, { opacity: 1 }]);
  });
});
