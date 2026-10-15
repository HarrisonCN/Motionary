// 14.6.0 — motionary-mcp 2.2: the 13.7 tools take a Scene v2 document (additive; every 13.7 argument and result field
// unchanged). check_compatibility { scene } checks the components a scene binds; suggest_fix { scene } answers with
// Scene v2 fix ops (applyCanvasOps format); validate_snippet { scene, ops? } validates schema + compatibility + a
// headless render (browser: true | 'auto' renders it in a real headless browser when Playwright is available);
// suggest_motion { format: 'scene' } turns a description into a Scene v2 document. All read-only, no network.
import { describe, it, expect } from 'vitest';
import { join } from 'node:path';

const ROOT = join(__dirname, '..');
const BIN = process.env.MOTIONARY_MCP_BIN || join(ROOT, 'bin/motionary-mcp.mjs');
const M: any = await import(BIN);
const m = M.loadManifest(join(ROOT, 'dist/manifest.json'));
// (loadAi / loadStudioAi use a Function-wrapped import that vitest cannot run — hand the modules in, as the 10.7 test does)
M.setAi(await import(join(ROOT, 'dist/components/ai.js')));
M.setStudioAi(await import(join(ROOT, 'dist/components/studio-ai.js')));
expect(typeof M.loadStudioAi).toBe('function');
const call = async (name: string, args: any) => (await M.callTool(m, name, args)).structuredContent;

const scene = (component?: any) => ({
  format: 'motionary-scene', version: 2,
  layers: [
    { id: 'title', type: 'track', target: '#title', keyframes: [{ id: 'k1', time: 0, props: { opacity: 0 } }, { id: 'k2', time: 400, props: { opacity: 1 } }] },
    { id: 'n', type: 'track', target: '#n', keyframes: [], ...(component ? { component } : {}) },
  ],
});

describe('14.6 tool contracts (additive)', () => {
  it('server 2.2; check_compatibility / suggest_fix / validate_snippet / suggest_motion accept scene inputs, old required args unchanged in meaning', () => {
    expect(M.SERVER_INFO.version).toMatch(/^(?:2\.(?:[2-9]|\d\d)|(?:[3-9]|\d\d)\.\d+)\.\d+$/); // 14.8: 2.3 is additive; 16.0: 3.0
    const t = (n: string) => M.TOOLS.find((x: any) => x.name === n);
    expect(t('check_compatibility').inputSchema.properties.scene).toBeTruthy();
    expect(t('suggest_fix').inputSchema.properties.scene).toBeTruthy();
    // 16.0 (MCP 3.0): validate_snippet is code only; its scene / ops inputs moved to validate_scene
    expect(t('validate_snippet').inputSchema.properties.scene).toBeUndefined();
    expect(t('validate_scene').inputSchema.properties.ops).toBeTruthy();
    expect(t('suggest_motion').inputSchema.properties.format.enum).toEqual(['waapi', 'css', 'component', 'scene']);
    for (const n of ['check_compatibility', 'suggest_fix', 'validate_snippet', 'validate_scene']) expect(t(n).annotations.readOnlyHint).toBe(true);
    // 15.9 (MCP 2.5) added validate_scene as the 3.0 home of validate_snippet { scene } (16.0: the only one)
    expect(M.TOOLS.map((x: any) => x.name).indexOf('validate_scene')).toBeGreaterThan(M.TOOLS.map((x: any) => x.name).indexOf('propose_edit'));
  });
  it('suggest_fix / validate_snippet still need code when no scene is given', async () => {
    await expect(Promise.resolve().then(() => M.callTool(m, 'suggest_fix', {}))).rejects.toThrow(/code/);
    await expect(Promise.resolve().then(() => M.callTool(m, 'validate_snippet', {}))).rejects.toThrow(/code/);
  });
});

describe('14.6 check_compatibility { scene }', () => {
  it('checks the components a scene binds against the installed version', async () => {
    const ok = await call('check_compatibility', { scene: scene({ tag: 'usa-counter', props: { duration: 600 } }) });
    expect(ok.compatible).toBe(true);
    expect(ok.components.map((c: any) => c.tag)).toEqual(['usa-counter']);
    const bad = await call('check_compatibility', { scene: scene({ tag: 'usa-countr', props: {} }) });
    expect(bad.compatible).toBe(false);
    const newer = m.components.find((c: any) => c.since && Number(String(c.since).split('.')[0]) >= 3);
    const old = await call('check_compatibility', { scene: scene({ tag: newer.tag, props: {} }), version: '2.0.0' });
    expect(old.compatible).toBe(false);
  });
});

describe('14.6 suggest_fix { scene }', () => {
  it('answers with Scene v2 fix ops (applyCanvasOps format) and the fixed scene', async () => {
    const r = await call('suggest_fix', { scene: scene({ tag: 'usa-countr', props: { to: 9 } }) });
    expect(r.schema).toBe('motionary-mcp/suggest_fix@1');
    expect(r.sceneFixes).toContainEqual({ op: 'set-component', layer: 'n', component: { tag: 'usa-counter', props: { to: 9 } } });
    expect(r.fixedScene.layers[1].component.tag).toBe('usa-counter');
    expect(r.valid).toBe(true);
  });
});

describe('14.6 validate_snippet { scene, ops } (16.0: validate_scene)', () => {
  it('valid scene + ops → schema, compatibility and render pass; the input scene is not modified', async () => {
    const s = scene();
    const r = await call('validate_scene', { scene: s, ops: [{ op: 'add-keyframe', layer: 'n', keyframe: { id: 'n1', time: 0, props: { opacity: '0' } } }] });
    expect(r.schema).toBe('motionary-mcp/validate_scene@1');
    expect(r.valid).toBe(true);
    expect(r.problems).toEqual([]);
    expect(r.render.ok).toBe(true);
    expect(r.mode).toBe('static');
    expect(s.layers[1].keyframes).toEqual([]);
  });
  it('reports invalid ops, schema problems and unsafe model values; never throws on junk', async () => {
    const a = await call('validate_scene', { scene: scene(), ops: [{ op: 'set-props', layer: 'nope', keyframe: 'k', props: { opacity: '1' } }] });
    expect(a.valid).toBe(false);
    const b = await call('validate_scene', { scene: { format: 'motionary-scene', version: 2, layers: [{ id: 'x', type: 'blob' }] } });
    expect(b.valid).toBe(false);
    expect(b.problems[0].path).toMatch(/layers\[0\]/);
    const c = await call('validate_scene', { scene: scene(), ops: [{ op: 'set-props', layer: 'title', keyframe: 'k2', props: { background: 'url(javascript:alert(1))' } }] });
    expect(c.valid).toBe(false);
    const d = await call('validate_scene', { scene: { not: 'a scene' } });
    expect(d.valid).toBe(false);
  });
  it("browser: 'auto' renders in a real headless browser when one is available, else falls back to the headless sampler", async () => {
    const r = await call('validate_scene', { scene: scene(), browser: 'auto' });
    expect(['browser', 'static']).toContain(r.mode);
    expect(r.valid).toBe(true);
  }, 60_000);
});

describe('14.6 suggest_motion { format: scene }', () => {
  it('description → a valid Scene v2 document (deterministic)', async () => {
    const r = await call('suggest_motion', { text: 'fade up slowly', format: 'scene' });
    expect(r.scene.format).toBe('motionary-scene');
    expect(r.scene.layers.length).toBeGreaterThan(0);
    expect(r.valid).toBe(true);
    expect(await call('suggest_motion', { text: 'fade up slowly', format: 'scene' })).toEqual(r);
  });
});
