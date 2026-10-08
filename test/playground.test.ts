import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as components from '../src/components';
import { COMPONENT_CATEGORIES } from '../src/components';
import * as effects from '../src/components/effects';
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
        // 5.9: the <usa-player> tab imports from the effects entry
        if (m[2] === 'effects') expect(typeof (effects as any)[m[1]], m[1]).toBe('function');
        else {
          expect(Object.keys(COMPONENT_CATEGORIES)).toContain(m[2]);
          expect(typeof (components as any)[m[1]], m[1]).toBe('function');
        }
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

describe('playground 2.0 (4.6): keyframe tracks, presets, <usa-timeline> export', async () => {
  // @ts-ignore - untyped .js
  const core = await import('../showcase/playground-core.js');
  const { TIMELINE_PRESETS } = await import('../src/components/timeline/core');

  it('track presets are real timeline presets; values are clamped and ordered', () => {
    expect(core.TRACK_PRESETS.sort()).toEqual(Object.keys(TIMELINE_PRESETS).sort());
    expect(core.newTrack('nope', -5, 99999, 'x')).toEqual({ preset: 'fade', start: 0, duration: 3000, label: 'x' });
    const list = core.normalizeTracks([core.newTrack('fade', 500), core.newTrack('scale', 0), core.newTrack('blur', 500)]);
    expect(list.map((t: any) => t.preset)).toEqual(['scale', 'fade', 'blur']);
    expect(core.tracksDuration(list)).toBe(1100);
  });

  it('drag moves / resizes with snapping; bars are laid out in %', () => {
    const t = core.newTrack('fade-up', 200, 600);
    expect(core.dragTrack(t, 'move', 130)).toMatchObject({ start: 350, duration: 600 });
    expect(core.dragTrack(t, 'resize', -1000)).toMatchObject({ start: 200, duration: 100 });
    expect(core.trackBar(t, 1000)).toEqual({ left: 20, width: 60 });
  });

  it('exports <usa-timeline> markup that the element really plays in order', async () => {
    const html = core.timelineMarkup([core.newTrack('scale', 700, 500, 'Go'), core.newTrack('fade-up', 0, 600, 'Hi <b>')], { trigger: 'click' });
    expect(html).toBe('<usa-timeline trigger="click">\n  <div data-tl="fade-up" data-at="0" data-duration="600">Hi &lt;b></div>\n  <div data-tl="scale" data-at="700" data-duration="500">Go</div>\n</usa-timeline>');
    const out = core.playgroundSnippets({ ...core.DEFAULT_STATE, tracks: core.DEFAULT_TRACKS });
    expect(out.timeline).toContain("import { defineTimeline } from 'use-scroll-animate/components/timeline';");
    expect(out.timeline).toContain('data-tl="fade-left" data-at="300"');
    const { timeline } = await import('../src/components/timeline/core');
    expect(typeof timeline).toBe('function');
  });

  it('share links carry tracks; old links (no tracks) still decode', () => {
    const s = { content: 'card', layers: [], tracks: [core.newTrack('blur', 100, 400, 'A')] };
    expect(core.decodeState(core.encodeState(s))).toEqual(s);
    expect(core.decodeState(core.encodeState({ content: 'card', layers: [] })).tracks).toBeUndefined();
  });

  it('saves, lists, loads, deletes and round-trips presets as JSON', () => {
    const mem: Record<string, string> = {};
    const storage = { getItem: (k: string) => mem[k] ?? null, setItem: (k: string, v: string) => (mem[k] = v) };
    const s = { content: 'button', layers: [core.newLayer('usa-tilt')], tracks: core.DEFAULT_TRACKS };
    core.savePreset('Hero', s, storage);
    expect(Object.keys(core.listPresets(storage))).toEqual(['Hero']);
    expect(core.loadPreset('Hero', storage)).toEqual(s);
    expect(core.presetFromJSON(core.presetToJSON('Hero', s))).toEqual({ name: 'Hero', state: s });
    expect(core.presetFromJSON('{"format":"other"}')).toBeNull();
    expect(core.presetFromJSON('garbage')).toBeNull();
    core.deletePreset('Hero', storage);
    expect(core.listPresets(storage)).toEqual({});
  });

  it('the page has the track editor and preset controls with i18n keys', () => {
    const html = readFileSync(resolve(root, 'showcase/playground.html'), 'utf8');
    ['pg-tracks', 'pg-add-track', 'pg-play-tl', 'pg-preset-save', 'pg-preset-list', 'pg-preset-json', 'pg-preset-file'].forEach((id) => expect(html).toContain(`id="${id}"`));
    for (const m of html.matchAll(/data-pg="([^"]+)"/g)) expect(core.PG_STRINGS.zh[m[1]], m[1]).toBeDefined();
  });
});
