import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, mount, anims, tick } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineWidgets, WIDGETS, parseTargets } from '../src/components/widgets';
import { registerEffectPacks, EFFECT_PACKS, CYBER_FX, registerCyberPack } from '../src/components/fx2';
import { getEffect, playEffect } from '../src/components/fx';
import { COMPONENT_ITEMS } from '../showcase/catalog-components.js';
import { COMPONENTS, componentSnippets } from '../showcase/components-catalog.js';
import { COMPONENT_ENTRIES } from '../scripts/categories.mjs';
import { readFileSync } from 'node:fs';
import { CYBER_FX as CY, decodeFrame } from '../src/components/fx2';
import { parseTargets } from '../src/components/widgets';

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

describe('8.4 release', () => {
  it('ships its widgets', () => {
    expect(Object.keys(WIDGETS['8.4'])).toEqual(["usa-hud-panel", "usa-radar"]);
    for (const t of Object.keys(WIDGETS['8.4'])) expect(customElements.get(t)).toBeTruthy();
  });
  it('registers its effect packs (also via registerEffectPacks) as their own entries', () => {
    registerCyberPack();
    registerEffectPacks();
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    for (const def of CYBER_FX) expect(getEffect(def.name)).toBe(def);
    expect(EFFECT_PACKS['cyber']).toBe(CYBER_FX);
    expect(COMPONENT_ENTRIES['fx-cyber']).toBe('fx2/cyber');
    expect(pkg.exports['./fx/cyber'].import.default).toBe('./dist/components/fx-cyber.js');
  });
  it('gallery cards with copyable code, Store entries and docs', () => {
    for (const tag of Object.keys(WIDGETS['8.4'])) {
      const card: any = COMPONENTS.find((c: any) => c.tag === tag);
      expect(card, tag).toBeTruthy();
      expect(card.since).toBe('8.4');
      expect(componentSnippets(card).esm).toContain(card.define);
    }
    expect(componentSnippets(COMPONENTS.find((c: any) => c.id === 'fx-hud')).esm).toContain("from 'motionary/components/fx-cyber'");
    for (const id of ["hud-panel", "radar", "fx-hud", "fx-hologram"]) expect(COMPONENT_ITEMS.some((i: any) => i.gallery === id), id).toBe(true);
    const doc = readFileSync('docs/components.md', 'utf8');
    for (const s of ["<usa-hud-panel", "<usa-radar", "motionary/fx/cyber"]) expect(doc).toContain(s);
  });
});


describe('8.4 widgets behave', () => {
  it('hud panel: region label, header, data rows, boot event', () => {
    configureComponents({ reducedMotion: 'reduce' });
    const p = mount<any>('<usa-hud-panel title="CORE" status="WARN"><p data-value="140">Heat</p><p data-value="40">Fuel</p></usa-hud-panel>');
    expect(p.getAttribute('role')).toBe('region');
    expect(p.getAttribute('aria-label')).toBe('CORE');
    expect(p.querySelector('.usa-hud-title').textContent).toBe('CORE');
    expect(p.querySelector('.usa-hud-status').textContent).toBe('WARN');
    expect([...p.querySelectorAll('.usa-hud-num')].map((n: any) => n.textContent)).toEqual(['100%', '40%']);
    expect(p.querySelector('.usa-hud-frame').getAttribute('aria-hidden')).toBe('true');
    const ev = vi.fn();
    p.addEventListener('usa:boot', ev);
    p.boot();
    expect(ev).toHaveBeenCalled();
    expect(p.hasAttribute('data-booted')).toBe(true);
  });
  it('radar: parseTargets, img label, dots, setTargets', () => {
    configureComponents({ reducedMotion: 'reduce' });
    expect(parseTargets('A:400,1.5; bad; B:-90,0.2')).toEqual([{ name: 'A', bearing: 40, distance: 1 }, { name: 'B', bearing: 270, distance: 0.2 }]);
    const r = mount<any>('<usa-radar targets="Alpha:0,0.5; Bravo:90,1" rings="3"></usa-radar>');
    expect(r.getAttribute('role')).toBe('img');
    expect(r.getAttribute('aria-label')).toContain('Alpha at 0°');
    expect(r.querySelectorAll('.usa-rd-ring').length).toBe(3);
    expect(r.querySelectorAll('.usa-rd-dot[data-lit]').length).toBe(2);
    r.setTargets([{ name: 'Z', bearing: 720, distance: 2 }]);
    expect(r.targets).toEqual([{ name: 'Z', bearing: 0, distance: 1 }]);
  });
  it('cyber pack: names, kinds, decodeFrame, overlays cleaned, hologram stops, reduced', async () => {
    expect(CY.map((e: any) => `${e.name}:${e.kind}`)).toEqual(['hud-frame:enter', 'scanline-sweep:attention', 'hologram:loop', 'data-decode:enter']);
    expect(decodeFrame('AB CD', 0, 4, () => 0)).toBe('00 00');
    expect(decodeFrame('AB CD', 4, 4)).toBe('AB CD');
    expect(decodeFrame('ABCD', 2, 4, () => 0).slice(0, 2)).toBe('AB');
    const el = document.createElement('div');
    el.textContent = 'x';
    document.body.append(el);
    const ctx: any = { reduced: false, sensitivity: 'normal', animate: vi.fn(() => null), onCleanup: vi.fn() };
    await CY[1].run(el, { color: 'red', passes: 2, duration: 100 }, ctx);
    expect(ctx.animate).toHaveBeenCalledTimes(1);
    expect(el.querySelectorAll('span').length).toBe(0);
    const cancel = vi.fn();
    const hctx: any = { ...ctx, animate: vi.fn(() => ({ cancel })) };
    const stop = CY[2].run(el, { color: '#0ff', duration: 1000 }, hctx);
    expect(el.style.filter).toContain('drop-shadow');
    (stop as any)();
    expect(cancel).toHaveBeenCalledTimes(2);
    expect(el.style.filter).toBe('');
    expect(el.querySelectorAll('span').length).toBe(0);
    const rctx: any = { ...ctx, reduced: true, animate: vi.fn(() => null) };
    await CY[0].run(el, { color: 'red', duration: 100 }, rctx);
    await CY[3].run(el, { speed: 10 }, rctx);
    expect(rctx.animate).not.toHaveBeenCalled();
    expect(el.textContent).toBe('x');
  });
});
