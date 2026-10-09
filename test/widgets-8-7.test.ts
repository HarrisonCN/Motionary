import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, mount, anims, tick } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineWidgets, WIDGETS } from '../src/components/widgets';
import { registerEffectPacks, EFFECT_PACKS, GESTURE3_FX, registerGesture3Pack } from '../src/components/fx2';
import { getEffect, playEffect } from '../src/components/fx';
import { COMPONENT_ITEMS } from '../showcase/catalog-components.js';
import { COMPONENTS, componentSnippets } from '../showcase/components-catalog.js';
import { COMPONENT_ENTRIES } from '../scripts/categories.mjs';
import { readFileSync } from 'node:fs';
import { GESTURE3_FX as G3, pinchScale, pinchAngle, orientationToTilt } from '../src/components/fx2';

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

describe('8.7 release', () => {
  it('ships its widgets', () => {
    expect(Object.keys(WIDGETS['8.7'])).toEqual(["usa-gyro-card", "usa-gesture-sticker"]);
    for (const t of Object.keys(WIDGETS['8.7'])) expect(customElements.get(t)).toBeTruthy();
  });
  it('registers its effect packs (also via registerEffectPacks) as their own entries', () => {
    registerGesture3Pack();
    registerEffectPacks();
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    for (const def of GESTURE3_FX) expect(getEffect(def.name)).toBe(def);
    expect(EFFECT_PACKS['gesture3']).toBe(GESTURE3_FX);
    expect(COMPONENT_ENTRIES['fx-gesture']).toBe('fx2/gesture3');
    expect(pkg.exports['./fx/gesture'].import.default).toBe('./dist/components/fx-gesture.js');
  });
  it('gallery cards with copyable code, Store entries and docs', () => {
    for (const tag of Object.keys(WIDGETS['8.7'])) {
      const card: any = COMPONENTS.find((c: any) => c.tag === tag);
      expect(card, tag).toBeTruthy();
      expect(card.since).toBe('8.7');
      expect(componentSnippets(card).esm).toContain(card.define);
    }
    expect(componentSnippets(COMPONENTS.find((c: any) => c.id === 'fx-gesture-hint')).esm).toContain("from 'motionary/components/fx-gesture'");
    for (const id of ["gyro-card", "gesture-sticker", "fx-gesture-hint", "fx-depth-in"]) expect(COMPONENT_ITEMS.some((i: any) => i.gallery === id), id).toBe(true);
    const doc = readFileSync('docs/components.md', 'utf8');
    for (const s of ["<usa-gyro-card", "<usa-gesture-sticker", "motionary/fx/gesture"]) expect(doc).toContain(s);
  });
});


const pe = (type: string, id: number, x: number, y: number) => {
  const e = new MouseEvent(type, { clientX: x, clientY: y, bubbles: true }) as any;
  Object.defineProperty(e, 'pointerId', { value: id });
  Object.defineProperty(e, 'pointerType', { value: 'touch' });
  return e;
};

