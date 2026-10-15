// 16.2 package size: the new studio-plugins entry pushed the npm tarball to 14.01 MB unpacked (limit 14 MB, unchanged).
// Genuine reduction, no limit raise: docs/contract-report.json (~61 KB) + docs/contract-report.md (~6 KB) are the CI
// output of the component-contract audit (scripts/contract-audit.mjs --check regenerates and compares them). No packaged
// code reads them (bin/, dist/, figma-plugin/, templates/); they stay in the repository and on GitHub, where
// docs/component-contract.md links them, and leave the npm tarball.
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';

describe('16.2 package size', () => {
  it('the contract audit reports are excluded from the npm files list; docs stays packed', () => {
    const files: string[] = JSON.parse(readFileSync('package.json', 'utf8')).files;
    expect(files).toContain('!docs/contract-report.json');
    expect(files).toContain('!docs/contract-report.md');
    expect(files).toContain('docs');
  });
  it('the reports still exist in the repo and the unpacked limit is unchanged (14 MB)', () => {
    expect(existsSync('docs/contract-report.json')).toBe(true);
    expect(existsSync('docs/contract-report.md')).toBe(true);
    expect(readFileSync('scripts/check-pack.mjs', 'utf8')).toContain('unpacked: 14 * 1024 * 1024');
    expect(readFileSync('docs/component-contract.md', 'utf8')).toMatch(/github\.com\/HarrisonCN\/Motionary\/blob\/main\/docs\/contract-report\.md/);
  });
});
