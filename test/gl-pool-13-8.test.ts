// 13.8.0 — graphics reliability: WebGL context pool (cap, reuse, reclaim, eviction of off-screen components),
// context loss → re-mount, GPU resource budget, one shared probe; lite stays free of the pool.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import * as pool from '../src/components/gl-pool';

// ---- a fake WebGL context: enough surface for the pool's accounting + WEBGL_lose_context ----
class FakeGL {
  TEXTURE_2D = 0x0de1; TEXTURE_CUBE_MAP = 0x8513; ARRAY_BUFFER = 0x8892;
  lost = false;
  constructor(public canvas: HTMLCanvasElement) {}
  isContextLost() { return this.lost; }
  getExtension(n: string) {
    return n === 'WEBGL_lose_context' ? { loseContext: () => { if (this.lost) return; this.lost = true; this.canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true })); } } : null;
  }
  bindTexture() {} bindBuffer() {} texImage2D() {} texStorage2D() {} bufferData() {} deleteTexture() {} deleteBuffer() {} drawArrays() {} drawElements() {}
  createTexture() { return {}; } createBuffer() { return {}; }
}
const realGet = HTMLCanvasElement.prototype.getContext;
let created = 0;

// an IntersectionObserver whose entries the test controls
let ioCb: IntersectionObserverCallback | null = null;
const observed = new Set<Element>();
const show = (els: Element[], on: boolean) => ioCb?.(els.map((target) => ({ target, isIntersecting: on }) as any), {} as any);

let tagN = 0;
/** a Motionary-like component: a usa-* element with changed() that mounts a canvas + context */
function component(opts: { mount?: boolean } = {}) {
  const tag = `usa-gltest-${++tagN}`;
  class C extends HTMLElement {
    gl: any = null;
    mounts = 0;
    canvas: HTMLCanvasElement | null = null;
    connectedCallback() { if (opts.mount !== false) this.mount(); }
    mount() {
      this.mounts++;
      this.canvas?.remove();
      const c = (this.canvas = document.createElement('canvas'));
      this.prepend(c);
      this.gl = c.getContext('webgl2');
      this.toggleAttribute('data-fallback', !this.gl);
    }
    changed() { this.mount(); }
  }
  customElements.define(tag, C);
  return tag;
}
const mountMany = (n: number) => {
  const tag = component();
  const els: any[] = [];
  for (let i = 0; i < n; i++) {
    const el = document.createElement(tag);
    document.body.append(el);
    els.push(el);
  }
  return els;
};
const tick = (ms = 30) => new Promise((r) => setTimeout(r, ms));

beforeEach(() => {
  created = 0;
  document.body.innerHTML = '';
  HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string) {
    if (!/webgl/.test(type)) return null;
    const self = this as any;
    if (!self.__gl) (self.__gl = new FakeGL(this)), created++;
    return self.__gl;
  } as any;
  vi.stubGlobal('IntersectionObserver', class {
    constructor(cb: IntersectionObserverCallback) { ioCb = cb; }
    observe(el: Element) { observed.add(el); }
    unobserve(el: Element) { observed.delete(el); }
    disconnect() { observed.clear(); }
  });
  // jsdom has no layout: treat everything as in view unless a test says otherwise
  Element.prototype.getBoundingClientRect = function () { return { top: 0, left: 0, bottom: 100, right: 100, width: 100, height: 100, x: 0, y: 0, toJSON() {} } as DOMRect; };
});
afterEach(() => {
  pool.uninstallGLPool?.();
  HTMLCanvasElement.prototype.getContext = realGet;
  vi.unstubAllGlobals();
});

