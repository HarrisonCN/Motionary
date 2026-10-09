import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, mount, anims, tick } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineWidgets, WIDGETS, FESTIVAL_THEMES } from '../src/components/widgets';
import { registerAllPlugins, EFFECT_PACKS, FESTIVAL_FX, registerFestivalPack } from '../src/components/fx2';
import { getEffect, playEffect } from '../src/components/fx';
import { COMPONENT_ITEMS } from '../showcase/catalog-components.js';
import { COMPONENTS, componentSnippets } from '../showcase/components-catalog.js';
import { COMPONENT_ENTRIES } from '../scripts/categories.mjs';
import { readFileSync } from 'node:fs';
import { FESTIVAL_FX as FEST, sparkVectors } from '../src/components/fx2';

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

describe('8.1 release', () => {
  it('ships its widgets', () => {
    expect(Object.keys(WIDGETS['8.1'])).toEqual(["usa-red-envelope", "usa-festival-banner"]);
    for (const t of Object.keys(WIDGETS['8.1'])) expect(customElements.get(t)).toBeTruthy();
  });
  it('registers its effect packs (also via registerAllPlugins) as their own entries', () => {
    registerFestivalPack();
    registerAllPlugins();
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    for (const def of FESTIVAL_FX) expect(getEffect(def.name)).toBe(def);
    expect(EFFECT_PACKS['festival']).toBe(FESTIVAL_FX);
    expect(COMPONENT_ENTRIES['fx-festival']).toBe('fx2/festival');
    expect(pkg.exports['./fx/festival'].import.default).toBe('./dist/components/fx-festival.js');
  });
  it('gallery cards with copyable code, Store entries and docs', () => {
    for (const tag of Object.keys(WIDGETS['8.1'])) {
      const card: any = COMPONENTS.find((c: any) => c.tag === tag);
      expect(card, tag).toBeTruthy();
      expect(card.since).toBe('8.1');
      expect(componentSnippets(card).esm).toContain(card.define);
    }
    expect(componentSnippets(COMPONENTS.find((c: any) => c.id === 'fx-fireworks')).esm).toContain("from 'motionary/components/fx-festival'");
    for (const id of ["red-envelope", "festival-banner", "fx-fireworks", "fx-seasonal"]) expect(COMPONENT_ITEMS.some((i: any) => i.gallery === id), id).toBe(true);
    const doc = readFileSync('docs/components.md', 'utf8');
    for (const s of ["<usa-red-envelope", "<usa-festival-banner", "motionary/fx/festival"]) expect(doc).toContain(s);
  });
});


describe('8.1 widgets behave', () => {
  it('red envelope: opens via button, amount + live text, event, close', () => {
    configureComponents({ reducedMotion: 'reduce' });
    const r = mount<any>('<usa-red-envelope amount="88.88" from="Grandma &lt;3"></usa-red-envelope>');
    const btn = r.querySelector('button');
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    expect(btn.getAttribute('aria-label')).toBe('Open red envelope from Grandma <3');
    expect(r.querySelector('.usa-re-msg').textContent).toBe('恭喜发财');
    const ev = vi.fn();
    r.addEventListener('usa:open', ev);
    btn.click();
    expect(r.opened).toBe(true);
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    expect(r.querySelector('.usa-re-amt').textContent).toBe('¥88.88');
    expect(r.querySelector('.usa-re-live').textContent).toBe('¥88.88 from Grandma <3');
    expect(ev.mock.calls[0][0].detail).toEqual({ amount: 88.88 });
    btn.click();
    expect(r.opened).toBe(false);
    const o = mount<any>('<usa-red-envelope amount="666" currency="$" opened></usa-red-envelope>');
    expect(o.opened).toBe(true);
    expect(o.querySelector('.usa-re-amt').textContent).toBe('$666');
  });
  it('festival banner: themes, region, scene, dismiss', async () => {
    configureComponents({ reducedMotion: 'reduce' });
    expect(FESTIVAL_THEMES).toEqual(['lunar', 'xmas', 'halloween', 'fireworks']);
    const b = mount<any>('<usa-festival-banner theme="xmas" dismissible label="Holiday sale">Merry</usa-festival-banner>');
    expect(b.getAttribute('role')).toBe('region');
    expect(b.getAttribute('aria-label')).toBe('Holiday sale');
    expect(b.getAttribute('data-theme')).toBe('xmas');
    expect(b.querySelector('.usa-fb-scene').getAttribute('aria-hidden')).toBe('true');
    expect(b.querySelectorAll('.usa-fb-light').length).toBe(7);
    b.theme = 'nope';
    expect(b.getAttribute('data-theme')).toBe('lunar');
    expect(b.querySelectorAll('.usa-fb-scene').length).toBe(1);
    const ev = vi.fn();
    b.addEventListener('usa:dismiss', ev);
    b.querySelector('.usa-fb-x').click();
    expect(b.hidden).toBe(true);
    expect(ev).toHaveBeenCalledTimes(1);
  });
  it('festival pack: names, kinds, spark vectors, particles cleaned up, snow stops', async () => {
    expect(FEST.map((e: any) => `${e.name}:${e.kind}`)).toEqual(['firework-burst:attention', 'lantern-rise:enter', 'xmas-snow:loop', 'spooky-float:attention']);
    const v = sparkVectors(8, 50);
    expect(v.length).toBe(8);
    expect(v.every((p: any) => Math.hypot(p.x, p.y) <= 51 && Math.hypot(p.x, p.y) >= 33)).toBe(true);
    expect(sparkVectors(8, 50, 2)).toEqual(sparkVectors(8, 50, 2));
    const el = document.createElement('div');
    document.body.append(el);
    const ctx: any = { reduced: false, sensitivity: 'normal', animate: vi.fn(() => null), onCleanup: vi.fn() };
    await FEST[0].run(el, { bursts: 2, colors: 'red,blue', duration: 100 }, ctx);
    expect(ctx.animate).toHaveBeenCalledTimes(28);
    expect(el.querySelectorAll('span').length).toBe(0);
    const cancel = vi.fn();
    const sctx: any = { ...ctx, animate: vi.fn(() => ({ cancel })) };
    const stop = FEST[2].run(el, { flakes: 5, duration: 1000 }, sctx);
    expect(el.querySelectorAll('span span').length).toBe(5);
    (stop as any)();
    expect(cancel).toHaveBeenCalledTimes(5);
    expect(el.querySelectorAll('span').length).toBe(0);
    const rctx: any = { ...ctx, reduced: true, animate: vi.fn(() => null) };
    await FEST[3].run(el, { cycles: 2, duration: 100 }, rctx);
    expect(rctx.animate).not.toHaveBeenCalled();
  });
});
