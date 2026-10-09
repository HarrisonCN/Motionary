import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, mount, anims, tick } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineWidgets, WIDGETS } from '../src/components/widgets';
import { registerAllPlugins, EFFECT_PACKS, VIDEO_FX, registerVideoPack } from '../src/components/fx2';
import { getEffect, playEffect } from '../src/components/fx';
import { COMPONENT_ITEMS } from '../showcase/catalog-components.js';
import { COMPONENTS, componentSnippets } from '../showcase/components-catalog.js';
import { COMPONENT_ENTRIES } from '../scripts/categories.mjs';
import { readFileSync } from 'node:fs';
import { VIDEO_FX as VI, scrollProgress, scrubVideo, frameSequence } from '../src/components/fx2';

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

describe('9.4 release', () => {
  it('ships its widgets', () => {
    expect(Object.keys(WIDGETS['9.4'])).toEqual(["usa-video-card", "usa-hero-video"]);
    for (const t of Object.keys(WIDGETS['9.4'])) expect(customElements.get(t)).toBeTruthy();
  });
  it('registers its effect packs (also via registerAllPlugins) as their own entries', () => {
    registerVideoPack();
    registerAllPlugins();
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    for (const def of VIDEO_FX) expect(getEffect(def.name)).toBe(def);
    expect(EFFECT_PACKS['video']).toBe(VIDEO_FX);
    expect(COMPONENT_ENTRIES['fx-video']).toBe('fx2/video');
    expect(pkg.exports['./fx/video'].import.default).toBe('./dist/components/fx-video.js');
  });
  it('gallery cards with copyable code, Store entries and docs', () => {
    for (const tag of Object.keys(WIDGETS['9.4'])) {
      const card: any = COMPONENTS.find((c: any) => c.tag === tag);
      expect(card, tag).toBeTruthy();
      expect(card.since).toBe('9.4');
      expect(componentSnippets(card).esm).toContain(card.define);
    }
    expect(componentSnippets(COMPONENTS.find((c: any) => c.id === 'fx-film')).esm).toContain("from 'motionary/components/fx-video'");
    for (const id of ["video-card", "hero-video", "fx-film"]) expect(COMPONENT_ITEMS.some((i: any) => i.gallery === id), id).toBe(true);
    const doc = readFileSync('docs/components.md', 'utf8');
    for (const s of ["<usa-video-card", "<usa-hero-video", "motionary/fx/video"]) expect(doc).toContain(s);
  });
});


describe('9.4 video motion', () => {
  it('scrollProgress, scrubVideo / frameSequence return stops; draw paints frame 0', () => {
    const el = document.createElement('div');
    document.body.append(el);
    el.getBoundingClientRect = () => ({ top: innerHeight, height: 100 }) as DOMRect;
    expect(scrollProgress(el)).toBe(0);
    el.getBoundingClientRect = () => ({ top: -100, height: 100 }) as DOMRect;
    expect(scrollProgress(el)).toBe(1);
    const v: any = document.createElement('video');
    v.pause = vi.fn();
    const stop = scrubVideo(v, el);
    expect(v.pause).toHaveBeenCalled();
    stop();
    const canvas: any = document.createElement('canvas');
    const ctx2 = { clearRect: vi.fn() };
    canvas.getContext = () => ctx2;
    const draw = vi.fn();
    frameSequence(canvas, { count: 10, draw }, el)();
    expect(draw.mock.calls[0][1]).toBe(0);
  });
  it('<usa-video-card>: button, label from title, preview on hover, open', () => {
    configureComponents({ reducedMotion: 'user' });
    const c = mount<any>('<usa-video-card duration="1:05"><div data-poster></div><video></video><h3>Intro</h3></usa-video-card>');
    expect(c.getAttribute('role')).toBe('button');
    expect(c.getAttribute('aria-label')).toBe('Play Intro');
    expect(c.querySelector('.usa-vc-time').textContent).toBe('1:05');
    const v = c.querySelector('video');
    expect(v.muted).toBe(true);
    v.play = vi.fn(() => Promise.resolve());
    v.pause = vi.fn();
    c.dispatchEvent(new Event('pointerenter'));
    expect(c.previewing).toBe(true);
    expect(v.play).toHaveBeenCalled();
    c.dispatchEvent(new Event('pointerleave'));
    expect(c.previewing).toBe(false);
    expect(v.pause).toHaveBeenCalled();
    const ev = vi.fn();
    c.addEventListener('usa:open', ev);
    c.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(ev).toHaveBeenCalledTimes(1);
  });
  it('<usa-hero-video>: region, poster-only without video, toggle with video', () => {
    configureComponents({ reducedMotion: 'user' });
    const h = mount<any>('<usa-hero-video label="Hi" poster="p.jpg"><h1>x</h1></usa-hero-video>');
    expect(h.getAttribute('role')).toBe('region');
    expect(h.hasAttribute('data-poster-only')).toBe(true);
    expect(h.querySelector('.usa-hv-poster').getAttribute('style')).toContain("p.jpg");
    const w = document.createElement('div');
    w.innerHTML = '<usa-hero-video><video></video></usa-hero-video>';
    const vid: any = w.querySelector('video');
    vid.play = vi.fn(() => Promise.resolve());
    vid.pause = vi.fn();
    document.body.append(w);
    const hv: any = w.firstElementChild;
    const b = hv.querySelector('.usa-hv-toggle');
    expect(b.getAttribute('aria-label')).toBe('Pause background video');
    const ev = vi.fn();
    hv.addEventListener('usa:pause', ev);
    b.click();
    expect(hv.paused).toBe(true);
    expect(vid.pause).toHaveBeenCalled();
    expect(b.getAttribute('aria-label')).toBe('Play background video');
    expect(ev).toHaveBeenCalledTimes(1);
    configureComponents({ reducedMotion: 'reduce' });
    const r = mount<any>('<usa-hero-video><video autoplay></video></usa-hero-video>');
    expect(r.hasAttribute('data-poster-only')).toBe(true);
    expect(r.querySelector('video').hasAttribute('autoplay')).toBe(false);
  });
  it('video pack: names, kinds, leak cleaned, reduced', async () => {
    expect(VI.map((e: any) => `${e.name}:${e.kind}`)).toEqual(['film-burn:enter', 'jump-cut:attention']);
    const el = document.createElement('div');
    document.body.append(el);
    const ctx: any = { reduced: false, sensitivity: 'normal', animate: vi.fn(() => null), onCleanup: vi.fn() };
    await VI[0].run(el, { color: 'red', duration: 100 }, ctx);
    expect(ctx.animate).toHaveBeenCalledTimes(2);
    expect(el.querySelectorAll('span').length).toBe(0);
    const rctx: any = { ...ctx, reduced: true, animate: vi.fn(() => null) };
    await VI[1].run(el, { duration: 100 }, rctx);
    expect(rctx.animate).not.toHaveBeenCalled();
  });
});
