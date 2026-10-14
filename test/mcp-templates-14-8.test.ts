// 14.8.0 — motionary-mcp 2.3 (additive): list_templates / get_template read the starter templates shipped in the
// package (templates/*.motionary-template.json, integrity-checked, license + required modules in every answer) and
// export_scene turns a Scene v2 document / Studio project / shipped template into the 14.7 standalone files + digest.
// All read-only: nothing is written, nothing is fetched, no template code runs (templates are data).
import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';

const ROOT = join(__dirname, '..');
const BIN = process.env.MOTIONARY_MCP_BIN || join(ROOT, 'bin/motionary-mcp.mjs');
const M: any = await import(BIN);
const m = M.loadManifest(join(ROOT, 'dist/manifest.json'));
M.setAi(await import(join(ROOT, 'dist/components/ai.js')));
M.setStudioAi(await import(join(ROOT, 'dist/components/studio-ai.js')));
M.setStudioExport(await import(join(ROOT, 'dist/components/studio-export.js')));
M.setStudioTemplates(await import(join(ROOT, 'dist/components/studio-templates.js')));
const call = async (name: string, args: any) => (await M.callTool(m, name, args)).structuredContent;
const t = (n: string) => M.TOOLS.find((x: any) => x.name === n);

const scene = {
  format: 'motionary-scene', version: 2,
  layers: [{ id: 'title', type: 'track', target: '#title', keyframes: [{ id: 'k1', time: 0, props: { opacity: 0 }, easing: 'ease-out' }, { id: 'k2', time: 400, props: { opacity: 1 } }] }],
};

describe('14.8 tool contracts (additive)', () => {
  it('server 2.3: list_templates / get_template / export_scene appended, read-only, with output schemas; every 2.2 tool unchanged', () => {
    expect(M.SERVER_INFO.version).toMatch(/^2\.([3-9]|\d\d)\.\d+$/);
    const names = M.TOOLS.map((x: any) => x.name);
    expect(names.slice(-3)).toEqual(['list_templates', 'get_template', 'export_scene']);
    for (const n of ['list_components', 'search_components', 'get_component', 'get_example', 'scaffold_snippet', 'suggest_motion', 'validate_snippet', 'check_compat', 'check_compatibility', 'suggest_fix']) expect(names).toContain(n);
    for (const n of ['list_templates', 'get_template', 'export_scene']) {
      expect(t(n).annotations.readOnlyHint).toBe(true);
      expect(t(n).outputSchema).toBeTruthy();
      expect(t(n)._meta['motionary/schemaVersion']).toBe('1.0');
    }
    expect(t('get_template').inputSchema.required).toEqual(['id']);
    expect(Object.keys(t('export_scene').inputSchema.properties).sort()).toEqual(['fps', 'inline', 'js', 'project', 'scene', 'template', 'title']);
  });
});

describe('list_templates / get_template', () => {
  it('lists the shipped templates with license, version, required modules and a verified integrity value', async () => {
    const r = await call('list_templates', {});
    expect(r.schema).toBe('motionary-mcp/list_templates@1');
    const index = JSON.parse(readFileSync(join(ROOT, 'templates/index.json'), 'utf8'));
    expect(r.templates.map((x: any) => x.id).sort()).toEqual(index.templates.map((x: any) => x.id).sort());
    for (const x of r.templates) {
      expect(x).toMatchObject({ license: 'MIT', integrity: expect.stringMatching(/^sha256-/), verified: true });
      expect(Array.isArray(x.requires)).toBe(true);
      expect(x.version).toMatch(/^\d+\.\d+\.\d+$/);
    }
    const f = await call('list_templates', { query: r.templates[0].name.split(' ')[0] });
    expect(f.templates.map((x: any) => x.id)).toContain(r.templates[0].id);
  });
  it('get_template answers manifest + info + the Scene v2 document + preview HTML; unknown ids are a tool error', async () => {
    const list = await call('list_templates', {});
    const id = list.templates[0].id;
    const g = await call('get_template', { id });
    expect(g.schema).toBe('motionary-mcp/get_template@1');
    expect(g.manifest.id).toBe(id);
    expect(g.info).toMatchObject({ id, license: 'MIT' });
    expect(g.verified).toBe(true);
    expect(g.scene.format).toBe('motionary-scene');
    expect(g.preview.html).not.toMatch(/<script/i);
    expect(g.preview.sandbox).toBe('');
    const bad = await Promise.resolve().then(() => M.callTool(m, 'get_template', { id: 'nope' })).then((x: any) => x, (e: any) => ({ error: String(e.message) }));
    expect(JSON.stringify(bad)).toMatch(/unknown template/);
  });
});

describe('export_scene', () => {
  it('exports a Scene v2 document: files (text, binary as base64), digest and report — same input, same answer', async () => {
    const a = await call('export_scene', { scene });
    expect(a.schema).toBe('motionary-mcp/export_scene@1');
    expect(a.digest).toMatch(/^mfd1-60-/);
    expect(a.files.map((f: any) => f.path)).toEqual(['index.html', 'scene.css', 'scene.js']);
    for (const f of a.files) expect(f.encoding).toBe('utf8');
    expect(a.report.ok).toBe(true);
    expect(JSON.stringify(await call('export_scene', { scene }))).toBe(JSON.stringify(a));
    const one = await call('export_scene', { scene: JSON.stringify(scene), inline: true, js: false, fps: 30, title: 'T' });
    expect(one.files.map((f: any) => f.path)).toEqual(['index.html']);
    expect(one.files[0].text).not.toMatch(/<script/i);
    expect(one.files[0].text).toContain('<title>T</title>');
    expect(one.digest).toMatch(/^mfd1-30-/);
  });
  it('exports a shipped template with its assets, or a Studio project text; refuses bad input as a tool error', async () => {
    const list = await call('list_templates', {});
    const withAsset = list.templates.find((x: any) => x.files > 0) || list.templates[0];
    const r = await call('export_scene', { template: withAsset.id });
    expect(r.report.ok).toBe(true);
    if (withAsset.files > 0) expect(r.files.some((f: any) => f.path.startsWith('assets/') && f.encoding === 'base64')).toBe(true);
    const project = JSON.stringify({ format: 'motionary-studio', version: 1, scene, studio: {} });
    expect((await call('export_scene', { project })).digest).toBe((await call('export_scene', { scene })).digest);
    for (const args of [{}, { scene: '{nope' }, { template: 'nope' }, { scene, fps: 0 }]) {
      const res = await Promise.resolve().then(() => M.callTool(m, 'export_scene', args)).then((x: any) => x, (e: any) => ({ isError: true, e: String(e.message) }));
      expect(res.isError, JSON.stringify(args)).toBe(true);
    }
  });
});
