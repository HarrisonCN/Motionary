import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineWidgets } from '../src/components/widgets';
import { COMPONENT_ITEMS } from '../showcase/catalog-components.js';
import { COMPONENTS, componentSnippets } from '../showcase/components-catalog.js';
import { PREREQS, prereqFor } from '../showcase/catalog/prereqs.js';
import { readFileSync, mkdtempSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as rt from '../src/runtime';
import { registry } from '../src/runtime/registry';
import * as GL from '../src/runtime/gl';
import * as GF from '../src/runtime/format-gltf';
import * as GD from '../src/runtime/gltf-decoders';
import * as VEC from '../src/runtime/vector';
import * as LS from '../src/runtime/lottie-state';
import { defineGlModel } from '../src/components/widgets/gl-model';
import { defineDotLottie } from '../src/components/widgets/dotlottie';
import { offscreenRender } from '../src/components/fx2/perf3';
import { PHYSICS_PRESETS } from '../src/components/widgets/physics-playground';

beforeEach(() => {
  installComponentMocks();
  document.body.innerHTML = '';
  registry().modules.clear();
  defineWidgets();
  defineGlModel();
  defineDotLottie();
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  configureComponents({ reducedMotion: 'user' });
});
const fx = (f: string) => new Uint8Array(readFileSync('test/fixtures/formats/' + f));
const flush = (ms = 0) => new Promise((r) => setTimeout(r, ms));

describe('10.9 runtime/lottie-state: dotLottie themes', () => {
  it('resolves slots with the default value or a theme rule (static + keyframed, per animation)', async () => {
    const dl = await VEC.parseDotLottie(fx('sample-states.lottie'));
    expect(Object.keys(dl.themes)).toEqual(['dark']);
    expect(Object.keys(dl.stateMachines)).toEqual(['toggle']);
    const a = dl.animations.pulse as any;
    const fill = (x: any) => x.layers[0].shapes[0].it[1].c;
    expect(fill(LS.applyTheme(a, null)).k).toEqual([0.49, 0.36, 1, 1]);
    expect(fill(LS.applyTheme(a, dl.themes.dark as any)).k).toEqual([1, 0.4, 0.2, 1]);
    expect(fill(a).k).toEqual([0, 0, 0, 1]); // input untouched
    const kf = LS.applyTheme(a, { rules: [{ id: 'accent', type: 'Color', keyframes: [{ frame: 0, value: [1, 0, 0, 1] }, { frame: 30, value: [0, 0, 1, 1] }] }] });
    expect(VEC.propValue(fill(kf), 15)[0]).toBeCloseTo(0.5, 1);
    expect(fill(LS.applyTheme(a, { rules: [{ id: 'accent', type: 'Color', value: [0, 1, 0, 1], animations: ['other'] }] }, 'pulse')).k).toEqual([0.49, 0.36, 1, 1]);
  });
});

describe('10.9 runtime/lottie-state: state machines (subset)', () => {
  it('runs the sample machine: event + numeric guards, interactions, actions, theme action; lists what it skips', async () => {
    const dl = await VEC.parseDotLottie(fx('sample-states.lottie'));
    const def = dl.stateMachines.toggle as any;
    expect(LS.inspectStateMachine(def)).toEqual(['action OpenUrl']);
    const seen: string[] = [], themes: string[] = [];
    const sm = LS.createStateMachine(def, { onState: (s) => seen.push(s.name), onTheme: (t) => themes.push(t) });
    expect(sm.state.name).toBe('idle');
    sm.interact('PointerDown');
    expect(sm.state.name).toBe('playing');
    expect(sm.inputs.clicks).toBe(1);
    sm.interact('PointerDown');
    expect(sm.state.name).toBe('idle');
    sm.interact('PointerDown'); // clicks = 3 → tap → playing → (clicks ≥ 3) → done → SetTheme
    expect(sm.state.name).toBe('done');
    expect(themes).toEqual(['dark']);
    expect(seen).toEqual(['idle', 'playing', 'idle', 'playing', 'done']);
    sm.interact('Click', 'logo'); // OpenUrl is refused: nothing happens
    expect(sm.state.name).toBe('done');
    sm.reset();
    expect(sm.state.name).toBe('idle');
    expect(sm.inputs.clicks).toBe(0);
  });
  it('guards on strings / booleans, global states, actions; no infinite transition loops', () => {
    const sm = LS.createStateMachine({
      initial: 'a',
      inputs: [{ type: 'String', name: 'mode', value: '' }, { type: 'Boolean', name: 'on', value: false }, { type: 'Numeric', name: 'n', value: 5 }],
      states: [
        { name: 'a', transitions: [{ toState: 'b', guards: [{ type: 'String', inputName: 'mode', conditionType: 'Equal', compareTo: 'go' }] }] },
        { name: 'b', entryActions: [{ type: 'Toggle', inputName: 'on' }, { type: 'Decrement', inputName: 'n', value: 2 }], transitions: [{ toState: 'a', guards: [{ type: 'Boolean', inputName: 'on', compareTo: false }] }] },
        { name: 'g', type: 'GlobalState', transitions: [{ toState: 'a', guards: [{ type: 'Event', inputName: 'home' }] }] },
      ],
    });
    sm.set('mode', 'go');
    expect(sm.state.name).toBe('b');
    expect(sm.inputs).toMatchObject({ on: true, n: 3 });
    sm.set('mode', 'stay'); // otherwise a → b fires again right away (its guard still holds)
    sm.fire('home');
    expect(sm.state.name).toBe('a');
    const loop = LS.createStateMachine({ initial: 'x', states: [{ name: 'x', transitions: [{ toState: 'y', guards: [] }] }, { name: 'y', transitions: [{ toState: 'x', guards: [] }] }] });
    loop.set('anything', 1); // bounded, does not hang
    expect(['x', 'y']).toContain(loop.state.name);
    expect(LS.compare(3, 'GreaterThanOrEqual', 3) && LS.compare(2, 'LessThan', 3) && LS.compare('a', 'NotEqual', 'b')).toBe(true);
  });
  it('registers after vector', () => {
    expect(() => rt.use(LS.lottieState)).toThrow(/motionary\/runtime\/vector/);
    rt.use(VEC.vector, LS.lottieState);
    expect(rt.hasModule('lottie-state')).toBe(true);
  });
});

describe('10.9 runtime/gltf-decoders (official decoders)', () => {
  it('decodes a real Draco GLB with the official draco3d decoder (lazy, once)', async () => {
    const loader = vi.fn(() => import('draco3d'));
    GD.provideGltfDecoder('draco', loader);
    expect(GD.providedDecoders()).toContain('draco');
    const m = await GF.loadGltf(fx('sample-draco.glb'), { prepare: GD.prepareGltf });
    const g = ((m.find('DracoCube')!.mesh as GL.Mesh[])[0]).geometry;
    expect(g.positions.length).toBe(72);
    expect(g.normals!.length).toBe(72);
    expect(g.indices!.length).toBe(36);
    const b = GL.bounds(m);
    expect(b.radius).toBeCloseTo(Math.sqrt(3) / 2, 2);
    await GF.loadGltf(fx('sample-draco.glb'), { prepare: GD.prepareGltf });
    expect(loader).toHaveBeenCalledTimes(1);
  }, 30000);
  it('without a provided decoder: clear errors naming the package and the hook', async () => {
    GD.provideGltfDecoder('draco', undefined as any);
    await expect(GF.loadGltf(fx('sample-draco.glb'))).rejects.toThrow(/gl-model|gltf-decoders/);
    const json: any = { asset: { version: '2.0' }, extensionsRequired: ['KHR_texture_basisu'], textures: [{ extensions: { KHR_texture_basisu: { source: 0 } } }], images: [{ bufferView: 0 }], bufferViews: [{ buffer: 0, byteLength: 4 }] };
    await expect(GD.prepareGltf(json, [new Uint8Array(4)])).rejects.toThrow(/basis_transcoder\.js/);
  });
  it('KTX2: transcodes through the Basis Universal API and points the texture at the decoded image', async () => {
    const calls: string[] = [];
    class KTX2File {
      constructor(public b: Uint8Array) {}
      isValid() { return true; }
      getWidth() { return 2; }
      getHeight() { return 2; }
      startTranscoding() { calls.push('start'); return true; }
      getImageTranscodedSizeInBytes() { return 16; }
      transcodeImage(d: Uint8Array, _l: number, _a: number, _f: number, fmt: number) { calls.push('fmt' + fmt); d.fill(200); return true; }
      close() { calls.push('close'); }
      delete() {}
    }
    GD.provideGltfDecoder('ktx2', () => ({ KTX2File, initializeBasis: () => calls.push('init'), transcoder_texture_format: { cTFRGBA32: { value: 13 } } }));
    const json: any = { asset: { version: '2.0' }, extensionsUsed: ['KHR_texture_basisu'], extensionsRequired: ['KHR_texture_basisu'], textures: [{ extensions: { KHR_texture_basisu: { source: 0 } } }], images: [{ bufferView: 0, mimeType: 'image/ktx2' }], bufferViews: [{ buffer: 0, byteLength: 4 }] };
    const r = await GD.prepareGltf(json, [new Uint8Array([1, 2, 3, 4])]);
    expect(calls).toEqual(['init', 'start', 'fmt13', 'close']);
    expect(r.json.textures[0].source).toBe(0);
    expect(r.json.extensionsRequired).toEqual([]);
    expect((r.images[0] as any).width).toBe(2);
    expect(json.extensionsRequired).toEqual(['KHR_texture_basisu']); // input untouched
  });
});

describe('10.9 components (own entry points)', () => {
  const stubCanvas = () => {
    vi.stubGlobal('Path2D', class { moveTo() {} lineTo() {} bezierCurveTo() {} closePath() {} rect() {} addPath() {} arc() {} ellipse() {} });
    const ctx: any = new Proxy({}, { get: (s: any, k: string) => (k in s ? s[k] : k === 'canvas' ? { width: 100, height: 100 } : k === 'getTransform' ? () => ({}) : () => undefined), set: (s, k, v) => ((s[k] = v), true) });
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx);
    const bytes = fx('sample-states.lottie');
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) })));
  };
  it('<usa-dotlottie>: theme + state machine drive the player; pointer + keyboard interactions; usa:state', async () => {
    stubCanvas();
    rt.use(VEC.vector, LS.lottieState);
    document.body.innerHTML = '<usa-dotlottie src="x.lottie" state-machine="toggle" label="Tap"></usa-dotlottie>';
    const el = document.querySelector('usa-dotlottie') as any;
    const states: any[] = [];
    el.addEventListener('usa:state', (e: CustomEvent) => states.push(e.detail));
    for (let i = 0; i < 20 && !el.stateMachine; i++) await flush(5);
    expect(el.state).toBe('idle');
    expect(el.player.timeScale).toBe(0.5);
    const canvas = el.querySelector('canvas');
    expect(canvas.tabIndex).toBe(0);
    canvas.dispatchEvent(new Event('pointerdown'));
    expect(el.state).toBe('playing');
    expect(el.player.timeScale).toBe(2);
    expect(states.at(-1)).toEqual({ state: 'playing', from: 'idle' });
    canvas.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(el.state).toBe('idle');
    canvas.dispatchEvent(new Event('pointerdown'));
    expect(el.state).toBe('done');
    expect(el.animationData.layers[0].shapes[0].it[1].c.k).toEqual([1, 0.4, 0.2, 1]); // SetTheme 'dark' rebuilt the player
    expect(el.dataset.smSkipped).toBe('action OpenUrl');
  });
  it('<usa-dotlottie theme> without a state machine; missing lottie-state shows the notice', async () => {
    stubCanvas();
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    rt.use(VEC.vector);
    document.body.innerHTML = '<usa-dotlottie src="x.lottie" theme="dark"></usa-dotlottie>';
    await flush(30);
    expect(document.querySelector('usa-dotlottie .usa-rt-missing')?.textContent).toMatch(/motionary\/runtime\/lottie-state/);
    expect(err).toHaveBeenCalled();
    registry().modules.clear();
    rt.use(VEC.vector, LS.lottieState);
    document.body.innerHTML = '<usa-dotlottie src="x.lottie" theme="dark"></usa-dotlottie>';
    const el = document.querySelector('usa-dotlottie') as any;
    for (let i = 0; i < 20 && !el.animationData; i++) await flush(5);
    expect(el.animationData.layers[0].shapes[0].it[1].c.k).toEqual([1, 0.4, 0.2, 1]);
  });
  it('<usa-gl-model> asks for motionary/runtime/gltf-decoders; it is <usa-gl-scene> otherwise', () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    rt.use(GL.gl, GF.formatGltf);
    document.body.innerHTML = '<usa-gl-model src="m.glb"></usa-gl-model>';
    const el = document.querySelector('usa-gl-model') as any;
    expect(el.querySelector('.usa-rt-missing')?.textContent).toMatch(/motionary\/runtime\/gltf-decoders/);
    expect(el instanceof (customElements.get('usa-gl-scene') as any)).toBe(true);
    expect(err).toHaveBeenCalled();
  });
});

