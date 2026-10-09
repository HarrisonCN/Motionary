import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, mount, anims, tick } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineWidgets, WIDGETS, EQ_PRESETS, parseLRC } from '../src/components/widgets';
import { registerAllPlugins, EFFECT_PACKS, MUSIC_FX, registerMusicPack } from '../src/components/fx2';
import { getEffect, playEffect } from '../src/components/fx';
import { COMPONENT_ITEMS } from '../showcase/catalog-components.js';
import { COMPONENTS, componentSnippets } from '../showcase/components-catalog.js';
import { COMPONENT_ENTRIES } from '../scripts/categories.mjs';
import { readFileSync } from 'node:fs';
import { syntheticSample, musicSample } from '../src/components/fx2';
import { EQ_PRESETS, parseLRC } from '../src/components/widgets';

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

describe('7.1 release', () => {
  it('ships its widgets', () => {
    expect(Object.keys(WIDGETS['7.1'])).toEqual(["usa-music-player", "usa-volume-knob", "usa-equalizer", "usa-lyrics"]);
    for (const t of Object.keys(WIDGETS['7.1'])) expect(customElements.get(t)).toBeTruthy();
  });
  it('registers its effect packs (also via registerAllPlugins) as their own entries', () => {
    registerMusicPack();
    registerAllPlugins();
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    for (const def of MUSIC_FX) expect(getEffect(def.name)).toBe(def);
    expect(EFFECT_PACKS['music']).toBe(MUSIC_FX);
    expect(COMPONENT_ENTRIES['fx-music']).toBe('fx2/music');
    expect(pkg.exports['./fx/music'].import.default).toBe('./dist/components/fx-music.js');
  });
  it('gallery cards with copyable code, Store entries and docs', () => {
    for (const tag of Object.keys(WIDGETS['7.1'])) {
      const card: any = COMPONENTS.find((c: any) => c.tag === tag);
      expect(card, tag).toBeTruthy();
      expect(card.since).toBe('7.1');
      expect(componentSnippets(card).esm).toContain(card.define);
    }
    expect(componentSnippets(COMPONENTS.find((c: any) => c.id === 'fx-scope')).esm).toContain("from 'motionary/components/fx-music'");
    for (const id of ["music-player", "volume-knob", "equalizer", "lyrics", "fx-scope", "fx-spectrum", "fx-vinyl"]) expect(COMPONENT_ITEMS.some((i: any) => i.gallery === id), id).toBe(true);
    const doc = readFileSync('docs/components.md', 'utf8');
    for (const s of ["<usa-music-player", "<usa-volume-knob", "<usa-equalizer", "<usa-lyrics", "motionary/fx/music"]) expect(doc).toContain(s);
  });
});


