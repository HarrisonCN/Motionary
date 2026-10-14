// 14.9.0 — v15 preparation (P0). Every 15.0 removal has a development warning, a doctor finding, a migration path and
// a doc entry before 15.0 ships:
// - docs/deprecations-v15.md lists the removals (motionary/compat-v13 entry and what it serves, the codemod 5–10 runner);
//   docs/migrating-to-v15.md says how to move;
// - the compat-v13 notices name 15.0 and link the v15 deprecation page; `motionary codemod <5–10>` warns on stderr;
// - `npx motionary doctor --v15` lists every use (imports / requires of the compat entry, codemod 5–10 scripts, legacy
//   13.x data files) and exits 1 when anything is found;
// - `npx motionary migrate --to 15` (dry run by default) rewrites what is mechanical, converts legacy data in place to
//   Scene v2 after writing a `.bak` copy, never overwrites an existing backup, and writes a loss / manual-work report;
// - Studio project files that are truncated / corrupted / from an unknown version are reported, never rewritten.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const ROOT = join(__dirname, '..');
const CLI: any = await import(join(ROOT, 'bin/motionary.mjs'));
const S = createRequire(import.meta.url)(join(ROOT, 'dist/components/scene-v2.cjs'));
import { installCompatV13, normalizeAnimation, COMPAT_V13 } from '../src/components/compat-v13/index';
import { resetDeprecationWarnings, DEPRECATIONS_V15 } from '../src/components/deprecations';
import { parseStudioProject, serializeStudioProject } from '../src/components/studio/index';
import { createTimelineDoc } from '../src/components/timeline/editor/index';

const PLAYGROUND = { format: 'use-scroll-animate/playground', state: 'eyJ0IjpbWyJmYWRlLXVwIiwwLDQwMCwiYSJdXX0' };
const UNVERSIONED = { name: 'hero', tracks: [{ target: '#a', preset: 'fade-up', start: 0, duration: 400 }] };

function project() {
  const d = mkdtempSync(join(tmpdir(), 'mo-v15-'));
  mkdirSync(join(d, 'src')); mkdirSync(join(d, 'data'));
  writeFileSync(join(d, 'src/a.ts'), "import { installCompatV13 } from 'motionary/compat-v13';\ninstallCompatV13();\nexport const x = 1;\n");
  writeFileSync(join(d, 'src/b.js'), "const { normalizeAnimation } = require('motionary/components/compat-v13');\nmodule.exports = normalizeAnimation;\n");
  writeFileSync(join(d, 'src/clean.ts'), "import { animate } from 'motionary/motion';\nanimate('#a', { opacity: [0, 1] });\n");
  writeFileSync(join(d, 'package.json'), JSON.stringify({ name: 'app', scripts: { old: 'motionary codemod 7 --write src', ok: 'motionary codemod 13' } }, null, 2) + '\n');
  writeFileSync(join(d, 'data/old.json'), JSON.stringify(PLAYGROUND));
  writeFileSync(join(d, 'data/unv.json'), JSON.stringify(UNVERSIONED));
  writeFileSync(join(d, 'data/ok.scene.json'), JSON.stringify({ format: 'motionary-scene', version: 2, layers: [] }));
  return d;
}

describe('15.0 removal list: docs, ids, warnings', () => {
  it('docs/deprecations-v15.md lists every 15.0 removal with a fix; migrating-to-v15.md names doctor --v15 and migrate --to 15', () => {
    const doc = readFileSync(join(ROOT, 'docs/deprecations-v15.md'), 'utf8');
    expect(Object.keys(DEPRECATIONS_V15).sort()).toEqual(['compat-v13-entry', 'install-compat-v13', 'normalize-animation', 'old-codemods', 'upgrade-legacy-animation'].sort());
    for (const id of Object.keys(DEPRECATIONS_V15)) { expect(doc, id).toContain(`<a id="${id}"></a>`); }
    expect(doc.match(/\*\*Fix:\*\*/g)!.length).toBeGreaterThanOrEqual(Object.keys(DEPRECATIONS_V15).length);
    const mig = readFileSync(join(ROOT, 'docs/migrating-to-v15.md'), 'utf8');
    expect(mig).toContain('npx motionary doctor --v15');
    expect(mig).toContain('npx motionary migrate --to 15');
    expect(COMPAT_V13.plannedRemoval).toBe('15.0');
  });
  it('compat-v13 notices (development only, once) name 15.0 and link deprecations-v15.md', () => {
    resetDeprecationWarnings();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const off = installCompatV13();
    normalizeAnimation(UNVERSIONED as any);
    normalizeAnimation(UNVERSIONED as any);
    off();
    const text = warn.mock.calls.map((c) => String(c[0])).join('\n');
    expect(text).toMatch(/removed in 15\.0/);
    expect(text).toContain('docs/deprecations-v15.md#install-compat-v13');
    expect(text).toContain('docs/deprecations-v15.md#normalize-animation');
    expect(warn.mock.calls.filter((c) => String(c[0]).includes('#normalize-animation')).length).toBe(1);
    warn.mockRestore();
  });
  it('motionary codemod <5–10> warns on stderr that the runner is removed in 15.0 (13 does not)', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(CLI.codemodNotice(7)).toMatch(/removed in 15\.0/);
    expect(CLI.codemodNotice(13)).toBe('');
    err.mockRestore();
  });
});

