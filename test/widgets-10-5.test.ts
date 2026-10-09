import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineWidgets } from '../src/components/widgets';
import { COMPONENT_ITEMS } from '../showcase/catalog-components.js';
import { COMPONENTS, componentSnippets } from '../showcase/components-catalog.js';
import { readFileSync } from 'node:fs';
import * as rt from '../src/runtime';
import { registry, register } from '../src/runtime/registry';
import * as G from '../src/runtime/gl';
import { formatObj, parseObj, parseMtl, objToNode, objMaterial } from '../src/runtime/format-obj';
import { formatGltf, parseGlb, gltfToNode, readAccessor } from '../src/runtime/format-gltf';
import { BACKDROP_PRESETS, POST_PASSES } from '../src/components/widgets/shader-backdrop';
import { PARTICLE_SIM_WGSL, PARTICLE_DRAW_WGSL } from '../src/components/widgets/gpu-particles';

beforeEach(() => {
  installComponentMocks();
  document.body.innerHTML = '';
  registry().modules.clear();
  defineWidgets();
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  configureComponents({ reducedMotion: 'user' });
});

const fx = (f: string) => readFileSync(`test/fixtures/formats/${f}`);
const close = (a: ArrayLike<number>, b: number[], d = 1e-4) => b.every((v, i) => Math.abs(a[i] - v) < d);

describe('10.5 runtime/gl (pure parts)', () => {
  it('mat4: compose / invert / multiply / lookAt / perspective', () => {
    const m = G.mat4.compose([1, 2, 3], G.quatFromEuler(0, Math.PI / 2, 0), [2, 2, 2]);
    expect(close(G.mat4.transformPoint(m, [1, 0, 0]), [1, 2, 1])).toBe(true);
    expect(close(G.mat4.multiply(m, G.mat4.invert(m)!), Array.from(G.mat4.identity()))).toBe(true);
    const v = G.mat4.lookAt([0, 0, 5], [0, 0, 0]);
    expect(close(G.mat4.transformPoint(v, [0, 0, 0]), [0, 0, -5])).toBe(true);
    const p = G.mat4.perspective(Math.PI / 2, 1, 1, 10);
    expect(close(G.mat4.transformPoint(p, [0, 0, -1]), [0, 0, -1])).toBe(true);
    expect(G.mat4.invert(new Float32Array(16))).toBeNull();
  });
  it('quaternions: euler, multiply, slerp', () => {
    const a = G.quatFromEuler(0, 0, 0), b = G.quatFromEuler(0, Math.PI, 0);
    const h = G.quatSlerp(a, b, 0.5);
    expect(close(h, G.quatFromEuler(0, Math.PI / 2, 0), 1e-6)).toBe(true);
    expect(close(G.quatMultiply(G.quatFromEuler(0, Math.PI / 2, 0), G.quatFromEuler(0, Math.PI / 2, 0)), b, 1e-6)).toBe(true);
  });
  it('geometry builders, flat normals, bounds and frameNode', () => {
    const b = G.box(2, 1, 1);
    expect([b.positions.length / 3, b.indices!.length]).toEqual([24, 36]);
    expect(G.sphere(1, 8, 4).indices!.length).toBe(8 * 3 * 2 * 3);
    expect(G.torus().positions.length).toBe(49 * 17 * 3);
    expect(G.plane(1, 1, 2, 2).indices!.length).toBe(24);
    const flat = G.computeNormals({ positions: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]) });
    expect(Array.from(flat.normals!.slice(0, 3))).toEqual([0, 0, 1]);
    const n = new G.GlNode('b', { geometry: b, material: G.standardMaterial() });
    n.position = [10, 0, 0];
    const bb = G.bounds(n);
    expect(bb.min).toEqual([9, -0.5, -0.5]);
    const cam = new G.Camera();
    G.frameNode(cam, n);
    expect(cam.target).toEqual([10, 0, 0]);
    expect(Math.hypot(...cam.position.map((v, i) => v - cam.target[i]))).toBeGreaterThan(bb.radius);
  });
  it('scene graph: hierarchy, world matrices, find / traverse; colours', () => {
    const root = new G.GlNode('root'), child = new G.GlNode('child');
    root.add(child);
    root.position = [1, 0, 0];
    child.position = [0, 2, 0];
    root.updateWorld();
    expect(close(child.world.slice(12, 15), [1, 2, 0])).toBe(true);
    expect(root.find('child')).toBe(child);
    expect(G.color('#ff8000')).toEqual([1, 128 / 255, 0, 1]);
    expect(G.color('rgba(255, 0, 0, 0.5)')).toEqual([1, 0, 0, 0.5]);
    expect(G.shaderMaterial('vec4 shade(){return vec4(1);}', { u_k: 1 }).type).toBe('shader');
  });
  it('createRenderer throws a clear error without WebGL2; module needs the core', () => {
    const c: any = { getContext: () => null };
    expect(() => G.createRenderer(c)).toThrow(/WebGL2 is not available/);
    expect(() => register(G.gl)).toThrow(/npm i motionary/);
    rt.use(G.gl, formatGltf, formatObj);
    expect(rt.hasModule('format-gltf')).toBe(true);
  });
  it('orbitControls: drag orbits around the target, keys work, update() damps', () => {
    // jsdom has no PointerEvent: a MouseEvent carrying pointerId is what the controls read
    const PE: any = (globalThis as any).PointerEvent ?? class extends MouseEvent { pointerId: number; constructor(t: string, i: any = {}) { super(t, i); this.pointerId = i.pointerId ?? 0; } };
    const el = document.createElement('div');
    const cam = new G.Camera({ position: [0, 0, 5] });
    const ctl = G.orbitControls(cam, el, { damping: 0.5 });
    el.dispatchEvent(new PE('pointerdown', { pointerId: 1, clientX: 0, clientY: 0 }));
    el.dispatchEvent(new PE('pointermove', { pointerId: 1, clientX: 100, clientY: 0 }));
    ctl.update(16.7);
    expect(Math.hypot(...cam.position)).toBeCloseTo(5, 3);
    expect(cam.position[0]).not.toBeCloseTo(0, 3);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: '+' }));
    ctl.update(16.7);
    expect(Math.hypot(...cam.position)).toBeLessThan(5);
    ctl.dispose();
  });
});

