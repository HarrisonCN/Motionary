import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, mount, anims, tick } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineWidgets, WIDGETS, SPARK_VARIANTS, sparkPoints } from '../src/components/widgets';
import { registerEffectPacks, EFFECT_PACKS, CHART_FX, registerChartPack } from '../src/components/fx2';
import { getEffect, playEffect } from '../src/components/fx';
import { COMPONENT_ITEMS } from '../showcase/catalog-components.js';
import { COMPONENTS, componentSnippets } from '../showcase/components-catalog.js';
import { COMPONENT_ENTRIES } from '../scripts/categories.mjs';
import { readFileSync } from 'node:fs';
import { parseFigure, CHART_FX, registerChartPack } from '../src/components/fx2';
import { SPARK_VARIANTS, sparkPoints } from '../src/components/widgets';

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

describe('7.2 release', () => {
  it('ships its widgets', () => {
    expect(Object.keys(WIDGETS['7.2'])).toEqual(["usa-bar-chart", "usa-gauge", "usa-sparkline", "usa-kpi"]);
    for (const t of Object.keys(WIDGETS['7.2'])) expect(customElements.get(t)).toBeTruthy();
  });
  it('registers its effect packs (also via registerEffectPacks) as their own entries', () => {
    registerChartPack();
    registerEffectPacks();
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    for (const def of CHART_FX) expect(getEffect(def.name)).toBe(def);
    expect(EFFECT_PACKS['chart']).toBe(CHART_FX);
    expect(COMPONENT_ENTRIES['fx-chart']).toBe('fx2/chart');
    expect(pkg.exports['./fx/chart'].import.default).toBe('./dist/components/fx-chart.js');
  });
  it('gallery cards with copyable code, Store entries and docs', () => {
    for (const tag of Object.keys(WIDGETS['7.2'])) {
      const card: any = COMPONENTS.find((c: any) => c.tag === tag);
      expect(card, tag).toBeTruthy();
      expect(card.since).toBe('7.2');
      expect(componentSnippets(card).esm).toContain(card.define);
    }
    expect(componentSnippets(COMPONENTS.find((c: any) => c.id === 'fx-bars')).esm).toContain("from 'motionary/components/fx-chart'");
    for (const id of ["bar-chart", "gauge", "sparkline", "kpi", "fx-bars", "fx-line", "fx-flow"]) expect(COMPONENT_ITEMS.some((i: any) => i.gallery === id), id).toBe(true);
    const doc = readFileSync('docs/components.md', 'utf8');
    for (const s of ["<usa-bar-chart", "<usa-gauge", "<usa-sparkline", "<usa-kpi", "motionary/fx/chart"]) expect(doc).toContain(s);
  });
});


