import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks } from './components-setup';
import { configureComponents } from '../src/components/base';
import { COMPONENT_ITEMS } from '../showcase/catalog-components.js';
import { COMPONENTS, componentSnippets } from '../showcase/components-catalog.js';
import { PREREQS, prereqFor } from '../showcase/catalog/prereqs.js';
import { readFileSync } from 'node:fs';
import * as rt from '../src/runtime';
import { registry } from '../src/runtime/registry';
import * as DS from '../src/runtime/drag-snap';
import * as GA from '../src/runtime/gltf-anim';
import * as GF from '../src/runtime/format-gltf';
import * as GL from '../src/runtime/gl';
import * as VEC from '../src/runtime/vector';
import { defineSnapCarousel } from '../src/components/widgets/snap-carousel';

beforeEach(() => {
  installComponentMocks();
  document.body.innerHTML = '';
  registry().modules.clear();
  defineSnapCarousel();
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  configureComponents({ reducedMotion: 'user' });
});
const fx = (f: string) => new Uint8Array(readFileSync('test/fixtures/formats/' + f));
const close = (a: ArrayLike<number>, b: number[], d = 1e-4) => b.forEach((x, i) => expect(Math.abs(a[i] - x)).toBeLessThan(d));
const tick = (ms: number) => {
  for (let t = 0; t < ms; t += 16) rt.getTicker().step(16);
};
const pe = (type: string, x: number, t: number, id = 1) => {
  const e = new MouseEvent(type, { clientX: x, bubbles: true, cancelable: true });
  Object.defineProperty(e, 'pointerId', { value: id });
  Object.defineProperty(e, 'timeStamp', { value: t });
  return e;
};

describe('10.8 runtime/drag-snap', () => {
  it('pure maths: throw projection, nearest snap, rubber-band, spring, velocity', () => {
    expect(DS.projectThrow(0, 1000, 2000)).toBe(250);
    expect(DS.projectThrow(100, -1000, 2000)).toBe(-150);
    expect(DS.nearestSnap([0, -300, -600], -170)).toBe(1);
    const r1 = DS.rubberband(50, 300), r2 = DS.rubberband(200, 300);
    expect(r1).toBeGreaterThan(0);
    expect(r1).toBeLessThan(50);
    expect(r2).toBeGreaterThan(r1);
    expect(DS.rubberband(-50, 300)).toBeCloseTo(-r1);
    let x = 0, v = 0;
    for (let i = 0; i < 240; i++) [x, v] = DS.springStep(x, v, 100, 1 / 120);
    expect(x).toBeCloseTo(100, 0);
    const vt = DS.velocityTracker();
    vt.add(0, 0);
    vt.add(50, 100);
    vt.add(100, 200);
    expect(vt.velocity(100)).toBe(2000);
    expect(vt.velocity(400)).toBe(0); // finger rested before release
  });
  it('drags, throws, snaps on the shared ticker; a slow drag returns, a flick advances; reduced motion is instant', () => {
    rt.use(DS.dragSnap);
    expect(DS.dragSnap.requires).toEqual(['core']);
    const el = document.createElement('div');
    document.body.append(el);
    const seen: number[] = [], snaps: number[] = [];
    const c = DS.createDragSnap(el, { snap: [0, -300, -600], onUpdate: (p) => seen.push(p), onSnap: (i) => snaps.push(i) });
    expect(el.style.touchAction).toBe('pan-y');
    // slow drag of 120 px → back to 0
    el.dispatchEvent(pe('pointerdown', 500, 0));
    el.dispatchEvent(pe('pointermove', 450, 400));
    el.dispatchEvent(pe('pointermove', 380, 800));
    expect(c.dragging).toBe(true);
    expect(c.position).toBe(-120);
    el.dispatchEvent(pe('pointerup', 380, 1000));
    tick(1500);
    expect(c.position).toBe(0);
    expect(c.index).toBe(0);
    // quick 60 px flick → next point
    el.dispatchEvent(pe('pointerdown', 500, 2000));
    el.dispatchEvent(pe('pointermove', 480, 2020));
    el.dispatchEvent(pe('pointermove', 460, 2040));
    el.dispatchEvent(pe('pointerup', 460, 2045));
    expect(c.moving).toBe(true);
    tick(1500);
    expect(c.index).toBe(1);
    expect(c.position).toBe(-300);
    expect(snaps.at(-1)).toBe(1);
    // past the end: rubber-band, then back to the last point
    c.snapTo(2, false);
    el.dispatchEvent(pe('pointerdown', 500, 5000));
    el.dispatchEvent(pe('pointermove', 300, 5500));
    expect(c.position).toBeLessThan(-600);
    expect(c.position).toBeGreaterThan(-800);
    el.dispatchEvent(pe('pointerup', 300, 5900));
    tick(1500);
    expect(c.position).toBe(-600);
    const r = DS.createDragSnap(document.createElement('div'), { snap: [0, -100], reducedMotion: true });
    r.snapTo(1);
    expect(r.position).toBe(-100);
    expect(r.moving).toBe(false);
    c.dispose();
  });
});