describe('7.1 widgets behave', () => {
  it('music player: simulated playback, seek, slider semantics, events', () => {
    vi.stubGlobal('requestAnimationFrame', () => 1);
    const p = mount<any>('<usa-music-player title="T" artist="A" duration="100"></usa-music-player>');
    expect(p.getAttribute('aria-label')).toBe('T — A');
    const track = p.querySelector('.usa-mp-track');
    expect(track.getAttribute('role')).toBe('slider');
    expect(track.getAttribute('aria-valuemax')).toBe('100');
    const seen: string[] = [];
    for (const n of ['play', 'pause', 'seek', 'next']) p.addEventListener(`usa:${n}`, () => seen.push(n));
    (p.querySelector('[data-act=play]') as HTMLElement).click();
    expect(p.playing).toBe(true);
    expect(p.querySelector('.usa-mp-play').getAttribute('aria-label')).toBe('Pause');
    track.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(p.currentTime).toBe(5);
    expect(p.querySelector('.usa-mp-cur').textContent).toBe('0:05');
    p.seek(500);
    expect(p.currentTime).toBe(100);
    (p.querySelector('[data-act=next]') as HTMLElement).click();
    p.toggle();
    expect(seen).toEqual(['play', 'seek', 'seek', 'next', 'pause']);
  });
  it('volume knob: keyboard, clamping, aria and events', () => {
    const k = mount<any>('<usa-volume-knob value="50"></usa-volume-knob>');
    expect(k.getAttribute('role')).toBe('slider');
    const got: number[] = [];
    k.addEventListener('usa:change', (e: CustomEvent) => got.push(e.detail.value));
    k.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    k.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageUp' }));
    k.dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }));
    expect(got).toEqual([51, 61, 100]);
    expect(k.getAttribute('aria-valuenow')).toBe('100');
    expect(k.querySelectorAll('.usa-vk-ticks i[data-on]').length).toBe(21);
    k.value = 0;
    expect(k.querySelectorAll('.usa-vk-ticks i[data-on]').length).toBe(0);
    expect(k.style.getPropertyValue('--usa-vk-angle')).toBe('-135deg');
  });
  it('equalizer: presets, keyboard per band, curve, events', () => {
    const eq = mount<any>('<usa-equalizer bands="60,1k,16k"></usa-equalizer>');
    expect(eq.values).toEqual([0, 0, 0]);
    expect(EQ_PRESETS.bass[0]).toBe(8);
    let last: number[] = [];
    eq.addEventListener('usa:change', (e: CustomEvent) => (last = e.detail.values));
    eq.applyPreset('bass');
    expect(last).toEqual([8, 0, 0]);
    const slot = eq.querySelector('.usa-eq-slot[data-i="2"]') as HTMLElement;
    slot.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageUp' }));
    expect(last[2]).toBe(3);
    expect(slot.getAttribute('aria-valuetext')).toBe('+3 dB');
    expect(eq.querySelector('.usa-eq-curve path').getAttribute('d')).toMatch(/^M0 /);
    eq.values = [40, -40, 0];
    expect(eq.values).toEqual([12, -12, 0]);
  });
  it('lyrics: LRC parsing, active line, past lines, seek on click', () => {
    expect(parseLRC('[00:01.50] a\n[01:00] b\n[00:00.10][00:30.00] c')).toEqual([{ t: 0.1, text: 'c' }, { t: 1.5, text: 'a' }, { t: 30, text: 'c' }, { t: 60, text: 'b' }]);
    const l = mount<any>('<usa-lyrics><p data-t="0">one</p><p data-t="2">two</p><p data-t="4">three</p></usa-lyrics>');
    expect(l.lines.map((x: any) => x.text)).toEqual(['one', 'two', 'three']);
    l.time = 3;
    const items = l.querySelectorAll('.usa-ly-line');
    expect(items[1].hasAttribute('data-active')).toBe(true);
    expect(items[1].getAttribute('aria-current')).toBe('true');
    expect(items[0].hasAttribute('data-past')).toBe(true);
    expect(items[1].style.getPropertyValue('--usa-ly-k')).toBe('0.500');
    let t = -1;
    l.addEventListener('usa:seek', (e: CustomEvent) => (t = e.detail.time));
    (items[2] as HTMLElement).click();
    expect(t).toBe(4);
  });
});

describe('music visualization pack', () => {
  it('synthetic sample is deterministic and in range; musicSample falls back to it', () => {
    const a = syntheticSample(1.25);
    expect(a.freq.length).toBe(64);
    expect(a.wave.length).toBe(128);
    expect(Array.from(syntheticSample(1.25).freq)).toEqual(Array.from(a.freq));
    expect(a.bass).toBeGreaterThan(0);
    expect(a.bass).toBeLessThanOrEqual(1);
    expect(Array.from(musicSample(1.25).freq)).toEqual(Array.from(a.freq));
  });
  it('backgrounds mount a canvas and clean up; loops skip under reduced motion and restore transform', () => {
    vi.stubGlobal('requestAnimationFrame', () => 1);
    registerMusicPack();
    const el = mount<HTMLElement>('<div></div>');
    for (const d of MUSIC_FX.filter((x) => x.kind === 'background')) {
      const stop = d.run(el, { ...d.defaults }, ctx()) as () => void;
      expect(el.querySelector('canvas'), d.name).toBeTruthy();
      stop();
      expect(el.querySelector('canvas')).toBeNull();
    }
    const spin = getEffect('vinyl-spin')!;
    expect(spin.reduced).toBe('skip');
    el.style.transform = 'translateX(1px)';
    const stop = spin.run(el, { ...spin.defaults }, ctx()) as () => void;
    stop();
    expect(el.style.transform).toBe('translateX(1px)');
  });
});