describe('doctor --v15', () => {
  it('finds compat imports / requires, codemod 5–10 scripts and legacy data; clean files are not listed', () => {
    const d = project();
    const f = CLI.doctorV15([d]);
    const by = (k: string) => f.filter((x: any) => x.kind === k).map((x: any) => x.file.slice(d.length + 1)).sort();
    expect(by('compat-import')).toEqual(['src/a.ts', 'src/b.js']);
    expect(by('old-codemod')).toEqual(['package.json']);
    expect(by('legacy-data')).toEqual(['data/old.json', 'data/unv.json']);
    expect(f.every((x: any) => typeof x.line === 'number' && x.id && x.fix)).toBe(true);
    expect(f.map((x: any) => x.file)).not.toContain(join(d, 'src/clean.ts'));
  });
  it('CLI: --json, exit 1 when found, 0 when clean', async () => {
    const d = project();
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    expect(await CLI.main(['doctor', '--v15', '--json', d])).toBe(1);
    const out = JSON.parse(log.mock.calls.map((c) => c[0]).join('\n'));
    expect(out.v15.length).toBe(5);
    const clean = mkdtempSync(join(tmpdir(), 'mo-v15c-'));
    writeFileSync(join(clean, 'a.ts'), "import { animate } from 'motionary/motion';\n");
    expect(await CLI.main(['doctor', '--v15', clean])).toBe(0);
    log.mockRestore();
  });
});

describe('migrate --to 15', () => {
  it('dry run: a report of planned changes and manual work, nothing written', () => {
    const d = project();
    const before = readdirSync(join(d, 'data')).concat(readdirSync(join(d, 'src')));
    const r = CLI.migrateTo15([d], { write: false, sceneV2: S });
    expect(r.format).toBe('motionary-migrate-report');
    expect(r.version).toBe(1);
    expect(r.to).toBe('15');
    expect(r.write).toBe(false);
    expect(readdirSync(join(d, 'data')).concat(readdirSync(join(d, 'src')))).toEqual(before);
    expect(readFileSync(join(d, 'src/a.ts'), 'utf8')).toContain('installCompatV13');
    const files = r.files.map((x: any) => x.file.slice(d.length + 1)).sort();
    expect(files).toEqual(['data/old.json', 'data/unv.json', 'package.json', 'src/a.ts', 'src/b.js']);
    expect(r.manual.map((x: any) => x.file.slice(d.length + 1)).sort()).toEqual(['package.json', 'src/b.js']);
  });
  it('--write: legacy data converted in place to Scene v2 after a byte-identical .bak; installCompatV13 removed; report written; second run changes nothing', () => {
    const d = project();
    const old = readFileSync(join(d, 'data/old.json'), 'utf8');
    const r = CLI.migrateTo15([d], { write: true, sceneV2: S, report: join(d, 'motionary-migrate-report.json') });
    expect(readFileSync(join(d, 'data/old.json.bak'), 'utf8')).toBe(old);
    const conv = JSON.parse(readFileSync(join(d, 'data/old.json'), 'utf8'));
    expect(conv.format).toBe('motionary-scene');
    expect(S.validateSceneV2(conv)).toEqual([]);
    expect(JSON.parse(readFileSync(join(d, 'data/unv.json'), 'utf8')).format).toBe('motionary-scene');
    const a = readFileSync(join(d, 'src/a.ts'), 'utf8');
    expect(a).not.toMatch(/compat-v13|installCompatV13/);
    expect(a).toContain('export const x = 1;');
    expect(existsSync(join(d, 'src/a.ts.bak'))).toBe(true);
    // normalizeAnimation has no mechanical replacement: left as is, listed as manual work with the reason
    expect(readFileSync(join(d, 'src/b.js'), 'utf8')).toContain('normalizeAnimation');
    expect(r.manual.find((x: any) => x.file.endsWith('src/b.js')).reason).toMatch(/validateSceneV2|migrateToSceneV2/);
    const rep = JSON.parse(readFileSync(join(d, 'motionary-migrate-report.json'), 'utf8'));
    expect(rep.files.length).toBe(r.files.length);
    for (const x of rep.files.filter((y: any) => y.kind === 'legacy-data')) expect(Array.isArray(x.losses)).toBe(true);
    const r2 = CLI.migrateTo15([d], { write: true, sceneV2: S });
    expect(r2.files.filter((x: any) => x.changed)).toEqual([]);
    expect(existsSync(join(d, 'data/old.json.bak.1'))).toBe(false);
  });
  it('never overwrites an existing backup (next free .bak.N)', () => {
    const d = project();
    writeFileSync(join(d, 'data/unv.json.bak'), 'mine');
    CLI.migrateTo15([d], { write: true, sceneV2: S });
    expect(readFileSync(join(d, 'data/unv.json.bak'), 'utf8')).toBe('mine');
    expect(JSON.parse(readFileSync(join(d, 'data/unv.json.bak.1'), 'utf8'))).toEqual(UNVERSIONED);
  });
});

