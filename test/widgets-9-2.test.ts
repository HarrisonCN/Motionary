import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, mount, anims, tick } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineWidgets, WIDGETS, LOTTIE_ICONS } from '../src/components/widgets';
import { registerEffectPacks, EFFECT_PACKS, LOTTIE_FX, registerLottiePack } from '../src/components/fx2';
import { getEffect, playEffect } from '../src/components/fx';
import { COMPONENT_ITEMS } from '../showcase/catalog-components.js';
import { COMPONENTS, componentSnippets } from '../showcase/components-catalog.js';
import { COMPONENT_ENTRIES } from '../scripts/categories.mjs';
import { readFileSync } from 'node:fs';
import { LOTTIE_FX as LO, lottieToKeyframes, lottieToSvg, riveInputs } from '../src/components/fx2';

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

describe('9.2 release', () => {
  it('ships its widgets', () => {
    expect(Object.keys(WIDGETS['9.2'])).toEqual(["usa-lottie", "usa-lottie-icon"]);
    for (const t of Object.keys(WIDGETS['9.2'])) expect(customElements.get(t)).toBeTruthy();
  });
  it('registers its effect packs (also via registerEffectPacks) as their own entries', () => {
    registerLottiePack();
    registerEffectPacks();
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    for (const def of LOTTIE_FX) expect(getEffect(def.name)).toBe(def);
    expect(EFFECT_PACKS['lottie']).toBe(LOTTIE_FX);
    expect(COMPONENT_ENTRIES['fx-lottie']).toBe('fx2/lottie');
    expect(pkg.exports['./fx/lottie'].import.default).toBe('./dist/components/fx-lottie.js');
  });
  it('gallery cards with copyable code, Store entries and docs', () => {
    for (const tag of Object.keys(WIDGETS['9.2'])) {
      const card: any = COMPONENTS.find((c: any) => c.tag === tag);
      expect(card, tag).toBeTruthy();
      expect(card.since).toBe('9.2');
      expect(componentSnippets(card).esm).toContain(card.define);
    }
    expect(componentSnippets(COMPONENTS.find((c: any) => c.id === 'fx-icon-pop')).esm).toContain("from 'motionary/components/fx-lottie'");
    for (const id of ["lottie", "lottie-icon", "fx-icon-pop"]) expect(COMPONENT_ITEMS.some((i: any) => i.gallery === id), id).toBe(true);
    const doc = readFileSync('docs/components.md', 'utf8');
    for (const s of ["<usa-lottie", "<usa-lottie-icon", "motionary/fx/lottie"]) expect(doc).toContain(s);
  });
});


const doc = { fr: 30, ip: 0, op: 30, w: 48, h: 48, layers: [{ nm: 'dot', ks: { a: { k: [24, 24] }, p: { k: [24, 24] }, o: { a: 1, k: [{ t: 0, s: [0] }, { t: 15, s: [100] }] }, s: { a: 1, k: [{ t: 0, s: [50, 50] }, { t: 30, s: [100, 100] }] } }, shapes: [{ ty: 'gr', it: [{ ty: 'el', p: { k: [24, 24] }, s: { k: [10, 10] } }, { ty: 'fl', c: { k: [1, 0, 0, 1] } }] }] }] };

describe('9.2 Lottie / Rive', () => {
  it('lottieToKeyframes + lottieToSvg', () => {
    const m = lottieToKeyframes(doc);
    expect(m.duration).toBe(1000);
    expect(m.layers[0].name).toBe('dot');
    expect(m.layers[0].keyframes.map((k: any) => k.offset)).toEqual([0, 0.5, 1]);
    expect(m.layers[0].keyframes[0]).toEqual({ offset: 0, transform: 'translate(24px, 24px) scale(0.5, 0.5) translate(-24px, -24px)', opacity: 0 });
    expect(m.layers[0].keyframes[1].transform).toContain('scale(0.75, 0.75)');
    expect(m.layers[0].keyframes[2].opacity).toBe(1);
    const svg = lottieToSvg(JSON.stringify(doc));
    expect(svg).toContain('viewBox="0 0 48 48"');
    expect(svg).toContain('<ellipse cx="24" cy="24" rx="5" ry="5" fill="#ff0000"/>');
    expect(lottieToKeyframes({}).layers).toEqual([]);
  });
  it('riveInputs maps triggers to state-machine inputs', () => {
    const hover = { name: 'isHover', type: 59, value: false };
    const fire = vi.fn();
    const press = { name: 'press', type: 58, fire };
    const el = document.createElement('button');
    const off = riveInputs({ stateMachineInputs: () => [hover, press] }, 'SM', el, { hover: 'isHover', click: 'press' });
    el.dispatchEvent(new Event('pointerenter'));
    expect(hover.value).toBe(true);
    el.click();
    expect(fire).toHaveBeenCalledTimes(1);
    el.dispatchEvent(new Event('pointerleave'));
    expect(hover.value).toBe(false);
    off();
    el.dispatchEvent(new Event('pointerenter'));
    expect(hover.value).toBe(false);
  });
  it('<usa-lottie> json, layers, play/stop, events; <usa-lottie-icon>', () => {
    configureComponents({ reducedMotion: 'user' });
    const l = mount<any>('<usa-lottie label="Dot"></usa-lottie>');
    const ev = vi.fn();
    l.addEventListener('usa:load', ev);
    l.json = doc;
    expect(ev.mock.calls[0][0].detail).toEqual({ duration: 1000, layers: 1 });
    expect(l.getAttribute('role')).toBe('img');
    expect(l.querySelectorAll('[data-layer]').length).toBe(1);
    expect(l.parsed.duration).toBe(1000);
    l.play();
    expect(anims.length).toBeGreaterThan(0);
    l.stop();
    const i = mount<any>('<usa-lottie-icon name="check" label="Done" color="#00ff00"></usa-lottie-icon>');
    expect(i.getAttribute('role')).toBe('img');
    expect(i.querySelectorAll('usa-lottie [data-layer]').length).toBe(2);
    expect(i.querySelector('usa-lottie').innerHTML).toContain('#00ff00');
    const d = mount<any>('<usa-lottie-icon name="nope"></usa-lottie-icon>');
    expect(d.getAttribute('data-name')).toBe('heart');
    expect(d.getAttribute('aria-hidden')).toBe('true');
  });
  it('lottie pack: names, kinds, icon-pop ring cleaned, reduced', async () => {
    expect(LO.map((e: any) => `${e.name}:${e.kind}`)).toEqual(['lottie-play:attention', 'icon-pop:click']);
    const el = document.createElement('button');
    document.body.append(el);
    const ctx: any = { reduced: false, sensitivity: 'normal', animate: vi.fn(() => null), onCleanup: vi.fn() };
    await LO[1].run(el, { color: 'red', duration: 100 }, ctx);
    expect(ctx.animate).toHaveBeenCalledTimes(2);
    expect(el.querySelectorAll('span').length).toBe(0);
    await LO[0].run(el, { json: doc }, ctx);
    expect(ctx.animate).toHaveBeenCalledTimes(3);
    const rctx: any = { ...ctx, reduced: true, animate: vi.fn(() => null) };
    for (const fx of LO) await fx.run(el, { ...fx.defaults, json: doc }, rctx);
    expect(rctx.animate).not.toHaveBeenCalled();
  });
});
