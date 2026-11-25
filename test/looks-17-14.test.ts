import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { LOOK_FAMILIES, LOOK_PALETTES, LOOK_TREATMENTS, lookInfo, lookNames, lookTokens } from '../src/components/widgets';
import { DARK_PALETTES, contrastRatio } from '../src/components/widgets/looks';

const NEW_TREATMENTS = {
  ui: ['clay', 'neumorph', 'retro', 'pill', 'editorial', 'sketch', 'luxe', 'synth'],
  parts: ['tonal', 'acrylic', 'cupertino', 'compact', 'skeuo', 'inset', 'hairline', 'dusk'],
  motion: ['charcoal', 'infrared', 'blockbuster', 'dreamy', 'matte', 'thermal', 'nightvision', 'comic'],
} as const;
const NEW_PALETTES = ['cherry', 'olive', 'cobalt', 'plum', 'sand', 'teal', 'aurora', 'velvet'];
const OLD_PALETTES = ['indigo', 'ocean', 'forest', 'sunset', 'rose', 'grape', 'amber', 'slate', 'mint', 'coral', 'midnight', 'ember'];

describe('17.14 looks: over two hundred more per family', () => {
  it('adds eight treatments to each family and eight palettes, keeping every 17.11 name', () => {
    expect(Object.keys(LOOK_PALETTES).slice(0, 20)).toEqual([...OLD_PALETTES, ...NEW_PALETTES]);
    for (const family of LOOK_FAMILIES) {
      const treatments = Object.keys(LOOK_TREATMENTS[family]);
      expect(treatments).toHaveLength(17);
      expect(treatments.slice(9)).toEqual([...NEW_TREATMENTS[family]]);
      const names = lookNames(family);
      expect(names).toHaveLength(680); // 17.15 and 17.17 added ten palettes each
      // 17.11 had 9 × 12 = 108 per family: 232 more
      expect(names.length - 108).toBeGreaterThanOrEqual(200);
    }
    expect(lookInfo('solid-indigo')?.family).toBe('ui');
    expect(lookInfo('holo-ember')?.family).toBe('motion');
  });

  it('reads each new name back to its family, treatment and palette', () => {
    expect(lookInfo('clay-cherry')).toMatchObject({ family: 'ui', treatment: 'clay', palette: 'cherry', dark: false });
    expect(lookInfo('acrylic-teal')).toMatchObject({ family: 'parts', treatment: 'acrylic', palette: 'teal' });
    expect(lookInfo('nightvision-sand')).toMatchObject({ family: 'motion', treatment: 'nightvision', dark: true });
    expect(lookInfo('pill-aurora')?.dark).toBe(true);
    expect(lookInfo('retro-velvet')?.dark).toBe(false);
  });

  it('marks the four dark palettes as dark under a treatment that keeps the palette colors', () => {
    expect(DARK_PALETTES.slice(0, 4)).toEqual(['midnight', 'ember', 'aurora', 'velvet']);
    for (const p of Object.keys(LOOK_PALETTES)) expect(lookInfo(`solid-${p}`)?.dark, p).toBe(DARK_PALETTES.includes(p));
  });

  it('gives each new treatment the effect it is named for', () => {
    expect(lookTokens('clay-indigo')['--mo-kit-radius']).toBe('26px');
    expect(lookTokens('neumorph-indigo')['--mo-kit-shadow']).toContain('-8px -8px');
    expect(lookTokens('retro-indigo')['--mo-kit-border-style']).toBe('outset');
    expect(lookTokens('pill-indigo')['--mo-kit-radius']).toBe('999px');
    expect(lookInfo('editorial-indigo')?.font).toContain('serif');
    expect(lookTokens('sketch-indigo')['--mo-kit-radius']).toContain('/');
    expect(lookInfo('luxe-indigo')?.dark).toBe(true);
    expect(lookTokens('synth-indigo')['--mo-kit-cta']).toContain('linear-gradient');
    expect(lookTokens('tonal-indigo')['--mo-kit-line']).toBe('transparent');
    expect(lookTokens('acrylic-indigo')['--mo-kit-backdrop']).toContain('blur(30px)');
    expect(lookTokens('cupertino-indigo')['--mo-kit-radius']).toBe('13px');
    expect(lookTokens('compact-indigo')['--mo-kit-radius']).toBe('4px');
    expect(lookTokens('skeuo-indigo')['--mo-kit-cta']).toContain('linear-gradient');
    expect(lookTokens('inset-indigo')['--mo-kit-shadow']).toMatch(/^inset /);
    expect(lookTokens('hairline-indigo')['--mo-kit-cta']).toBe('transparent');
    expect(lookInfo('dusk-indigo')?.dark).toBe(true);
    expect(lookTokens('charcoal-indigo')['--mo-kit-media-filter']).toContain('grayscale(1)');
    expect(lookTokens('infrared-indigo')['--mo-kit-media-filter']).toContain('invert(1)');
    expect(lookTokens('blockbuster-indigo')['--mo-kit-accent']).toBe('#ffb35c');
    expect(lookTokens('dreamy-indigo')['--mo-kit-media-filter']).toContain('blur(');
    expect(lookTokens('matte-indigo')['--mo-kit-media-filter']).toContain('contrast(.85)');
    expect(lookTokens('thermal-indigo')['--mo-kit-media-filter']).toContain('saturate(6)');
    expect(lookTokens('nightvision-indigo')['--mo-kit-media-filter']).toContain('hue-rotate(70deg)');
    expect(lookTokens('comic-indigo')['--mo-kit-border-width']).toBe('3px');
  });

  it('keeps the new palettes readable: text on paper, white or paper on the accent', () => {
    for (const [name, [ink, paper, accent]] of Object.entries(LOOK_PALETTES)) {
      expect(contrastRatio(ink, paper), name).toBeGreaterThanOrEqual(7);
      const on = DARK_PALETTES.includes(name) ? paper : '#ffffff';
      expect(contrastRatio(on, accent), name).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('documents every new look and shows the new count on the demo and home pages', () => {
    const doc = readFileSync('docs/looks-17-11.md', 'utf8');
    for (const family of LOOK_FAMILIES) for (const t of NEW_TREATMENTS[family]) expect(doc, t).toContain(`\`${t}\``);
    for (const p of NEW_PALETTES) expect(doc, p).toContain(`\`${p}\``);
    expect(readFileSync('showcase/looks.html', 'utf8')).toContain('2040');
    expect(readFileSync('showcase/home-collections.js', 'utf8')).toContain('total: 2040');
    expect(readFileSync('CHANGELOG.md', 'utf8')).toContain('17.14');
  });
});