describe('10.5 format-obj', () => {
  it('parses the sample cube (quads, two materials, negative indices, a second object)', () => {
    const o = parseObj(fx('sample-cube.obj').toString());
    expect(o.mtllibs).toEqual(['sample-cube.mtl']);
    expect([o.vertexCount, o.triangleCount]).toEqual([11, 13]);
    expect(o.groups.map((g) => [g.name, g.material, g.geometry.positions.length / 3])).toEqual([['Cube', 'Checker', 18], ['Cube', 'Coral', 18], ['Tri', 'Coral', 3]]);
    expect(o.groups[2].geometry.normals!.slice(0, 3)).toEqual(new Float32Array([0, 0, 1])); // computed
    // last Coral face: -8 -3 -2 -7 → v1 v6 v7 v2
    expect(Array.from(o.groups[1].geometry.positions.slice(12 * 3, 12 * 3 + 3))).toEqual([-0.5, -0.5, 0.5]);
  });
  it('parses MTL and maps it to standard materials + a node per object', () => {
    const m = parseMtl(fx('sample-cube.mtl').toString());
    expect(m.Checker.map_Kd).toBe('sample-checker.png');
    expect(m.Coral.d).toBe(0.9);
    expect(objMaterial(m.Coral).transparent).toBe(true);
    expect(objMaterial(m.Checker).roughness).toBeLessThan(objMaterial(m.Coral).roughness);
    const n = objToNode(parseObj(fx('sample-cube.obj').toString()), m, { 'sample-checker.png': { width: 8, height: 8 } as any });
    expect(n.children.map((c) => [c.name, (c.mesh as any[]).length])).toEqual([['Cube', 2], ['Tri', 1]]);
    expect((n.children[0].mesh as any[])[0].material.map).toBeTruthy();
  });
});

describe('10.5 format-gltf', () => {
  it('reads the self-made GLB: hierarchy, interleaved accessors, strips, normalised UVs, matrix node, PBR material, scenes', () => {
    const { json, bin } = parseGlb(fx('sample-scene.glb'));
    expect(json.asset.version).toBe('2.0');
    expect(Array.from(readAccessor(json, [bin!], 2))).toEqual([0, 1, 1, 1, 1, 0, 0, 0]); // stride 32
    expect(Array.from(readAccessor(json, [bin!], 5))).toEqual([0, 1, 1, 1, 0, 0, 1, 0]); // normalised bytes
    const root = gltfToNode(json, [bin!], { 0: { width: 8, height: 8 } as any });
    expect(root.children.map((c) => c.name)).toEqual(['Quad', 'Matrix']);
    const quad = root.children[0], strip = quad.children[0];
    expect(strip.name).toBe('Strip');
    expect((quad.mesh as any[])[0].material.map).toBeTruthy();
    const sm = (strip.mesh as any[])[0];
    expect(sm.geometry.positions.length / 3).toBe(6); // strip → 2 triangles (flat normals computed)
    expect(sm.material.doubleSided).toBe(true);
    expect(sm.material.metallic).toBe(0.5);
    root.updateWorld();
    expect(close(strip.world.slice(12, 15), [2, 0, 0])).toBe(true);
    expect(close(root.children[1].world.slice(12, 15), [0, 3, 0])).toBe(true);
    expect(gltfToNode(json, [bin!], {}, 1).children.map((c) => c.name)).toEqual(['Strip']);
  });
  it('the .gltf with data: URIs gives the same tree', () => {
    const json = JSON.parse(fx('sample-scene.gltf').toString());
    const b64 = json.buffers[0].uri.split(',')[1];
    const root = gltfToNode(json, [new Uint8Array(Buffer.from(b64, 'base64'))]);
    expect(root.children.map((c) => c.name)).toEqual(['Quad', 'Matrix']);
  });
  it('loads the Khronos sample "Box" (CC-BY 4.0, Cesium) — a unit cube', () => {
    const { json, bin } = parseGlb(fx('khronos-box.glb'));
    const b = G.bounds(gltfToNode(json, [bin!]));
    expect(b.min.map((v) => +v.toFixed(3))).toEqual([-0.5, -0.5, -0.5]);
    expect(b.max.map((v) => +v.toFixed(3))).toEqual([0.5, 0.5, 0.5]);
  });
  it('fails clearly on required extensions it does not implement (Draco / KTX2)', () => {
    expect(() => gltfToNode({ asset: { version: '2.0' }, extensionsRequired: ['KHR_draco_mesh_compression'] }, [])).toThrow(/requires KHR_draco_mesh_compression.*official decoders/);
    expect(() => gltfToNode({ asset: { version: '1.0' } } as any, [])).toThrow(/only glTF 2.0/);
    expect(() => parseGlb(new Uint8Array(12))).toThrow(/not a GLB/);
  });
});

