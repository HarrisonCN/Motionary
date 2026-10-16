// 17.0: `motionary migrate --code` rewrites old CDN major pins to the CDN major of the installed package
// (17.0.0-rc.1 still rewrote to @16 and left @16 pins alone — found by verify170 on the published rc.1).
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(__dirname, '..');
const CLI: any = await import(join(ROOT, 'bin/motionary.mjs'));
const MAJOR = String(JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).version).split('.')[0];

describe('17.0 migrate --code: CDN major = the package major', () => {
  it('rewrites @10 … @(major − 1) pins of both names to @<major>, idempotent, current-major pins untouched', () => {
    const src = `<script src="https://unpkg.com/motionary@16/dist/index.umd.js"></script>\n<script src="https://cdn.jsdelivr.net/npm/use-scroll-animate@12/dist/x.js"></script>\nimport 'https://esm.sh/motionary@${MAJOR}/dist/components.js';`;
    const r = CLI.migrateCode(src);
    expect(r.code).toContain(`motionary@${MAJOR}/dist/index.umd.js`);
    expect(r.code).toContain(`use-scroll-animate@${MAJOR}/dist/x.js`);
    expect(r.code).not.toMatch(/@1[0-6]\//);
    expect(r.changes).toEqual([`motionary@16/ → motionary@${MAJOR}/ (CDN major)`, `use-scroll-animate@12/ → use-scroll-animate@${MAJOR}/ (CDN major)`]);
    expect(CLI.migrateCode(r.code).changes).toEqual([]);
  });
  it('the CLI does not hardcode a CDN major in its rewrite', () => {
    const bin = readFileSync(join(ROOT, 'bin/motionary.mjs'), 'utf8');
    expect(bin).not.toMatch(/\$\{pkg\}@1\d\b/);
  });
});
