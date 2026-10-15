// 15.0.0 — Motion Studio 2.0 (major).
// 1. Removals announced in 14.9 (docs/deprecations-v15.md): the motionary/compat-v13 entry, the player's legacy loader
//    hook and `motionary codemod <5–10>` are gone; doctor --v15 / migrate --to 15 stayed in the CLI until 17.0 (v16-lts keeps them).
// 2. `motionary/studio/app` (= components/studio-app): createStudioApp(root, options) composes the Studio (timeline +
//    canvas), save / reopen through a storage adapter, packs with assets (missing-asset report + relink suggestions),
//    the 14.7 standalone export and optional AI review — new → edit → preview → save → reopen → export. Heavy parts
//    (export, assets, ai) load lazily.
import { describe, it, expect, vi } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(__dirname, '..');
const PKG = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const CLI: any = await import(join(ROOT, 'bin/motionary.mjs'));
import { createStudioApp, createMemoryStorage, STUDIO_APP_VERSION } from '../src/components/studio/app';
import { parseStudioProject } from '../src/components/studio/index';
import { frameDigest } from '../src/components/studio/export';
import { packStudioProject } from '../src/components/studio/assets';
import { createTimelineDoc } from '../src/components/timeline/editor/index';
import { createPlayer } from '../src/components/effects/player';

const stage = () => {
  const s = document.createElement('div');
  s.innerHTML = '<h2 id="t">Hi</h2><img id="hero">';
  document.body.append(s);
  return s;
};
const mount = () => { const r = document.createElement('div'); document.body.append(r); return r; };

describe('15.0 removals', () => {
  it('motionary/compat-v13 is gone (source, exports, entries, budget)', () => {
    expect(existsSync(join(ROOT, 'src/components/compat-v13'))).toBe(false);
    expect(PKG.exports['./compat-v13']).toBeUndefined();
    expect(PKG.exports['./components/compat-v13']).toBeUndefined();
    expect(readFileSync(join(ROOT, 'scripts/categories.mjs'), 'utf8')).not.toMatch(/compat-v13/);
    expect(readFileSync(join(ROOT, 'size-budget.json'), 'utf8')).not.toMatch(/compat-v13/);
  });
  it('codemods 5–10 are gone; `motionary codemod 7` exits 2 and points to the 14.x CLI; 11–13 remain', async () => {
    for (const n of [5, 6, 7, 8, 9, 10]) expect(existsSync(join(ROOT, `bin/usa-codemod-${n}.mjs`)), String(n)).toBe(false);
    for (const n of [11, 12, 13]) expect(existsSync(join(ROOT, `bin/usa-codemod-${n}.mjs`)), String(n)).toBe(true);
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(await CLI.main(['codemod', '7'])).toBe(2);
    expect(err.mock.calls.map((c) => String(c[0])).join('\n')).toMatch(/removed in 15\.0.*motionary@v14-lts codemod 7/s);
    err.mockRestore();
  });
  it('the player refuses 13.x documents and points to migrate --to 15 on the 16.x CLI (17.0: npx motionary@v16-lts; no loader hook left)', async () => {
    const m: any = await import('../src/components/effects/player');
    expect(m.setLegacyAnimationLoader).toBeUndefined();
    const el = document.createElement('div');
    expect(() => createPlayer(el, { tracks: [{ target: ':scope', duration: 100, keyframes: [{ opacity: 0 }, { opacity: 1 }] }] } as any)).toThrow(/npx motionary@v16-lts migrate --to 15/);
  });
  it('doctor --v15 and migrate --to 15 stayed in the 15.x / 16.x CLI; 17.0 removed them', () => {
    expect(CLI.doctorV15).toBeUndefined();
    expect(CLI.migrateTo15).toBeUndefined();
  });
});

