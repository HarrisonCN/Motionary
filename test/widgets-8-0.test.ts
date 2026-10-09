import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, mount, anims, tick } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineWidgets, WIDGETS } from '../src/components/widgets';
import { getEffect, playEffect } from '../src/components/fx';
import { COMPONENT_ITEMS } from '../showcase/catalog-components.js';
import { COMPONENTS, componentSnippets } from '../showcase/components-catalog.js';
import { COMPONENT_ENTRIES } from '../scripts/categories.mjs';
import { readFileSync } from 'node:fs';
import { motionClock, createTimeline, resolvePosition, hydrateMotion, ssrHead, HYDRATION_CSS, getClock, setClock } from '../src/components/engine';
import { animateWithMotion, onFrame } from '../src/components/base';

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

describe('8.0 release', () => {
  it('ships its widgets', () => {
    expect(Object.keys(WIDGETS['8.0'])).toEqual(["usa-clock-control", "usa-hydrate"]);
    for (const t of Object.keys(WIDGETS['8.0'])) expect(customElements.get(t)).toBeTruthy();
  });
  it('gallery cards with copyable code, Store entries and docs', () => {
    for (const tag of Object.keys(WIDGETS['8.0'])) {
      const card: any = COMPONENTS.find((c: any) => c.tag === tag);
      expect(card, tag).toBeTruthy();
      expect(card.since).toBe('8.0');
      expect(componentSnippets(card).esm).toContain(card.define);
    }
    for (const id of ["clock-control", "hydrate"]) expect(COMPONENT_ITEMS.some((i: any) => i.gallery === id), id).toBe(true);
    const doc = readFileSync('docs/components.md', 'utf8');
    for (const s of ["<usa-clock-control", "<usa-hydrate"]) expect(doc).toContain(s);
  });
});


