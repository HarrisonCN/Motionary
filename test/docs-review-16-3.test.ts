// 16.3.0 — maintainer review (2026-10-15): README tops, generated versions / size tables, stability, SRI, source maps.
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(__dirname, '..');
const read = (f: string) => readFileSync(join(ROOT, f), 'utf8');
const READMES = ['README.md', 'README_zh.md', 'README_ja.md'];

describe('16.3 docs review', () => {
  it('each README starts with the demo GIF and a three-line quick start, without version banners', () => {
    for (const f of READMES) {
      const r = read(f);
      const top = r.slice(0, r.indexOf('\n## '));
      expect(top, f).toContain('docs/images/demo.gif');
      expect(top, f).toContain('npm i motionary');
      expect(top, f).toContain('ScrollAnimate.init()');
      expect(top, f).not.toMatch(/^> 1\d\.\d[:：]/m);
      expect(top, f).toContain('CHANGELOG.md');
    }
    expect(existsSync(join(ROOT, 'docs/images/demo.gif'))).toBe(true);
  });
  it('versions, CDN majors and size tables are generated (scripts/readme-sync.mjs)', async () => {
    const major = JSON.parse(read('package.json')).version.split('.')[0];
    for (const f of [...READMES, 'docs/versions.md']) {
      const s = read(f);
      for (const m of s.matchAll(/https:\/\/(?:unpkg\.com|cdn\.jsdelivr\.net\/npm)\/(?:motionary|use-scroll-animate)@(\d+)\//g)) expect(m[1], f).toBe(major);
    }
    for (const f of READMES) {
      const s = read(f);
      expect(s, f).toContain('<!-- size-table:start -->');
      expect(s, f).not.toMatch(/13\.0\.0 (build|构建|ビルド)/);
      expect(s, f).toContain('<!--ver:major-->');
    }
    expect(read('package.json')).toContain('node scripts/readme-sync.mjs --check');
    const { README_ROWS } = await import('../scripts/readme-sync.mjs');
    const budgets = JSON.parse(read('size-budget.json')).map((b: { name: string }) => b.name);
    for (const [, name] of README_ROWS) expect(budgets, name).toContain(name);
  });
  it('stable core vs experimental is documented and experimental pages say so', () => {
    const s = read('docs/stability.md');
    for (const x of ['motionary/studio/plugins', 'motionary/studio/budget', 'motionary-mcp', 'Figma', 'Experimental', 'deferred']) expect(s, x).toContain(x);
    for (const f of ['docs/studio.md', 'docs/studio-plugins.md', 'docs/studio-budget.md', 'docs/mcp.md']) expect(read(f), f).toContain('**Experimental**');
    for (const f of READMES) expect(read(f), f).toContain('docs/stability.md');
  });
  it('production CDN: exact version + SRI page; source maps described as they are', () => {
    const c = read('docs/cdn-sri.md');
    expect(c).toContain('<!-- sri:start -->');
    expect(c).toContain('integrity');
    expect(read('README.md')).toContain('docs/cdn-sri.md');
    expect(read('README.md')).not.toContain('attached to each GitHub release instead');
    expect(read('.github/workflows/release.yml')).toContain('sourcemaps.tgz');
    const files = JSON.parse(read('package.json')).files;
    expect(files).toContain('!docs/size-report.json');
    expect(files).toContain('!docs/images/demo.gif');
  });
});
