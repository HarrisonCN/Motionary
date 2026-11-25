import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { LOOK_FAMILIES, LOOK_PALETTES, lookInfo, lookNames, lookTokens } from '../src/components/widgets';
import { DARK_PALETTES, contrastRatio } from '../src/components/widgets/looks';

const NEW_PALETTES = ['lavender', 'moss', 'copper', 'lagoon', 'berry', 'sage', 'espresso', 'navy', 'obsidian', 'abyss'];
const read = (f: string) => readFileSync(f, 'utf8');

describe('17.15 looks: ten more palettes', () => {
  it('adds ten palettes after the first twenty, 170 more looks per family, 1530 in all', () => {
    expect(Object.keys(LOOK_PALETTES)).toHaveLength(30);
    expect(Object.keys(LOOK_PALETTES).slice(20)).toEqual(NEW_PALETTES);
    for (const family of LOOK_FAMILIES) {
      expect(lookNames(family)).toHaveLength(510);
      expect(lookNames(family).filter((n) => NEW_PALETTES.some((p) => n.endsWith(`-${p}`)))).toHaveLength(170);
    }
    expect(lookNames()).toHaveLength(1530);
    expect(new Set(lookNames()).size).toBe(1530);
  });

  it('reads each new name back, with obsidian and abyss as the new dark palettes', () => {
    expect(DARK_PALETTES).toEqual(['midnight', 'ember', 'aurora', 'velvet', 'obsidian', 'abyss']);
    expect(lookInfo('solid-lavender')).toMatchObject({ family: 'ui', treatment: 'solid', palette: 'lavender', dark: false });
    expect(lookInfo('frosted-lagoon')).toMatchObject({ family: 'parts', palette: 'lagoon' });
    expect(lookInfo('duotone-copper')).toMatchObject({ family: 'motion', palette: 'copper' });
    expect(lookInfo('solid-obsidian')?.dark).toBe(true);
    expect(lookInfo('pill-abyss')?.dark).toBe(true);
    expect(lookTokens('solid-navy')['--mo-kit-accent']).toBe('#1e3a8a');
  });

  it('keeps every new look readable (WCAG AA text, 3:1 accent)', () => {
    const hex = (c: string) => /^#[0-9a-f]{6}$/i.test(c);
    for (const name of lookNames().filter((n) => NEW_PALETTES.some((p) => n.endsWith(`-${p}`)))) {
      const l = lookInfo(name)!;
      expect(contrastRatio(l.ink, l.bg), name).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(l.onAccent, l.accent), name).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(l.accent, l.bg), name).toBeGreaterThanOrEqual(3);
      if (hex(l.cta) && hex(l.onCta)) expect(contrastRatio(l.onCta, l.cta), name).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('turns the duotone filter to each new palette hue', () => {
    const filters = new Set(NEW_PALETTES.map((p) => lookTokens(`duotone-${p}`)['--mo-kit-media-filter']));
    expect(filters.size).toBeGreaterThan(5);
  });

  it('documents the new palettes and shows the new count', () => {
    const doc = read('docs/looks-17-11.md');
    for (const p of NEW_PALETTES) expect(doc, p).toContain(`| \`${p}\` |`);
    expect(doc).toContain('`solid-abyss`');
    expect(read('showcase/looks.html')).toContain("abyss: '深渊'");
    expect(read('showcase/home-collections.js')).toContain('total: 1530');
    for (const f of ['README.md', 'README_zh.md', 'README_ja.md']) expect(read(f), f).toContain('1530');
    expect(read('CHANGELOG.md')).toContain('17.15 looks');
  });
});
