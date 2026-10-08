import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(__dirname, '..');
const read = (f: string) => readFileSync(resolve(root, f), 'utf8');

describe('6.1.1 — renamed to Motionary (no breaking change)', () => {
  it('publishes as motionary with a ≤ 350-char description that names the old package', () => {
    const pkg = JSON.parse(read('package.json'));
    expect(pkg.name).toBe('motionary');
    expect(pkg.description.length).toBeLessThanOrEqual(350);
    expect(pkg.description).toContain('formerly use-scroll-animate');
    expect(pkg.keywords).toContain('motionary');
    expect(pkg.repository.url).toContain('HarrisonCN/motionary');
    expect(Object.keys(pkg.bin)).toEqual(expect.arrayContaining(['usa-codemod-6']));
  });

  it('READMEs are rebranded, mention the old name and link the four showcase pages', () => {
    for (const f of ['README.md', 'README_zh.md', 'README_ja.md']) {
      const r = read(f);
      expect(r, f).toMatch(/^<div align="center">\n\n# Motionary\n/);
      expect(r, f).toContain('use-scroll-animate');
      for (const page of ['showcase/', 'showcase/components.html', 'showcase/playground.html', 'showcase/story.html']) expect(r, f).toContain(`https://harrisoncn.github.io/motionary/${page}`);
      expect(r, f).toContain('https://unpkg.com/motionary@6/dist/index.umd.js');
      for (const fw of ['motionary/react', 'motionary/vue', 'motionary/svelte', 'motionary/solid', 'motionary/components/angular']) expect(r, `${f} ${fw}`).toContain(fw);
      expect(r, f).toContain('./docs/upgrading-6.md');
      expect(r, f).toContain('./docs/upgrading-5.md');
      expect(r, f).toContain('./docs/ROADMAP.md');
    }
  });

  it('showcase pages carry Motionary titles and Open Graph meta; snippets import motionary', () => {
    for (const f of ['index.html', 'components.html', 'playground.html', 'story.html']) {
      const h = read(`showcase/${f}`);
      expect(h, f).toMatch(/<title>Motionary · /);
      expect(h, f).toContain('property="og:title"');
      expect(h, f).toContain('https://harrisoncn.github.io/motionary/showcase/assets/og-motionary.png');
      expect(h, f).not.toMatch(/<title>[^<]*use-scroll-animate/);
    }
    expect(read('showcase/codegen.js')).toContain("export const PKG = 'motionary';");
  });

  it('keeps the compatibility surface: tags, globals, shared preset table key, player format id', () => {
    expect(read('src/presets.ts')).toContain("Symbol.for('use-scroll-animate.presets')");
    expect(read('src/components/effects/player.ts')).toContain("ANIMATION_FORMAT = 'use-scroll-animate/animation'");
    expect(read('rollup.config.mjs')).toContain("name: 'ScrollAnimate'");
    expect(read('showcase/playground-core.js')).toContain("format: 'use-scroll-animate/playground'");
  });
});