describe('10.5 widgets', () => {
  it('<usa-gl-scene> needs motionary/runtime/gl (clear notice) and reports a missing WebGL2', () => {
    document.body.innerHTML = '<usa-gl-scene></usa-gl-scene>';
    expect(document.querySelector('usa-gl-scene .usa-rt-missing')!.textContent).toContain('use(gl)');
    rt.use(G.gl);
    const errs: string[] = [];
    document.addEventListener('usa:error', (e: any) => errs.push(e.detail.error), { once: true });
    document.body.innerHTML = '<usa-gl-scene label="Donut"></usa-gl-scene>';
    const el = document.querySelector('usa-gl-scene') as any;
    expect(el.querySelector('canvas').getAttribute('aria-label')).toBe('Donut');
    expect(el.dataset.usaBackend).toBe('none'); // jsdom has no WebGL2
    expect(errs[0]).toMatch(/WebGL2/);
  });
  it('<usa-three-scene> (the 10.5 alias) was removed in 11.0 — only <usa-gl-scene> is defined', () => {
    rt.use(G.gl);
    expect(customElements.get('usa-gl-scene')).toBeTruthy();
    expect(customElements.get('usa-three-scene')).toBeUndefined();
  });
  it('<usa-gpu-particles> falls back to Canvas 2D without WebGPU; WGSL splits compute (read_write) and draw (read-only)', () => {
    document.body.innerHTML = '<usa-gpu-particles count="500" mode="galaxy"></usa-gpu-particles>';
    const el = document.querySelector('usa-gpu-particles') as any;
    expect(el.backend).toBe('canvas2d');
    expect(PARTICLE_SIM_WGSL).toMatch(/@compute @workgroup_size\(64\)/);
    expect(PARTICLE_SIM_WGSL).toMatch(/var<storage,read_write>/);
    expect(PARTICLE_DRAW_WGSL).toMatch(/var<storage,read>/);
    expect(PARTICLE_DRAW_WGSL).not.toMatch(/read_write/);
  });
  it('<usa-shader-backdrop> keeps a valid post chain, CSS fallback without WebGL2', () => {
    document.body.innerHTML = '<usa-shader-backdrop preset="plasma" post="bloom, nope, grain"><h4>Hi</h4></usa-shader-backdrop>';
    const el = document.querySelector('usa-shader-backdrop') as any;
    expect(el.dataset.usaBackend).toBe('css');
    expect(el.style.getPropertyValue('--usa-sb-fallback')).toContain('linear-gradient');
    expect(Object.keys(BACKDROP_PRESETS)).toEqual(['aurora', 'plasma', 'waves', 'nebula']);
    expect(Object.keys(POST_PASSES)).toEqual(['bloom', 'vignette', 'grain', 'chromatic', 'pixelate', 'scanlines']);
    expect(el.querySelector('h4').textContent).toBe('Hi');
  });
  it('cards, Store badge, snippets and docs carry the gl prerequisites (+ loaders)', () => {
    const card: any = COMPONENTS.find((c: any) => c.tag === 'usa-gl-scene');
    expect(card.requires).toEqual(['gl', 'format-gltf', 'format-obj', 'gltf-anim']); // 10.8: + gltf-anim for animation
    expect(COMPONENT_ITEMS.find((i: any) => i.gallery === 'gl-scene').requiresBadge).toContain('Requires: motionary/runtime/gl');
    expect(componentSnippets(card).esm).toMatch(/use\(gl, formatGltf, formatObj, gltfAnim\);/);
    for (const id of ['gl', 'format-gltf', 'format-obj']) expect(readFileSync(`docs/runtime/${id}.md`, 'utf8')).toMatch(/## Compatibility[\s\S]*✅ yes/);
    expect(readFileSync('test/fixtures/formats/CREDITS.md', 'utf8')).toMatch(/khronos-box\.glb[\s\S]*CC-BY 4\.0/);
  });
});
