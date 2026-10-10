// 12.9: 13.0 prep — usa-codemod-13, upgrading-13.md.
import { describe, it, expect, vi } from 'vitest';
import { readFileSync, mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { transform, rewriteCdnMajor, run, TARGET_MAJOR } from '../bin/usa-codemod-13.mjs';
import { DEPRECATED_PATHS, REMOVED_IN } from '../bin/public-paths.mjs';

const read = (f: string) => readFileSync(f, 'utf8');
const SRC = `import { describeMotion } from 'motionary/components/ai';\nimport tokens from "use-scroll-animate/manifest.json";\nel.addEventListener('usa-story-step', f);\n<script src="https://unpkg.com/motionary@12/dist/components.umd.js"></script>\n<script src="https://cdn.jsdelivr.net/npm/motionary@11/dist/runtime.iife.js"></script>\n<script src="https://unpkg.com/motionary@12.4.0/dist/widgets.umd.js"></script>\n`;

describe('12.9 usa-codemod-13', () => {
  it('rewrites removed paths, legacy events and CDN majors; exact pins stay; idempotent', () => {
    expect(TARGET_MAJOR).toBe('13');
    expect(REMOVED_IN).toBe('13.0');
    expect(Object.keys(DEPRECATED_PATHS).length).toBe(7);
    const { code, changes } = transform(SRC);
    expect(code).toContain("'motionary/tooling/ai'");
    expect(code).toContain('"use-scroll-animate/tooling/manifest.json"');
    expect(code).toContain("'usa:step'");
    expect(code).toContain('https://unpkg.com/motionary@13/dist/components.umd.js');
    expect(code).toContain('https://cdn.jsdelivr.net/npm/motionary@13/dist/runtime.iife.js');
    expect(code).toContain('motionary@12.4.0/dist/widgets.umd.js');
    expect(changes.length).toBe(5);
    expect(transform(code).changes).toEqual([]);
    expect(rewriteCdnMajor('https://unpkg.com/motionary@6/dist/x.js').hits).toEqual([]);
  });
  it('CLI: dry run, then --write', () => {
    const dir = mkdtempSync(join(tmpdir(), 'cm13-'));
    mkdirSync(join(dir, 'src'));
    writeFileSync(join(dir, 'src/a.ts'), SRC);
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    try {
      expect(run([join(dir, 'src')])).toEqual({ files: 1, edits: 5 });
      expect(read(join(dir, 'src/a.ts'))).toBe(SRC);
      run(['--write', join(dir, 'src')]);
      expect(read(join(dir, 'src/a.ts'))).toContain('motionary/tooling/ai');
    } finally {
      log.mockRestore();
    }
  });
  it('bin, doctor, deprecated types and docs point at it', () => {
    expect(JSON.parse(read('package.json')).bin['usa-codemod-13']).toBe('./bin/usa-codemod-13.mjs');
    expect(read('bin/motionary.mjs')).toContain('npx usa-codemod-13 --write');
    expect(read('scripts/gen-deprecated-types.mjs')).toContain('npx usa-codemod-13 --write');
    const u = read('docs/upgrading-13.md');
    for (const p of Object.keys(DEPRECATED_PATHS)) expect(u).toContain(`motionary/${p}`);
    expect(read('README.md')).toContain('docs/upgrading-13.md');
  });
});
