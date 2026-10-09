import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, mount, anims } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineFxComponents, bindEffect, getEffect, registerEffect } from '../src/components/fx';
import { registerAllEffects, registerCursorEffects, CURSOR_FX, EFFECT_PACKS, bindGesture, flingVelocity, angleDelta, defineGestureFx } from '../src/components/effects';

function stubCanvas() {
  const calls: string[] = [];
  const ctx: any = new Proxy({}, {
    get: (t: any, k: string) => (k in t ? t[k] : (..._a: unknown[]) => void calls.push(k)),
    set: (t: any, k: string, v: unknown) => ((t[k] = v), true),
  });
  (HTMLCanvasElement.prototype as any).getContext = () => ctx;
  return calls;
}

let rafs: FrameRequestCallback[] = [];
const tick = (t: number) => rafs.splice(0).forEach((cb) => cb(t));
function ptr(el: Element, type: string, x: number, y: number, extra: Record<string, unknown> = {}) {
  const e = new Event(type, { bubbles: true }) as any;
  Object.assign(e, { clientX: x, clientY: y, pointerId: 1, pointerType: 'mouse', ...extra });
  Object.defineProperty(e, 'timeStamp', { value: (extra.t as number) ?? performance.now() });
  el.dispatchEvent(e);
}

beforeEach(() => {
  installComponentMocks();
  document.body.innerHTML = '';
  rafs = [];
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => rafs.push(cb));
  vi.stubGlobal('cancelAnimationFrame', () => undefined);
  defineFxComponents();
  registerAllEffects();
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
  configureComponents({ reducedMotion: 'user' });
});

describe('5.7 cursor pack', () => {
  it('registers five cursor effects', () => {
    registerCursorEffects();
    expect(CURSOR_FX.map((d) => d.name)).toEqual(['comet-trail', 'ribbon-trail', 'sparkle-trail', 'magnetic-dots', 'spotlight-cursor']);
    for (const d of CURSOR_FX) {
      expect(getEffect(d.name)).toBe(d);
      expect(d.kind).toBe('cursor');
    }
    expect(EFFECT_PACKS.cursor).toBe(CURSOR_FX);
  });

  it.each(['comet-trail', 'ribbon-trail'])('%s draws the pointer path on a fixed overlay canvas, then cleans up', (name) => {
    const calls = stubCanvas();
    const el = mount<HTMLElement>('<div></div>');
    const off = bindEffect(el, name, { trigger: 'load' });
    const c = document.querySelector('[data-usa-fx-layer] canvas');
    expect(c).not.toBeNull();
    const now = performance.now();
    ptr(el, 'pointermove', 10, 10);
    ptr(el, 'pointermove', 30, 20);
    ptr(el, 'pointermove', 60, 40);
    expect(rafs.length).toBe(1);
    tick(now + 5);
    expect(calls).toContain('stroke');
    expect(rafs.length).toBe(1); // keeps animating while the tail fades
    tick(now + 5000); // tail expired → loop stops
    expect(rafs.length).toBe(0);
    off();
    expect(document.querySelector('[data-usa-fx-layer] canvas')).toBeNull();
  });

  it('ignores touch pointers unless touch: true', () => {
    stubCanvas();
    const el = mount<HTMLElement>('<div></div>');
    const off = bindEffect(el, 'comet-trail', { trigger: 'load' });
    ptr(el, 'pointermove', 10, 10, { pointerType: 'touch' });
    expect(rafs.length).toBe(0);
    off();
    const off2 = bindEffect(el, 'comet-trail', { trigger: 'load', touch: true });
    ptr(el, 'pointermove', 10, 10, { pointerType: 'touch' });
    expect(rafs.length).toBe(1);
    off2();
  });

  it('sparkle-trail spawns stars spaced along the path', () => {
    const el = mount<HTMLElement>('<div></div>');
    const off = bindEffect(el, 'sparkle-trail', { trigger: 'load', spacing: 20 });
    ptr(el, 'pointermove', 0, 0);
    ptr(el, 'pointermove', 5, 0); // too close
    ptr(el, 'pointermove', 40, 0);
    const stars = document.querySelectorAll('[data-usa-fx-layer] span');
    expect(stars.length).toBe(2);
    expect(stars[0].textContent).toBe('✦');
    off();
    ptr(el, 'pointermove', 400, 400);
    expect(anims.length).toBe(2);
  });

  it('magnetic-dots mounts a canvas behind the content and reacts to the pointer', () => {
    const calls = stubCanvas();
    const el = mount<HTMLElement>('<div><p>x</p></div>');
    (el as any).getBoundingClientRect = () => ({ top: 0, left: 0, width: 100, height: 60, right: 100, bottom: 60 });
    const off = bindEffect(el, 'magnetic-dots', { trigger: 'load' });
    expect(el.firstElementChild!.tagName).toBe('CANVAS');
    ptr(el, 'pointermove', 50, 30);
    const n = calls.length;
    tick(performance.now() + 16);
    expect(calls.length).toBeGreaterThan(n);
    off();
    expect(el.querySelector('canvas')).toBeNull();
  });

  it('spotlight-cursor follows the pointer with easing and restores the element', () => {
    const el = mount<HTMLElement>('<div></div>');
    (el as any).getBoundingClientRect = () => ({ top: 100, left: 100, width: 200, height: 200, right: 300, bottom: 300 });
    const off = bindEffect(el, 'spotlight-cursor', { trigger: 'load' });
    const s = el.querySelector<HTMLElement>('span[aria-hidden]')!;
    expect(s.style.pointerEvents).toBe('none');
    ptr(el, 'pointermove', 150, 150);
    expect(s.style.opacity).toBe('1');
    ptr(el, 'pointermove', 250, 250);
    tick(16);
    const x = parseFloat(s.style.getPropertyValue('--sx'));
    expect(x).toBeGreaterThan(50);
    expect(x).toBeLessThan(150);
    ptr(el, 'pointerleave', 0, 0);
    expect(s.style.opacity).toBe('0');
    off();
    expect(el.querySelector('span')).toBeNull();
  });

  it('reduced motion: cursor effects do not mount', () => {
    configureComponents({ reducedMotion: 'reduce' });
    const el = mount<HTMLElement>('<div></div>');
    bindEffect(el, 'spotlight-cursor', { trigger: 'load' });
    bindEffect(el, 'comet-trail', { trigger: 'load' });
    expect(el.querySelector('span')).toBeNull();
    expect(document.querySelector('[data-usa-fx-layer] canvas')).toBeNull();
  });
});

