// 16.0.0 — Scene Format v3 + motionary-mcp 3.0 (major). Tests first (failing-before: v16.0.0/failing-before.txt).
// - motionary/scene/v3 is the stable entry (SCENE_V3_STATUS 'stable'); motionary/scene/v3-preview stays as an alias;
// - Scene v3 opens wherever v2 does: flat v3 in the player and the timeline editor (loadMotionDoc), any v3 (nested comps,
//   component instances) in the Studio (load / parseStudioProject) through the full v3 → v2 reader;
// - Studio exportScene() returns Scene v3 (no warning); exportScene({ version: 2 }) still returns v2;
// - `motionary migrate` writes v3; `migrate --to 16 --write` works on 16.x (.bak first);
// - motionary-mcp 3.0.0: validate_snippet { scene } and JSON-text scenes are refused with a pointer, check_compat is
//   gone, scene tools accept v3, tool schema versions of the changed tools are 2.0.
import { describe, it, expect, vi } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as V3 from '../src/components/scene/v3';
import { loadMotionDoc, createTimelineHistory } from '../src/components/timeline/editor/index';
import { normalizePlayable } from '../src/components/effects/player';
import { createStudio } from '../src/components/studio/index';
import { parseStudioProject } from '../src/components/studio/project';

const ROOT = join(__dirname, '..');
const CLI: any = await import(join(ROOT, 'bin/motionary.mjs'));
const M: any = await import(join(ROOT, 'bin/motionary-mcp.mjs'));
const m = M.loadManifest(join(ROOT, 'dist/manifest.json'));
M.setStudioAi(await import(join(ROOT, 'dist/components/studio-ai.js')));
M.setSceneV3(V3);
const call = async (name: string, args: any) => (await M.callTool(m, name, args)).structuredContent;

const V2 = { format: 'motionary-scene', version: 2, name: 's', layers: [
  { id: 't', type: 'track', target: '#t', keyframes: [{ id: 'a', time: 0, props: { opacity: 0 } }, { id: 'b', time: 300, props: { opacity: 1 } }] },
], meta: { 'motionary:variants': [{ id: 'phone', media: { maxWidth: 600 } }] } };
const FLAT_V3 = () => V3.migrateToSceneV3(V2).doc!;
const NESTED_V3 = () => ({
  format: 'motionary-scene', version: 3, name: 'nested',
  components: { card: { layers: [{ id: 'face', type: 'track', target: '.face', keyframes: [{ id: 'f0', time: 0, props: { opacity: 0 } }, { id: 'f1', time: 300, props: { opacity: 1 } }] }] } },
  layers: [
    { id: 'intro', type: 'comp', start: 100, layers: [{ id: 'title', type: 'track', target: '#t', keyframes: [{ id: 'a', time: 0, props: { opacity: 0 } }, { id: 'b', time: 200, props: { opacity: 1 } }] }] },
    { id: 'card1', type: 'component', ref: 'card', start: 50, target: '#card1' },
  ],
});

describe('16.0 motionary/scene/v3 (stable)', () => {
  it('status stable; the package exports motionary/scene/v3 and keeps motionary/scene/v3-preview', () => {
    expect(V3.SCENE_V3_STATUS).toBe('stable');
    const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
    expect(pkg.version).toMatch(/^16\./);
    expect(pkg.exports['./scene/v3'].import.default).toBe('./dist/components/scene-v3.js');
    expect(pkg.exports['./scene/v3-preview']).toBeTruthy();
    expect(JSON.stringify(pkg.dependencies || {})).toBe('{}');
  });
});

describe('reading Scene v3', () => {
  it('the player plays flat v3 like the v2 it came from; nested v3 gets a clear error naming sceneV3ToV2', () => {
    expect(normalizePlayable(FLAT_V3() as any)).toEqual(normalizePlayable(V2 as any));
    expect(() => normalizePlayable(NESTED_V3() as any)).toThrow(/sceneV3ToV2/);
  });
  it('loadMotionDoc opens flat v3 (variants kept in meta for the editor)', () => {
    const a = loadMotionDoc(FLAT_V3()), b = loadMotionDoc(V2);
    expect(a.doc).toEqual(b.doc);
    expect((a.doc.meta as any)['motionary:variants'][0].id).toBe('phone');
  });
  it('the Studio opens nested v3 (comps → groups, component instances expanded) and reports what v2 could not keep', () => {
    const r = parseStudioProject(NESTED_V3());
    expect(r.doc.layers.map((l: any) => l.id)).toEqual(['intro', 'title', 'card1', 'card1/face']);
    expect(r.lost.length).toBeGreaterThanOrEqual(2);
  });
});