describe('gl-pool 13.8', () => {
  it('exports the pool API from motionary/components/gl-pool', () => {
    for (const k of ['installGLPool', 'uninstallGLPool', 'glPoolStats', 'glSupport']) expect(typeof (pool as any)[k], k).toBe('function');
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    expect(pkg.exports['./components/gl-pool']).toBeTruthy();
    const budgets = JSON.parse(readFileSync('size-budget.json', 'utf8'));
    expect(budgets.some((b: any) => /components\/gl-pool/.test(b.import || ''))).toBe(true);
  });

  it('keeps 30 components under the cap: the rest are denied and take their fallback', () => {
    pool.installGLPool({ maxContexts: 8 });
    const els = mountMany(30);
    const s = pool.glPoolStats();
    expect(s.live).toBe(8);
    expect(s.peak).toBe(8);
    expect(s.denied).toBe(22);
    expect(els.filter((e) => e.gl).length).toBe(8);
    expect(els.filter((e) => e.hasAttribute('data-fallback')).length).toBe(22);
    expect(els[29].getAttribute('data-usa-gl')).toBe('waiting');
    expect(els[0].getAttribute('data-usa-gl')).toBe('live');
  });

  it('clamps the cap to 1–16 and defaults to 8', () => {
    pool.installGLPool();
    expect(pool.glPoolStats().max).toBe(8);
    pool.installGLPool({ maxContexts: 99 });
    expect(pool.glPoolStats().max).toBe(16);
    pool.installGLPool({ maxContexts: 0 });
    expect(pool.glPoolStats().max).toBe(1);
  });

  it('a canvas asking twice gets the same context and one lease', () => {
    pool.installGLPool({ maxContexts: 2 });
    const c = document.createElement('canvas');
    document.body.append(c);
    const a = c.getContext('webgl2');
    const b = c.getContext('webgl2');
    expect(a).toBe(b);
    expect(pool.glPoolStats().live).toBe(1);
    expect(created).toBe(1);
  });

  it('evicts the least recently seen off-screen component, never an on-screen one, and re-mounts it when it is back in view', async () => {
    pool.installGLPool({ maxContexts: 4 });
    const els = mountMany(4);
    // 0 and 1 scroll out (1 last seen later than 0)
    show([els[0].canvas], false);
    show([els[1].canvas], false);
    const more = mountMany(1);
    expect(more[0].gl).toBeTruthy();
    expect(els[0].gl.isContextLost()).toBe(true);
    expect(els[1].gl.isContextLost()).toBe(false);
    expect(els[2].gl.isContextLost()).toBe(false);
    expect(els[0].getAttribute('data-usa-gl')).toBe('evicted');
    const s = pool.glPoolStats();
    expect(s.evicted).toBe(1);
    expect(s.live).toBe(4);
    // els[0] comes back: els[1] (off screen) gives way, els[0] re-mounts on a fresh context
    const before = els[0].mounts;
    show([els[0]], true);
    await tick();
    expect(els[0].mounts).toBe(before + 1);
    expect(els[0].gl.isContextLost()).toBe(false);
    expect(els[1].gl.isContextLost()).toBe(true);
    expect(pool.glPoolStats().live).toBeLessThanOrEqual(4);
  });

  it('never evicts a context the page created itself (no usa-* owner)', () => {
    pool.installGLPool({ maxContexts: 2 });
    const mine = document.createElement('canvas');
    document.body.append(mine);
    const g = mine.getContext('webgl') as any;
    show([mine], false);
    mountMany(1);
    const third = mountMany(1)[0];
    expect(g.isContextLost()).toBe(false);
    expect(third.gl).toBeNull();
  });

  it('reclaims probe contexts and contexts left on canvases taken out of the document', async () => {
    pool.installGLPool({ maxContexts: 2 });
    const probe = document.createElement('canvas').getContext('webgl') as any;
    const els = mountMany(1);
    const keep = els[0].canvas;
    els[0].canvas.remove(); // leaked: removed without losing its context
    vi.spyOn(performance, 'now').mockReturnValue(performance.now() + 1000);
    const more = mountMany(2);
    expect(more.every((e) => e.gl)).toBe(true);
    expect(probe.isContextLost()).toBe(true);
    expect((keep as any).__gl.isContextLost()).toBe(true);
    expect(pool.glPoolStats().reclaimed).toBe(2);
  });

  it('re-mounts a component whose context is lost while it is in the document (at most 3 times in 10 s)', async () => {
    pool.installGLPool({ maxContexts: 8 });
    const [el] = mountMany(1);
    for (let i = 1; i <= 3; i++) {
      el.gl.getExtension('WEBGL_lose_context').loseContext();
      await tick(60);
      expect(el.mounts).toBe(1 + i);
      expect(el.gl.isContextLost()).toBe(false);
      expect(el.getAttribute('data-usa-gl')).toBe('restored');
    }
    el.gl.getExtension('WEBGL_lose_context').loseContext();
    await tick(60);
    expect(el.mounts).toBe(4);
    expect(el.getAttribute('data-usa-gl')).toBe('lost');
    const s = pool.glPoolStats();
    expect(s.lost).toBe(4);
    expect(s.recovered).toBe(3);
  });

  it('does not re-mount a component that lost its context because it was tearing down', async () => {
    pool.installGLPool({ maxContexts: 8 });
    const [el] = mountMany(1);
    const c = el.canvas;
    c.remove();
    el.gl.getExtension('WEBGL_lose_context').loseContext();
    await tick(60);
    expect(el.mounts).toBe(1);
    expect(pool.glPoolStats()).toMatchObject({ live: 0, lost: 0 });
  });

  it('accounts textures, buffers and drawing buffers; over budget it evicts off-screen components, largest first', async () => {
    pool.installGLPool({ maxContexts: 8, budgetBytes: 10_000_000 });
    const els = mountMany(3);
    const up = (el: any, w: number, h: number) => {
      const g = el.gl;
      const t = g.createTexture();
      g.bindTexture(g.TEXTURE_2D, t);
      g.texImage2D(g.TEXTURE_2D, 0, 0x1908, w, h, 0, 0x1908, 0x1401, null);
      return t;
    };
    els.forEach((e: any) => (e.canvas.width = e.canvas.height = 10));
    up(els[0], 1000, 1000); // 4 MB
    const b = els[1].gl.createBuffer();
    els[1].gl.bindBuffer(els[1].gl.ARRAY_BUFFER, b);
    els[1].gl.bufferData(els[1].gl.ARRAY_BUFFER, 1_000_000, 0);
    await tick(0);
    let s = pool.glPoolStats();
    expect(s.bytes).toBe(4_000_000 + 1_000_000 + 3 * 400);
    expect(s.evicted).toBe(0);
    show([els[0].canvas, els[1].canvas], false);
    up(els[2], 1500, 1000); // +6 MB on screen → 11 MB > 10 MB
    await tick(0);
    s = pool.glPoolStats();
    expect(els[0].gl.isContextLost()).toBe(true); // the largest off-screen one
    expect(els[1].gl.isContextLost()).toBe(false);
    expect(els[2].gl.isContextLost()).toBe(false); // on screen: never
    expect(s.bytes).toBeLessThanOrEqual(10_000_000);
    // deleting a texture gives its bytes back
    const t = up(els[1], 100, 100);
    els[1].gl.deleteTexture(t);
    expect(pool.glPoolStats().bytes).toBe(s.bytes);
  });

  it('glSupport probes once per kind and releases the probe context', () => {
    let lost = 0;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string) {
      created++;
      return /webgl/.test(type) ? { isContextLost: () => false, getExtension: () => ({ loseContext: () => lost++ }) } : null;
    } as any;
    expect(pool.glSupport('webgl2')).toBe(true);
    expect(pool.glSupport('webgl2')).toBe(true);
    expect(created).toBe(1);
    expect(lost).toBe(1);
  });

  it('uninstall restores getContext and stops counting', () => {
    const before = HTMLCanvasElement.prototype.getContext;
    const un = pool.installGLPool({ maxContexts: 1 });
    expect(HTMLCanvasElement.prototype.getContext).not.toBe(before);
    expect(pool.glPoolStats().installed).toBe(true);
    un();
    expect(HTMLCanvasElement.prototype.getContext).toBe(before);
    expect(pool.glPoolStats()).toMatchObject({ installed: false, live: 0 });
    mountMany(3).forEach((e) => expect(e.gl).toBeTruthy());
  });

  it('lite does not pull the pool in, and the WebGL2 effect probe no longer leaves a context behind', async () => {
    const lite = readFileSync('src/components/lite.ts', 'utf8') + readFileSync('src/components/index.ts', 'utf8');
    expect(lite).not.toMatch(/gl-pool/);
    let lost = 0;
    HTMLCanvasElement.prototype.getContext = function () {
      return { isContextLost: () => false, getExtension: () => ({ loseContext: () => lost++ }) };
    } as any;
    const { supportsWebGL2 } = await import('../src/components/fx2/gl');
    expect(supportsWebGL2()).toBe(true);
    expect(lost).toBe(1);
  });

  it('shader-backdrop and gl-scene show their fallback when their context is lost', () => {
    const sb = readFileSync('src/components/widgets/shader-backdrop.ts', 'utf8');
    const gs = readFileSync('src/components/widgets/gl-scene.ts', 'utf8');
    expect(sb).toMatch(/webglcontextlost/);
    expect(gs).toMatch(/webglcontextlost/);
  });
});
