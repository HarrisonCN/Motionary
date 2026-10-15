// 16.9.0 — v17 preparation (P0). Every 17.0 removal has a warning, a doctor finding, a codemod and a doc entry one
// minor ahead (tests first; failing-before: v16.9.0/failing-before.txt):
// - `motionary/scene/v3-preview` (+ `components/scene-v3-preview`) — the 15.9 preview name of motionary/scene/v3 —
//   becomes its own small module that warns once per session and forwards to motionary/scene/v3; 17.0 removes it.
// - `doctor --v15` / `migrate --to 15` (the 13.x / 14.x → 15 project migration) print a notice: removed in 17.0,
//   kept in `v16-lts` (npx motionary@v16-lts migrate --to 15).
// - `npx motionary doctor --v17` lists every use (exit 1); `npx motionary migrate --to 17` rewrites the alias imports
//   (dry run by default, `--write` keeps a `.bak`, never overwrites a backup, idempotent) and lists the rest as manual.
// - docs/deprecations-v17.md has one anchor per id; docs/migrating-to-v17.md exists; ROADMAP / versions mention v16-lts.
import { describe, it, expect, vi } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const ROOT = join(__dirname, '..');
const CLI: any = await import(join(ROOT, 'bin/motionary.mjs'));
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const tmp = () => mkdtempSync(join(tmpdir(), 'mo-v17-'));

describe('16.9 DEPRECATIONS_V17 + docs', () => {
  it('lists the 17.0 removals with fixes and doc anchors', () => {
    expect(CLI.DEPRECATIONS_V17.map((d: any) => d.id)).toEqual(['scene-v3-preview', 'cli-migrate-15']);
    const doc = readFileSync(join(ROOT, 'docs/deprecations-v17.md'), 'utf8');
    for (const d of CLI.DEPRECATIONS_V17) {
      expect(d.removedIn).toBe('17.0');
      expect(d.fix.length).toBeGreaterThan(10);
      expect(d.doc).toBe(`docs/deprecations-v17.md#${d.id}`);
      expect(doc).toContain(`<a id="${d.id}"></a>`);
    }
    expect(existsSync(join(ROOT, 'docs/migrating-to-v17.md'))).toBe(true);
    expect(readFileSync(join(ROOT, 'docs/versions.md'), 'utf8')).toMatch(/v16-lts/);
  });
});

describe('16.9 motionary/scene/v3-preview warns once and forwards', () => {
  it('is its own entry (not the scene-v3 files) and behaves exactly like motionary/scene/v3', async () => {
    expect(pkg.exports['./scene/v3-preview'].import.default).toBe('./dist/components/scene-v3-preview.js');
    expect(pkg.exports['./components/scene-v3-preview'].require.default).toBe('./dist/components/scene-v3-preview.cjs');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const P = await import('../src/components/scene/v3-preview');
    const V3 = await import('../src/components/scene/v3');
    const d = { format: 'motionary-scene', version: 2, layers: [{ id: 'a', type: 'track', target: '.a', keyframes: [{ id: 'k', time: 0, props: { opacity: 0 } }] }] };
    expect(warn).not.toHaveBeenCalled(); // no side effect on import
    const a = P.migrateToSceneV3(d), b = V3.migrateToSceneV3(d);
    expect(a).toEqual(b);
    expect(P.validateSceneV3(a.doc)).toEqual([]);
    P.sceneV3ToV2(a.doc!);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0][0])).toMatch(/v3-preview.*17\.0.*motionary\/scene\/v3/);
    expect(P.SCENE_V3_STATUS).toBe('stable');
    warn.mockRestore();
  });
});

describe('16.9 doctor --v17 / migrate --to 17', () => {
  const project = () => {
    const d = tmp();
    mkdirSync(join(d, 'src'));
    writeFileSync(join(d, 'src/a.ts'), "import { migrateToSceneV3 } from 'motionary/scene/v3-preview';\nconst x = require(\"motionary/components/scene-v3-preview\");\nimport 'motionary/scene/v3';\n");
    writeFileSync(join(d, 'package.json'), JSON.stringify({ scripts: { up: 'motionary migrate --to 15 --write src', chk: 'motionary doctor --v15' } }, null, 2));
    return d;
  };
  it('doctorV17 finds the alias imports and the v15 migration commands', () => {
    const d = project();
    const f = CLI.doctorV17([d]);
    expect(f.map((x: any) => [x.id, x.line])).toEqual([['scene-v3-preview', 1], ['scene-v3-preview', 2], ['cli-migrate-15', 3], ['cli-migrate-15', 4]]);
    expect(f[0].fix).toMatch(/motionary\/scene\/v3/);
  });
  it('migrateTo17 is a dry run by default; --write rewrites with a backup, idempotent', () => {
    const d = project();
    const a = join(d, 'src/a.ts');
    const before = readFileSync(a, 'utf8');
    const dry = CLI.migrateTo17([d]);
    expect(dry).toMatchObject({ format: 'motionary-migrate-report', to: '17', write: false });
    expect(dry.files).toEqual([{ file: a, id: 'scene-v3-preview', changed: true, rewrites: 2 }]);
    expect(dry.manual.map((m: any) => m.id)).toEqual(['cli-migrate-15', 'cli-migrate-15']);
    expect(readFileSync(a, 'utf8')).toBe(before);
    const w = CLI.migrateTo17([d], { write: true });
    expect(w.files[0].backup).toBe(a + '.bak');
    expect(readFileSync(a + '.bak', 'utf8')).toBe(before);
    const after = readFileSync(a, 'utf8');
    expect(after).toContain("from 'motionary/scene/v3';");
    expect(after).toContain('require("motionary/components/scene-v3")');
    expect(after).not.toMatch(/v3-preview/);
    expect(CLI.migrateTo17([d], { write: true }).files).toEqual([]);
    expect(existsSync(a + '.bak.1')).toBe(false);
  });
  it('the CLI routes doctor --v17 / migrate --to 17 (exit 1 when something is found)', async () => {
    const d = project();
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    expect(await CLI.main(['doctor', '--v17', d])).toBe(1);
    expect(await CLI.main(['migrate', '--to', '17', d, '--json'])).toBe(0);
    log.mockRestore();
  });
  it('doctor --v15 / migrate --to 15 print the 17.0 removal notice on stderr', async () => {
    const d = tmp();
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    await CLI.main(['doctor', '--v15', d]);
    await CLI.main(['migrate', '--to', '15', d]);
    const said = err.mock.calls.map((c) => String(c[0])).filter((s) => /17\.0/.test(s));
    expect(said).toHaveLength(2);
    expect(said[0]).toMatch(/v16-lts/);
    err.mockRestore();
    log.mockRestore();
  });
});
