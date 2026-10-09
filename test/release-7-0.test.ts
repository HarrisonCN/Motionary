import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, mount } from './components-setup';
import { configureComponents } from '../src/components/base';
import { glslToWgsl, wgslModule, WGSL_HEAD, supportsWebGPU, webgpuBackground, shaderBackground, GPU_FX, registerGpuPack, EFFECT_PACKS, registerAllPlugins } from '../src/components/fx2';
import { getEffect } from '../src/components/fx';
import { readFileSync } from 'node:fs';

beforeEach(() => {
  installComponentMocks();
  document.body.innerHTML = '';
});
afterEach(() => {
  delete (navigator as any).gpu;
  vi.unstubAllGlobals();
  configureComponents({ reducedMotion: 'user' });
});

const ctx = (reduced = false): any => ({ reduced, animate: () => null, onCleanup() {} });

describe('7.0 WebGPU backend', () => {
  it('translates the GLSL body dialect to WGSL', () => {
    const w = glslToWgsl('vec2 q=vec2(fbm(p+t*.1),1.);float f=fbm(p+3.*q);vec3 c=mix(u_c0,u_c1,clamp(f,0.,1.));for(int i=0;i<3;i++){float fi=float(i);c+=vec3(fi*.1);}o=vec4(c,1.);');
    expect(w).toContain('var q:vec2f=vec2f(fbm(p+t*0.1),1.0)');
    expect(w).toContain('var f:f32=fbm(p+3.0*q)');
    expect(w).toContain('var c:vec3f=mix(u.c0.xyz,u.c1.xyz,clamp(f,0.0,1.0))');
    expect(w).toContain('for(var i:i32=0;i<3;i++)');
    expect(w).toContain('var fi:f32=f32(i)');
    expect(w).toContain('o=vec4f(c,1.0)');
    expect(() => glslToWgsl('o=vec4(x>0.?1.:0.);')).toThrow();
    expect(() => glslToWgsl('float a=mod(t,1.);')).toThrow();
  });
  it('every 6.x shader body translates; the module has vs / fs entry points and the noise helpers', () => {
    const bodies = readFileSync('src/components/fx2/gpu.ts', 'utf8').match(/body: '([^']*)'/g)!.map((b) => b.slice(7, -1));
    expect(bodies.length).toBe(5);
    for (const b of bodies) {
      const m = wgslModule(glslToWgsl(b));
      expect(m).toContain('@fragment fn fs');
      expect(m).not.toMatch(/\bvec[234]\(|\bfloat\b|\b\d+\.(?!\d)|u_c\d/);
    }
    expect(WGSL_HEAD).toContain('fn fbm(');
    expect(WGSL_HEAD).toContain('@vertex fn vs');
  });
  it('without navigator.gpu: no WebGPU, shaders use WebGL2 / Canvas as before', async () => {
    expect(supportsWebGPU()).toBe(false);
    expect(await webgpuBackground(document.body, ctx(), { body: 'o=vec4(1.);' }, {})).toBeNull();
    vi.stubGlobal('requestAnimationFrame', () => 1);
    registerGpuPack();
    const el = mount<HTMLElement>('<div></div>');
    const stop = getEffect('fluid')!.run(el, { ...getEffect('fluid')!.defaults }, ctx(true)) as () => void;
    expect(['webgl2', 'canvas']).toContain(el.dataset.usaBackend);
    stop();
    expect(el.dataset.usaBackend).toBeUndefined();
  });
  it('with navigator.gpu but no adapter: falls back to WebGL2 / Canvas after the async probe', async () => {
    (navigator as any).gpu = { requestAdapter: async () => null, getPreferredCanvasFormat: () => 'bgra8unorm' };
    expect(supportsWebGPU()).toBe(true);
    vi.stubGlobal('requestAnimationFrame', () => 1);
    const el = mount<HTMLElement>('<div></div>');
    const spec = { body: 'o=vec4(u_c0,1.);', fallback: { draw: () => undefined } };
    const stop = shaderBackground(el, ctx(true), spec as any, { colors: ['#000000'] });
    expect(el.dataset.usaBackend).toBeUndefined();
    await new Promise((r) => setTimeout(r, 0));
    expect(['webgl2', 'canvas']).toContain(el.dataset.usaBackend);
    stop();
    expect(el.querySelector('canvas')).toBeNull();
  });
  it('a shader that WebGPU cannot translate falls back without touching the adapter', async () => {
    const req = vi.fn(async () => null);
    (navigator as any).gpu = { requestAdapter: req };
    expect(await webgpuBackground(document.body, ctx(), { body: 'o=vec4(t>1.?1.:0.);' }, {})).toBeNull();
    expect(req).not.toHaveBeenCalled();
  });
});

describe('7.0 entries, removals, docs', () => {
  it('per-pack motionary/fx/* entries point at the built packs', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    expect(Number(pkg.version.split('.')[0])).toBeGreaterThanOrEqual(7);
    expect(pkg.exports['./fx'].import.default).toBe('./dist/components/fx2.js');
    for (const [p, n] of Object.entries({ gpu: 'fx-gpu', text: 'fx-text', light: 'fx-light', '3d': 'fx-3d', morph: 'fx-morph', transitions: 'fx-transitions', weather: 'fx-weather', physics: 'fx-physics', focus: 'fx-focus', marketplace: 'marketplace' })) {
      expect(pkg.exports[`./fx/${p}`].import.default).toBe(`./dist/components/${n}.js`);
      expect(pkg.exports[`./fx/${p}`].require.default).toBe(`./dist/components/${n}.cjs`);
    }
  });
  it('registerAllPlugins / EFFECT_PACKS are the only aggregate names', () => {
    registerAllPlugins();
    expect(EFFECT_PACKS.gpu).toBe(GPU_FX);
    expect(Object.keys(EFFECT_PACKS)).toEqual(expect.arrayContaining(['gpu', 'text', 'light', 'depth', 'morph', 'transitions', 'weather', 'physics', 'focus']));
  });
  it('post-7.0 roadmap (v7.1 → v8.0, Chinese, one line each) and upgrading-7.md', () => {
    const r = readFileSync('docs/ROADMAP.md', 'utf8');
    expect(r).toMatch(/路线图/);
    if (r.includes('7.0 之后')) {
      const lines = r.split('\n').filter((l) => /^- (✅ )?\*\*v\d+\.\d+\*\* — /.test(l));
      expect(lines.map((l) => l.match(/v(\d+\.\d+)/)![1])).toEqual(['7.1', '7.2', '7.3', '7.4', '7.5', '7.6', '7.7', '7.8', '7.9', '8.0']);
      for (const l of lines.slice(0, 9)) expect(l).toMatch(/新组件/);
    }
    const up = readFileSync('docs/upgrading-7.md', 'utf8');
    expect(up).toContain('7.0.0 is released');
    expect(up).toContain('WebGPU');
    expect(up).toContain('motionary/fx/gpu');
  });
});
