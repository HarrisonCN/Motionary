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
import * as P from '../src/runtime/physics';
import * as S from '../src/runtime/format-scene';
import { describeMotion, motionSnippet } from '../src/components/ai';
import { PHYSICS_PRESETS } from '../src/components/widgets/physics-playground';

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
const flush = (ms = 0) => new Promise((r) => setTimeout(r, ms));

describe('10.7 runtime/physics', () => {
  it('bodies fall, rest on the floor, settle and sleep; a box stack stays upright', () => {
    const w = P.createWorld();
    w.bounds(400, 300);
    const box = w.body({ x: 200, y: 50, width: 40, height: 40, angle: 0.3 });
    const ball = w.body({ shape: 'circle', x: 100, y: 50, radius: 15, restitution: 0.8 });
    const w2 = P.createWorld(); // the stack gets its own world so the rolling ball cannot knock it
    w2.bounds(400, 300);
    const stack = Array.from({ length: 5 }, (_, i) => w2.body({ x: 320, y: 280 - i * 40.5, width: 40, height: 40 }));
    for (let i = 0; i < 600; i++) w.step(1 / 60), w2.step(1 / 60);
    expect(box.position.y).toBeGreaterThan(270);
    expect(box.position.y).toBeLessThan(285);
    expect(Math.abs(Math.sin(2 * box.angle))).toBeLessThan(0.05); // resting on a face
    expect(ball.position.y).toBeCloseTo(285, -1);
    for (const [i, b] of stack.entries()) {
      expect(Math.abs(b.position.x - 320)).toBeLessThan(3);
      expect(b.position.y).toBeCloseTo(280 - i * 40, -1);
    }
    expect(w2.energy()).toBeLessThan(1);
    expect(stack.every((b) => b.sleeping)).toBe(true);
    expect(box.sleeping).toBe(true);
  });
  it('pin constraints keep a pendulum length; drag constraints pull a body; sensors only report', () => {
    const w = P.createWorld({ gravity: [0, 980] });
    const bob = w.body({ shape: 'circle', x: 300, y: 50, radius: 10 });
    w.constraint({ type: 'pin', a: bob, point: [200, 50], length: 100 });
    let min = 1e9, max = 0;
    for (let i = 0; i < 300; i++) {
      w.step(1 / 60);
      const L = Math.hypot(bob.position.x - 200, bob.position.y - 50);
      (min = Math.min(min, L)), (max = Math.max(max, L));
    }
    expect(min).toBeGreaterThan(95);
    expect(max).toBeLessThan(105);
    const w2 = P.createWorld({ gravity: [0, 0] });
    const b = w2.body({ x: 0, y: 0, width: 20, height: 20 });
    const d = P.dragConstraint(w2, b, 0, 0);
    d.move(100, 0);
    for (let i = 0; i < 120; i++) w2.step();
    expect(b.position.x).toBeGreaterThan(80);
    d.release();
    expect(w2.constraints.length).toBe(0);
    const w3 = P.createWorld();
    w3.bounds(200, 200);
    const s = w3.body({ type: 'static', x: 100, y: 100, width: 200, height: 20, sensor: true });
    const fall = w3.body({ shape: 'circle', x: 100, y: 20, radius: 8 });
    const hits: string[] = [];
    w3.onCollision((m) => hits.push([m.a, m.b].includes(s) ? 'sensor' : 'solid'));
    for (let i = 0; i < 200; i++) w3.step();
    expect(hits).toContain('sensor');
    expect(fall.position.y).toBeGreaterThan(150); // passed through the sensor
  });
  it('is deterministic (fixed step) and convex-izes polygons', () => {
    const run = () => {
      const w = P.createWorld({ sleeping: false });
      w.bounds(300, 300, 50, { top: false });
      const bs = Array.from({ length: 20 }, (_, i) => (i % 2 ? w.body({ shape: 'circle', x: 30 + ((i * 37) % 240), y: 20 - i * 25, radius: 12 }) : w.body({ x: 30 + ((i * 53) % 240), y: 20 - i * 25, width: 24, height: 18, angle: i })));
      for (let i = 0; i < 400; i++) w.update(1 / 60);
      return bs.map((b) => [b.position.x.toFixed(3), b.position.y.toFixed(3)].join()).join('|');
    };
    expect(run()).toBe(run());
    const tri = new P.Body({ vertices: [[0, 0], [20, 30], [40, 0]], x: 0, y: 0 });
    expect(tri.verts.length).toBe(3);
    expect(tri.mass).toBeGreaterThan(0);
  });
  it('the module needs the core and registers with use(physics)', () => {
    expect(P.physics.id).toBe('physics');
    expect(P.physics.requires).toEqual(['core']);
    rt.use(P.physics, S.formatScene);
    expect(rt.hasModule('physics') && rt.hasModule('format-scene')).toBe(true);
  });
});