describe('10.9 deprecations for 11.0 + usa-codemod-11', () => {
  it('11.0 removed what 10.9 deprecated: no <usa-three-scene>, string programs refused on the main thread', () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    rt.use(GL.gl);
    expect(customElements.get('usa-three-scene')).toBeUndefined();
    const c = document.createElement('canvas');
    const ctx2: any = { clearRect() {}, fillRect() {} };
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx2);
    const r = offscreenRender(c, '(ctx) => ctx.clearRect(0, 0, 1, 1)', { worker: false, paused: true });
    expect(r.backend).toBe('none');
    expect(err.mock.calls.some((x) => /string program.*11\.0/.test(String(x[0])))).toBe(true);
    const f = offscreenRender(c, (ctx) => ctx.clearRect(0, 0, 1, 1), { worker: false, paused: true });
    expect(f.backend).toBe('main');
  });
  it('codemod-11 rewrites the alias and flags string programs', async () => {
    const mod: any = await import('../bin/usa-codemod-11.mjs');
    const r = mod.transform("import { defineThreeScene } from 'motionary/components/widgets';\ndefineThreeScene();\nconst x = `<usa-three-scene src=\"a.glb\"></usa-three-scene>`;\noffscreenRender(c, 'ctx => 1');");
    expect(r.code).toContain('defineGlScene();');
    expect(r.code).toContain('<usa-gl-scene src="a.glb"></usa-gl-scene>');
    expect(r.code).not.toMatch(/three-scene|ThreeScene/);
    expect(r.manual.length).toBe(1);
    expect(mod.transform('<usa-three-scene-x>').changes).toEqual([]);
    expect(JSON.parse(readFileSync('package.json', 'utf8')).bin['usa-codemod-11']).toBe('./bin/usa-codemod-11.mjs');
    expect(readFileSync('docs/upgrading-11.md', 'utf8')).toMatch(/usa-codemod-11/);
    expect(readFileSync('docs/deprecations.md', 'utf8')).toMatch(/Deprecated in 10\.9, removed in 11\.0/);
  });
});

