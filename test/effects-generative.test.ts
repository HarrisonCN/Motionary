import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, mount } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineFxComponents, bindEffect, getEffect } from '../src/components/fx';
import { registerAllEffects, registerGenerativeEffects, GENERATIVE_FX, EFFECT_PACKS, noise2, hexRgb, canvasBackground } from '../src/components/effects';

/** A recording 2D-context stub (jsdom has no canvas). */
function stubCanvas() {
  const calls: string[] = [];
  const ctx: any = new Proxy(
    {},
    {
      get(target: any, k: string) {
        if (k in target) return target[k];
        if (k === 'createImageData') return (w: number, h: number) => ({ width: w, height: h, data: new Uint8ClampedArray(w * h * 4) });
        if (k === 'createRadialGradient') return () => ({ addColorStop() {} });
        return (...a: unknown[]) => void calls.push(k + (a.length ? '' : ''));
      },
      set(target: any, k: string, v: unknown) {
        target[k] = v;
        return true;
      },
    }
  );
  (HTMLCanvasElement.prototype as any).getContext = () => ctx;
  return calls;
}

let rafs: FrameRequestCallback[] = [];
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
  configureComponents({ reducedMotion: 'user' });
});

describe('5.5 generative backgrounds', () => {
  it('registers six background effects', () => {
    registerGenerativeEffects();
    expect(GENERATIVE_FX.map((d) => d.name)).toEqual(['flow-field', 'voronoi', 'mesh-gradient', 'starfield', 'metaballs', 'contours']);
    for (const d of GENERATIVE_FX) {
      expect(getEffect(d.name)).toBe(d);
      expect(d.kind).toBe('background');
      expect(d.reduced).toBe('run');
    }
    expect(EFFECT_PACKS.generative).toBe(GENERATIVE_FX);
  });

  it('noise2 is deterministic and bounded; hexRgb parses colours', () => {
    expect(noise2(1.2, 3.4, 5)).toBe(noise2(1.2, 3.4, 5));
    for (let i = 0; i < 200; i++) expect(Math.abs(noise2(i * 0.37, i * 0.91, i))).toBeLessThanOrEqual(1);
    expect(hexRgb('#7c5cff')).toEqual([124, 92, 255]);
    expect(hexRgb('nope')).toEqual([124, 92, 255]);
  });

  it.each(GENERATIVE_FX.map((d) => d.name))('%s mounts an aria-hidden canvas behind the content, draws, loops and cleans up', (name) => {
    const calls = stubCanvas();
    const el = mount<HTMLElement>('<div><p>content</p></div>');
    (el as any).getBoundingClientRect = () => ({ top: 0, left: 0, width: 120, height: 80, right: 120, bottom: 80 });
    const off = bindEffect(el, name, { trigger: 'load' });
    const c = el.querySelector('canvas')!;
    expect(c.getAttribute('aria-hidden')).toBe('true');
    expect(c.style.pointerEvents).toBe('none');
    expect(el.firstElementChild).toBe(c);
    expect(el.style.isolation).toBe('isolate');
    expect(calls.length).toBeGreaterThan(0); // first frame drawn
    expect(rafs.length).toBe(1);
    const n = calls.length;
    rafs.shift()!(performance.now() + 16);
    expect(calls.length).toBeGreaterThan(n);
    expect(rafs.length).toBe(1); // keeps looping while visible
    off();
    expect(el.querySelector('canvas')).toBeNull();
    expect(el.style.isolation).toBe('');
  });

  it('reduced motion: one static frame, no loop', () => {
    const calls = stubCanvas();
    configureComponents({ reducedMotion: 'reduce' });
    const el = mount<HTMLElement>('<div></div>');
    bindEffect(el, 'starfield', { trigger: 'load' });
    expect(el.querySelector('canvas')).not.toBeNull();
    expect(calls.length).toBeGreaterThan(0);
    expect(rafs.length).toBe(0);
  });

  it('adaptive quality: sustained slow frames lower the render scale', () => {
    stubCanvas();
    const el = mount<HTMLElement>('<div></div>');
    (el as any).getBoundingClientRect = () => ({ top: 0, left: 0, width: 200, height: 100, right: 200, bottom: 100 });
    const seen: number[] = [];
    const off = canvasBackground(el, { reduced: false } as any, { draw: (f) => seen.push(f.quality) }, {});
    let t = performance.now();
    for (let i = 0; i < 30; i++) rafs.shift()!((t += 50));
    expect(Math.min(...seen)).toBeLessThan(1);
    expect(Math.min(...seen)).toBeGreaterThanOrEqual(0.35);
    off();
  });

  it('without a 2D context it mounts nothing harmful and does not loop', () => {
    const el = mount<HTMLElement>('<div></div>');
    const off = bindEffect(el, 'voronoi', { trigger: 'load' });
    expect(rafs.length).toBe(0);
    off();
    expect(el.querySelector('canvas')).toBeNull();
  });
});