describe('10.8 runtime/gltf-anim (+ format-gltf skin / morph / sparse)', () => {
  it('reads clips and samples LINEAR (slerp) / STEP / CUBICSPLINE channels', async () => {
    const m = await GF.loadGltf(fx('sample-skin.gltf'));
    const [clip] = GA.gltfClips(m);
    expect(clip.name).toBe('bend');
    expect(clip.duration).toBe(2);
    expect(clip.channels.map((c) => c.interpolation)).toEqual(['LINEAR', 'STEP', 'CUBICSPLINE']);
    const [rot, tr, sc] = clip.channels;
    const s45 = Math.sin(Math.PI / 8), c45 = Math.cos(Math.PI / 8);
    close(GA.sampleChannel(rot, 0.5), [0, 0, s45, c45]);
    close(GA.sampleChannel(tr, 0.99), [0, 0, 0]);
    close(GA.sampleChannel(tr, 1), [1, 0, 0]);
    close(GA.sampleChannel(sc, 1), [1.5, 1.5, 1.5]); // Hermite, zero tangents
    close(GA.sampleChannel(sc, 0.5), [1.15625, 1.15625, 1.15625]);
    close(GA.sampleChannel(sc, 9), [2, 2, 2]); // clamped
  });
  it('skins vertices with joint hierarchy + inverse bind matrices (CPU), leaving the source data untouched', async () => {
    const m = await GF.loadGltf(fx('sample-skin.gltf'));
    const skinned = m.find('Skinned')!;
    const g = (skinned.mesh as GL.Mesh[])[0].geometry as any;
    expect(g.deform.joints.length).toBe(24);
    const base = Array.from(g.deform.positions);
    const a = GA.gltfAnimator(m, { clip: 'bend' });
    a.seek(1);
    close(g.positions.subarray(15, 18), [0, 1.5, 0]); // top vertex: bone rotated 90°, root moved +1 x (STEP)
    close(g.positions.subarray(0, 3), [0.5, 0, 0]);
    close(g.positions.subarray(6, 9), [0.75, 0.75, 0]); // 50 / 50 weights
    expect(Array.from(g.deform.positions)).toEqual(base);
    const v = g.version;
    a.update(0.5);
    expect(a.time).toBeCloseTo(1.5);
    expect(g.version).toBe(v + 1);
    a.seek(2.5); // loops
    expect(a.time).toBeCloseTo(0.5);
    expect(m.find('Spinner')!.scale[0]).toBeCloseTo(1.15625);
  });
  it('morph targets: default + animated weights, a sparse target, STEP weights', async () => {
    const m = await GF.loadGltf(fx('sample-morph.gltf'));
    const json = (m.extras as any).gltf;
    const t1 = (m.extras as any).read(json.meshes[0].primitives[0].targets[1].POSITION);
    expect(Array.from(t1)).toEqual([0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0]);
    const node = m.find('Morph')!;
    expect(node.extras.weights).toEqual([0, 0]);
    const g = (node.mesh as GL.Mesh[])[0].geometry;
    const a = GA.gltfAnimator(m, { clip: 'morph', loop: false });
    a.seek(0.5);
    expect(node.extras.weights).toEqual([0.5, 0.25]);
    close(g.positions.subarray(6, 9), [1.25, 1.5, 0]);
    close(g.positions.subarray(0, 3), [0, 0, 0]);
    a.use('pulse');
    a.seek(0.5);
    close(g.positions.subarray(3, 6), [2, 0, 0]);
    a.seek(5);
    expect(a.time).toBe(1);
    expect(GA.gltfAnimator(await GF.loadGltf(fx('motionary-tentacle.glb'))).clips.map((c) => c.name)).toEqual(['wave', 'curl']);
  });
  it('registers after gl + format-gltf; needs a format-gltf model', () => {
    expect(() => rt.use(GA.gltfAnim)).toThrow(/motionary\/runtime\/gl/);
    rt.use(GL.gl, GF.formatGltf, GA.gltfAnim);
    expect(rt.hasModule('gltf-anim')).toBe(true);
    expect(() => GA.gltfClips(new GL.GlNode('x'))).toThrow(/loadGltf/);
  });
});