describe('7.2 widgets behave', () => {
  it('bar chart: parses values/labels, labels items, glides to new data and removes leaving bars', () => {
    const c = mount<any>('<usa-bar-chart values="10,20,5" labels="A,B,C" unit="k"></usa-bar-chart>');
    expect(c.getAttribute('role')).toBe('figure');
    const items = c.querySelectorAll('.usa-bc-item');
    expect(items.length).toBe(3);
    expect(items[1].getAttribute('aria-label')).toBe('B: 20k');
    expect(items[1].style.getPropertyValue('--usa-bc-k')).toBe('1.0000');
    expect(items[0].style.getPropertyValue('--usa-bc-k')).toBe('0.5000');
    configureComponents({ reducedMotion: 'reduce' });
    c.data = [{ label: 'A', value: 40 }, { label: 'D', value: 10 }];
    const after = c.querySelectorAll('.usa-bc-item');
    expect(Array.from(after).map((li: any) => li.dataset.label)).toEqual(['A', 'D']);
    expect(c.data).toEqual([{ label: 'A', value: 40 }, { label: 'D', value: 10 }]);
  });
  it('bar chart: <data> children and horizontal', () => {
    const c = mount<any>('<usa-bar-chart horizontal><data value="3">x</data><data value="6">y</data></usa-bar-chart>');
    expect(c.dataset.dir).toBe('h');
    expect(c.data.map((d: any) => d.value)).toEqual([3, 6]);
    expect((c.querySelector(':scope > data') as HTMLElement).hidden).toBe(true);
  });
  it('gauge: meter semantics, clamps, zone colours, reduced motion paints immediately', () => {
    configureComponents({ reducedMotion: 'reduce' });
    const g = mount<any>('<usa-gauge value="72" unit="%" label="CPU" zones="60:#0f0,85:#fa0,100:#f00"></usa-gauge>');
    expect(g.getAttribute('role')).toBe('meter');
    expect(g.getAttribute('aria-valuenow')).toBe('72');
    expect(g.getAttribute('aria-valuetext')).toBe('72%');
    expect(g.zoneColor(50)).toBe('#0f0');
    expect(g.zoneColor(72)).toBe('#fa0');
    expect(g.zoneColor(99)).toBe('#f00');
    expect(g.querySelector('.usa-gg-num').textContent).toBe('72%');
    g.value = 500;
    expect(g.value).toBe(100);
    expect(g.style.getPropertyValue('--usa-gg-angle')).toBe('90deg');
  });
  it('sparkline: points, summary label, variants', () => {
    expect(sparkPoints([0, 10], 100, 30, 0)).toEqual([[0, 30], [100, 0]]);
    expect(SPARK_VARIANTS).toEqual(['line', 'area', 'bars']);
    const s = mount<any>('<usa-sparkline values="4,6,8" variant="bars"></usa-sparkline>');
    expect(s.getAttribute('role')).toBe('img');
    expect(s.getAttribute('aria-label')).toBe('Trend: 4 to 8, up 100%');
    expect(s.dataset.variant).toBe('bars');
    expect(s.querySelectorAll('.usa-sl-bars rect').length).toBe(3);
    configureComponents({ reducedMotion: 'reduce' });
    s.data = [9, 3];
    expect(s.getAttribute('aria-label')).toBe('Trend: 9 to 3, down 67%');
    expect(s.querySelector('.usa-sl-line').getAttribute('d')).toMatch(/^M/);
  });
  it('kpi: keeps prefix/suffix/decimals, delta sign + invert, labelled group', () => {
    configureComponents({ reducedMotion: 'reduce' });
    const k = mount<any>('<usa-kpi label="Revenue" value="$48.2k" delta="+12.5%" caption="vs last month"></usa-kpi>');
    expect(k.getAttribute('role')).toBe('group');
    expect(k.getAttribute('aria-label')).toBe('Revenue $48.2k (+12.5%) vs last month');
    expect(k.querySelector('.usa-kpi-value').textContent).toBe('$48.2k');
    expect(k.querySelector('.usa-kpi-delta').getAttribute('data-good')).toBe('true');
    k.value = '$1,204.5k';
    expect(k.querySelector('.usa-kpi-value').textContent).toBe('$1,204.5k');
    const d = mount<any>('<usa-kpi label="Churn" value="2.1%" delta="−0.4%" invert></usa-kpi>');
    expect(d.querySelector('.usa-kpi-delta').getAttribute('data-good')).toBe('true');
    expect(d.querySelector('.usa-kpi-delta i').textContent).toBe('▼');
  });
});

describe('data-viz motion pack', () => {
  it('parseFigure keeps prefix, suffix and decimals', () => {
    expect(parseFigure('$1,234.5k')).toEqual({ n: 1234.5, pre: '$', post: 'k', dec: 1 });
    expect(parseFigure('98%')).toEqual({ n: 98, pre: '', post: '%', dec: 0 });
    expect(parseFigure('n/a')).toBeNull();
  });
  it('registers 6 effects; enter effects animate SVG parts and finish under reduced motion', async () => {
    registerChartPack();
    expect(CHART_FX.map((d) => d.name).sort()).toEqual(['bars-grow', 'dots-pop', 'line-draw', 'number-roll', 'ring-sweep', 'sankey-flow']);
    for (const n of ['bars-grow', 'line-draw', 'ring-sweep', 'dots-pop', 'number-roll']) expect(getEffect(n)?.kind, n).toBe('enter');
    expect(getEffect('sankey-flow')?.kind).toBe('loop');
    const el = mount<HTMLElement>('<div><svg><rect width="1" height="1"/><rect width="1" height="1"/></svg></div>');
    const a: any[] = [];
    const c = { reduced: false, animate: (e: Element, k: Keyframe[], o: any) => { a.push(e); return (e as any).animate(k, o); }, onCleanup() {} } as any;
    getEffect('bars-grow')!.run(el, { ...getEffect('bars-grow')!.defaults }, c);
    expect(a.length).toBe(2);
    a.length = 0;
    getEffect('bars-grow')!.run(el, { ...getEffect('bars-grow')!.defaults }, { ...c, reduced: true });
    expect(a).toEqual([el]);
  });
});
