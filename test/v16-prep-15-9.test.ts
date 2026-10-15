// 15.9.0 — v16 preparation (P0). Every 16.0 change has a warning, a doctor finding, a migration path and a doc entry
// one minor ahead (tests first; failing-before: v15.9.0/failing-before.txt):
// - docs/deprecations-v16.md (one anchor per id in DEPRECATIONS_V16), docs/migrating-to-v16.md, docs/scene-v3.md and
//   scripts/scene-v3.schema.json (draft, marked as such);
// - `npx motionary doctor --v16` lists Scene v2 data that 16.0 rewrites as v3, meta["motionary:variants"], Studio
//   exportScene() calls without { version: 2 }, MCP 2.x input shapes (check_compat, validate_snippet { scene }) — exit 1;
// - `npx motionary migrate --to 16` is a dry run with a per-file loss report in 15.9; `--write` is refused on 15.x (a v3
//   file would not open in 15.x) — migrateTo16(..., { write: true }) is the 16.0 code path: `.bak` first, never
//   overwrites a backup, Studio projects never rewritten;
// - Studio exportScene() warns once (16.0 returns v3); exportScene({ version: 2 }) is the explicit, silent form;
// - motionary-mcp 2.5: validate_scene (the 3.0 home of validate_snippet { scene }), and a `deprecations` array on
//   results of calls that use a shape MCP 3.0 removes.
import { describe, it, expect, vi } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as V3 from '../src/components/scene/v3';

const ROOT = join(__dirname, '..');
const CLI: any = await import(join(ROOT, 'bin/motionary.mjs'));
const M: any = await import(join(ROOT, 'bin/motionary-mcp.mjs'));
const m = M.loadManifest(join(ROOT, 'dist/manifest.json'));
const call = async (name: string, args: any) => (await M.callTool(m, name, args)).structuredContent;
const IDS = V3.DEPRECATIONS_V16.map((d) => d.id);

const SCENE = { format: 'motionary-scene', version: 2, name: 's', layers: [
  { id: 't', type: 'track', target: '#t', keyframes: [{ id: 'a', time: 0, props: { opacity: 0 } }, { id: 'b', time: 300, props: { opacity: 1 } }] },
] };
function project() {
  const d = mkdtempSync(join(tmpdir(), 'mo-v16-'));
  mkdirSync(join(d, 'src')); mkdirSync(join(d, 'scenes'));
  writeFileSync(join(d, 'scenes/hero.scene.json'), JSON.stringify(SCENE, null, 2) + '\n');
  writeFileSync(join(d, 'scenes/resp.scene.json'), JSON.stringify({ ...SCENE, meta: { 'motionary:variants': [{ id: 'phone', media: { maxWidth: 600 } }] } }));
  writeFileSync(join(d, 'scenes/new.scene.json'), JSON.stringify({ ...SCENE, version: 3 }));
  writeFileSync(join(d, 'scenes/app.motionary.json'), JSON.stringify({ format: 'motionary-studio', version: 1, scene: SCENE }));
  writeFileSync(join(d, 'src/save.ts'), "const doc = studio.exportScene();\nconst keep = studio.exportScene({ version: 2 });\n");
  writeFileSync(join(d, 'src/agent.mjs'), "await client.callTool({ name: 'check_compat', arguments: { version: '14.0.0' } });\nawait client.callTool({ name: 'validate_snippet', arguments: { scene } });\n");
  writeFileSync(join(d, 'src/clean.ts'), "import { animate } from 'motionary/motion';\n");
  return d;
}

describe('16.0 change list: docs', () => {
  it('deprecations-v16.md has an anchor + fix for every id; migrating-to-v16.md names doctor --v16 / migrate --to 16', () => {
    const doc = readFileSync(join(ROOT, 'docs/deprecations-v16.md'), 'utf8');
    for (const id of IDS) expect(doc, id).toContain(`<a id="${id}"></a>`);
    expect(doc.match(/\*\*Fix:\*\*/g)!.length).toBeGreaterThanOrEqual(IDS.length);
    const mig = readFileSync(join(ROOT, 'docs/migrating-to-v16.md'), 'utf8');
    expect(mig).toContain('npx motionary doctor --v16');
    expect(mig).toContain('npx motionary migrate --to 16');
  });
  it('docs/scene-v3.md + scripts/scene-v3.schema.json are marked draft and describe comp / component / variants', () => {
    const md = readFileSync(join(ROOT, 'docs/scene-v3.md'), 'utf8');
    expect(md).toMatch(/draft/i);
    for (const w of ['"comp"', '"component"', 'variants', 'timeRemap', 'migrateToSceneV3']) expect(md).toContain(w);
    const schema = JSON.parse(readFileSync(join(ROOT, 'scripts/scene-v3.schema.json'), 'utf8'));
    expect(schema.$comment).toMatch(/draft/);
    expect(schema.properties.version.const).toBe(3);
    expect(JSON.stringify(schema)).toContain('"comp"');
  });
});

