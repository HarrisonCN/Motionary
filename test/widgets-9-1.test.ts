import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, mount, anims, tick } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineWidgets, WIDGETS } from '../src/components/widgets';
import { registerAllPlugins, EFFECT_PACKS, CINEMA_FX, registerCinemaPack } from '../src/components/fx2';
import { getEffect, playEffect } from '../src/components/fx';
import { COMPONENT_ITEMS } from '../showcase/catalog-components.js';
import { COMPONENTS, componentSnippets } from '../showcase/components-catalog.js';
import { COMPONENT_ENTRIES } from '../scripts/categories.mjs';
import { readFileSync } from 'node:fs';
import { CINEMA_FX as CI, cameraFrame, CAMERA_MOVES } from '../src/components/fx2';

beforeEach(() => {
  installComponentMocks();
  document.body.innerHTML = '';
  defineWidgets();
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  configureComponents({ reducedMotion: 'user' });
});

const ctx = (reduced = false): any => ({ reduced, animate: (el: Element, k: Keyframe[], o: any) => (el as any).animate(k, o), onCleanup() {} });
void ctx; void anims; void tick; void playEffect; void mount;

describe('9.1 release', () => {
  it('ships its widgets', () => {
    expect(Object.keys(WIDGETS['9.1'])).toEqual(["usa-chapter-nav", "usa-scene"]);
    for (const t of Object.keys(WIDGETS['9.1'])) expect(customElements.get(t)).toBeTruthy();
  });
  it('registers its effect packs (also via registerAllPlugins) as their own entries', () => {
    registerCinemaPack();
    registerAllPlugins();
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    for (const def of CINEMA_FX) expect(getEffect(def.name)).toBe(def);
    expect(EFFECT_PACKS['cinema']).toBe(CINEMA_FX);
    expect(COMPONENT_ENTRIES['fx-cinema']).toBe('fx2/cinema');
    expect(pkg.exports['./fx/cinema'].import.default).toBe('./dist/components/fx-cinema.js');
  });
  it('gallery cards with copyable code, Store entries and docs', () => {
    for (const tag of Object.keys(WIDGETS['9.1'])) {
      const card: any = COMPONENTS.find((c: any) => c.tag === tag);
      expect(card, tag).toBeTruthy();
      expect(card.since).toBe('9.1');
      expect(componentSnippets(card).esm).toContain(card.define);
    }
    expect(componentSnippets(COMPONENTS.find((c: any) => c.id === 'fx-dolly')).esm).toContain("from 'motionary/components/fx-cinema'");
    for (const id of ["chapter-nav", "scene", "fx-dolly", "fx-letterbox"]) expect(COMPONENT_ITEMS.some((i: any) => i.gallery === id), id).toBe(true);
    const doc = readFileSync('docs/components.md', 'utf8');
    for (const s of ["<usa-chapter-nav", "<usa-scene", "motionary/fx/cinema"]) expect(doc).toContain(s);
  });
});


