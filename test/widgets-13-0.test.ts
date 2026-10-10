// 13.0: discover · copy · run — removed paths, CDN @13, stable tooling.
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { DEPRECATED_PATHS, LAYER_ALIASES, PATHS_REMOVED, REMOVED_IN } from '../bin/public-paths.mjs';
import { RUNTIME_VERSION } from '../src/runtime/registry';

const read = (f: string) => readFileSync(f, 'utf8');
const pkg = JSON.parse(read('package.json'));
const OLD = /(['"`])(motionary|use-scroll-animate)\/(components\/(core|ai|design|angular)|design|manifest(\.schema)?\.json)\1/;

describe('13.0: removed paths', () => {
  it('the 11.5 deprecated subpaths are gone from exports; their replacements serve the same dist files', () => {
    expect(PATHS_REMOVED).toBe(true);
    expect(REMOVED_IN).toBe('13.0');
    for (const [old, to] of Object.entries(DEPRECATED_PATHS)) {
      expect(pkg.exports[`./${old}`], old).toBeUndefined();
      expect(pkg.exports[`./${to}`], to).toBeTruthy();
    }
    expect(pkg.exports['./tooling/ai'].import.default).toBe('./dist/components/ai.js');
    expect(pkg.exports['./angular'].import.default).toBe('./dist/components/angular.js');
    expect(pkg.exports['./tooling/manifest.json']).toBe('./dist/manifest.json');
    expect(Object.keys(LAYER_ALIASES)).toContain('tooling/design');
  });
  it('docs, READMEs and sources use the layer subpaths', () => {
    const files = ['README.md', 'README_zh.md', 'README_ja.md', 'AGENTS.md', 'figma-plugin/README.md', ...readdirSync('docs').filter((f) => f.endsWith('.md') && !/^(upgrading-|ROADMAP|public-api|version-compat)/.test(f)).map((f) => `docs/${f}`), 'src/components/ai/index.ts', 'src/components/design/index.ts', 'src/components/frameworks/angular.ts'];
    for (const f of files) expect(read(f), f).not.toMatch(OLD);
  });
});

describe('13.0: version, CDN, stable tooling', () => {
  it('version 13, CDN major @13', () => {
    expect(pkg.version).toMatch(/^13\./);
    expect(RUNTIME_VERSION).toBe('13.0.0');
    expect(read('README.md')).toContain('motionary@13/dist/');
    expect(read('README.md')).not.toMatch(/motionary@12\//);
    expect(read('showcase/components-catalog.js')).toContain("VERSION_RANGE = '13'");
  });
  it('upgrading guide, codemod, stable tooling in the README', () => {
    const u = read('docs/upgrading-13.md');
    expect(u).toContain('13.0 is released');
    expect(pkg.bin['usa-codemod-13']).toBe('./bin/usa-codemod-13.mjs');
    const r = read('README.md');
    expect(r).toContain('> 13.0: discover, copy, run');
    for (const s of ['validate_snippet', 'check_compat', 'figma-plugin', 'showcase/run.html', 'motionary export', 'motionary compat']) expect(r, s).toContain(s);
    expect(pkg.dependencies).toBeUndefined();
  });
});
