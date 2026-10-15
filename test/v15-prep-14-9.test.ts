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
import { describe, it, expect, vi } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const ROOT = join(__dirname, '..');
const CLI: any = await import(join(ROOT, 'bin/motionary.mjs'));
const S = createRequire(import.meta.url)(join(ROOT, 'dist/components/scene-v2.cjs'));
// 15.0: motionary/compat-v13 and its notices are removed; the CLI side of 14.9 (doctor --v15, migrate --to 15) stayed until 17.0.
const DEPRECATIONS_V15 = { 'compat-v13-entry': 1, 'install-compat-v13': 1, 'normalize-animation': 1, 'old-codemods': 1, 'upgrade-legacy-animation': 1 };
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
  });
  it('motionary codemod <5–10>: the message says the runner is removed in 15.0 (13 has none)', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(CLI.codemodNotice(7)).toMatch(/removed in 15\.0/);
    expect(CLI.codemodNotice(13)).toBe('');
    err.mockRestore();
  });
});

// 17.0: doctor --v15 / migrate --to 15 were removed from the CLI (announced in 16.9; npx motionary@v16-lts keeps them) —
// their tests live on the 16.x line; test/platform-stable-17-0.test.ts checks the exit-2 pointer.

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
});
