import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const read = (file: string) => readFileSync(`${process.cwd()}/${file}`, 'utf8');

describe('6.0.1 — showcase header fits a phone viewport', () => {
  const css = read('showcase/gallery.css');
  const html = read('showcase/components.html');

  it('lets the nav shrink and tightens it at ≤480px (no horizontal page overflow at 390px)', () => {
    expect(css).toMatch(/\.gallery-page \.topbar-actions \{ min-width: 0; \}/);
    const phone = css.slice(css.indexOf('@media (max-width: 480px)'));
    expect(phone).toMatch(/\.nav-link\[href="\.\/"\] \{ display: none; \}/);
    expect(phone).toMatch(/\.brand-store \{ display: none; \}/);
  });

  it('only hides links that stay reachable elsewhere on the page', () => {
    // the brand links to the store, and GitHub stays in the footer
    expect(html).toMatch(/<a class="brand" href="\.\/"/);
    expect(html.slice(html.indexOf('<footer'))).toContain('https://github.com/HarrisonCN/motionary');
    expect(css).toMatch(/@media \(max-width: 374px\)[^\n]*a\.icon-btn\[href\^="https:\/\/github\.com"\]/);
  });
});