describe('8.0 engine', () => {
  afterEach(() => setClock({ rate: 1, paused: false }));
  it('motion clock: rate + pause apply to running and new animations, frame loops freeze', async () => {
    const el = mount('<div></div>');
    const a: any = animateWithMotion(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 100 });
    expect(getClock().tracked).toBeGreaterThan(0);
    motionClock.rate = 0.5;
    expect(a.playbackRate).toBe(0.5);
    motionClock.pause();
    expect(motionClock.paused).toBe(true);
    expect(a.playState).toBe('paused');
    const b: any = animateWithMotion(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 100 });
    expect(b.playState).toBe('paused');
    expect(b.playbackRate).toBe(0.5);
    motionClock.resume();
    expect(a.playState).toBe('running');
    const seen = vi.fn();
    const off = motionClock.onChange(seen);
    motionClock.toggle();
    expect(seen).toHaveBeenCalledTimes(1);
    off();
    motionClock.resume();
    motionClock.rate = 100;
    expect(motionClock.rate).toBe(8);
    motionClock.rate = 2;
    const dts: number[] = [];
    const stop = onFrame((_t, dt) => dts.push(dt));
    await new Promise((r) => setTimeout(r, 60));
    stop();
    expect(dts.length).toBeGreaterThan(0);
    expect(Math.max(...dts)).toBeGreaterThan(20); // ~16.7ms × 2
  });
  it('timeline: positions, duration, sequencing, seek/progress, finished', async () => {
    expect(resolvePosition(undefined, null, 0)).toBe(0);
    expect(resolvePosition(undefined, { start: 100, end: 500 }, 500)).toBe(500);
    expect(resolvePosition('+=200', { start: 100, end: 500 }, 500)).toBe(700);
    expect(resolvePosition('-=100', { start: 100, end: 500 }, 500)).toBe(400);
    expect(resolvePosition('<', { start: 100, end: 500 }, 500)).toBe(100);
    expect(resolvePosition('<+=80', { start: 100, end: 500 }, 500)).toBe(180);
    expect(resolvePosition(1200, null, 0)).toBe(1200);
    const [x, y, z] = [mount('<i></i>'), mount('<i></i>'), mount('<i></i>')];
    const tl = createTimeline().add(x, [{ opacity: 0 }, { opacity: 1 }], 400).add([y, z], [{ opacity: 0 }, { opacity: 1 }], { duration: 300, stagger: 100 } as any, '-=100');
    expect(tl.entries.map((e) => e.start)).toEqual([0, 300, 400]);
    expect(tl.duration).toBe(700);
    anims.length = 0;
    tl.play();
    expect(tl.playing).toBe(true);
    expect(anims.length).toBe(3);
    expect(anims.map((a: any) => a.timing.delay)).toEqual([0, 300, 400]);
    tl.pause();
    tl.seek(350);
    expect(anims.every((a: any) => a.currentTime === 350)).toBe(true);
    expect(tl.progress).toBeCloseTo(0.5);
    tl.progress = 1;
    expect(anims[0].currentTime).toBe(700);
    tl.play();
    anims.forEach((a: any) => a.finish());
    await tl.finished;
    expect(tl.playing).toBe(false);
  });
  it('SSR hydration: head snippet, CSS fallback, hydrateMotion marks + animates + event', async () => {
    expect(ssrHead('n"1')).toBe(`<style data-usa-hydration nonce="n1">${HYDRATION_CSS}</style><script nonce="n1">document.documentElement.classList.add('usa-js')</script>`);
    expect(HYDRATION_CSS).toContain('html.usa-js [data-usa-hydrate]:not([data-usa-hydrated])');
    expect(HYDRATION_CSS).toContain('3s forwards');
    const root = mount('<div><h1 data-usa-hydrate="blur">T</h1><p data-usa-hydrate data-usa-delay="50">P</p><span>no</span></div>');
    const done = vi.fn();
    root.addEventListener('usa:hydrated', done);
    anims.length = 0;
    const tl = hydrateMotion(root, { stagger: 100, duration: 200 });
    expect(root.querySelectorAll('[data-usa-hydrated]').length).toBe(2);
    expect(tl.entries.map((e) => e.start)).toEqual([0, 150]);
    expect(anims[0].keyframes[0]).toMatchObject({ filter: 'blur(8px)' });
    expect(document.querySelector('style[data-usa-hydration]')).toBeTruthy();
    anims.forEach((a: any) => a.finish());
    await tl.finished;
    await tick();
    expect(done.mock.calls[0][0].detail).toEqual({ count: 2 });
  });
  it('widgets: clock control reflects + drives the clock; hydrate animates children', async () => {
    const c = mount<any>('<usa-clock-control speeds="0.5,1,2"></usa-clock-control>');
    expect(c.querySelectorAll('[role=radio]').length).toBe(3);
    expect(c.querySelector('[data-rate="1"]').getAttribute('aria-checked')).toBe('true');
    const ch = vi.fn();
    c.addEventListener('usa:change', ch);
    c.querySelector('[data-rate="2"]').click();
    expect(getClock().rate).toBe(2);
    expect(c.querySelector('[data-rate="2"]').getAttribute('aria-checked')).toBe('true');
    c.querySelector('.usa-clk-play').click();
    expect(getClock().paused).toBe(true);
    expect(c.querySelector('.usa-clk-play').getAttribute('aria-pressed')).toBe('true');
    expect(ch.mock.calls.at(-1)[0].detail).toEqual({ rate: 2, paused: true });
    motionClock.pause();
    setClock({ rate: 1, paused: false });
    expect(c.hasAttribute('data-paused')).toBe(false);
    anims.length = 0;
    const h = mount<any>('<usa-hydrate effect="scale" stagger="50"><b>1</b><b>2</b><b>3</b></usa-hydrate>');
    expect(h.hasAttribute('data-usa-hydrated')).toBe(true);
    expect(h.timeline.entries.map((e: any) => e.start)).toEqual([0, 50, 100]);
    expect(anims.length).toBe(3);
    const ev = vi.fn();
    h.addEventListener('usa:hydrated', ev);
    anims.forEach((a: any) => a.finish());
    await h.timeline.finished;
    await tick();
    expect(ev).toHaveBeenCalledTimes(1);
  });
});
