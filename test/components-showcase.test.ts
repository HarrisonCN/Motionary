import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { COMPONENT_CATEGORIES as SRC_CATEGORIES } from '../src/components';
import * as components from '../src/components';
// Plain ESM modules of the no-build component gallery
// @ts-ignore - untyped .js
import { COMPONENT_CATEGORIES, COMPONENTS, HELPERS, GALLERY, CODE_TABS, componentSnippets, matchesComponent, findComponent, toJsx } from '../showcase/components-catalog.js';
// @ts-ignore - untyped .js
import { GSTRINGS } from '../showcase/gallery-i18n.js';
// @ts-ignore - untyped .js
import { STRINGS } from '../showcase/i18n.js';

const root = resolve(__dirname, '..');

describe('component gallery catalog', () => {
  it('has a card for every <usa-*> element (variant cards allowed), in the right category', () => {
    const srcTags = Object.entries(SRC_CATEGORIES).flatMap(([cat, tags]) => (tags as readonly string[]).map((t) => `${cat}:${t}`)).sort();
    const cardTags = [...new Set(COMPONENTS.map((c: any) => `${c.category}:${c.tag}`))].sort();
    expect(cardTags).toEqual(srcTags);
  });

  it('uses the same categories, in the same order, as the package', () => {
    expect(COMPONENT_CATEGORIES.map((c: any) => c.id)).toEqual(Object.keys(SRC_CATEGORIES));
  });

  it('names define functions and helpers that the entry points really export', () => {
    COMPONENTS.forEach((c: any) => expect(typeof (components as any)[c.define], c.define).toBe('function'));
    HELPERS.forEach((h: any) => expect(typeof (components as any)[h.fn], h.fn).toBe('function'));
  });

  it('has unique URL-safe ids and bilingual copy', () => {
    const ids = GALLERY.map((i: any) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    GALLERY.forEach((i: any) => {
      expect(i.id).toMatch(/^[a-z][a-z0-9-]*$/);
      expect(i.title.en && i.title.zh && i.desc.en && i.desc.zh, i.id).toBeTruthy();
      expect(i.demo, i.id).toMatch(/\S/);
    });
    COMPONENT_CATEGORIES.forEach((c: any) => expect(c.en && c.zh && c.desc.en && c.desc.zh).toBeTruthy());
  });

  it('every element demo actually uses its element', () => {
    COMPONENTS.filter((c: any) => !['usa-scrolly', 'usa-toaster', 'usa-dialog', 'usa-sticky-stack', 'usa-ambient', 'usa-splash'].includes(c.tag)).forEach((c: any) => expect(c.demo, c.tag).toContain(`<${c.tag}`));
  });

  it('search matches tags, English, Chinese and category names', () => {
    expect(matchesComponent(findComponent('spinner'), 'windows')).toBe(true);
    expect(matchesComponent(findComponent('typewriter'), '打字机')).toBe(true);
    expect(matchesComponent(findComponent('acrylic'), 'fluent')).toBe(true);
    expect(matchesComponent(findComponent('ripple'), 'interaction')).toBe(true);
    expect(matchesComponent(findComponent('ripple'), 'marquee')).toBe(false);
  });

  it('generates every code tab and imports only documented entry points', () => {
    const allowed = new Set(['use-scroll-animate/components', ...Object.keys(SRC_CATEGORIES).map((c) => `use-scroll-animate/components/${c}`)]);
    GALLERY.forEach((item: any) => {
      const out = componentSnippets(item);
      CODE_TABS.forEach((t: any) => expect(out[t.id], `${item.id}/${t.id}`).toMatch(/\S/));
      Object.values(out).forEach((code: any) => {
        for (const m of code.matchAll(/from '([^']+)'/g)) expect(allowed.has(m[1]), `${item.id}: ${m[1]}`).toBe(true);
        for (const m of code.matchAll(/import '([^']+)'/g)) expect(m[1]).toMatch(/^use-scroll-animate\/components(\/[a-z]+)?\.css$/);
      });
    });
    const tw = componentSnippets(findComponent('typewriter'));
    expect(tw.html).toContain('dist/components.umd.js');
    expect(tw.esm).toContain("import { defineTypewriter } from 'use-scroll-animate/components/text';");
    expect(tw.react).toContain('<usa-typewriter');
    expect(tw.vue).toContain('isCustomElement');
    expect(tw.desktop).toContain('configureComponents({ injectStyles: false })');
  });

  it('toJsx renames class and drops scripts', () => {
    expect(toJsx('<div class="a"></div><script>x</script>')).toBe('<div className="a"></div>');
  });

  it('gallery UI strings exist in English and Chinese', () => {
    expect(Object.keys(GSTRINGS.zh).sort()).toEqual(Object.keys(GSTRINGS.en).sort());
    expect(Object.keys(STRINGS.zh).sort()).toEqual(Object.keys(STRINGS.en).sort());
  });
});

describe('component gallery page', () => {
  const html = readFileSync(resolve(root, 'showcase/components.html'), 'utf8');
  const js = readFileSync(resolve(root, 'showcase/gallery.js'), 'utf8');
  const store = readFileSync(resolve(root, 'showcase/index.html'), 'utf8');

  it('is a no-build page that dogfoods dist/components.js (with a CDN fallback)', () => {
    expect(html).toContain('<script type="module" src="./gallery.js"></script>');
    expect(js).toContain("new URL('../dist/', import.meta.url)");
    expect(js).toContain("'components.js'");
    expect(js).toContain('https://unpkg.com/use-scroll-animate@2/dist/');
    expect(js).toContain('prefers-reduced-motion');
  });

  it('every data-i18n key used on the page exists', () => {
    for (const m of html.matchAll(/data-i18n(?:-placeholder)?="([^"]+)"/g)) expect(GSTRINGS.en[m[1]], m[1]).toBeDefined();
  });

  it('is linked from the Animation Store and links to every category', () => {
    expect(store).toContain('href="./components.html"');
    expect(js).toContain('`cat-${cat.id}`');
  });
});
