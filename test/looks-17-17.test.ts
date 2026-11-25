import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { LOOK_FAMILIES, LOOK_FEELS, LOOK_PALETTES, LOOK_TREATMENTS, lookInfo, lookNames, lookRule, lookTokens } from '../src/components/widgets';
import { DARK_PALETTES, contrastRatio } from '../src/components/widgets/looks';
import { MICRO_FEELS } from '../src/components/physics';

const NEW_PALETTES = ['jade', 'saffron', 'denim', 'orchid', 'rust', 'spruce', 'flamingo', 'periwinkle', 'onyx', 'nebula'];
const FEELS = ['default', ...Object.keys(MICRO_FEELS)];
const read = (f: string) => readFileSync(f, 'utf8');
const isNew = (n: string) => NEW_PALETTES.some((p) => n.endsWith(`-${p}`));

describe('17.17 looks: ten more palettes', () => {
  it('adds ten palettes after the first thirty, 170 more looks per family, 2040 in all', () => {
    expect(Object.keys(LOOK_PALETTES)).toHaveLength(40);
    expect(Object.keys(LOOK_PALETTES).slice(30)).toEqual(NEW_PALETTES);
    for (const family of LOOK_FAMILIES) {
      expect(lookNames(family)).toHaveLength(680);
      expect(lookNames(family).filter(isNew)).toHaveLength(170);
    }
    expect(new Set(lookNames()).size).toBe(2040);
  });

  it('reads the new names back, with onyx and nebula as the new dark palettes', () => {
    expect(DARK_PALETTES).toEqual(['midnight', 'ember', 'aurora', 'velvet', 'obsidian', 'abyss', 'onyx', 'nebula']);
    expect(lookInfo('solid-jade')).toMatchObject({ family: 'ui', treatment: 'solid', palette: 'jade', dark: false });
    expect(lookInfo('cupertino-denim')).toMatchObject({ family: 'parts', palette: 'denim' });
    expect(lookInfo('polaroid-flamingo')).toMatchObject({ family: 'motion', palette: 'flamingo' });
    expect(lookInfo('solid-onyx')?.dark).toBe(true);
    expect(lookInfo('pill-nebula')?.dark).toBe(true);
    expect(lookTokens('solid-spruce')['--mo-kit-accent']).toBe('#115e59');
  });

  it('keeps every new look readable (WCAG AA text, 3:1 accent)', () => {
    const hex = (c: string) => /^#[0-9a-f]{6}$/i.test(c);
    for (const name of lookNames().filter(isNew)) {
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
});

describe('17.17 looks: a feel for every look', () => {
  it('gives every treatment of every family a known feel, with all eight in use', () => {
    const used = new Set<string>();
    for (const family of LOOK_FAMILIES) {
      expect(Object.keys(LOOK_FEELS[family]).sort()).toEqual(Object.keys(LOOK_TREATMENTS[family]).sort());
      for (const feel of Object.values(LOOK_FEELS[family])) {
        expect(FEELS).toContain(feel);
        used.add(feel);
      }
    }
    expect([...used].sort()).toEqual([...FEELS].sort());
  });

  it('puts the feel on each look and in its rule, outside the kit tokens', () => {
    expect(lookInfo('brutal-indigo')?.feel).toBe('heavy');
    expect(lookInfo('clay-jade')?.feel).toBe('playful');
    expect(lookInfo('console-onyx')?.feel).toBe('crisp');
    expect(lookInfo('solid-indigo')?.feel).toBe('default');
    for (const name of lookNames()) {
      const l = lookInfo(name)!;
      expect(lookRule(name), name).toContain(`--mo-feel:${l.feel}`);
      expect(Object.keys(lookTokens(name))).not.toContain('--mo-feel');
    }
  });

  it('documents the palettes and the feels, and shows the new count', () => {
    const doc = read('docs/looks-17-11.md');
    for (const p of NEW_PALETTES) expect(doc, p).toContain(`| \`${p}\` |`);
    expect(doc).toContain('## Feel (17.17)');
    for (const f of FEELS) expect(doc, f).toContain(`| \`${f}\` |`);
    expect(doc).toContain('`comic-nebula`');
    expect(read('showcase/looks.html')).toContain("nebula: '星云'");
    expect(read('showcase/home-collections.js')).toContain('total: 2040');
    for (const f of ['README.md', 'README_zh.md', 'README_ja.md']) {
      expect(read(f), f).toContain('2040');
      expect(read(f), f).toContain('--mo-feel');
    }
    expect(read('CHANGELOG.md')).toContain('17.17 looks');
  });
});