describe('10.8 runtime/vector: expressions (no eval) + text layers', () => {
  it('evaluates the expression subset and refuses anything else', () => {
    expect(VEC.evalExpression('time * 2', 0, 1.5)).toBe(3);
    expect(VEC.evalExpression('value + [10, 0]', [1, 2])).toEqual([11, 2]);
    expect(VEC.evalExpression('var a = 2; a * value', 4)).toBe(8);
    expect(VEC.evalExpression('$bm_rt = value * 3;', 2)).toBe(6);
    expect(VEC.evalExpression('time > 1 ? 100 : 0', 0, 2)).toBe(100);
    expect(VEC.evalExpression('linear(time, 0, 2, 0, 100)', 0, 1)).toBe(50);
    expect(VEC.evalExpression('ease(time, 0, 2, [0, 0], [100, 50])', 0, 1)).toEqual([50, 25]);
    expect(VEC.evalExpression('Math.round(linear(time, 0, 2, 0, 100)) + "%"', 0, 0.5)).toBe('25%');
    expect(VEC.evalExpression('clamp(value, 0, 10)', [-5, 20])).toEqual([0, 10]);
    const w = [0, 0.4, 0.8, 1.2].map((t) => VEC.evalExpression('wiggle(2, 10)', [50, 50], t));
    w.forEach((p) => p.forEach((x: number) => expect(Math.abs(x - 50)).toBeLessThanOrEqual(10)));
    expect(new Set(w.map((p) => p.join())).size).toBe(4);
    expect(VEC.evalExpression('wiggle(2, 10)', [50, 50], 0.4)).toEqual(w[1]); // deterministic
    for (const bad of ["effect('Slider Control')('Slider')", "eval('1')", 'value.constructor', 'fetch("x")', '{ a: 1 }', 'thisComp.layer("x")'])
      expect(VEC.evalExpression(bad, 1)).toBeUndefined();
  });
  it('loopOut / loopIn: cycle, pingpong, offset, continue (through propValue)', () => {
    const p = (x: string) => ({ a: 1, k: [{ t: 0, s: [0], o: { x: [0], y: [0] }, i: { x: [1], y: [1] } }, { t: 30, s: [90] }], x });
    expect(VEC.propValue(p("loopOut('cycle')"), 50)[0]).toBeCloseTo(60);
    expect(VEC.propValue(p("loopOut('pingpong')"), 50)[0]).toBeCloseTo(30);
    expect(VEC.propValue(p("loopOut('offset')"), 50)[0]).toBeCloseTo(150);
    expect(VEC.propValue(p("loopOut('continue')"), 50)[0]).toBeCloseTo(150);
    expect(VEC.propValue(p('loopOut()'), 20)[0]).toBeCloseTo(60); // inside the keys: the keyframed value
    expect(VEC.propValue({ a: 1, k: [{ t: 10, s: [0], o: { x: [0], y: [0] }, i: { x: [1], y: [1] } }, { t: 40, s: [90] }], x: "loopIn('cycle')" }, 0)[0]).toBeCloseTo(60);
    expect(VEC.propValue({ a: 0, k: 5, x: 'not valid +' }, 0)).toBe(5); // compile error → keyframed value
  });
  it('draws text layers (fonts, justification, box wrapping, stroke, source-text keyframes + expression); inspectLottie lists only real gaps', () => {
    vi.stubGlobal('Path2D', class { moveTo() {} lineTo() {} bezierCurveTo() {} closePath() {} rect() {} addPath() {} arc() {} ellipse() {} });
    const calls: [string, any[]][] = [], state: Record<string, any> = { letterSpacing: '0px', font: '', textAlign: 'start' };
    const fonts: string[] = [];
    const ctx: any = new Proxy(state, {
      get: (s, k: string) => (k in s ? s[k] : k === 'canvas' ? { width: 200, height: 200 } : k === 'getTransform' ? () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }) : k === 'measureText' ? (t: string) => ({ width: t.length * 6 }) : (...a: any[]) => calls.push([k, a])),
      set: (s, k: string, v) => ((s[k] = v), k === 'font' && fonts.push(v), true),
      has: (s, k) => k in s,
    });
    const anim = JSON.parse(readFileSync('test/fixtures/formats/sample-text.json', 'utf8'));
    VEC.renderLottieFrame(ctx, anim, 0);
    const text = (name: string) => calls.filter((c) => c[0] === name).map((c) => c[1][0]);
    expect(text('fillText')).toContain('Motionary');
    expect(text('fillText')).toContain('0%');
    expect(text('fillText').filter((t: string) => /Box|text|wraps|frame/.test(t)).length).toBeGreaterThan(1); // wrapped
    expect(text('strokeText').length).toBeGreaterThan(0);
    expect(fonts).toContain('700 24px "Inter", sans-serif');
    expect(fonts).toContain('italic 400 12px "Georgia", sans-serif');
    calls.length = 0;
    VEC.renderLottieFrame(ctx, anim, 60);
    expect(text('fillText')).toContain('Lottie text');
    expect(text('fillText')).toContain('100%');
    const rep = VEC.inspectLottie(anim);
    expect(rep.unsupported).toContain('expressions outside the supported subset');
    expect(rep.unsupported).not.toContain('text layers');
    expect(VEC.inspectLottie(JSON.parse(readFileSync('showcase/assets/motionary-text.json', 'utf8'))).unsupported).toEqual([]);
  });
});

