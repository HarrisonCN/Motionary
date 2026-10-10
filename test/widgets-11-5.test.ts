// 11.5: public API alignment — layer subpath aliases, motionary/angular parity, @deprecated old paths, doctor + codemod-12.
import { describe, it, expect } from 'vitest';
import { readFileSync, mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { LAYER_ALIASES, DEPRECATED_PATHS, REMOVED_IN, rewritePaths, findOldPaths } from '../bin/public-paths.mjs';
import { transform } from '../bin/usa-codemod-12.mjs';
import { doctor, main } from '../bin/motionary.mjs';
import { deprecatedDts, deprecatedFile } from '../scripts/gen-deprecated-types.mjs';
import * as angular from '../src/components/frameworks/angular';
import { USA_TAGS as REACT_TAGS } from '../src/components/frameworks/react';

const read = (f: string) => readFileSync(f, 'utf8');
const pkg = JSON.parse(read('package.json'));
const ex = pkg.exports as Record<string, any>;

describe('11.5: layer subpath aliases', () => {
  it('every layer and framework subpath exists', () => {
    for (const p of ['core', 'runtime', 'runtime/gl', 'components', 'components/ui', 'tooling/ai', 'tooling/design', 'tooling/manifest.json', 'tooling/manifest.schema.json', 'react', 'vue', 'svelte', 'solid', 'angular'])
      expect(ex[`./${p}`], p).toBeTruthy();
    for (const fw of ['react', 'vue', 'svelte', 'solid', 'angular']) expect(ex[`./components/${fw}`], fw).toBeTruthy();
  });
  it('aliases serve the same files as the paths they replace (0 bytes added)', () => {
    for (const [alias, target] of Object.entries(LAYER_ALIASES)) {
      const a = ex[`./${alias}`], t = ex[`./${target}`];
      if (typeof a === 'string') { expect(a, alias).toBe(t); continue; }
      expect(a.import.default, alias).toBe(t.import.default);
      expect(a.require.default, alias).toBe(t.require.default);
      expect(a.import.types, alias).not.toMatch(/deprecated/);
    }
    expect(ex['./core'].import.default).toBe(ex['./components/core'].import.default);
    expect(ex['./tooling/design'].import.default).toBe(ex['./design'].import.default);
  });
  it('old paths keep their JavaScript; only their types are the @deprecated declarations', () => {
    for (const [old, to] of Object.entries(DEPRECATED_PATHS)) {
      expect(ex[`./${to}`], `${old} → ${to}`).toBeTruthy();
      if (old.endsWith('.json')) continue;
      expect(ex[`./${old}`].import.types).toBe(`./dist/deprecated/${deprecatedFile(old)}.d.ts`);
      expect(ex[`./${old}`].require.types).toBe(`./dist/deprecated/${deprecatedFile(old)}.d.cts`);
      expect(ex[`./${old}`].import.default).toMatch(/^\.\/dist\/components\/[\w-]+\.js$/);
    }
    expect(REMOVED_IN).toBe('13.0');
    expect(pkg.scripts.build).toMatch(/gen-manifest\.mjs && node scripts\/gen-deprecated-types\.mjs/);
    expect(pkg.scripts['lint:package']).toContain('./tooling/manifest.json');
  });
  it('the generated declaration tags every export and points at the replacement', () => {
    const d = deprecatedDts('components/ai', 'tooling/ai', '../components/ai.js', [{ name: 'describeMotion', type: false }, { name: 'MotionIntent', type: true }]);
    expect(d).toContain("from '../components/ai.js'");
    expect(d.match(/@deprecated/g)!.length).toBe(2);
    expect(d).toContain('type MotionIntent,');
    expect(d).toContain("'motionary/tooling/ai'");
    expect(d).toContain('removed in 13.0');
  });
  it('nothing warns at runtime — imports stay side-effect free', () => {
    const s = read('src/components/frameworks/angular.ts');
    expect(s).not.toMatch(/console\.(warn|log)/);
    expect(s).not.toMatch(/^import .* from '@angular/m);
  });
});

describe('11.5: Angular parity', () => {
  it('motionary/angular exports the same building blocks as the other wrappers', () => {
    for (const n of ['usaInitializer', 'provideUsa', 'defineUsa', 'usaDetail', 'bindUsa', 'usaEventName', 'USA_TAGS', 'isUsaElement']) expect((angular as any)[n], n).toBeDefined();
    expect(angular.USA_TAGS).toEqual(REACT_TAGS);
    expect(angular.USA_TAGS.length).toBeGreaterThan(50);
    expect(angular.isUsaElement('usa-switch')).toBe(true);
    expect(angular.isUsaElement('div')).toBe(false);
    expect(angular.usaEventName('change')).toBe('usa:change');
  });
  it('provideUsa builds an APP_INITIALIZER provider without importing @angular/core', () => {
    const TOKEN = { name: 'APP_INITIALIZER' };
    const p = angular.provideUsa(TOKEN, ['ui']);
    expect(p.provide).toBe(TOKEN);
    expect(p.multi).toBe(true);
    expect(typeof p.useFactory()).toBe('function');
    p.useFactory()();
    expect(customElements.get('usa-tabs')).toBeTruthy();
    expect(angular.usaDetail(new CustomEvent('usa:change', { detail: { checked: true } }))).toEqual({ checked: true });
  });
});

describe('11.5: motionary doctor + usa-codemod-12', () => {
  const SRC = `import { createMotion } from 'motionary/components/core';\nimport { describeMotion } from "motionary/components/ai";\nimport { figmaToMotion } from 'motionary/design';\nimport { x } from 'use-scroll-animate/components/design';\nimport { usaInitializer } from 'motionary/components/angular';\nconst m = require('motionary/manifest.json');\nimport { ok } from 'motionary/core';\nimport 'motionary/components/corex';\nconst s = 'see motionary/components/ai docs';\n`;
  it('rewrites every old specifier, keeps new paths and plain text, is idempotent', () => {
    const { code, changes } = transform(SRC);
    expect(code).toContain("from 'motionary/core';\nimport { describeMotion } from \"motionary/tooling/ai\"");
    expect(code).toContain("from 'motionary/tooling/design'");
    expect(code).toContain("from 'use-scroll-animate/tooling/design'");
    expect(code).toContain("from 'motionary/angular'");
    expect(code).toContain("require('motionary/tooling/manifest.json')");
    expect(code).toContain("'motionary/components/corex'");
    expect(code).toContain("'see motionary/components/ai docs'");
    expect(changes.length).toBe(6);
    expect(transform(code).changes).toEqual([]);
    expect(rewritePaths(code).hits).toEqual([]);
  });
  it('doctor reports file:line and exits 1; a clean tree exits 0', () => {
    expect(findOldPaths(SRC).map((h) => h.line)).toEqual([1, 2, 3, 4, 5, 6]);
    const dir = mkdtempSync(join(tmpdir(), 'mdoc-'));
    mkdirSync(join(dir, 'src'));
    writeFileSync(join(dir, 'src', 'a.ts'), SRC);
    mkdirSync(join(dir, 'node_modules'));
    writeFileSync(join(dir, 'node_modules', 'b.js'), SRC);
    const found = doctor([dir]);
    expect(found.length).toBe(6);
    expect(found.every((f) => f.file.endsWith('a.ts'))).toBe(true);
    const r = spawnSync(process.execPath, ['bin/motionary.mjs', 'doctor', dir, '--json'], { encoding: 'utf8' });
    expect(r.status).toBe(1);
    expect(JSON.parse(r.stdout).deprecated.length).toBe(6);
    spawnSync(process.execPath, ['bin/usa-codemod-12.mjs', '--write', dir], { encoding: 'utf8' });
    const r2 = spawnSync(process.execPath, ['bin/motionary.mjs', 'doctor', join(dir, 'src')], { encoding: 'utf8' });
    expect(r2.status, r2.stdout).toBe(0);
    expect(main(['help'])).toBe(0);
  });
  it('bins and docs are wired', () => {
    expect(pkg.bin.motionary).toBe('./bin/motionary.mjs');
    expect(pkg.bin['usa-codemod-12']).toBe('./bin/usa-codemod-12.mjs');
    const d = read('docs/public-api.md');
    for (const s of ['motionary/tooling/ai', 'motionary/angular', 'npx motionary doctor', 'usa-codemod-12', 'No runtime warning']) expect(d).toContain(s);
    expect(read('docs/architecture.md')).toContain('public-api.md');
    for (const f of ['README.md', 'README_zh.md', 'README_ja.md']) expect(read(f), f).toContain('docs/public-api.md');
    expect(read('scripts/check-exports.mjs')).toContain("'motionary/angular'");
  });
});
