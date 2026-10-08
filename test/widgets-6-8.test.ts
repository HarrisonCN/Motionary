import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, mount, anims } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineWidgets, WIDGETS, WEATHER_CONDITIONS } from '../src/components/widgets';
import { WEATHER_FX, PHYSICS2_FX, registerWeatherEffects, registerPhysicsEffects2, registerFx2, FX2_PACKS, VerletWorld, skyAt } from '../src/components/fx2';
import { getEffect } from '../src/components/fx';
import { COMPONENT_ITEMS } from '../showcase/catalog-components.js';
import { COMPONENTS, componentSnippets } from '../showcase/components-catalog.js';
import { COMPONENT_ENTRIES } from '../scripts/categories.mjs';
import { readFileSync } from 'node:fs';

beforeEach(() => {
  installComponentMocks();
  document.body.innerHTML = '';
  defineWidgets();
});
afterEach(() => {
  vi.unstubAllGlobals();
  configureComponents({ reducedMotion: 'user' });
});

const ctx = (reduced = false): any => ({ reduced, animate: (el: Element, k: Keyframe[], o: any) => (el as any).animate(k, o), onCleanup() {} });

describe('6.8 widgets', () => {
  it('ships kanban, swipe deck, weather card and pull-cord', () => {
    expect(Object.keys(WIDGETS['6.8'])).toEqual(['usa-kanban', 'usa-swipe-deck', 'usa-weather-card', 'usa-pull-cord']);
    for (const t of Object.keys(WIDGETS['6.8'])) expect(customElements.get(t)).toBeTruthy();
    expect(WEATHER_CONDITIONS).toEqual(['clear', 'cloudy', 'rain', 'snow', 'storm', 'fog', 'night']);
  });
  it('kanban: labelled lists, move() emits, keyboard pick-up / move / drop', () => {
    const k = mount<any>('<usa-kanban><section data-title="To do"><h3>To do</h3><div data-card>A</div><div data-card>B</div></section><section data-title="Done"><h3>Done</h3></section></usa-kanban>');
    const [todo, done] = k.columns;
    expect(todo.getAttribute('role')).toBe('list');
    expect(todo.getAttribute('aria-label')).toBe('To do');
    const [a, b] = k.cardsOf(todo);
    expect(a.tabIndex).toBe(0);
    let ev: any = null;
    k.addEventListener('usa:move', (e: CustomEvent) => (ev = e.detail));
    k.move(b, done, 0);
    expect(k.cardsOf(done)).toEqual([b]);
    expect(ev.to).toBe(done);
    a.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(a.getAttribute('aria-grabbed')).toBe('true');
    a.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(a.parentElement).toBe(done);
    a.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(a.hasAttribute('aria-grabbed')).toBe(false);
    expect(k.querySelector('.usa-kb-live').textContent).toContain('Done');
  });
  it('swipe deck: like / nope / undo, events and empty', () => {
    const d = mount<any>('<usa-swipe-deck><div>1</div><div>2</div></usa-swipe-deck>');
    const seen: string[] = [];
    let empty = false;
    d.addEventListener('usa:swipe', (e: CustomEvent) => seen.push(e.detail.dir));
    d.addEventListener('usa:empty', () => (empty = true));
    expect(d.top.textContent).toContain('1');
    expect(d.top.querySelector('.usa-sd-like')).toBeTruthy();
    d.like();
    expect(d.top.textContent).toContain('2');
    d.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    expect(seen).toEqual(['right', 'left']);
    expect(empty).toBe(true);
    expect(d.top).toBeNull();
    d.undo();
    expect(d.top.textContent).toContain('2');
  });
  it('weather card: scene per condition, accessible summary, reduced motion is static', () => {
    const w = mount<any>('<usa-weather-card condition="storm" temp="12.4" place="Lisbon"></usa-weather-card>');
    expect(w.getAttribute('aria-label')).toBe('Thunderstorm, 12°, Lisbon');
    expect(w.querySelector('.usa-wc-bolt')).toBeTruthy();
    expect(w.querySelector('.usa-wc-scene').getAttribute('aria-hidden')).toBe('true');
    w.setAttribute('condition', 'snow');
    expect(w.dataset.condition).toBe('snow');
    expect(w.querySelectorAll('.usa-wc-flake').length).toBe(6);
    w.setAttribute('condition', 'tornado');
    expect(w.dataset.condition).toBe('clear');
    installComponentMocks({ reducedMotion: true });
    const r = mount<any>('<usa-weather-card condition="rain" temp="5"></usa-weather-card>');
    expect(r.querySelector('.usa-wc-temp').textContent).toBe('5°');
  });
  it('pull-cord: switch semantics, click toggles + emits, reduced motion', () => {
    vi.stubGlobal('requestAnimationFrame', () => 1);
    const p = mount<any>('<usa-pull-cord></usa-pull-cord>');
    expect(p.getAttribute('role')).toBe('switch');
    expect(p.getAttribute('aria-checked')).toBe('false');
    let on: boolean | null = null;
    p.addEventListener('usa:change', (e: CustomEvent) => (on = e.detail.on));
    p.pull();
    expect(p.on).toBe(true);
    expect(on).toBe(true);
    expect(p.querySelector('.usa-pc-cord').getAttribute('d')).toMatch(/^M0 0 Q/);
    p.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(p.on).toBe(false);
  });
});

