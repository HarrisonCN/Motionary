import { afterEach, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  LOOK_FAMILIES, LOOK_PALETTES, LOOK_TREATMENTS, adoptLooks, applyLook, lookInfo, lookNames, lookRule, lookTokens, looksCss,
} from '../src/components/widgets';
import { alpha, contrastRatio, hueOf, mixHex } from '../src/components/widgets/looks';

const KIT = ['page-kit', 'parts-kit', 'motion-kit'].map((f) => readFileSync(`src/components/widgets/${f}.css`, 'utf8'));
const hex = (s: string | undefined): s is string => !!s && /^#[0-9a-f]{6}$/.test(s);

const sheetText = (): string => {
  const tags = [...document.querySelectorAll('style')].map((s) => s.textContent ?? '').join('\n');
  const adopted = ((document as unknown as { adoptedStyleSheets?: CSSStyleSheet[] }).adoptedStyleSheets ?? [])
    .flatMap((s) => [...s.cssRules].map((r) => r.cssText))
    .join('\n');
  return tags + adopted;
};

afterEach(() => document.body.replaceChildren());

describe('17.11 looks: counts and names', () => {
  it('has over a hundred distinct looks in each of the three families', () => {
    expect(LOOK_FAMILIES).toEqual(['ui', 'parts', 'motion']);
    for (const family of LOOK_FAMILIES) {
      const names = lookNames(family);
      expect(names.length).toBeGreaterThanOrEqual(100);
      expect(names.length).toBe(Object.keys(LOOK_TREATMENTS[family]).length * Object.keys(LOOK_PALETTES).length);
    }
    const every = lookNames();
    expect(new Set(every).size).toBe(every.length);
    expect(every.length).toBe(324);
  });

  it('keeps treatment names unique across families, so a name says which family it is from', () => {
    const treatments = LOOK_FAMILIES.flatMap((f) => Object.keys(LOOK_TREATMENTS[f]));
    expect(new Set(treatments).size).toBe(treatments.length);
    expect(lookInfo('neon-ocean')).toMatchObject({ family: 'ui', treatment: 'neon', palette: 'ocean', dark: true });
    expect(lookInfo('cyber-rose')?.family).toBe('parts');
    expect(lookInfo('duotone-mint')?.family).toBe('motion');
    expect(lookInfo('nope')).toBeNull();
  });

  it('gives every treatment its own effect, not just another color', () => {
    for (const family of LOOK_FAMILIES) {
      const seen = new Set<string>();
      for (const treatment of Object.keys(LOOK_TREATMENTS[family])) {
        const t = lookTokens(`${treatment}-indigo`);
        const { ['--mo-kit-ink']: _i, ['--mo-kit-paper']: _p, ['--mo-kit-accent']: _a, ['--mo-kit-on-accent']: _o, ...effect } = t;
        seen.add(JSON.stringify(effect));
      }
      expect(seen.size).toBe(Object.keys(LOOK_TREATMENTS[family]).length);
    }
  });

  it('turns the duotone filter to each palette hue', () => {
    const filters = new Set(Object.keys(LOOK_PALETTES).map((p) => lookTokens(`duotone-${p}`)['--mo-kit-media-filter']));
    expect(filters.size).toBeGreaterThan(8);
  });
});

describe('17.11 looks: readable colors', () => {
  it('keeps text, accent text and button text readable on every look (WCAG AA)', () => {
    for (const name of lookNames()) {
      const l = lookInfo(name)!;
      expect(contrastRatio(l.ink, l.bg), `${name} ink on bg`).toBeGreaterThanOrEqual(4.5);
      if (hex(l.paper)) expect(contrastRatio(l.ink, l.paper), `${name} ink on paper`).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(l.onAccent, l.accent), `${name} on accent`).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(l.accent, l.bg), `${name} accent on bg`).toBeGreaterThanOrEqual(3);
      if (hex(l.cta) && hex(l.onCta)) expect(contrastRatio(l.onCta, l.cta), `${name} button text`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('has working color helpers', () => {
    expect(mixHex('#000000', 0.5, '#ffffff')).toBe('#808080');
    expect(alpha('#ff0000', 0.5)).toBe('rgb(255 0 0 / 0.5)');
    expect(hueOf('#ff0000')).toBe(0);
    expect(hueOf('#00ff00')).toBe(120);
    expect(hueOf('#0000ff')).toBe(240);
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
  });
});

describe('17.11 looks: CSS', () => {
  it('only sets kit tokens that the 17.11 stylesheets read, plus the text color and font', () => {
    const kit = KIT.join('\n');
    for (const name of lookNames()) {
      for (const token of Object.keys(lookTokens(name))) {
        expect(token.startsWith('--mo-kit-'), token).toBe(true);
        expect(kit.includes(`var(${token}`), `${token} is read by a kit stylesheet`).toBe(true);
      }
    }
    const rule = lookRule('terminal-forest');
    expect(rule.startsWith(':where([look="terminal-forest"],[data-mo-look="terminal-forest"]){')).toBe(true);
    expect(rule).toContain('color:var(--mo-kit-ink)');
    expect(rule).toContain('font-family:ui-monospace');
    expect(lookRule('nope')).toBe('');
    expect(looksCss('motion').split('\n')).toHaveLength(lookNames('motion').length);
  });

  it('keeps the shared token block the same in the three kit stylesheets', () => {
    const block = (css: string) => css.slice(css.indexOf('.usa-kit {'), css.indexOf('}', css.indexOf('.usa-kit {')));
    expect(block(KIT[1])).toBe(block(KIT[0]));
    expect(block(KIT[2])).toBe(block(KIT[0]));
    expect(block(KIT[0])).toContain('--kit-glow: var(--mo-kit-glow');
  });

  it('applyLook sets the attribute and adopts that one rule; adoptLooks adds them all', () => {
    const el = document.createElement('div');
    document.body.append(el);
    expect(applyLook(el, 'glass-sunset')).toBe(true);
    expect(el.getAttribute('data-mo-look')).toBe('glass-sunset');
    expect(sheetText()).toContain('glass-sunset');
    expect(applyLook(el, 'not-a-look')).toBe(false);
    expect(el.getAttribute('data-mo-look')).toBe('glass-sunset');
    expect(applyLook(el, null)).toBe(true);
    expect(el.hasAttribute('data-mo-look')).toBe(false);
    expect(applyLook(null, 'glass-sunset')).toBe(false);
    adoptLooks('motion');
    expect(sheetText()).toContain('holo-ember');
  });
});

describe('17.11 looks: docs and demo', () => {
  it('lists every look in the doc and links the demo page', () => {
    const doc = readFileSync('docs/looks-17-11.md', 'utf8');
    for (const name of lookNames()) expect(doc, name).toContain(name);
    expect(doc).toContain('../showcase/looks.html');
    const page = readFileSync('showcase/looks.html', 'utf8');
    expect(page).toContain('adoptLooks');
    expect(readFileSync('showcase/index.html', 'utf8')).toContain('./looks.html');
    expect(readFileSync('CHANGELOG.md', 'utf8')).toContain('looks-17-11.md');
  });
});