describe('doctor --v16', () => {
  it('lists v2 scene data, variants in meta, exportScene() without a version and MCP 2.x shapes; v3 / projects / clean files are not listed', () => {
    const d = project();
    const f = CLI.doctorV16([d]);
    const by = (k: string) => f.filter((x: any) => x.id === k).map((x: any) => x.file.slice(d.length + 1)).sort();
    expect(by('scene-v2-write')).toEqual(['scenes/hero.scene.json', 'scenes/resp.scene.json', 'src/save.ts']);
    expect(by('variants-meta')).toEqual(['scenes/resp.scene.json']);
    expect(by('mcp-check-compat')).toEqual(['src/agent.mjs']);
    expect(by('mcp-snippet-scene')).toEqual(['src/agent.mjs']);
    expect(f.find((x: any) => x.file.endsWith('save.ts')).line).toBe(1); // the { version: 2 } call on line 2 is fine
    expect(f.every((x: any) => typeof x.line === 'number' && IDS.includes(x.id) && x.fix)).toBe(true);
    for (const n of ['new.scene.json', 'app.motionary.json', 'clean.ts']) expect(f.map((x: any) => x.file).join('\n')).not.toContain(n);
  });
  it('CLI: --json, exit 1 when found, 0 when clean', async () => {
    const d = project();
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    expect(await CLI.main(['doctor', '--v16', '--json', d])).toBe(1);
    const out = JSON.parse(log.mock.calls.map((c) => c[0]).join('\n'));
    expect(out.v16.length).toBe(6);
    const clean = mkdtempSync(join(tmpdir(), 'mo-v16c-'));
    writeFileSync(join(clean, 'a.ts'), "import { animate } from 'motionary/motion';\n");
    expect(await CLI.main(['doctor', '--v16', clean])).toBe(0);
    log.mockRestore();
  });
});

describe('migrate --to 16', () => {
  it('dry run: per-file v3 preview report (lossless, changes, lost), nothing written', () => {
    const d = project();
    const before = readFileSync(join(d, 'scenes/hero.scene.json'), 'utf8');
    const r = CLI.migrateTo16([d], { sceneV3: V3 });
    expect(r).toMatchObject({ format: 'motionary-migrate-report', version: 1, to: '16', write: false });
    expect(readFileSync(join(d, 'scenes/hero.scene.json'), 'utf8')).toBe(before);
    expect(existsSync(join(d, 'scenes/hero.scene.json.bak'))).toBe(false);
    const files = r.files.map((x: any) => x.file.slice(d.length + 1)).sort();
    expect(files).toEqual(['scenes/hero.scene.json', 'scenes/resp.scene.json']);
    for (const x of r.files) { expect(x.lossless).toBe(true); expect(x.losses).toEqual([]); expect(x.changes.length).toBeGreaterThan(0); }
    expect(r.manual.map((x: any) => `${x.file.slice(d.length + 1)}:${x.id}`).sort()).toEqual(['src/agent.mjs:mcp-check-compat', 'src/agent.mjs:mcp-snippet-scene', 'src/save.ts:scene-v2-write']);
    expect(r.skipped.map((x: any) => x.file.slice(d.length + 1))).toEqual(['scenes/app.motionary.json']);
  });
  it('write (the 16.0 path): byte-identical .bak first, v3 written, existing backups kept, second run changes nothing', () => {
    const d = project();
    const old = readFileSync(join(d, 'scenes/resp.scene.json'), 'utf8');
    writeFileSync(join(d, 'scenes/hero.scene.json.bak'), 'mine');
    CLI.migrateTo16([d], { sceneV3: V3, write: true });
    expect(readFileSync(join(d, 'scenes/resp.scene.json.bak'), 'utf8')).toBe(old);
    expect(readFileSync(join(d, 'scenes/hero.scene.json.bak'), 'utf8')).toBe('mine');
    expect(existsSync(join(d, 'scenes/hero.scene.json.bak.1'))).toBe(true);
    const v3 = JSON.parse(readFileSync(join(d, 'scenes/resp.scene.json'), 'utf8'));
    expect(v3.version).toBe(3);
    expect(v3.variants[0].id).toBe('phone');
    expect(V3.validateSceneV3(v3)).toEqual([]);
    expect(JSON.parse(readFileSync(join(d, 'scenes/app.motionary.json'), 'utf8')).scene.version).toBe(2);
    const r2 = CLI.migrateTo16([d], { sceneV3: V3, write: true });
    expect(r2.files).toEqual([]);
  });
  it('CLI on 15.x: --dry-run exit 0; --write refused with exit 2 and nothing written', async () => {
    const d = project();
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(await CLI.main(['migrate', '--to', '16', '--dry-run', d], { sceneV3: V3 })).toBe(0);
    expect(await CLI.main(['migrate', '--to', '16', '--write', d], { sceneV3: V3 })).toBe(2);
    expect(err.mock.calls.join('\n')).toMatch(/16\.0/);
    expect(existsSync(join(d, 'scenes/hero.scene.json.bak'))).toBe(false);
    expect(await CLI.main(['migrate', '--to', '15', d])).toBe(0); // the 14.9 path is unchanged
    log.mockRestore(); err.mockRestore();
  });
});