describe('10.7 runtime/format-scene (motionary-scene@1)', () => {
  const scene = () => PHYSICS_PRESETS.pendulum() as any;
  it('validates (lists every problem, never throws) and parses', () => {
    expect(S.validateScene(scene())).toEqual([]);
    const bad = { format: 'motionary-scene@1', world: { width: -1, height: 100 }, bodies: [{ id: 'a', shape: 'hexagon', position: [0] }, { id: 'a', shape: 'circle', position: [0, 0] }], constraints: [{ type: 'distance', a: 'nope' }] };
    const probs = S.validateScene(bad);
    expect(probs.length).toBeGreaterThanOrEqual(4);
    expect(() => S.parseScene(bad)).toThrow(/problem/);
  });
  it('migrates an unversioned / @0 scene to @1 and reports the changes', () => {
    const { scene: s, changes } = S.migrateScene({ world: { width: 300, height: 200 }, bodies: [{ id: 'b', shape: 'circle', radius: 5, position: [10, 10] }] });
    expect(s.format).toBe(S.SCENE_FORMAT);
    expect(changes.length).toBeGreaterThan(0);
  });
  it('loads into a physics world and saves back (round trip)', () => {
    rt.use(P.physics, S.formatScene);
    const { world, bodies } = S.sceneToWorld(scene());
    expect(Object.keys(bodies)).toEqual(['bob-0', 'bob-1', 'bob-2', 'bob-3', 'bob-4']);
    expect(world.constraints.length).toBe(5);
    for (let i = 0; i < 30; i++) world.step();
    const saved = S.worldToScene(world, { width: 600, height: 360, walls: true });
    expect(S.validateScene(saved)).toEqual([]);
    expect(saved.bodies.map((b: any) => b.id)).toEqual(Object.keys(bodies));
    expect(saved.bodies.every((b: any) => !String(b.id).startsWith('wall') && b.id !== 'floor')).toBe(true);
    for (const p of Object.keys(PHYSICS_PRESETS)) expect(S.validateScene(PHYSICS_PRESETS[p]())).toEqual([]);
  });
});

describe('10.7 AI-assisted motion (motionary/components/ai)', () => {
  it('passes the evaluation set (≥ 90 % of prompts fully right, English + Chinese)', () => {
    const ev = JSON.parse(readFileSync('test/fixtures/ai-eval.json', 'utf8'));
    const chk = (v: any, e: any) => (typeof e === 'string' && /^(>=|<=|>|<)/.test(e) ? new Function('v', `return v ${e}`)(v) : e === 'infinite' ? v === Infinity : v === e);
    const misses = ev.cases.filter((c: any) => Object.entries(c.expect).some(([k, e]) => !chk((describeMotion(c.text) as any)[k], e))).map((c: any) => c.text);
    expect(ev.cases.length).toBeGreaterThanOrEqual(30);
    expect(misses.length / ev.cases.length).toBeLessThanOrEqual(0.1);
  });
  it('produces valid keyframes, a reduced-motion-guarded CSS rule and component suggestions', () => {
    const i = describeMotion('slide in from the left on scroll, one after another');
    expect(i.effect).toBe('slide');
    expect(i.direction).toBe('right');
    expect(String(i.keyframes[0].transform)).toMatch(/translate\(-\d+px/);
    expect(i.css).toMatch(/prefers-reduced-motion/);
    expect(motionSnippet(i, 'waapi')).toMatch(/prefers-reduced-motion/);
    expect(motionSnippet(i, 'component')).toMatch(/<usa-/);
    expect(describeMotion('asdf qwer').confidence).toBeLessThan(0.5);
  });
});

describe('10.7 widgets', () => {
  it('<usa-physics-playground> without the runtime modules shows the clear notice', () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    document.body.innerHTML = '<usa-physics-playground></usa-physics-playground>';
    expect(document.querySelector('usa-physics-playground .usa-rt-missing')?.textContent).toMatch(/motionary\/runtime\/physics/);
    expect(err).toHaveBeenCalled();
  });
  it('<usa-physics-playground> loads a preset / an inline scene, steps, saves; reduced motion settles off-screen', async () => {
    rt.use(P.physics, S.formatScene);
    document.body.innerHTML = '<usa-physics-playground preset="pyramid" label="Pyramid"></usa-physics-playground>';
    const el = document.querySelector('usa-physics-playground') as any;
    expect(Object.keys(el.bodies).length).toBe(22);
    expect(el.querySelector('canvas').getAttribute('aria-label')).toBe('Pyramid');
    expect(el.toScene().format).toBe('motionary-scene@1');
    el.pause();
    expect(el.hasAttribute('paused')).toBe(true);
    const loaded = vi.fn();
    document.body.addEventListener('usa:load', loaded);
    document.body.innerHTML = `<usa-physics-playground><script type="application/json">${JSON.stringify({ format: 'motionary-scene@1', world: { width: 200, height: 200, walls: true }, bodies: [{ id: 'ball', shape: 'circle', radius: 10, position: [100, 20] }] })}</script></usa-physics-playground>`;
    expect(loaded).toHaveBeenCalled();
    configureComponents({ reducedMotion: 'reduce' });
    document.body.innerHTML = '<usa-physics-playground preset="balls"></usa-physics-playground>';
    const r = document.querySelector('usa-physics-playground') as any;
    expect(r.world.steps).toBeGreaterThanOrEqual(240);
    expect(Object.values(r.bodies).every((b: any) => b.position.y > 0 && b.position.y < 360)).toBe(true);
  });
  it('<usa-motion-prompt> suggests on submit, switches code formats, copies', async () => {
    document.body.innerHTML = '<usa-motion-prompt value="bounce the button on hover"></usa-motion-prompt>';
    const el = document.querySelector('usa-motion-prompt') as any;
    expect(el.intent.effect).toBe('bounce');
    expect(el.querySelector('.usa-mp-summary').textContent).toMatch(/bounce/);
    const sug = vi.fn();
    el.addEventListener('usa:suggest', sug);
    (el.querySelector('.usa-mp-input') as HTMLInputElement).value = '卡片从下往上依次淡入';
    el.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true }));
    expect(sug).toHaveBeenCalled();
    expect(el.intent.direction).toBe('up');
    (el.querySelector('.usa-mp-tabs [data-fmt="css"]') as HTMLButtonElement).click();
    expect(el.querySelector('.usa-mp-code').textContent).toMatch(/@keyframes/);
    const copy = vi.fn();
    el.addEventListener('usa:copy', copy);
    (el.querySelector('.usa-mp-copy') as HTMLButtonElement).click();
    expect(copy.mock.calls[0][0].detail.format).toBe('css');
  });
});