describe('8.7 widgets behave', () => {
  it('gesture math', () => {
    expect(pinchScale({ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 0, y: 0 }, { x: 20, y: 0 })).toBe(2);
    expect(pinchScale({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 5, y: 0 })).toBe(1);
    expect(pinchAngle({ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 10 })).toBe(90);
    expect(pinchAngle({ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 0, y: 0 }, { x: -10, y: -1 })).toBeLessThan(-170);
    expect(orientationToTilt(40, 0)).toEqual({ rx: 0, ry: 0 });
    expect(orientationToTilt(100, 60, 15)).toEqual({ rx: -15, ry: 15 });
  });
  it('gyro card: glare, tilt sets vars + event, reduced has no listeners effect', () => {
    configureComponents({ reducedMotion: 'user' });
    const c = mount<any>('<usa-gyro-card max="10"><b data-depth="2">x</b></usa-gyro-card>');
    expect(c.querySelector('.usa-gy-glare').getAttribute('aria-hidden')).toBe('true');
    const ev = vi.fn();
    c.addEventListener('usa:tilt', ev);
    expect(typeof c.wobble).toBe('function');
    c.tilt(5, -8, 'gyro');
    expect(c.style.getPropertyValue('--rx')).toBe('5.0deg');
    expect(c.style.getPropertyValue('--ry')).toBe('-8.0deg');
    expect(c.source).toBe('gyro');
    expect(c.hasAttribute('data-tilted')).toBe(true);
    expect(ev.mock.calls[0][0].detail).toEqual({ rx: 5, ry: -8, source: 'gyro' });
    c.tilt(0, 0, 'weird');
    expect(c.source).toBe('none');
    expect(c.hasAttribute('data-tilted')).toBe(false);
    const n = mount<any>('<usa-gyro-card glare="false"></usa-gyro-card>');
    expect(n.querySelector('.usa-gy-glare')).toBeNull();
  });
  it('gesture sticker: drag, pinch + twist, keys, clamp, reset', () => {
    configureComponents({ reducedMotion: 'reduce' });
    const s = mount<any>('<usa-gesture-sticker label="Star" max="2"><span>★</span></usa-gesture-sticker>');
    expect(s.getAttribute('role')).toBe('group');
    expect(s.getAttribute('aria-label')).toContain('Star');
    expect(s.tabIndex).toBe(0);
    const ev = vi.fn();
    s.addEventListener('usa:transform', ev);
    s.dispatchEvent(pe('pointerdown', 1, 0, 0));
    s.dispatchEvent(pe('pointermove', 1, 30, 20));
    expect([s.x, s.y]).toEqual([30, 20]);
    expect(s.hasAttribute('data-held')).toBe(true);
    s.dispatchEvent(pe('pointerdown', 2, 50, 20));
    s.dispatchEvent(pe('pointermove', 2, 30, 50));
    expect(s.scale).toBeCloseTo(1.5, 2);
    expect(s.angle).toBeCloseTo(90, 0);
    s.dispatchEvent(pe('pointerup', 2, 30, 50));
    s.dispatchEvent(pe('pointerup', 1, 30, 20));
    expect(s.hasAttribute('data-held')).toBe(false);
    s.transformTo({ scale: 9 });
    expect(s.scale).toBe(2);
    s.dispatchEvent(new KeyboardEvent('keydown', { key: ']' }));
    s.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    expect(s.style.transform).toContain('rotate(');
    s.dispatchEvent(new KeyboardEvent('keydown', { key: '0' }));
    expect([s.x, s.y, s.scale, s.angle]).toEqual([0, 0, 1, 0]);
    expect(ev.mock.calls.at(-1)[0].detail).toEqual({ x: 0, y: 0, scale: 1, angle: 0 });
  });
  it('gesture pack: names, kinds, fingers cleaned, depth-in staggers, reduced', async () => {
    expect(G3.map((e: any) => `${e.name}:${e.kind}`)).toEqual(['swipe-hint:attention', 'pinch-hint:attention', 'tilt-wobble:attention', 'depth-in:enter']);
    const el = document.createElement('div');
    el.innerHTML = '<i data-depth="3"></i><i></i>';
    document.body.append(el);
    const ctx: any = { reduced: false, sensitivity: 'normal', animate: vi.fn(() => null), onCleanup: vi.fn() };
    await G3[1].run(el, { duration: 100 }, ctx);
    expect(ctx.animate).toHaveBeenCalledTimes(3);
    expect(el.querySelectorAll('span').length).toBe(0);
    const dctx: any = { ...ctx, animate: vi.fn(() => null) };
    await G3[3].run(el, { duration: 100, stagger: 30 }, dctx);
    expect(dctx.animate.mock.calls.map((c: any) => c[2].delay)).toEqual([0, 30]);
    expect(dctx.animate.mock.calls[0][1][0].transform).toContain('-360px');
    const rctx: any = { ...ctx, reduced: true, animate: vi.fn(() => null) };
    for (const fx of G3) await fx.run(el, { ...fx.defaults }, rctx);
    expect(rctx.animate).not.toHaveBeenCalled();
  });
});