describe('writing Scene v3', () => {
  const studio = () => {
    const host = document.createElement('div'); document.body.append(host);
    const h = createTimelineHistory(loadMotionDoc(V2).doc, { now: () => 0 });
    return { s: createStudio(host, { history: h }) as any, host };
  };
  it('exportScene() returns valid v3 without a warning; exportScene({ version: 2 }) returns v2', () => {
    const { s, host } = studio();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const v3 = s.exportScene();
    expect(warn).not.toHaveBeenCalled();
    expect(v3.version).toBe(3);
    expect(V3.validateSceneV3(v3)).toEqual([]);
    expect(v3.variants[0].id).toBe('phone');
    expect(s.exportScene({ version: 2 }).version).toBe(2);
    warn.mockRestore(); s.destroy(); host.remove();
  });
  it('`motionary migrate` writes Scene v3; `migrate --to 16 --write` converts in place after a .bak on 16.x', async () => {
    const d = mkdtempSync(join(tmpdir(), 'mo-16-'));
    mkdirSync(join(d, 's'));
    writeFileSync(join(d, 's/a.scene.json'), JSON.stringify(V2));
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(await CLI.main(['migrate', '--to', '16', '--write', d], { sceneV3: V3 })).toBe(0);
    expect(existsSync(join(d, 's/a.scene.json.bak'))).toBe(true);
    expect(JSON.parse(readFileSync(join(d, 's/a.scene.json'), 'utf8')).version).toBe(3);
    const anim = join(d, 'anim.json');
    writeFileSync(anim, JSON.stringify({ format: 'use-scroll-animate/animation', version: 1, tracks: [{ target: '#a', preset: 'fade-up', start: 0, duration: 400 }] }));
    expect(await CLI.main(['migrate', anim, '--out', join(d, 'out.json')], { sceneV3: V3 })).toBe(0);
    expect(JSON.parse(readFileSync(join(d, 'out.json'), 'utf8')).version).toBe(3);
    log.mockRestore(); err.mockRestore();
  });
});

describe('motionary-mcp 3.0', () => {
  it('server 3.0.0; check_compat removed; changed tools carry schema 2.0; validate_scene / scene inputs are objects only', () => {
    expect(M.SERVER_INFO.version).toMatch(/^3\.\d+\.\d+$/);
    const names = M.TOOLS.map((t: any) => t.name);
    expect(names).not.toContain('check_compat');
    const t = (n: string) => M.TOOLS.find((x: any) => x.name === n);
    expect(t('validate_snippet').inputSchema.properties.scene).toBeUndefined();
    for (const n of ['validate_scene', 'check_compatibility', 'suggest_fix', 'export_scene', 'propose_edit']) {
      expect(t(n).inputSchema.properties.scene.type, n).toBe('object');
      expect(t(n)._meta['motionary/schemaVersion'], n).toBe('2.0');
    }
  });
  it('refuses the removed shapes with a pointer; validate_scene accepts Scene v3 (flat and nested)', async () => {
    await expect(Promise.resolve().then(() => M.callTool(m, 'validate_snippet', { scene: V2 }))).rejects.toThrow(/validate_scene/);
    await expect(Promise.resolve().then(() => M.callTool(m, 'validate_scene', { scene: JSON.stringify(V2) }))).rejects.toThrow(/object/);
    await expect(Promise.resolve().then(() => M.callTool(m, 'check_compat', { version: '14.0.0' }))).rejects.toThrow(/check_compatibility/);
    const a = await call('validate_scene', { scene: FLAT_V3() });
    expect(a.valid).toBe(true);
    const b = await call('validate_scene', { scene: NESTED_V3() });
    expect(b.valid).toBe(true);
    expect(b.sceneVersion).toBe(3);
  });
});

describe('16.0 migrate --code', () => {
  it('rewrites CDN majors @10…@15 → @16 and the check_compat tool name → check_compatibility (quoted names only)', () => {
    const r = CLI.migrateCode(`<script src="https://unpkg.com/motionary@15/dist/index.umd.js"></script>\n<script src="https://cdn.jsdelivr.net/npm/use-scroll-animate@12/dist/x.js"></script>\nclient.callTool({ name: 'check_compat', arguments: {} }); callTool("check_compat"); const check_compat_note = 1;`);
    expect(r.code).toContain('motionary@16/dist/index.umd.js');
    expect(r.code).toContain('use-scroll-animate@16/dist/x.js');
    expect(r.code).toContain("name: 'check_compatibility'");
    expect(r.code).toContain('callTool("check_compatibility")');
    expect(r.code).toContain('const check_compat_note = 1;');
    expect(r.changes.join('\n')).toMatch(/check_compat → check_compatibility/);
    expect(CLI.migrateCode(r.code).changes).toEqual([]);
  });
});