describe('10.7 prerequisites in all five places', () => {
  it('cards, Store badges, snippets, docs', () => {
    const pg: any = COMPONENTS.find((c: any) => c.tag === 'usa-physics-playground');
    expect(pg.requires).toEqual(['physics', 'format-scene']);
    expect(componentSnippets(pg).esm).toMatch(/use\(physics, formatScene\);/);
    expect(prereqFor(pg)!.badge).toBe('Requires: motionary/runtime/physics + motionary/runtime/format-scene');
    expect(PREREQS.physics.kind).toBe('runtime');
    expect(COMPONENT_ITEMS.find((i: any) => i.gallery === 'physics-playground').requiresBadge).toMatch(/motionary\/runtime\/physics/);
    expect(readFileSync('docs/runtime/physics.md', 'utf8')).toMatch(/## Compatibility/);
    expect(readFileSync('docs/runtime/format-scene.md', 'utf8')).toMatch(/motionary-scene@1/);
    expect(readFileSync('README.md', 'utf8')).toContain('`<usa-physics-playground>` — Requires: motionary/runtime/physics');
    const mp: any = COMPONENTS.find((c: any) => c.tag === 'usa-motion-prompt');
    expect(mp.requires || []).toEqual([]);
    expect(JSON.parse(readFileSync('package.json', 'utf8')).dependencies || {}).toEqual({});
  });
});

describe('10.7 motionary-mcp 2.0', () => {
  const dir = mkdtempSync(join(tmpdir(), 'mcp2-'));
  const manifest = join(dir, 'manifest.json');
  writeFileSync(manifest, execFileSync(process.execPath, ['scripts/gen-manifest.mjs', '--stdout'], { maxBuffer: 64 << 20 }));
  const aiBundle = join(dir, 'ai.mjs');
  it('suggest_motion + validate_snippet over stdio with the official MCP SDK client', async () => {
    // esbuild refuses to run inside jsdom (TextEncoder realm check), so bundle the parser in a child process
    execFileSync('node_modules/.bin/esbuild', ['src/components/ai/index.ts', '--bundle', '--format=esm', `--outfile=${aiBundle}`, '--log-level=warning']);
    const { Client } = await import('@modelcontextprotocol/sdk/client/index.js');
    const { StdioClientTransport } = await import('@modelcontextprotocol/sdk/client/stdio.js');
    const client = new Client({ name: 'motionary-test', version: '1.0.0' });
    await client.connect(new StdioClientTransport({ command: process.execPath, args: ['bin/motionary-mcp.mjs'], env: { ...process.env, MOTIONARY_MANIFEST: manifest, MOTIONARY_AI: aiBundle } as Record<string, string> }));
    expect(client.getServerVersion()?.version).toBe('2.0.0');
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name)).toEqual(['list_components', 'search_components', 'get_component', 'get_example', 'scaffold_snippet', 'suggest_motion', 'validate_snippet', 'check_compat']);
    expect(tools.every((t) => t.annotations?.readOnlyHint === true)).toBe(true);
    const s: any = await client.callTool({ name: 'suggest_motion', arguments: { text: 'fade the cards up when they scroll into view, one after another', format: 'css' } });
    expect(s.structuredContent.effect).toBe('fade');
    expect(s.structuredContent.trigger).toBe('scroll');
    expect(s.structuredContent.code).toMatch(/@keyframes[\s\S]*prefers-reduced-motion/);
    expect(s.structuredContent.components.map((c: any) => c.tag)).toContain('usa-stagger');
    const good: any = await client.callTool({ name: 'scaffold_snippet', arguments: { tags: ['usa-physics-playground', 'usa-rive'], framework: 'esm' } });
    const code = good.structuredContent.code;
    expect(good.structuredContent.prerequisites).toEqual(['motionary/runtime/physics', 'motionary/runtime/format-scene', '@rive-app/canvas']);
    expect(code).toContain("provideRiveRuntime(() => import('@rive-app/canvas'));");
    expect(code).not.toContain('motionary/runtime/rive');
    const v1: any = await client.callTool({ name: 'validate_snippet', arguments: { code } });
    expect(v1.structuredContent).toMatchObject({ valid: true, errors: [] });
    const v2: any = await client.callTool({ name: 'validate_snippet', arguments: { code: "import { definePhysicsPlayground } from 'motionary/components/widgets';\ndefinePhysicsPlayground();\n// <usa-physics-playground presett=\"balls\"></usa-physics-playground> <usa-lottie-playr></usa-lottie-playr>" } });
    expect(v2.structuredContent.valid).toBe(false);
    expect(v2.structuredContent.errors.join('\n')).toMatch(/requires motionary\/runtime\/physics/);
    expect(v2.structuredContent.errors.join('\n')).toMatch(/unknown component <usa-lottie-playr> — did you mean <usa-lottie-player>/);
    expect(v2.structuredContent.warnings.join('\n')).toMatch(/no attribute "presett"/);
    const v3: any = await client.callTool({ name: 'validate_snippet', arguments: { code: "import { use } from 'motionary/runtime';\nimport { physics } from 'motionary/runtime/physics';\nimport { formatScene } from 'motionary/runtime/format-scene';\nimport { definePhysicsPlayground } from 'motionary/components/widgets';\ndefinePhysicsPlayground();\nuse(physics, formatScene);" } });
    expect(v3.structuredContent.errors.join('\n')).toBe('');
    const v4: any = await client.callTool({ name: 'validate_snippet', arguments: { code: "import { use } from 'motionary/runtime';\nimport { physics } from 'motionary/runtime/physics';\nimport { formatScene } from 'motionary/runtime/format-scene';\nimport { definePhysicsPlayground } from 'motionary/components/widgets';\ndefinePhysicsPlayground();\nuse(physics, formatScene);\n// <usa-physics-playground></usa-physics-playground>" } });
    expect(v4.structuredContent.errors.join('\n')).toMatch(/use\(physics\) runs after <usa-physics-playground>/);
    const raw: any = await client.callTool({ name: 'validate_snippet', arguments: { code: "<div class=x></div><script>document.querySelector('.x').animate([{opacity:0},{opacity:1}],300)</script>" } });
    expect(raw.structuredContent.warnings.join()).toMatch(/prefers-reduced-motion/);
    await client.close();
  }, 60000);
  it('suggest_motion without the AI module is a clear tool error; the server stays read-only', async () => {
    const mod: any = await import('../bin/motionary-mcp.mjs');
    const m = JSON.parse(readFileSync(manifest, 'utf8'));
    mod.setAi(null);
    const r = mod.handle(m, { jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'suggest_motion', arguments: { text: 'fade in' } } });
    expect(r.result.isError).toBe(true);
    expect(r.result.content[0].text).toMatch(/MOTIONARY_AI|dist\/components\/ai/);
    expect(mod.TOOLS.every((t: any) => t.annotations.destructiveHint === false)).toBe(true);
    expect(readFileSync('bin/motionary-mcp.mjs', 'utf8')).not.toMatch(/writeFile|child_process|fetch\(/);
  });
});