describe('motionary/studio/app', () => {
  it('is its own entry (motionary/studio/app = components/studio-app) and loads export / assets / ai lazily', () => {
    expect(PKG.exports['./studio/app']).toBeTruthy();
    expect(PKG.exports['./components/studio-app']).toBeTruthy();
    const src = readFileSync(join(ROOT, 'src/components/studio/app.ts'), 'utf8');
    expect(src).not.toMatch(/^import[^;]*from '\.\/(export|assets|ai|templates)'/m);
    expect(src).toMatch(/import\('\.\/export'\)/);
    expect(STUDIO_APP_VERSION).toBe(1);
  });
  it('new → edit → save → reopen: same project text and same frame digest; dirty state follows edits', async () => {
    const storage = createMemoryStorage();
    const app = await createStudioApp(mount(), { stage: stage(), storage, name: 'promo' });
    expect(app.el.querySelectorAll('[data-app]').length).toBeGreaterThanOrEqual(6);
    expect(app.dirty).toBe(false);
    const id = app.studio.addTrack({ name: 'Title', target: '#t' });
    app.studio.setTime(0); app.studio.setValue(id, 'opacity', 0);
    app.studio.setTime(500); app.studio.setValue(id, 'opacity', 1);
    expect(app.dirty).toBe(true);
    const text = await app.save();
    expect(app.dirty).toBe(false);
    expect(await storage.read('promo')).toBe(text);
    expect(parseStudioProject(text).doc.layers.length).toBe(1);
    const digest = await app.digest();
    app.destroy();
    const again = await createStudioApp(mount(), { stage: stage(), storage, name: 'promo' });
    const r = await again.reopen();
    expect(r.ok).toBe(true);
    expect(again.studio.save()).toBe(text);
    expect(await again.digest()).toBe(digest);
    expect(again.dirty).toBe(false);
    again.destroy();
  });
  it('export: the 14.7 standalone files, digest equal to the project digest; nothing exported on a broken project', async () => {
    const app = await createStudioApp(mount(), { stage: stage(), name: 'x' });
    const id = app.studio.addTrack({ target: '#t' });
    app.studio.setValue(id, 'opacity', 0);
    app.studio.setTime(300); app.studio.setValue(id, 'opacity', 1);
    const out = await app.exportStandalone({ inline: true });
    expect(out.report.ok).toBe(true);
    expect(out.report.digest).toBe(await app.digest());
    expect(String(out.files.get('index.html'))).toContain(out.report.digest);
    app.destroy();
  });
  it('open: damaged input is reported and the current project is kept; Scene v2 and packs open; missing assets listed with relink suggestions', async () => {
    const app = await createStudioApp(mount(), { stage: stage(), name: 'y' });
    app.studio.addTrack({ target: '#t' });
    const before = app.studio.save();
    const bad = await app.open('{"format":"motionary-studio","version":1,"scene":');
    expect(bad.ok).toBe(false);
    expect(bad.error).toMatch(/invalid JSON/);
    expect(app.studio.save()).toBe(before);
    const doc = createTimelineDoc({ layers: [{ id: 'h', type: 'track', target: '#hero', keyframes: [{ id: 'a', time: 0, props: { '--src': 'img/hero.png' } }, { id: 'b', time: 200, props: { '--src': 'img/hero2.png' } }] }] });
    const pack = packStudioProject({ doc }, { 'img/hero.png': new Uint8Array([1, 2, 3]) }).text;
    const r = await app.open(pack, { assets: { 'other/hero2.png': new Uint8Array([9]) } });
    expect(r.ok).toBe(true);
    expect(r.missing).toEqual(['img/hero2.png']);
    expect(r.relink.map((s: any) => [s.from, s.to])).toEqual([['img/hero2.png', 'other/hero2.png']]);
    expect(app.dirty).toBe(false);
    app.destroy();
  });
  it('new project resets history and document; undo / redo buttons drive the history', async () => {
    const app = await createStudioApp(mount(), { stage: stage(), name: 'z' });
    app.studio.addTrack({ target: '#t' });
    (app.el.querySelector('[data-app="undo"]') as HTMLButtonElement).click();
    expect(app.history.doc.layers.length).toBe(0);
    (app.el.querySelector('[data-app="redo"]') as HTMLButtonElement).click();
    expect(app.history.doc.layers.length).toBe(1);
    await app.newProject('fresh');
    expect(app.history.doc.layers.length).toBe(0);
    expect(app.history.canUndo).toBe(false);
    expect(app.name).toBe('fresh');
    app.destroy();
  });
  it('a frame digest matches the 14.7 frameDigest of the saved project', async () => {
    const app = await createStudioApp(mount(), { stage: stage(), name: 'd', fps: 30 });
    const id = app.studio.addTrack({ target: '#t' });
    app.studio.setValue(id, 'opacity', 0);
    const text = await app.save();
    expect(await app.digest()).toBe(frameDigest(text, { fps: 30 }));
    app.destroy();
  });
});
