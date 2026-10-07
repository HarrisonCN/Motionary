import { describe, it, expect, beforeEach } from 'vitest';
import { installComponentMocks, intersect, mount } from './components-setup';
import { defineWebglComponents, glQuad, fragmentSource, SHADERS } from '../src/components/webgl';

const calls: string[] = [];
/** A fake WebGL context: every method is recorded and returns something truthy. */
const fakeGL = (compileOk = true) =>
  new Proxy({} as any, {
    get: (_t, k: string) => {
      if (/^[A-Z_0-9]+$/.test(k)) return 1;
      if (k === 'getShaderParameter') return () => compileOk;
      if (k === 'getExtension') return () => null;
      return (...a: unknown[]) => (calls.push(k), a.length >= 0 ? {} : null);
    },
  });

beforeEach(() => {
  installComponentMocks();
  calls.length = 0;
  document.body.innerHTML = '';
  defineWebglComponents();
});

describe('shader sources', () => {
  it('prefixes the shared header for presets and custom bodies', () => {
    expect(Object.keys(SHADERS)).toEqual(expect.arrayContaining(['gradient', 'plasma', 'waves', 'aurora', 'distort', 'liquid']));
    const s = fragmentSource('plasma');
    expect(s).toMatch(/^precision mediump float/);
    expect(s).toContain('uniform float u_time');
    expect(fragmentSource('void main(){gl_FragColor=vec4(1.);}')).toContain('u_resolution');
    expect(fragmentSource('precision highp float;void main(){}')).toBe('precision highp float;void main(){}');
  });
});

describe('glQuad()', () => {
  it('returns null without WebGL, and when the shader does not compile', () => {
    expect(glQuad(document.createElement('canvas'), 'gradient')).toBeNull();
    const c = document.createElement('canvas');
    (c as any).getContext = () => fakeGL(false);
    expect(glQuad(c, 'gradient')).toBeNull();
  });
  it('compiles, sizes the buffer and draws a quad', () => {
    const c = document.createElement('canvas');
    (c as any).getContext = () => fakeGL();
    const q = glQuad(c, 'gradient')!;
    expect(q).toBeTruthy();
    q.render({ time: 1, mouse: [0.2, 0.3], hover: 1, ripples: [0.5, 0.5, 0.1, 1] });
    expect(calls).toEqual(expect.arrayContaining(['compileShader', 'linkProgram', 'viewport', 'drawArrays', 'uniform4fv']));
    expect(c.width).toBeGreaterThan(0);
    q.dispose();
    expect(calls).toContain('deleteProgram');
  });
});

describe('WebGL elements', () => {
  it('<usa-shader> falls back to its CSS background without WebGL', () => {
    const el = mount<any>('<usa-shader preset="plasma"><h2>Hi</h2></usa-shader>');
    expect(el.active).toBe(false);
    expect(el.dataset.fallback).toBe('webgl');
    expect(el.querySelector('canvas')).toBeNull();
    expect(el.querySelector('h2')).toBeTruthy();
  });

  it('<usa-shader> renders with WebGL and only loops while visible', () => {
    (HTMLCanvasElement.prototype as any).getContext = () => fakeGL();
    const el = mount<any>('<usa-shader><p>x</p></usa-shader>');
    expect(el.active).toBe(true);
    expect(el.hasAttribute('data-active')).toBe(true);
    const canvas = el.querySelector('canvas');
    expect(canvas.getAttribute('aria-hidden')).toBe('true');
    expect(calls.filter((c) => c === 'drawArrays')).toHaveLength(1);
    intersect(el, true);
    intersect(el, false);
    el.remove();
    expect(calls).toContain('deleteProgram');
  });

  it('<usa-shader> takes a custom fragment shader', () => {
    let src = '';
    (HTMLCanvasElement.prototype as any).getContext = () =>
      new Proxy(fakeGL(), { get: (t, k: string) => (k === 'shaderSource' ? (_s: unknown, s: string) => (src = s) : t[k]) });
    mount('<usa-shader><script type="x-shader/x-fragment">void main(){gl_FragColor=vec4(v_uv,0.,1.);}</script></usa-shader>');
    expect(src).toContain('gl_FragColor=vec4(v_uv');
  });

  it('<usa-distort> / <usa-liquid> need an image, and keep it visible on fallback', () => {
    const a = mount<any>('<usa-distort></usa-distort>');
    expect(a.dataset.fallback).toBe('no-image');
    const b = mount<any>('<usa-liquid><img alt="Lake"></usa-liquid>');
    expect(b.dataset.fallback).toBe('webgl');
    expect(b.querySelector('img')).toBeTruthy();
  });

  it('draws a single static frame under reduced motion', () => {
    installComponentMocks({ reducedMotion: true });
    (HTMLCanvasElement.prototype as any).getContext = () => fakeGL();
    const el = mount<any>('<usa-shader></usa-shader>');
    expect(el.active).toBe(true);
    expect(() => intersect(el, true)).toThrow('not observed');
  });
});