describe('weather & physics packs', () => {
  it('register (also via registerFx2) as their own entries', () => {
    registerWeatherEffects();
    registerPhysicsEffects2();
    registerFx2();
    expect(WEATHER_FX.map((d) => d.name)).toEqual(['rain-glass', 'snowfall', 'lightning', 'fog', 'aurora-veil', 'day-cycle']);
    expect(PHYSICS2_FX.map((d) => d.name)).toEqual(['soft-body', 'magnet', 'cloth', 'rope', 'pinball']);
    for (const d of [...WEATHER_FX, ...PHYSICS2_FX]) expect(getEffect(d.name)).toBe(d);
    expect(FX2_PACKS.weather).toBe(WEATHER_FX);
    expect(FX2_PACKS.physics).toBe(PHYSICS2_FX);
    expect(COMPONENT_ENTRIES['fx-weather']).toBe('fx2/weather');
    expect(COMPONENT_ENTRIES['fx-physics']).toBe('fx2/physics2');
  });
  it('lightning is photosensitive-safe by default', () => {
    const l = WEATHER_FX.find((d) => d.name === 'lightning')!;
    expect((l.defaults as any).interval).toBeGreaterThanOrEqual(2.5);
    expect((l.defaults as any).glow).toBeLessThanOrEqual(0.22);
  });
  it('skyAt interpolates the sky through the day', () => {
    expect(skyAt(12)[0]).toBe('rgb(40,130,230)');
    expect(skyAt(0)).toEqual(skyAt(24));
    expect(skyAt(6)[0]).not.toBe(skyAt(18)[0]);
  });
  it('VerletWorld: gravity, sticks keep length, pinned points stay', () => {
    const w = new VerletWorld(1000, 1, 8);
    const a = w.add(0, 0, true);
    const b = w.add(10, 0);
    w.link(a, b);
    for (let i = 0; i < 30; i++) w.step(1 / 60);
    const p = w.points[b];
    expect(w.points[a]).toMatchObject({ x: 0, y: 0 });
    expect(p.y).toBeGreaterThan(0);
    expect(Math.hypot(p.x, p.y)).toBeCloseTo(10, 0);
    w.push(p.x, p.y, 5, 0, 5);
    expect(w.points[b].x).toBeGreaterThan(p.x - 5);
  });
  it('canvas backgrounds mount a canvas and clean up; soft-body / magnet move and restore', () => {
    vi.stubGlobal('requestAnimationFrame', () => 1);
    registerWeatherEffects();
    registerPhysicsEffects2();
    const el = mount<HTMLElement>('<div><span>a</span><span>b</span></div>');
    for (const d of [...WEATHER_FX, ...PHYSICS2_FX.filter((x) => x.kind === 'background')]) {
      const stop = d.run(el, { ...d.defaults }, ctx()) as () => void;
      expect(el.querySelector('canvas'), d.name).toBeTruthy();
      stop();
      expect(el.querySelector('canvas')).toBeNull();
    }
    const mag = getEffect('magnet')!;
    const stop = mag.run(el, { ...mag.defaults }, ctx()) as () => void;
    el.dispatchEvent(new MouseEvent('pointermove', { clientX: 5, clientY: 5 }));
    stop();
    expect((el.children[0] as HTMLElement).style.transition).toBe('');
    const sb = getEffect('soft-body')!;
    expect(sb.reduced).toBe('skip');
  });
});

describe('6.8 showcase + Store + docs', () => {
  it('gallery cards and Store entries for every 6.8 widget and pack', () => {
    for (const tag of Object.keys(WIDGETS['6.8'])) {
      const card: any = COMPONENTS.find((c: any) => c.tag === tag);
      expect(card, tag).toBeTruthy();
      expect(card.since).toBe('6.8');
      expect(componentSnippets(card).esm).toContain(card.define);
    }
    expect(componentSnippets(COMPONENTS.find((c: any) => c.id === 'fx-cloth')).esm).toContain("from 'motionary/components/fx-physics'");
    for (const id of ['kanban', 'swipe-deck', 'weather-card', 'pull-cord', 'fx-weather', 'fx-storm', 'fx-sky', 'fx-cloth', 'fx-jelly', 'fx-pinball']) expect(COMPONENT_ITEMS.some((i: any) => i.gallery === id), id).toBe(true);
    const doc = readFileSync('docs/components.md', 'utf8');
    for (const s of ['<usa-kanban', '<usa-swipe-deck', '<usa-weather-card', '<usa-pull-cord', 'fx-weather', 'fx-physics', 'VerletWorld']) expect(doc).toContain(s);
  });
});
