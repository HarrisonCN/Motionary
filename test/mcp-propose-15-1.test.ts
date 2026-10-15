// 15.1.0 — motionary-mcp 2.4 (additive): propose_edit turns a prompt + Scene v2 document into a structured, validated
// proposal (ops, JSON diff, changed layers, preview) and NEVER writes: the caller's scene is untouched and the answer
// says applied: false. The proposal carries a provenance value { generator: 'motionary-mcp/propose_edit', requestId }
// whose requestId is the client's correlation id (argument, or MCP params._meta.correlationId — the id MCP Gateway
// 15.1 canary keeps with the call), so the edit applied later in Studio joins the gateway lineage record.
// Tests first: this file fails before propose_edit exists.
import { describe, it, expect } from 'vitest';
import { join } from 'node:path';

const ROOT = join(__dirname, '..');
const BIN = process.env.MOTIONARY_MCP_BIN || join(ROOT, 'bin/motionary-mcp.mjs');
const M: any = await import(BIN);
const m = M.loadManifest(join(ROOT, 'dist/manifest.json'));
M.setAi(await import(join(ROOT, 'dist/components/ai.js')));
M.setStudioAi(await import(join(ROOT, 'dist/components/studio-ai.js')));
const call = async (name: string, args: any) => (await M.callTool(m, name, args)).structuredContent;
const t = (n: string) => M.TOOLS.find((x: any) => x.name === n);

const scene = () => ({
  format: 'motionary-scene', version: 2,
  layers: [
    { id: 'title', type: 'track', target: '#title', keyframes: [{ id: 'k1', time: 0, props: { opacity: 0 } }, { id: 'k2', time: 400, props: { opacity: 1 } }] },
    { id: 'card', type: 'track', target: '.card', keyframes: [] },
  ],
});

describe('15.1 propose_edit contract (additive)', () => {
  it('server 2.4: propose_edit appended after the 2.3 tools, read-only, schema 1.0, output schema; earlier tools unchanged', () => {
    expect(M.SERVER_INFO.version).toMatch(/^2\.([4-9]|\d\d)\.\d+$/);
    const names = M.TOOLS.map((x: any) => x.name);
    expect(names.indexOf('propose_edit')).toBeGreaterThan(names.indexOf('export_scene'));
    for (const n of ['list_components', 'validate_snippet', 'check_compatibility', 'suggest_fix', 'list_templates', 'get_template', 'export_scene']) expect(names).toContain(n);
    const p = t('propose_edit');
    expect(p.annotations.readOnlyHint).toBe(true);
    expect(p._meta['motionary/schemaVersion']).toBe('1.0');
    expect(p.inputSchema.required).toEqual(['scene', 'prompt']);
    expect(Object.keys(p.inputSchema.properties).sort()).toEqual(['prompt', 'requestId', 'scene', 'selection']);
    expect(p.outputSchema.properties.schema.const).toBe('motionary-mcp/propose_edit@1');
  });
});

describe('propose_edit', () => {
  it('returns a validated proposal (ops, diff, changed layers, preview) and writes nothing', async () => {
    const s = scene();
    const before = JSON.stringify(s);
    const r = await call('propose_edit', { scene: s, prompt: 'fade up the card', requestId: 'req-15.1:abc_1' });
    expect(r.schema).toBe('motionary-mcp/propose_edit@1');
    expect(r.ok).toBe(true);
    expect(r.applied).toBe(false);
    expect(r.ops.length).toBeGreaterThan(0);
    for (const o of r.ops) expect(typeof o.text).toBe('string');
    expect(Array.isArray(r.diff)).toBe(true);
    expect(r.diff.length).toBeGreaterThan(0);
    expect(r.layers.length).toBeGreaterThan(0);
    expect(r.preview.format).toBe('motionary-scene');
    expect(r.provenance).toEqual({ generator: 'motionary-mcp/propose_edit', requestId: 'req-15.1:abc_1' });
    expect(JSON.stringify(s)).toBe(before);
  });
  it('accepts the scene as JSON text and is deterministic', async () => {
    const a = await call('propose_edit', { scene: JSON.stringify(scene()), prompt: 'fade up the card' });
    const b = await call('propose_edit', { scene: scene(), prompt: 'fade up the card' });
    const { deprecations, ...rest } = a; // 15.9 (MCP 2.5): JSON text still works and reports mcp-scene-text (removed in 3.0)
    expect(deprecations.map((d: any) => d.id)).toEqual(['mcp-scene-text']);
    expect(rest).toEqual(b);
    expect(a.provenance).toEqual({ generator: 'motionary-mcp/propose_edit' });
  });
  it('a selection limits the layers the proposal may touch', async () => {
    const r = await call('propose_edit', { scene: scene(), prompt: 'fade up', selection: ['card'] });
    expect(r.ok).toBe(true);
    for (const id of r.layers) expect(['card'].includes(id) || !scene().layers.some((l) => l.id === id)).toBe(true);
  });
  it('a bad request id, a missing prompt or an invalid scene is a tool error', async () => {
    await expect(M.callTool(m, 'propose_edit', { scene: scene(), prompt: 'x', requestId: 'has space' })).rejects.toThrow(/requestId/);
    await expect(M.callTool(m, 'propose_edit', { scene: scene() })).rejects.toThrow(/prompt/);
    await expect(M.callTool(m, 'propose_edit', { scene: '{not json', prompt: 'x' })).rejects.toThrow(/scene/);
  });
  it('over JSON-RPC the correlation id comes from params._meta.correlationId when no requestId argument is given', async () => {
    const res = await M.handle(m, { jsonrpc: '2.0', id: 7, method: 'tools/call', params: { name: 'propose_edit', arguments: { scene: scene(), prompt: 'fade up the card' }, _meta: { correlationId: 'mgw-corr.42' } } }, { initialized: true });
    expect(res.result.isError).toBeFalsy();
    expect(res.result.structuredContent.provenance.requestId).toBe('mgw-corr.42');
  });
});