describe('9.1 widgets behave', () => {
  it('cameraFrame', () => {
    expect(CAMERA_MOVES.length).toBe(9);
    expect(cameraFrame('dolly-in', 0)).toBe('scale(1)');
    expect(cameraFrame('dolly-in', 1)).toBe('scale(1.18)');
    expect(cameraFrame('dolly-in', 5)).toBe('scale(1.18)');
    expect(cameraFrame('pan-right', 0.5)).toBe('scale(1.12) translateX(0%)');
    expect(cameraFrame('zoom-out', 1, 2)).toBe('scale(1)');
    expect(cameraFrame('nope', 0.5)).toBe('none');
  });
  it('chapter nav: navigation, chapters from data-chapter / headings, current + event, goTo', () => {
    configureComponents({ reducedMotion: 'reduce' });
    const story = document.createElement('article');
    story.id = 'st';
    story.innerHTML = '<section data-chapter="One"></section><section data-chapter=""><h2>Two</h2></section><section data-chapter></section>';
    document.body.append(story);
    const n = mount<any>('<usa-chapter-nav for="#st"></usa-chapter-nav>');
    expect(n.getAttribute('role')).toBe('navigation');
    expect(n.getAttribute('aria-label')).toBe('Chapters');
    expect([...n.querySelectorAll('.usa-cn-title')].map((t: any) => t.textContent)).toEqual(['One', 'Two', 'Chapter 3']);
    expect(n.current).toBe(2); // jsdom: every section's top is 0 → last one reached
    const ev = vi.fn();
    n.addEventListener('usa:chapter', ev);
    const secs = story.querySelectorAll('section');
    secs.forEach((s: any) => (s.scrollIntoView = vi.fn()));
    n.querySelectorAll('.usa-cn-item')[0].click();
    expect(secs[0].scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto', block: 'start' });
    expect(n.current).toBe(0);
    expect(n.querySelectorAll('.usa-cn-item')[0].getAttribute('aria-current')).toBe('step');
    expect(ev.mock.calls[0][0].detail).toEqual({ index: 0, title: 'One' });
    n.goTo(9);
    expect(n.current).toBe(0);
  });
  it('scene: camera, setProgress transforms media + captions, reduced shows captions', () => {
    configureComponents({ reducedMotion: 'user' });
    const s = mount<any>('<usa-scene camera="tilt-up"><div data-shot></div><p data-caption data-at="0.5">Hi</p></usa-scene>');
    expect(s.getAttribute('data-camera')).toBe('tilt-up');
    const ev = vi.fn();
    s.addEventListener('usa:shot', ev);
    s.setProgress(0.75);
    expect(s.progress).toBe(0.75);
    expect(s.querySelector('[data-shot]').style.transform).toBe(cameraFrame('tilt-up', 0.75));
    expect(s.querySelector('[data-caption]').hasAttribute('data-shown')).toBe(true);
    s.setProgress(0.2);
    expect(s.querySelector('[data-caption]').hasAttribute('data-shown')).toBe(false);
    expect(ev).toHaveBeenCalledTimes(2);
    const bad = mount<any>('<usa-scene camera="warp"><img alt=""></usa-scene>');
    expect(bad.getAttribute('data-camera')).toBe('dolly-in');
    configureComponents({ reducedMotion: 'reduce' });
    const r = mount<any>('<usa-scene><div data-shot></div><p data-caption>x</p></usa-scene>');
    expect(r.querySelector('[data-caption]').hasAttribute('data-shown')).toBe(true);
  });
  it('cinema pack: names, kinds, rack focus over children, reduced', async () => {
    expect(CI.map((e: any) => `${e.name}:${e.kind}`)).toEqual(['dolly-in:enter', 'pan-reveal:enter', 'letterbox:enter', 'rack-focus:attention']);
    const el = document.createElement('div');
    el.innerHTML = '<b></b><b></b><b></b>';
    document.body.append(el);
    const ctx: any = { reduced: false, sensitivity: 'normal', animate: vi.fn(() => null), onCleanup: vi.fn() };
    await CI[3].run(el, { duration: 100 }, ctx);
    expect(ctx.animate).toHaveBeenCalledTimes(3);
    const lctx: any = { ...ctx, animate: vi.fn(() => null) };
    await CI[2].run(el, { duration: 100, hold: 0.4 }, lctx);
    expect(lctx.animate.mock.calls[0][1][2].offset).toBeCloseTo(0.65);
    const rctx: any = { ...ctx, reduced: true, animate: vi.fn(() => null) };
    await CI[3].run(el, { duration: 100 }, rctx);
    expect(rctx.animate).not.toHaveBeenCalled();
    await CI[0].run(el, { duration: 100 }, rctx);
    expect(rctx.animate.mock.calls[0][1]).toEqual([{ opacity: 0 }, { opacity: 1 }]);
  });
});