describe('5.7 gestures → effects', () => {
  it('flingVelocity / angleDelta (pure)', () => {
    const v = flingVelocity([{ x: 0, y: 0, t: 0 }, { x: 50, y: 0, t: 50 }, { x: 150, y: 10, t: 100 }]);
    expect(v.vx).toBeCloseTo(1.5);
    expect(v.speed).toBeGreaterThan(1.4);
    expect(flingVelocity([{ x: 0, y: 0, t: 0 }]).speed).toBe(0);
    expect(angleDelta(170, -170)).toBe(20);
    expect(angleDelta(-170, 170)).toBe(-20);
    expect(angleDelta(0, 45)).toBe(45);
  });

  it('fling: a fast release fires the effect with direction; a slow drag does not', () => {
    const run = vi.fn();
    registerEffect({ name: 't-fling', kind: 'attention', run });
    const el = mount<HTMLElement>('<div></div>');
    const seen: any[] = [];
    el.addEventListener('usa-gesture', (e) => seen.push((e as CustomEvent).detail));
    const off = bindGesture(el, 'fling', 't-fling', { effectOptions: { k: 2 } });
    ptr(el, 'pointerdown', 0, 0, { t: 1000 });
    ptr(el, 'pointermove', 5, 2, { t: 1100 });
    ptr(el, 'pointerup', 10, 4, { t: 1500 }); // slow
    expect(run).not.toHaveBeenCalled();
    ptr(el, 'pointerdown', 0, 0, { t: 2000 });
    ptr(el, 'pointermove', 0, -60, { t: 2030 });
    ptr(el, 'pointerup', 0, -150, { t: 2070 });
    expect(run).toHaveBeenCalledTimes(1);
    expect(run.mock.calls[0][1]).toMatchObject({ k: 2 });
    expect(seen[0]).toMatchObject({ gesture: 'fling', direction: 'up' });
    off();
  });

  it('twist: two pointers rotating past the angle fire cw / ccw', () => {
    const el = mount<HTMLElement>('<div></div>');
    const got: any[] = [];
    bindGesture(el, 'twist', (d) => got.push(d), { angle: 30 });
    expect(el.style.touchAction).toBe('none');
    ptr(el, 'pointerdown', 0, 0, { pointerId: 1 });
    ptr(el, 'pointerdown', 100, 0, { pointerId: 2 });
    ptr(el, 'pointermove', 100, 20, { pointerId: 2 }); // ~11°
    expect(got.length).toBe(0);
    ptr(el, 'pointermove', 70, 70, { pointerId: 2 }); // 45°
    expect(got[0]).toMatchObject({ gesture: 'twist', direction: 'cw' });
    ptr(el, 'pointermove', 100, -10, { pointerId: 2 }); // back ~-51°
    expect(got[1].direction).toBe('ccw');
  });

  it('long-press charges --usa-charge 0 → 1 and fires; moving cancels', () => {
    const el = mount<HTMLElement>('<div></div>');
    const got: any[] = [];
    bindGesture(el, 'long-press', (d) => got.push(d), { duration: 400 });
    const t0 = performance.now();
    ptr(el, 'pointerdown', 10, 10);
    tick(t0 + 200);
    const k = Number(el.style.getPropertyValue('--usa-charge'));
    expect(k).toBeGreaterThan(0.3);
    expect(k).toBeLessThan(1);
    expect(el.hasAttribute('data-charging')).toBe(true);
    tick(t0 + 500);
    expect(got).toEqual([{ gesture: 'long-press', charge: 1 }]);
    ptr(el, 'pointerup', 10, 10);
    // second press, moved away → cancelled
    ptr(el, 'pointerdown', 10, 10);
    ptr(el, 'pointermove', 60, 10);
    expect(el.style.getPropertyValue('--usa-charge')).toBe('0.000');
    tick(performance.now() + 1000);
    expect(got.length).toBe(1);
  });

  it('<usa-gesture-fx> plays its effect on the first child', () => {
    defineGestureFx();
    const run = vi.fn();
    registerEffect({ name: 't-gfx', kind: 'attention', run });
    const host = mount<HTMLElement>('<usa-gesture-fx gesture="fling" effect="t-gfx" options=\'{"a":1}\'><button>Fling me</button></usa-gesture-fx>');
    ptr(host, 'pointerdown', 0, 0, { t: 0 });
    ptr(host, 'pointermove', 80, 0, { t: 40 });
    ptr(host, 'pointerup', 160, 0, { t: 80 });
    expect(run).toHaveBeenCalledTimes(1);
    expect(run.mock.calls[0][0]).toBe(host.querySelector('button'));
    expect(run.mock.calls[0][1]).toMatchObject({ a: 1 });
    expect((host as any).gesture).toBe('fling');
  });
});
