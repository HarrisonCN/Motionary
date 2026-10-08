import { describe, it, expect, beforeEach } from 'vitest';
import { installComponentMocks, mount } from './components-setup';
import { defineWebglComponents, SHADERS, PARTICLE_PRESETS, POST_EFFECTS, postFxShader, glFallbackCss, glGovernor, watchPowerSaver, glQuad, fragmentSource } from '../src/components/webgl';

const uniforms: string[] = [];
const fakeGL = () =>
  new Proxy({} as any, {
    get: (_t, k: string) => {
      if (/^[A-Z_0-9]+$/.test(k)) return 1;
      if (k === 'getShaderParameter' || k === 'getProgramParameter') return () => true;
      if (k === 'getExtension') return () => null;
      if (k === 'getUniformLocation') return (_p: unknown, n: string) => (uniforms.push(n), { n });
      return () => ({});
    },
  });

beforeEach(() => {
  installComponentMocks();
  uniforms.length = 0;
  document.body.innerHTML = '';
  defineWebglComponents();
});

describe('WebGL presets (4.8)', () => {
  it('particle presets are shader presets with the shared header and a CSS fallback', () => {
    for (const p of PARTICLE_PRESETS) {
      expect(SHADERS[p], p).toMatch(/void main\(\)/);
      expect(fragmentSource(p)).toMatch(/^precision mediump float/);
      expect(glFallbackCss(p)).not.toBe(glFallbackCss('nope'));
    }
  });

  it('chains post-processing passes in order into one shader', () => {
    const src = postFxShader(['vignette', 'bogus', 'crt']);
    expect(src).toContain('uniform float u_intensity');
    expect(src.indexOf(POST_EFFECTS.vignette)).toBeLessThan(src.indexOf(POST_EFFECTS.crt));
    expect(src).not.toContain('bogus');
    expect(glFallbackCss('duotone vignette', true)).toContain('grayscale');
  });

  it('glQuad sets extra uniforms and scales the drawing buffer', () => {
    const c = document.createElement('canvas');
    (c as any).getContext = () => fakeGL();
    const q = glQuad(c, postFxShader(['grain']))!;
    q.render({ time: 1, extra: { u_intensity: 0.5 } });
    expect(uniforms).toContain('u_intensity');
    Object.defineProperty(c, 'clientWidth', { value: 400 });
    Object.defineProperty(c, 'clientHeight', { value: 200 });
    q.resize(0.5);
    expect([c.width, c.height]).toEqual([200, 100]);
  });

  it('governor steps resolution down on slow frames, back up when fast, caps fps in saver mode', () => {
    const g = glGovernor({ minFps: 40, saverFps: 30 });
    const scales: number[] = [];
    g.onScale = (s) => scales.push(s);
    let t = 0;
    const run = (ms: number, step: number) => {
      for (let x = 0; x < ms; x += step) g.tick((t += step));
    };
    run(2100, 50); // 20 fps
    expect(g.scale).toBe(0.5);
    run(5200, 16);
    expect(g.scale).toBe(1);
    expect(scales).toEqual([0.5, 1]);
    g.saver = true;
    let rendered = 0;
    for (let i = 0; i < 60; i++) if (g.tick((t += 16))) rendered++;
    expect(rendered).toBeLessThanOrEqual(31);
    expect(g.scale).toBeLessThanOrEqual(0.6);
  });

  it('watchPowerSaver reports low battery and save-data', async () => {
    const seen: boolean[] = [];
    const nav = navigator as any;
    nav.getBattery = () => Promise.resolve({ charging: false, level: 0.1, addEventListener() {}, removeEventListener() {} });
    const stop = watchPowerSaver((s) => seen.push(s));
    await Promise.resolve();
    await Promise.resolve();
    expect(seen).toEqual([true]);
    stop();
    delete nav.getBattery;
  });

  it('<usa-post-fx> renders on WebGL and falls back to a CSS filter without it', () => {
    const ok = mount<any>('<usa-post-fx effects="duotone grain"><img alt="x" src="data:image/gif;base64,R0lGODlhAQABAAAAACw="></usa-post-fx>');
    expect(ok.getAttribute('data-fallback')).toBe('webgl'); // jsdom: no WebGL
    expect(ok.style.getPropertyValue('--usa-gl-filter')).toContain('grayscale');
    const sh = mount<any>('<usa-shader preset="stars"></usa-shader>');
    expect(sh.style.getPropertyValue('--usa-gl-fallback')).toContain('#02020a');
  });
});
