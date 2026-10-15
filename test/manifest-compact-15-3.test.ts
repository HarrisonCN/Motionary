// 15.3 size: dist/manifest.json (npm motionary/tooling/manifest.json, Pages /components.json) is written compact.
// Every consumer parses it as JSON (bin/motionary-mcp loadManifest, check-peer-docs, gen-framework-types,
// check-exports require(), Pages cp) — nothing reads it as text — so the 2-space indentation was pure package weight
// (~100 KB unpacked) under the unchanged 14 MB unpacked limit.
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
const ROOT = join(__dirname, '..');

describe('15.3 compact dist/manifest.json', () => {
  it('gen-manifest writes the manifest without indentation', () => {
    const src = readFileSync(join(ROOT, 'scripts/gen-manifest.mjs'), 'utf8');
    expect(src).toMatch(/writeFileSync\(join\(ROOT, 'dist\/manifest\.json'\), JSON\.stringify\(m\) \+ '\\n'\)/);
  });
  it.runIf(existsSync(join(ROOT, 'dist/manifest.json')))('built manifest is one line and parses to the same format', () => {
    const t = readFileSync(join(ROOT, 'dist/manifest.json'), 'utf8');
    expect(t.trimEnd().includes('\n')).toBe(false);
    expect(JSON.parse(t).format).toBe('motionary/components');
  });
});
