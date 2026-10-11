// 14.0.0 — versioned migration of the 13.9-deprecated interfaces: removed from the main entries, kept behind the
// compat entry `motionary/compat-v13` (playground documents + unversioned animation JSON in <usa-player>,
// normalizeAnimation(), the usa-codemod-5..10 tools via `npx motionary codemod <n>`), plus
// `npx motionary migrate --code` for the 14.0 import moves. Lite / main entries do not import the compat layer.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import * as effects from '../src/components/effects/index';
import { createPlayer } from '../src/components/effects/player';
import { installCompatV13, normalizeAnimation, upgradeLegacyAnimation, COMPAT_V13 } from '../src/components/compat-v13/index';
import { resetDeprecationWarnings } from '../src/components/deprecations';
import { main, migrateCode } from '../bin/motionary.mjs';

const fx = (n: string) => JSON.parse(readFileSync(`test/fixtures/scene-v2/${n}`, 'utf8'));
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
let uninstall: (() => void) | undefined;
let warn: ReturnType<typeof vi.spyOn>;
beforeEach(() => { resetDeprecationWarnings(); warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); });
afterEach(() => { uninstall?.(); uninstall = undefined; vi.restoreAllMocks(); delete (Element.prototype as any).animate; });

function fakeWaapi() {
  const made: any[] = [];
  (Element.prototype as any).animate = function (frames: any, timing: any) { const a: any = { frames, timing, currentTime: 0, pause() {}, cancel() {} }; made.push(a); return a; };
  return made;
}
const root = () => { const r = document.createElement('div'); r.innerHTML = '<p></p><p></p><p></p><div class="a"></div>'; return r; };

describe('14.0 removals from the main entries', () => {
  it('normalizeAnimation is no longer exported by motionary/components/effects', () => {
    expect((effects as any).normalizeAnimation).toBeUndefined();
    expect(typeof effects.createPlayer).toBe('function');
  });
  it('the usa-codemod-5..10 bins are gone from package.json bin; 11, 12, 13 and motionary stay', () => {
    for (const n of [5, 6, 7, 8, 9, 10]) expect(pkg.bin[`usa-codemod-${n}`]).toBeUndefined();
    for (const n of [11, 12, 13]) expect(pkg.bin[`usa-codemod-${n}`]).toBe(`./bin/usa-codemod-${n}.mjs`);
    expect(pkg.bin.motionary).toBe('./bin/motionary.mjs');
  });
  it('lite, components, core and the root entry never import the compat layer', () => {
    for (const f of ['src/components/lite.ts', 'src/components/index.ts', 'src/core.ts', 'src/index.ts', 'src/components/effects/index.ts', 'src/components/effects/player.ts'])
      expect(readFileSync(f, 'utf8'), f).not.toMatch(/from ['"][^'"]*compat-v13/);
  });
});

describe('14.0 motionary/compat-v13', () => {
  it('is its own entry', () => {
    expect(pkg.exports['./compat-v13']).toBeTruthy();
    expect(pkg.exports['./compat-v13']).toEqual(pkg.exports['./components/compat-v13']);
    expect(COMPAT_V13.removedIn).toBe('14.0');
  });
  it('installCompatV13() lets <usa-player> read playground documents and unversioned animation JSON again (dev notice once)', () => {
    const made = fakeWaapi();
    uninstall = installCompatV13();
    createPlayer(root(), fx('playground.json')).destroy();
    expect(made.length).toBeGreaterThan(0);
    const n = made.length;
    createPlayer(root(), fx('player-unversioned.json')).destroy();
    expect(made.length).toBeGreaterThan(n);
    expect(warn).toHaveBeenCalled();
    expect(String(warn.mock.calls[0][0])).toMatch(/compat-v13|removed in 14\.0/);
    uninstall();
    uninstall = undefined;
    expect(() => createPlayer(root(), fx('playground.json'))).toThrow(/removed in 14\.0/);
  });
  it('upgradeLegacyAnimation() turns a legacy document into animation JSON v1 (pure)', () => {
    const a = upgradeLegacyAnimation(fx('player-unversioned.json'));
    expect(a).toMatchObject({ format: 'use-scroll-animate/animation', version: 1 });
    const p = upgradeLegacyAnimation(fx('playground.json'));
    expect(p!.tracks.length).toBeGreaterThan(0);
    expect(upgradeLegacyAnimation(fx('player-keyframes.json'))).toBeNull();
  });
  it('normalizeAnimation() still works from the compat entry, same result as 13.9', () => {
    const r = normalizeAnimation(fx('player-keyframes.json'));
    expect(r.tracks).toHaveLength(2);
    expect(r.duration).toBe(2000);
    expect(() => normalizeAnimation({})).toThrow(/tracks/);
  });
});

describe('14.0 `motionary codemod <n>` runs the old codemods', () => {
  it('codemod 6 runs bin/usa-codemod-6.mjs (dry run) and unknown numbers fail', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'cm-'));
    writeFileSync(join(dir, 'a.js'), "import { burst } from 'use-scroll-animate/components';\n");
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(await main(['codemod', '6', dir])).toBe(0);
    expect(await main(['codemod', '4'])).toBe(2);
    expect(await main(['codemod'])).toBe(2);
    log.mockRestore(); err.mockRestore();
  });
});

describe('14.0 `motionary migrate --code`', () => {
  it('rewrites the 14.0 import moves and leaves everything else alone', () => {
    const src = [
      "import { normalizeAnimation, createPlayer } from 'motionary/components/effects';",
      "import { validateSceneV2 } from 'motionary/components/scene-v2';",
      "const s = require('use-scroll-animate/components/scene-v2');",
      "import { timeline } from 'motionary';",
      '"scripts": { "up": "usa-codemod-7 --write" }',
    ].join('\n');
    const { code, changes } = migrateCode(src);
    expect(code).toContain("import { createPlayer } from 'motionary/components/effects';");
    expect(code).toContain("import { normalizeAnimation } from 'motionary/compat-v13';");
    expect(code).toContain("from 'motionary/scene'");
    expect(code).toContain("require('use-scroll-animate/scene')");
    expect(code).toContain("import { timeline } from 'motionary';");
    expect(code).toContain('motionary codemod 7 --write');
    expect(changes.length).toBe(4);
    expect(migrateCode(code).changes).toEqual([]);
    expect(migrateCode('<script src="https://cdn.jsdelivr.net/npm/motionary@13/dist/runtime.iife.js"></script>').code).toContain('motionary@14/dist/');
  });
  it('CLI: dry run by default, --write rewrites files, exit 0', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'mc-'));
    const f = join(dir, 'x.ts');
    writeFileSync(f, "import { validateSceneV2 } from 'motionary/components/scene-v2';\n");
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    expect(await main(['migrate', '--code', dir])).toBe(0);
    expect(readFileSync(f, 'utf8')).toContain('components/scene-v2');
    expect(await main(['migrate', '--code', dir, '--write'])).toBe(0);
    expect(readFileSync(f, 'utf8')).toContain("from 'motionary/scene'");
    log.mockRestore();
  });
});