describe('Studio exportScene: warn once before 16.0 switches to v3', () => {
  it('exportScene() warns once naming 16.0 and { version: 2 }; exportScene({ version: 2 }) is silent and equal', async () => {
    const { createStudio } = await import('../src/components/studio/index');
    const { createTimelineHistory, createTimelineDoc } = await import('../src/components/timeline/editor/index');
    const host = document.createElement('div'); document.body.append(host);
    const s: any = createStudio(host, { history: createTimelineHistory(createTimelineDoc({ layers: SCENE.layers as any }), { now: () => 0 }) });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const quiet = s.exportScene({ version: 2 });
    expect(warn).not.toHaveBeenCalled();
    const a = s.exportScene(); s.exportScene();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0][0])).toMatch(/16\.0.*\{ version: 2 \}/);
    expect(a).toEqual(quiet);
    expect(a.version).toBe(2);
    warn.mockRestore(); s.destroy(); host.remove();
  });
});

describe('motionary-mcp 2.5: validate_scene + deprecations on MCP 2.x shapes', () => {
  it('server 2.5; validate_scene appended after propose_edit, read-only, schema 1.0', () => {
    expect(M.SERVER_INFO.version).toMatch(/^2\.([5-9]|\d\d)\.\d+$/);
    const names = M.TOOLS.map((x: any) => x.name);
    expect(names[names.length - 1]).toBe('validate_scene');
    const t = M.TOOLS.find((x: any) => x.name === 'validate_scene');
    expect(t.annotations.readOnlyHint).toBe(true);
    expect(t._meta['motionary/schemaVersion']).toBe('1.0');
    expect(t.inputSchema.required).toEqual(['scene']);
  });
  it('validate_scene validates like validate_snippet { scene } did, without deprecations', async () => {
    const r = await call('validate_scene', { scene: SCENE });
    expect(r.schema).toBe('motionary-mcp/validate_scene@1');
    expect(r.valid).toBe(true);
    expect(r.deprecations).toBeUndefined();
    const old = await call('validate_snippet', { scene: SCENE });
    expect(old.valid).toBe(true);
    expect(old.deprecations.map((x: any) => x.id)).toEqual(['mcp-snippet-scene']);
  });
  it('scene as JSON text and check_compat carry deprecations (removedIn 16.0, doc link); normal calls have none', async () => {
    const s = await call('validate_scene', { scene: JSON.stringify(SCENE) });
    expect(s.deprecations.map((x: any) => x.id)).toEqual(['mcp-scene-text']);
    expect(s.deprecations[0]).toMatchObject({ removedIn: '16.0', doc: 'docs/deprecations-v16.md#mcp-scene-text' });
    const c = await M.callTool(m, 'check_compat', { version: '14.0.0' });
    expect(c.structuredContent.deprecations[0].id).toBe('mcp-check-compat');
    expect(JSON.parse(c.content[0].text).deprecations[0].id).toBe('mcp-check-compat');
    const plain = await call('check_compatibility', { tags: ['usa-fade-up'] });
    expect(plain.deprecations).toBeUndefined();
  });
});

describe('15.9 package entry', () => {
  it('motionary/scene/v3-preview and motionary/components/scene-v3-preview with a size line', () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
    expect(pkg.exports['./scene/v3-preview'].import.default).toBe('./dist/components/scene-v3-preview.js');
    expect(pkg.exports['./components/scene-v3-preview'].require.default).toBe('./dist/components/scene-v3-preview.cjs');
    expect(readFileSync(join(ROOT, 'size-budget.json'), 'utf8')).toMatch(/components\/scene-v3-preview/);
  });
});