describe('10.8 <usa-snap-carousel> (own entry point)', () => {
  const layout = () => {
    const saved = (['offsetWidth', 'offsetLeft', 'clientWidth', 'scrollWidth'] as const).map((k) => [k, Object.getOwnPropertyDescriptor(HTMLElement.prototype, k)] as const);
    const idx = (el: Element) => Array.prototype.indexOf.call(el.parentElement?.children || [], el);
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, get() { return this.parentElement?.classList.contains('usa-sc-track') ? 200 : 0; } });
    Object.defineProperty(HTMLElement.prototype, 'offsetLeft', { configurable: true, get() { return this.parentElement?.classList.contains('usa-sc-track') ? idx(this) * 216 : 0; } });
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get() { return this.classList.contains('usa-sc-viewport') ? 300 : 0; } });
    Object.defineProperty(HTMLElement.prototype, 'scrollWidth', { configurable: true, get() { return this.classList.contains('usa-sc-track') ? 5 * 216 - 16 : 0; } });
    return () => saved.forEach(([k, d]) => (d ? Object.defineProperty(HTMLElement.prototype, k, d) : delete (HTMLElement.prototype as any)[k]));
  };
  const html = '<usa-snap-carousel label="Featured"><div>A</div><div>B</div><div>C</div><div>D</div><div>E</div></usa-snap-carousel>';
  it('without the runtime module: clear notice, slides stay a native scroll-snap strip', () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    document.body.innerHTML = html;
    const el = document.querySelector('usa-snap-carousel') as any;
    expect(el.querySelector('.usa-rt-missing')?.textContent).toMatch(/motionary\/runtime\/drag-snap/);
    expect(el.hasAttribute('data-ready')).toBe(false);
    expect(el.querySelectorAll('.usa-sc-track > div').length).toBe(5);
    expect(err).toHaveBeenCalled();
  });
  it('accessible structure, buttons, dots, keys, drag; usa:change; reduced motion jumps', () => {
    const undo = layout();
    try {
      rt.use(DS.dragSnap);
      document.body.innerHTML = html;
      const el = document.querySelector('usa-snap-carousel') as any;
      expect(el.getAttribute('role')).toBe('region');
      expect(el.getAttribute('aria-roledescription')).toBe('carousel');
      const slides = el.querySelectorAll('.usa-sc-track > div');
      expect(slides[2].getAttribute('aria-label')).toBe('3 of 5');
      expect(slides[0].hasAttribute('data-active')).toBe(true);
      expect(el.querySelectorAll('.usa-sc-dot').length).toBe(5);
      expect((el.querySelector('.usa-sc-prev') as HTMLButtonElement).disabled).toBe(true);
      const changes: any[] = [];
      el.addEventListener('usa:change', (e: CustomEvent) => changes.push(e.detail));
      (el.querySelector('.usa-sc-next') as HTMLButtonElement).click();
      tick(1500);
      expect(el.index).toBe(1);
      expect(el.controller.position).toBe(-166); // centred: -(216 - (300 - 200) / 2)
      expect(changes[0]).toEqual({ index: 1, from: 0 });
      expect(el.querySelector('.usa-sc-live').textContent).toBe('Slide 2 of 5');
      el.querySelector('.usa-sc-viewport').dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
      tick(1500);
      expect(el.index).toBe(4);
      expect((el.querySelector('.usa-sc-next') as HTMLButtonElement).disabled).toBe(true);
      const track = el.querySelector('.usa-sc-track');
      track.dispatchEvent(pe('pointerdown', 300, 0));
      track.dispatchEvent(pe('pointermove', 320, 40));
      track.dispatchEvent(pe('pointermove', 340, 80));
      track.dispatchEvent(pe('pointerup', 340, 85));
      tick(1500);
      expect(el.index).toBe(3);
      expect(track.style.transform).toBe('translate3d(-598.00px,0,0)');
      configureComponents({ reducedMotion: 'reduce' });
      document.body.innerHTML = html.replace('label=', 'index="2" label=');
      const r = document.querySelector('usa-snap-carousel') as any;
      expect(r.index).toBe(2);
      r.goTo(0);
      expect(r.controller.position).toBe(50);
    } finally {
      undo();
    }
  });
});