describe('Studio project recovery: damaged files are reported, never rewritten', () => {
  const good = () => serializeStudioProject(createTimelineDoc({ layers: [{ id: 't', type: 'track', target: '#t', keyframes: [{ id: 'a', time: 0, props: { opacity: 0 } }, { id: 'b', time: 300, props: { opacity: 1 } }] }] }), { fps: 30 });
  it('truncated / corrupted / unknown-version projects throw a clear error; a valid one opens', () => {
    expect(parseStudioProject(good()).doc.layers.length).toBe(1);
    const g = good();
    expect(() => parseStudioProject(g.slice(0, g.length / 2))).toThrow(/invalid JSON/);
    const bad = JSON.parse(g); bad.scene.layers = 'x';
    expect(() => parseStudioProject(bad)).toThrow(/layers/);
    const v2 = JSON.parse(g); v2.version = 2;
    expect(() => parseStudioProject(v2)).toThrow(/version/);
  });
  it('migrate --to 15 reports damaged project files and leaves them (and valid projects) untouched', () => {
    const d = mkdtempSync(join(tmpdir(), 'mo-v15p-'));
    const g = good();
    writeFileSync(join(d, 'ok.motionary.json'), g);
    writeFileSync(join(d, 'cut.motionary.json'), g.slice(0, 40));
    const r = CLI.migrateTo15([d], { write: true, sceneV2: S });
    expect(readFileSync(join(d, 'ok.motionary.json'), 'utf8')).toBe(g);
    expect(readFileSync(join(d, 'cut.motionary.json'), 'utf8')).toBe(g.slice(0, 40));
    expect(r.problems.map((p: any) => p.file.slice(d.length + 1))).toEqual(['cut.motionary.json']);
    expect(existsSync(join(d, 'cut.motionary.json.bak'))).toBe(false);
  });
});

describe('migration corpus (golden files): 0 unexpected losses', () => {
  it('migrate --to 15 --write on the 13.x fixtures + shipped templates: legacy files become exactly the golden Scene v2, nothing lost, everything else untouched', () => {
    const d = mkdtempSync(join(tmpdir(), 'mo-v15g-'));
    const FX = join(ROOT, 'test/fixtures/scene-v2'), TP = join(ROOT, 'templates');
    mkdirSync(join(d, 'fx')); mkdirSync(join(d, 'tp'));
    for (const f of readdirSync(FX)) writeFileSync(join(d, 'fx', f), readFileSync(join(FX, f)));
    for (const f of readdirSync(TP)) writeFileSync(join(d, 'tp', f), readFileSync(join(TP, f)));
    const r = CLI.migrateTo15([d], { write: true, sceneV2: S });
    expect(r.problems).toEqual([]);
    expect(r.manual).toEqual([]);
    const legacy = r.files.filter((x: any) => x.kind === 'legacy-data');
    expect(legacy.map((x: any) => x.file.slice(d.length + 1)).sort()).toEqual(['fx/player-unversioned.json', 'fx/playground.json']);
    for (const x of legacy) {
      expect(x.losses, x.file).toEqual([]);
      expect(readFileSync(x.file, 'utf8')).toBe(readFileSync(join(FX, x.file.slice(d.length + 4).replace(/\.json$/, '.scene.json')), 'utf8'));
    }
    for (const f of readdirSync(TP)) expect(readFileSync(join(d, 'tp', f), 'utf8')).toBe(readFileSync(join(TP, f), 'utf8'));
    for (const f of readdirSync(FX).filter((n) => !/^(playground|player-unversioned)\.json$/.test(n))) expect(readFileSync(join(d, 'fx', f), 'utf8'), f).toBe(readFileSync(join(FX, f), 'utf8'));
  });
});
