// 15.2 package size: the new studio-native entry must fit under the unchanged 14 MB unpacked npm limit. Genuine
// reductions first: docs/contract-report.json (machine-readable, packed) is written compact — same data, ~40 KB less.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

describe('15.2 package size', () => {
  it('docs/contract-report.json is compact JSON (one line + newline) with the same format / version / summary', () => {
    const s = readFileSync('docs/contract-report.json', 'utf8');
    expect(s.endsWith('\n')).toBe(true);
    expect(s.trimEnd().includes('\n')).toBe(false);
    const j = JSON.parse(s);
    expect(j.format).toBe('motionary/contract-report');
    expect(j.version).toBe(1);
    expect(j.summary.components).toBeGreaterThan(200);
    expect(readFileSync('scripts/contract-audit.mjs', 'utf8')).toContain("JSON.stringify({ format: 'motionary/contract-report', version: 1, summary: summary(rows), components: rows }) + '\\n'");
  });

  it('the unpacked limit is unchanged (14 MB); planning docs and source maps stay out of the package', () => {
    expect(readFileSync('scripts/check-pack.mjs', 'utf8')).toContain('unpacked: 14 * 1024 * 1024');
    const files = JSON.parse(readFileSync('package.json', 'utf8')).files;
    expect(files).toContain('!dist/**/*.map');
    expect(files).toContain('!docs/ROADMAP.md');
  });
});