describe('10.8 prerequisites in all five places; bundles unchanged', () => {
  it('cards, Store badges, snippets, docs, README, manifest inputs', () => {
    const sc: any = COMPONENTS.find((c: any) => c.tag === 'usa-snap-carousel');
    expect(sc.requires).toEqual(['drag-snap']);
    expect(componentSnippets(sc).esm).toMatch(/use\(dragSnap\);/);
    expect(componentSnippets(sc).esm).toContain("from 'motionary/components/snap-carousel'");
    expect(prereqFor(sc)!.badge).toBe('Requires: motionary/runtime/drag-snap');
    const gl: any = COMPONENTS.find((c: any) => c.id === 'gl-skinned');
    expect(prereqFor(gl)!.badge).toBe('Requires: motionary/runtime/gl + motionary/runtime/format-gltf + motionary/runtime/format-obj + motionary/runtime/gltf-anim');
    expect(COMPONENT_ITEMS.find((i: any) => i.gallery === 'lottie-text').requiresBadge).toMatch(/motionary\/runtime\/vector/);
    expect(PREREQS['drag-snap'].kind).toBe('runtime');
    expect(PREREQS['gltf-anim'].kind).toBe('runtime');
    for (const d of ['drag-snap', 'gltf-anim']) expect(readFileSync(`docs/runtime/${d}.md`, 'utf8')).toMatch(/## Compatibility/);
    expect(readFileSync('docs/runtime/vector.md', 'utf8')).toMatch(/expressions: time, value, wiggle/);
    expect(readFileSync('README.md', 'utf8')).toContain('`<usa-snap-carousel>` — Requires: motionary/runtime/drag-snap');
    expect(JSON.parse(readFileSync('package.json', 'utf8')).dependencies || {}).toEqual({});
  });
  it('<usa-snap-carousel> is its own entry point and stays out of motionary/components/widgets and /lite', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    expect(pkg.exports['./components/snap-carousel']).toBeTruthy();
    for (const f of ['src/components/widgets/index.ts', 'src/components/index.ts', 'src/components/lite.ts']) expect(readFileSync(f, 'utf8')).not.toMatch(/snap-carousel/);
    const lite = JSON.parse(readFileSync('size-budget.json', 'utf8')).find((e: any) => e.name.includes('components/lite'));
    expect(lite.limit).toBe(70 * 1024);
  });
});
