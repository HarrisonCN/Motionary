import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PRESETS } from '../src/presets';
// Plain ESM modules of the no-build showcase site
// @ts-ignore - untyped .js
import { ITEMS, CATEGORIES, findItem, matches } from '../showcase/catalog.js';
// @ts-ignore - untyped .js
import { TABS, generate, defaultState, revealOptions, animationValue, presetDistance, highlight, js } from '../showcase/codegen.js';
// @ts-ignore - untyped .js
import { STRINGS } from '../showcase/i18n.js';

const root = resolve(__dirname, '..');

describe('showcase catalog', () => {
  it('has a product card for every built-in preset (kept in sync with src/presets.ts)', () => {
    const ids = ITEMS.filter((i: any) => i.kind === 'preset').map((i: any) => i.id).sort();
    expect(ids).toEqual(Object.keys(PRESETS).sort());
  });

  it('covers the features and every framework entry point', () => {
    ['stagger', 'exit', 'parallax', 'progress-var', 'engine', 'sequence'].forEach((id) => expect(findItem(id), id).toBeTruthy());
    expect(ITEMS.filter((i: any) => i.kind === 'framework').map((i: any) => i.framework)).toEqual(['react', 'vue', 'svelte', 'solid', 'element']);
  });

  it('uses unique, URL-safe ids, known categories and bilingual copy', () => {
    const ids = ITEMS.map((i: any) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    const cats = CATEGORIES.map((c: any) => c.id);
    ITEMS.forEach((i: any) => {
      expect(i.id).toMatch(/^[a-z][a-z-]*$/);
      expect(cats).toContain(i.category);
      expect(i.title.en && i.title.zh && i.desc.en && i.desc.zh, i.id).toBeTruthy();
    });
  });

  it('search matches ids, English, Chinese and tags', () => {
    expect(matches(findItem('clip-circle'), 'clip')).toBe(true);
    expect(matches(findItem('clip-circle'), '圆形')).toBe(true);
    expect(matches(findItem('react'), 'useScrollStagger')).toBe(true);
    expect(matches(findItem('fade-in'), 'parallax')).toBe(false);
  });

  it('has the same i18n keys in English and Chinese', () => {
    expect(Object.keys(STRINGS.zh).sort()).toEqual(Object.keys(STRINGS.en).sort());
  });
});

describe('showcase code generator', () => {
  it('generates every tab for every item', () => {
    ITEMS.forEach((item: any) => {
      const out = generate(item, defaultState(item), PRESETS);
      TABS.forEach((t: any) => expect(out[t.id], `${item.id}/${t.id}`).toMatch(/\S/));
    });
  });

  it('imports from the documented entry points only', () => {
    const allowed = new Set(['use-scroll-animate', 'use-scroll-animate/react', 'use-scroll-animate/vue', 'use-scroll-animate/svelte', 'use-scroll-animate/solid', 'use-scroll-animate/element', 'use-scroll-animate/components/timeline', 'react', 'vue', 'svelte', 'solid-js']);
    ITEMS.forEach((item: any) => {
      const out = generate(item, defaultState(item), PRESETS);
      Object.values(out).forEach((code: any) => {
        for (const m of code.matchAll(/from '([^']+)'/g)) expect(allowed.has(m[1]), `${item.id}: ${m[1]}`).toBe(true);
      });
    });
  });

  it('reflects the tweaked options (and always sets duration so the JS engine matches the demo)', () => {
    const item = findItem('zoom-in');
    const st = { ...defaultState(item), duration: 900, delay: 100, easing: 'spring', mode: 'repeat' };
    expect(revealOptions(PRESETS, st)).toEqual({ animation: 'zoom-in', duration: 900, delay: 100, easing: 'spring', repeat: true });
    const out = generate(item, st, PRESETS);
    expect(out.vanilla.replace(/\s+/g, ' ')).toContain("ScrollAnimate.observe('.reveal', { animation: 'zoom-in', duration: 900, delay: 100, easing: 'spring', repeat: true, });");
    expect(out.element).toContain('<scroll-animate animation="zoom-in" duration="900" delay="100" easing="spring" repeat>');
    expect(out.cdn).toContain('data-sa-animation="zoom-in"');
    expect(out.cdn).toContain('ScrollAnimate.default.init()');
    expect(out.react).toContain("from 'use-scroll-animate/react'");
  });

  it('exit implies repeat and is written as a bare attribute', () => {
    const item = findItem('exit');
    const st = defaultState(item);
    const opts = revealOptions(PRESETS, st);
    expect(opts.exit).toBe(true);
    expect(opts.repeat).toBeUndefined();
    expect(generate(item, st, PRESETS).element).toMatch(/ exit>/);
    expect(revealOptions(PRESETS, { ...st, exit: 'zoom-out' }).exit).toBe('zoom-out');
  });

  it('turns a custom distance into { from, to } keyframes and falls back to the JS API for attributes', () => {
    expect(presetDistance(PRESETS, 'fade-in-up')).toBe(40);
    expect(presetDistance(PRESETS, 'fade-in-left')).toBe(40);
    expect(presetDistance(PRESETS, 'zoom-in')).toBeNull();
    const st = { ...defaultState(findItem('fade-in-left')), preset: 'fade-in-left', distance: 120 };
    expect(animationValue(PRESETS, st)).toEqual({ from: { opacity: 0, transform: 'translateX(-120px)' }, to: { opacity: 1, transform: 'translateX(0px)' } });
    expect(animationValue(PRESETS, { ...st, distance: 40 })).toBe('fade-in-left');
    const out = generate(findItem('fade-in-left'), st, PRESETS);
    expect(out.element).toContain('use the JS API');
    expect(out.cdn).toContain('ScrollAnimate.default.observe(');
  });

  it('cubic-bezier easings are emitted as arrays / JSON attributes', () => {
    const item = findItem('scale-up');
    const st = { ...defaultState(item), easing: '[0.34, 1.56, 0.64, 1]' };
    expect(revealOptions(PRESETS, st).easing).toEqual([0.34, 1.56, 0.64, 1]);
    expect(generate(item, st, PRESETS).element).toContain('easing="[0.34,1.56,0.64,1]"');
  });

  it('feature recipes use their APIs', () => {
    const g = (id: string) => generate(findItem(id), defaultState(findItem(id)), PRESETS);
    expect(g('stagger').vanilla).toContain('staggerChildren(');
    expect(g('stagger').react).toContain('useScrollStagger(');
    expect(g('stagger').svelte).toContain('use:scrollStagger');
    expect(g('parallax').vanilla).toContain("parallax('.layer-back', { speed: 0.3 })");
    expect(g('progress-var').vanilla).toContain("progressVar: '--sa-progress'");
    expect(g('progress-var').cdn).toContain('data-sa-progress-var');
    expect(g('engine').vanilla).toContain("engine: 'css'");
    expect(g('engine').element).toContain('view-range="entry 0%, cover 40%"');
    expect(g('sequence').vanilla).toContain("import { timeline } from 'use-scroll-animate';");
    expect(g('sequence').vanilla).toContain("querySelector('.hero')");
    expect(g('sequence').element).toContain('<usa-timeline');
    Object.values(g('sequence')).forEach((code: any) => expect(code).not.toContain('sequence('));
  });

  it('js() serialises literals and highlight() escapes HTML', () => {
    expect(js({ a: 'it\'s', b: [1, 2], c: true })).toBe("{ a: 'it\\'s', b: [1, 2], c: true }");
    const html = highlight('<script>alert("x")</script>');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;');
  });
});

describe('showcase site', () => {
  const html = readFileSync(resolve(root, 'showcase/index.html'), 'utf8');
  const app = readFileSync(resolve(root, 'showcase/app.js'), 'utf8');
  const css = readFileSync(resolve(root, 'showcase/styles.css'), 'utf8');

  it('is a no-build page that dogfoods the dist/ ESM build (with a CDN fallback)', () => {
    expect(html).toContain('<script type="module" src="./app.js"></script>');
    expect(app).toContain("new URL('../dist/', import.meta.url)");
    expect(app).toContain("'element.js'");
    expect(app).toContain("'svelte.js'");
    expect(app).toContain('https://unpkg.com/use-scroll-animate@4/dist/');
  });

  it('supports deep links, view transitions with a FLIP fallback and reduced motion', () => {
    expect(app).toContain('popstate');
    expect(app).toContain('startViewTransition');
    expect(app).toContain('function flipIn');
    expect(app).toContain('prefers-reduced-motion');
    expect(css).toContain('prefers-reduced-motion: reduce');
  });
});