describe('10.9 manifest schema v2 + scene schema', () => {
  it('the generated manifest is schema v2 and validates against its JSON Schema', async () => {
    const m = JSON.parse(execFileSync(process.execPath, ['scripts/gen-manifest.mjs', '--stdout'], { maxBuffer: 64 << 20 }).toString());
    expect(m.schemaVersion).toBe(2);
    expect(m.stability).toBe('stable'); // 11.0: schema v2 frozen
    expect(m.components.find((c: any) => c.tag === 'usa-three-scene')).toBeUndefined(); // removed in 11.0
    expect(m.components.find((c: any) => c.tag === 'usa-gl-scene').stability).toBe('stable');
    expect(m.runtimeModules.find((p: any) => p.id === 'draco3d')).toMatchObject({ kind: 'peer', optional: true });
    expect(m.runtimeModules.find((p: any) => p.id === 'lottie-state')).toMatchObject({ kind: 'runtime', optional: false });
    const { default: Ajv } = await import('ajv/dist/2020.js');
    const ajv = new (Ajv as any)({ strict: false, allErrors: true });
    const ok = ajv.validate(JSON.parse(readFileSync('scripts/manifest.schema.json', 'utf8')), m);
    expect(ajv.errors || []).toEqual([]);
    expect(ok).toBe(true);
  });
  it('every physics preset validates against the published motionary-scene@1 JSON Schema', async () => {
    const { default: Ajv } = await import('ajv/dist/2020.js');
    const ajv = new (Ajv as any)({ strict: false });
    const v = ajv.compile(JSON.parse(readFileSync('docs/schemas/motionary-scene-1.schema.json', 'utf8')));
    for (const p of Object.keys(PHYSICS_PRESETS)) expect(v(PHYSICS_PRESETS[p]()), p + JSON.stringify(v.errors)).toBe(true);
    expect(v({ format: 'motionary-scene@1', world: { width: 1, height: 1 }, bodies: [{ id: 'a', shape: 'hexagon', position: [0, 0] }] })).toBe(false);
  });
});

