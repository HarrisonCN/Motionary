// 16.9.0 — growth docs (owner review 2026-10-15, item 5) and the supply-chain links in the READMEs (item 4):
// - docs/compare/: one page per library (AOS, GSAP + ScrollTrigger, Lenis, Motion) + an index whose size table matches
//   docs/compare/sizes.json (measured by scripts/compare-sizes.mjs); every page cites the other library's own docs.
// - examples/stackblitz/: one Vite project per framework, each linked from its README with a StackBlitz URL.
// - every README shows the OpenSSF Scorecard badge and links docs/supply-chain.md, docs/cdn-sri.md and docs/compare.
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(__dirname, '..');
const read = (f: string) => readFileSync(join(ROOT, f), 'utf8');
const READMES = ['README.md', 'README_zh.md', 'README_ja.md'];
const PAGES: Record<string, string> = { aos: 'github.com/michalsnik/aos', gsap: 'gsap.com/docs', lenis: 'github.com/darkroomengineering/lenis', motion: 'motion.dev/docs' };

describe('16.9 comparison pages', () => {
  it('one page per library, each citing that library\'s own docs and the size table', () => {
    for (const [p, src] of Object.entries(PAGES)) {
      const f = `docs/compare/${p}.md`;
      expect(existsSync(join(ROOT, f)), f).toBe(true);
      const s = read(f);
      expect(s, f).toContain(src);
      expect(s, f).toContain('./README.md#size-gzip-bytes');
    }
  });
  it('the index size table matches sizes.json (measured by scripts/compare-sizes.mjs)', () => {
    const data = JSON.parse(read('docs/compare/sizes.json'));
    const idx = read('docs/compare/README.md');
    expect(existsSync(join(ROOT, 'scripts/compare-sizes.mjs'))).toBe(true);
    expect(data.rows.length).toBeGreaterThanOrEqual(6);
    for (const r of data.rows) expect(idx, `${r.library} ${r.what}`).toContain(r.gzip.toLocaleString('en-US'));
    for (const lib of ['aos', 'gsap', 'lenis', 'motion', 'motionary']) expect(data.rows.some((r: any) => r.library === lib), lib).toBe(true);
  });
});

describe('16.9 StackBlitz examples', () => {
  it('one Vite project per framework, each linked with a StackBlitz URL', () => {
    const idx = read('examples/stackblitz/README.md');
    for (const fw of ['vanilla', 'react', 'vue', 'svelte']) {
      const pkg = JSON.parse(read(`examples/stackblitz/${fw}/package.json`));
      expect(pkg.dependencies.motionary, fw).toMatch(/^\^\d+\./);
      expect(pkg.scripts.build, fw).toBe('vite build');
      expect(idx, fw).toContain(`https://stackblitz.com/github/HarrisonCN/Motionary/tree/main/examples/stackblitz/${fw}`);
    }
  });
});

describe('16.9 README supply-chain + growth links', () => {
  it('each README shows the Scorecard badge and links supply chain, SRI, comparisons and StackBlitz', () => {
    for (const f of READMES) {
      const s = read(f);
      expect(s, f).toContain('api.securityscorecards.dev/projects/github.com/HarrisonCN/Motionary/badge');
      expect(s, f).toContain('docs/supply-chain.md');
      expect(s, f).toContain('docs/cdn-sri.md');
      expect(s, f).toContain('docs/compare');
      expect(s, f).toContain('examples/stackblitz');
    }
  });
});
