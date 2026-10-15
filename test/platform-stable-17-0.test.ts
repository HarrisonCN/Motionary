// 17.0.0 — platform stable (major). Tests first (failing-before: v17.0.0/failing-before.txt).
// - Removes exactly what 16.9 announced (DEPRECATIONS_V17): the motionary/scene/v3-preview path (+ components/
//   scene-v3-preview) and the CLI's v15 project migration (doctor --v15 / migrate --to 15 → exit 2, pointing to
//   `npx motionary@v16-lts …`). doctor --v17 / migrate --to 17 stay so 16.x projects can still upgrade.
// - Freezes three contracts: Scene Format v3, Studio plugin API v1 (no longer @experimental), motionary-mcp 3.x;
//   docs/stability.md states them and the LTS policy (v16-lts until 18.0 ships). Lite stays ≤ 70 KB gzip.
import { describe, it, expect, vi } from 'vitest';
import { mkdtempSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const ROOT = join(__dirname, '..');
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');
const pkg = JSON.parse(read('package.json'));
const CLI: any = await import(join(ROOT, 'bin/motionary.mjs'));

describe('17.0 removes what 16.9 announced', () => {
  it('motionary/scene/v3-preview is gone (exports, entry, alias, source)', async () => {
    expect(pkg.exports['./scene/v3-preview']).toBeUndefined();
    expect(pkg.exports['./components/scene-v3-preview']).toBeUndefined();
    expect(pkg.exports['./scene/v3']).toBeDefined();
    expect(existsSync(join(ROOT, 'src/components/scene/v3-preview.ts'))).toBe(false);
    const { COMPONENT_ENTRIES } = await import(join(ROOT, 'scripts/categories.mjs'));
    expect(COMPONENT_ENTRIES['scene-v3-preview']).toBeUndefined();
    const { LAYER_ALIASES } = await import(join(ROOT, 'bin/public-paths.mjs'));
    expect(LAYER_ALIASES['scene/v3-preview']).toBeUndefined();
  });
  it('doctor --v15 / migrate --to 15 exit 2 and point to the 16.x CLI (v16-lts); the v15 functions are gone', async () => {
    expect(CLI.doctorV15).toBeUndefined();
    expect(CLI.migrateTo15).toBeUndefined();
    const d = mkdtempSync(join(tmpdir(), 'mo-17-'));
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    expect(await CLI.main(['doctor', '--v15', d])).toBe(2);
    expect(await CLI.main(['migrate', '--to', '15', d])).toBe(2);
    const said = err.mock.calls.map((c) => String(c[0]));
    expect(said).toHaveLength(2);
    for (const s of said) expect(s).toMatch(/removed in 17\.0.*npx motionary@v16-lts/);
    err.mockRestore();
    log.mockRestore();
  });
  it('doctor --v17 / migrate --to 17 stay for projects coming from 16.x', () => {
    expect(CLI.DEPRECATIONS_V17.map((x: any) => x.id)).toEqual(['scene-v3-preview', 'cli-migrate-15']);
    expect(typeof CLI.doctorV17).toBe('function');
    expect(typeof CLI.migrateTo17).toBe('function');
  });
});

describe('17.0 freezes the platform contracts', () => {
  it('Studio plugin API v1 is stable (PLUGIN_API_VERSION 1, not @experimental)', async () => {
    const P = await import('../src/components/studio/plugins');
    expect(P.PLUGIN_API_VERSION).toBe(1);
    expect(read('src/components/studio/plugins.ts')).not.toMatch(/@experimental/);
    expect(read('docs/studio-plugins.md')).toMatch(/plugin API v1.*stable since 17\.0/i);
  });
  it('Scene v3 is stable and motionary-mcp stays 3.x', async () => {
    const V3 = await import('../src/components/scene/v3');
    expect(V3.SCENE_V3_STATUS).toBe('stable');
    expect(read('bin/motionary-mcp.mjs')).toMatch(/name: 'motionary-mcp', version: '3\.\d+\.\d+'/);
  });
  it('docs/stability.md states the frozen contracts and the LTS policy; versions.md names v16-lts', () => {
    const s = read('docs/stability.md');
    for (const a of ['scene-v3', 'plugin-api-v1', 'mcp-3', 'lts']) expect(s).toContain(`<a id="${a}"></a>`);
    expect(s).toMatch(/v16-lts/);
    expect(s).toMatch(/18\.0/);
    expect(read('docs/versions.md')).toMatch(/v16-lts/);
    expect(read('docs/deprecations-v17.md')).toMatch(/removed in 17\.0\.0/i);
  });
  it('lite keeps its 70 KB gzip limit', () => {
    const lite = JSON.parse(read('size-budget.json')).find((e: any) => e.name === "import 'motionary/components/lite'");
    expect(lite.limit).toBe(70 * 1024);
  });
});
