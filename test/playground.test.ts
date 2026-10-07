import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as components from '../src/components';
import { COMPONENT_CATEGORIES } from '../src/components';
// @ts-ignore - untyped .js
import { PLAYGROUND_EFFECTS, PLAYGROUND_CONTENT, PLAYGROUND_TABS, PG_STRINGS, DEFAULT_STATE, newLayer, composeMarkup, playgroundSnippets, encodeState, decodeState, categoriesOf } from '../showcase/playground-core.js';

const root = resolve(__dirname, '..');

describe('visual playground', () => {
  it('every effect is a real element in the category it names, with bilingual labels and valid defaults', () => {
    PLAYGROUND_EFFECTS.forEach((e: any) => {
      expect((COMPONENT_CATEGORIES as any)[e.category], e.tag).toContain(e.tag);
      expect(e.en && e.zh).toBeTruthy();
      e.controls.forEach((c: any) => {
        if (c.type === 'select') expect(c.values).toContain(c.def);
        if (c.type === 'range') expect(c.def >= c.min && c.def <= c.max, `${e.tag}.${c.key}`).toBe(true);
      });
    });
  });

  it('composes nested markup, outermost first, omitting default attributes', () => {
    const state = { content: 'button', layers: [newLayer('usa-reveal'), { tag: 'usa-tilt', attrs: { ...newLayer('usa-tilt').attrs, max: 20, glare: false } }] };
    const html = composeMarkup(state);
    expect(html).toBe('<usa-reveal repeat>\n  <usa-tilt max="20">\n    <button type="button" class="pg-button">Get started</button>\n  </usa-tilt>\n</usa-reveal>');
    expect(composeMarkup({ content: 'heading', layers: [] })).toBe(PLAYGROUND_CONTENT.heading.html);
  });

  it('exports HTML, ES module, React and Vue code with only real entry points and define functions', () => {
    const state = { content: 'card', layers: [newLayer('usa-mask-reveal'), newLayer('usa-tilt'), newLayer('usa-magnetic')] };
    expect(categoriesOf(state)).toEqual(['svg', 'interaction']);
    const out = playgroundSnippets(state);
    PLAYGROUND_TABS.forEach((t: any) => expect(out[t.id]).toMatch(/\S/));
    expect(out.html).toContain('dist/components.umd.js');
    expect(out.esm).toContain("import { defineSvgComponents } from 'use-scroll-animate/components/svg';");
    expect(out.react).toContain('className="pg-card"');
    expect(out.vue).toContain('isCustomElement');
    for (const code of Object.values(out) as string[])
      for (const m of code.matchAll(/import \{ (\w+) \} from 'use-scroll-animate\/components\/(\w+)'/g)) {
        expect(Object.keys(COMPONENT_CATEGORIES)).toContain(m[2]);
        expect(typeof (components as any)[m[1]], m[1]).toBe('function');
      }
  });

  it('share links round-trip and reject garbage', () => {
    const s = { content: 'image', layers: [{ tag: 'usa-spring', attrs: { ...newLayer('usa-spring').attrs, preset: 'wobbly' } }] };
    const code = encodeState(s);
    expect(code).toMatch(/^[\w-]+$/);
    expect(decodeState(code)).toEqual(s);
    expect(decodeState('%%%')).toBeNull();
    expect(decodeState(encodeState({ content: 'nope', layers: [{ tag: 'usa-unknown', attrs: {} }] } as any))).toEqual({ content: 'card', layers: [] });
    expect(DEFAULT_STATE.layers.length).toBeGreaterThan(0);
  });

  it('is a no-build page with matching EN / ZH strings, linked from the gallery', () => {
    expect(Object.keys(PG_STRINGS.zh).sort()).toEqual(Object.keys(PG_STRINGS.en).sort());
    const html = readFileSync(resolve(root, 'showcase/playground.html'), 'utf8');
    const js = readFileSync(resolve(root, 'showcase/playground.js'), 'utf8');
    expect(html).toContain('<script type="module" src="./playground.js"></script>');
    for (const m of html.matchAll(/data-pg="([^"]+)"/g)) expect(PG_STRINGS.en[m[1]], m[1]).toBeDefined();
    expect(js).toContain("new URL('../dist/', import.meta.url)");
    expect(js).toContain('prefers-reduced-motion');
    expect(readFileSync(resolve(root, 'showcase/components.html'), 'utf8')).toContain('href="./playground.html"');
  });
});
