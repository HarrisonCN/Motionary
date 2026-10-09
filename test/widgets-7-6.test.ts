import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, mount, anims, tick } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineWidgets, WIDGETS, formatDistance, haversine, parseMarkers, project } from '../src/components/widgets';
import { registerEffectPacks, EFFECT_PACKS, GEO_FX, registerGeoPack } from '../src/components/fx2';
import { getEffect, playEffect } from '../src/components/fx';
import { COMPONENT_ITEMS } from '../showcase/catalog-components.js';
import { COMPONENTS, componentSnippets } from '../showcase/components-catalog.js';
import { COMPONENT_ENTRIES } from '../scripts/categories.mjs';
import { readFileSync } from 'node:fs';
import { GEO_FX as GEO, routeLength } from '../src/components/fx2';
import { project, parseMarkers, haversine, formatDistance } from '../src/components/widgets';

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

describe('7.6 release', () => {
  it('ships its widgets', () => {
    expect(Object.keys(WIDGETS['7.6'])).toEqual(["usa-globe", "usa-location-card"]);
    for (const t of Object.keys(WIDGETS['7.6'])) expect(customElements.get(t)).toBeTruthy();
  });
  it('registers its effect packs (also via registerEffectPacks) as their own entries', () => {
    registerGeoPack();
    registerEffectPacks();
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    for (const def of GEO_FX) expect(getEffect(def.name)).toBe(def);
    expect(EFFECT_PACKS['geo']).toBe(GEO_FX);
    expect(COMPONENT_ENTRIES['fx-geo']).toBe('fx2/geo');
    expect(pkg.exports['./fx/geo'].import.default).toBe('./dist/components/fx-geo.js');
  });
  it('gallery cards with copyable code, Store entries and docs', () => {
    for (const tag of Object.keys(WIDGETS['7.6'])) {
      const card: any = COMPONENTS.find((c: any) => c.tag === tag);
      expect(card, tag).toBeTruthy();
      expect(card.since).toBe('7.6');
      expect(componentSnippets(card).esm).toContain(card.define);
    }
    expect(componentSnippets(COMPONENTS.find((c: any) => c.id === 'fx-route')).esm).toContain("from 'motionary/components/fx-geo'");
    for (const id of ["globe", "location-card", "fx-route", "fx-pin"]) expect(COMPONENT_ITEMS.some((i: any) => i.gallery === id), id).toBe(true);
    const doc = readFileSync('docs/components.md', 'utf8');
    for (const s of ["<usa-globe", "<usa-location-card", "motionary/fx/geo"]) expect(doc).toContain(s);
  });
});


describe('7.6 widgets behave', () => {
  it('globe: projection, marker parsing, markers drawn/hidden, flyTo emits usa:focus', async () => {
    configureComponents({ reducedMotion: 'reduce' });
    expect(project(0, 0, 0, 0)).toEqual({ x: 0, y: -0, visible: true });
    expect(project(0, 90, 0, 0).x).toBe(1);
    expect(project(0, 180, 0, 0).visible).toBe(false);
    expect(project(90, 0, 0, 0).y).toBe(-1);
    expect(parseMarkers('A:10,20; bad; B:-95,5')).toEqual([{ name: 'A', lat: 10, lon: 20 }, { name: 'B', lat: -90, lon: 5 }]);
    const g = mount<any>('<usa-globe markers="Front:0,0; Back:0,180" speed="0"></usa-globe>');
    expect(g.getAttribute('role')).toBe('img');
    expect(g.getAttribute('aria-label')).toBe('Globe: Front, Back');
    const marks = g.querySelectorAll('.usa-gl-mark');
    expect(marks.length).toBe(2);
    expect(marks[0].hasAttribute('data-hidden')).toBe(false);
    expect(marks[1].hasAttribute('data-hidden')).toBe(true);
    expect(g.querySelector('.usa-gl-grid').getAttribute('d').length).toBeGreaterThan(100);
    const ev = vi.fn();
    g.addEventListener('usa:focus', ev);
    await g.flyTo('Back');
    expect(Math.round(g.lon)).toBe(180);
    expect(marks[1].hasAttribute('data-hidden')).toBe(false);
    expect(marks[1].hasAttribute('data-active')).toBe(true);
    expect(ev.mock.calls[0][0].detail).toEqual({ name: 'Back', lat: 0, lon: 180 });
  });
  it('location card: haversine distance, formatting, route only with an origin, arrive event', () => {
    configureComponents({ reducedMotion: 'reduce' });
    expect(Math.round(haversine(51.5, -0.1, 48.86, 2.35))).toBe(341);
    expect(formatDistance(0.42)).toBe('420 m');
    expect(formatDistance(4.234)).toBe('4.2 km');
    expect(formatDistance(12.6)).toBe('13 km');
    expect(formatDistance(1.609344, 'mi')).toBe('1.0 mi');
    const c = mount<any>('<usa-location-card name="Café &lt;1&gt;" address="Main St" lat="51.5" lon="-0.1" from-lat="51.51" from-lon="-0.1" href="https://example.com/x"></usa-location-card>');
    expect(c.querySelector('.usa-lc-name').textContent).toBe('Café <1>');
    expect(c.querySelector('.usa-lc-dist').textContent).toBe('1.1 km');
    expect(c.querySelector('.usa-lc-route')).toBeTruthy();
    expect(c.querySelector('.usa-lc-go').getAttribute('rel')).toBe('noopener');
    expect(c.hasAttribute('data-route')).toBe(true);
    const ev = vi.fn();
    c.addEventListener('usa:arrive', ev);
    c.replay();
    expect(ev).toHaveBeenCalledTimes(1);
    const d = mount<any>('<usa-location-card name="X" distance="5 min walk"></usa-location-card>');
    expect(d.querySelector('.usa-lc-route')).toBeNull();
    expect(d.km).toBeNull();
    expect(d.querySelector('.usa-lc-dist').textContent).toBe('5 min walk');
  });
  it('geo pack: names, kinds, routeLength, reduced paths', async () => {
    expect(GEO.map((e: any) => `${e.name}:${e.kind}`)).toEqual(['route-draw:enter', 'marker-pulse:attention', 'pin-drop:enter', 'globe-spin:enter']);
    expect(routeLength([{ x: 0, y: 0 }, { x: 3, y: 4 }, { x: 3, y: 10 }])).toBe(11);
    const el = document.createElement('div');
    el.innerHTML = '<svg><polyline points="0,0 30,40"></polyline></svg>';
    document.body.append(el);
    const ctx: any = { reduced: false, sensitivity: 'normal', animate: vi.fn(() => null), onCleanup: vi.fn() };
    await GEO[0].run(el, { duration: 100, stagger: 0 }, ctx);
    expect(ctx.animate).toHaveBeenCalledTimes(1);
    expect((el.querySelector('polyline') as any).style.strokeDasharray).toBe('50');
    const rctx: any = { ...ctx, reduced: true, animate: vi.fn(() => null) };
    await GEO[1].run(el, { color: 'red', rings: 2, duration: 100 }, rctx);
    expect(rctx.animate).not.toHaveBeenCalled();
    expect(el.querySelectorAll('span').length).toBe(0);
  });
});