describe('10.9 prerequisites in all five places; entries; audit', () => {
  it('cards, Store badges, snippets, docs, README', () => {
    const dl: any = COMPONENTS.find((c: any) => c.tag === 'usa-dotlottie');
    expect(dl.requires).toEqual(['vector', 'lottie-state']);
    expect(componentSnippets(dl).esm).toMatch(/use\(vector, lottieState\);/);
    const gm: any = COMPONENTS.find((c: any) => c.tag === 'usa-gl-model');
    expect(prereqFor(gm)!.badge).toBe('Requires: motionary/runtime/gl + motionary/runtime/format-gltf + motionary/runtime/gltf-decoders + draco3d + basis_transcoder.js');
    expect(prereqFor(gm)!.install).toContain('npm i draco3d');
    expect(componentSnippets(gm).esm).toContain("provideGltfDecoder('draco', () => import('draco3d'));");
    expect(COMPONENT_ITEMS.find((i: any) => i.gallery === 'gl-model').requiresBadge).toMatch(/draco3d/);
    expect(PREREQS.draco3d.kind).toBe('peer');
    for (const d of ['lottie-state', 'gltf-decoders', 'draco3d', 'basis-transcoder']) expect(readFileSync(`docs/runtime/${d}.md`, 'utf8')).toMatch(/## Compatibility/);
    expect(readFileSync('README.md', 'utf8')).toContain('`<usa-gl-model>` — Requires: motionary/runtime/gl');
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    expect(pkg.dependencies || {}).toEqual({});
    expect(pkg.peerDependenciesMeta.draco3d.optional).toBe(true);
    for (const e of ['gl-model', 'dotlottie']) expect(pkg.exports[`./components/${e}`]).toBeTruthy();
    for (const f of ['src/components/widgets/index.ts', 'src/components/index.ts', 'src/components/lite.ts']) expect(readFileSync(f, 'utf8')).not.toMatch(/gl-model|dotlottie/);
    expect(JSON.parse(readFileSync('size-budget.json', 'utf8')).find((e: any) => e.name.includes('components/lite')).limit).toBe(70 * 1024);
    expect(readFileSync('docs/audit-10.9.md', 'utf8')).toMatch(/## Security[\s\S]*## API consistency/);
  });
});
